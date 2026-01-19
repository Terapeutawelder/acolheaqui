import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  User, 
  Clock, 
  MessageCircle, 
  CheckCircle,
  Calendar,
  Instagram,
  Linkedin,
  Youtube,
  Package,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Loader2
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

interface ProfilePreviewProps {
  profileId: string;
  serviceId: string;
  availableHours: AvailableHour[];
}

const dayNames = ["D", "S", "T", "Q", "Q", "S", "S"];

const ProfilePreview = ({ profileId, serviceId, availableHours }: ProfilePreviewProps) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  useEffect(() => {
    if (profileId) {
      fetchData();
    }
  }, [profileId, serviceId]);

  const fetchData = async () => {
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", profileId)
        .maybeSingle();

      if (profileError) throw profileError;

      if (profileData) {
        setProfile({
          id: profileData.id,
          full_name: profileData.full_name || "Profissional",
          specialty: profileData.specialty || "",
          crp: profileData.crp || "",
          bio: profileData.bio || "",
          avatar_url: profileData.avatar_url || "",
          phone: profileData.phone || "",
          instagram_url: (profileData as any).instagram_url || "",
          linkedin_url: (profileData as any).linkedin_url || "",
        });
      }

      // Fetch services
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
      }));
      
      setServices(typedServices);

      // Select the service being edited or first one
      const currentService = typedServices.find(s => s.id === serviceId);
      if (currentService) {
        setSelectedService(currentService);
      } else if (typedServices.length > 0) {
        setSelectedService(typedServices[0]);
      }

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
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
    return date.toLocaleDateString("pt-BR", { month: "short", year: "numeric" }).toUpperCase();
  };

  const getAvailableTimesForDay = (dayOfWeek: number) => {
    const dayHours = availableHours.filter(h => h.day_of_week === dayOfWeek && h.is_active);
    const times: string[] = [];
    
    dayHours.forEach(hour => {
      const [startH, startM] = hour.start_time.split(":").map(Number);
      const [endH, endM] = hour.end_time.split(":").map(Number);
      
      let currentH = startH;
      let currentM = startM;
      
      while (currentH < endH || (currentH === endH && currentM < endM)) {
        times.push(`${String(currentH).padStart(2, "0")}:${String(currentM).padStart(2, "0")}`);
        currentM += 60;
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
    
    return availableHours.some(h => h.day_of_week === dayOfWeek && h.is_active);
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
      <div className="min-h-full bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  const { daysInMonth, startingDay } = getDaysInMonth(currentMonth);
  const specialtyTags = getSpecialtyTags(profile?.specialty || "");
  const availableTimes = selectedDate ? getAvailableTimesForDay(selectedDate.getDay()) : [];

  return (
    <div className="min-h-full bg-background p-3">
      <div className="max-w-4xl mx-auto">
        <div className="grid lg:grid-cols-5 gap-4">
          {/* Left Column - Profile & Calendar */}
          <div className="lg:col-span-3">
            <div className="bg-card rounded-xl border border-border p-4">
              {/* Logo */}
              <div className="mb-4">
                <Logo size="sm" />
              </div>

              {/* Profile Section - Compact */}
              <div className="flex flex-col items-center text-center mb-4">
                {/* Avatar */}
                <div className="relative mb-3">
                  <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xl font-bold shadow-lg">
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
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center border-2 border-card">
                    <CheckCircle className="w-3 h-3 text-primary-foreground" />
                  </div>
                </div>

                {/* Name & CRP */}
                <h1 className="text-base font-bold text-foreground mb-0.5">
                  {profile?.full_name}
                </h1>
                {profile?.crp && (
                  <p className="text-primary text-xs font-medium mb-2">
                    {profile.crp}
                  </p>
                )}

                {/* Social Icons */}
                <div className="flex items-center gap-2 mb-2">
                  {profile?.instagram_url && (
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                      <Instagram className="w-3 h-3" />
                    </div>
                  )}
                  {profile?.linkedin_url && (
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                      <Linkedin className="w-3 h-3" />
                    </div>
                  )}
                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                    <Youtube className="w-3 h-3" />
                  </div>
                </div>

                {/* Specialty Tags */}
                {specialtyTags.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-1 mb-3">
                    {specialtyTags.slice(0, 3).map((tag, index) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className="border-primary text-primary bg-primary/5 rounded-full px-2 py-0 text-[10px]"
                      >
                        {tag}
                      </Badge>
                    ))}
                    {specialtyTags.length > 3 && (
                      <Badge 
                        variant="outline" 
                        className="border-muted-foreground text-muted-foreground rounded-full px-2 py-0 text-[10px]"
                      >
                        +{specialtyTags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Bio - Truncated */}
                {profile?.bio && (
                  <p className="text-muted-foreground text-xs max-w-md leading-relaxed line-clamp-2">
                    "{profile.bio}"
                  </p>
                )}
              </div>

              {/* Calendar Section - Compact */}
              <div className="border-t border-border pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground font-medium text-sm">Selecione data e hora</span>
                </div>

                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-3">
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                    className="p-1 hover:bg-muted rounded transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <span className="text-foreground font-medium text-xs">
                    {formatMonthYear(currentMonth)}
                  </span>
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                    className="p-1 hover:bg-muted rounded transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>

                {/* Calendar Grid - Compact */}
                <div className="grid grid-cols-7 gap-0.5 mb-3">
                  {/* Day Headers */}
                  {dayNames.map((day, index) => (
                    <div key={index} className="text-center text-muted-foreground text-[10px] py-1">
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
                          aspect-square rounded-full flex items-center justify-center text-[10px] font-medium transition-all
                          ${isSelected 
                            ? "bg-primary text-primary-foreground" 
                            : isAvailable 
                              ? "hover:bg-primary/20 text-foreground" 
                              : "text-muted-foreground/30 cursor-not-allowed"
                          }
                          ${isToday && !isSelected ? "ring-1 ring-primary ring-offset-1 ring-offset-card" : ""}
                        `}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>

                {/* Time Slots - Compact */}
                {selectedDate && availableTimes.length > 0 && (
                  <div className="grid grid-cols-4 gap-1">
                    {availableTimes.slice(0, 8).map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`
                          py-1.5 px-2 rounded border text-[10px] font-medium transition-all
                          ${selectedTime === time
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border text-foreground hover:border-primary hover:bg-primary/5"
                          }
                        `}
                      >
                        {time}
                      </button>
                    ))}
                    {availableTimes.length > 8 && (
                      <div className="py-1.5 px-2 text-[10px] text-muted-foreground text-center">
                        +{availableTimes.length - 8}
                      </div>
                    )}
                  </div>
                )}

                {availableHours.filter(h => h.is_active).length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">Nenhum horário configurado</p>
                    <p className="text-[10px]">Configure na seção "Horários"</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Services Selection */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-xl border border-border p-4 sticky top-3">
              {/* Section Header */}
              <div className="mb-4">
                <span className="text-primary text-[10px] font-semibold tracking-wider uppercase">
                  Escolha seu serviço
                </span>
                <h2 className="text-base font-bold text-foreground mt-0.5">
                  Serviços
                </h2>
              </div>

              {/* Services List */}
              <div className="space-y-2">
                {services.length > 0 ? (
                  services.slice(0, 4).map((service) => {
                    const isPackageService = service.product_config?.is_package;
                    const packageSessions = service.product_config?.package_sessions;
                    const packageDiscount = service.product_config?.package_discount_percent;
                    const isSelected = selectedService?.id === service.id;

                    return (
                      <div
                        key={service.id}
                        onClick={() => setSelectedService(service)}
                        className={`
                          relative p-3 rounded-lg border cursor-pointer transition-all
                          ${isSelected
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                          }
                        `}
                      >
                        {/* Package Badge */}
                        {isPackageService && packageSessions && (
                          <div className="absolute -top-2 right-3">
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[9px] font-bold shadow">
                              <Package className="w-2.5 h-2.5" />
                              {packageSessions}x
                              {packageDiscount && packageDiscount > 0 && (
                                <span className="opacity-80">-{packageDiscount}%</span>
                              )}
                            </span>
                          </div>
                        )}

                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground text-xs mb-0.5 pr-8">
                              {service.name}
                            </h3>
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                              <span className="flex items-center gap-0.5">
                                <Clock className="w-3 h-3" />
                                {service.duration_minutes} min
                              </span>
                            </div>
                          </div>

                          <div className="text-right flex-shrink-0">
                            <div className="text-xs font-bold text-foreground">
                              R$ {formatPriceSimple(service.price_cents)}
                            </div>
                            {isPackageService && packageSessions && (
                              <div className="text-[9px] text-muted-foreground">
                                {formatPrice(service.price_cents / packageSessions)}/sessão
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Selection indicator */}
                        {isSelected && (
                          <div className="absolute top-3 left-3">
                            <div className="w-3.5 h-3.5 rounded-full bg-primary flex items-center justify-center">
                              <CheckCircle className="w-2.5 h-2.5 text-primary-foreground" />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">Nenhum serviço disponível.</p>
                  </div>
                )}

                {services.length > 4 && (
                  <p className="text-center text-[10px] text-muted-foreground">
                    +{services.length - 4} serviços
                  </p>
                )}
              </div>

              {/* CTA Button */}
              {selectedService && (
                <Button
                  size="sm"
                  className="w-full mt-4 h-10 text-xs font-semibold gap-1.5 shadow-lg shadow-primary/25"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  Agendar Sessão
                </Button>
              )}

              {/* WhatsApp Alternative */}
              {profile?.phone && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2 h-8 text-[10px] gap-1.5 border-green-600 text-green-500 hover:bg-green-600/10"
                >
                  <MessageCircle className="w-3 h-3" />
                  WhatsApp
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePreview;
