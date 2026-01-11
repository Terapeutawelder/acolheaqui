import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import Sortable from "sortablejs";
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
  X,
  Brain,
  GripVertical,
  Globe,
  Copy,
  ExternalLink,
  Check
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CheckoutEditorPageProps {
  profileId: string;
  serviceId: string;
  onBack: () => void;
}

interface CheckoutConfig {
  backgroundColor: string;
  accentColor: string;
  customDomain: string;
  domainType: 'default' | 'subdomain' | 'custom';
  subdomainSlug: string;
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

interface CustomDomain {
  id: string;
  domain: string;
  status: string;
  is_primary: boolean;
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
  customDomain: "",
  domainType: 'default',
  subdomainSlug: "",
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
    <div className="border border-primary/20 rounded-lg bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-primary/5 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 text-primary" />
          <span className="font-semibold text-primary">{title}</span>
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

// Banner Upload Section Component with Drag & Drop
const BannerUploadSection = ({ 
  banners, 
  onBannersChange,
  label
}: { 
  banners: string[]; 
  onBannersChange: (banners: string[]) => void;
  label: string;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sortableContainerRef = useRef<HTMLDivElement>(null);
  const sortableRef = useRef<Sortable | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Initialize Sortable for drag-and-drop
  useEffect(() => {
    if (sortableContainerRef.current && banners.length > 0) {
      if (sortableRef.current) {
        sortableRef.current.destroy();
      }
      
      sortableRef.current = Sortable.create(sortableContainerRef.current, {
        animation: 200,
        ghostClass: 'opacity-40',
        chosenClass: 'ring-2 ring-primary',
        dragClass: 'shadow-lg',
        handle: '.drag-handle',
        onEnd: (evt) => {
          if (evt.oldIndex !== undefined && evt.newIndex !== undefined) {
            const newBanners = [...banners];
            const [movedItem] = newBanners.splice(evt.oldIndex, 1);
            newBanners.splice(evt.newIndex, 0, movedItem);
            onBannersChange(newBanners);
          }
        },
      });
    }

    return () => {
      if (sortableRef.current) {
        sortableRef.current.destroy();
        sortableRef.current = null;
      }
    };
  }, [banners, onBannersChange]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newBanners: string[] = [];

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) {
        toast.error("Por favor, selecione apenas imagens");
        continue;
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuário não autenticado");

        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}/banners/${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("checkout-public")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("checkout-public")
          .getPublicUrl(fileName);

        newBanners.push(publicUrl);
      } catch (error) {
        console.error("Error uploading banner:", error);
        toast.error("Erro ao enviar imagem");
      }
    }

    if (newBanners.length > 0) {
      onBannersChange([...banners, ...newBanners]);
      toast.success(`${newBanners.length} banner(s) adicionado(s)`);
    }

    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemove = (idx: number) => {
    const newBanners = [...banners];
    newBanners.splice(idx, 1);
    onBannersChange(newBanners);
  };

  return (
    <div className="space-y-4 mt-4">
      {banners.length > 0 && (
        <div ref={sortableContainerRef} className="space-y-2">
          {banners.map((banner, idx) => (
            <div 
              key={`${banner}-${idx}`} 
              className="flex items-center gap-2 p-2 bg-primary/5 rounded-lg border border-primary/10 transition-all"
            >
              <div className="drag-handle cursor-grab active:cursor-grabbing p-1 hover:bg-primary/10 rounded">
                <GripVertical className="h-4 w-4 text-primary/50" />
              </div>
              <img src={banner} alt={`Banner ${idx + 1}`} className="w-16 h-10 object-cover rounded" />
              <span className="flex-1 text-sm text-primary/70 truncate">{banner.split('/').pop()}</span>
              <span className="text-xs text-primary/40 bg-primary/10 px-2 py-0.5 rounded">{idx + 1}º</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive/80 h-8 w-8"
                onClick={() => handleRemove(idx)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
      {banners.length > 1 && (
        <p className="text-xs text-primary/50 flex items-center gap-1">
          <GripVertical className="h-3 w-3" />
          Arraste para reordenar os banners
        </p>
      )}
      <div 
        className="text-center p-4 border-2 border-dashed border-primary/30 rounded-lg text-primary/60 text-sm cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
        onClick={() => fileInputRef.current?.click()}
      >
        {isUploading ? (
          <Loader2 className="h-6 w-6 mx-auto animate-spin text-primary" />
        ) : (
          <>
            <Upload className="h-6 w-6 mx-auto mb-2" />
            <p>Clique para adicionar {label}</p>
            <p className="text-xs mt-1">PNG, JPG ou WEBP</p>
          </>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleUpload}
      />
    </div>
  );
};

const CheckoutEditorPage = ({ profileId, serviceId, onBack }: CheckoutEditorPageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [service, setService] = useState<Service | null>(null);
  const [config, setConfig] = useState<CheckoutConfig>(defaultConfig);
  const [gatewayType, setGatewayType] = useState("pushinpay");
  const [customDomains, setCustomDomains] = useState<CustomDomain[]>([]);
  const [linkCopied, setLinkCopied] = useState(false);
  const [professionalName, setProfessionalName] = useState("");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Generate subdomain slug from professional name
  const generateSubdomainSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove accents
      .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with dash
      .replace(/^-+|-+$/g, "") // Remove leading/trailing dashes
      .substring(0, 30); // Limit length
  };

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

      // Fetch custom domains using public view (already filtered by active status)
      const { data: domainsData } = await supabase
        .from("public_active_domains")
        .select("id, domain, is_primary, ssl_status")
        .eq("professional_id", profileId)
        .order("is_primary", { ascending: false });

      if (domainsData) {
        setCustomDomains(domainsData.map(d => ({
          ...d,
          status: 'active' // View already filters by active
        })) as CustomDomain[]);
      }

      // Fetch professional name for subdomain suggestion
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", profileId)
        .single();

      if (profileData?.full_name) {
        setProfessionalName(profileData.full_name);
        // Set default subdomain slug if not already set in config
        const checkoutConfig = serviceData.checkout_config as Partial<CheckoutConfig> | null;
        if (!checkoutConfig?.subdomainSlug) {
          setConfig(prev => ({
            ...prev,
            subdomainSlug: generateSubdomainSlug(profileData.full_name)
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setIsLoading(false);
    }
  };

  const getCheckoutUrl = () => {
    if (config.domainType === 'subdomain' && config.subdomainSlug) {
      return `https://${config.subdomainSlug}.acolheaqui.com.br/checkout/${serviceId}`;
    } else if (config.domainType === 'custom' && config.customDomain) {
      return `https://${config.customDomain}/checkout/${serviceId}`;
    }
    return `${window.location.origin}/checkout/${serviceId}`;
  };

  const handleCopyLink = async () => {
    const url = getCheckoutUrl();
    try {
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      toast.success("Link copiado para a área de transferência!");
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      toast.error("Erro ao copiar link");
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
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
    <div className="flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-8rem)] bg-gray-100 -mx-4 md:-mx-6 -mt-4 md:-mt-6 font-sans">
      {/* Left Panel - Editor Form (scrollable) */}
      <div className="w-full lg:w-[400px] lg:min-w-[400px] h-auto lg:h-full bg-white border-b lg:border-b-0 lg:border-r border-gray-200 overflow-y-auto">
        <form className="p-5" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          {/* Header */}
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-primary/20">
            <button
              type="button"
              onClick={onBack}
              className="text-primary/70 hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-primary flex items-center gap-2">
                <Brain className="h-6 w-6 text-primary" />
                Editor de Checkout
              </h1>
              <p className="text-sm text-primary/70 flex items-center gap-2 mt-0.5">
                Serviço: {service.name}
                <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded">
                  {gatewayLabel}
                </span>
              </p>
            </div>
          </div>

          {/* Tip */}
          <div className="mb-5 bg-primary/5 border border-primary/20 text-primary p-3 rounded-lg text-sm flex items-start gap-2">
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p><strong>Dica:</strong> Arraste e solte os blocos na pré-visualização à direita para reordenar a página de checkout.</p>
          </div>

          {/* Custom Domain Section */}
          <CollapsibleSection title="Domínio do Checkout" icon={Globe} defaultOpen>
            <div className="space-y-4 mt-4">
              {/* Domain Type Selection */}
              <div>
                <Label className="text-gray-700 text-sm font-semibold mb-2 block">Tipo de Domínio</Label>
                <div className="space-y-2">
                  {/* Option 1: Default */}
                  <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${config.domainType === 'default' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input
                      type="radio"
                      name="domainType"
                      value="default"
                      checked={config.domainType === 'default'}
                      onChange={() => updateConfig("domainType", 'default')}
                      className="w-4 h-4 text-primary"
                    />
                    <div className="flex-1">
                      <span className="font-medium text-gray-700">Domínio Padrão</span>
                      <p className="text-xs text-gray-500 mt-0.5">Usar o domínio padrão do AcolheAqui</p>
                    </div>
                  </label>

                  {/* Option 2: Subdomain */}
                  <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${config.domainType === 'subdomain' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input
                      type="radio"
                      name="domainType"
                      value="subdomain"
                      checked={config.domainType === 'subdomain'}
                      onChange={() => updateConfig("domainType", 'subdomain')}
                      className="w-4 h-4 text-primary"
                    />
                    <div className="flex-1">
                      <span className="font-medium text-gray-700">Subdomínio AcolheAqui</span>
                      <p className="text-xs text-gray-500 mt-0.5">seunome.acolheaqui.com.br (recomendado)</p>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">SSL Automático</span>
                  </label>

                  {/* Option 3: Custom Domain */}
                  <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${config.domainType === 'custom' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input
                      type="radio"
                      name="domainType"
                      value="custom"
                      checked={config.domainType === 'custom'}
                      onChange={() => updateConfig("domainType", 'custom')}
                      className="w-4 h-4 text-primary"
                    />
                    <div className="flex-1">
                      <span className="font-medium text-gray-700">Domínio Próprio</span>
                      <p className="text-xs text-gray-500 mt-0.5">Use seu próprio domínio (ex: supertutor.online)</p>
                    </div>
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Config. Manual</span>
                  </label>
                </div>
              </div>

              {/* Subdomain Configuration */}
              {config.domainType === 'subdomain' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                  <Label className="text-gray-700 text-sm font-semibold">Seu Subdomínio</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={config.subdomainSlug}
                      onChange={e => updateConfig("subdomainSlug", generateSubdomainSlug(e.target.value))}
                      placeholder="seunome"
                      className="flex-1 border-green-300 bg-white"
                    />
                    <span className="text-sm text-gray-600 whitespace-nowrap">.acolheaqui.com.br</span>
                  </div>
                  <p className="text-xs text-green-700">
                    ✓ SSL automático incluso • Sem configuração de DNS necessária
                  </p>
                </div>
              )}

              {/* Custom Domain Selection */}
              {config.domainType === 'custom' && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
                  <Label className="text-gray-700 text-sm font-semibold">Domínio Personalizado</Label>
                  <Select 
                    value={config.customDomain || "none"}
                    onValueChange={(value) => updateConfig("customDomain", value === "none" ? "" : value)}
                  >
                    <SelectTrigger className="border-amber-300 bg-white">
                      <SelectValue placeholder="Selecione um domínio" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        <span className="flex items-center gap-2 text-gray-500">
                          Selecione um domínio configurado
                        </span>
                      </SelectItem>
                      {customDomains.map((domain) => (
                        <SelectItem key={domain.id} value={domain.domain}>
                          <span className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-green-500" />
                            {domain.domain}
                            {domain.is_primary && (
                              <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">Primário</span>
                            )}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {customDomains.length === 0 && (
                    <p className="text-xs text-amber-700 flex items-center gap-1">
                      <Info className="h-3 w-3" />
                      Configure seu domínio em "Domínio Personalizado" nas configurações do dashboard.
                    </p>
                  )}
                </div>
              )}

              {/* Checkout URL Preview */}
              <div className="pt-2 border-t border-gray-200">
                <Label className="text-gray-700 text-sm font-semibold">Link do Checkout</Label>
                <div className="mt-1 flex items-center gap-2">
                  <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 truncate">
                    {getCheckoutUrl()}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleCopyLink}
                    className="shrink-0 border-gray-300 hover:bg-primary/5"
                  >
                    {linkCopied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => window.open(getCheckoutUrl(), '_blank')}
                    className="shrink-0 border-gray-300 hover:bg-primary/5"
                  >
                    <ExternalLink className="h-4 w-4 text-gray-500" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {config.domainType === 'subdomain' 
                    ? "Seu checkout usa um subdomínio profissional do AcolheAqui."
                    : config.domainType === 'custom' && config.customDomain
                      ? "Este link usa seu domínio personalizado."
                      : "Selecione uma opção de domínio para personalizar seu link."}
                </p>
              </div>
            </div>
          </CollapsibleSection>

          {/* Sections */}
          <div className="space-y-3 mt-3">
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
              <BannerUploadSection
                banners={config.banners}
                onBannersChange={(newBanners) => updateConfig("banners", newBanners)}
                label="banners principais"
              />
            </CollapsibleSection>

            {/* Banners Laterais */}
            <CollapsibleSection title="Banners Laterais" icon={ImageIcon}>
              <div className="mt-4">
                <p className="text-xs text-primary/60 mb-3">Visível na lateral em telas grandes.</p>
                <BannerUploadSection
                  banners={config.sideBanners}
                  onBannersChange={(newBanners) => updateConfig("sideBanners", newBanners)}
                  label="banners laterais"
                />
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
          <div className="sticky bottom-0 bg-white pt-4 mt-5 border-t border-primary/20">
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                className="flex-1 border-primary/30 text-primary hover:bg-primary/5"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
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
      <div className="flex-1 h-[500px] lg:h-full p-4 overflow-hidden">
        <div className="h-full rounded-xl overflow-hidden shadow-2xl border border-gray-300 bg-white flex flex-col">
          {/* Browser Chrome */}
          <div className="bg-gray-100 px-3 md:px-4 py-2 md:py-3 flex items-center gap-2 md:gap-3 border-b border-gray-200 shrink-0">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-red-400" />
              <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-yellow-400" />
              <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-green-400" />
            </div>
            <div className="flex-1 ml-2 md:ml-4">
              <div className="bg-white rounded-full px-3 md:px-4 py-1 md:py-1.5 text-xs md:text-sm text-gray-500 border border-gray-200 flex items-center gap-2 max-w-lg truncate">
                <svg className="w-3 h-3 md:w-4 md:h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="truncate">
                  {config.customDomain 
                    ? `${config.customDomain}/checkout/${serviceId.slice(0, 8)}` 
                    : `checkout.acolheaqui.com/c/${serviceId.slice(0, 8)}`}
                </span>
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
