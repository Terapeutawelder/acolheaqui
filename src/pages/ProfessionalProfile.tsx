import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  User, 
  Clock, 
  MessageCircle, 
  Loader2,
  ArrowLeft,
  CheckCircle,
  Instagram,
  Linkedin,
  Package,
  Play,
  Star,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Logo from "@/components/Logo";
import ScheduleModal from "@/components/profile/ScheduleModal";
import CheckoutOverlay from "@/components/profile/CheckoutOverlay";

interface Profile {
  id: string;
  full_name: string;
  specialty: string;
  crp: string;
  bio: string;
  avatar_url: string;
  phone: string;
  resume_url: string;
  instagram_url: string;
  linkedin_url: string;
}

interface AvailableHour {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

interface SessionPackage {
  sessions: number;
  discount_percent: number;
  price_cents: number;
}

interface ProductConfig {
  is_package?: boolean;
  package_sessions?: number;
  package_discount_percent?: number;
  session_packages?: SessionPackage[];
  image_url?: string;
}

interface CheckoutConfig {
  accentColor?: string;
  sideBanners?: string[];
  videoSettings?: {
    autoplay?: boolean;
    loop?: boolean;
  };
}

interface Service {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price_cents: number;
  is_active: boolean;
  product_config: ProductConfig | null;
  checkout_config: CheckoutConfig | null;
}

interface GatewayConfig {
  accessToken: string;
  gateway: string;
}

const ProfessionalProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [availableHours, setAvailableHours] = useState<AvailableHour[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [gatewayConfig, setGatewayConfig] = useState<GatewayConfig | null>(null);
  
  // Modal states
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);
  const [scheduledTime, setScheduledTime] = useState<string | null>(null);

  const accentColor = selectedService?.checkout_config?.accentColor || "#dc2626";

  useEffect(() => {
    if (id) {
      fetchProfile(id);
    }
  }, [id]);

