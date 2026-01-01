import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Palette, 
  Image, 
  Clock, 
  Bell, 
  BarChart3, 
  CreditCard,
  User,
  Save,
  Loader2,
  ChevronLeft,
  Eye,
  Settings2,
  Megaphone,
  Tag,
  Link,
  ShieldCheck
} from "lucide-react";
import CheckoutPreview from "./CheckoutPreview";
import OrderBumpsConfig from "./OrderBumpsConfig";

interface CheckoutEditorPageProps {
  profileId: string;
  serviceId: string;
  onBack: () => void;
}

interface CheckoutConfig {
  backgroundColor: string;
  accentColor: string;
  header: {
    enabled: boolean;
    title: string;
    subtitle: string;
  };
  timer: {
    enabled: boolean;
    minutes: number;
    text: string;
    bgcolor: string;
    textcolor: string;
    sticky: boolean;
  };
  salesNotification: {
    enabled: boolean;
    names: string;
    product: string;
    tempo_exibicao: number;
    intervalo_notificacao: number;
  };
  tracking: {
    facebookPixelId: string;
    googleAnalyticsId: string;
    googleAdsId: string;
  };
  paymentMethods: {
    credit_card: boolean;
    pix: boolean;
    boleto: boolean;
  };
  customerFields: {
    enable_cpf: boolean;
    enable_phone: boolean;
  };
  redirectUrl: string;
  summary: {
    product_name: string;
    discount_text: string;
  };
}

interface Service {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price_cents: number;
  is_active: boolean;
}

const defaultConfig: CheckoutConfig = {
  backgroundColor: "#f3f4f6",
  accentColor: "#8B5CF6",
  header: {
    enabled: true,
    title: "Finalize sua Compra",
    subtitle: "Ambiente 100% seguro",
  },
  timer: {
    enabled: false,
    minutes: 15,
    text: "Esta oferta expira em:",
    bgcolor: "#000000",
    textcolor: "#FFFFFF",
    sticky: true,
  },
  salesNotification: {
    enabled: false,
    names: "",
    product: "",
    tempo_exibicao: 5,
    intervalo_notificacao: 10,
  },
  tracking: {
    facebookPixelId: "",
    googleAnalyticsId: "",
    googleAdsId: "",
  },
  paymentMethods: {
    credit_card: true,
    pix: true,
    boleto: false,
  },
  customerFields: {
    enable_cpf: true,
    enable_phone: true,
  },
  redirectUrl: "",
  summary: {
    product_name: "",
    discount_text: "",
  },
};

