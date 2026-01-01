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

type GatewayType = "mercadopago" | "pushinpay" | "pagarme" | "pagseguro" | "stripe";

interface GatewayInfo {
  id: GatewayType;
  name: string;
  description: string;
  logo: string;
  color: string;
  bgColor: string;
  fields: { key: string; label: string; placeholder: string; type: string }[];
}

const gateways: GatewayInfo[] = [
  {
    id: "mercadopago",
    name: "Mercado Pago",
    description: "Cartão, Boleto e Pix",
    logo: "https://http2.mlstatic.com/frontend-assets/mp-web-navigation/ui-navigation/6.6.92/mercadopago/logo__large@2x.png",
    color: "border-primary",
    bgColor: "bg-primary/10",
    fields: [
      { key: "publicKey", label: "Public Key", placeholder: "APP_USR-xxxxxxxx...", type: "text" },
      { key: "accessToken", label: "Access Token", placeholder: "APP_USR-xxxxxxxx...", type: "password" },
    ],
  },
  {
    id: "pushinpay",
    name: "PushinPay",
    description: "Pix Instantâneo",
    logo: "https://pushinpay.com.br/wp-content/uploads/2024/01/pushinpay-horizontal-1-1024x283.png",
    color: "border-primary",
    bgColor: "bg-primary/10",
    fields: [
      { key: "apiKey", label: "API Key", placeholder: "pk_live_xxxxxxxx...", type: "password" },
    ],
  },
  {
    id: "pagarme",
    name: "Pagar.me",
    description: "Cartão, Boleto e Pix",
    logo: "https://assets.pagar.me/landings/general/images/logos/logo-pagarme.svg",
    color: "border-primary",
    bgColor: "bg-primary/10",
    fields: [
      { key: "apiKey", label: "API Key", placeholder: "ak_live_xxxxxxxx...", type: "password" },
      { key: "encryptionKey", label: "Encryption Key", placeholder: "ek_live_xxxxxxxx...", type: "password" },
    ],
  },
  {
    id: "pagseguro",
    name: "PagSeguro",
    description: "Cartão, Boleto e Pix",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/PagSeguro.svg/1200px-PagSeguro.svg.png",
    color: "border-primary",
    bgColor: "bg-primary/10",
    fields: [
      { key: "email", label: "E-mail", placeholder: "seu-email@pagseguro.com", type: "email" },
      { key: "token", label: "Token", placeholder: "TOKEN-PAGSEGURO-xxxxxxxx...", type: "password" },
    ],
  },
  {
    id: "stripe",
    name: "Stripe",
    description: "Cartão e Apple/Google Pay",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Stripe_Logo%2C_revised_2016.svg/2560px-Stripe_Logo%2C_revised_2016.svg.png",
    color: "border-primary",
    bgColor: "bg-primary/10",
    fields: [
      { key: "publishableKey", label: "Publishable Key", placeholder: "pk_live_xxxxxxxx...", type: "text" },
      { key: "secretKey", label: "Secret Key", placeholder: "sk_live_xxxxxxxx...", type: "password" },
    ],
  },
];

const SettingsPage = ({ profileId }: SettingsPageProps) => {
  const [selectedGateway, setSelectedGateway] = useState<GatewayType>("mercadopago");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Dynamic config state for all gateways
  const [gatewayConfigs, setGatewayConfigs] = useState<Record<string, Record<string, string>>>({
    mercadopago: { publicKey: "", accessToken: "" },
    pushinpay: { apiKey: "" },
    pagarme: { apiKey: "", encryptionKey: "" },
    pagseguro: { email: "", token: "" },
    stripe: { publishableKey: "", secretKey: "" },
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
        const gatewayType = (data.card_gateway || data.gateway_type) as GatewayType;
        
        if (gatewayType && gateways.find(g => g.id === gatewayType)) {
          setSelectedGateway(gatewayType);
          
          // Parse stored config
          const apiKey = data.card_api_key || "";
          const parts = apiKey.split("|");
          const gatewayInfo = gateways.find(g => g.id === gatewayType);
          
          if (gatewayInfo) {
            const config: Record<string, string> = {};
            gatewayInfo.fields.forEach((field, index) => {
              config[field.key] = parts[index] || "";
            });
            setGatewayConfigs(prev => ({ ...prev, [gatewayType]: config }));
          }
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

  const updateGatewayConfig = (gateway: GatewayType, key: string, value: string) => {
    setGatewayConfigs(prev => ({
      ...prev,
      [gateway]: { ...prev[gateway], [key]: value }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      const gatewayInfo = gateways.find(g => g.id === selectedGateway);
      if (!gatewayInfo) {
        toast.error("Gateway inválido");
        setIsSaving(false);
        return;
      }

      const currentConfig = gatewayConfigs[selectedGateway];
      
      // Validate all fields are filled
      const emptyFields = gatewayInfo.fields.filter(f => !currentConfig[f.key]?.trim());
      if (emptyFields.length > 0) {
        toast.error(`Preencha todos os campos: ${emptyFields.map(f => f.label).join(", ")}`);
        setIsSaving(false);
        return;
      }

      // Join all field values with |
      const apiKey = gatewayInfo.fields.map(f => currentConfig[f.key]).join("|");

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

  const getIconBgColor = () => "bg-primary/10";

  const getIconColor = () => "text-primary";

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Gateways de Pagamento</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie suas chaves de API e métodos de recebimento.
        </p>
      </div>

      {/* Gateway Selection - Grid with more items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-border/50 flex items-center justify-center p-2">
                    <img 
                      src={gateway.logo} 
                      alt={gateway.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">{gateway.name}</h3>
                    <p className="text-xs text-muted-foreground">{gateway.description}</p>
                  </div>
                </div>
                
                {/* Selection indicator */}
                <div className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0",
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
                  "mt-3 text-xs font-medium flex items-center gap-1 transition-colors",
                  selectedGateway === gateway.id 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Configurar <span className="text-sm">›</span>
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
              getIconBgColor()
            )}>
              <Key className={cn("w-5 h-5", getIconColor())} />
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

          {/* Dynamic Fields based on selected gateway */}
          <div className="space-y-4">
            {selectedGatewayInfo?.fields.map((field) => (
              <div key={field.key} className="space-y-2">
                <Label htmlFor={field.key} className="text-sm font-medium text-foreground">
                  {field.label}
                </Label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id={field.key}
                    type={field.type}
                    placeholder={field.placeholder}
                    value={gatewayConfigs[selectedGateway]?.[field.key] || ""}
                    onChange={(e) => updateGatewayConfig(selectedGateway, field.key, e.target.value)}
                    className="pl-10 bg-muted/50 border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>
            ))}
          </div>

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
