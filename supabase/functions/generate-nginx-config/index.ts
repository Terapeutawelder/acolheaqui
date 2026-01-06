import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NginxConfigRequest {
  domainId?: string;
  domain?: string;
}

// Lovable project URL - this is the target for proxy
const LOVABLE_PROJECT_URL = "32c1c6d1-e5a8-45b7-9bf1-e2a031064469.lovableproject.com";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { domainId, domain } = await req.json() as NginxConfigRequest;

    let targetDomain = domain;

    // If domainId provided, fetch from database
    if (domainId && !domain) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const { data: domainData, error } = await supabase
        .from("custom_domains")
        .select("domain")
        .eq("id", domainId)
        .single();

      if (error || !domainData) {
        return new Response(
          JSON.stringify({ success: false, error: "Domínio não encontrado" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
        );
      }

      targetDomain = domainData.domain;
    }

    if (!targetDomain) {
      return new Response(
        JSON.stringify({ success: false, error: "Domínio não especificado" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Generate Nginx configuration
    const nginxConfig = `# Configuração Nginx para ${targetDomain}
# Proxy reverso para aplicação Lovable

server {
    listen 80;
    server_name ${targetDomain} www.${targetDomain};

    # Redirecionar HTTP para HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ${targetDomain} www.${targetDomain};

    # Certificados SSL (serão configurados pelo Certbot)
    # ssl_certificate /etc/letsencrypt/live/${targetDomain}/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/${targetDomain}/privkey.pem;

    # Configurações SSL recomendadas
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;

    # Proxy para Lovable
    location / {
        proxy_pass https://${LOVABLE_PROJECT_URL};
        proxy_set_header Host ${LOVABLE_PROJECT_URL};
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # SSL para backend
        proxy_ssl_server_name on;
        proxy_ssl_protocols TLSv1.2 TLSv1.3;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffer settings
        proxy_buffering on;
        proxy_buffer_size 128k;
        proxy_buffers 4 256k;
        proxy_busy_buffers_size 256k;
    }

    # Cache de assets estáticos
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass https://${LOVABLE_PROJECT_URL};
        proxy_set_header Host ${LOVABLE_PROJECT_URL};
        proxy_ssl_server_name on;
        
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}`;

    // Generate setup commands
    const setupCommands = `#!/bin/bash
# Comandos para configurar o proxy reverso na VPS

# 1. Criar arquivo de configuração
sudo tee /etc/nginx/sites-available/${targetDomain} > /dev/null << 'EOF'
${nginxConfig}
EOF

# 2. Criar link simbólico
sudo ln -sf /etc/nginx/sites-available/${targetDomain} /etc/nginx/sites-enabled/

# 3. Testar configuração
sudo nginx -t

# 4. Recarregar Nginx
sudo systemctl reload nginx

# 5. Instalar certificado SSL (Let's Encrypt)
sudo certbot --nginx -d ${targetDomain} -d www.${targetDomain} --non-interactive --agree-tos --email admin@${targetDomain}

echo "Configuração concluída! Acesse https://${targetDomain}"`;

    return new Response(
      JSON.stringify({
        success: true,
        domain: targetDomain,
        lovableUrl: LOVABLE_PROJECT_URL,
        nginxConfig,
        setupCommands,
        instructions: [
          `1. Acesse sua VPS via SSH`,
          `2. Execute o script de configuração abaixo`,
          `3. O Nginx será configurado automaticamente`,
          `4. O SSL será instalado via Let's Encrypt`,
          `5. Teste acessando https://${targetDomain}`
        ]
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error generating Nginx config:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
