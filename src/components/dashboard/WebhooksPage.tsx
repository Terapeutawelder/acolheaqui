import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Webhook, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  Loader2,
  Copy,
  ExternalLink
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface WebhooksPageProps {
  profileId: string;
}

interface WebhookConfig {
  id: string;
  url: string;
  secret_token: string | null;
  is_active: boolean;
  events: string[];
  created_at: string;
}

// Event categories matching the reference image
const eventCategories = {
  pagamentos: {
    label: "Pagamentos",
    events: [
      { id: "pix_gerado", label: "PIX Gerado" },
      { id: "pix_expirado", label: "PIX Expirado" },
      { id: "boleto_gerado", label: "Boleto Gerado" },
      { id: "boleto_expirado", label: "Boleto Expirado" },
      { id: "reembolsado", label: "Reembolsado" },
      { id: "pix_aprovado", label: "PIX Aprovado" },
      { id: "cartao_aprovado", label: "Cartão Aprovado" },
      { id: "boleto_pago", label: "Boleto Pago" },
      { id: "compra_recusada", label: "Compra Recusada" },
      { id: "chargeback", label: "Chargeback" },
    ],
  },
  assinaturas: {
    label: "Assinaturas",
    events: [
      { id: "assinatura_criada", label: "Assinatura Criada" },
      { id: "assinatura_cancelada", label: "Assinatura Cancelada" },
      { id: "pagamento_falhou", label: "Pagamento Falhou" },
      { id: "assinatura_renovada", label: "Assinatura Renovada" },
      { id: "assinatura_ativada", label: "Assinatura Ativada" },
    ],
  },
  entrega: {
    label: "Entrega (Produtos Físicos)",
    events: [
      { id: "postado", label: "Postado" },
      { id: "saiu_entrega", label: "Saiu para Entrega" },
      { id: "entrega_falhou", label: "Entrega Falhou" },
      { id: "em_transito", label: "Em Trânsito" },
      { id: "entregue", label: "Entregue" },
      { id: "devolvido", label: "Devolvido" },
    ],
  },
  acesso: {
    label: "Acesso (Produtos Digitais)",
    events: [
      { id: "acesso_liberado", label: "Acesso Liberado" },
      { id: "acesso_revogado", label: "Acesso Revogado" },
    ],
  },
  carrinho: {
    label: "Carrinho",
    events: [
      { id: "carrinho_abandonado", label: "Carrinho Abandonado" },
    ],
  },
  agendamentos: {
    label: "Agendamentos",
    events: [
      { id: "agendamento_criado", label: "Agendamento Criado" },
      { id: "agendamento_confirmado", label: "Agendamento Confirmado" },
      { id: "agendamento_cancelado", label: "Agendamento Cancelado" },
      { id: "agendamento_reagendado", label: "Agendamento Reagendado" },
      { id: "lembrete_enviado", label: "Lembrete Enviado" },
    ],
  },
};

