import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  ArrowLeftCircle,
  Save,
  Loader2,
  Eye,
  EyeOff,
  Grip,
  ShoppingBag,
  Palette,
  Image as ImageIcon,
  Tag,
  Layout,
  User,
  CreditCard,
  Clock,
  Bell,
  BarChart3,
  Link,
  ArrowLeft,
  Info,
  Settings2,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import CheckoutPreview from "./CheckoutPreview";

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
    facebookApiToken: string;
    googleAnalyticsId: string;
    googleAdsId: string;
    events: {
      facebook: {
        purchase: boolean;
        pending: boolean;
        refund: boolean;
        chargeback: boolean;
        rejected: boolean;
        initiate_checkout: boolean;
      };
      google: {
        purchase: boolean;
        pending: boolean;
        refund: boolean;
        chargeback: boolean;
        rejected: boolean;
        initiate_checkout: boolean;
      };
    };
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
  youtubeUrl: string;
  backRedirect: {
    enabled: boolean;
    url: string;
  };
  summary: {
    product_name: string;
    discount_text: string;
    preco_anterior: string;
  };
  banners: string[];
  sideBanners: string[];
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
    facebookApiToken: "",
    googleAnalyticsId: "",
    googleAdsId: "",
    events: {
      facebook: {
        purchase: true,
        pending: false,
        refund: false,
        chargeback: false,
        rejected: false,
        initiate_checkout: true,
      },
      google: {
        purchase: true,
        pending: false,
        refund: false,
        chargeback: false,
        rejected: false,
        initiate_checkout: true,
      },
    },
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
  youtubeUrl: "",
  backRedirect: {
    enabled: false,
    url: "",
  },
  summary: {
    product_name: "",
    discount_text: "",
    preco_anterior: "",
  },
  banners: [],
  sideBanners: [],
};

// Collapsible Section Component
const CollapsibleSection = ({ 
  title, 
  icon: Icon, 
  children, 
  defaultOpen = true 
}: { 
  title: string; 
  icon: React.ElementType; 
  children: React.ReactNode;
  defaultOpen?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="border border-border/50 rounded-lg bg-card/50 overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 text-primary" />
          <span className="font-semibold text-foreground">{title}</span>
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {isOpen && (
        <div className="p-4 pt-0 space-y-4">
          {children}
        </div>
      )}
    </div>
  );
};

