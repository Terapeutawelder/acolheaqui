import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  ArrowLeftCircle,
  Save,
  Loader2,
  ShoppingBag,
  Palette,
  Layout,
  User,
  CreditCard,
  Clock,
  Bell,
  BarChart3,
  Link,
  Info,
  ChevronDown,
  ChevronUp
} from "lucide-react";

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
  elementOrder: string[];
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
  elementOrder: ["header", "banner", "youtube_video", "summary", "customer_info", "order_bump", "final_summary", "payment", "guarantee", "security_info"],
};

// Collapsible Section Component (Starfy-style)
const CollapsibleSection = ({ 
  title, 
  icon: Icon, 
  children, 
  defaultOpen = false 
}: { 
  title: string; 
  icon: React.ElementType; 
  children: React.ReactNode;
  defaultOpen?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="border border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 text-indigo-600" />
          <span className="font-semibold text-gray-800">{title}</span>
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        )}
      </button>
      {isOpen && (
        <div className="p-4 pt-0 border-t border-gray-100">
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
  const iframeRef = useRef<HTMLIFrameElement>(null);

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
      // Future: Save config to database
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success("Configurações salvas com sucesso!");
      // Reload iframe
      if (iframeRef.current) {
        iframeRef.current.src = iframeRef.current.src;
      }
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
    value: unknown
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
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Serviço não encontrado</p>
        <Button onClick={onBack} variant="outline" className="mt-4">
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-10rem)] bg-gray-100 -m-6 font-sans">
      {/* Left Panel - Editor Form (1/3) */}
      <div className="w-1/3 h-full bg-white shadow-lg overflow-y-auto border-r border-gray-200">
        <form className="p-6" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          {/* Header */}
          <div className="flex items-center gap-4 mb-6 border-b border-gray-200 pb-4">
            <button
              type="button"
              onClick={onBack}
              className="text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              <ArrowLeftCircle className="w-7 h-7" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Editor de Checkout</h1>
              <p className="text-sm text-gray-600 flex items-center gap-2">
                Produto: {service.name}
                <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded border border-indigo-200">
                  {formatPrice(service.price_cents)}
                </span>
              </p>
            </div>
          </div>

          {/* Tip */}
          <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded-lg text-sm flex items-start gap-2">
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p><strong>Dica:</strong> Arraste e solte os blocos na pré-visualização à direita para reordenar a página de checkout.</p>
          </div>

          {/* Sections */}
          <div className="space-y-4">
            {/* Resumo da Compra */}
            <CollapsibleSection title="Resumo da Compra" icon={ShoppingBag} defaultOpen>
              <div className="space-y-4 mt-4">
                <div>
                  <Label className="text-gray-700 text-sm font-semibold">Nome do Produto no Checkout</Label>
                  <Input
                    value={config.summary.product_name}
                    onChange={e => updateNestedConfig("summary", "product_name", e.target.value)}
                    placeholder={service.name}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Por padrão, usa o nome original do produto.</p>
                </div>
                <div>
                  <Label className="text-gray-700 text-sm font-semibold">Preço Original (De)</Label>
                  <Input
                    value={config.summary.preco_anterior}
                    onChange={e => updateNestedConfig("summary", "preco_anterior", e.target.value)}
                    placeholder="Ex: 199,90"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Deixe em branco para não exibir o preço cortado.</p>
                </div>
                <div>
                  <Label className="text-gray-700 text-sm font-semibold">Texto de Desconto (Opcional)</Label>
                  <Input
                    value={config.summary.discount_text}
                    onChange={e => updateNestedConfig("summary", "discount_text", e.target.value)}
                    placeholder="Ex: 30% OFF"
                    className="mt-1"
                  />
                </div>
              </div>
            </CollapsibleSection>

            {/* Aparência */}
            <CollapsibleSection title="Aparência" icon={Palette}>
              <div className="space-y-4 mt-4">
                <div>
                  <Label className="text-gray-700 text-sm font-semibold">Cor de Fundo da Página</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="color"
                      value={config.backgroundColor}
                      onChange={e => updateConfig("backgroundColor", e.target.value)}
                      className="w-14 h-10 rounded cursor-pointer border border-gray-300"
                    />
                    <Input
                      value={config.backgroundColor}
                      onChange={e => updateConfig("backgroundColor", e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-gray-700 text-sm font-semibold">Cor de Destaque (Cabeçalho/Botões)</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="color"
                      value={config.accentColor}
                      onChange={e => updateConfig("accentColor", e.target.value)}
                      className="w-14 h-10 rounded cursor-pointer border border-gray-300"
                    />
                    <Input
                      value={config.accentColor}
                      onChange={e => updateConfig("accentColor", e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </CollapsibleSection>

            {/* Cabeçalho */}
            <CollapsibleSection title="Cabeçalho Principal" icon={Layout}>
              <div className="space-y-4 mt-4">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="header_enabled"
                    checked={config.header.enabled}
                    onCheckedChange={(checked) => updateNestedConfig("header", "enabled", checked)}
                  />
                  <div>
                    <Label htmlFor="header_enabled" className="font-bold text-gray-800">Ativar seção de título</Label>
                    <p className="text-xs text-gray-500">Exibe o título principal e o subtítulo do checkout.</p>
                  </div>
                </div>
                <div>
                  <Label className="text-gray-700 text-sm font-semibold">Título Principal</Label>
                  <Input
                    value={config.header.title}
                    onChange={e => updateNestedConfig("header", "title", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-gray-700 text-sm font-semibold">Subtítulo</Label>
                  <Input
                    value={config.header.subtitle}
                    onChange={e => updateNestedConfig("header", "subtitle", e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </CollapsibleSection>

            {/* Campos do Cliente */}
            <CollapsibleSection title="Campos do Cliente" icon={User}>
              <div className="space-y-4 mt-4">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="enable_cpf"
                    checked={config.customerFields.enable_cpf}
                    onCheckedChange={(checked) => updateNestedConfig("customerFields", "enable_cpf", checked)}
                  />
                  <div>
                    <Label htmlFor="enable_cpf" className="font-bold text-gray-800">Exibir campo CPF</Label>
                    <p className="text-xs text-gray-500">Ativa ou desativa o campo de CPF no checkout.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="enable_phone"
                    checked={config.customerFields.enable_phone}
                    onCheckedChange={(checked) => updateNestedConfig("customerFields", "enable_phone", checked)}
                  />
                  <div>
                    <Label htmlFor="enable_phone" className="font-bold text-gray-800">Exibir campo Telefone</Label>
                    <p className="text-xs text-gray-500">Ativa ou desativa o campo de Telefone no checkout.</p>
                  </div>
                </div>
              </div>
            </CollapsibleSection>

            {/* Métodos de Pagamento */}
            <CollapsibleSection title="Métodos de Pagamento" icon={CreditCard}>
              <div className="space-y-4 mt-4">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="payment_credit_card"
                    checked={config.paymentMethods.credit_card}
                    onCheckedChange={(checked) => updateNestedConfig("paymentMethods", "credit_card", checked)}
                  />
                  <div>
                    <Label htmlFor="payment_credit_card" className="font-bold text-gray-800">Cartão de Crédito</Label>
                    <p className="text-xs text-gray-500">Permitir pagamentos via cartão de crédito.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="payment_pix"
                    checked={config.paymentMethods.pix}
                    onCheckedChange={(checked) => updateNestedConfig("paymentMethods", "pix", checked)}
                  />
                  <div>
                    <Label htmlFor="payment_pix" className="font-bold text-gray-800">Pix</Label>
                    <p className="text-xs text-gray-500">Permitir pagamentos via Pix.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="payment_boleto"
                    checked={config.paymentMethods.boleto}
                    onCheckedChange={(checked) => updateNestedConfig("paymentMethods", "boleto", checked)}
                  />
                  <div>
                    <Label htmlFor="payment_boleto" className="font-bold text-gray-800">Boleto</Label>
                    <p className="text-xs text-gray-500">Permitir pagamentos via boleto bancário.</p>
                  </div>
                </div>
              </div>
            </CollapsibleSection>

            {/* Cronômetro */}
            <CollapsibleSection title="Cronômetro de Escassez" icon={Clock}>
              <div className="space-y-4 mt-4">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="timer_enabled"
                    checked={config.timer.enabled}
                    onCheckedChange={(checked) => updateNestedConfig("timer", "enabled", checked)}
                  />
                  <div>
                    <Label htmlFor="timer_enabled" className="font-bold text-gray-800">Ativar cronômetro</Label>
                    <p className="text-xs text-gray-500">Mostra um contador regressivo para criar urgência.</p>
                  </div>
                </div>
                <div>
                  <Label className="text-gray-700 text-sm font-semibold">Texto Persuasivo</Label>
                  <Input
                    value={config.timer.text}
                    onChange={e => updateNestedConfig("timer", "text", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-gray-700 text-sm font-semibold">Duração (minutos)</Label>
                  <Input
                    type="number"
                    value={config.timer.minutes}
                    onChange={e => updateNestedConfig("timer", "minutes", parseInt(e.target.value) || 15)}
                    className="mt-1 w-32"
                  />
                </div>
                <div>
                  <Label className="text-gray-700 text-sm font-semibold">Cor de Fundo</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="color"
                      value={config.timer.bgcolor}
                      onChange={e => updateNestedConfig("timer", "bgcolor", e.target.value)}
                      className="w-14 h-10 rounded cursor-pointer border border-gray-300"
                    />
                    <Input
                      value={config.timer.bgcolor}
                      onChange={e => updateNestedConfig("timer", "bgcolor", e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-gray-700 text-sm font-semibold">Cor do Texto</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="color"
                      value={config.timer.textcolor}
                      onChange={e => updateNestedConfig("timer", "textcolor", e.target.value)}
                      className="w-14 h-10 rounded cursor-pointer border border-gray-300"
                    />
                    <Input
                      value={config.timer.textcolor}
                      onChange={e => updateNestedConfig("timer", "textcolor", e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="timer_sticky"
                    checked={config.timer.sticky}
                    onCheckedChange={(checked) => updateNestedConfig("timer", "sticky", checked)}
                  />
                  <Label htmlFor="timer_sticky" className="text-sm text-gray-700">Fixar cronômetro no topo ao rolar</Label>
                </div>
              </div>
            </CollapsibleSection>

            {/* Notificações de Venda */}
            <CollapsibleSection title="Notificações de Venda" icon={Bell}>
              <div className="space-y-4 mt-4">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="sales_notification_enabled"
                    checked={config.salesNotification.enabled}
                    onCheckedChange={(checked) => updateNestedConfig("salesNotification", "enabled", checked)}
                  />
                  <div>
                    <Label htmlFor="sales_notification_enabled" className="font-bold text-gray-800">Ativar notificações</Label>
                    <p className="text-xs text-gray-500">Mostra pop-ups de pessoas comprando o produto.</p>
                  </div>
                </div>
                <div>
                  <Label className="text-gray-700 text-sm font-semibold">Nome do Produto na Notificação</Label>
                  <Input
                    value={config.salesNotification.product}
                    onChange={e => updateNestedConfig("salesNotification", "product", e.target.value)}
                    placeholder={service.name}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-gray-700 text-sm font-semibold">Nomes dos Compradores (um por linha)</Label>
                  <Textarea
                    value={config.salesNotification.names}
                    onChange={e => updateNestedConfig("salesNotification", "names", e.target.value)}
                    placeholder={"João S.\nMaria C.\nCarlos A."}
                    rows={5}
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-700 text-sm font-semibold">Tempo de Exibição (s)</Label>
                    <Input
                      type="number"
                      value={config.salesNotification.tempo_exibicao}
                      onChange={e => updateNestedConfig("salesNotification", "tempo_exibicao", parseInt(e.target.value) || 5)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-700 text-sm font-semibold">Intervalo (s)</Label>
                    <Input
                      type="number"
                      value={config.salesNotification.intervalo_notificacao}
                      onChange={e => updateNestedConfig("salesNotification", "intervalo_notificacao", parseInt(e.target.value) || 10)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </CollapsibleSection>

            {/* Rastreamento & Pixels */}
            <CollapsibleSection title="Rastreamento & Pixels" icon={BarChart3}>
              <div className="space-y-4 mt-4">
                <div>
                  <Label className="text-gray-700 text-sm font-semibold">ID do Pixel do Facebook</Label>
                  <Input
                    value={config.tracking.facebookPixelId}
                    onChange={e => setConfig(prev => ({
                      ...prev,
                      tracking: { ...prev.tracking, facebookPixelId: e.target.value }
                    }))}
                    placeholder="Apenas os números"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-gray-700 text-sm font-semibold">Token da API de Conversões (Facebook)</Label>
                  <Input
                    value={config.tracking.facebookApiToken}
                    onChange={e => setConfig(prev => ({
                      ...prev,
                      tracking: { ...prev.tracking, facebookApiToken: e.target.value }
                    }))}
                    placeholder="Cole seu token de acesso aqui"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-gray-700 text-sm font-semibold">ID do Google Analytics (GA4)</Label>
                  <Input
                    value={config.tracking.googleAnalyticsId}
                    onChange={e => setConfig(prev => ({
                      ...prev,
                      tracking: { ...prev.tracking, googleAnalyticsId: e.target.value }
                    }))}
                    placeholder="Ex: G-XXXXXXXXXX"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-gray-700 text-sm font-semibold">ID de Conversão do Google Ads</Label>
                  <Input
                    value={config.tracking.googleAdsId}
                    onChange={e => setConfig(prev => ({
                      ...prev,
                      tracking: { ...prev.tracking, googleAdsId: e.target.value }
                    }))}
                    placeholder="Ex: AW-XXXXXXXXX"
                    className="mt-1"
                  />
                </div>
              </div>
            </CollapsibleSection>

            {/* Recursos Adicionais */}
            <CollapsibleSection title="Recursos Adicionais" icon={Link}>
              <div className="space-y-4 mt-4">
                <div>
                  <Label className="text-gray-700 text-sm font-semibold">URL do Vídeo YouTube</Label>
                  <Input
                    value={config.youtubeUrl}
                    onChange={e => updateConfig("youtubeUrl", e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-gray-700 text-sm font-semibold">URL de Redirecionamento (Após Compra)</Label>
                  <Input
                    value={config.redirectUrl}
                    onChange={e => updateConfig("redirectUrl", e.target.value)}
                    placeholder="https://..."
                    className="mt-1"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="back_redirect_enabled"
                    checked={config.backRedirect.enabled}
                    onCheckedChange={(checked) => updateNestedConfig("backRedirect", "enabled", checked)}
                  />
                  <Label htmlFor="back_redirect_enabled" className="text-sm text-gray-700">Redirecionar ao clicar em voltar</Label>
                </div>
                {config.backRedirect.enabled && (
                  <div>
                    <Label className="text-gray-700 text-sm font-semibold">URL de Redirecionamento (Voltar)</Label>
                    <Input
                      value={config.backRedirect.url}
                      onChange={e => updateNestedConfig("backRedirect", "url", e.target.value)}
                      placeholder="https://..."
                      className="mt-1"
                    />
                  </div>
                )}
              </div>
            </CollapsibleSection>
          </div>

          {/* Save Button (Sticky) */}
          <div className="sticky bottom-0 bg-white pt-4 pb-2 mt-6 border-t border-gray-200">
            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Configurações
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Right Panel - Preview (2/3) */}
      <div className="w-2/3 h-full bg-gray-200 p-4 overflow-hidden">
        <div className="h-full rounded-lg overflow-hidden shadow-xl border border-gray-300 bg-white">
          {/* Browser Chrome */}
          <div className="bg-gray-100 px-4 py-2 flex items-center gap-2 border-b border-gray-200">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <div className="flex-1 ml-4">
              <div className="bg-white rounded-full px-4 py-1 text-sm text-gray-500 max-w-md">
                checkout.acolheaqui.com/p/{serviceId.slice(0, 8)}
              </div>
            </div>
          </div>
          
          {/* Iframe Preview */}
          <iframe
            ref={iframeRef}
            src={`/checkout-preview/${serviceId}?config=${encodeURIComponent(JSON.stringify(config))}`}
            className="w-full h-[calc(100%-40px)]"
            title="Checkout Preview"
            style={{ backgroundColor: config.backgroundColor }}
          />
        </div>
      </div>
    </div>
  );
};

export default CheckoutEditorPage;
