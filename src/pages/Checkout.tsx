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
  timer: {
    enabled: boolean;
    minutes: number;
    text: string;
    bgcolor: string;
    textcolor: string;
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
}

interface Service {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  checkout_config?: unknown;
}

const defaultConfig: CheckoutConfig = {
  backgroundColor: "#f3f4f6",
  accentColor: "#5521ea",
  timer: { enabled: false, minutes: 15, text: "Esta oferta expira em:", bgcolor: "#ef4444", textcolor: "#ffffff" },
  paymentMethods: { credit_card: true, pix: true, boleto: false },
  customerFields: { enable_cpf: true, enable_phone: true },
  summary: { product_name: "", discount_text: "", preco_anterior: "" },
  banners: [],
};

const Checkout = () => {
  const { serviceId } = useParams();
  const [searchParams] = useSearchParams();
  const [service, setService] = useState<Service | null>(null);
  const [config, setConfig] = useState<CheckoutConfig>(defaultConfig);
  const [isLoading, setIsLoading] = useState(true);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isPreview = searchParams.get("preview") === "true";

  // Load config from URL param (for preview) or from database
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

  // Timer countdown
  useEffect(() => {
    if (config.timer.enabled && timerSeconds === 0) {
      setTimerSeconds(config.timer.minutes * 60);
    }
  }, [config.timer.enabled, config.timer.minutes]);

  useEffect(() => {
    if (!config.timer.enabled || timerSeconds <= 0) return;
    
    const interval = setInterval(() => {
      setTimerSeconds(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [config.timer.enabled, timerSeconds]);

  // Initialize SortableJS for preview mode
  useEffect(() => {
    if (containerRef.current && !isLoading && isPreview) {
      const sortable = Sortable.create(containerRef.current, {
        animation: 150,
        ghostClass: "sortable-ghost",
        handle: ".drag-handle",
        filter: "hr",
        onEnd: (evt) => {
          const order = Array.from(containerRef.current?.children || [])
            .map(child => (child as HTMLElement).dataset.id)
            .filter(id => id);
          
          window.parent.postMessage({ type: "element-order", order }, "*");
        },
      });

      return () => sortable.destroy();
    }
  }, [isLoading, service, isPreview]);

  const fetchService = async () => {
    try {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("id", serviceId)
        .single();

      if (error) throw error;
      setService(data);
      
      // Load config from database if not in preview mode
      if (!searchParams.get("config") && data.checkout_config) {
        setConfig(prev => ({ ...prev, ...data.checkout_config as Partial<CheckoutConfig> }));
      }
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

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
        <p className="text-gray-500">Produto não encontrado</p>
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
          background: #fef3c7;
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
          box-shadow: 0 0 0 3px ${config.accentColor}20;
          outline: none;
        }
      `}</style>

      {/* Timer */}
      {config.timer.enabled && (
        <div 
          className="px-4 py-3 flex items-center justify-center gap-2 sticky top-0 z-50"
          style={{ backgroundColor: config.timer.bgcolor, color: config.timer.textcolor }}
        >
          <Clock className="w-4 h-4" />
          <span className="font-semibold">{config.timer.text}</span>
          <span className="font-bold font-mono text-lg">{formatTimer(timerSeconds)}</span>
        </div>
      )}

      {/* Banners */}
      {config.banners && config.banners.length > 0 && (
        <div className="w-full">
          <img src={config.banners[0]} alt="Banner" className="w-full h-auto" />
        </div>
      )}

      <div className="max-w-4xl mx-auto p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Column */}
          <div className="w-full lg:w-2/3">
            <div ref={containerRef} className="bg-white rounded-xl shadow-lg p-6 md:p-8 space-y-6">
              {/* Product Summary */}
              <section data-id="summary" className="relative flex flex-row items-start gap-4">
                {isPreview && (
                  <div className="drag-handle absolute top-0 right-0 cursor-grab z-10 bg-white p-1.5 rounded shadow border border-gray-200">
                    <GripVertical className="w-4 h-4 text-gray-400" />
                  </div>
                )}
                <div 
                  className="w-20 h-20 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${config.accentColor}15` }}
                >
                  <ShoppingCart className="w-8 h-8" style={{ color: config.accentColor }} />
                </div>
                <div className="flex-1 min-w-0">
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
                    <span className="inline-block bg-red-100 text-red-600 text-xs font-bold uppercase px-3 py-1 rounded-full mt-2">
                      {config.summary.discount_text}
                    </span>
                  )}
                </div>
              </section>

              <hr className="border-gray-200" />

              {/* Customer Info */}
              <section data-id="customer_info" className="relative">
                {isPreview && (
                  <div className="drag-handle absolute top-0 right-0 cursor-grab z-10 bg-white p-1.5 rounded shadow border border-gray-200">
                    <GripVertical className="w-4 h-4 text-gray-400" />
                  </div>
                )}
                <div className="flex items-center gap-2.5 mb-4">
                  <User className="w-6 h-6 text-gray-700" />
                  <h2 className="text-xl font-semibold text-gray-800">Seus dados</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Qual é o seu nome completo?</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="w-5 h-5 text-gray-400" />
                      </div>
                      <input 
                        type="text" 
                        className="checkout-input block w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg placeholder-gray-400 text-base transition-all"
                        placeholder="Nome da Silva"
                        disabled={isPreview}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Qual é o seu e-mail?</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="w-5 h-5 text-gray-400" />
                      </div>
                      <input 
                        type="email" 
                        className="checkout-input block w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg placeholder-gray-400 text-base transition-all"
                        placeholder="Digite o e-mail que receberá o produto"
                        disabled={isPreview}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {config.customerFields.enable_phone && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Qual é o número do seu celular?</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Phone className="w-5 h-5 text-gray-400" />
                          </div>
                          <input 
                            type="tel" 
                            className="checkout-input block w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg placeholder-gray-400 text-base transition-all"
                            placeholder="(11) 99999-9999"
                            disabled={isPreview}
                          />
                        </div>
                      </div>
                    )}
                    {config.customerFields.enable_cpf && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Qual é o seu CPF?</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FileText className="w-5 h-5 text-gray-400" />
                          </div>
                          <input 
                            type="text" 
                            className="checkout-input block w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg placeholder-gray-400 text-base transition-all"
                            placeholder="000.000.000-00"
                            disabled={isPreview}
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
                {isPreview && (
                  <div className="drag-handle absolute top-0 right-0 cursor-grab z-10 bg-white p-1.5 rounded shadow border border-gray-200">
                    <GripVertical className="w-4 h-4 text-gray-400" />
                  </div>
                )}
                <div className="flex items-center gap-2.5 mb-4">
                  <CreditCard className="w-6 h-6 text-gray-700" />
                  <h2 className="text-xl font-semibold text-gray-800">Pagamento</h2>
                </div>
                <div className="space-y-3">
                  {config.paymentMethods.pix && (
                    <div 
                      className="border-2 rounded-xl p-4 flex items-center gap-4 cursor-pointer"
                      style={{ borderColor: config.accentColor, backgroundColor: `${config.accentColor}08` }}
                    >
                      <QrCode className="w-6 h-6" style={{ color: config.accentColor }} />
                      <div className="flex-1">
                        <span className="font-bold text-gray-800">Pix</span>
                        <span className="ml-2 text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-medium">Aprovação Imediata</span>
                      </div>
                      <div className="w-5 h-5 rounded-full border-4" style={{ borderColor: config.accentColor }}></div>
                    </div>
                  )}
                  {config.paymentMethods.credit_card && (
                    <div className="border border-gray-200 rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:border-gray-300 transition-colors">
                      <CreditCard className="w-6 h-6 text-gray-400" />
                      <span className="font-medium text-gray-600">Cartão de Crédito</span>
                    </div>
                  )}
                  {config.paymentMethods.boleto && (
                    <div className="border border-gray-200 rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:border-gray-300 transition-colors">
                      <FileText className="w-6 h-6 text-gray-400" />
                      <span className="font-medium text-gray-600">Boleto</span>
                    </div>
                  )}
                </div>

                <button
                  className="w-full mt-6 py-4 rounded-xl font-bold text-white text-lg shadow-lg transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{ backgroundColor: config.accentColor }}
                  disabled={isPreview}
                >
                  Finalizar Compra
                </button>
              </section>

              <hr className="border-gray-200" />

              {/* Security */}
              <section data-id="security_info" className="relative text-center text-sm text-gray-500 space-y-3">
                {isPreview && (
                  <div className="drag-handle absolute top-0 right-0 cursor-grab z-10 bg-white p-1.5 rounded shadow border border-gray-200">
                    <GripVertical className="w-4 h-4 text-gray-400" />
                  </div>
                )}
                <p className="font-medium text-gray-600">AcolheAqui está processando este pagamento.</p>
                <div className="flex items-center justify-center gap-6">
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span>Compra 100% segura</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-green-500" />
                    <span>Dados protegidos</span>
                  </div>
                </div>
                <p className="text-gray-400 pt-2 text-xs">Copyright © {new Date().getFullYear()}. Todos os direitos reservados.</p>
              </section>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-1/3 hidden lg:block">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
                <h2 className="text-lg font-semibold text-gray-800">Resumo da compra</h2>
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-700">
                    <span className="truncate mr-2">{productName}</span>
                    <div className="flex items-baseline gap-2 flex-shrink-0">
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
                  <span className="text-2xl font-bold" style={{ color: config.accentColor }}>{formatPrice(service.price_cents)}</span>
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

export default Checkout;
