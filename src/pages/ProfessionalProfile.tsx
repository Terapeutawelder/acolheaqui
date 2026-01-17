import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  User, 
  Clock, 
  MessageCircle, 
  Award,
  Loader2,
  ArrowLeft,
  CheckCircle,
  Calendar,
  Video,
  Shield,
  Star,
  FileText,
  Download,
  Heart,
  Sparkles,
  Instagram,
  Linkedin,
  Quote,
  Package,
  CreditCard,
  ShoppingCart,
  MapPin,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Logo from "@/components/Logo";
import BookingCalendar from "@/components/booking/BookingCalendar";

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

interface Testimonial {
  id: string;
  client_name: string;
  rating: number;
  content: string;
  is_featured: boolean;
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

interface Service {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price_cents: number;
  is_active: boolean;
  product_config: ProductConfig | null;
}

const dayNames = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

const ProfessionalProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [availableHours, setAvailableHours] = useState<AvailableHour[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

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

      const { data: hoursData, error: hoursError } = await supabase
        .from("available_hours")
        .select("*")
        .eq("professional_id", profileId)
        .eq("is_active", true)
        .order("day_of_week");

      if (hoursError) throw hoursError;
      setAvailableHours(hoursData || []);

      const { data: testimonialsData, error: testimonialsError } = await supabase
        .from("testimonials")
        .select("*")
        .eq("professional_id", profileId)
        .eq("is_approved", true)
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false });

      if (testimonialsError) throw testimonialsError;
      setTestimonials(testimonialsData || []);

      const { data: servicesData, error: servicesError } = await supabase
        .from("public_services")
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
      }));
      
      setServices(typedServices);

      if (typedServices.length > 0) {
        setSelectedService(typedServices[0]);
      }

    } catch (error) {
      console.error("Error fetching profile:", error);
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWhatsAppContact = () => {
    if (!profile?.phone) return;
    
    const cleanPhone = profile.phone.replace(/\D/g, "");
    const message = encodeURIComponent(
      `Olá ${profile.full_name}! Encontrei seu perfil no AcolheAqui e gostaria de agendar uma sessão.`
    );
    window.open(`https://wa.me/55${cleanPhone}?text=${message}`, "_blank");
  };

  const handleServiceCheckout = (service: Service) => {
    navigate(`/checkout/${service.id}`);
  };

  const groupHoursByDay = () => {
    const grouped: Record<number, AvailableHour[]> = {};
    availableHours.forEach(hour => {
      if (!grouped[hour.day_of_week]) {
        grouped[hour.day_of_week] = [];
      }
      grouped[hour.day_of_week].push(hour);
    });
    return grouped;
  };

  const averageRating = testimonials.length > 0
    ? testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length
    : 0;

  const formatPrice = (priceCents: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(priceCents / 100);
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
        <div className="bg-card rounded-2xl shadow-lg border border-border p-12 text-center max-w-md">
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

  const groupedHours = groupHoursByDay();
  const hasSocialLinks = profile?.instagram_url || profile?.linkedin_url;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-xl border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="hover:opacity-80 transition-opacity">
            <Logo size="sm" />
          </Link>
          <Link to="/psicoterapeutas">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Ver outros profissionais</span>
              <span className="sm:hidden">Voltar</span>
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Left Column - Profile Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Card */}
              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                {/* Cover */}
                <div className="h-24 bg-gradient-to-r from-primary via-primary/80 to-accent relative">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.1),transparent)]" />
                </div>
                
                {/* Profile Content */}
                <div className="px-6 pb-6 -mt-12 relative">
                  {/* Avatar */}
                  <div className="relative inline-block mb-4">
                    <div className="w-24 h-24 rounded-xl bg-card border-4 border-card shadow-lg overflow-hidden">
                      {profile?.avatar_url ? (
                        <img 
                          src={profile.avatar_url} 
                          alt={profile.full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <User className="w-10 h-10 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary rounded-lg flex items-center justify-center shadow">
                      <CheckCircle className="w-4 h-4 text-primary-foreground" />
                    </div>
                  </div>

                  {/* Name & Specialty */}
                  <h1 className="text-2xl font-bold text-foreground mb-1">
                    {profile?.full_name}
                  </h1>
                  
                  {profile?.specialty && (
                    <p className="text-primary font-medium mb-3">{profile.specialty}</p>
                  )}

                  {/* CRP Badge */}
                  {profile?.crp && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted text-sm mb-4">
                      <Award className="h-4 w-4 text-primary" />
                      <span className="font-medium text-foreground">{profile.crp}</span>
                    </div>
                  )}

                  {/* Rating */}
                  {testimonials.length > 0 && (
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= Math.round(averageRating)
                                ? "text-amber-400 fill-amber-400"
                                : "text-muted"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {averageRating.toFixed(1)} ({testimonials.length} avaliações)
                      </span>
                    </div>
                  )}

                  {/* Quick Info */}
                  <div className="flex flex-wrap gap-3 mb-6">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Video className="w-4 h-4" />
                      <span>Online</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>50 min</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Shield className="w-4 h-4" />
                      <span>Verificado</span>
                    </div>
                  </div>

                  {/* Social Links */}
                  {hasSocialLinks && (
                    <div className="flex gap-2 mb-6">
                      {profile?.instagram_url && (
                        <a
                          href={profile.instagram_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center hover:scale-105 transition-transform"
                        >
                          <Instagram className="w-5 h-5 text-white" />
                        </a>
                      )}
                      {profile?.linkedin_url && (
                        <a
                          href={profile.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-lg bg-[#0077B5] flex items-center justify-center hover:scale-105 transition-transform"
                        >
                          <Linkedin className="w-5 h-5 text-white" />
                        </a>
                      )}
                    </div>
                  )}

                  {/* CTA Buttons */}
                  <div className="space-y-2">
                    {profile?.phone && (
                      <Button 
                        size="lg" 
                        onClick={handleWhatsAppContact}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        <MessageCircle className="mr-2 h-5 w-5" />
                        Falar no WhatsApp
                      </Button>
                    )}
                    {profile?.resume_url && (
                      <Button 
                        variant="outline" 
                        size="lg"
                        className="w-full"
                        onClick={() => window.open(profile.resume_url, "_blank")}
                      >
                        <FileText className="mr-2 h-5 w-5" />
                        Ver Currículo
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Bio Card */}
              {profile?.bio && (
                <div className="bg-card rounded-2xl border border-border p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Sobre
                  </h2>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {profile.bio}
                  </p>
                </div>
              )}

              {/* Available Hours */}
              {Object.keys(groupedHours).length > 0 && (
                <div className="bg-card rounded-2xl border border-border p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    Horários
                  </h2>
                  <div className="space-y-3">
                    {Object.entries(groupedHours).map(([day, hours]) => (
                      <div key={day} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <span className="font-medium text-foreground text-sm">
                          {dayNames[parseInt(day)]}
                        </span>
                        <div className="flex flex-wrap gap-1.5 justify-end">
                          {hours.map((hour, idx) => (
                            <span 
                              key={idx}
                              className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-md font-medium"
                            >
                              {hour.start_time.slice(0, 5)} - {hour.end_time.slice(0, 5)}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Testimonials */}
              {testimonials.length > 0 && (
                <div className="bg-card rounded-2xl border border-border p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Quote className="w-5 h-5 text-primary" />
                    Avaliações
                  </h2>
                  <div className="space-y-4">
                    {testimonials.slice(0, 3).map((testimonial) => (
                      <div
                        key={testimonial.id}
                        className="p-4 rounded-xl bg-muted/50 border border-border"
                      >
                        <div className="flex items-center gap-1 mb-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= testimonial.rating
                                  ? "text-amber-400 fill-amber-400"
                                  : "text-muted"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-foreground leading-relaxed mb-3">
                          "{testimonial.content}"
                        </p>
                        <p className="text-xs font-medium text-muted-foreground">
                          — {testimonial.client_name}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Services & Calendar */}
            <div className="lg:col-span-3 space-y-6">
              {/* Services Section */}
              {services.length > 0 && (
                <div className="bg-card rounded-2xl border border-border p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5 text-primary" />
                    Serviços Disponíveis
                  </h2>
                  
                  <div className="grid gap-3">
                    {services.map((service) => {
                      const isPackageService = service.product_config?.is_package;
                      const packageSessions = service.product_config?.package_sessions;
                      const packageDiscount = service.product_config?.package_discount_percent;
                      const sessionPackages = service.product_config?.session_packages || [];
                      const isSelected = selectedService?.id === service.id;
                      
                      return (
                        <div key={service.id} className="space-y-3">
                          <div
                            className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer ${
                              isSelected
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/50"
                            }`}
                            onClick={() => setSelectedService(service)}
                          >
                            {/* Package Badge */}
                            {isPackageService && packageSessions && (
                              <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-primary text-white border-0">
                                <Package className="w-3 h-3 mr-1" />
                                {packageSessions} sessões
                                {packageDiscount && packageDiscount > 0 && ` -${packageDiscount}%`}
                              </Badge>
                            )}

                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-foreground truncate">{service.name}</h3>
                                  {isSelected && (
                                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                                  )}
                                </div>
                                {service.description && (
                                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{service.description}</p>
                                )}
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    {service.duration_minutes} min
                                  </span>
                                  {isPackageService && packageSessions && (
                                    <span className="flex items-center gap-1 text-purple-600">
                                      <Package className="w-3.5 h-3.5" />
                                      {packageSessions} sessões
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0">
                                {isPackageService && packageSessions && packageDiscount && packageDiscount > 0 && (
                                  <p className="text-xs text-muted-foreground line-through">
                                    {formatPrice((service.price_cents / (1 - packageDiscount / 100)))}
                                  </p>
                                )}
                                <p className="text-xl font-bold text-primary">
                                  {formatPrice(service.price_cents)}
                                </p>
                                {isPackageService && packageSessions && (
                                  <p className="text-xs text-muted-foreground">
                                    {formatPrice(service.price_cents / packageSessions)}/sessão
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Session Packages */}
                          {isSelected && sessionPackages.length > 0 && (
                            <div className="pl-4 border-l-2 border-primary/30 space-y-2">
                              <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                Pacotes disponíveis:
                              </p>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {sessionPackages.map((pkg, index) => {
                                  const originalPrice = service.price_cents * pkg.sessions;
                                  const savings = originalPrice - pkg.price_cents;
                                  
                                  return (
                                    <div
                                      key={index}
                                      className="p-3 rounded-lg bg-gradient-to-br from-purple-50 to-primary/5 border border-purple-200/50 hover:border-primary/50 transition-colors"
                                    >
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-bold text-primary">
                                          {pkg.sessions} sessões
                                        </span>
                                        {pkg.discount_percent > 0 && (
                                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-green-100 text-green-700">
                                            -{pkg.discount_percent}%
                                          </Badge>
                                        )}
                                      </div>
                                      <p className="text-sm font-bold text-foreground">
                                        {formatPrice(pkg.price_cents)}
                                      </p>
                                      {savings > 0 && (
                                        <p className="text-[10px] text-green-600">
                                          Economia: {formatPrice(savings)}
                                        </p>
                                      )}
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="w-full mt-2 h-7 text-xs"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigate(`/checkout/${service.id}?package=${index}`);
                                        }}
                                      >
                                        Selecionar
                                      </Button>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Selected Service CTA */}
                  {selectedService && (
                    <div className="mt-6 pt-6 border-t border-border">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Serviço selecionado</p>
                          <p className="font-semibold text-foreground">{selectedService.name}</p>
                        </div>
                        <p className="text-2xl font-bold text-primary">
                          {formatPrice(selectedService.price_cents)}
                        </p>
                      </div>
                      <Button 
                        size="lg"
                        className="w-full"
                        onClick={() => handleServiceCheckout(selectedService)}
                      >
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        Comprar agora
                        <ChevronRight className="ml-2 h-5 w-5" />
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Calendar Section - Prominent Position */}
              {profile && (
                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                  <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-primary/5 via-primary/3 to-transparent">
                    <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      Agendar Sessão
                    </h2>
                    {selectedService && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedService.name} • {formatPrice(selectedService.price_cents)}
                      </p>
                    )}
                  </div>
                  <div className="p-6">
                    <BookingCalendar
                      professionalId={profile.id}
                      professionalName={profile.full_name}
                      professionalPhone={profile.phone}
                      availableHours={availableHours}
                    />
                  </div>
                </div>
              )}

              {/* Features */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="bg-card rounded-xl border border-border p-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Video className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground text-sm">Atendimento Online</h3>
                    <p className="text-xs text-muted-foreground">Sessões por vídeo com total privacidade</p>
                  </div>
                </div>
                
                <div className="bg-card rounded-xl border border-border p-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground text-sm">Pagamento Seguro</h3>
                    <p className="text-xs text-muted-foreground">PIX, cartão ou boleto</p>
                  </div>
                </div>
                
                <div className="bg-card rounded-xl border border-border p-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground text-sm">Agendamento Fácil</h3>
                    <p className="text-xs text-muted-foreground">Escolha o melhor horário</p>
                  </div>
                </div>
                
                <div className="bg-card rounded-xl border border-border p-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Heart className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground text-sm">Sessões de 50 min</h3>
                    <p className="text-xs text-muted-foreground">Tempo ideal para atendimento</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8 mt-8">
        <div className="container mx-auto px-4 text-center">
          <Link to="/" className="inline-block mb-3">
            <Logo size="sm" />
          </Link>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} AcolheAqui. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ProfessionalProfile;
