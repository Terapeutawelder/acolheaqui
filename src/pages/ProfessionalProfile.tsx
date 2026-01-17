import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
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
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
}

interface AvailableHour {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
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
  const [profile, setProfile] = useState<Profile | null>(null);
  const [availableHours, setAvailableHours] = useState<AvailableHour[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProfile(id);
    }
  }, [id]);

  const fetchProfile = async (profileId: string) => {
    try {
      // Fetch profile - allow viewing if is_professional OR if it's the user's own profile
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
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="container mx-auto px-4 py-12 md:py-20 relative">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-[2rem] shadow-2xl shadow-primary/5 border border-border/50 overflow-hidden">
              {/* Gradient Header */}
              <div className="h-40 md:h-52 bg-gradient-to-br from-primary via-primary/90 to-accent relative">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-30" />
                
                {/* Decorative Elements */}
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
                    {/* Verified Badge */}
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

                    {profile?.crp && (
                      <div className="flex items-center gap-2 text-muted-foreground mb-6">
                        <Award className="h-5 w-5 text-primary" />
                        <span className="font-medium">{profile.crp}</span>
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
              {/* Available Hours */}
              <div className="bg-white rounded-2xl shadow-lg shadow-primary/5 border border-border/50 p-6 sticky top-24">
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
                  {/* Decorative Pattern */}
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