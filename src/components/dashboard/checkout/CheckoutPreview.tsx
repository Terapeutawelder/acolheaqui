import { Clock, User, Mail, Phone, FileText, QrCode, CreditCard, Shield, Lock, ShoppingCart } from "lucide-react";

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
  summary: {
    product_name: string;
    discount_text: string;
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
}

interface Service {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price_cents: number;
}

interface CheckoutPreviewProps {
  config: CheckoutConfig;
  service: Service;
}

const CheckoutPreview = ({ config, service }: CheckoutPreviewProps) => {
  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const productName = config.summary.product_name || service.name;

  return (
    <div className="rounded-lg border border-border/50 overflow-hidden shadow-lg">
      <div className="bg-muted/50 px-4 py-2 flex items-center justify-between border-b border-border/50">
        <span className="text-sm font-medium text-muted-foreground">Preview do Checkout</span>
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
      </div>
      
      <div 
        className="max-h-[70vh] overflow-y-auto"
        style={{ backgroundColor: config.backgroundColor }}
      >
        {/* Timer */}
        {config.timer.enabled && (
          <div 
            className="px-4 py-3 flex items-center justify-center gap-2"
            style={{ backgroundColor: config.timer.bgcolor, color: config.timer.textcolor }}
          >
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">{config.timer.text}</span>
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

        <div className="p-4 space-y-4">
          {/* Product Summary */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div 
                className="w-16 h-16 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${config.accentColor}20` }}
              >
                <ShoppingCart className="w-6 h-6" style={{ color: config.accentColor }} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{productName}</h3>
                {config.summary.discount_text && (
                  <span className="inline-block bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full mt-1">
                    {config.summary.discount_text}
                  </span>
                )}
                <p 
                  className="text-xl font-bold mt-2"
                  style={{ color: config.accentColor }}
                >
                  {formatPrice(service.price_cents)}
                </p>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-white rounded-lg p-4 shadow-sm space-y-3">
            <h4 className="font-semibold text-gray-700 flex items-center gap-2">
              <User className="w-4 h-4" />
              Seus dados
            </h4>
            <div className="space-y-2">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Nome completo" 
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50"
                  disabled
                />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="email" 
                  placeholder="E-mail" 
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50"
                  disabled
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {config.customerFields.enable_phone && (
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="tel" 
                      placeholder="Telefone" 
                      className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50"
                      disabled
                    />
                  </div>
                )}
                {config.customerFields.enable_cpf && (
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="CPF" 
                      className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50"
                      disabled
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white rounded-lg p-4 shadow-sm space-y-3">
            <h4 className="font-semibold text-gray-700 flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Pagamento
            </h4>
            <div className="space-y-2">
              {config.paymentMethods.pix && (
                <div 
                  className="border-2 rounded-lg p-3 flex items-center gap-3"
                  style={{ borderColor: config.accentColor, backgroundColor: `${config.accentColor}10` }}
                >
                  <QrCode className="w-5 h-5" style={{ color: config.accentColor }} />
                  <span className="font-medium text-gray-800">Pix</span>
                  <span className="ml-auto text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">Aprovação Imediata</span>
                </div>
              )}
              {config.paymentMethods.credit_card && (
                <div className="border rounded-lg p-3 flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-gray-400" />
                  <span className="font-medium text-gray-600">Cartão de Crédito</span>
                </div>
              )}
              {config.paymentMethods.boleto && (
                <div className="border rounded-lg p-3 flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <span className="font-medium text-gray-600">Boleto</span>
                </div>
              )}
            </div>
          </div>

          {/* CTA Button */}
          <button
            className="w-full py-3 rounded-lg font-bold text-white shadow-lg transition-all hover:opacity-90"
            style={{ backgroundColor: config.accentColor }}
          >
            Finalizar Compra
          </button>

          {/* Security Footer */}
          <div className="text-center text-xs text-gray-500 space-y-2 pt-2">
            <div className="flex items-center justify-center gap-4">
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Compra 100% segura
              </span>
              <span className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Dados protegidos
              </span>
            </div>
            <p className="text-gray-400">Processado por <strong>AcolheAqui</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPreview;
