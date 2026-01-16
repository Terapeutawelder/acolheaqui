import { useState, useEffect } from "react";
import { Bot, Webhook, Settings2, Zap, Save, ExternalLink, Info, HelpCircle, CheckCircle2, XCircle, Loader2, Copy, Check, RefreshCw, Power, PowerOff } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AISchedulingPageProps {
  profileId: string;
}

interface AIAgentConfig {
  id?: string;
  professional_id: string;
  is_active: boolean;
  n8n_webhook_url: string;
  n8n_api_key: string;
  agent_name: string;
  agent_greeting: string;
  agent_instructions: string;
  auto_confirm_appointments: boolean;
  send_confirmation_message: boolean;
  working_hours_only: boolean;
}

const defaultConfig: Omit<AIAgentConfig, 'professional_id'> = {
  is_active: false,
  n8n_webhook_url: "",
  n8n_api_key: "",
  agent_name: "Assistente Virtual",
  agent_greeting: "Olá! Sou o assistente virtual. Como posso ajudar você a agendar uma consulta?",
  agent_instructions: "Você é um assistente virtual de agendamento. Seja educado e profissional. Ajude os clientes a encontrar o melhor horário disponível para suas consultas.",
  auto_confirm_appointments: false,
  send_confirmation_message: true,
  working_hours_only: true,
};

