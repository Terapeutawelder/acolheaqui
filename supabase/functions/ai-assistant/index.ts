import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DAYS_OF_WEEK = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];

const tools = [
  {
    type: "function",
    function: {
      name: "get_available_hours",
      description: "Consulta os horários disponíveis do profissional para uma data específica. Use quando o cliente perguntar sobre disponibilidade ou quiser agendar.",
      parameters: {
        type: "object",
        properties: {
          date: {
            type: "string",
            description: "Data no formato YYYY-MM-DD para consultar disponibilidade",
          },
        },
        required: ["date"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_appointment",
      description: "Cria um novo agendamento para o cliente. Use após confirmar data, horário e dados do cliente.",
      parameters: {
        type: "object",
        properties: {
          client_name: {
            type: "string",
            description: "Nome completo do cliente",
          },
          client_email: {
            type: "string",
            description: "Email do cliente",
          },
          client_phone: {
            type: "string",
            description: "Telefone do cliente (opcional)",
          },
          appointment_date: {
            type: "string",
            description: "Data do agendamento no formato YYYY-MM-DD",
          },
          appointment_time: {
            type: "string",
            description: "Horário do agendamento no formato HH:MM",
          },
          session_type: {
            type: "string",
            description: "Tipo de sessão (ex: Consulta Online, Primeira Consulta)",
          },
          notes: {
            type: "string",
            description: "Observações adicionais (opcional)",
          },
        },
        required: ["client_name", "client_email", "appointment_date", "appointment_time"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_next_available_slots",
      description: "Retorna os próximos horários disponíveis nos próximos dias. Use quando o cliente quiser saber quando há disponibilidade.",
      parameters: {
        type: "object",
        properties: {
          days_ahead: {
            type: "number",
            description: "Número de dias à frente para buscar (padrão: 7)",
          },
        },
        required: [],
      },
    },
  },
];

async function getAvailableHours(supabase: any, professionalId: string, date: string) {
  const dateObj = new Date(date + "T00:00:00");
  const dayOfWeek = dateObj.getDay();

  // Get professional's available hours for this day
  const { data: hours, error: hoursError } = await supabase
    .from("available_hours")
    .select("*")
    .eq("professional_id", professionalId)
    .eq("day_of_week", dayOfWeek)
    .eq("is_active", true);

  if (hoursError) {
    console.error("Error fetching hours:", hoursError);
    return { error: "Erro ao consultar horários" };
  }

  if (!hours || hours.length === 0) {
    return { available: false, message: `Não há horários disponíveis para ${DAYS_OF_WEEK[dayOfWeek]}.` };
  }

  // Get existing appointments for this date
  const { data: appointments, error: appError } = await supabase
    .from("appointments")
    .select("appointment_time, duration_minutes")
    .eq("professional_id", professionalId)
    .eq("appointment_date", date)
    .neq("status", "cancelled");

  if (appError) {
    console.error("Error fetching appointments:", appError);
  }

  const bookedTimes = new Set(appointments?.map((a: any) => a.appointment_time.substring(0, 5)) || []);

  // Generate available time slots
  const availableSlots: string[] = [];
  for (const hour of hours) {
    const start = hour.start_time.substring(0, 5);
    const end = hour.end_time.substring(0, 5);
    
    let currentTime = start;
    while (currentTime < end) {
      if (!bookedTimes.has(currentTime)) {
        availableSlots.push(currentTime);
      }
      // Add 50 minutes (default session duration)
      const [h, m] = currentTime.split(":").map(Number);
      const totalMinutes = h * 60 + m + 50;
      const newH = Math.floor(totalMinutes / 60);
      const newM = totalMinutes % 60;
      currentTime = `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
    }
  }

  return {
    available: availableSlots.length > 0,
    date,
    day: DAYS_OF_WEEK[dayOfWeek],
    slots: availableSlots,
    message: availableSlots.length > 0
      ? `Horários disponíveis para ${DAYS_OF_WEEK[dayOfWeek]} (${date}): ${availableSlots.join(", ")}`
      : `Não há horários disponíveis para ${DAYS_OF_WEEK[dayOfWeek]} (${date}).`,
  };
}

async function sendNotifications(
  supabaseUrl: string,
  supabaseKey: string,
  notificationData: {
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    professionalName: string;
    professionalPhone?: string;
    appointmentDate: string;
    appointmentTime: string;
    notes?: string;
  }
) {
  try {
    console.log("Sending notifications:", JSON.stringify(notificationData));
    
    const response = await fetch(`${supabaseUrl}/functions/v1/send-appointment-notification`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify(notificationData),
    });

    const result = await response.json();
    console.log("Notification result:", JSON.stringify(result));
    return result;
  } catch (error) {
    console.error("Error sending notifications:", error);
    return { error: "Falha ao enviar notificações" };
  }
}

async function createAppointment(supabase: any, professionalId: string, params: any, professionalContext?: any) {
  const { client_name, client_email, client_phone, appointment_date, appointment_time, session_type, notes } = params;

  // Validate the slot is available
  const availability = await getAvailableHours(supabase, professionalId, appointment_date);
  if (!availability.available || !availability.slots?.includes(appointment_time)) {
    return { success: false, message: `O horário ${appointment_time} não está disponível para ${appointment_date}.` };
  }

  const { data, error } = await supabase
    .from("appointments")
    .insert({
      professional_id: professionalId,
      client_name,
      client_email,
      client_phone: client_phone || null,
      appointment_date,
      appointment_time: appointment_time + ":00",
      session_type: session_type || "Consulta",
      notes: notes || null,
      status: "pending",
      payment_status: "pending",
      duration_minutes: 50,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating appointment:", error);
    return { success: false, message: "Erro ao criar agendamento. Por favor, tente novamente." };
  }

  // Send notifications (email and WhatsApp)
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
  
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    const notificationResult = await sendNotifications(SUPABASE_URL, SUPABASE_ANON_KEY, {
      clientName: client_name,
      clientEmail: client_email,
      clientPhone: client_phone || "",
      professionalName: professionalContext?.full_name || "Profissional",
      professionalPhone: professionalContext?.phone || undefined,
      appointmentDate: appointment_date,
      appointmentTime: appointment_time,
      notes: notes || undefined,
    });
    
    console.log("Notifications sent:", JSON.stringify(notificationResult));
  }

  return {
    success: true,
    appointment: data,
    message: `✅ Agendamento criado com sucesso!\n\n📅 Data: ${appointment_date}\n⏰ Horário: ${appointment_time}\n👤 Cliente: ${client_name}\n📧 Email: ${client_email}\n\nNotificações enviadas por email${client_phone ? " e WhatsApp" : ""}.`,
  };
}

async function getNextAvailableSlots(supabase: any, professionalId: string, daysAhead: number = 7) {
  const results: any[] = [];
  const today = new Date();

  for (let i = 0; i < daysAhead; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split("T")[0];
    
    const availability = await getAvailableHours(supabase, professionalId, dateStr);
    if (availability.available && availability.slots && availability.slots.length > 0) {
      results.push({
        date: dateStr,
        day: availability.day,
        slots: availability.slots.slice(0, 5), // Limit to first 5 slots
      });
    }
  }

  if (results.length === 0) {
    return { message: `Não há horários disponíveis nos próximos ${daysAhead} dias.` };
  }

  let message = "📅 **Próximos horários disponíveis:**\n\n";
  for (const r of results) {
    message += `**${r.day} (${r.date})**: ${r.slots.join(", ")}\n`;
  }

  return { slots: results, message };
}

async function executeToolCall(supabase: any, professionalId: string, toolName: string, args: any, professionalContext?: any) {
  switch (toolName) {
    case "get_available_hours":
      return await getAvailableHours(supabase, professionalId, args.date);
    case "create_appointment":
      return await createAppointment(supabase, professionalId, args, professionalContext);
    case "get_next_available_slots":
      return await getNextAvailableSlots(supabase, professionalId, args.days_ahead || 7);
    default:
      return { error: "Ferramenta não reconhecida" };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, professionalContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Build dynamic system prompt with professional context
    let systemPrompt = `Você é um assistente virtual especializado em atendimento ao cliente para uma plataforma de agendamento de consultas com profissionais de saúde mental.

Suas principais responsabilidades:
1. Ajudar clientes a agendar consultas com o profissional
2. Informar sobre horários disponíveis
3. Responder dúvidas sobre a plataforma e serviços
4. Auxiliar profissionais com questões do sistema

Diretrizes de comunicação:
- Seja sempre educado, profissional e empático
- Use português brasileiro
- Seja conciso mas completo nas respostas
- Se não souber algo, admita e sugira contatar o suporte
- Formate respostas com markdown quando apropriado

IMPORTANTE - Fluxo de agendamento:
1. Quando o cliente quiser agendar, primeiro pergunte a data desejada
2. Use a ferramenta get_available_hours ou get_next_available_slots para verificar disponibilidade
3. Apresente os horários disponíveis ao cliente
4. Após o cliente escolher, solicite: nome completo e email (telefone é opcional)
5. Confirme todos os dados antes de criar o agendamento
6. Use create_appointment para finalizar`;

    if (professionalContext) {
      systemPrompt += `\n\n--- BASE DE CONHECIMENTO DO PROFISSIONAL ---
Nome: ${professionalContext.full_name || "Não informado"}
Especialidade: ${professionalContext.specialty || "Não informada"}
CRP: ${professionalContext.crp || "Não informado"}
Bio: ${professionalContext.bio || "Não informada"}
Email: ${professionalContext.email || "Não informado"}
Telefone: ${professionalContext.phone || "Não informado"}

Serviços oferecidos:
${professionalContext.services?.map((s: any) => `- ${s.name}: R$ ${(s.price_cents / 100).toFixed(2)} (${s.duration_minutes} min)`).join("\n") || "Nenhum serviço cadastrado"}

Horários de atendimento configurados:
${professionalContext.available_hours?.map((h: any) => {
  const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  return `- ${days[h.day_of_week]}: ${h.start_time.substring(0, 5)} às ${h.end_time.substring(0, 5)}${h.is_active ? "" : " (inativo)"}`;
}).join("\n") || "Nenhum horário configurado"}

ID do profissional para operações: ${professionalContext.id}
---`;
    }

    console.log("Received messages:", JSON.stringify(messages));

    // First API call with tools
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        tools,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Muitas requisições. Por favor, aguarde um momento e tente novamente." }), 
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos de IA esgotados. Por favor, adicione mais créditos." }), 
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Erro ao processar sua mensagem. Tente novamente." }), 
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    console.log("AI response:", JSON.stringify(data));

    const assistantMessage = data.choices?.[0]?.message;
    
    // Check if there are tool calls
    if (assistantMessage?.tool_calls && assistantMessage.tool_calls.length > 0) {
      const toolResults: any[] = [];
      const conversationMessages = [
        { role: "system", content: systemPrompt },
        ...messages,
        assistantMessage,
      ];

      for (const toolCall of assistantMessage.tool_calls) {
        const args = JSON.parse(toolCall.function.arguments);
        console.log(`Executing tool: ${toolCall.function.name}`, args);
        
        const result = await executeToolCall(
          supabase,
          professionalContext?.id,
          toolCall.function.name,
          args,
          professionalContext
        );
        
        console.log("Tool result:", JSON.stringify(result));
        
        toolResults.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(result),
        });
      }

      // Second API call with tool results - streaming
      const finalResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [...conversationMessages, ...toolResults],
          stream: true,
        }),
      });

      if (!finalResponse.ok) {
        const errorText = await finalResponse.text();
        console.error("Final AI response error:", errorText);
        throw new Error("Erro na resposta final da IA");
      }

      return new Response(finalResponse.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    // No tool calls - stream the original response
    // Since we already consumed the response, we need to create a streaming response
    const content = assistantMessage?.content || "Desculpe, não consegui processar sua solicitação.";
    
    const encoder = new TextEncoder();
    const streamData = `data: ${JSON.stringify({
      choices: [{ delta: { content } }]
    })}\n\ndata: [DONE]\n\n`;

    return new Response(encoder.encode(streamData), {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (error) {
    console.error("ai-assistant error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }), 
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