  const fetchProfile = async (profileId: string) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", profileId)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profileData) {
        setNotFound(true);
        return;
      }

      setProfile({
        id: profileData.id,
        full_name: profileData.full_name || "Profissional",
        specialty: profileData.specialty || "",
        crp: profileData.crp || "",
        bio: profileData.bio || "",
        avatar_url: profileData.avatar_url || "",
        phone: profileData.phone || "",
        resume_url: (profileData as any).resume_url || "",
        instagram_url: (profileData as any).instagram_url || "",
        linkedin_url: (profileData as any).linkedin_url || "",
      });

      // Fetch available hours
      const { data: hoursData, error: hoursError } = await supabase
        .from("available_hours")
        .select("*")
        .eq("professional_id", profileId)
        .eq("is_active", true)
        .order("day_of_week");

      if (hoursError) throw hoursError;
      setAvailableHours(hoursData || []);

      // Fetch active services
      const { data: servicesData, error: servicesError } = await supabase
        .from("services")
        .select("*")
        .eq("professional_id", profileId)
        .eq("is_active", true)
        .order("price_cents", { ascending: true });

      if (servicesError) throw servicesError;
      
      const typedServices: Service[] = (servicesData || []).map((s) => ({
        id: s.id as string,
        name: s.name as string,
        description: s.description as string | null,
        duration_minutes: s.duration_minutes as number,
        price_cents: s.price_cents as number,
        is_active: s.is_active as boolean,
        product_config: s.product_config as ProductConfig | null,
        checkout_config: s.checkout_config as CheckoutConfig | null,
      }));
      
      setServices(typedServices);

      // Select first service by default
      if (typedServices.length > 0) {
        setSelectedService(typedServices[0]);
      }

      // Fetch gateway config
      await fetchGatewayConfig(profileId);

    } catch (error) {
      console.error("Error fetching profile:", error);
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGatewayConfig = async (profId: string) => {
    try {
      const { data, error } = await supabase
        .from("payment_gateways")
        .select("*")
        .eq("professional_id", profId)
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;

      if (data?.card_api_key && data?.card_gateway) {
        const gateway = String(data.card_gateway);
        const raw = String(data.card_api_key);
        let token = raw;

        try {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === "object") {
            const tokenKeyByGateway: Record<string, string> = {
              mercadopago: "accessToken",
              pushinpay: "apiKey",
              pagarme: "apiKey",
              pagseguro: "token",
              stripe: "secretKey",
              asaas: "accessToken",
            };
            const tokenKey = tokenKeyByGateway[gateway];
            if (tokenKey && typeof (parsed as any)[tokenKey] === "string" && (parsed as any)[tokenKey].trim()) {
              token = (parsed as any)[tokenKey];
            }
          }
        } catch {
          // ignore
        }

        if (raw.includes("|")) {
          const parts = raw.split("|");
          if (gateway === "mercadopago" || gateway === "stripe" || gateway === "pagseguro") {
            token = parts[1] || parts[0] || raw;
          } else {
            token = parts[0] || raw;
          }
        }

        setGatewayConfig({
          accessToken: token,
          gateway,
        });
      }
    } catch (error) {
      console.error("Error fetching gateway config:", error);
    }
  };

  const handleScheduleClick = (service: Service) => {
    setSelectedService(service);
    setShowScheduleModal(true);
  };

  const handleScheduleConfirm = (date: Date, time: string) => {
    setScheduledDate(date);
    setScheduledTime(time);
    setShowScheduleModal(false);
    setShowCheckoutModal(true);
  };

  const formatPrice = (priceCents: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(priceCents / 100);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const getSpecialtyTags = (specialty: string) => {
    if (!specialty) return [];
    return specialty.split(",").map(s => s.trim()).filter(Boolean);
  };

  // Get video from first service's checkout config
  const presentationVideo = services[0]?.checkout_config?.sideBanners?.[0];
  const videoSettings = services[0]?.checkout_config?.videoSettings;
  const isVideo = presentationVideo?.match(/\.(mp4|webm|mov)($|\?)/i);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-white mx-auto mb-4" />
          <p className="text-gray-400">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-[#1a1a2e] flex flex-col items-center justify-center p-4">
        <div className="bg-gray-900 rounded-3xl border border-gray-800 p-12 text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-6">
            <User className="h-10 w-10 text-gray-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Profissional não encontrado</h1>
          <p className="text-gray-400 mb-8">O perfil que você está procurando não existe ou não está disponível.</p>
          <Link to="/psicoterapeutas">
            <Button size="lg" className="w-full" style={{ backgroundColor: accentColor }}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Ver todos os profissionais
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const specialtyTags = getSpecialtyTags(profile?.specialty || "");

  return (
    <div className="min-h-screen bg-[#1a1a2e]">
      {/* Header with Logo */}
      <header className="container mx-auto px-4 py-4">
        <Link to="/" className="inline-block hover:opacity-80 transition-opacity">
          <Logo size="sm" />
        </Link>
      </header>

      {/* Hero Section */}
      <section className="relative pb-12">
        <div className="container mx-auto px-4">
          {/* Hero Card */}
          <div 
            className="rounded-3xl overflow-hidden relative"
            style={{ 
              background: `linear-gradient(135deg, ${accentColor}ee, ${accentColor}99, #1a1a2e)` 
            }}
          >
            <div className="p-8 md:p-12 text-center text-white relative z-10">
              {/* Avatar */}
              <div className="relative inline-block mb-6">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full ring-4 ring-white overflow-hidden mx-auto">
                  {profile?.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt={profile.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-white/20 flex items-center justify-center text-3xl font-bold">
                      {getInitials(profile?.full_name || "P")}
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
              </div>

              {/* Name & Info */}
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{profile?.full_name}</h1>
              {profile?.crp && (
                <p className="text-white/80 text-sm mb-4">{profile.crp}</p>
              )}

              {/* Social Icons */}
              <div className="flex items-center justify-center gap-3 mb-6">
                {profile?.instagram_url && (
                  <a
                    href={profile.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {profile?.linkedin_url && (
                  <a
                    href={profile.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                )}
              </div>

              {/* Specialty Tags */}
              {specialtyTags.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  {specialtyTags.map((tag, index) => (
                    <Badge 
                      key={index} 
                      className="bg-white/20 text-white border-white/30 rounded-full px-4 py-1"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Bio */}
              {profile?.bio && (
                <p className="text-white/90 max-w-2xl mx-auto leading-relaxed mb-8">
                  {profile.bio}
                </p>
              )}

              {/* CTA Button */}
              <Button
                size="lg"
                onClick={() => selectedService && handleScheduleClick(selectedService)}
                className="bg-white hover:bg-white/90 text-gray-900 font-bold px-8 py-6 text-lg rounded-xl shadow-xl"
              >
                Quero agendar minha sessão
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Video Section */}
      {presentationVideo && (
        <section className="py-12 bg-[#1a1a2e]">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                {isVideo ? (
                  <video
                    src={presentationVideo}
                    controls
                    autoPlay={videoSettings?.autoplay}
                    loop={videoSettings?.loop}
                    muted={videoSettings?.autoplay}
                    playsInline
                    className="w-full aspect-video object-cover"
                  >
                    Seu navegador não suporta vídeos.
                  </video>
                ) : (
                  <img
                    src={presentationVideo}
                    alt="Apresentação"
                    className="w-full aspect-video object-cover"
                  />
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-16 bg-[#f8f8f8]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Por que escolher meu acompanhamento?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
              <div 
                className="w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center"
                style={{ backgroundColor: `${accentColor}20` }}
              >
                <Clock className="w-7 h-7" style={{ color: accentColor }} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Flexibilidade</h3>
              <p className="text-gray-600 text-sm">Atendimento online com horários flexíveis para sua rotina</p>
            </div>

            <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
              <div 
                className="w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center"
                style={{ backgroundColor: `${accentColor}20` }}
              >
                <CheckCircle className="w-7 h-7" style={{ color: accentColor }} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Experiência</h3>
              <p className="text-gray-600 text-sm">Profissional qualificado e comprometido com seu bem-estar</p>
            </div>

            <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
              <div 
                className="w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center"
                style={{ backgroundColor: `${accentColor}20` }}
              >
                <MessageCircle className="w-7 h-7" style={{ color: accentColor }} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Acolhimento</h3>
              <p className="text-gray-600 text-sm">Ambiente seguro e confidencial para suas sessões</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Veja tudo que você irá receber:
            </h2>
          </div>

          <div className="max-w-2xl mx-auto space-y-4">
            {services.map((service) => {
              const isPackage = service.product_config?.is_package;
              const packageSessions = service.product_config?.package_sessions;
              const packageDiscount = service.product_config?.package_discount_percent;

              return (
                <div
                  key={service.id}
                  className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-100 hover:border-gray-200 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${accentColor}20` }}
                    >
                      {isPackage ? (
                        <Package className="w-6 h-6" style={{ color: accentColor }} />
                      ) : (
                        <Check className="w-6 h-6" style={{ color: accentColor }} />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-bold text-gray-900 mb-1">{service.name}</h3>
                          {service.description && (
                            <p className="text-gray-600 text-sm mb-2">{service.description}</p>
                          )}
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {service.duration_minutes} min
                            </span>
                            {isPackage && packageSessions && (
                              <span className="flex items-center gap-1" style={{ color: accentColor }}>
                                <Package className="w-4 h-4" />
                                {packageSessions} sessões
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right flex-shrink-0">
                          <div className="text-2xl font-bold text-gray-900">
                            {formatPrice(service.price_cents)}
                          </div>
                          {isPackage && packageSessions && (
                            <p className="text-sm text-gray-500">
                              {formatPrice(service.price_cents / packageSessions)}/sessão
                            </p>
                          )}
                          {packageDiscount && packageDiscount > 0 && (
                            <Badge 
                              className="mt-1 text-white"
                              style={{ backgroundColor: accentColor }}
                            >
                              -{packageDiscount}% desconto
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <Button
                        onClick={() => handleScheduleClick(service)}
                        className="w-full mt-4 font-semibold"
                        style={{ backgroundColor: accentColor }}
                      >
                        Agendar Sessão
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}

            {services.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum serviço disponível no momento.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section 
        className="py-16"
        style={{ backgroundColor: accentColor }}
      >
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
            Pronto para começar sua jornada?
          </h2>
          <Button
            size="lg"
            onClick={() => selectedService && handleScheduleClick(selectedService)}
            className="bg-white hover:bg-white/90 text-gray-900 font-bold px-8 py-6 text-lg rounded-xl shadow-xl"
          >
            Agendar minha primeira sessão
          </Button>
        </div>
      </section>

      {/* WhatsApp Contact */}
      {profile?.phone && (
        <section className="py-8 bg-[#1a1a2e]">
          <div className="container mx-auto px-4 text-center">
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                const cleanPhone = profile.phone.replace(/\D/g, "");
                const message = encodeURIComponent(
                  `Olá ${profile.full_name}! Gostaria de agendar uma sessão.`
                );
                window.open(`https://wa.me/55${cleanPhone}?text=${message}`, "_blank");
              }}
              className="border-green-500 text-green-400 hover:bg-green-500/10"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Fale comigo no WhatsApp
            </Button>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-8 bg-[#0d0d1a] text-center text-gray-500 text-sm">
        <div className="container mx-auto px-4">
          <p>© {new Date().getFullYear()} {profile?.full_name}. Todos os direitos reservados.</p>
        </div>
      </footer>

      {/* Schedule Modal */}
      {selectedService && (
        <ScheduleModal
          open={showScheduleModal}
          onClose={() => setShowScheduleModal(false)}
          onConfirm={handleScheduleConfirm}
          availableHours={availableHours}
          service={selectedService}
          accentColor={accentColor}
        />
      )}

      {/* Checkout Overlay */}
      {selectedService && scheduledDate && scheduledTime && profile && (
        <CheckoutOverlay
          open={showCheckoutModal}
          onClose={() => setShowCheckoutModal(false)}
          service={selectedService}
          profile={{ id: profile.id, full_name: profile.full_name, avatar_url: profile.avatar_url }}
          selectedDate={scheduledDate}
          selectedTime={scheduledTime}
          accentColor={accentColor}
          gatewayConfig={gatewayConfig}
        />
      )}
    </div>
  );
};

export default ProfessionalProfile;
