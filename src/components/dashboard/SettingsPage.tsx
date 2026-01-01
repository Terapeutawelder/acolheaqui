import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  Copy, 
  Save, 
  Loader2, 
  Check,
  Key,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingsPageProps {
  profileId: string;
}

interface GatewayConfig {
  id?: string;
  gateway_type: string;
  is_active: boolean;
  pix_key?: string;
  pix_key_type?: string;
  card_api_key?: string;
  card_gateway?: string;
}

type GatewayType = "mercadopago" | "pushinpay";

const gateways = [
  {
    id: "mercadopago" as GatewayType,
    name: "Mercado Pago",
    description: "Cartão, Boleto e Pix",
    logo: "https://logospng.org/download/mercado-pago/logo-mercado-pago-icone-1024.png",
    color: "border-sky-500",
    bgColor: "bg-sky-50",
  },
  {
    id: "pushinpay" as GatewayType,
    name: "PushinPay",
    description: "Pix Instantâneo",
    logo: "https://pushinpay.com.br/wp-content/uploads/2024/01/cropped-favicon-pushinpay.png",
    color: "border-primary",
    bgColor: "bg-primary/5",
  },
];

const SettingsPage = ({ profileId }: SettingsPageProps) => {
  const [selectedGateway, setSelectedGateway] = useState<GatewayType>("mercadopago");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [mercadoPagoConfig, setMercadoPagoConfig] = useState({
    publicKey: "",
    accessToken: "",
  });
  
  const [pushinPayConfig, setPushinPayConfig] = useState({
    apiKey: "",
  });

  const [gatewayData, setGatewayData] = useState<GatewayConfig | null>(null);

  const webhookUrl = `https://dctapmbdsfmzhtbpgigc.supabase.co/functions/v1/payment-webhook`;

  useEffect(() => {
    fetchGatewayConfig();
  }, [profileId]);

  const fetchGatewayConfig = async () => {
    try {
      const { data, error } = await supabase
        .from("payment_gateways")
        .select("*")
        .eq("professional_id", profileId)
        .eq("is_active", true)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setGatewayData(data);
        
        if (data.card_gateway === "mercadopago" || data.gateway_type === "mercadopago") {
          setSelectedGateway("mercadopago");
          // Parse the stored config if it exists
          const apiKey = data.card_api_key || "";
          const parts = apiKey.split("|");
          setMercadoPagoConfig({
            publicKey: parts[0] || "",
            accessToken: parts[1] || "",
          });
        } else if (data.card_gateway === "pushinpay" || data.gateway_type === "pushinpay") {
          setSelectedGateway("pushinpay");
          setPushinPayConfig({
            apiKey: data.card_api_key || "",
          });
        }
      }
    } catch (error) {
      console.error("Error fetching gateway config:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyWebhook = async () => {
    await navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    toast.success("URL do Webhook copiada!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      let apiKey = "";
      
      if (selectedGateway === "mercadopago") {
        if (!mercadoPagoConfig.publicKey || !mercadoPagoConfig.accessToken) {
          toast.error("Preencha todas as credenciais do Mercado Pago");
          setIsSaving(false);
          return;
        }
        apiKey = `${mercadoPagoConfig.publicKey}|${mercadoPagoConfig.accessToken}`;
      } else {
        if (!pushinPayConfig.apiKey) {
          toast.error("Preencha a API Key da PushinPay");
          setIsSaving(false);
          return;
        }
        apiKey = pushinPayConfig.apiKey;
      }

      const payload = {
        professional_id: profileId,
        gateway_type: selectedGateway,
        card_gateway: selectedGateway,
        card_api_key: apiKey,
        is_active: true,
      };

      if (gatewayData?.id) {
        const { error } = await supabase
          .from("payment_gateways")
          .update(payload)
          .eq("id", gatewayData.id);
        
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("payment_gateways")
          .insert(payload)
          .select()
          .single();
        
        if (error) throw error;
        setGatewayData(data);
      }

      toast.success("Configurações salvas com sucesso!");
    } catch (error: any) {
      console.error("Error saving gateway config:", error);
      toast.error("Erro ao salvar configurações");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const selectedGatewayInfo = gateways.find(g => g.id === selectedGateway);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Gateways de Pagamento</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie suas chaves de API e métodos de recebimento.
        </p>
      </div>

      {/* Gateway Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {gateways.map((gateway) => (
          <Card
            key={gateway.id}
            className={cn(
              "cursor-pointer transition-all duration-200 hover:shadow-md relative overflow-hidden",
              selectedGateway === gateway.id
                ? `border-2 ${gateway.color} ${gateway.bgColor}`
                : "border-border hover:border-muted-foreground/30"
            )}
            onClick={() => setSelectedGateway(gateway.id)}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-border/50 flex items-center justify-center p-2">
                    <img 
                      src={gateway.logo} 
                      alt={gateway.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{gateway.name}</h3>
                    <p className="text-sm text-muted-foreground">{gateway.description}</p>
                  </div>
                </div>
                
                {/* Selection indicator */}
                <div className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                  selectedGateway === gateway.id
                    ? "border-primary bg-primary"
                    : "border-muted-foreground/30"
                )}>
                  {selectedGateway === gateway.id && (
                    <Check className="w-3 h-3 text-primary-foreground" />
                  )}
                </div>
              </div>
              
              {/* Configure link */}
              <button 
                className={cn(
                  "mt-4 text-sm font-medium flex items-center gap-1 transition-colors",
                  selectedGateway === gateway.id 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Configurar <span className="text-lg">›</span>
              </button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Credentials Form */}
      <Card className="border-border bg-card">
        <CardContent className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              selectedGateway === "mercadopago" ? "bg-sky-100" : "bg-primary/10"
            )}>
              <Key className={cn(
                "w-5 h-5",
                selectedGateway === "mercadopago" ? "text-sky-600" : "text-primary"
              )} />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                Credenciais {selectedGatewayInfo?.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                Insira suas chaves de produção (Live Keys).
              </p>
            </div>
          </div>

          {/* Mercado Pago Fields */}
          {selectedGateway === "mercadopago" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="publicKey" className="text-sm font-medium text-foreground">
                  Public Key
                </Label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="publicKey"
                    type="text"
                    placeholder="APP_USR-xxxxxxxx..."
                    value={mercadoPagoConfig.publicKey}
                    onChange={(e) => setMercadoPagoConfig(prev => ({ ...prev, publicKey: e.target.value }))}
                    className="pl-10 bg-muted/50 border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="accessToken" className="text-sm font-medium text-foreground">
                  Access Token
                </Label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="accessToken"
                    type="password"
                    placeholder="APP_USR-xxxxxxxx..."
                    value={mercadoPagoConfig.accessToken}
                    onChange={(e) => setMercadoPagoConfig(prev => ({ ...prev, accessToken: e.target.value }))}
                    className="pl-10 bg-muted/50 border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>
            </div>
          )}

          {/* PushinPay Fields */}
          {selectedGateway === "pushinpay" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey" className="text-sm font-medium text-foreground">
                  API Key
                </Label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="apiKey"
                    type="password"
                    placeholder="pk_live_xxxxxxxx..."
                    value={pushinPayConfig.apiKey}
                    onChange={(e) => setPushinPayConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                    className="pl-10 bg-muted/50 border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Webhook URL */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-foreground">
                Webhook URL
              </Label>
              <span className="text-xs text-muted-foreground">Para notificações automáticas</span>
              <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">
                POST
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <Zap className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <code className="text-sm text-emerald-600 truncate font-mono">
                  {webhookUrl}
                </code>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyWebhook}
                className="flex-shrink-0 gap-2"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                Copiar
              </Button>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="gap-2 px-6"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Salvar Alterações
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
