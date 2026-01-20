import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  User, 
  Clock, 
  MessageCircle, 
  Loader2,
  Heart,
  Calendar,
  Sparkles,
  Brain,
  Users,
  Star,
  Check,
  Package,
  CalendarDays,
  Mail,
  MapPin,
  Phone,
  ChevronDown,
  GraduationCap,
  Award,
  Menu,
  X,
  Send,
  Instagram,
  Linkedin,
  Facebook
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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
  email: string;
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
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Modal states
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);
  const [scheduledTime, setScheduledTime] = useState<string | null>(null);

  // Primary color from first service or default teal
  const primaryColor = services[0]?.checkout_config?.accentColor || "#14b8a6";
  const secondaryColor = "#f0fdfa";
  const accentColor = "#facc15";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (id) {
      fetchProfile(id);
    }
  }, [id]);

  const fetchProfile = async (profileIdOrSlug: string) => {
    try {
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
        email: profileData.email || "",
        resume_url: (profileData as any).resume_url || "",
        instagram_url: (profileData as any).instagram_url || "",
        linkedin_url: (profileData as any).linkedin_url || "",
      });

      const actualProfileId = profileData.id;

      const { data: hoursData, error: hoursError } = await supabase
        .from("available_hours")
        .select("*")
        .eq("professional_id", actualProfileId)
        .eq("is_active", true)
        .order("day_of_week");

      if (hoursError) throw hoursError;
      setAvailableHours(hoursData || []);

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

      if (typedServices.length > 0) {
        setSelectedService(typedServices[0]);
      }

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

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
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

  // Calculate average rating
  const averageRating = testimonials.length > 0 
    ? testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length 
    : 5.0;

  // Default services for display
  const defaultServiceCards = [
    { icon: Brain, title: "Terapia Individual", description: "Sessões personalizadas para trabalhar questões emocionais, comportamentais e de desenvolvimento pessoal." },
    { icon: Users, title: "Terapia de Casal", description: "Apoio para casais que desejam melhorar a comunicação e fortalecer o relacionamento." },
    { icon: Heart, title: "Ansiedade e Depressão", description: "Tratamento especializado para transtornos de ansiedade e depressão com abordagem humanizada." },
    { icon: Sparkles, title: "Autoconhecimento", description: "Processo terapêutico focado em desenvolver maior consciência de si mesmo e seu potencial." },
  ];

  // FAQ items
  const faqItems = [
    { question: "Como funciona a terapia online?", answer: "As sessões são realizadas por videochamada em uma plataforma segura e privada. Você pode participar do conforto da sua casa, precisando apenas de uma conexão estável de internet e um local reservado." },
    { question: "Qual a duração de cada sessão?", answer: "As sessões têm duração de 50 minutos a 1 hora, dependendo do tipo de atendimento escolhido. O tempo é adequado para trabalharmos as questões de forma profunda e produtiva." },
    { question: "Com que frequência devo fazer terapia?", answer: "Geralmente recomendamos sessões semanais no início do processo terapêutico. Conforme sua evolução, podemos ajustar a frequência para quinzenal ou mensal." },
    { question: "A terapia online é tão eficaz quanto a presencial?", answer: "Sim, diversas pesquisas científicas demonstram que a terapia online tem a mesma eficácia que a presencial para a maioria dos casos, com a vantagem da praticidade e flexibilidade." },
    { question: "Como funciona o sigilo profissional?", answer: "O sigilo é garantido pelo Código de Ética do psicólogo. Todas as informações compartilhadas nas sessões são estritamente confidenciais e protegidas por lei." },
    { question: "Posso cancelar ou remarcar uma sessão?", answer: "Sim, você pode cancelar ou remarcar com até 24 horas de antecedência. Cancelamentos fora desse prazo podem estar sujeitos a cobrança conforme nossa política." },
  ];

  const navLinks = [
    { label: "Início", id: "inicio" },
    { label: "Serviços", id: "servicos" },
    { label: "Sobre", id: "sobre" },
    { label: "Agenda", id: "agenda" },
    { label: "Contato", id: "contato" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4" style={{ color: primaryColor }} />
          <p className="text-gray-500">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center max-w-md shadow-lg">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
            <User className="h-10 w-10 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Profissional não encontrado</h1>
          <p className="text-gray-500 mb-8">O perfil que você está procurando não existe ou não está disponível.</p>
          <Link to="/psicoterapeutas">
            <Button size="lg" className="w-full" style={{ backgroundColor: primaryColor }}>
              Ver todos os profissionais
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#fafaf8" }}>
      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-xl shadow-lg py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-between">
            {/* Logo */}
            <a href="#inicio" className="flex items-center gap-2 group">
              <div 
                className="relative w-11 h-11 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105"
                style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)` }}
              >
                <Heart className="w-5 h-5 text-white" />
                <Sparkles className="absolute -top-1 -right-1 w-3 h-3" style={{ color: accentColor }} />
              </div>
              <span className="font-serif text-xl text-gray-800">{profile?.full_name || "Profissional"}</span>
            </a>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => scrollToSection(link.id)}
                  className="relative text-gray-500 hover:text-gray-900 transition-colors duration-300 text-sm font-semibold group"
                >
                  {link.label}
                  <span 
                    className="absolute -bottom-1 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300"
                    style={{ backgroundColor: primaryColor }}
                  />
                </button>
              ))}
            </div>

            {/* CTA Button */}
            <div className="hidden md:block">
              <Button 
                onClick={() => scrollToSection("agenda")}
                className="text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 font-semibold"
                style={{ background: `linear-gradient(to right, ${primaryColor}, ${primaryColor}dd)` }}
              >
                Agendar Consulta
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-gray-800 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </nav>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 bg-white/98 backdrop-blur-xl border-b border-gray-200 shadow-xl animate-fade-in">
              <div className="container mx-auto px-4 py-6 space-y-4">
                {navLinks.map((link, index) => (
                  <button
                    key={link.label}
                    onClick={() => scrollToSection(link.id)}
                    className="block w-full text-left text-gray-800 hover:text-gray-600 transition-colors duration-200 py-2 text-lg font-semibold"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {link.label}
                  </button>
                ))}
                <Button 
                  onClick={() => scrollToSection("agenda")}
                  className="w-full text-white mt-4 shadow-lg font-semibold"
                  style={{ background: `linear-gradient(to right, ${primaryColor}, ${primaryColor}dd)` }}
                >
                  Agendar Consulta
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section 
        id="inicio"
        className="relative min-h-[80vh] flex items-center justify-center overflow-hidden pt-28 pb-20"
        style={{ 
          background: `linear-gradient(to bottom, #fafaf8, ${secondaryColor}50, #fafaf8)`
        }}
      >
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse"
            style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor}80)` }}
          />
          <div 
            className="absolute top-1/3 -left-32 w-80 h-80 rounded-full blur-3xl opacity-15"
            style={{ background: `linear-gradient(135deg, ${secondaryColor}, ${primaryColor}40)` }}
          />
          <div 
            className="absolute bottom-20 right-1/4 w-64 h-64 rounded-full blur-3xl opacity-10"
            style={{ background: `linear-gradient(135deg, ${accentColor}60, ${primaryColor}40)` }}
          />
          
          {/* Floating dots */}
          <div className="absolute top-1/4 right-1/4 w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: primaryColor, opacity: 0.6 }} />
          <div className="absolute top-2/3 left-1/3 w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: accentColor, opacity: 0.5, animationDelay: "1s" }} />
          <div className="absolute bottom-1/3 right-1/3 w-4 h-4 rounded-full animate-pulse" style={{ backgroundColor: primaryColor, opacity: 0.4, animationDelay: "2s" }} />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 shadow-lg"
              style={{ 
                backgroundColor: secondaryColor,
                border: `1px solid ${primaryColor}20`,
              }}
            >
              <Sparkles className="w-4 h-4" style={{ color: primaryColor }} />
              <span className="font-semibold text-sm text-gray-800">Cuidando da sua saúde mental</span>
              <Heart className="w-4 h-4" style={{ color: primaryColor }} />
            </div>
            
            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif leading-tight mb-6 text-gray-900">
              Encontre o equilíbrio e a{" "}
              <span 
                style={{ 
                  background: `linear-gradient(to right, ${primaryColor}, ${primaryColor}cc)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent"
                }}
              >
                paz interior
              </span>{" "}
              que você merece
            </h1>
            
            {/* Subtitle */}
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              A psicoterapia é um caminho de autoconhecimento e transformação. Juntos, vamos construir uma vida mais leve e significativa.
            </p>
            
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                onClick={() => scrollToSection("agenda")}
                className="text-white shadow-xl text-lg px-8 py-6 transition-all duration-500 hover:-translate-y-1"
                style={{ 
                  background: `linear-gradient(to right, ${primaryColor}, ${primaryColor}dd)`,
                  boxShadow: `0 10px 40px -10px ${primaryColor}80`
                }}
              >
                <Calendar className="w-5 h-5 mr-2" />
                Agendar Consulta
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => scrollToSection("sobre")}
                className="text-lg px-8 py-6 border-gray-300 transition-all duration-500 hover:-translate-y-1"
              >
                Saiba Mais
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="w-6 h-9 border-2 rounded-full flex justify-center p-1" style={{ borderColor: `${primaryColor}60` }}>
            <div 
              className="w-1.5 h-2.5 rounded-full animate-bounce"
              style={{ background: `linear-gradient(to bottom, ${primaryColor}, ${primaryColor}cc)` }}
            />
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="servicos" className="py-16" style={{ backgroundColor: secondaryColor }}>
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span 
              className="inline-block px-4 py-1.5 text-sm font-semibold rounded-full mb-4"
              style={{ 
                backgroundColor: "white",
                color: primaryColor,
                border: `1px solid ${primaryColor}20`
              }}
            >
              Nossos Serviços
            </span>
            <h2 className="text-2xl md:text-3xl font-serif mb-3 text-gray-900">
              Como Posso <span style={{ color: primaryColor }}>Ajudar</span>
            </h2>
            <p className="text-gray-600">
              Ofereco diferentes modalidades de atendimento para atender às suas necessidades específicas
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {defaultServiceCards.map((service, index) => (
              <Card key={index} className="bg-white border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden group">
                <CardContent className="p-6 text-center">
                  <div 
                    className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-500"
                    style={{ backgroundColor: secondaryColor }}
                  >
                    <service.icon className="w-7 h-7" style={{ color: primaryColor }} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900">{service.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="sobre" className="py-16 bg-white relative overflow-hidden">
        <div 
          className="absolute top-0 right-0 w-1/2 h-full opacity-40"
          style={{ background: `linear-gradient(to left, ${secondaryColor}, transparent)` }}
        />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-10">
              {/* Image with badges */}
              <div className="relative flex-shrink-0">
                <div className="w-64 h-80 rounded-3xl overflow-hidden shadow-2xl">
                  {profile?.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt={profile.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div 
                      className="w-full h-full flex items-center justify-center text-white text-5xl font-bold"
                      style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)` }}
                    >
                      {getInitials(profile?.full_name || "P")}
                    </div>
                  )}
                  <div 
                    className="absolute inset-0"
                    style={{ background: `linear-gradient(to top, ${primaryColor}30, transparent 50%)` }}
                  />
                </div>
                
                {/* Experience badge */}
                <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-2xl p-4 border border-gray-100">
                  <div className="flex items-center gap-2 mb-1">
                    <div 
                      className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: secondaryColor }}
                    >
                      <Star className="w-4 h-4" style={{ color: primaryColor }} />
                    </div>
                    <span className="text-2xl font-bold" style={{ color: primaryColor }}>10+</span>
                  </div>
                  <div className="text-xs text-gray-500">Anos de<br/>experiência</div>
                </div>
                
                {/* Rating badge */}
                <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-2xl p-3 border border-gray-100">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-xl font-bold text-gray-900">{averageRating.toFixed(1)}</span>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <span 
                  className="inline-block px-4 py-1.5 text-sm font-semibold rounded-full mb-4"
                  style={{ 
                    backgroundColor: secondaryColor,
                    color: primaryColor
                  }}
                >
                  Sobre Mim
                </span>
                
                <h2 className="text-2xl md:text-3xl font-serif mb-4 text-gray-900">
                  {profile?.full_name || "Dra. Maria Silva"}
                </h2>
                
                <p className="text-gray-600 leading-relaxed mb-6">
                  {profile?.bio || "Sou psicóloga clínica com especialização em Terapia Cognitivo-Comportamental e Psicoterapia Humanista. Minha abordagem é integrativa, combinando diferentes técnicas para atender às necessidades únicas de cada pessoa."}
                </p>
                
                <p className="text-gray-600 leading-relaxed mb-6">
                  Acredito que cada indivíduo possui recursos internos para superar desafios e alcançar uma vida mais plena. Meu papel é criar um espaço seguro e acolhedor para que essa transformação aconteça.
                </p>

                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="flex items-start gap-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: secondaryColor }}
                    >
                      <GraduationCap className="w-5 h-5" style={{ color: primaryColor }} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">Formação Acadêmica</h4>
                      <p className="text-gray-500 text-sm">{profile?.specialty || "Mestrado em Psicologia Clínica"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: secondaryColor }}
                    >
                      <Award className="w-5 h-5" style={{ color: primaryColor }} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">Registro Profissional</h4>
                      <p className="text-gray-500 text-sm">{profile?.crp || "CRP 06/123456"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Schedule Section */}
      <section 
        id="agenda" 
        className="py-16 relative overflow-hidden"
        style={{ 
          background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`
        }}
      >
        {/* Decorative circles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/10" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-white/10" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 bg-white/20 backdrop-blur-sm border border-white/30">
              <CalendarDays className="w-4 h-4 text-white" />
              <span className="font-semibold text-white text-sm">Agenda Online</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-serif text-white mb-3">
              Agende Sua Consulta
            </h2>
            <p className="text-white/90">
              Escolha seu plano, dia e horário para iniciar sua jornada de autoconhecimento
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Card className="border-none shadow-2xl bg-white overflow-hidden">
              <div 
                className="h-2"
                style={{ background: `linear-gradient(to right, ${primaryColor}, ${accentColor})` }}
              />
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <h3 className="font-semibold text-gray-900 mb-1">1. Escolha o Plano</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {services.map((service) => {
                    const isPackage = service.product_config?.is_package;
                    const packageSessions = service.product_config?.package_sessions;
                    const isSelected = selectedService?.id === service.id;

                    return (
                      <div 
                        key={service.id}
                        onClick={() => setSelectedService(service)}
                        className={`p-5 rounded-2xl border-2 cursor-pointer transition-all hover:shadow-lg ${
                          isSelected ? "shadow-lg" : ""
                        }`}
                        style={{ 
                          borderColor: isSelected ? primaryColor : "#e5e5e5",
                          backgroundColor: isSelected ? `${primaryColor}08` : "white"
                        }}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <span 
                            className="text-xs font-bold uppercase tracking-wider"
                            style={{ color: primaryColor }}
                          >
                            {service.duration_minutes} min • {isPackage && packageSessions ? `${packageSessions}x` : "1x"}
                          </span>
                          {isPackage && (
                            <Badge 
                              className="text-xs"
                              style={{ backgroundColor: accentColor, color: "#000" }}
                            >
                              Economia
                            </Badge>
                          )}
                        </div>
                        
                        <h4 className="text-lg font-bold text-gray-900 mb-1">{service.name}</h4>
                        <p className="text-gray-500 text-sm mb-3">
                          {isPackage && packageSessions 
                            ? `${packageSessions} sessões de ${service.duration_minutes} minutos`
                            : `1 sessão de ${service.duration_minutes} minutos`
                          }
                        </p>
                        
                        <div 
                          className="text-2xl font-bold"
                          style={{ color: primaryColor }}
                        >
                          {formatPrice(service.price_cents)}
                        </div>
                      </div>
                    );
                  })}

                  {services.length === 0 && (
                    <div className="col-span-2 text-center py-8 text-gray-500">
                      <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Nenhum serviço disponível no momento.</p>
                    </div>
                  )}
                </div>

                {selectedService && (
                  <Button
                    onClick={() => handleScheduleClick(selectedService)}
                    className="w-full mt-6 text-white text-lg py-6"
                    style={{ background: `linear-gradient(to right, ${primaryColor}, ${primaryColor}dd)` }}
                  >
                    <Calendar className="w-5 h-5 mr-2" />
                    Continuar para agendar
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      {testimonials.length > 0 && (
        <section id="depoimentos" className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span 
                className="inline-block px-4 py-1.5 text-sm font-semibold rounded-full mb-4"
                style={{ 
                  backgroundColor: secondaryColor,
                  color: primaryColor
                }}
              >
                Depoimentos
              </span>
              <h2 className="text-2xl md:text-3xl font-serif mb-3 text-gray-900">
                O Que Dizem Nossos <span style={{ color: primaryColor }}>Pacientes</span>
              </h2>
              <p className="text-gray-600">
                Histórias reais de transformação e superação
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {testimonials.slice(0, 3).map((testimonial) => (
                <Card key={testimonial.id} className="bg-white border border-gray-100 shadow-lg hover:shadow-xl transition-all">
                  <CardContent className="p-6">
                    <div className="flex gap-0.5 mb-4">
                      {Array.from({ length: testimonial.rating || 5 }).map((_, j) => (
                        <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      "{testimonial.content}"
                    </p>
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                        style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)` }}
                      >
                        {getInitials(testimonial.client_name)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">{testimonial.client_name}</h4>
                        <p className="text-gray-500 text-xs">Paciente</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      <section id="faq" className="py-16" style={{ backgroundColor: secondaryColor }}>
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span 
              className="inline-block px-4 py-1.5 text-sm font-semibold rounded-full mb-4 bg-white"
              style={{ color: primaryColor }}
            >
              Dúvidas Frequentes
            </span>
            <h2 className="text-2xl md:text-3xl font-serif mb-3 text-gray-900">
              Perguntas <span style={{ color: primaryColor }}>Frequentes</span>
            </h2>
            <p className="text-gray-600">
              Tire suas dúvidas sobre psicoterapia e nosso atendimento
            </p>
          </div>

          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-6">
            <Accordion type="single" collapsible className="space-y-2">
              {faqItems.map((item, i) => (
                <AccordionItem 
                  key={i} 
                  value={`faq-${i}`} 
                  className="border border-gray-100 rounded-xl px-4 data-[state=open]:shadow-sm"
                >
                  <AccordionTrigger className="text-left font-semibold text-gray-900 hover:no-underline py-4">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 pb-4">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contato" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span 
              className="inline-block px-4 py-1.5 text-sm font-semibold rounded-full mb-4"
              style={{ 
                backgroundColor: secondaryColor,
                color: primaryColor
              }}
            >
              Fale Conosco
            </span>
            <h2 className="text-2xl md:text-3xl font-serif mb-3 text-gray-900">
              Entre em <span style={{ color: primaryColor }}>Contato</span>
            </h2>
            <p className="text-gray-600">
              Tem alguma dúvida ou gostaria de agendar uma primeira conversa? Estou aqui para ajudar você a dar o primeiro passo.
            </p>
          </div>

          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-10">
            {/* Contact Info */}
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: secondaryColor }}
                >
                  <MapPin className="w-6 h-6" style={{ color: primaryColor }} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Endereço</h4>
                  <p className="text-gray-600">São Paulo, SP</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: secondaryColor }}
                >
                  <Phone className="w-6 h-6" style={{ color: primaryColor }} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Telefone</h4>
                  <p className="text-gray-600">{profile?.phone || "(11) 99999-9999"}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: secondaryColor }}
                >
                  <Mail className="w-6 h-6" style={{ color: primaryColor }} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">E-mail</h4>
                  <p className="text-gray-600">{profile?.email || "contato@exemplo.com.br"}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: secondaryColor }}
                >
                  <Clock className="w-6 h-6" style={{ color: primaryColor }} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Horário</h4>
                  <p className="text-gray-600">Seg - Sex: 08h às 19h</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <Card className="border border-gray-100 shadow-lg">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Envie uma Mensagem</h3>
                <form className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-sm text-gray-600">Nome</Label>
                    <Input id="name" placeholder="Seu nome completo" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-sm text-gray-600">E-mail</Label>
                    <Input id="email" type="email" placeholder="seu@email.com" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-sm text-gray-600">Telefone</Label>
                    <Input id="phone" placeholder="(11) 99999-9999" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="message" className="text-sm text-gray-600">Mensagem</Label>
                    <Textarea id="message" placeholder="Como posso ajudar você?" className="mt-1 min-h-[100px]" />
                  </div>
                  <Button 
                    type="button"
                    className="w-full text-white"
                    style={{ background: `linear-gradient(to right, ${primaryColor}, ${primaryColor}dd)` }}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Enviar Mensagem
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Brand */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)` }}
                  >
                    <Heart className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-serif text-lg">{profile?.full_name || "Profissional"}</span>
                </div>
                <p className="text-gray-400 text-sm mb-4">
                  Cuidando da sua saúde mental com acolhimento e profissionalismo.
                </p>
                {profile?.crp && (
                  <p className="text-gray-500 text-xs">{profile.crp}</p>
                )}
              </div>

              {/* Links */}
              <div>
                <h4 className="font-semibold mb-4">Links Rápidos</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  {navLinks.map((link) => (
                    <li key={link.id}>
                      <button
                        onClick={() => scrollToSection(link.id)}
                        className="hover:text-white transition-colors"
                      >
                        {link.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Social */}
              <div>
                <h4 className="font-semibold mb-4">Redes Sociais</h4>
                <div className="flex gap-3">
                  {profile?.instagram_url && (
                    <a
                      href={profile.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                      style={{ backgroundColor: `${primaryColor}20` }}
                    >
                      <Instagram className="w-5 h-5" style={{ color: primaryColor }} />
                    </a>
                  )}
                  {profile?.linkedin_url && (
                    <a
                      href={profile.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                      style={{ backgroundColor: `${primaryColor}20` }}
                    >
                      <Linkedin className="w-5 h-5" style={{ color: primaryColor }} />
                    </a>
                  )}
                  <a
                    href="#"
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                    style={{ backgroundColor: `${primaryColor}20` }}
                  >
                    <Facebook className="w-5 h-5" style={{ color: primaryColor }} />
                  </a>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-800 mt-8 pt-8 text-center">
              <p className="text-gray-500 text-sm">
                © {new Date().getFullYear()} {profile?.full_name || "Profissional"}. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* WhatsApp Button */}
      {profile?.phone && (
        <a
          href={`https://wa.me/55${profile.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá! Gostaria de agendar uma consulta.`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-full text-white font-semibold shadow-lg hover:scale-105 transition-transform"
          style={{ backgroundColor: "#25D366" }}
        >
          <MessageCircle className="w-5 h-5" />
          <span className="hidden sm:inline">Agende pelo WhatsApp</span>
        </a>
      )}

      {/* Schedule Modal */}
      {selectedService && (
        <ScheduleModal
          open={showScheduleModal}
          onClose={() => setShowScheduleModal(false)}
          onConfirm={handleScheduleConfirm}
          availableHours={availableHours}
          service={selectedService}
          accentColor={primaryColor}
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
          accentColor={primaryColor}
          gatewayConfig={gatewayConfig}
        />
      )}
    </div>
  );
};

export default ProfessionalProfile;
