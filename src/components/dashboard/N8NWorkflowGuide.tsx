import { useState } from "react";
import { 
  Download, 
  Copy, 
  Check, 
  ExternalLink, 
  ChevronDown, 
  ChevronRight,
  Workflow,
  MessageCircle,
  Bot,
  Webhook,
  ArrowRight,
  Info
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

interface N8NWorkflowGuideProps {
  professionalId: string;
  agentConfig: {
    agent_name: string;
    agent_greeting: string;
    agent_instructions: string;
  };
}

const N8NWorkflowGuide = ({ professionalId, agentConfig }: N8NWorkflowGuideProps) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    overview: true,
    step1: false,
    step2: false,
    step3: false,
    step4: false,
    payload: false,
  });

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const aiAssistantUrl = `${supabaseUrl}/functions/v1/ai-assistant`;

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success("Copiado!");
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast.error("Erro ao copiar");
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // N8N Workflow JSON template
  const workflowTemplate = {
    name: "WhatsApp AI Scheduling Agent",
    nodes: [
      {
        id: "webhook",
        name: "WhatsApp Webhook",
        type: "n8n-nodes-base.webhook",
        position: [250, 300],
        parameters: {
          httpMethod: "POST",
          path: "whatsapp-ai-agent",
          responseMode: "responseNode"
        }
      },
      {
        id: "extract",
        name: "Extract Message",
        type: "n8n-nodes-base.set",
        position: [450, 300],
        parameters: {
          values: {
            string: [
              { name: "message", value: "={{ $json.body.data.message.conversation || $json.body.data.message.extendedTextMessage?.text || '' }}" },
              { name: "phone", value: "={{ $json.body.data.key.remoteJid.replace('@s.whatsapp.net', '') }}" },
              { name: "pushName", value: "={{ $json.body.data.pushName || 'Cliente' }}" }
            ]
          }
        }
      },
      {
        id: "ai-agent",
        name: "AI Agent Request",
        type: "n8n-nodes-base.httpRequest",
        position: [650, 300],
        parameters: {
          method: "POST",
          url: aiAssistantUrl,
          authentication: "genericCredentialType",
          genericAuthType: "httpHeaderAuth",
          sendBody: true,
          bodyParameters: {
            parameters: [
              {
                name: "messages",
                value: `=[{"role": "user", "content": "{{ $json.message }}"}]`
              },
              {
                name: "professionalContext",
                value: JSON.stringify({
                  id: professionalId,
                  full_name: agentConfig.agent_name
                })
              }
            ]
          }
        }
      },
      {
        id: "parse-response",
        name: "Parse AI Response",
        type: "n8n-nodes-base.code",
        position: [850, 300],
        parameters: {
          jsCode: `// Parse SSE streaming response
const rawResponse = $input.first().json.data || '';
let fullContent = '';

const lines = rawResponse.split('\\n');
for (const line of lines) {
  if (line.startsWith('data: ') && !line.includes('[DONE]')) {
    try {
      const data = JSON.parse(line.substring(6));
      if (data.choices?.[0]?.delta?.content) {
        fullContent += data.choices[0].delta.content;
      }
    } catch (e) {}
  }
}

return [{ json: { response: fullContent, phone: $('Extract Message').first().json.phone } }];`
        }
      },
      {
        id: "send-whatsapp",
        name: "Send WhatsApp Response",
        type: "n8n-nodes-base.httpRequest",
        position: [1050, 300],
        parameters: {
          method: "POST",
          url: "={{ $env.EVOLUTION_API_URL }}/message/sendText/{{ $env.EVOLUTION_INSTANCE }}",
          authentication: "genericCredentialType",
          genericAuthType: "httpHeaderAuth",
          sendBody: true,
          bodyParameters: {
            parameters: [
              { name: "number", value: "={{ $json.phone }}" },
              { name: "text", value: "={{ $json.response }}" }
            ]
          }
        }
      },
      {
        id: "respond",
        name: "Respond to Webhook",
        type: "n8n-nodes-base.respondToWebhook",
        position: [1250, 300],
        parameters: {
          respondWith: "json",
          responseBody: "={{ { success: true } }}"
        }
      }
    ],
    connections: {
      "WhatsApp Webhook": { main: [[{ node: "Extract Message", type: "main", index: 0 }]] },
      "Extract Message": { main: [[{ node: "AI Agent Request", type: "main", index: 0 }]] },
      "AI Agent Request": { main: [[{ node: "Parse AI Response", type: "main", index: 0 }]] },
      "Parse AI Response": { main: [[{ node: "Send WhatsApp Response", type: "main", index: 0 }]] },
      "Send WhatsApp Response": { main: [[{ node: "Respond to Webhook", type: "main", index: 0 }]] }
    }
  };

  const downloadWorkflow = () => {
    const blob = new Blob([JSON.stringify(workflowTemplate, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "whatsapp-ai-scheduling-workflow.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Workflow baixado com sucesso!");
  };

  const samplePayload = {
    messages: [
      { role: "user", content: "Olá, gostaria de agendar uma consulta" }
    ],
    professionalContext: {
      id: professionalId,
      full_name: "Dr. Nome do Profissional",
      specialty: "Psicologia",
      email: "profissional@email.com",
      services: [
        { name: "Consulta Individual", price_cents: 15000, duration_minutes: 50 }
      ],
      available_hours: [
        { day_of_week: 1, start_time: "09:00", end_time: "18:00", is_active: true }
      ]
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <Workflow className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                Guia de Integração N8N + WhatsApp
                <Badge variant="outline" className="text-xs">Completo</Badge>
              </CardTitle>
              <CardDescription>
                Configure o fluxo automatizado de agendamento via WhatsApp
              </CardDescription>
            </div>
          </div>
          <Button onClick={downloadWorkflow} className="gap-2">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Baixar Template</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Fluxo Visual */}
        <div className="flex items-center justify-center gap-2 py-4 px-2 rounded-lg bg-muted/50 overflow-x-auto">
          <div className="flex items-center gap-1 px-3 py-2 rounded-lg bg-green-500/20 text-green-700 dark:text-green-400 whitespace-nowrap">
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm font-medium">WhatsApp</span>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <div className="flex items-center gap-1 px-3 py-2 rounded-lg bg-orange-500/20 text-orange-700 dark:text-orange-400 whitespace-nowrap">
            <Workflow className="w-4 h-4" />
            <span className="text-sm font-medium">N8N</span>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <div className="flex items-center gap-1 px-3 py-2 rounded-lg bg-primary/20 text-primary whitespace-nowrap">
            <Bot className="w-4 h-4" />
            <span className="text-sm font-medium">Agente IA</span>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <div className="flex items-center gap-1 px-3 py-2 rounded-lg bg-blue-500/20 text-blue-700 dark:text-blue-400 whitespace-nowrap">
            <Webhook className="w-4 h-4" />
            <span className="text-sm font-medium">Agendamento</span>
          </div>
        </div>

        <Separator />

        {/* Step 1: Evolution API */}
        <Collapsible open={expandedSections.step1} onOpenChange={() => toggleSection("step1")}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-sm font-bold text-primary">1</span>
              </div>
              <div className="text-left">
                <p className="font-medium">Configurar Evolution API</p>
                <p className="text-sm text-muted-foreground">Configure o webhook do WhatsApp</p>
              </div>
            </div>
            {expandedSections.step1 ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 ml-11 space-y-3">
            <div className="p-4 rounded-lg bg-muted/30 space-y-3">
              <p className="text-sm">Na sua instância Evolution API, configure o webhook para enviar mensagens recebidas para o N8N:</p>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Acesse o painel da Evolution API</li>
                <li>Vá em <strong>Configurações → Webhook</strong></li>
                <li>Ative o evento <code className="px-1 py-0.5 rounded bg-muted">MESSAGES_UPSERT</code></li>
                <li>Cole a URL do webhook do N8N (gerada no passo 2)</li>
                <li>Salve as configurações</li>
              </ol>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Step 2: N8N Webhook */}
        <Collapsible open={expandedSections.step2} onOpenChange={() => toggleSection("step2")}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-sm font-bold text-primary">2</span>
              </div>
              <div className="text-left">
                <p className="font-medium">Criar Workflow no N8N</p>
                <p className="text-sm text-muted-foreground">Importe ou crie o workflow de automação</p>
              </div>
            </div>
            {expandedSections.step2 ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 ml-11 space-y-3">
            <div className="p-4 rounded-lg bg-muted/30 space-y-3">
              <p className="text-sm font-medium">Opção 1: Importar template (recomendado)</p>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Baixe o template clicando no botão acima</li>
                <li>No N8N, vá em <strong>Workflows → Import from File</strong></li>
                <li>Selecione o arquivo JSON baixado</li>
                <li>Configure as credenciais (Evolution API e Header Auth)</li>
              </ol>

              <Separator className="my-4" />

              <p className="text-sm font-medium">Opção 2: Criar manualmente</p>
              <p className="text-sm text-muted-foreground">Adicione os seguintes nós em ordem:</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">1</Badge>
                  <span>Webhook Trigger (recebe mensagens do WhatsApp)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">2</Badge>
                  <span>Set Node (extrai mensagem e telefone)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">3</Badge>
                  <span>HTTP Request (chama o Agente IA)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">4</Badge>
                  <span>Code Node (processa resposta streaming)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">5</Badge>
                  <span>HTTP Request (envia resposta via Evolution API)</span>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Step 3: AI Agent Endpoint */}
        <Collapsible open={expandedSections.step3} onOpenChange={() => toggleSection("step3")}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-sm font-bold text-primary">3</span>
              </div>
              <div className="text-left">
                <p className="font-medium">Configurar Endpoint do Agente IA</p>
                <p className="text-sm text-muted-foreground">URL e payload para chamada da IA</p>
              </div>
            </div>
            {expandedSections.step3 ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 ml-11 space-y-3">
            <div className="p-4 rounded-lg bg-muted/30 space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">URL do Agente IA:</p>
                <div className="flex gap-2">
                  <code className="flex-1 p-2 rounded bg-background text-xs font-mono break-all">
                    {aiAssistantUrl}
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(aiAssistantUrl, "ai-url")}
                  >
                    {copiedField === "ai-url" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Headers necessários:</p>
                <code className="block p-2 rounded bg-background text-xs font-mono">
                  Content-Type: application/json
                </code>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Seu ID de Profissional:</p>
                <div className="flex gap-2">
                  <code className="flex-1 p-2 rounded bg-background text-xs font-mono break-all">
                    {professionalId}
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(professionalId, "prof-id")}
                  >
                    {copiedField === "prof-id" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Step 4: Test */}
        <Collapsible open={expandedSections.step4} onOpenChange={() => toggleSection("step4")}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-sm font-bold text-primary">4</span>
              </div>
              <div className="text-left">
                <p className="font-medium">Testar e Ativar</p>
                <p className="text-sm text-muted-foreground">Valide o fluxo completo</p>
              </div>
            </div>
            {expandedSections.step4 ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 ml-11 space-y-3">
            <div className="p-4 rounded-lg bg-muted/30 space-y-3">
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>No N8N, ative o workflow clicando no toggle</li>
                <li>Envie uma mensagem de teste pelo WhatsApp conectado</li>
                <li>Verifique se a resposta da IA chegou corretamente</li>
                <li>Teste um agendamento completo</li>
                <li>Verifique se o agendamento aparece na sua agenda</li>
              </ol>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Dica:</strong> Use o recurso "Test Workflow" do N8N para debugar cada etapa antes de ativar em produção.
                </AlertDescription>
              </Alert>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Payload Example */}
        <Collapsible open={expandedSections.payload} onOpenChange={() => toggleSection("payload")}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <code className="text-xs">{ }</code>
              </div>
              <div className="text-left">
                <p className="font-medium">Exemplo de Payload</p>
                <p className="text-sm text-muted-foreground">JSON enviado para o Agente IA</p>
              </div>
            </div>
            {expandedSections.payload ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 ml-11">
            <div className="relative">
              <pre className="p-4 rounded-lg bg-muted/30 text-xs font-mono overflow-x-auto max-h-64">
                {JSON.stringify(samplePayload, null, 2)}
              </pre>
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2 gap-1"
                onClick={() => copyToClipboard(JSON.stringify(samplePayload, null, 2), "payload")}
              >
                {copiedField === "payload" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                Copiar
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* External Links */}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href="https://docs.n8n.io/" target="_blank" rel="noopener noreferrer" className="gap-1">
              <ExternalLink className="w-3 h-3" />
              Docs N8N
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href="https://doc.evolution-api.com/" target="_blank" rel="noopener noreferrer" className="gap-1">
              <ExternalLink className="w-3 h-3" />
              Docs Evolution API
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default N8NWorkflowGuide;
