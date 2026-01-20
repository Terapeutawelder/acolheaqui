import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Format phone number to international format (Brazil)
const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('55')) {
    return cleaned;
  }
  return `55${cleaned}`;
};

// Send WhatsApp message via Evolution API
const sendWhatsAppMessage = async (
  evolutionApiUrl: string,
  evolutionApiKey: string,
  evolutionInstanceName: string,
  phone: string, 
  message: string
): Promise<boolean> => {
  try {
    const formattedPhone = formatPhoneNumber(phone);
    console.log(`Sending WhatsApp reminder to ${formattedPhone}`);

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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Calculate time window: appointments between 23 and 25 hours from now
    const now = new Date();
    const minTime = new Date(now.getTime() + 23 * 60 * 60 * 1000);
    const maxTime = new Date(now.getTime() + 25 * 60 * 60 * 1000);

    const minDate = minTime.toISOString().split("T")[0];
    const maxDate = maxTime.toISOString().split("T")[0];
    const minTimeStr = minTime.toTimeString().substring(0, 5) + ":00";
    const maxTimeStr = maxTime.toTimeString().substring(0, 5) + ":00";

    console.log(`Checking for appointments between ${minDate} ${minTimeStr} and ${maxDate} ${maxTimeStr}`);

    // Get appointments that need reminders
    // We need to handle the case where the appointment spans midnight
    let appointments: any[] = [];

    if (minDate === maxDate) {
      // Same day - simple query
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          *,
          profiles!appointments_professional_id_fkey (
            id,
            full_name,
            phone,
            gender
          )
        `)
        .eq("appointment_date", minDate)
        .gte("appointment_time", minTimeStr)
        .lte("appointment_time", maxTimeStr)
        .eq("status", "pending")
        .not("client_phone", "is", null);

      if (error) {
        console.error("Error fetching appointments:", error);
        throw error;
      }
      appointments = data || [];
    } else {
      // Spans midnight - need two queries
      const { data: todayData, error: todayError } = await supabase
        .from("appointments")
        .select(`
          *,
          profiles!appointments_professional_id_fkey (
            id,
            full_name,
            phone,
            gender
          )
        `)
        .eq("appointment_date", minDate)
        .gte("appointment_time", minTimeStr)
        .eq("status", "pending")
        .not("client_phone", "is", null);

      if (todayError) {
        console.error("Error fetching today appointments:", todayError);
        throw todayError;
      }

      const { data: tomorrowData, error: tomorrowError } = await supabase
        .from("appointments")
        .select(`
          *,
          profiles!appointments_professional_id_fkey (
            id,
            full_name,
            phone,
            gender
          )
        `)
        .eq("appointment_date", maxDate)
        .lte("appointment_time", maxTimeStr)
        .eq("status", "pending")
        .not("client_phone", "is", null);

      if (tomorrowError) {
        console.error("Error fetching tomorrow appointments:", tomorrowError);
        throw tomorrowError;
      }

      appointments = [...(todayData || []), ...(tomorrowData || [])];
    }

    console.log(`Found ${appointments.length} appointments needing reminders`);

    const results: any[] = [];

    for (const appointment of appointments) {
      const professionalId = appointment.professional_id;

      // Get WhatsApp settings for this professional
      const { data: whatsappSettings, error: settingsError } = await supabase
        .from("whatsapp_settings")
        .select("*")
        .eq("professional_id", professionalId)
        .eq("is_active", true)
        .eq("reminder_enabled", true)
        .maybeSingle();

      if (settingsError) {
        console.error(`Error fetching WhatsApp settings for professional ${professionalId}:`, settingsError);
        continue;
      }

      if (!whatsappSettings || !whatsappSettings.evolution_api_key || !whatsappSettings.evolution_instance_name) {
        console.log(`WhatsApp not configured for professional ${professionalId}, skipping`);
        continue;
      }

      // Get custom template if available
      const customTemplate = (whatsappSettings as any)?.template_client_reminder || null;
      
      // Template variable replacement helper
      const replaceTemplateVariables = (template: string, vars: Record<string, string>): string => {
        let result = template;
        for (const [key, value] of Object.entries(vars)) {
          result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value || '');
        }
        return result;
      };

      // Format date for display
      const [year, month, day] = appointment.appointment_date.split('-');
      const formattedDate = `${day}/${month}/${year}`;
      const appointmentTime = appointment.appointment_time.substring(0, 5);
      
      // Format professional name with Dr./Dra. prefix based on gender
      const formatProfessionalName = (fullName: string | null, gender: string | null): string => {
        if (!fullName) return 'Profissional';
        const prefix = gender === 'male' ? 'Dr.' : gender === 'other' ? 'Dr.' : 'Dra.';
        return `${prefix} ${fullName}`;
      };

      const professionalName = formatProfessionalName(appointment.profiles?.full_name, appointment.profiles?.gender);

      // Template variables
      const templateVars = {
        client_name: appointment.client_name,
        professional_name: professionalName,
        date: formattedDate,
        time: appointmentTime,
      };

      // Build reminder message
      let reminderMessage = '';
      if (customTemplate) {
        reminderMessage = replaceTemplateVariables(customTemplate, templateVars);
      } else {
        reminderMessage = `⏰ *Lembrete de Consulta*

Olá, ${appointment.client_name}!

Este é um lembrete da sua consulta agendada para *amanhã*:

📅 *Data:* ${formattedDate}
🕐 *Horário:* ${appointmentTime}
👤 *Profissional:* ${professionalName}

Por favor, confirme sua presença ou entre em contato caso precise reagendar.

Até breve! 💜`;
      }

      const evolutionApiUrl = whatsappSettings.evolution_api_url || "https://evo.agenteluzia.online";
      
      const success = await sendWhatsAppMessage(
        evolutionApiUrl,
        whatsappSettings.evolution_api_key,
        whatsappSettings.evolution_instance_name,
        appointment.client_phone,
        reminderMessage
      );

      results.push({
        appointment_id: appointment.id,
        client_name: appointment.client_name,
        client_phone: appointment.client_phone,
        appointment_date: appointment.appointment_date,
        appointment_time: appointmentTime,
        reminder_sent: success,
      });

      // Add a small delay between messages to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log("Reminder results:", JSON.stringify(results));

    const successCount = results.filter(r => r.reminder_sent).length;
    const failCount = results.filter(r => !r.reminder_sent).length;

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Enviados ${successCount} lembretes, ${failCount} falhas`,
        results 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-appointment-reminders function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