const AISchedulingPage = ({ profileId }: AISchedulingPageProps) => {
  const [config, setConfig] = useState<AIAgentConfig>({ ...defaultConfig, professional_id: profileId });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);

  // Generate webhook URL for receiving messages from N8N
  const incomingWebhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`;

  useEffect(() => {
    fetchConfig();
  }, [profileId]);

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from("ai_agent_config")
        .select("*")
        .eq("professional_id", profileId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Erro ao buscar configuração:", error);
        toast.error("Erro ao carregar configuração");
      }

      if (data) {
        setConfig(data);
      }
    } catch (error) {
      console.error("Erro:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const configData = {
        ...config,
        professional_id: profileId,
        updated_at: new Date().toISOString(),
      };

      if (config.id) {
        const { error } = await supabase
          .from("ai_agent_config")
          .update(configData)
          .eq("id", config.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("ai_agent_config")
          .insert(configData)
          .select()
          .single();

        if (error) throw error;
        if (data) setConfig(data);
      }

      toast.success("Configuração salva com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar configuração");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    if (!config.n8n_webhook_url) {
      toast.error("Configure a URL do webhook N8N primeiro");
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const testPayload = {
        event: "test_connection",
        professional_id: profileId,
        timestamp: new Date().toISOString(),
        data: {
          message: "Teste de conexão do Agente IA de Agendamento",
          agent_name: config.agent_name,
        },
      };

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (config.n8n_api_key) {
        headers["Authorization"] = `Bearer ${config.n8n_api_key}`;
      }

      const response = await fetch(config.n8n_webhook_url, {
        method: "POST",
        headers,
        body: JSON.stringify(testPayload),
      });

      if (response.ok) {
        setTestResult({ success: true, message: `Conexão bem sucedida! (Status: ${response.status})` });
        toast.success("Conexão com N8N estabelecida!");
      } else {
        setTestResult({ success: false, message: `Erro: ${response.status} - ${response.statusText}` });
        toast.error(`Erro na conexão: ${response.status}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      setTestResult({ success: false, message: errorMessage });
      toast.error("Falha ao conectar com N8N");
    } finally {
      setIsTesting(false);
    }
  };

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Agente IA de Agendamento</h1>
              <p className="text-muted-foreground text-sm">
                Configure seu assistente virtual para agendar consultas automaticamente
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50">
              {config.is_active ? (
                <>
                  <Power className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-500 font-medium">Ativo</span>
                </>
              ) : (
                <>
                  <PowerOff className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground font-medium">Inativo</span>
                </>
              )}
            </div>
            <Badge variant="secondary" className="gap-1">
              <Zap className="w-3 h-3" />
              Premium
            </Badge>
          </div>
        </div>

        {/* Help Section */}
        <Collapsible open={helpOpen} onOpenChange={setHelpOpen}>
          <Card className="border-primary/20 bg-primary/5">
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-primary/10 transition-colors rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Info className="w-5 h-5 text-primary" />
                    <CardTitle className="text-base">Como funciona a integração com N8N?</CardTitle>
                  </div>
                  <Button variant="ghost" size="sm">
                    {helpOpen ? "Fechar" : "Saiba mais"}
                  </Button>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4 pt-0">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-background/50">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary">1</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">Crie um workflow no N8N</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Configure um workflow com trigger Webhook e conecte com seu WhatsApp ou canal de atendimento.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-background/50">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary">2</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">Configure as URLs</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Cole a URL do webhook do N8N aqui e use nossa URL de recebimento no seu workflow.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-background/50">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary">3</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">Teste e ative</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Use o botão de teste para verificar a conexão e ative o agente quando estiver pronto.
                      </p>
                    </div>
                  </div>
                </div>

                <Alert>
                  <ExternalLink className="h-4 w-4" />
                  <AlertDescription className="flex items-center justify-between">
                    <span>Precisa de ajuda para configurar o N8N?</span>
                    <Button variant="link" size="sm" asChild className="p-0 h-auto">
                      <a href="https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/" target="_blank" rel="noopener noreferrer">
                        Ver documentação N8N
                      </a>
                    </Button>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        <Tabs defaultValue="connection" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="connection" className="gap-2">
              <Webhook className="w-4 h-4" />
              <span className="hidden sm:inline">Conexão N8N</span>
              <span className="sm:hidden">N8N</span>
            </TabsTrigger>
            <TabsTrigger value="agent" className="gap-2">
              <Bot className="w-4 h-4" />
              <span className="hidden sm:inline">Agente IA</span>
              <span className="sm:hidden">Agente</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings2 className="w-4 h-4" />
              <span className="hidden sm:inline">Configurações</span>
              <span className="sm:hidden">Config</span>
            </TabsTrigger>
          </TabsList>

          {/* Connection Tab */}
          <TabsContent value="connection" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Webhook className="w-5 h-5 text-primary" />
                  Configuração de Webhook N8N
                </CardTitle>
                <CardDescription>
                  Configure a comunicação bidirecional entre seu N8N e o Agente IA
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Incoming Webhook URL */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label>URL de Recebimento (para configurar no N8N)</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="w-4 h-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Use esta URL no seu workflow N8N para enviar mensagens dos clientes para o nosso Agente IA processar.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={incomingWebhookUrl}
                      readOnly
                      className="font-mono text-sm bg-muted"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(incomingWebhookUrl, "incoming")}
                    >
                      {copiedField === "incoming" ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Configure esta URL como destino HTTP Request no N8N para enviar mensagens ao agente.
                  </p>
                </div>

                <Separator />

                {/* N8N Webhook URL */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="n8n_webhook_url">URL do Webhook N8N</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="w-4 h-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Cole aqui a URL do webhook do seu workflow N8N. O agente enviará as respostas para esta URL.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="n8n_webhook_url"
                    placeholder="https://seu-n8n.com/webhook/..."
                    value={config.n8n_webhook_url}
                    onChange={(e) => setConfig({ ...config, n8n_webhook_url: e.target.value })}
                  />
                </div>

                {/* N8N API Key */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="n8n_api_key">Chave de API N8N (opcional)</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="w-4 h-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Se seu webhook N8N requer autenticação, insira a chave de API aqui.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      id="n8n_api_key"
                      type={showApiKey ? "text" : "password"}
                      placeholder="Chave de API (se necessário)"
                      value={config.n8n_api_key}
                      onChange={(e) => setConfig({ ...config, n8n_api_key: e.target.value })}
                    />
                    <Button
                      variant="outline"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? "Ocultar" : "Mostrar"}
                    </Button>
                  </div>
                </div>

                {/* Test Connection */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-lg bg-muted/50">
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Testar Conexão</p>
                    <p className="text-sm text-muted-foreground">
                      Envie um payload de teste para verificar se o N8N está recebendo corretamente.
                    </p>
                  </div>
                  <Button
                    onClick={handleTestConnection}
                    disabled={isTesting || !config.n8n_webhook_url}
                    className="gap-2"
                  >
                    {isTesting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Testando...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        Testar
                      </>
                    )}
                  </Button>
                </div>

                {testResult && (
                  <Alert variant={testResult.success ? "default" : "destructive"}>
                    {testResult.success ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                    <AlertDescription>{testResult.message}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Agent Tab */}
          <TabsContent value="agent" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-primary" />
                  Personalização do Agente
                </CardTitle>
                <CardDescription>
                  Configure como seu assistente virtual se comporta e responde aos clientes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Agent Name */}
                <div className="space-y-2">
                  <Label htmlFor="agent_name">Nome do Agente</Label>
                  <Input
                    id="agent_name"
                    placeholder="Ex: Assistente Virtual, Secretária Ana..."
                    value={config.agent_name}
                    onChange={(e) => setConfig({ ...config, agent_name: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    O nome que o agente usará para se apresentar aos clientes.
                  </p>
                </div>

                {/* Greeting Message */}
                <div className="space-y-2">
                  <Label htmlFor="agent_greeting">Mensagem de Boas-vindas</Label>
                  <Textarea
                    id="agent_greeting"
                    placeholder="Olá! Sou o assistente virtual..."
                    value={config.agent_greeting}
                    onChange={(e) => setConfig({ ...config, agent_greeting: e.target.value })}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    Primeira mensagem enviada quando um cliente inicia uma conversa.
                  </p>
                </div>

                {/* Agent Instructions */}
                <div className="space-y-2">
                  <Label htmlFor="agent_instructions">Instruções do Agente (Prompt)</Label>
                  <Textarea
                    id="agent_instructions"
                    placeholder="Você é um assistente virtual de agendamento..."
                    value={config.agent_instructions}
                    onChange={(e) => setConfig({ ...config, agent_instructions: e.target.value })}
                    rows={6}
                  />
                  <p className="text-xs text-muted-foreground">
                    Instruções detalhadas sobre como o agente deve se comportar, responder e ajudar os clientes.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings2 className="w-5 h-5 text-primary" />
                  Configurações do Agendamento
                </CardTitle>
                <CardDescription>
                  Defina como o agente deve gerenciar os agendamentos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Auto Confirm */}
                <div className="flex items-center justify-between p-4 rounded-lg border border-border/50">
                  <div className="space-y-0.5">
                    <Label className="text-base">Confirmar agendamentos automaticamente</Label>
                    <p className="text-sm text-muted-foreground">
                      Quando ativado, o agente confirma o agendamento sem necessidade de aprovação manual.
                    </p>
                  </div>
                  <Switch
                    checked={config.auto_confirm_appointments}
                    onCheckedChange={(checked) => setConfig({ ...config, auto_confirm_appointments: checked })}
                  />
                </div>

                {/* Send Confirmation */}
                <div className="flex items-center justify-between p-4 rounded-lg border border-border/50">
                  <div className="space-y-0.5">
                    <Label className="text-base">Enviar mensagem de confirmação</Label>
                    <p className="text-sm text-muted-foreground">
                      Envia uma mensagem para o cliente confirmando o agendamento realizado.
                    </p>
                  </div>
                  <Switch
                    checked={config.send_confirmation_message}
                    onCheckedChange={(checked) => setConfig({ ...config, send_confirmation_message: checked })}
                  />
                </div>

                {/* Working Hours Only */}
                <div className="flex items-center justify-between p-4 rounded-lg border border-border/50">
                  <div className="space-y-0.5">
                    <Label className="text-base">Agendar apenas em horários disponíveis</Label>
                    <p className="text-sm text-muted-foreground">
                      O agente só oferece horários que estão configurados como disponíveis.
                    </p>
                  </div>
                  <Switch
                    checked={config.working_hours_only}
                    onCheckedChange={(checked) => setConfig({ ...config, working_hours_only: checked })}
                  />
                </div>

                {/* Activate Agent */}
                <Separator />
                <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="space-y-0.5">
                    <Label className="text-base font-semibold">Ativar Agente IA</Label>
                    <p className="text-sm text-muted-foreground">
                      Quando ativado, o agente começará a responder automaticamente.
                    </p>
                  </div>
                  <Switch
                    checked={config.is_active}
                    onCheckedChange={(checked) => setConfig({ ...config, is_active: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Salvar Configurações
              </>
            )}
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default AISchedulingPage;