const WebhooksPage = ({ profileId }: WebhooksPageProps) => {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSecretToken, setShowSecretToken] = useState(false);
  
  // Form state
  const [webhookUrl, setWebhookUrl] = useState("");
  const [secretToken, setSecretToken] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);

  useEffect(() => {
    fetchWebhooks();
  }, [profileId]);

  const fetchWebhooks = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("webhooks")
        .select("*")
        .eq("professional_id", profileId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      setWebhooks(data?.map(w => ({
        ...w,
        events: Array.isArray(w.events) ? (w.events as string[]) : []
      })) || []);
    } catch (error) {
      console.error("Error fetching webhooks:", error);
      toast.error("Erro ao carregar webhooks");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEventToggle = (eventId: string) => {
    setSelectedEvents(prev => 
      prev.includes(eventId) 
        ? prev.filter(e => e !== eventId)
        : [...prev, eventId]
    );
  };

  const handleCreateWebhook = async () => {
    if (!webhookUrl) {
      toast.error("Informe a URL do webhook");
      return;
    }

    if (selectedEvents.length === 0) {
      toast.error("Selecione pelo menos um evento");
      return;
    }

    // Validate URL format
    try {
      new URL(webhookUrl);
    } catch {
      toast.error("URL inválida");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.from("webhooks").insert({
        professional_id: profileId,
        url: webhookUrl,
        secret_token: secretToken || null,
        events: selectedEvents,
        is_active: true,
      });

      if (error) throw error;

      toast.success("Webhook criado com sucesso!");
      setWebhookUrl("");
      setSecretToken("");
      setSelectedEvents([]);
      fetchWebhooks();
    } catch (error) {
      console.error("Error creating webhook:", error);
      toast.error("Erro ao criar webhook");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (webhookId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("webhooks")
        .update({ is_active: !currentStatus })
        .eq("id", webhookId);

      if (error) throw error;

      setWebhooks(prev => 
        prev.map(w => w.id === webhookId ? { ...w, is_active: !currentStatus } : w)
      );
      toast.success(currentStatus ? "Webhook desativado" : "Webhook ativado");
    } catch (error) {
      console.error("Error toggling webhook:", error);
      toast.error("Erro ao atualizar webhook");
    }
  };

  const handleDeleteWebhook = async (webhookId: string) => {
    try {
      const { error } = await supabase
        .from("webhooks")
        .delete()
        .eq("id", webhookId);

      if (error) throw error;

      setWebhooks(prev => prev.filter(w => w.id !== webhookId));
      toast.success("Webhook excluído com sucesso");
    } catch (error) {
      console.error("Error deleting webhook:", error);
      toast.error("Erro ao excluir webhook");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado para a área de transferência");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create Webhook Card */}
      <Card className="bg-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Webhook className="h-5 w-5 text-primary" />
            Criar Webhook Personalizado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* URL Input */}
          <div className="space-y-2">
            <Label htmlFor="webhook-url">URL do Webhook</Label>
            <Input
              id="webhook-url"
              type="url"
              placeholder="https://seu-servidor.com/webhook"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="bg-muted/50"
            />
          </div>

          {/* Events Selection */}
          <div className="space-y-4">
            <Label>Eventos para Receber</Label>
            
            <div className="grid gap-6">
              {Object.entries(eventCategories).map(([categoryKey, category]) => (
                <div key={categoryKey}>
                  <p className="text-sm font-medium text-muted-foreground mb-3">
                    {category.label}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {category.events.map((event) => (
                      <div 
                        key={event.id} 
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={event.id}
                          checked={selectedEvents.includes(event.id)}
                          onCheckedChange={() => handleEventToggle(event.id)}
                          className="border-primary/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <Label 
                          htmlFor={event.id} 
                          className="text-sm text-foreground cursor-pointer"
                        >
                          {event.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Secret Token */}
          <div className="space-y-2">
            <Label htmlFor="secret-token">Secret Token (Opcional)</Label>
            <div className="relative">
              <Input
                id="secret-token"
                type={showSecretToken ? "text" : "password"}
                placeholder="••••••••••"
                value={secretToken}
                onChange={(e) => setSecretToken(e.target.value)}
                className="bg-muted/50 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowSecretToken(!showSecretToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showSecretToken ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              O token será enviado no header X-Webhook-Secret de cada requisição
            </p>
          </div>

          {/* Create Button */}
          <Button 
            onClick={handleCreateWebhook}
            disabled={isSaving}
            className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            Criar Webhook
          </Button>
        </CardContent>
      </Card>

      {/* Configured Webhooks List */}
      <Card className="bg-card border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">
            Webhooks Configurados ({webhooks.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {webhooks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Webhook className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum webhook configurado</p>
              <p className="text-sm">Crie seu primeiro webhook acima</p>
            </div>
          ) : (
            <div className="space-y-4">
              {webhooks.map((webhook) => (
                <div 
                  key={webhook.id}
                  className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge 
                          variant={webhook.is_active ? "default" : "secondary"}
                          className={webhook.is_active ? "bg-green-500/20 text-green-500" : ""}
                        >
                          {webhook.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(webhook.created_at).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-mono truncate text-foreground">
                          {webhook.url}
                        </p>
                        <button 
                          onClick={() => copyToClipboard(webhook.url)}
                          className="text-muted-foreground hover:text-foreground shrink-0"
                        >
                          <Copy size={14} />
                        </button>
                        <a 
                          href={webhook.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground shrink-0"
                        >
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={webhook.is_active}
                        onCheckedChange={() => handleToggleActive(webhook.id, webhook.is_active)}
                      />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                            <Trash2 size={18} />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir Webhook</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir este webhook? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteWebhook(webhook.id)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  
                  {/* Events */}
                  <div className="flex flex-wrap gap-1.5">
                    {webhook.events.map((eventId) => {
                      const allEvents = Object.values(eventCategories).flatMap(c => c.events);
                      const event = allEvents.find(e => e.id === eventId);
                      return (
                        <Badge key={eventId} variant="outline" className="text-xs">
                          {event?.label || eventId}
                        </Badge>
                      );
                    })}
                  </div>

                  {/* Secret Token indicator */}
                  {webhook.secret_token && (
                    <p className="text-xs text-muted-foreground">
                      🔒 Secret Token configurado
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WebhooksPage;
