import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  Clock, 
  User, 
  Mail, 
  Phone, 
  FileText, 
  QrCode, 
  CreditCard, 
  Shield, 
  Lock, 
  ShoppingCart,
  GripVertical
} from "lucide-react";
import Sortable from "sortablejs";

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
  youtubeUrl: string;
  elementOrder: string[];
}

interface Service {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
}

const defaultConfig: CheckoutConfig = {
  backgroundColor: "#f3f4f6",
  accentColor: "#8B5CF6",
  header: { enabled: true, title: "Finalize sua Compra", subtitle: "Ambiente 100% seguro" },
  timer: { enabled: false, minutes: 15, text: "Esta oferta expira em:", bgcolor: "#000000", textcolor: "#FFFFFF", sticky: true },
  salesNotification: { enabled: false, names: "", product: "", tempo_exibicao: 5, intervalo_notificacao: 10 },
  paymentMethods: { credit_card: true, pix: true, boleto: false },
  customerFields: { enable_cpf: true, enable_phone: true },
  summary: { product_name: "", discount_text: "", preco_anterior: "" },
  youtubeUrl: "",
  elementOrder: [],
};

const CheckoutPreview = () => {
  const { serviceId } = useParams();
  const [searchParams] = useSearchParams();
  const [service, setService] = useState<Service | null>(null);
  const [config, setConfig] = useState<CheckoutConfig>(defaultConfig);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const configParam = searchParams.get("config");
    if (configParam) {
      try {
        const parsedConfig = JSON.parse(decodeURIComponent(configParam));
        setConfig(prev => ({ ...prev, ...parsedConfig }));
      } catch (e) {
        console.error("Error parsing config:", e);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (serviceId) {
      fetchService();
    }
  }, [serviceId]);

  useEffect(() => {
    // Initialize SortableJS for drag and drop
    if (containerRef.current && !isLoading) {
      const sortable = Sortable.create(containerRef.current, {
        animation: 150,
        ghostClass: "sortable-ghost",
        handle: ".drag-handle",
        filter: "hr",
        onEnd: (evt) => {
          const order = Array.from(containerRef.current?.children || [])
            .map(child => (child as HTMLElement).dataset.id)
            .filter(id => id);
          
          // Send message to parent window
          window.parent.postMessage({ type: "element-order", order }, "*");
        },
      });

      return () => sortable.destroy();
    }
  }, [isLoading, service]);

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
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: config.backgroundColor }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: config.backgroundColor }}>
        <p className="text-gray-500">Serviço não encontrado</p>
      </div>
    );
  }

  const productName = config.summary?.product_name || service.name;
  const precoAnterior = config.summary?.preco_anterior;

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: config.backgroundColor }}>
      <style>{`
        .sortable-ghost {
          opacity: 0.4;
          background: #c8ebfb;
        }
        .drag-handle {
          opacity: 0;
          transition: opacity 0.2s;
        }
        section:hover .drag-handle {
          opacity: 1;
        }
        .checkout-input:focus {
          border-color: ${config.accentColor};
          box-shadow: 0 0 0 2px ${config.accentColor}40;
          outline: none;
        }
      `}</style>

      {/* Timer */}
      {config.timer.enabled && (
        <div 
          className={`px-4 py-3 flex items-center justify-center gap-2 ${config.timer.sticky ? 'sticky top-0 z-50' : ''}`}
          style={{ backgroundColor: config.timer.bgcolor, color: config.timer.textcolor }}
        >
          <Clock className="w-4 h-4" />
          <span className="font-semibold">{config.timer.text}</span>
          <span className="font-bold font-mono">{config.timer.minutes}:00</span>
        </div>
      )}

      {/* Header */}
      {config.header.enabled && (
        <div 
          className="px-6 py-4 text-center"
          style={{ backgroundColor: config.accentColor }}
        >
          <h1 className="text-xl font-bold text-white">{config.header.title}</h1>
          <p className="text-white/80 text-sm mt-1 flex items-center justify-center gap-1">
            <Shield className="w-3 h-3" />
            {config.header.subtitle}
          </p>
        </div>
      )}

      <div className="max-w-4xl mx-auto p-4">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Column */}
          <div className="w-full lg:w-2/3">
            <div ref={containerRef} className="bg-white rounded-lg shadow-lg p-6 md:p-8 space-y-6">
              {/* Product Summary */}
              <section data-id="summary" className="relative flex flex-row items-start gap-4">
                <div className="drag-handle absolute top-2 right-2 cursor-grab z-10 bg-white p-1 rounded shadow">
                  <GripVertical className="w-4 h-4 text-gray-400" />
                </div>
                <div 
                  className="w-24 h-24 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${config.accentColor}20` }}
                >
                  <ShoppingCart className="w-8 h-8" style={{ color: config.accentColor }} />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-800">{productName}</h2>
                  <div className="flex items-baseline flex-wrap gap-x-3 gap-y-1 mt-2">
                    <span className="text-2xl font-bold" style={{ color: config.accentColor }}>
                      {formatPrice(service.price_cents)}
                    </span>
                    {precoAnterior && (
                      <span className="text-lg text-gray-400 line-through">R$ {precoAnterior}</span>
                    )}
                  </div>
                  {config.summary.discount_text && (
                    <span className="bg-red-100 text-red-700 text-xs font-bold uppercase px-3 py-1 rounded-full mt-2 inline-block">
                      {config.summary.discount_text}
                    </span>
                  )}
                </div>
              </section>

              <hr className="border-gray-200" />

              {/* Customer Info */}
              <section data-id="customer_info" className="relative">
                <div className="drag-handle absolute top-2 right-2 cursor-grab z-10 bg-white p-1 rounded shadow">
                  <GripVertical className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex items-center gap-2.5 mb-4">
                  <User className="w-6 h-6 text-gray-700" />
                  <h2 className="text-xl font-semibold text-gray-800">Seus dados</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Qual é o seu nome completo?</label>
                    <div className="relative mt-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="w-5 h-5 text-gray-400" />
                      </div>
                      <input 
                        type="text" 
                        className="checkout-input block w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 text-base transition-all"
                        placeholder="Nome da Silva"
                        disabled
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Qual é o seu e-mail?</label>
                    <div className="relative mt-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="w-5 h-5 text-gray-400" />
                      </div>
                      <input 
                        type="email" 
                        className="checkout-input block w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 text-base transition-all"
                        placeholder="Digite o e-mail que receberá o produto"
                        disabled
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {config.customerFields.enable_phone && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Qual é o número do seu celular?</label>
                        <div className="relative mt-1">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Phone className="w-5 h-5 text-gray-400" />
                          </div>
                          <input 
                            type="tel" 
                            className="checkout-input block w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 text-base transition-all"
                            placeholder="(11) 99999-9999"
                            disabled
                          />
                        </div>
                      </div>
                    )}
                    {config.customerFields.enable_cpf && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Qual é o seu CPF?</label>
                        <div className="relative mt-1">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FileText className="w-5 h-5 text-gray-400" />
                          </div>
                          <input 
                            type="text" 
                            className="checkout-input block w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 text-base transition-all"
                            placeholder="000.000.000-00"
                            disabled
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              <hr className="border-gray-200" />

              {/* Payment */}
              <section data-id="payment" className="relative">
                <div className="drag-handle absolute top-2 right-2 cursor-grab z-10 bg-white p-1 rounded shadow">
                  <GripVertical className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex items-center gap-2.5 mb-4">
                  <CreditCard className="w-6 h-6 text-gray-700" />
                  <h2 className="text-xl font-semibold text-gray-800">Pagamento</h2>
                </div>
                <div className="space-y-3">
                  {config.paymentMethods.pix && (
                    <div 
                      className="border-2 rounded-lg p-4 flex items-center gap-4"
                      style={{ borderColor: config.accentColor, backgroundColor: `${config.accentColor}10` }}
                    >
                      <QrCode className="w-6 h-6" style={{ color: config.accentColor }} />
                      <div className="flex-1">
                        <span className="font-bold text-gray-800">Pix</span>
                        <span className="ml-2 text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">Aprovação Imediata</span>
                      </div>
                      <div className="w-5 h-5 rounded-full border-4" style={{ borderColor: config.accentColor }}></div>
                    </div>
                  )}
                  {config.paymentMethods.credit_card && (
                    <div className="border rounded-lg p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50">
                      <CreditCard className="w-6 h-6 text-gray-400" />
                      <span className="font-medium text-gray-600">Cartão de Crédito</span>
                    </div>
                  )}
                  {config.paymentMethods.boleto && (
                    <div className="border rounded-lg p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50">
                      <FileText className="w-6 h-6 text-gray-400" />
                      <span className="font-medium text-gray-600">Boleto</span>
                    </div>
                  )}
                </div>

                <button
                  className="w-full mt-6 py-4 rounded-lg font-bold text-white text-lg shadow-lg transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{ backgroundColor: config.accentColor }}
                >
                  Finalizar Compra
                </button>
              </section>

              <hr className="border-gray-200" />

              {/* Security */}
              <section data-id="security_info" className="relative text-center text-xs text-gray-500 space-y-4">
                <div className="drag-handle absolute top-2 right-2 cursor-grab z-10 bg-white p-1 rounded shadow">
                  <GripVertical className="w-4 h-4 text-gray-400" />
                </div>
                <p className="font-medium text-gray-600">AcolheAqui está processando este pagamento.</p>
                <div className="flex items-center justify-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-gray-400" />
                    <span>Compra 100% segura</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-gray-400" />
                    <span>Dados protegidos</span>
                  </div>
                </div>
                <p className="text-gray-400 pt-4">Copyright © {new Date().getFullYear()}. Todos os direitos reservados.</p>
              </section>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-1/3 hidden lg:block">
            <div className="sticky top-6 space-y-6">
              <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
                <h2 className="text-xl font-semibold text-gray-800">Resumo da compra</h2>
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-700">
                    <span>{productName}</span>
                    <div className="flex items-baseline gap-2">
                      {precoAnterior && (
                        <span className="text-sm text-gray-400 line-through">R$ {precoAnterior}</span>
                      )}
                      <span className="font-medium">{formatPrice(service.price_cents)}</span>
                    </div>
                  </div>
                </div>
                <hr className="border-gray-200" />
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-800">Total a pagar</span>
                  <span className="text-2xl font-bold text-green-600">{formatPrice(service.price_cents)}</span>
                </div>
                <div className="text-center text-gray-500 text-sm mt-4 flex items-center justify-center gap-1">
                  <Lock className="w-4 h-4" />
                  Compra segura
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPreview;
