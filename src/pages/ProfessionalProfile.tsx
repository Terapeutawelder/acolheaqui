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
  Instagram,
  Linkedin,
  Youtube,
  Package,
  ShoppingCart,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Logo from "@/components/Logo";

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

interface Service {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price_cents: number;
  is_active: boolean;
  product_config: ProductConfig | null;
}

const dayNames = ["D", "S", "T", "Q", "Q", "S", "S"];
const fullDayNames = [
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
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  
  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

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

  const handleServiceCheckout = (service: Service) => {
    navigate(`/checkout/${service.id}`);
  };

  const formatPrice = (priceCents: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(priceCents / 100);
  };

  const formatPriceSimple = (priceCents: number) => {
    const value = priceCents / 100;
    return value.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
  };

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    return { daysInMonth, startingDay };
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" }).toUpperCase();
  };

  const getAvailableTimesForDay = (dayOfWeek: number) => {
    const dayHours = availableHours.filter(h => h.day_of_week === dayOfWeek);
    const times: string[] = [];
    
    dayHours.forEach(hour => {
      const [startH, startM] = hour.start_time.split(":").map(Number);
      const [endH, endM] = hour.end_time.split(":").map(Number);
      
      let currentH = startH;
      let currentM = startM;
      
      while (currentH < endH || (currentH === endH && currentM < endM)) {
        times.push(`${String(currentH).padStart(2, "0")}:${String(currentM).padStart(2, "0")}`);
        currentM += 60; // 1 hour slots
        if (currentM >= 60) {
          currentH += 1;
          currentM = 0;
        }
      }
    });
    
    return times;
  };

  const isDateAvailable = (date: Date) => {
    const dayOfWeek = date.getDay();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date < today) return false;
    
    return availableHours.some(h => h.day_of_week === dayOfWeek);
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
        <div className="bg-card rounded-3xl border border-border p-12 text-center max-w-md">
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

  const { daysInMonth, startingDay } = getDaysInMonth(currentMonth);
  const specialtyTags = getSpecialtyTags(profile?.specialty || "");
  const availableTimes = selectedDate ? getAvailableTimesForDay(selectedDate.getDay()) : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Main Container */}
      <div className="container mx-auto px-4 py-6 lg:py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">
            {/* Left Column - Profile & Calendar */}
            <div className="lg:col-span-3">
              <div className="bg-card rounded-2xl lg:rounded-3xl border border-border p-6 lg:p-8">
                {/* Logo */}
                <div className="mb-8">
                  <Link to="/" className="hover:opacity-80 transition-opacity inline-block">
                    <Logo size="sm" />
                  </Link>
                </div>

                {/* Profile Section */}
                <div className="flex flex-col items-center text-center mb-8">
                  {/* Avatar */}
                  <div className="relative mb-4">
                    <div className="w-24 h-24 lg:w-28 lg:h-28 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-3xl lg:text-4xl font-bold shadow-lg">
                      {profile?.avatar_url ? (
                        <img 
                          src={profile.avatar_url} 
                          alt={profile.full_name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        getInitials(profile?.full_name || "P")
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary rounded-full flex items-center justify-center border-2 border-card">
                      <CheckCircle className="w-4 h-4 text-primary-foreground" />
                    </div>
                  </div>

                  {/* Name & CRP */}
                  <h1 className="text-xl lg:text-2xl font-bold text-foreground mb-1">
                    {profile?.full_name}
                  </h1>
                  {profile?.crp && (
                    <p className="text-primary text-sm font-medium mb-3">
                      {profile.crp}
                    </p>
                  )}

                  {/* Social Icons */}
                  <div className="flex items-center gap-3 mb-4">
                    {profile?.instagram_url && (
                      <a
                        href={profile.instagram_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        <Instagram className="w-4 h-4" />
                      </a>
                    )}
                    {profile?.linkedin_url && (
                      <a
                        href={profile.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        <Linkedin className="w-4 h-4" />
                      </a>
                    )}
                    <a
                      href="#"
                      className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <Youtube className="w-4 h-4" />
                    </a>
                  </div>

                  {/* Specialty Tags */}
                  {specialtyTags.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-2 mb-6">
                      {specialtyTags.map((tag, index) => (
                        <Badge 
                          key={index} 
                          variant="outline" 
                          className="border-primary text-primary bg-primary/5 rounded-full px-4 py-1"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Bio */}
                  {profile?.bio && (
                    <p className="text-muted-foreground text-sm lg:text-base max-w-lg leading-relaxed">
                      "{profile.bio}"
                    </p>
                  )}
                </div>

                {/* Calendar Section */}
                <div className="border-t border-border pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <span className="text-foreground font-medium">Selecione data e hora</span>
                  </div>

                  {/* Month Navigation */}
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5 text-muted-foreground" />
                    </button>
                    <span className="text-foreground font-medium text-sm">
                      {formatMonthYear(currentMonth)}
                    </span>
                    <button
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </button>
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1 mb-4">
                    {/* Day Headers */}
                    {dayNames.map((day, index) => (
                      <div key={index} className="text-center text-muted-foreground text-sm py-2">
                        {day}
                      </div>
                    ))}

                    {/* Empty cells for start of month */}
                    {Array.from({ length: startingDay }).map((_, index) => (
                      <div key={`empty-${index}`} className="aspect-square" />
                    ))}

                    {/* Calendar Days */}
                    {Array.from({ length: daysInMonth }).map((_, index) => {
                      const day = index + 1;
                      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                      const isAvailable = isDateAvailable(date);
                      const isSelected = selectedDate?.toDateString() === date.toDateString();
                      const isToday = new Date().toDateString() === date.toDateString();

                      return (
                        <button
                          key={day}
                          onClick={() => isAvailable && setSelectedDate(date)}
                          disabled={!isAvailable}
                          className={`
                            aspect-square rounded-full flex items-center justify-center text-sm font-medium transition-all
                            ${isSelected 
                              ? "bg-primary text-primary-foreground" 
                              : isAvailable 
                                ? "hover:bg-primary/20 text-foreground" 
                                : "text-muted-foreground/30 cursor-not-allowed"
                            }
                            ${isToday && !isSelected ? "ring-2 ring-primary ring-offset-2 ring-offset-card" : ""}
                          `}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>

                  {/* Time Slots */}
                  {selectedDate && availableTimes.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
                      {availableTimes.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`
                            py-2.5 px-3 rounded-lg border text-sm font-medium transition-all
                            ${selectedTime === time
                              ? "bg-primary text-primary-foreground border-primary"
                              : "border-border text-foreground hover:border-primary hover:bg-primary/5"
                            }
                          `}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Services Selection */}
            <div className="lg:col-span-2">
              <div className="bg-card rounded-2xl lg:rounded-3xl border border-border p-6 lg:p-8 sticky top-6">
                {/* Section Header */}
                <div className="mb-6">
                  <span className="text-primary text-xs font-semibold tracking-wider uppercase">
                    Escolha seu serviço
                  </span>
                  <h2 className="text-xl lg:text-2xl font-bold text-foreground mt-1">
                    Serviços Disponíveis
                  </h2>
                </div>

                {/* Services List */}
                <div className="space-y-4">
                  {services.length > 0 ? (
                    services.map((service) => {
                      const isPackageService = service.product_config?.is_package;
                      const packageSessions = service.product_config?.package_sessions;
                      const packageDiscount = service.product_config?.package_discount_percent;
                      const isSelected = selectedService?.id === service.id;

                      return (
                        <div
                          key={service.id}
                          onClick={() => setSelectedService(service)}
                          className={`
                            relative p-4 lg:p-5 rounded-xl border-2 cursor-pointer transition-all
                            ${isSelected
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                            }
                          `}
                        >
                          {/* Package Badge */}
                          {isPackageService && packageSessions && (
                            <div className="absolute -top-2.5 right-4">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-lg">
                                <Package className="w-3 h-3" />
                                {packageSessions}x
                                {packageDiscount && packageDiscount > 0 && (
                                  <span className="ml-0.5 opacity-80">
                                    -{packageDiscount}%
                                  </span>
                                )}
                              </span>
                            </div>
                          )}

                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-foreground mb-1 pr-12">
                                {service.name}
                              </h3>
                              {service.description && (
                                <p className="text-muted-foreground text-sm mb-2 line-clamp-2">
                                  {service.description}
                                </p>
                              )}
                              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {service.duration_minutes} min
                                </span>
                                {isPackageService && packageSessions && (
                                  <span className="flex items-center gap-1 text-primary">
                                    <Package className="w-4 h-4" />
                                    {packageSessions} sessões
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="text-right flex-shrink-0">
                              <div className="text-lg lg:text-xl font-bold text-foreground">
                                R$
                              </div>
                              <div className="text-2xl lg:text-3xl font-bold text-foreground -mt-1">
                                {formatPriceSimple(service.price_cents)}
                              </div>
                              {isPackageService && packageSessions && (
                                <div className="text-xs text-muted-foreground mt-0.5">
                                  {formatPrice(service.price_cents / packageSessions)}/sessão
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Selection indicator */}
                          {isSelected && (
                            <div className="absolute top-4 left-4">
                              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                <CheckCircle className="w-3.5 h-3.5 text-primary-foreground" />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Nenhum serviço disponível no momento.</p>
                    </div>
                  )}
                </div>

                {/* Selected Service Info & CTA */}
                {selectedService && selectedDate && selectedTime && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
                      <Clock className="w-4 h-4" />
                      <span>
                        {selectedDate.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })} às {selectedTime}
                      </span>
                    </div>
                  </div>
                )}

                {/* CTA Button */}
                {selectedService && (
                  <Button
                    size="lg"
                    onClick={() => handleServiceCheckout(selectedService)}
                    className="w-full mt-6 h-14 text-base font-semibold gap-2 shadow-lg shadow-primary/25"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Agendar Sessão
                  </Button>
                )}

                {/* WhatsApp Alternative */}
                {profile?.phone && (
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
                    className="w-full mt-3 h-12 text-sm gap-2 border-green-600 text-green-500 hover:bg-green-600/10"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Contato via WhatsApp
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalProfile;
