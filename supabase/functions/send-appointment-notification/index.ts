import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const evolutionApiUrl = Deno.env.get("EVOLUTION_API_URL") || "https://evo.agenteluzia.online";
const evolutionApiKey = Deno.env.get("EVOLUTION_API_KEY");
const evolutionInstanceName = Deno.env.get("EVOLUTION_INSTANCE_NAME");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AppointmentNotification {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  professionalName: string;
  professionalPhone?: string;
  appointmentDate: string;
  appointmentTime: string;
  notes?: string;
}

// Format phone number to international format (Brazil)
const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('55')) {
    return cleaned;
  }
  return `55${cleaned}`;
};

// Send WhatsApp message via Evolution API
const sendWhatsAppMessage = async (phone: string, message: string): Promise<boolean> => {
  if (!evolutionApiKey || !evolutionInstanceName) {
    console.log("Evolution API not configured, skipping WhatsApp notification");
    return false;
  }

  try {
    const formattedPhone = formatPhoneNumber(phone);
    console.log(`Sending WhatsApp message to ${formattedPhone}`);

    const response = await fetch(`${evolutionApiUrl}/message/sendText/${evolutionInstanceName}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": evolutionApiKey,
      },
      body: JSON.stringify({
        number: formattedPhone,
        text: message,
      }),
    });

    const responseData = await response.json();
    console.log("Evolution API response:", JSON.stringify(responseData));

    if (!response.ok) {
      console.error("Evolution API error:", responseData);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    return false;
  }
};

// Send email notification via Resend API
const sendEmailNotification = async (
  to: string,
  subject: string,
  html: string
): Promise<boolean> => {
  if (!RESEND_API_KEY) {
    console.log("Resend API key not configured, skipping email notification");
    return false;
  }

  try {
    console.log(`Sending email to ${to}`);
    
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "PsiAgenda <onboarding@resend.dev>",
        to: [to],
        subject,
        html,
      }),
    });

    const responseData = await response.json();
    console.log("Resend API response:", JSON.stringify(responseData));

    if (!response.ok) {
      console.error("Resend API error:", responseData);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: AppointmentNotification = await req.json();
    console.log("Received notification request:", JSON.stringify(data));

    const {
      clientName,
      clientEmail,
      clientPhone,
      professionalName,
      professionalPhone,
      appointmentDate,
      appointmentTime,
    } = data;

    // Format date for display
    const [year, month, day] = appointmentDate.split('-');
    const formattedDate = `${day}/${month}/${year}`;

    const results = {
      emailToClient: false,
      whatsappToClient: false,
      whatsappToProfessional: false,
    };

    // 1. Send email to client
    const clientEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #6366f1; margin-bottom: 20px;">Agendamento Confirmado! ✅</h1>
        <p>Olá, <strong>${clientName}</strong>!</p>
        <p>Seu agendamento foi realizado com sucesso.</p>
        
        <div style="background: #f3f4f6; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #374151;">Detalhes do Agendamento</h3>
          <p style="margin: 5px 0;"><strong>Profissional:</strong> ${professionalName}</p>
          <p style="margin: 5px 0;"><strong>Data:</strong> ${formattedDate}</p>
          <p style="margin: 5px 0;"><strong>Horário:</strong> ${appointmentTime}</p>
          <p style="margin: 5px 0;"><strong>Duração:</strong> 50 minutos</p>
        </div>
        
        <p style="color: #6b7280; font-size: 14px;">
          Caso precise remarcar ou cancelar, entre em contato diretamente com o profissional.
        </p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="color: #9ca3af; font-size: 12px; text-align: center;">
          Este e-mail foi enviado automaticamente pelo sistema PsiAgenda.
        </p>
      </div>
    `;

    results.emailToClient = await sendEmailNotification(
      clientEmail,
      `Agendamento confirmado para ${formattedDate} às ${appointmentTime}`,
      clientEmailHtml
    );

    // 2. Send WhatsApp to client
    const clientWhatsAppMessage = `✅ *Agendamento Confirmado!*

Olá, ${clientName}!

Seu agendamento foi realizado com sucesso.

📋 *Detalhes:*
👤 Profissional: ${professionalName}
📅 Data: ${formattedDate}
🕐 Horário: ${appointmentTime}
⏱️ Duração: 50 minutos

Caso precise remarcar ou cancelar, entre em contato diretamente com o profissional.`;

    results.whatsappToClient = await sendWhatsAppMessage(clientPhone, clientWhatsAppMessage);

    // 3. Send WhatsApp to professional (if phone is provided)
    if (professionalPhone) {
      const professionalMessage = `📅 *Novo Agendamento!*

Você tem um novo agendamento:

👤 *Cliente:* ${clientName}
📱 *Telefone:* ${clientPhone}
📧 *E-mail:* ${clientEmail}
📅 *Data:* ${formattedDate}
🕐 *Horário:* ${appointmentTime}

${data.notes ? `📝 *Observações:* ${data.notes}` : ''}`;

      results.whatsappToProfessional = await sendWhatsAppMessage(professionalPhone, professionalMessage);
    }

    console.log("Notification results:", results);

    return new Response(JSON.stringify({ success: true, results }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-appointment-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
