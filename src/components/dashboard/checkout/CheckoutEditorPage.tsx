import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  ArrowLeft,
  Save,
  Loader2,
  ShoppingBag,
  Palette,
  User,
  CreditCard,
  Clock,
  Bell,
  BarChart3,
  Link,
  Info,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Upload,
  X
} from "lucide-react";

interface CheckoutEditorPageProps {
  profileId: string;
  serviceId: string;
  onBack: () => void;
}

interface CheckoutConfig {
  backgroundColor: string;
  accentColor: string;
  timer: {
    enabled: boolean;
    minutes: number;
    text: string;
    bgcolor: string;
    textcolor: string;
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
  price_cents: number;
}

const defaultConfig: CheckoutConfig = {
  backgroundColor: "#f3f4f6",
  accentColor: "#5521ea",
  timer: {
    enabled: false,
    minutes: 15,
    text: "Esta oferta expira em:",
    bgcolor: "#ef4444",
    textcolor: "#ffffff",
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
  defaultOpen = false 
}: { 
  title: string; 
  icon: React.ElementType; 
  children: React.ReactNode;
  defaultOpen?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 text-orange-500" />
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
  const [gatewayType, setGatewayType] = useState("pushinpay");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    fetchData();
  }, [serviceId]);

  const fetchData = async () => {
    try {
      // Fetch service
      const { data: serviceData, error: serviceError } = await supabase
        .from("services")
        .select("*")
        .eq("id", serviceId)
        .single();

      if (serviceError) throw serviceError;
      setService(serviceData);

      // Load saved config if exists
      if (serviceData.checkout_config && typeof serviceData.checkout_config === 'object') {
        setConfig(prev => ({ ...prev, ...serviceData.checkout_config as Partial<CheckoutConfig> }));
      }

      // Fetch gateway type
      const { data: gatewayData } = await supabase
        .from("payment_gateways")
        .select("gateway_type")
        .eq("professional_id", profileId)
        .eq("is_active", true)
        .maybeSingle();

      if (gatewayData) {
        setGatewayType(gatewayData.gateway_type);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("services")
        .update({
          checkout_config: JSON.parse(JSON.stringify(config)),
        })
        .eq("id", serviceId);

      if (error) throw error;
      
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
    nestedKey: string,
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

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
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

  const gatewayLabel = gatewayType === "mercado_pago" ? "Mercado Pago" : "PushinPay";

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-gray-100 -mx-6 -mt-6 font-sans">
      {/* Left Panel - Editor Form (scrollable) */}
      <div className="w-[400px] min-w-[400px] h-full bg-white border-r border-gray-200 overflow-y-auto">
        <form className="p-5" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          {/* Header */}
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-200">
            <button
              type="button"
              onClick={onBack}
              className="text-gray-600 hover:text-orange-500 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span className="text-orange-500">📦</span>
                Editor de Checkout
              </h1>
              <p className="text-sm text-gray-600 flex items-center gap-2 mt-0.5">
                Produto: {service.name}
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded">
                  {gatewayLabel}
                </span>
              </p>
            </div>
          </div>

          {/* Tip */}
          <div className="mb-5 bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded-lg text-sm flex items-start gap-2">
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p><strong>Dica:</strong> Arraste e solte os blocos na pré-visualização à direita para reordenar a página de checkout.</p>
          </div>

          {/* Sections */}
          <div className="space-y-3">
            {/* Resumo da Compra */}
            <CollapsibleSection title="Resumo da Compra" icon={ShoppingBag} defaultOpen>
              <div className="space-y-4 mt-4">
                <div>
                  <Label className="text-gray-700 text-sm font-semibold">Nome do Produto no Checkout</Label>
                  <Input
                    value={config.summary.product_name}
                    onChange={e => updateNestedConfig("summary", "product_name", e.target.value)}
                    placeholder={service.name}
                    className="mt-1 border-gray-300"
                  />
                  <p className="text-xs text-gray-500 mt-1">Por padrão, usa o nome original do produto.</p>
                </div>
                <div>
                  <Label className="text-gray-700 text-sm font-semibold">Preço Original (De)</Label>
                  <Input
                    value={config.summary.preco_anterior}
                    onChange={e => updateNestedConfig("summary", "preco_anterior", e.target.value)}
                    placeholder="Ex: 199,90"
                    className="mt-1 border-gray-300"
                  />
                  <p className="text-xs text-gray-500 mt-1">Deixe em branco para não exibir o preço cortado.</p>
                </div>
                <div>
                  <Label className="text-gray-700 text-sm font-semibold">Texto de Desconto (Opcional)</Label>
                  <Input
                    value={config.summary.discount_text}
                    onChange={e => updateNestedConfig("summary", "discount_text", e.target.value)}
                    placeholder="Ex: 30% OFF"
                    className="mt-1 border-gray-300"
                  />
                  <p className="text-xs text-gray-500 mt-1">Exibido como um selo de destaque no produto.</p>
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
                      className="w-12 h-10 rounded cursor-pointer border border-gray-300"
                    />
                    <Input
                      value={config.backgroundColor}
                      onChange={e => updateConfig("backgroundColor", e.target.value)}
                      className="flex-1 border-gray-300"
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
                      className="w-12 h-10 rounded cursor-pointer border border-gray-300"
                    />
                    <Input
                      value={config.accentColor}
                      onChange={e => updateConfig("accentColor", e.target.value)}
                      className="flex-1 border-gray-300"
                    />
                  </div>
                </div>
              </div>
            </CollapsibleSection>

            {/* Banners */}
            <CollapsibleSection title="Banners Principais" icon={ImageIcon}>
              <div className="space-y-4 mt-4">
                {config.banners.length > 0 && (
                  <div className="space-y-2">
                    {config.banners.map((banner, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <img src={banner} alt={`Banner ${idx + 1}`} className="w-16 h-10 object-cover rounded" />
                        <span className="flex-1 text-sm text-gray-600 truncate">{banner.split('/').pop()}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-600 h-8 w-8"
                          onClick={() => {
                            const newBanners = [...config.banners];
                            newBanners.splice(idx, 1);
                            updateConfig("banners", newBanners);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="text-center p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 text-sm">
                  <Upload className="h-6 w-6 mx-auto mb-2" />
                  <p>Clique para adicionar banners</p>
                  <p className="text-xs mt-1">Nenhum ficheiro selecionado</p>
                </div>
              </div>
            </CollapsibleSection>

            {/* Banners Laterais */}
            <CollapsibleSection title="Banners Laterais" icon={ImageIcon}>
              <div className="space-y-4 mt-4">
                <p className="text-xs text-gray-500">Visível na lateral em telas grandes.</p>
                <div className="text-center p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 text-sm">
                  <Upload className="h-6 w-6 mx-auto mb-2" />
                  <p>Nenhum banner lateral salvo.</p>
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
                    <Label htmlFor="enable_cpf" className="font-semibold text-gray-800">Exibir campo CPF</Label>
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
                    <Label htmlFor="enable_phone" className="font-semibold text-gray-800">Exibir campo Telefone</Label>
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
                    id="payment_pix"
                    checked={config.paymentMethods.pix}
                    onCheckedChange={(checked) => updateNestedConfig("paymentMethods", "pix", checked)}
                  />
                  <div>
                    <Label htmlFor="payment_pix" className="font-semibold text-gray-800">Pix</Label>
                    <p className="text-xs text-gray-500">Permitir pagamentos via Pix.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="payment_credit_card"
                    checked={config.paymentMethods.credit_card}
                    onCheckedChange={(checked) => updateNestedConfig("paymentMethods", "credit_card", checked)}
                  />
                  <div>
                    <Label htmlFor="payment_credit_card" className="font-semibold text-gray-800">Cartão de Crédito</Label>
                    <p className="text-xs text-gray-500">Permitir pagamentos via cartão de crédito.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="payment_boleto"
                    checked={config.paymentMethods.boleto}
                    onCheckedChange={(checked) => updateNestedConfig("paymentMethods", "boleto", checked)}
                  />
                  <div>
                    <Label htmlFor="payment_boleto" className="font-semibold text-gray-800">Boleto</Label>
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
                    <Label htmlFor="timer_enabled" className="font-semibold text-gray-800">Ativar cronômetro</Label>
                    <p className="text-xs text-gray-500">Mostra um contador regressivo para criar urgência.</p>
                  </div>
                </div>
                {config.timer.enabled && (
                  <>
                    <div>
                      <Label className="text-gray-700 text-sm font-semibold">Texto Persuasivo</Label>
                      <Input
                        value={config.timer.text}
                        onChange={e => updateNestedConfig("timer", "text", e.target.value)}
                        className="mt-1 border-gray-300"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-700 text-sm font-semibold">Duração (minutos)</Label>
                      <Input
                        type="number"
                        value={config.timer.minutes}
                        onChange={e => updateNestedConfig("timer", "minutes", parseInt(e.target.value) || 15)}
                        className="mt-1 w-24 border-gray-300"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-gray-700 text-sm font-semibold">Cor de Fundo</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type="color"
                            value={config.timer.bgcolor}
                            onChange={e => updateNestedConfig("timer", "bgcolor", e.target.value)}
                            className="w-10 h-9 rounded cursor-pointer border border-gray-300"
                          />
                          <Input
                            value={config.timer.bgcolor}
                            onChange={e => updateNestedConfig("timer", "bgcolor", e.target.value)}
                            className="flex-1 border-gray-300 text-sm"
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
                            className="w-10 h-9 rounded cursor-pointer border border-gray-300"
                          />
                          <Input
                            value={config.timer.textcolor}
                            onChange={e => updateNestedConfig("timer", "textcolor", e.target.value)}
                            className="flex-1 border-gray-300 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CollapsibleSection>

            {/* Order Bumps */}
            <CollapsibleSection title="Order Bumps" icon={ShoppingBag}>
              <div className="space-y-4 mt-4">
                <Button type="button" variant="outline" className="w-full border-dashed border-gray-300 text-gray-600">
                  + Adicionar Oferta
                </Button>
                <p className="text-xs text-gray-500 text-center">
                  Order Bumps são ofertas exibidas antes do pagamento.
                </p>
              </div>
            </CollapsibleSection>

            {/* Rastreamento */}
            <CollapsibleSection title="Rastreamento & Pixels" icon={BarChart3}>
              <div className="space-y-4 mt-4">
                <div>
                  <Label className="text-gray-700 text-sm font-semibold">ID do Pixel do Facebook</Label>
                  <Input
                    value={config.tracking.facebookPixelId}
                    onChange={e => updateNestedConfig("tracking", "facebookPixelId", e.target.value)}
                    placeholder="Apenas os números"
                    className="mt-1 border-gray-300"
                  />
                </div>
                <div>
                  <Label className="text-gray-700 text-sm font-semibold">ID do Google Analytics</Label>
                  <Input
                    value={config.tracking.googleAnalyticsId}
                    onChange={e => updateNestedConfig("tracking", "googleAnalyticsId", e.target.value)}
                    placeholder="Ex: G-XXXXXXXXXX"
                    className="mt-1 border-gray-300"
                  />
                </div>
              </div>
            </CollapsibleSection>
          </div>

          {/* Save Button */}
          <div className="sticky bottom-0 bg-white pt-4 mt-5 border-t border-gray-200">
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                className="flex-1 border-gray-300"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold"
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
                    Salvar Alterações
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Right Panel - Preview (2/3) with browser chrome */}
      <div className="flex-1 h-full p-4 overflow-hidden">
        <div className="h-full rounded-xl overflow-hidden shadow-2xl border border-gray-300 bg-white flex flex-col">
          {/* Browser Chrome */}
          <div className="bg-gray-100 px-4 py-3 flex items-center gap-3 border-b border-gray-200 shrink-0">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <div className="flex-1 ml-4">
              <div className="bg-white rounded-full px-4 py-1.5 text-sm text-gray-500 border border-gray-200 flex items-center gap-2 max-w-lg">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                checkout.acolheaqui.com/c/{serviceId.slice(0, 8)}
              </div>
            </div>
          </div>
          
          {/* Iframe Preview */}
          <iframe
            ref={iframeRef}
            src={`/checkout/${serviceId}?preview=true&config=${encodeURIComponent(JSON.stringify(config))}`}
            className="w-full flex-1"
            title="Checkout Preview"
            style={{ backgroundColor: config.backgroundColor }}
          />
        </div>
      </div>
    </div>
  );
};

export default CheckoutEditorPage;
