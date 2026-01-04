import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DomainNotificationRequest {
  domainId: string;
  type: "activated" | "failed" | "offline";
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { domainId, type }: DomainNotificationRequest = await req.json();

    console.log(`[send-domain-notification] Type: ${type}, DomainId: ${domainId}`);

    // Fetch domain with professional info
    const { data: domain, error: domainError } = await supabase
      .from("custom_domains")
      .select("*, profiles!custom_domains_professional_id_fkey(full_name, email)")
      .eq("id", domainId)
      .single();

    if (domainError || !domain) {
      console.error("[send-domain-notification] Domain not found:", domainError);
      return new Response(
        JSON.stringify({ success: false, error: "Domínio não encontrado" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const professional = domain.profiles;
    if (!professional?.email) {
      console.error("[send-domain-notification] Professional email not found");
      return new Response(
        JSON.stringify({ success: false, error: "Email do profissional não encontrado" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const professionalName = professional.full_name || "Profissional";
    const domainName = domain.domain;

    let subject: string;
    let htmlContent: string;

    switch (type) {
      case "activated":
        subject = `🎉 Seu domínio ${domainName} está ativo!`;
        htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Domínio Ativado!</h1>
            </div>
            
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none;">
              <p style="font-size: 18px; margin-top: 0;">Olá, <strong>${professionalName}</strong>!</p>
              
              <p>Temos ótimas notícias! Seu domínio personalizado foi configurado com sucesso e já está ativo.</p>
              
              <div style="background: white; border: 2px solid #10b981; border-radius: 8px; padding: 20px; margin: 24px 0; text-align: center;">
                <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">Seu domínio</p>
                <a href="https://${domainName}" style="color: #10b981; font-size: 24px; font-weight: bold; text-decoration: none;">
                  ${domainName}
                </a>
              </div>
              
              <h3 style="color: #374151; margin-bottom: 12px;">✅ O que foi configurado:</h3>
              <ul style="color: #6b7280; padding-left: 20px;">
                <li>Registros DNS configurados automaticamente</li>
                <li>Certificado SSL ativo (conexão segura HTTPS)</li>
                <li>Redirecionamento www funcionando</li>
              </ul>
              
              <h3 style="color: #374151; margin-bottom: 12px;">📱 Próximos passos:</h3>
              <ul style="color: #6b7280; padding-left: 20px;">
                <li>Compartilhe seu novo endereço com seus pacientes</li>
                <li>Atualize suas redes sociais e materiais de divulgação</li>
                <li>Adicione o link na sua assinatura de email</li>
              </ul>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="https://${domainName}" style="background: #10b981; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
                  Acessar meu site
                </a>
              </div>
              
              <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 14px; text-align: center;">
                Se tiver alguma dúvida, nossa equipe está pronta para ajudar.
              </p>
            </div>
          </body>
          </html>
        `;
        break;

      case "failed":
        subject = `⚠️ Problema com seu domínio ${domainName}`;
        htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">⚠️ Atenção Necessária</h1>
            </div>
            
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none;">
              <p style="font-size: 18px; margin-top: 0;">Olá, <strong>${professionalName}</strong>!</p>
              
              <p>Identificamos um problema na configuração do seu domínio <strong>${domainName}</strong>.</p>
              
              <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 20px 0;">
                <p style="margin: 0; color: #92400e;">
                  <strong>O que aconteceu:</strong> O certificado SSL não pôde ser provisionado. Isso pode ocorrer por problemas temporários de propagação de DNS.
                </p>
              </div>
              
              <h3 style="color: #374151;">O que fazer:</h3>
              <ol style="color: #6b7280; padding-left: 20px;">
                <li>Acesse seu painel e clique em "Verificar novamente"</li>
                <li>Se o problema persistir, verifique se os registros DNS estão corretos</li>
                <li>Aguarde até 48h para propagação completa do DNS</li>
              </ol>
              
              <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 14px; text-align: center;">
                Precisa de ajuda? Entre em contato com nosso suporte.
              </p>
            </div>
          </body>
          </html>
        `;
        break;

      case "offline":
        subject = `🔴 Seu domínio ${domainName} está offline`;
        htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🔴 Domínio Offline</h1>
            </div>
            
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none;">
              <p style="font-size: 18px; margin-top: 0;">Olá, <strong>${professionalName}</strong>!</p>
              
              <p>Detectamos que seu domínio <strong>${domainName}</strong> não está mais apontando para nossos servidores.</p>
              
              <div style="background: #fee2e2; border: 1px solid #ef4444; border-radius: 8px; padding: 16px; margin: 20px 0;">
                <p style="margin: 0; color: #991b1b;">
                  <strong>Importante:</strong> Seus pacientes podem não conseguir acessar seu site através deste domínio.
                </p>
              </div>
              
              <h3 style="color: #374151;">Possíveis causas:</h3>
              <ul style="color: #6b7280; padding-left: 20px;">
                <li>Registros DNS foram alterados ou removidos</li>
                <li>O domínio expirou no seu registrador</li>
                <li>Houve uma mudança nos nameservers</li>
              </ul>
              
              <h3 style="color: #374151;">Como resolver:</h3>
              <ol style="color: #6b7280; padding-left: 20px;">
                <li>Verifique se o domínio está ativo no seu registrador</li>
                <li>Confirme se os registros DNS estão corretos</li>
                <li>Acesse seu painel e reconfigure o domínio se necessário</li>
              </ol>
              
              <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 14px; text-align: center;">
                Precisa de ajuda urgente? Entre em contato com nosso suporte.
              </p>
            </div>
          </body>
          </html>
        `;
        break;

      default:
        return new Response(
          JSON.stringify({ success: false, error: "Tipo de notificação inválido" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "AcolheAqui <notificacoes@acolheaqui.com.br>",
        to: [professional.email],
        subject,
        html: htmlContent,
      }),
    });

    const emailData = await emailResponse.json();
    console.log("[send-domain-notification] Email sent:", emailData);

    if (!emailResponse.ok) {
      throw new Error(emailData.message || "Failed to send email");
    }

    return new Response(
      JSON.stringify({ success: true, emailId: emailData.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("[send-domain-notification] Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