const CheckoutEditorPage = ({ profileId, serviceId, onBack }: CheckoutEditorPageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [service, setService] = useState<Service | null>(null);
  const [config, setConfig] = useState<CheckoutConfig>(defaultConfig);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchService();
  }, [serviceId]);

  const fetchService = async () => {
    try {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("id", serviceId)
        .single();

      if (error) throw error;

      setService(data);
      // Se existir checkout_config no serviço, carrega (futuro campo)
    } catch (error) {
      console.error("Error fetching service:", error);
      toast.error("Erro ao carregar serviço");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Aqui futuramente vamos salvar o config no banco
      // Por enquanto simula salvamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Configurações salvas com sucesso!");
    } catch (error) {
      console.error("Error saving config:", error);
      toast.error("Erro ao salvar configurações");
    } finally {
      setIsSaving(false);
    }
  };

  const updateConfig = <K extends keyof CheckoutConfig>(
    key: K,
    value: CheckoutConfig[K]
  ) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const updateNestedConfig = <K extends keyof CheckoutConfig>(
    key: K,
    nestedKey: keyof CheckoutConfig[K],
    value: any
  ) => {
    setConfig(prev => ({
      ...prev,
      [key]: {
        ...(prev[key] as object),
        [nestedKey]: value,
      },
    }));
  };

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Serviço não encontrado</p>
        <Button onClick={onBack} variant="outline" className="mt-4">
          <ChevronLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Editor de Checkout</h1>
            <p className="text-muted-foreground text-sm">
              {service.name} • {formatPrice(service.price_cents)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
            className="border-border/50"
          >
            <Eye className="h-4 w-4 mr-2" />
            {showPreview ? "Ocultar Preview" : "Ver Preview"}
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </>
            )}
          </Button>
        </div>
      </div>

      <div className={`grid gap-6 ${showPreview ? "lg:grid-cols-2" : "grid-cols-1"}`}>
        {/* Editor Panel */}
        <div className="space-y-6">
          <Tabs defaultValue="appearance" className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-card border border-border/50">
              <TabsTrigger value="appearance" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Palette className="h-4 w-4 mr-1" />
                Visual
              </TabsTrigger>
              <TabsTrigger value="urgency" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Clock className="h-4 w-4 mr-1" />
                Urgência
              </TabsTrigger>
              <TabsTrigger value="orderbumps" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Tag className="h-4 w-4 mr-1" />
                Ofertas
              </TabsTrigger>
              <TabsTrigger value="tracking" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <BarChart3 className="h-4 w-4 mr-1" />
                Tracking
              </TabsTrigger>
              <TabsTrigger value="payment" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <CreditCard className="h-4 w-4 mr-1" />
                Pagamento
              </TabsTrigger>
            </TabsList>

            {/* APARÊNCIA */}
            <TabsContent value="appearance" className="mt-6 space-y-6">
              <Card className="bg-card border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Palette className="h-5 w-5 text-primary" />
                    Cores do Checkout
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Cor de Fundo</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={config.backgroundColor}
                          onChange={e => updateConfig("backgroundColor", e.target.value)}
                          className="w-12 h-10 rounded cursor-pointer border border-border"
                        />
                        <Input
                          value={config.backgroundColor}
                          onChange={e => updateConfig("backgroundColor", e.target.value)}
                          className="bg-background border-border/50"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Cor de Destaque</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={config.accentColor}
                          onChange={e => updateConfig("accentColor", e.target.value)}
                          className="w-12 h-10 rounded cursor-pointer border border-border"
                        />
                        <Input
                          value={config.accentColor}
                          onChange={e => updateConfig("accentColor", e.target.value)}
                          className="bg-background border-border/50"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Settings2 className="h-5 w-5 text-primary" />
                        Cabeçalho
                      </CardTitle>
                      <CardDescription>Título e subtítulo do checkout</CardDescription>
                    </div>
                    <Switch
                      checked={config.header.enabled}
                      onCheckedChange={v => updateNestedConfig("header", "enabled", v)}
                    />
                  </div>
                </CardHeader>
                {config.header.enabled && (
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Título Principal</Label>
                      <Input
                        value={config.header.title}
                        onChange={e => updateNestedConfig("header", "title", e.target.value)}
                        placeholder="Finalize sua Compra"
                        className="bg-background border-border/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Subtítulo</Label>
                      <Input
                        value={config.header.subtitle}
                        onChange={e => updateNestedConfig("header", "subtitle", e.target.value)}
                        placeholder="Ambiente 100% seguro"
                        className="bg-background border-border/50"
                      />
                    </div>
                  </CardContent>
                )}
              </Card>

              <Card className="bg-card border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Tag className="h-5 w-5 text-primary" />
                    Resumo da Compra
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nome do Produto no Checkout</Label>
                    <Input
                      value={config.summary.product_name}
                      onChange={e => updateNestedConfig("summary", "product_name", e.target.value)}
                      placeholder={service.name}
                      className="bg-background border-border/50"
                    />
                    <p className="text-xs text-muted-foreground">Por padrão, usa o nome original do serviço.</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Texto de Desconto (Opcional)</Label>
                    <Input
                      value={config.summary.discount_text}
                      onChange={e => updateNestedConfig("summary", "discount_text", e.target.value)}
                      placeholder="Ex: 30% OFF"
                      className="bg-background border-border/50"
                    />
                    <p className="text-xs text-muted-foreground">Exibido como selo de destaque.</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Campos do Cliente
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Exibir campo CPF</p>
                      <p className="text-sm text-muted-foreground">Solicitar CPF do cliente</p>
                    </div>
                    <Switch
                      checked={config.customerFields.enable_cpf}
                      onCheckedChange={v => updateNestedConfig("customerFields", "enable_cpf", v)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Exibir campo Telefone</p>
                      <p className="text-sm text-muted-foreground">Solicitar telefone do cliente</p>
                    </div>
                    <Switch
                      checked={config.customerFields.enable_phone}
                      onCheckedChange={v => updateNestedConfig("customerFields", "enable_phone", v)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* URGÊNCIA */}
            <TabsContent value="urgency" className="mt-6 space-y-6">
              <Card className="bg-card border-border/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary" />
                        Timer de Urgência
                      </CardTitle>
                      <CardDescription>Crie urgência com um contador regressivo</CardDescription>
                    </div>
                    <Switch
                      checked={config.timer.enabled}
                      onCheckedChange={v => updateNestedConfig("timer", "enabled", v)}
                    />
                  </div>
                </CardHeader>
                {config.timer.enabled && (
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Texto do Timer</Label>
                      <Input
                        value={config.timer.text}
                        onChange={e => updateNestedConfig("timer", "text", e.target.value)}
                        placeholder="Esta oferta expira em:"
                        className="bg-background border-border/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Duração (minutos)</Label>
                      <Input
                        type="number"
                        min={1}
                        max={60}
                        value={config.timer.minutes}
                        onChange={e => updateNestedConfig("timer", "minutes", parseInt(e.target.value) || 15)}
                        className="bg-background border-border/50"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Cor de Fundo</Label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={config.timer.bgcolor}
                            onChange={e => updateNestedConfig("timer", "bgcolor", e.target.value)}
                            className="w-10 h-8 rounded cursor-pointer border border-border"
                          />
                          <Input
                            value={config.timer.bgcolor}
                            onChange={e => updateNestedConfig("timer", "bgcolor", e.target.value)}
                            className="bg-background border-border/50"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Cor do Texto</Label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={config.timer.textcolor}
                            onChange={e => updateNestedConfig("timer", "textcolor", e.target.value)}
                            className="w-10 h-8 rounded cursor-pointer border border-border"
                          />
                          <Input
                            value={config.timer.textcolor}
                            onChange={e => updateNestedConfig("timer", "textcolor", e.target.value)}
                            className="bg-background border-border/50"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <p className="font-medium">Fixar no Topo</p>
                        <p className="text-sm text-muted-foreground">O timer acompanha a rolagem</p>
                      </div>
                      <Switch
                        checked={config.timer.sticky}
                        onCheckedChange={v => updateNestedConfig("timer", "sticky", v)}
                      />
                    </div>
                  </CardContent>
                )}
              </Card>

              <Card className="bg-card border-border/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Megaphone className="h-5 w-5 text-primary" />
                        Notificações de Vendas
                      </CardTitle>
                      <CardDescription>Mostre compras recentes como prova social</CardDescription>
                    </div>
                    <Switch
                      checked={config.salesNotification.enabled}
                      onCheckedChange={v => updateNestedConfig("salesNotification", "enabled", v)}
                    />
                  </div>
                </CardHeader>
                {config.salesNotification.enabled && (
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Nomes (separados por vírgula)</Label>
                      <Textarea
                        value={config.salesNotification.names}
                        onChange={e => updateNestedConfig("salesNotification", "names", e.target.value)}
                        placeholder="Maria, João, Ana, Pedro..."
                        className="bg-background border-border/50 resize-none"
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Nome do Produto (opcional)</Label>
                      <Input
                        value={config.salesNotification.product}
                        onChange={e => updateNestedConfig("salesNotification", "product", e.target.value)}
                        placeholder={service.name}
                        className="bg-background border-border/50"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Tempo de Exibição (s)</Label>
                        <Input
                          type="number"
                          min={1}
                          max={30}
                          value={config.salesNotification.tempo_exibicao}
                          onChange={e => updateNestedConfig("salesNotification", "tempo_exibicao", parseInt(e.target.value) || 5)}
                          className="bg-background border-border/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Intervalo (s)</Label>
                        <Input
                          type="number"
                          min={5}
                          max={60}
                          value={config.salesNotification.intervalo_notificacao}
                          onChange={e => updateNestedConfig("salesNotification", "intervalo_notificacao", parseInt(e.target.value) || 10)}
                          className="bg-background border-border/50"
                        />
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            </TabsContent>

            {/* ORDER BUMPS */}
            <TabsContent value="orderbumps" className="mt-6">
              <OrderBumpsConfig profileId={profileId} mainServiceId={serviceId} />
            </TabsContent>

            {/* TRACKING */}
            <TabsContent value="tracking" className="mt-6 space-y-6">
              <Card className="bg-card border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Rastreamento e Analytics
                  </CardTitle>
                  <CardDescription>Configure pixels e tags de rastreamento</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Facebook Pixel ID</Label>
                    <Input
                      value={config.tracking.facebookPixelId}
                      onChange={e => updateNestedConfig("tracking", "facebookPixelId", e.target.value)}
                      placeholder="Ex: 1234567890123456"
                      className="bg-background border-border/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Google Analytics ID</Label>
                    <Input
                      value={config.tracking.googleAnalyticsId}
                      onChange={e => updateNestedConfig("tracking", "googleAnalyticsId", e.target.value)}
                      placeholder="Ex: G-XXXXXXXXXX"
                      className="bg-background border-border/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Google Ads ID</Label>
                    <Input
                      value={config.tracking.googleAdsId}
                      onChange={e => updateNestedConfig("tracking", "googleAdsId", e.target.value)}
                      placeholder="Ex: AW-XXXXXXXXXX"
                      className="bg-background border-border/50"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Link className="h-5 w-5 text-primary" />
                    Redirecionamento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label>URL de Redirecionamento Pós-Compra</Label>
                    <Input
                      value={config.redirectUrl}
                      onChange={e => updateConfig("redirectUrl", e.target.value)}
                      placeholder="https://seusite.com/obrigado"
                      className="bg-background border-border/50"
                    />
                    <p className="text-xs text-muted-foreground">O cliente será redirecionado para esta URL após o pagamento.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* PAGAMENTO */}
            <TabsContent value="payment" className="mt-6 space-y-6">
              <Card className="bg-card border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    Métodos de Pagamento
                  </CardTitle>
                  <CardDescription>Selecione os métodos aceitos no checkout</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo%E2%80%94pix_powered_by_Banco_Central_%28Brazil%2C_2020%29.svg" className="h-5" alt="Pix" />
                      </div>
                      <div>
                        <p className="font-medium">Pix</p>
                        <p className="text-sm text-muted-foreground">Aprovação imediata</p>
                      </div>
                    </div>
                    <Switch
                      checked={config.paymentMethods.pix}
                      onCheckedChange={v => updateNestedConfig("paymentMethods", "pix", v)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="font-medium">Cartão de Crédito</p>
                        <p className="text-sm text-muted-foreground">Parcelamento disponível</p>
                      </div>
                    </div>
                    <Switch
                      checked={config.paymentMethods.credit_card}
                      onCheckedChange={v => updateNestedConfig("paymentMethods", "credit_card", v)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-500/10 flex items-center justify-center">
                        <ShieldCheck className="h-5 w-5 text-gray-500" />
                      </div>
                      <div>
                        <p className="font-medium">Boleto Bancário</p>
                        <p className="text-sm text-muted-foreground">Até 3 dias para compensar</p>
                      </div>
                    </div>
                    <Switch
                      checked={config.paymentMethods.boleto}
                      onCheckedChange={v => updateNestedConfig("paymentMethods", "boleto", v)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div className="lg:sticky lg:top-6">
            <CheckoutPreview
              config={config}
              service={service}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutEditorPage;
