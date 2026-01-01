import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-signature, x-hook-secret',
};

interface MercadoPagoWebhook {
  action: string;
  api_version: string;
  data: {
    id: string;
  };
  date_created: string;
  id: number;
  live_mode: boolean;
  type: string;
  user_id: string;
}

interface StripeWebhook {
  id: string;
  object: string;
  api_version: string;
  created: number;
  data: {
    object: {
      id: string;
      status: string;
      amount: number;
      metadata?: Record<string, string>;
    };
  };
  type: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    const url = new URL(req.url);
    const gateway = url.searchParams.get('gateway') || 'mercadopago';
    const body = await req.text();
    
    console.log(`Webhook received for gateway: ${gateway}`);
    console.log(`Body: ${body}`);

    let paymentId: string | null = null;
    let newStatus: string | null = null;
    let gatewayResponse: Record<string, unknown> = {};

    switch (gateway) {
      case 'mercadopago': {
        const payload: MercadoPagoWebhook = JSON.parse(body);
        console.log('Mercado Pago webhook:', payload);

        if (payload.type === 'payment' && payload.action === 'payment.updated') {
          paymentId = payload.data.id;
          
          // Fetch payment status from Mercado Pago
          // Note: In production, you would need to fetch the actual payment status
          // using the accessToken stored for the professional
          gatewayResponse = {
            webhook_id: payload.id,
            action: payload.action,
            date_created: payload.date_created,
          };
          
          // For now, we'll update based on the webhook notification
          // The frontend polling will also update the status
        }
        break;
      }

      case 'stripe': {
        const payload: StripeWebhook = JSON.parse(body);
        console.log('Stripe webhook:', payload);

        if (payload.type === 'payment_intent.succeeded') {
          paymentId = payload.data.object.id;
          newStatus = 'approved';
          gatewayResponse = {
            stripe_event_id: payload.id,
            stripe_status: payload.data.object.status,
          };
        } else if (payload.type === 'payment_intent.payment_failed') {
          paymentId = payload.data.object.id;
          newStatus = 'rejected';
          gatewayResponse = {
            stripe_event_id: payload.id,
            stripe_status: payload.data.object.status,
          };
        } else if (payload.type === 'charge.refunded') {
          paymentId = payload.data.object.id;
          newStatus = 'refunded';
        }
        break;
      }

      case 'pagarme': {
        const payload = JSON.parse(body);
        console.log('Pagar.me webhook:', payload);

        if (payload.event) {
          paymentId = payload.data?.id || payload.id;
          
          switch (payload.event) {
            case 'order.paid':
              newStatus = 'approved';
              break;
            case 'order.payment_failed':
              newStatus = 'rejected';
              break;
            case 'order.canceled':
              newStatus = 'cancelled';
              break;
            case 'order.refunded':
              newStatus = 'refunded';
              break;
          }
          
          gatewayResponse = {
            pagarme_event: payload.event,
            timestamp: new Date().toISOString(),
          };
        }
        break;
      }

      case 'pagseguro': {
        const payload = JSON.parse(body);
        console.log('PagSeguro webhook:', payload);

        paymentId = payload.id || payload.charges?.[0]?.id;
        
        if (payload.status) {
          switch (payload.status) {
            case 'PAID':
              newStatus = 'approved';
              break;
            case 'DECLINED':
            case 'CANCELED':
              newStatus = 'rejected';
              break;
            case 'WAITING':
            case 'IN_ANALYSIS':
              newStatus = 'pending';
              break;
          }
        }
        
        gatewayResponse = {
          pagseguro_status: payload.status,
          timestamp: new Date().toISOString(),
        };
        break;
      }

      case 'pushinpay': {
        const payload = JSON.parse(body);
        console.log('PushinPay webhook:', payload);

        paymentId = payload.transaction_id || payload.id;
        
        if (payload.status) {
          switch (payload.status.toLowerCase()) {
            case 'paid':
            case 'approved':
            case 'completed':
              newStatus = 'approved';
              break;
            case 'failed':
            case 'rejected':
              newStatus = 'rejected';
              break;
            case 'refunded':
              newStatus = 'refunded';
              break;
          }
        }
        
        gatewayResponse = {
          pushinpay_status: payload.status,
          timestamp: new Date().toISOString(),
        };
        break;
      }

      default:
        console.log('Unknown gateway:', gateway);
    }

    // Update transaction if we have a payment ID
    if (paymentId) {
      console.log(`Updating transaction with payment_id: ${paymentId}, new status: ${newStatus}`);

      const updateData: Record<string, unknown> = {
        gateway_response: gatewayResponse,
        updated_at: new Date().toISOString(),
      };

      if (newStatus) {
        updateData.payment_status = newStatus;
      }

      const { data, error } = await supabaseClient
        .from('transactions')
        .update(updateData)
        .eq('gateway_payment_id', paymentId)
        .select();

      if (error) {
        console.error('Error updating transaction:', error);
        // Don't throw - we want to acknowledge the webhook
      } else {
        console.log('Transaction updated:', data);
        
        // Also update related appointment if exists
        if (data && data.length > 0 && newStatus === 'approved') {
          const transaction = data[0];
          
          // Try to find and update related appointment
          const { error: appointmentError } = await supabaseClient
            .from('appointments')
            .update({ payment_status: 'paid' })
            .eq('professional_id', transaction.professional_id)
            .eq('client_email', transaction.customer_email)
            .eq('payment_status', 'pending');
            
          if (appointmentError) {
            console.log('No matching appointment found or error:', appointmentError);
          }
        }
      }
    }

    return new Response(JSON.stringify({ success: true, received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Webhook processing error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Always return 200 to acknowledge webhook receipt
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage,
      received: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
