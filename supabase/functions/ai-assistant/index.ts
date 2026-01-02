import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const systemPrompt = `Você é um assistente virtual especializado em atendimento ao cliente para uma plataforma de agendamento de consultas com profissionais de saúde mental (psicólogos, psiquiatras, terapeutas).

Suas principais responsabilidades:
1. Ajudar profissionais a gerenciar seus agendamentos
2. Responder dúvidas sobre a plataforma
3. Auxiliar na configuração de horários disponíveis
4. Fornecer informações sobre funcionalidades do sistema
5. Ajudar com dúvidas sobre pagamentos e checkout

Diretrizes de comunicação:
- Seja sempre educado, profissional e empático
- Use português brasileiro
- Seja conciso mas completo nas respostas
- Se não souber algo, admita e sugira contatar o suporte
- Formate respostas com markdown quando apropriado (listas, negrito, etc)

Funcionalidades da plataforma que você conhece:
- Gerenciamento de horários disponíveis
- Sistema de agendamento online
- Checkout personalizado para pagamentos
- Integração com WhatsApp para notificações
- Dashboard com métricas e relatórios
- Perfil profissional público
- Histórico de consultas e vendas

Quando o profissional perguntar sobre agendamentos, horários ou consultas, ofereça ajuda prática e direcione para as funcionalidades corretas do dashboard.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Received messages:", JSON.stringify(messages));

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
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Muitas requisições. Por favor, aguarde um momento e tente novamente." }), 
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos de IA esgotados. Por favor, adicione mais créditos." }), 
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Erro ao processar sua mensagem. Tente novamente." }), 
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("AI response received, streaming...");

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("ai-assistant error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }), 
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
