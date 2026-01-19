import { useState, useCallback } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Mail, 
  Phone, 
  FileText, 
  CreditCard, 
  Wallet, 
  Clock,
  Lock,
  Shield,
  Copy,
  Check,
  Loader2,
  X
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { validateCPF } from "@/lib/validateCPF";

interface Service {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price_cents: number;
}

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface GatewayConfig {
  accessToken: string;
  gateway: string;
}

interface CheckoutOverlayProps {
  open: boolean;
  onClose: () => void;
  service: Service;
  profile: Profile;
  selectedDate: Date;
  selectedTime: string;
  accentColor?: string;
  gatewayConfig?: GatewayConfig | null;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  cpf: string;
}

const CheckoutOverlay = ({ 
  open, 
  onClose, 
  service,
  profile,
  selectedDate,
  selectedTime,
  accentColor = "#dc2626",
  gatewayConfig
}: CheckoutOverlayProps) => {
  const [selectedPayment, setSelectedPayment] = useState<'pix' | 'credit_card'>('pix');
  const [formData, setFormData] = useState<FormData>({ name: '', email: '', phone: '', cpf: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPixModal, setShowPixModal] = useState(false);
  const [pixData, setPixData] = useState<{ qrCode: string; pixCode: string; paymentId?: string } | null>(null);
  const [pixApproved, setPixApproved] = useState(false);
  const [copied, setCopied] = useState(false);

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  const validateForm = useCallback(() => {
    if (!formData.name.trim()) {
      toast.error("Por favor, preencha seu nome.");
      return false;
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error("Por favor, preencha um e-mail válido.");
      return false;
    }
    if (!formData.phone.trim()) {
      toast.error("Por favor, preencha seu telefone.");
      return false;
    }
    if (!formData.cpf.trim()) {
      toast.error("Por favor, preencha seu CPF.");
      return false;
    }
    if (!validateCPF(formData.cpf)) {
      toast.error("CPF inválido. Por favor, verifique os números.");
      return false;
    }
    return true;
  }, [formData]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCopyPix = async () => {
    if (pixData?.pixCode) {
      await navigator.clipboard.writeText(pixData.pixCode);
      setCopied(true);
      toast.success("Código PIX copiado!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleGeneratePix = async () => {
    if (!validateForm()) return;
    
    setIsProcessing(true);
    
    try {
      // Create transaction record
      const { data: transaction, error: txError } = await supabase
        .from("transactions")
        .insert({
          professional_id: profile.id,
          service_id: service.id,
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone || null,
          customer_cpf: formData.cpf || null,
          amount_cents: service.price_cents,
          payment_method: 'pix',
          payment_status: 'pending',
          gateway: gatewayConfig?.gateway || 'mercadopago',
        })
        .select()
        .single();

      if (txError) throw txError;

      // If we have a gateway configured, use the unified gateway-payment function
      if (gatewayConfig?.accessToken && gatewayConfig?.gateway) {
        const nameParts = formData.name.split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || firstName;

        const response = await supabase.functions.invoke('gateway-payment', {
          body: {
            gateway: gatewayConfig.gateway,
            action: 'create_pix',
            accessToken: gatewayConfig.accessToken,
            amount: service.price_cents / 100,
            description: service.name,
            payer: {
              email: formData.email,
              first_name: firstName,
              last_name: lastName,
              identification: formData.cpf ? {
                type: 'CPF',
                number: formData.cpf.replace(/\D/g, ''),
              } : undefined,
            },
          },
        });

        if (response.error) {
          throw new Error(response.error.message || 'Erro ao gerar PIX');
        }

        const result = response.data;

        if (!result.success) {
          throw new Error(result.error || 'Erro ao gerar PIX');
        }

        // Update transaction with gateway info
        await supabase
          .from("transactions")
          .update({
            gateway_payment_id: result.payment_id,
            pix_qr_code: result.pix_qr_code_base64 ? `data:image/png;base64,${result.pix_qr_code_base64}` : null,
            pix_code: result.pix_qr_code,
          })
          .eq("id", transaction.id);

        setPixData({
          qrCode: result.pix_qr_code_base64 
            ? `data:image/png;base64,${result.pix_qr_code_base64}` 
            : `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(result.pix_qr_code)}`,
          pixCode: result.pix_qr_code,
          paymentId: result.payment_id,
        });

        setShowPixModal(true);
      } else {
        // Fallback to mock PIX for demo
        const mockPixCode = `00020126580014br.gov.bcb.pix0136${Date.now()}5204000053039865404${(service.price_cents / 100).toFixed(2)}5802BR5925ACOLHEAQUI6009SAO PAULO62070503***6304`;
        
        setPixData({
          qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(mockPixCode)}`,
          pixCode: mockPixCode,
        });
        
        setShowPixModal(true);
        
        // Simulate payment approval after 8 seconds (for demo)
        setTimeout(async () => {
          await supabase
            .from("transactions")
            .update({ payment_status: 'approved' })
            .eq("id", transaction.id);
          setPixApproved(true);
          toast.success("Pagamento aprovado!");
        }, 8000);
      }
    } catch (error) {
      console.error("PIX generation error:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao gerar PIX");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayWithCard = async () => {
    if (!validateForm()) return;
    
    setIsProcessing(true);
    
    try {
      // Create transaction record
      const { data: transaction, error: txError } = await supabase
        .from("transactions")
        .insert({
          professional_id: profile.id,
          service_id: service.id,
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone || null,
          customer_cpf: formData.cpf || null,
          amount_cents: service.price_cents,
          payment_method: 'credit_card',
          payment_status: 'pending',
          gateway: gatewayConfig?.gateway || 'mercadopago',
        })
        .select()
        .single();

      if (txError) throw txError;

      // Simulate payment processing for demo
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await supabase
        .from("transactions")
        .update({ payment_status: 'approved' })
        .eq("id", transaction.id);
      
      toast.success("Pagamento aprovado!");
      setPixApproved(true);
    } catch (error) {
      console.error("Card payment error:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao processar pagamento");
    } finally {
      setIsProcessing(false);
    }
  };

  if (showPixModal && pixData) {
    return (
      <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              {pixApproved ? "Pagamento Aprovado! ✓" : "Escaneie o QR Code"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col items-center py-4">
            <img src={pixData.qrCode} alt="QR Code PIX" className="w-48 h-48 rounded-lg mb-4" />
            
            <div className="w-full p-3 bg-gray-100 rounded-lg mb-4">
              <p className="text-xs text-gray-500 mb-1">Código PIX (copie e cole)</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={pixData.pixCode}
                  readOnly
                  className="flex-1 text-xs bg-transparent border-none outline-none"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopyPix}
                  className="flex-shrink-0"
                >
                  {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {pixApproved ? (
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-green-600 font-semibold">Seu agendamento foi confirmado!</p>
                <p className="text-sm text-gray-500 mt-2">
                  Você receberá um e-mail com os detalhes.
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center">
                Aguardando confirmação do pagamento...
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Finalizar Agendamento</DialogTitle>
        </DialogHeader>
        
        {/* Summary */}
        <div 
          className="rounded-xl p-4 mb-4"
          style={{ backgroundColor: `${accentColor}10` }}
        >
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-semibold text-gray-900">{service.name}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                <Clock className="w-4 h-4" />
                <span>{service.duration_minutes} min</span>
              </div>
            </div>
            <span className="font-bold text-lg" style={{ color: accentColor }}>
              {formatPrice(service.price_cents)}
            </span>
          </div>
          <div className="text-sm text-gray-600 pt-2 border-t border-gray-200">
            📅 {selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })} às {selectedTime}
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
              <User className="w-4 h-4" />
              Nome completo
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent outline-none"
              style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
              placeholder="Seu nome completo"
            />
          </div>

          {/* Email */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
              <Mail className="w-4 h-4" />
              E-mail
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent outline-none"
              placeholder="seu@email.com"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
              <Phone className="w-4 h-4" />
              WhatsApp
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', formatPhone(e.target.value))}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent outline-none"
              placeholder="(00) 00000-0000"
            />
          </div>

          {/* CPF */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
              <FileText className="w-4 h-4" />
              CPF
            </label>
            <input
              type="text"
              value={formData.cpf}
              onChange={(e) => handleInputChange('cpf', formatCPF(e.target.value))}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent outline-none"
              placeholder="000.000.000-00"
              maxLength={14}
            />
          </div>

          {/* Payment Method */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Forma de pagamento</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSelectedPayment('pix')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedPayment === 'pix' 
                    ? 'border-current' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                style={{ 
                  borderColor: selectedPayment === 'pix' ? accentColor : undefined,
                  backgroundColor: selectedPayment === 'pix' ? `${accentColor}08` : undefined
                }}
              >
                <Wallet className="w-6 h-6 mx-auto mb-2" style={{ color: selectedPayment === 'pix' ? accentColor : '#6b7280' }} />
                <span className={`text-sm font-medium ${selectedPayment === 'pix' ? '' : 'text-gray-600'}`} style={{ color: selectedPayment === 'pix' ? accentColor : undefined }}>
                  PIX
                </span>
              </button>
              <button
                onClick={() => setSelectedPayment('credit_card')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedPayment === 'credit_card' 
                    ? 'border-current' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                style={{ 
                  borderColor: selectedPayment === 'credit_card' ? accentColor : undefined,
                  backgroundColor: selectedPayment === 'credit_card' ? `${accentColor}08` : undefined
                }}
              >
                <CreditCard className="w-6 h-6 mx-auto mb-2" style={{ color: selectedPayment === 'credit_card' ? accentColor : '#6b7280' }} />
                <span className={`text-sm font-medium ${selectedPayment === 'credit_card' ? '' : 'text-gray-600'}`} style={{ color: selectedPayment === 'credit_card' ? accentColor : undefined }}>
                  Cartão
                </span>
              </button>
            </div>
          </div>

          {/* CTA Button */}
          <Button
            onClick={selectedPayment === 'pix' ? handleGeneratePix : handlePayWithCard}
            disabled={isProcessing}
            className="w-full h-14 text-base font-bold"
            style={{ backgroundColor: accentColor }}
          >
            {isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : selectedPayment === 'pix' ? (
              <>
                <Wallet className="w-5 h-5 mr-2" />
                GERAR PIX AGORA
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5 mr-2" />
                PAGAR COM CARTÃO
              </>
            )}
          </Button>

          {/* Security Footer */}
          <div className="flex items-center justify-center gap-4 text-xs text-gray-400 pt-2">
            <div className="flex items-center gap-1">
              <Lock className="w-3 h-3" />
              <span>Pagamento seguro</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              <span>Dados protegidos</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutOverlay;
