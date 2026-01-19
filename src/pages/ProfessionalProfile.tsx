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
  Star,
  Check,
  Video,
  Shield,
  Heart,
  Calendar
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

interface Testimonial {
  id: string;
  client_name: string;
  content: string;
  rating: number;
  is_featured: boolean;
}

const ProfessionalProfile = () => {
  const params = useParams<{ id?: string; slug?: string }>();
  const id = params.id || params.slug;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [availableHours, setAvailableHours] = useState<AvailableHour[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [gatewayConfig, setGatewayConfig] = useState<GatewayConfig | null>(null);
  
  // Modal states
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);
  const [scheduledTime, setScheduledTime] = useState<string | null>(null);

  const accentColor = selectedService?.checkout_config?.accentColor || services[0]?.checkout_config?.accentColor || "#7c3aed";

  useEffect(() => {
    if (id) {
      fetchProfile(id);
    }
  }, [id]);

  const fetchProfile = async (profileIdOrSlug: string) => {
    try {
      // Try to find by ID first (UUID format)
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(profileIdOrSlug);
      
      let profileData = null;
      let profileError = null;

      if (isUUID) {
        const result = await supabase
          .from("profiles")
          .select("*")
          .eq("id", profileIdOrSlug)
          .maybeSingle();
        profileData = result.data;
        profileError = result.error;
      }

      // If not found by ID, try by user_slug
      if (!profileData && !profileError) {
        const result = await supabase
          .from("profiles")
          .select("*")
          .eq("user_slug", profileIdOrSlug)
          .maybeSingle();
        profileData = result.data;
        profileError = result.error;
      }

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

      const actualProfileId = profileData.id;

      // Fetch available hours
      const { data: hoursData, error: hoursError } = await supabase
        .from("available_hours")
        .select("*")
        .eq("professional_id", actualProfileId)
        .eq("is_active", true)
        .order("day_of_week");

      if (hoursError) throw hoursError;
      setAvailableHours(hoursData || []);

      // Fetch active services
      const { data: servicesData, error: servicesError } = await supabase
        .from("services")
        .select("*")
        .eq("professional_id", actualProfileId)
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

      // Fetch testimonials
      const { data: testimonialsData, error: testimonialsError } = await supabase
        .from("testimonials")
        .select("*")
        .eq("professional_id", actualProfileId)
        .eq("is_approved", true)
        .order("is_featured", { ascending: false })
        .limit(6);

      if (!testimonialsError && testimonialsData) {
        setTestimonials(testimonialsData.map(t => ({
          id: t.id,
          client_name: t.client_name,
          content: t.content,
          rating: t.rating,
          is_featured: t.is_featured || false,
        })));
      }

      // Fetch gateway config
      await fetchGatewayConfig(actualProfileId);

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

  // Calculate average rating
  const averageRating = testimonials.length > 0 
    ? testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length 
    : 0;

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= Math.floor(rating);
          const partial = star === Math.ceil(rating) && rating % 1 !== 0;
          const fillPercentage = partial ? (rating % 1) * 100 : 0;
          
          return (
            <div key={star} className="relative">
              <Star className="w-4 h-4 text-muted" />
              {filled && (
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 absolute inset-0" />
              )}
              {partial && (
                <div 
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${fillPercentage}%` }}
                >
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="bg-card rounded-2xl border border-border p-12 text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
            <User className="h-10 w-10 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">Profissional não encontrado</h1>
          <p className="text-muted-foreground mb-8">O perfil que você está procurando não existe ou não está disponível.</p>
          <Link to="/psicoterapeutas">
            <Button size="lg" className="w-full">
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="hover:opacity-80 transition-opacity">
            <Logo size="sm" />
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Início
            </Link>
            <Link to="/psicoterapeutas" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Encontrar profissionais
            </Link>
          </nav>
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            <ArrowLeft size={16} />
            Voltar
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Profile Card */}
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-sm">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Avatar */}
                <div className="relative mx-auto md:mx-0">
                  <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl overflow-hidden ring-4 ring-primary/20">
                    {profile?.avatar_url ? (
                      <img 
                        src={profile.avatar_url} 
                        alt={profile.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-3xl font-bold text-primary">
                        {getInitials(profile?.full_name || "P")}
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-2 border-background">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                      <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                        {profile?.full_name}
                      </h1>
                      {profile?.crp && (
                        <p className="text-muted-foreground text-sm mb-3">{profile.crp}</p>
                      )}

                      {/* Rating */}
                      {testimonials.length > 0 && (
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                          {renderStars(averageRating)}
                          <span className="text-sm font-medium text-foreground">{averageRating.toFixed(1)}</span>
                          <span className="text-sm text-muted-foreground">({testimonials.length} avaliações)</span>
                        </div>
                      )}

                      {/* Specialty Tags */}
                      {specialtyTags.length > 0 && (
                        <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                          {specialtyTags.map((tag, index) => (
                            <Badge 
                              key={index} 
                              variant="secondary"
                              className="rounded-full px-3 py-1"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Social Links */}
                    <div className="flex items-center justify-center md:justify-start gap-2">
                      {profile?.instagram_url && (
                        <a
                          href={profile.instagram_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary/20 transition-colors"
                        >
                          <Instagram className="w-5 h-5 text-muted-foreground" />
                        </a>
                      )}
                      {profile?.linkedin_url && (
                        <a
                          href={profile.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary/20 transition-colors"
                        >
                          <Linkedin className="w-5 h-5 text-muted-foreground" />
                        </a>
                      )}
                      {profile?.phone && (
                        <a
                          href={`https://wa.me/55${profile.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá ${profile.full_name}! Gostaria de agendar uma sessão.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center hover:bg-green-500/30 transition-colors"
                        >
                          <MessageCircle className="w-5 h-5 text-green-500" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Bio */}
                  {profile?.bio && (
                    <p className="text-muted-foreground leading-relaxed mt-4">
                      {profile.bio}
                    </p>
                  )}

                  {/* CTA Button */}
                  <Button
                    size="lg"
                    onClick={() => selectedService && handleScheduleClick(selectedService)}
                    className="mt-6 w-full md:w-auto px-8"
                    style={{ backgroundColor: accentColor }}
                  >
                    <Calendar className="w-5 h-5 mr-2" />
                    Agendar minha sessão
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Section */}
      {presentationVideo && (
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="rounded-2xl overflow-hidden border border-border shadow-lg">
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
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl md:text-2xl font-bold text-foreground text-center mb-8">
              Por que escolher meu acompanhamento?
            </h2>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-card rounded-xl border border-border p-5 text-center hover:border-primary/50 hover:shadow-lg transition-all">
                <div className="w-12 h-12 rounded-xl bg-primary/10 mx-auto mb-3 flex items-center justify-center">
                  <Video className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">Atendimento Online</h3>
                <p className="text-muted-foreground text-sm">Sessões por vídeo no conforto da sua casa</p>
              </div>

              <div className="bg-card rounded-xl border border-border p-5 text-center hover:border-primary/50 hover:shadow-lg transition-all">
                <div className="w-12 h-12 rounded-xl bg-primary/10 mx-auto mb-3 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">Sigilo Total</h3>
                <p className="text-muted-foreground text-sm">Ambiente seguro e confidencial</p>
              </div>

              <div className="bg-card rounded-xl border border-border p-5 text-center hover:border-primary/50 hover:shadow-lg transition-all">
                <div className="w-12 h-12 rounded-xl bg-primary/10 mx-auto mb-3 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">Acolhimento</h3>
                <p className="text-muted-foreground text-sm">Escuta empática e sem julgamentos</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl md:text-2xl font-bold text-foreground text-center mb-8">
              Serviços disponíveis
            </h2>

            <div className="grid gap-4">
              {services.map((service) => {
                const isPackage = service.product_config?.is_package;
                const packageSessions = service.product_config?.package_sessions;
                const packageDiscount = service.product_config?.package_discount_percent;

                return (
                  <div
                    key={service.id}
                    className="bg-card rounded-xl border border-border p-5 hover:border-primary/50 hover:shadow-lg transition-all"
                  >
                    <div className="flex flex-col sm:flex-row gap-4">
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
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div>
                            <h3 className="font-semibold text-foreground mb-1">{service.name}</h3>
                            {service.description && (
                              <p className="text-muted-foreground text-sm mb-2">{service.description}</p>
                            )}
                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
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
                          
                          <div className="text-left sm:text-right flex-shrink-0">
                            <div className="text-2xl font-bold text-foreground">
                              {formatPrice(service.price_cents)}
                            </div>
                            {isPackage && packageSessions && (
                              <p className="text-sm text-muted-foreground">
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
                          className="w-full sm:w-auto mt-4 font-medium"
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
                <div className="text-center py-12 text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhum serviço disponível no momento.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      {testimonials.length > 0 && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-xl md:text-2xl font-bold text-foreground text-center mb-8">
                O que dizem sobre mim
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                {testimonials.slice(0, 4).map((testimonial) => (
                  <div
                    key={testimonial.id}
                    className="bg-card rounded-xl border border-border p-5 hover:border-primary/50 transition-all"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      {renderStars(testimonial.rating)}
                    </div>
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-3">
                      "{testimonial.content}"
                    </p>
                    <p className="text-foreground font-medium text-sm">
                      — {testimonial.client_name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="py-12 bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">
            Pronto para começar sua jornada?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Agende sua primeira sessão e dê o primeiro passo para o seu bem-estar.
          </p>
          <Button
            size="lg"
            onClick={() => selectedService && handleScheduleClick(selectedService)}
            className="px-8"
            style={{ backgroundColor: accentColor }}
          >
            Agendar minha primeira sessão
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-card border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Logo size="sm" />
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} {profile?.full_name}. Todos os direitos reservados.
            </p>
          </div>
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
