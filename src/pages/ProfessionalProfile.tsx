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
  ShoppingCart
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
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
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

      // Fetch available hours
      const { data: hoursData, error: hoursError } = await supabase
        .from("available_hours")
        .select("*")
        .eq("professional_id", profileId)
        .eq("is_active", true)
        .order("day_of_week");

      if (hoursError) throw hoursError;
      setAvailableHours(hoursData || []);

      // Fetch testimonials
      const { data: testimonialsData, error: testimonialsError } = await supabase
        .from("testimonials")
        .select("*")
        .eq("professional_id", profileId)
        .eq("is_approved", true)
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false });

      if (testimonialsError) throw testimonialsError;
      setTestimonials(testimonialsData || []);

      // Fetch active services
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

      // Select first service by default if available
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
    // Navigate to the checkout page with the service ID
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

  // Calculate average rating
  const averageRating = testimonials.length > 0
    ? testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length
    : 0;

  const renderStars = (rating: number, size: "sm" | "md" | "lg" = "md") => {
    const sizeClasses = {
      sm: "w-4 h-4",
      md: "w-5 h-5",
      lg: "w-6 h-6"
    };
    
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= Math.floor(rating);
          const partial = star === Math.ceil(rating) && rating % 1 !== 0;
          const fillPercentage = partial ? (rating % 1) * 100 : 0;
          
          return (
            <div key={star} className="relative">
              <Star className={`${sizeClasses[size]} text-gray-200`} />
              {filled && (
                <Star className={`${sizeClasses[size]} text-yellow-400 fill-yellow-400 absolute inset-0`} />
              )}
              {partial && (
                <div 
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${fillPercentage}%` }}
                >
                  <Star className={`${sizeClasses[size]} text-yellow-400 fill-yellow-400`} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const formatPrice = (priceCents: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(priceCents / 100);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl border border-border p-12 text-center max-w-md">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="hover:opacity-80 transition-opacity">
            <Logo size="sm" />
          </Link>
          <Link to="/psicoterapeutas">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Ver outros profissionais
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="container mx-auto px-4 py-12 md:py-20 relative">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-[2rem] shadow-2xl shadow-primary/5 border border-border/50 overflow-hidden">
              {/* Gradient Header */}
              <div className="h-40 md:h-52 bg-gradient-to-br from-primary via-primary/90 to-accent relative">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-30" />
                <Sparkles className="absolute top-6 right-6 md:top-8 md:right-8 w-8 h-8 text-white/20" />
                <Heart className="absolute top-16 right-20 w-6 h-6 text-white/15" />
              </div>
              
              {/* Profile Content */}
              <div className="px-6 md:px-12 pb-10 -mt-20 md:-mt-24 relative">
                <div className="flex flex-col lg:flex-row items-start gap-8">
                  {/* Avatar */}
                  <div className="relative group">
                    <div className="w-36 h-36 md:w-44 md:h-44 rounded-2xl bg-white border-4 border-white shadow-2xl overflow-hidden ring-4 ring-primary/10">
                      {profile?.avatar_url ? (
                        <img 
                          src={profile.avatar_url} 
                          alt={profile.full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                          <User className="w-16 h-16 text-muted-foreground/50" />
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 pt-4 lg:pt-8">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                        <Shield className="w-3.5 h-3.5" />
                        Profissional Verificado
                      </span>
                      {profile?.specialty && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent-foreground text-sm font-medium">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          {profile.specialty}
                        </span>
                      )}
                    </div>
                    
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                      {profile?.full_name}
                    </h1>

                    <div className="flex flex-wrap items-center gap-4 mb-4">
                      {profile?.crp && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Award className="h-5 w-5 text-primary" />
                          <span className="font-medium">{profile.crp}</span>
                        </div>
                      )}
                      
                      {/* Social Links */}
                      {hasSocialLinks && (
                        <div className="flex items-center gap-2">
                          {profile?.instagram_url && (
                            <a
                              href={profile.instagram_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center hover:scale-110 transition-transform"
                            >
                              <Instagram className="w-5 h-5 text-white" />
                            </a>
                          )}
                          {profile?.linkedin_url && (
                            <a
                              href={profile.linkedin_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-9 h-9 rounded-full bg-[#0077B5] flex items-center justify-center hover:scale-110 transition-transform"
                            >
                              <Linkedin className="w-5 h-5 text-white" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Rating Display */}
                    {testimonials.length > 0 && (
                      <div className="flex items-center gap-3 mb-6 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200/50">
                        <div className="flex flex-col items-center justify-center px-3 border-r border-amber-200/50">
                          <span className="text-2xl font-bold text-amber-600">
                            {averageRating.toFixed(1)}
                          </span>
                          <span className="text-xs text-amber-600/70">de 5</span>
                        </div>
                        <div>
                          {renderStars(averageRating, "lg")}
                          <p className="text-sm text-muted-foreground mt-1">
                            {testimonials.length} {testimonials.length === 1 ? "avaliação" : "avaliações"}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Quick Actions - Mobile/Tablet */}
                    <div className="flex flex-wrap gap-3 lg:hidden">
                      {profile?.phone && (
                        <Button 
                          size="lg" 
                          onClick={handleWhatsAppContact}
                          className="bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/25 flex-1 min-w-[180px]"
                        >
                          <MessageCircle className="mr-2 h-5 w-5" />
                          Agendar via WhatsApp
                        </Button>
                      )}
                      {profile?.resume_url && (
                        <Button 
                          variant="outline" 
                          size="lg"
                          onClick={() => window.open(profile.resume_url, "_blank")}
                          className="flex-1 min-w-[140px]"
                        >
                          <FileText className="mr-2 h-5 w-5" />
                          Ver Currículo
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* CTA - Desktop */}
                  <div className="hidden lg:flex flex-col gap-3 pt-8">
                    {profile?.phone && (
                      <Button 
                        size="lg" 
                        onClick={handleWhatsAppContact}
                        className="bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/25 px-8"
                      >
                        <MessageCircle className="mr-2 h-5 w-5" />
                        Agendar via WhatsApp
                      </Button>
                    )}
                    {profile?.resume_url && (
                      <Button 
                        variant="outline" 
                        size="lg"
                        onClick={() => window.open(profile.resume_url, "_blank")}
                      >
                        <Download className="mr-2 h-5 w-5" />
                        Baixar Currículo
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Bio & Booking */}
            <div className="lg:col-span-2 space-y-8">
              {/* Bio Section */}
              {profile?.bio && (
                <div className="bg-white rounded-2xl shadow-lg shadow-primary/5 border border-border/50 p-8">
                  <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    Sobre mim
                  </h2>
                  <p className="text-muted-foreground leading-relaxed text-lg whitespace-pre-line">
                    {profile.bio}
                  </p>
                </div>
              )}

              {/* Services Section */}
              {services.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg shadow-primary/5 border border-border/50 p-8">
                  <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                      <Package className="w-5 h-5 text-purple-600" />
                    </div>
                    Serviços Disponíveis
                  </h2>
                  
                  <div className="grid gap-4">
                    {services.map((service) => {
                      const isPackageService = service.product_config?.is_package;
                      const packageSessions = service.product_config?.package_sessions;
                      const packageDiscount = service.product_config?.package_discount_percent;
                      const sessionPackages = service.product_config?.session_packages || [];
                      
                      return (
                        <div
                          key={service.id}
                          className={`relative p-6 rounded-xl border-2 transition-all cursor-pointer ${
                            selectedService?.id === service.id
                              ? "border-primary bg-primary/5 shadow-md"
                              : "border-border/50 hover:border-primary/50 hover:shadow-sm"
                          }`}
                          onClick={() => setSelectedService(service)}
                        >
                          {/* Package Badge */}
                          {isPackageService && packageSessions && (
                            <div className="absolute -top-3 -right-3">
                              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500 to-primary text-white text-xs font-bold shadow-lg">
                                <Package className="w-3.5 h-3.5" />
                                {packageSessions} sessões
                                {packageDiscount && packageDiscount > 0 && (
                                  <span className="ml-1 bg-white/20 px-1.5 py-0.5 rounded-full">
                                    -{packageDiscount}%
                                  </span>
                                )}
                              </span>
                            </div>
                          )}

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-lg text-foreground">{service.name}</h3>
                                {selectedService?.id === service.id && (
                                  <Badge className="bg-primary text-primary-foreground">
                                    Selecionado
                                  </Badge>
                                )}
                              </div>
                              {service.description && (
                                <p className="text-muted-foreground text-sm mb-3">{service.description}</p>
                              )}
                              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  <span>{service.duration_minutes} minutos</span>
                                </div>
                                {isPackageService && packageSessions && (
                                  <div className="flex items-center gap-1 text-purple-600">
                                    <Package className="w-4 h-4" />
                                    <span>{packageSessions} sessões incluídas</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              {isPackageService && packageSessions && packageDiscount && packageDiscount > 0 && (
                                <span className="text-sm text-muted-foreground line-through">
                                  {formatPrice((service.price_cents / (1 - packageDiscount / 100)))}
                                </span>
                              )}
                              <span className="text-2xl font-bold text-primary">
                                {formatPrice(service.price_cents)}
                              </span>
                              {isPackageService && packageSessions && (
                                <span className="text-xs text-muted-foreground">
                                  {formatPrice(service.price_cents / packageSessions)}/sessão
                                </span>
                              )}
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleServiceCheckout(service);
                                }}
                                className="gap-2"
                              >
                                <ShoppingCart className="w-4 h-4" />
                                Comprar agora
                              </Button>
                            </div>
                          </div>

                          {/* Additional Session Packages */}
                          {sessionPackages.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-border/50">
                              <p className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                                <Package className="w-4 h-4" />
                                Pacotes disponíveis:
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {sessionPackages.map((pkg, index) => {
                                  const originalPrice = service.price_cents * pkg.sessions;
                                  const savings = originalPrice - pkg.price_cents;
                                  
                                  return (
                                    <div
                                      key={index}
                                      onClick={(e) => e.stopPropagation()}
                                      className="relative p-4 rounded-lg bg-gradient-to-br from-purple-50 to-primary/5 border border-purple-200/50 hover:border-primary/50 hover:shadow-md transition-all"
                                    >
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-bold text-primary">
                                          {pkg.sessions} sessões
                                        </span>
                                        {pkg.discount_percent > 0 && (
                                          <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                                            -{pkg.discount_percent}%
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex items-baseline gap-2 mb-1">
                                        <span className="text-lg font-bold text-foreground">
                                          {formatPrice(pkg.price_cents)}
                                        </span>
                                        {savings > 0 && (
                                          <span className="text-xs text-muted-foreground line-through">
                                            {formatPrice(originalPrice)}
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-xs text-muted-foreground mb-3">
                                        {formatPrice(pkg.price_cents / pkg.sessions)}/sessão
                                      </p>
                                      {savings > 0 && (
                                        <p className="text-xs text-green-600 font-medium mb-3">
                                          Economize {formatPrice(savings)}
                                        </p>
                                      )}
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="w-full text-xs"
                                        onClick={() => navigate(`/checkout/${service.id}?package=${index}`)}
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
                </div>
              )}

              {/* Testimonials Section */}
              {testimonials.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg shadow-primary/5 border border-border/50 p-8">
                  <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                      <Quote className="w-5 h-5 text-amber-600" />
                    </div>
                    O que meus clientes dizem
                  </h2>
                  
                  <div className="grid gap-6">
                    {testimonials.map((testimonial) => (
                      <div
                        key={testimonial.id}
                        className={`relative p-6 rounded-xl ${
                          testimonial.is_featured
                            ? "bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/20"
                            : "bg-muted/30 border border-border/50"
                        }`}
                      >
                        {testimonial.is_featured && (
                          <div className="absolute -top-2 -right-2">
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary text-white text-xs font-medium">
                              <Star className="w-3 h-3 fill-current" />
                              Destaque
                            </span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-1 mb-3">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-5 h-5 ${
                                star <= testimonial.rating
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                        
                        <p className="text-foreground leading-relaxed mb-4 italic">
                          "{testimonial.content}"
                        </p>
                        
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <span className="font-semibold text-foreground">
                            {testimonial.client_name}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Features Grid */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl shadow-sm border border-border/50 p-6 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mb-4">
                    <Video className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Atendimento Online</h3>
                  <p className="text-muted-foreground text-sm">Sessões por videoconferência com total privacidade e segurança.</p>
                </div>
                
                <div className="bg-white rounded-2xl shadow-sm border border-border/50 p-6 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Agendamento Fácil</h3>
                  <p className="text-muted-foreground text-sm">Escolha o melhor horário diretamente na agenda online.</p>
                </div>
                
                <div className="bg-white rounded-2xl shadow-sm border border-border/50 p-6 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Pagamento Seguro</h3>
                  <p className="text-muted-foreground text-sm">Pague de forma segura com cartão, PIX ou boleto.</p>
                </div>
                
                <div className="bg-white rounded-2xl shadow-sm border border-border/50 p-6 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mb-4">
                    <Clock className="w-6 h-6 text-amber-600" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Sessões de 50 min</h3>
                  <p className="text-muted-foreground text-sm">Tempo ideal para um atendimento completo e efetivo.</p>
                </div>
              </div>

              {/* Booking Calendar */}
              {profile && (
                <div className="bg-white rounded-2xl shadow-lg shadow-primary/5 border border-border/50 overflow-hidden">
                  <div className="p-6 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
                    <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-primary" />
                      </div>
                      Agende sua sessão
                    </h2>
                    {selectedService && (
                      <p className="text-muted-foreground mt-2">
                        Serviço selecionado: <strong>{selectedService.name}</strong> • {formatPrice(selectedService.price_cents)}
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
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Selected Service Summary */}
              {selectedService && (
                <div className="bg-gradient-to-br from-purple-50 to-primary/5 rounded-2xl shadow-lg border border-purple-200/50 p-6 sticky top-24">
                  <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" />
                    Serviço Selecionado
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="font-semibold text-lg text-foreground">{selectedService.name}</p>
                      {selectedService.description && (
                        <p className="text-sm text-muted-foreground mt-1">{selectedService.description}</p>
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-border/50">
                      <span className="text-muted-foreground">Duração</span>
                      <span className="font-medium">{selectedService.duration_minutes} min</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Valor</span>
                      <span className="text-xl font-bold text-primary">{formatPrice(selectedService.price_cents)}</span>
                    </div>
                    <Button 
                      className="w-full mt-4" 
                      size="lg"
                      onClick={() => handleServiceCheckout(selectedService)}
                    >
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Comprar agora
                    </Button>
                  </div>
                </div>
              )}

              {/* Available Hours */}
              <div className="bg-white rounded-2xl shadow-lg shadow-primary/5 border border-border/50 p-6">
                <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  Horários Disponíveis
                </h2>
                
                {Object.keys(groupedHours).length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(groupedHours).map(([day, hours]) => (
                      <div key={day} className="pb-4 border-b border-border/50 last:border-0 last:pb-0">
                        <p className="font-semibold text-foreground mb-2">
                          {dayNames[parseInt(day)]}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {hours.map((hour, idx) => (
                            <span 
                              key={idx}
                              className="text-sm bg-primary/10 text-primary px-3 py-1.5 rounded-lg font-medium"
                            >
                              {hour.start_time.slice(0, 5)} - {hour.end_time.slice(0, 5)}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">
                      Entre em contato para verificar disponibilidade.
                    </p>
                  </div>
                )}
              </div>

              {/* Contact Card */}
              {profile?.phone && (
                <div className="bg-gradient-to-br from-primary via-primary to-primary/90 rounded-2xl p-8 text-white relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-50" />
                  
                  <div className="relative">
                    <Sparkles className="w-8 h-8 text-white/30 mb-4" />
                    <h3 className="font-bold text-xl mb-2">Pronto para começar?</h3>
                    <p className="text-white/80 text-sm mb-6">
                      Dê o primeiro passo na sua jornada de autoconhecimento e bem-estar.
                    </p>
                    <Button 
                      variant="secondary" 
                      className="w-full shadow-lg"
                      onClick={handleWhatsAppContact}
                    >
                      <MessageCircle className="mr-2 h-5 w-5" />
                      Falar no WhatsApp
                    </Button>
                  </div>
                </div>
              )}

              {/* Resume Card */}
              {profile?.resume_url && (
                <div className="bg-white rounded-2xl shadow-sm border border-border/50 p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Currículo</h3>
                      <p className="text-sm text-muted-foreground">Conheça minha formação</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.open(profile.resume_url, "_blank")}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Baixar Currículo
                  </Button>
                </div>
              )}

              {/* Social Links Card */}
              {hasSocialLinks && (
                <div className="bg-white rounded-2xl shadow-sm border border-border/50 p-6">
                  <h3 className="font-semibold text-foreground mb-4">Redes Sociais</h3>
                  <div className="flex gap-3">
                    {profile?.instagram_url && (
                      <a
                        href={profile.instagram_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 text-white font-medium hover:opacity-90 transition-opacity"
                      >
                        <Instagram className="w-5 h-5" />
                        Instagram
                      </a>
                    )}
                    {profile?.linkedin_url && (
                      <a
                        href={profile.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-[#0077B5] text-white font-medium hover:opacity-90 transition-opacity"
                      >
                        <Linkedin className="w-5 h-5" />
                        LinkedIn
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-border/50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto text-center">
            <Link to="/" className="inline-block mb-4">
              <Logo size="sm" />
            </Link>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Conectando você aos melhores profissionais de saúde mental. 
              Encontre o suporte ideal para sua jornada de autoconhecimento.
            </p>
            <div className="mt-6 pt-6 border-t border-border/50">
              <p className="text-muted-foreground/60 text-xs">
                © {new Date().getFullYear()} AcolheAqui. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ProfessionalProfile;