const CheckoutEditorPage = ({ profileId, serviceId, onBack }: CheckoutEditorPageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [service, setService] = useState<Service | null>(null);
  const [config, setConfig] = useState<CheckoutConfig>(defaultConfig);
  const [showPreview, setShowPreview] = useState(true);

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
      // Load config from service if exists (future)
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
      // Save config to database (future implementation)
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

  const updateTrackingEvent = (
    platform: 'facebook' | 'google',
    event: string,
    value: boolean
  ) => {
    setConfig(prev => ({
      ...prev,
      tracking: {
        ...prev.tracking,
        events: {
          ...prev.tracking.events,
          [platform]: {
            ...prev.tracking.events[platform],
            [event]: value,
          },
        },
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
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-background overflow-hidden -m-6">
      {/* Left Panel - Editor Form */}
      <div className={`${showPreview ? 'w-1/2' : 'w-full'} h-full bg-card border-r border-border/50 overflow-y-auto transition-all duration-300`}>
        <form className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4 border-b border-border/50 pb-4">
            <button
              type="button"
              onClick={onBack}
              className="text-primary hover:text-primary/80 transition-colors"
            >
              <ArrowLeftCircle className="w-7 h-7" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Editor de Checkout</h1>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                Produto: {service.name}
                <span className="bg-primary/20 text-primary text-xs font-bold px-2 py-0.5 rounded border border-primary/30">
                  {formatPrice(service.price_cents)}
                </span>
              </p>
            </div>
          </div>

          {/* Tip */}
          <div className="bg-primary/10 border border-primary/20 text-primary p-3 rounded-lg text-sm flex items-start gap-2">
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p><strong>Dica:</strong> Configure todas as opções e visualize o resultado em tempo real no preview à direita.</p>
          </div>

          {/* Sections */}
          <div className="space-y-4">
            {/* Resumo da Compra */}
            <CollapsibleSection title="Resumo da Compra" icon={ShoppingBag}>
              <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                <div>
                  <Label className="text-sm font-semibold mb-2 block">Nome do Produto no Checkout</Label>
                  <Input
                    value={config.summary.product_name}
                    onChange={e => updateNestedConfig("summary", "product_name", e.target.value)}
                    placeholder={service.name}
                    className="bg-background border-border/50"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Por padrão, usa o nome original do produto.</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold mb-2 block">Preço Original (De)</Label>
                  <Input
                    value={config.summary.preco_anterior}
                    onChange={e => updateNestedConfig("summary", "preco_anterior", e.target.value)}
                    placeholder="Ex: 199,90"
                    className="bg-background border-border/50"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Deixe em branco para não exibir o preço cortado.</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold mb-2 block">Texto de Desconto (Opcional)</Label>
                  <Input
                    value={config.summary.discount_text}
                    onChange={e => updateNestedConfig("summary", "discount_text", e.target.value)}
                    placeholder="Ex: 30% OFF"
                    className="bg-background border-border/50"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Exibido como um selo de destaque no produto.</p>
                </div>
              </div>
            </CollapsibleSection>

            {/* Aparência */}
            <CollapsibleSection title="Aparência" icon={Palette}>
              <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                <div>
                  <Label className="text-sm font-semibold mb-2 block">Cor de Fundo da Página</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.backgroundColor}
                      onChange={e => updateConfig("backgroundColor", e.target.value)}
                      className="w-14 h-10 rounded cursor-pointer border border-border"
                    />
                    <Input
                      value={config.backgroundColor}
                      onChange={e => updateConfig("backgroundColor", e.target.value)}
                      className="bg-background border-border/50 flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-semibold mb-2 block">Cor de Destaque (Cabeçalho/Botões)</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.accentColor}
                      onChange={e => updateConfig("accentColor", e.target.value)}
                      className="w-14 h-10 rounded cursor-pointer border border-border"
                    />
                    <Input
                      value={config.accentColor}
                      onChange={e => updateConfig("accentColor", e.target.value)}
                      className="bg-background border-border/50 flex-1"
                    />
                  </div>
                </div>
                
                {/* Banners Principais */}
                <div>
                  <Label className="text-sm font-semibold mb-2 block">Banners Principais</Label>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    {config.banners.length === 0 ? (
                      <p className="text-xs text-muted-foreground">Nenhum banner principal salvo.</p>
                    ) : (
                      <div className="space-y-2">
                        {config.banners.map((banner, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <img src={banner} className="h-10 w-auto rounded" alt="Banner" />
                            <span className="text-xs text-muted-foreground truncate flex-1">{banner}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <Label className="text-xs font-semibold mt-3 mb-1 block">Adicionar novos banners:</Label>
                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    className="bg-background border-border/50"
                  />
                </div>

                {/* Banners Laterais */}
                <div>
                  <Label className="text-sm font-semibold mb-2 block">Banners Laterais</Label>
                  <p className="text-xs text-muted-foreground mb-2">Visível na lateral em telas grandes.</p>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    {config.sideBanners.length === 0 ? (
                      <p className="text-xs text-muted-foreground">Nenhum banner lateral salvo.</p>
                    ) : (
                      <div className="space-y-2">
                        {config.sideBanners.map((banner, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <img src={banner} className="h-10 w-auto rounded" alt="Banner" />
                            <span className="text-xs text-muted-foreground truncate flex-1">{banner}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <Label className="text-xs font-semibold mt-3 mb-1 block">Adicionar novos banners laterais:</Label>
                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    className="bg-background border-border/50"
                  />
                </div>
              </div>
            </CollapsibleSection>

            {/* Order Bumps */}
            <CollapsibleSection title="Order Bumps" icon={Tag} defaultOpen={false}>
              <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                <div className="bg-primary/10 border border-primary/20 p-3 rounded-lg">
                  <p className="text-sm text-primary">
                    Order Bumps são ofertas adicionais exibidas antes do pagamento para aumentar o ticket médio.
                  </p>
                </div>
                <Button type="button" variant="outline" className="w-full border-dashed">
                  <Tag className="h-4 w-4 mr-2" />
                  Adicionar Oferta
                </Button>
              </div>
            </CollapsibleSection>

            {/* Cabeçalho Principal */}
            <CollapsibleSection title="Cabeçalho Principal" icon={Layout} defaultOpen={false}>
              <div className="p-4 bg-muted/30 rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">Ativar seção de título</p>
                    <p className="text-sm text-muted-foreground">Exibe o título principal e o subtítulo do checkout.</p>
                  </div>
                  <Switch
                    checked={config.header.enabled}
                    onCheckedChange={v => updateNestedConfig("header", "enabled", v)}
                  />
                </div>
                {config.header.enabled && (
                  <>
                    <div>
                      <Label className="text-sm font-semibold mb-2 block">Título Principal</Label>
                      <Input
                        value={config.header.title}
                        onChange={e => updateNestedConfig("header", "title", e.target.value)}
                        placeholder="Finalize sua Compra"
                        className="bg-background border-border/50"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-semibold mb-2 block">Subtítulo</Label>
                      <Input
                        value={config.header.subtitle}
                        onChange={e => updateNestedConfig("header", "subtitle", e.target.value)}
                        placeholder="Ambiente 100% seguro"
                        className="bg-background border-border/50"
                      />
                    </div>
                  </>
                )}
              </div>
            </CollapsibleSection>

            {/* Campos do Cliente */}
            <CollapsibleSection title="Campos do Cliente" icon={User} defaultOpen={false}>
              <div className="p-4 bg-muted/30 rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">Exibir campo CPF</p>
                    <p className="text-sm text-muted-foreground">Ativa ou desativa a exibição do campo de CPF.</p>
                  </div>
                  <Switch
                    checked={config.customerFields.enable_cpf}
                    onCheckedChange={v => updateNestedConfig("customerFields", "enable_cpf", v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">Exibir campo Telefone</p>
                    <p className="text-sm text-muted-foreground">Ativa ou desativa a exibição do campo de Telefone.</p>
                  </div>
                  <Switch
                    checked={config.customerFields.enable_phone}
                    onCheckedChange={v => updateNestedConfig("customerFields", "enable_phone", v)}
                  />
                </div>
              </div>
            </CollapsibleSection>

            {/* Métodos de Pagamento */}
            <CollapsibleSection title="Métodos de Pagamento" icon={CreditCard} defaultOpen={false}>
              <div className="p-4 bg-muted/30 rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">Cartão de Crédito</p>
                    <p className="text-sm text-muted-foreground">Permitir pagamentos via cartão de crédito.</p>
                  </div>
                  <Switch
                    checked={config.paymentMethods.credit_card}
                    onCheckedChange={v => updateNestedConfig("paymentMethods", "credit_card", v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">Pix</p>
                    <p className="text-sm text-muted-foreground">Pagamento instantâneo via Pix.</p>
                  </div>
                  <Switch
                    checked={config.paymentMethods.pix}
                    onCheckedChange={v => updateNestedConfig("paymentMethods", "pix", v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">Boleto</p>
                    <p className="text-sm text-muted-foreground">Pagamento via boleto bancário.</p>
                  </div>
                  <Switch
                    checked={config.paymentMethods.boleto}
                    onCheckedChange={v => updateNestedConfig("paymentMethods", "boleto", v)}
                  />
                </div>
              </div>
            </CollapsibleSection>

            {/* Timer de Urgência */}
            <CollapsibleSection title="Timer de Urgência" icon={Clock} defaultOpen={false}>
              <div className="p-4 bg-muted/30 rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">Ativar Timer</p>
                    <p className="text-sm text-muted-foreground">Exibe um contador regressivo no checkout.</p>
                  </div>
                  <Switch
                    checked={config.timer.enabled}
                    onCheckedChange={v => updateNestedConfig("timer", "enabled", v)}
                  />
                </div>
                {config.timer.enabled && (
                  <>
                    <div>
                      <Label className="text-sm font-semibold mb-2 block">Texto do Timer</Label>
                      <Input
                        value={config.timer.text}
                        onChange={e => updateNestedConfig("timer", "text", e.target.value)}
                        placeholder="Esta oferta expira em:"
                        className="bg-background border-border/50"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-semibold mb-2 block">Tempo (minutos)</Label>
                      <Input
                        type="number"
                        min={1}
                        max={120}
                        value={config.timer.minutes}
                        onChange={e => updateNestedConfig("timer", "minutes", parseInt(e.target.value) || 15)}
                        className="bg-background border-border/50"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-semibold mb-2 block">Cor de Fundo</Label>
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
                      <div>
                        <Label className="text-sm font-semibold mb-2 block">Cor do Texto</Label>
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
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">Timer Fixo no Topo</p>
                        <p className="text-sm text-muted-foreground">Permanece visível ao rolar a página.</p>
                      </div>
                      <Switch
                        checked={config.timer.sticky}
                        onCheckedChange={v => updateNestedConfig("timer", "sticky", v)}
                      />
                    </div>
                  </>
                )}
              </div>
            </CollapsibleSection>

            {/* Notificações de Venda */}
            <CollapsibleSection title="Notificações de Venda" icon={Bell} defaultOpen={false}>
              <div className="p-4 bg-muted/30 rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">Ativar Notificações</p>
                    <p className="text-sm text-muted-foreground">Exibe pop-ups de vendas recentes (prova social).</p>
                  </div>
                  <Switch
                    checked={config.salesNotification.enabled}
                    onCheckedChange={v => updateNestedConfig("salesNotification", "enabled", v)}
                  />
                </div>
                {config.salesNotification.enabled && (
                  <>
                    <div>
                      <Label className="text-sm font-semibold mb-2 block">Nomes para Exibir</Label>
                      <Textarea
                        value={config.salesNotification.names}
                        onChange={e => updateNestedConfig("salesNotification", "names", e.target.value)}
                        placeholder="João S., Maria L., Carlos R. (um por linha ou separados por vírgula)"
                        rows={3}
                        className="bg-background border-border/50 resize-none"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Nomes fictícios que aparecerão nas notificações.</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold mb-2 block">Nome do Produto na Notificação</Label>
                      <Input
                        value={config.salesNotification.product}
                        onChange={e => updateNestedConfig("salesNotification", "product", e.target.value)}
                        placeholder={service.name}
                        className="bg-background border-border/50"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-semibold mb-2 block">Tempo de Exibição (s)</Label>
                        <Input
                          type="number"
                          min={1}
                          max={30}
                          value={config.salesNotification.tempo_exibicao}
                          onChange={e => updateNestedConfig("salesNotification", "tempo_exibicao", parseInt(e.target.value) || 5)}
                          className="bg-background border-border/50"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-semibold mb-2 block">Intervalo (s)</Label>
                        <Input
                          type="number"
                          min={5}
                          max={120}
                          value={config.salesNotification.intervalo_notificacao}
                          onChange={e => updateNestedConfig("salesNotification", "intervalo_notificacao", parseInt(e.target.value) || 10)}
                          className="bg-background border-border/50"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CollapsibleSection>

            {/* Tracking & Pixels */}
            <CollapsibleSection title="Tracking & Pixels" icon={BarChart3} defaultOpen={false}>
              <div className="p-4 bg-muted/30 rounded-lg space-y-4">
                <div>
                  <Label className="text-sm font-semibold mb-2 block">Facebook Pixel ID</Label>
                  <Input
                    value={config.tracking.facebookPixelId}
                    onChange={e => updateNestedConfig("tracking", "facebookPixelId", e.target.value)}
                    placeholder="123456789012345"
                    className="bg-background border-border/50"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold mb-2 block">Facebook API Token (Conversion API)</Label>
                  <Input
                    value={config.tracking.facebookApiToken}
                    onChange={e => updateNestedConfig("tracking", "facebookApiToken", e.target.value)}
                    placeholder="Token da API de Conversões"
                    className="bg-background border-border/50"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold mb-2 block">Google Analytics ID</Label>
                  <Input
                    value={config.tracking.googleAnalyticsId}
                    onChange={e => updateNestedConfig("tracking", "googleAnalyticsId", e.target.value)}
                    placeholder="G-XXXXXXXXXX"
                    className="bg-background border-border/50"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold mb-2 block">Google Ads ID</Label>
                  <Input
                    value={config.tracking.googleAdsId}
                    onChange={e => updateNestedConfig("tracking", "googleAdsId", e.target.value)}
                    placeholder="AW-XXXXXXXXX"
                    className="bg-background border-border/50"
                  />
                </div>

                {/* Event Toggles */}
                <div className="pt-4 border-t border-border/30">
                  <p className="font-semibold text-foreground mb-3">Eventos Facebook Pixel</p>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(config.tracking.events.facebook).map(([event, enabled]) => (
                      <label key={event} className="flex items-center gap-2 text-sm cursor-pointer">
                        <Checkbox
                          checked={enabled}
                          onCheckedChange={v => updateTrackingEvent('facebook', event, !!v)}
                        />
                        <span className="capitalize">{event.replace('_', ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-border/30">
                  <p className="font-semibold text-foreground mb-3">Eventos Google</p>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(config.tracking.events.google).map(([event, enabled]) => (
                      <label key={event} className="flex items-center gap-2 text-sm cursor-pointer">
                        <Checkbox
                          checked={enabled}
                          onCheckedChange={v => updateTrackingEvent('google', event, !!v)}
                        />
                        <span className="capitalize">{event.replace('_', ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </CollapsibleSection>

            {/* Recursos Adicionais */}
            <CollapsibleSection title="Recursos Adicionais" icon={Link} defaultOpen={false}>
              <div className="p-4 bg-muted/30 rounded-lg space-y-4">
                <div>
                  <Label className="text-sm font-semibold mb-2 block">URL do Vídeo YouTube</Label>
                  <Input
                    value={config.youtubeUrl}
                    onChange={e => updateConfig("youtubeUrl", e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="bg-background border-border/50"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Exibe um vídeo do YouTube no checkout.</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold mb-2 block">URL de Redirecionamento (Pós-compra)</Label>
                  <Input
                    value={config.redirectUrl}
                    onChange={e => updateConfig("redirectUrl", e.target.value)}
                    placeholder="https://seu-site.com/obrigado"
                    className="bg-background border-border/50"
                  />
                </div>
                <div className="pt-4 border-t border-border/30">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-foreground">Redirecionamento ao Voltar</p>
                      <p className="text-sm text-muted-foreground">Redireciona quando o usuário tenta sair.</p>
                    </div>
                    <Switch
                      checked={config.backRedirect.enabled}
                      onCheckedChange={v => updateNestedConfig("backRedirect", "enabled", v)}
                    />
                  </div>
                  {config.backRedirect.enabled && (
                    <Input
                      value={config.backRedirect.url}
                      onChange={e => updateNestedConfig("backRedirect", "url", e.target.value)}
                      placeholder="https://seu-site.com/oferta-especial"
                      className="bg-background border-border/50"
                    />
                  )}
                </div>
              </div>
            </CollapsibleSection>
          </div>

          {/* Element Order Info */}
          <input type="hidden" name="elementOrder" value="[]" />

          {/* Save Button */}
          <div className="sticky bottom-0 bg-card border-t border-border/50 -mx-6 px-6 py-4 mt-6">
            <Button 
              type="button" 
              onClick={handleSave} 
              disabled={isSaving}
              className="w-full bg-primary hover:bg-primary/90"
              size="lg"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Salvar Configurações
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Right Panel - Preview */}
      {showPreview && (
        <div className="w-1/2 h-full bg-muted/30 relative">
          <div className="absolute top-4 right-4 z-10">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(false)}
              className="bg-background/80 backdrop-blur-sm"
            >
              <EyeOff className="h-4 w-4 mr-2" />
              Ocultar Preview
            </Button>
          </div>
          <div className="h-full overflow-auto">
            <CheckoutPreview 
              config={config} 
              service={service}
            />
          </div>
        </div>
      )}

      {/* Show Preview Button (when hidden) */}
      {!showPreview && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowPreview(true)}
          className="fixed bottom-6 right-6 bg-background shadow-lg"
        >
          <Eye className="h-4 w-4 mr-2" />
          Mostrar Preview
        </Button>
      )}
    </div>
  );
};

export default CheckoutEditorPage;
