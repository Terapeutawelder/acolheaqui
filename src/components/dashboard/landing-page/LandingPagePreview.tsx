import { Heart, Calendar, Sparkles, Brain, Users, Star, Clock, Check, Package, CalendarDays, MessageCircle, Mail, MapPin, Phone, ChevronLeft, ChevronRight, Quote, GraduationCap, Award, HelpCircle, Send, Instagram, Facebook, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";

interface LandingPagePreviewProps {
  profile: any;
  services: any[];
  testimonials: any[];
  config: LandingPageConfig;
}

export interface LandingPageConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    ctaText: string;
  };
  about: {
    title: string;
    subtitle: string;
  };
  services: {
    title: string;
    subtitle: string;
  };
  testimonials: {
    title: string;
    subtitle: string;
  };
  faq: {
    title: string;
    subtitle: string;
    items: { question: string; answer: string }[];
  };
  contact: {
    title: string;
    subtitle: string;
    address: string;
    phone: string;
    email: string;
    hours: string;
  };
}

export const defaultConfig: LandingPageConfig = {
  colors: {
    primary: "168 45% 35%",
    secondary: "168 30% 92%",
    accent: "45 60% 50%",
    background: "40 20% 98%",
  },
  hero: {
    badge: "Cuidando da sua saúde mental",
    title: "Encontre o equilíbrio e a paz interior que você merece",
    subtitle: "A psicoterapia é um caminho de autoconhecimento e transformação. Juntos, vamos construir uma vida mais leve e significativa.",
    ctaText: "Agendar Consulta",
  },
  about: {
    title: "Sobre Mim",
    subtitle: "Psicólogo(a) Clínico(a)",
  },
  services: {
    title: "Como Posso Ajudar",
    subtitle: "Ofereco diferentes modalidades de atendimento para atender às suas necessidades específicas",
  },
  testimonials: {
    title: "O Que Dizem Nossos Pacientes",
    subtitle: "Histórias reais de transformação e superação",
  },
  faq: {
    title: "Perguntas Frequentes",
    subtitle: "Tire suas dúvidas sobre psicoterapia e nosso atendimento",
    items: [
      { question: "Como funciona a terapia online?", answer: "A terapia online funciona através de videochamada em uma plataforma segura. Você terá a mesma qualidade de atendimento que em sessões presenciais, com total privacidade e confidencialidade." },
      { question: "Qual a duração de cada sessão?", answer: "Oferecemos sessões de 30 minutos e 45 minutos. A escolha depende das suas necessidades e preferências." },
      { question: "Com que frequência devo fazer terapia?", answer: "Geralmente recomendamos sessões semanais no início do tratamento. Com o tempo, podemos ajustar para quinzenal ou mensal, conforme sua evolução." },
      { question: "A terapia online é tão eficaz quanto a presencial?", answer: "Sim! Diversos estudos científicos comprovam que a terapia online é tão eficaz quanto a presencial para a maioria dos casos." },
    ],
  },
  contact: {
    title: "Entre em Contato",
    subtitle: "Tem alguma dúvida ou gostaria de agendar uma primeira conversa?",
    address: "São Paulo, SP",
    phone: "(11) 99999-9999",
    email: "contato@exemplo.com.br",
    hours: "Seg - Sex: 08h às 19h",
  },
};

const defaultServices = [
  { icon: Brain, title: "Terapia Individual", description: "Sessões personalizadas para trabalhar questões emocionais, comportamentais e de desenvolvimento pessoal." },
  { icon: Users, title: "Terapia de Casal", description: "Apoio para casais que desejam melhorar a comunicação e fortalecer o relacionamento." },
  { icon: Heart, title: "Ansiedade e Depressão", description: "Tratamento especializado para transtornos de ansiedade e depressão com abordagem humanizada." },
  { icon: Sparkles, title: "Autoconhecimento", description: "Processo terapêutico focado em desenvolver maior consciência de si mesmo e seu potencial." },
];

const timeSlots = [
  { time: "08:00", available: true },
  { time: "09:00", available: false },
  { time: "10:00", available: true },
  { time: "11:00", available: true },
  { time: "14:00", available: false },
  { time: "15:00", available: true },
  { time: "16:00", available: true },
  { time: "17:00", available: false },
  { time: "18:00", available: true },
];

const LandingPagePreview = ({ profile, services, testimonials, config }: LandingPagePreviewProps) => {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const primaryColor = config.colors.primary;
  const secondaryColor = config.colors.secondary;
  const accentColor = config.colors.accent;
  const backgroundColor = config.colors.background;

  const weekDays = Array.from({ length: 5 }, (_, i) => addDays(currentWeekStart, i));

  const goToPreviousWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, -7));
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const goToNextWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, 7));
    setSelectedDate(null);
    setSelectedTime(null);
  };

  // Convert services to plans format
  const plans = services.slice(0, 4).map((s, i) => ({
    id: s.id,
    name: s.name,
    description: s.description || `${s.duration_minutes} minutos`,
    duration: `${s.duration_minutes} min`,
    price: s.price_cents / 100,
    sessions: 1,
    isPackage: false,
  }));

  const selectedPlanData = plans.find(p => p.id === selectedPlan);

  const contactInfo = [
    { icon: MapPin, title: "Endereço", content: config.contact.address },
    { icon: Phone, title: "Telefone", content: config.contact.phone },
    { icon: Mail, title: "E-mail", content: config.contact.email },
    { icon: Clock, title: "Horário", content: config.contact.hours },
  ];

  return (
    <div 
      className="w-full min-h-full overflow-auto"
      style={{ 
        backgroundColor: `hsl(${backgroundColor})`,
        "--lp-primary": primaryColor,
        "--lp-secondary": secondaryColor,
        "--lp-accent": accentColor,
        "--lp-bg": backgroundColor,
      } as React.CSSProperties}
    >
      {/* Header */}
      <header 
        className="sticky top-0 z-50 py-3 px-4 backdrop-blur-xl transition-all duration-500"
        style={{ backgroundColor: `hsl(${backgroundColor} / 0.95)` }}
      >
        <nav className="container mx-auto flex items-center justify-between">
          <a href="#" className="flex items-center gap-2 group">
            <div 
              className="relative w-9 h-9 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300"
              style={{ background: `linear-gradient(135deg, hsl(${primaryColor}), hsl(${primaryColor} / 0.8))` }}
            >
              <Heart className="w-4 h-4 text-white" />
              <Sparkles className="absolute -top-1 -right-1 w-2.5 h-2.5" style={{ color: `hsl(${accentColor})` }} />
            </div>
            <span className="font-serif text-base" style={{ color: "#1a1a1a" }}>
              {profile?.full_name || "Nome do Profissional"}
            </span>
          </a>

          <div className="hidden md:flex items-center gap-6">
            {["Início", "Serviços", "Sobre", "Agenda", "Contato"].map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                className="text-xs font-semibold transition-colors duration-300 hover:opacity-70"
                style={{ color: "#4a5568" }}
              >
                {link}
              </a>
            ))}
          </div>

          <Button 
            size="sm"
            className="text-white shadow-lg text-xs font-semibold"
            style={{ 
              background: `linear-gradient(to right, hsl(${primaryColor}), hsl(${primaryColor} / 0.8))` 
            }}
          >
            Agendar Consulta
          </Button>
        </nav>
      </header>

      {/* Hero Section */}
      <section 
        className="relative min-h-[60vh] flex items-center justify-center overflow-hidden py-16"
        style={{ 
          background: `linear-gradient(to bottom, hsl(${backgroundColor}), hsl(${secondaryColor} / 0.4), hsl(${backgroundColor}))`
        }}
      >
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl opacity-15 animate-pulse"
            style={{ background: `linear-gradient(135deg, hsl(${primaryColor}), hsl(${accentColor} / 0.5))` }}
          />
          <div 
            className="absolute top-1/3 -left-32 w-80 h-80 rounded-full blur-3xl opacity-20"
            style={{ background: `linear-gradient(135deg, hsl(${secondaryColor}), hsl(${primaryColor} / 0.3))` }}
          />
          <div 
            className="absolute bottom-20 right-1/4 w-64 h-64 rounded-full blur-3xl opacity-10"
            style={{ background: `linear-gradient(135deg, hsl(${accentColor} / 0.5), hsl(${primaryColor} / 0.3))` }}
          />
          
          {/* Floating dots */}
          <div className="absolute top-1/4 right-1/4 w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: `hsl(${primaryColor})`, opacity: 0.6 }} />
          <div className="absolute top-2/3 left-1/3 w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: `hsl(${accentColor})`, opacity: 0.5, animationDelay: "1s" }} />
          <div className="absolute bottom-1/3 right-1/3 w-4 h-4 rounded-full animate-pulse" style={{ backgroundColor: `hsl(${primaryColor} / 0.8)`, opacity: 0.4, animationDelay: "2s" }} />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 shadow-lg"
              style={{ 
                backgroundColor: `hsl(${secondaryColor})`,
                border: `1px solid hsl(${primaryColor} / 0.2)`,
              }}
            >
              <Sparkles className="w-3.5 h-3.5" style={{ color: `hsl(${primaryColor})` }} />
              <span className="text-xs font-semibold" style={{ color: "#1a1a1a" }}>{config.hero.badge}</span>
              <Heart className="w-3.5 h-3.5" style={{ color: `hsl(${primaryColor})` }} />
            </div>
            
            <h1 
              className="font-serif text-3xl md:text-4xl lg:text-5xl leading-tight mb-4"
              style={{ color: "#1a1a1a" }}
            >
              {config.hero.title.includes("paz interior") ? (
                <>
                  {config.hero.title.split("paz interior")[0]}
                  <span style={{ 
                    background: `linear-gradient(to right, hsl(${primaryColor}), hsl(${primaryColor} / 0.8))`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent"
                  }}>paz interior</span>
                  {config.hero.title.split("paz interior")[1]}
                </>
              ) : config.hero.title}
            </h1>
            
            <p className="text-sm md:text-base max-w-xl mx-auto mb-8 font-medium leading-relaxed" style={{ color: "#4a5568" }}>
              {config.hero.subtitle}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                className="text-base px-6 py-5 text-white shadow-xl transition-all duration-500 hover:-translate-y-1"
                style={{ 
                  background: `linear-gradient(to right, hsl(${primaryColor}), hsl(${primaryColor} / 0.8))`,
                  boxShadow: `0 10px 40px -10px hsl(${primaryColor} / 0.5)`
                }}
              >
                <Calendar className="w-4 h-4 mr-2" />
                {config.hero.ctaText}
              </Button>
              <Button 
                variant="outline" 
                className="text-base px-6 py-5 transition-all duration-500 hover:-translate-y-1"
                style={{ 
                  borderColor: "#1a1a1a20",
                  color: "#1a1a1a"
                }}
              >
                Saiba Mais
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
          <div className="w-6 h-9 border-2 rounded-full flex justify-center p-1" style={{ borderColor: `hsl(${primaryColor} / 0.4)` }}>
            <div 
              className="w-1.5 h-2.5 rounded-full animate-bounce"
              style={{ background: `linear-gradient(to bottom, hsl(${primaryColor}), hsl(${primaryColor} / 0.8))` }}
            />
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-12" style={{ backgroundColor: `hsl(${secondaryColor})` }}>
        <div className="container mx-auto px-4">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span 
              className="inline-block px-4 py-1.5 text-xs font-semibold rounded-full mb-4"
              style={{ 
                backgroundColor: `hsl(${secondaryColor})`,
                color: `hsl(${primaryColor})`,
                border: `1px solid hsl(${primaryColor} / 0.2)`
              }}
            >
              Nossos Serviços
            </span>
            <h2 className="font-serif text-2xl md:text-3xl mb-3" style={{ color: "#1a1a1a" }}>
              {config.services.title.includes("Ajudar") ? (
                <>
                  {config.services.title.split("Ajudar")[0]}
                  <span style={{ color: `hsl(${primaryColor})` }}>Ajudar</span>
                  {config.services.title.split("Ajudar")[1]}
                </>
              ) : config.services.title}
            </h2>
            <p className="text-sm font-medium" style={{ color: "#4a5568" }}>{config.services.subtitle}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {defaultServices.map((service, index) => (
              <Card 
                key={index} 
                className="group bg-white border shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden"
              >
                <CardContent className="p-6 text-center">
                  <div 
                    className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5 group-hover:scale-110 transition-all duration-500"
                    style={{ backgroundColor: `hsl(${secondaryColor})` }}
                  >
                    <service.icon className="w-7 h-7 transition-colors duration-500" style={{ color: `hsl(${primaryColor})` }} />
                  </div>
                  <h3 className="font-serif text-lg mb-2 transition-colors duration-300" style={{ color: "#1a1a1a" }}>{service.title}</h3>
                  <p className="text-xs leading-relaxed font-medium" style={{ color: "#4a5568" }}>{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-12 relative overflow-hidden" style={{ backgroundColor: `hsl(${backgroundColor})` }}>
        <div 
          className="absolute top-0 right-0 w-1/2 h-full opacity-40"
          style={{ background: `linear-gradient(to left, hsl(${secondaryColor}), transparent)` }}
        />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-10 items-center max-w-4xl mx-auto">
            {/* Image */}
            <div className="relative max-w-xs mx-auto lg:mx-0">
              <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl" style={{ background: `linear-gradient(135deg, hsl(${secondaryColor}), hsl(${backgroundColor}))` }}>
                {profile?.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt={profile?.full_name || "Profissional"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-6xl font-bold" style={{ color: `hsl(${primaryColor})` }}>
                      {profile?.full_name?.charAt(0) || "P"}
                    </span>
                  </div>
                )}
                <div 
                  className="absolute inset-0"
                  style={{ background: `linear-gradient(to top, hsl(${primaryColor} / 0.2), transparent 50%)` }}
                />
              </div>
              
              {/* Floating card */}
              <div className="absolute -bottom-4 -right-4 bg-white p-4 rounded-2xl shadow-2xl max-w-[180px] border" style={{ borderColor: `hsl(${secondaryColor})` }}>
                <div className="flex items-center gap-2 mb-1">
                  <div 
                    className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, hsl(${accentColor}), hsl(${accentColor} / 0.8))` }}
                  >
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-serif text-2xl" style={{ color: "#1a1a1a" }}>10+</span>
                </div>
                <p className="text-xs font-medium" style={{ color: "#4a5568" }}>Anos de experiência</p>
              </div>
              
              {/* Rating badge */}
              <div className="absolute -top-3 -left-3 bg-white px-3 py-1.5 rounded-full shadow-xl border flex items-center gap-1.5" style={{ borderColor: `hsl(${secondaryColor})` }}>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3" style={{ fill: `hsl(${accentColor})`, color: `hsl(${accentColor})` }} />
                  ))}
                </div>
                <span className="text-xs font-bold" style={{ color: "#1a1a1a" }}>5.0</span>
              </div>
            </div>

            {/* Content */}
            <div>
              <Badge 
                className="mb-4 px-3 py-1 text-xs font-semibold"
                style={{ 
                  backgroundColor: `hsl(${secondaryColor})`,
                  color: `hsl(${primaryColor})`,
                  border: `1px solid hsl(${primaryColor} / 0.2)`
                }}
              >
                {config.about.title}
              </Badge>
              
              <h2 className="font-serif text-2xl md:text-3xl mb-4" style={{ color: "#1a1a1a" }}>
                {profile?.full_name || "Nome do Profissional"}
              </h2>
              
              <p className="text-sm leading-relaxed mb-4 font-medium" style={{ color: "#4a5568" }}>
                {profile?.bio || "Sou psicólogo(a) clínico(a) com especialização em Terapia Cognitivo-Comportamental e Psicoterapia Humanista. Minha abordagem é integrativa, combinando diferentes técnicas para atender às necessidades únicas de cada pessoa."}
              </p>

              <div className="space-y-3">
                <div 
                  className="flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 hover:shadow-md"
                  style={{ backgroundColor: `hsl(${secondaryColor} / 0.5)`, border: `1px solid hsl(${primaryColor} / 0.1)` }}
                >
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                    style={{ background: `linear-gradient(135deg, hsl(${primaryColor}), hsl(${primaryColor} / 0.8))` }}
                  >
                    <GraduationCap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm" style={{ color: "#1a1a1a" }}>Formação Acadêmica</h4>
                    <p className="text-xs font-medium" style={{ color: "#4a5568" }}>{profile?.specialty || "Especialização em Psicologia"}</p>
                  </div>
                </div>
                
                <div 
                  className="flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 hover:shadow-md"
                  style={{ backgroundColor: `hsl(${accentColor} / 0.1)`, border: `1px solid hsl(${accentColor} / 0.2)` }}
                >
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                    style={{ background: `linear-gradient(135deg, hsl(${accentColor}), hsl(${accentColor} / 0.8))` }}
                  >
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm" style={{ color: "#1a1a1a" }}>Registro Profissional</h4>
                    <p className="text-xs font-medium" style={{ color: "#4a5568" }}>{profile?.crp || "CRP 00/00000"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Schedule Section */}
      <section 
        className="py-12 relative overflow-hidden"
        style={{ 
          background: `linear-gradient(135deg, hsl(${primaryColor} / 0.9), hsl(${primaryColor}), hsl(${primaryColor} / 0.9))`
        }}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-40 h-40 border border-white/20 rounded-full" />
          <div className="absolute bottom-20 right-20 w-60 h-60 border border-white/20 rounded-full" />
          <div className="absolute top-1/2 left-1/4 w-20 h-20 border border-white/20 rounded-full" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-xl mx-auto mb-8">
            <Badge className="bg-white/20 backdrop-blur-sm border border-white/30 text-white mb-4 px-4 py-2">
              <CalendarDays className="w-4 h-4 mr-2" />
              <span className="font-semibold">Agenda Online</span>
            </Badge>
            <h2 className="font-serif text-2xl md:text-3xl text-white mb-3">
              Agende Sua Consulta
            </h2>
            <p className="text-white/90 text-sm font-medium">
              Escolha seu plano, dia e horário para iniciar sua jornada de autoconhecimento
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Card className="border-none shadow-2xl bg-white">
              <div 
                className="h-2 rounded-t-lg"
                style={{ background: `linear-gradient(to right, hsl(${primaryColor}), hsl(${primaryColor} / 0.8), hsl(${primaryColor}))` }}
              />
              
              <CardHeader className="pb-4 pt-5">
                <CardTitle className="font-serif text-xl flex items-center gap-3" style={{ color: "#1a1a1a" }}>
                  <div 
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, hsl(${accentColor}), hsl(${accentColor} / 0.8))` }}
                  >
                    <Package className="w-4 h-4 text-white" />
                  </div>
                  1. Escolha o Plano
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 pb-5">
                {/* Plans selector */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {plans.length > 0 ? plans.map((plan) => (
                    <button
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan.id)}
                      className="p-3 rounded-xl text-left transition-all duration-300 border-2"
                      style={{ 
                        background: selectedPlan === plan.id 
                          ? `linear-gradient(135deg, hsl(${primaryColor}), hsl(${primaryColor} / 0.8))`
                          : `hsl(${secondaryColor} / 0.3)`,
                        borderColor: selectedPlan === plan.id ? "transparent" : `hsl(${primaryColor} / 0.2)`,
                        color: selectedPlan === plan.id ? "white" : "#1a1a1a"
                      }}
                    >
                      <div 
                        className="text-[10px] uppercase tracking-wider font-bold mb-1"
                        style={{ opacity: 0.8 }}
                      >
                        {plan.duration}
                      </div>
                      <h3 className="text-sm font-bold leading-tight">{plan.name}</h3>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-lg font-bold">R$ {plan.price.toFixed(2).replace('.', ',')}</span>
                      </div>
                    </button>
                  )) : (
                    <div className="col-span-4 text-center py-6 text-gray-500 text-sm">
                      Nenhum serviço cadastrado
                    </div>
                  )}
                </div>

                {/* Date selector - only show if plan is selected */}
                {selectedPlan && (
                  <div className="pt-5 border-t animate-fade-in" style={{ borderColor: `hsl(${primaryColor} / 0.1)` }}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-serif text-lg flex items-center gap-3" style={{ color: "#1a1a1a" }}>
                        <div 
                          className="w-9 h-9 rounded-xl flex items-center justify-center"
                          style={{ background: `linear-gradient(135deg, hsl(${primaryColor}), hsl(${primaryColor} / 0.8))` }}
                        >
                          <Calendar className="w-4 h-4 text-white" />
                        </div>
                        2. Selecione a Data
                      </h3>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={goToPreviousWeek}
                          className="h-8 w-8 rounded-xl"
                          style={{ borderColor: `hsl(${primaryColor} / 0.3)` }}
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span 
                          className="text-xs font-bold min-w-[110px] text-center capitalize px-2 py-1 rounded-xl"
                          style={{ backgroundColor: `hsl(${secondaryColor})`, color: "#1a1a1a" }}
                        >
                          {format(currentWeekStart, "MMMM yyyy", { locale: ptBR })}
                        </span>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={goToNextWeek}
                          className="h-8 w-8 rounded-xl"
                          style={{ borderColor: `hsl(${primaryColor} / 0.3)` }}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-5 gap-2">
                      {weekDays.map((day) => (
                        <button
                          key={day.toISOString()}
                          onClick={() => {
                            setSelectedDate(day);
                            setSelectedTime(null);
                          }}
                          className="p-3 rounded-xl text-center transition-all duration-500 border-2"
                          style={{ 
                            background: selectedDate && isSameDay(selectedDate, day)
                              ? `linear-gradient(135deg, hsl(${primaryColor}), hsl(${primaryColor} / 0.8))`
                              : `hsl(${secondaryColor} / 0.5)`,
                            borderColor: selectedDate && isSameDay(selectedDate, day) ? "transparent" : `hsl(${primaryColor} / 0.2)`,
                            color: selectedDate && isSameDay(selectedDate, day) ? "white" : "#1a1a1a",
                            transform: selectedDate && isSameDay(selectedDate, day) ? "scale(1.05)" : "scale(1)"
                          }}
                        >
                          <div className="text-[10px] uppercase tracking-wider font-bold opacity-80">
                            {format(day, "EEE", { locale: ptBR })}
                          </div>
                          <div className="text-xl font-serif mt-1">
                            {format(day, "dd")}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Time slots */}
                {selectedPlan && selectedDate && (
                  <div className="space-y-3 animate-fade-in pt-3">
                    <div className="flex items-center gap-2 font-semibold text-sm" style={{ color: "#1a1a1a" }}>
                      <Clock className="w-4 h-4" style={{ color: `hsl(${primaryColor})` }} />
                      <span>3. Horários disponíveis para {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}</span>
                    </div>
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot.time}
                          onClick={() => slot.available && setSelectedTime(slot.time)}
                          disabled={!slot.available}
                          className="p-2.5 rounded-xl text-center transition-all duration-300 font-bold text-sm"
                          style={{ 
                            backgroundColor: !slot.available 
                              ? "#f0f0f0"
                              : selectedTime === slot.time 
                                ? `hsl(${accentColor})`
                                : "white",
                            color: !slot.available 
                              ? "#999"
                              : selectedTime === slot.time 
                                ? "white"
                                : "#1a1a1a",
                            border: !slot.available 
                              ? "none"
                              : `2px solid ${selectedTime === slot.time ? 'transparent' : `hsl(${primaryColor} / 0.2)`}`,
                            textDecoration: !slot.available ? "line-through" : "none",
                            cursor: !slot.available ? "not-allowed" : "pointer",
                            boxShadow: selectedTime === slot.time ? `0 4px 15px hsl(${accentColor} / 0.4)` : "none"
                          }}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Confirmation */}
                {selectedPlan && selectedDate && selectedTime && (
                  <div 
                    className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl animate-fade-in"
                    style={{ 
                      background: `linear-gradient(to right, hsl(${secondaryColor}), hsl(${accentColor} / 0.15), hsl(${secondaryColor}))`,
                      border: `2px solid hsl(${primaryColor} / 0.2)`
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                        style={{ background: `linear-gradient(135deg, hsl(${primaryColor}), hsl(${primaryColor} / 0.8))` }}
                      >
                        <Check className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-sm" style={{ color: "#1a1a1a" }}>Consulta selecionada</p>
                        <p className="text-xs font-medium" style={{ color: "#4a5568" }}>
                          {selectedPlanData?.name} • {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })} às {selectedTime}
                        </p>
                        <p className="font-bold text-base mt-0.5" style={{ color: `hsl(${primaryColor})` }}>
                          R$ {selectedPlanData?.price.toFixed(2).replace('.', ',')}
                        </p>
                      </div>
                    </div>
                    <Button 
                      className="text-white px-5 py-4 text-sm shadow-xl transition-all duration-300 hover:-translate-y-1 font-bold"
                      style={{ 
                        background: `linear-gradient(to right, hsl(${primaryColor}), hsl(${primaryColor} / 0.8))`,
                        boxShadow: `0 10px 30px -10px hsl(${primaryColor} / 0.5)`
                      }}
                    >
                      Confirmar Agendamento
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      {testimonials.length > 0 && (
        <section className="py-12 relative overflow-hidden" style={{ backgroundColor: `hsl(${secondaryColor})` }}>
          {/* Background decoration */}
          <div 
            className="absolute top-10 right-10 w-32 h-32 rounded-full blur-3xl opacity-30"
            style={{ backgroundColor: `hsl(${primaryColor} / 0.1)` }}
          />
          <div 
            className="absolute bottom-10 left-10 w-40 h-40 rounded-full blur-3xl opacity-30"
            style={{ backgroundColor: `hsl(${accentColor} / 0.1)` }}
          />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-xl mx-auto mb-10">
              <span 
                className="inline-block px-4 py-1.5 text-xs font-semibold rounded-full mb-4"
                style={{ 
                  backgroundColor: `hsl(${secondaryColor})`,
                  color: `hsl(${primaryColor})`,
                  border: `1px solid hsl(${primaryColor} / 0.2)`
                }}
              >
                Depoimentos
              </span>
              <h2 className="font-serif text-2xl md:text-3xl mb-3" style={{ color: "#1a1a1a" }}>
                {config.testimonials.title.includes("Pacientes") ? (
                  <>
                    {config.testimonials.title.split("Pacientes")[0]}
                    <span style={{ color: `hsl(${primaryColor})` }}>Pacientes</span>
                    {config.testimonials.title.split("Pacientes")[1]}
                  </>
                ) : config.testimonials.title}
              </h2>
              <p className="text-sm font-medium" style={{ color: "#4a5568" }}>{config.testimonials.subtitle}</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {testimonials.slice(0, 3).map((testimonial, index) => (
                <Card 
                  key={index}
                  className="bg-white border shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 relative overflow-hidden group"
                >
                  {/* Quote decoration */}
                  <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
                    <Quote className="w-14 h-14" style={{ color: `hsl(${primaryColor})` }} />
                  </div>
                  
                  <CardContent className="p-6 relative z-10">
                    {/* Rating */}
                    <div className="flex gap-0.5 mb-3">
                      {[...Array(testimonial.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4" style={{ fill: `hsl(${accentColor})`, color: `hsl(${accentColor})` }} />
                      ))}
                    </div>
                    
                    {/* Content */}
                    <p className="text-sm font-medium leading-relaxed mb-5 italic" style={{ color: "#4a5568" }}>
                      "{testimonial.content}"
                    </p>
                    
                    {/* Author */}
                    <div className="flex items-center gap-3 pt-4 border-t" style={{ borderColor: `hsl(${secondaryColor})` }}>
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg"
                        style={{ background: `linear-gradient(135deg, hsl(${primaryColor}), hsl(${primaryColor} / 0.8))` }}
                      >
                        {testimonial.client_name?.charAt(0) || "C"}
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm" style={{ color: "#1a1a1a" }}>{testimonial.client_name}</h4>
                        <p className="text-xs" style={{ color: "#4a5568" }}>Paciente</p>
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
      <section 
        className="py-12"
        style={{ 
          background: `linear-gradient(to bottom, hsl(${secondaryColor} / 0.3), hsl(${backgroundColor}))`
        }}
      >
        <div className="container mx-auto px-4">
          <div className="text-center max-w-xl mx-auto mb-8">
            <Badge 
              className="mb-4 px-4 py-1.5 text-xs font-semibold"
              style={{ 
                backgroundColor: `hsl(${secondaryColor})`,
                color: `hsl(${primaryColor})`,
                border: `1px solid hsl(${primaryColor} / 0.2)`
              }}
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              Dúvidas Frequentes
            </Badge>
            <h2 className="font-serif text-2xl md:text-3xl mb-3" style={{ color: "#1a1a1a" }}>
              {config.faq.title.includes("Frequentes") ? (
                <>
                  Perguntas <span style={{ color: `hsl(${primaryColor})` }}>Frequentes</span>
                </>
              ) : config.faq.title}
            </h2>
            <p className="text-sm font-medium" style={{ color: "#4a5568" }}>{config.faq.subtitle}</p>
          </div>

          <div className="max-w-2xl mx-auto">
            <Accordion type="single" collapsible className="space-y-2">
              {config.faq.items.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="bg-white border rounded-2xl px-5 shadow-sm hover:shadow-md transition-shadow duration-300 data-[state=open]:shadow-lg"
                  style={{ borderColor: `hsl(${primaryColor} / 0.1)` }}
                >
                  <AccordionTrigger 
                    className="text-left font-semibold hover:no-underline py-4 text-sm"
                    style={{ color: "#1a1a1a" }}
                  >
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed pb-4" style={{ color: "#4a5568" }}>
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-10 relative overflow-hidden" style={{ backgroundColor: `hsl(${backgroundColor})` }}>
        <div 
          className="absolute bottom-0 left-0 w-full h-1/2 opacity-30"
          style={{ background: `linear-gradient(to top, hsl(${secondaryColor}), transparent)` }}
        />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-10 max-w-4xl mx-auto">
            {/* Contact Info */}
            <div>
              <span 
                className="inline-block px-4 py-1.5 text-xs font-semibold rounded-full mb-4"
                style={{ 
                  backgroundColor: `hsl(${secondaryColor})`,
                  color: `hsl(${primaryColor})`,
                  border: `1px solid hsl(${primaryColor} / 0.2)`
                }}
              >
                Fale Conosco
              </span>
              <h2 className="font-serif text-2xl md:text-3xl mb-4" style={{ color: "#1a1a1a" }}>
                {config.contact.title.includes("Contato") ? (
                  <>
                    Entre em <span style={{ color: `hsl(${primaryColor})` }}>Contato</span>
                  </>
                ) : config.contact.title}
              </h2>
              <p className="text-sm font-medium leading-relaxed mb-8" style={{ color: "#4a5568" }}>
                {config.contact.subtitle}
              </p>

              <div className="grid sm:grid-cols-2 gap-3">
                {contactInfo.map((info) => (
                  <Card 
                    key={info.title} 
                    className="border bg-white shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1 group"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300"
                          style={{ background: `linear-gradient(135deg, hsl(${primaryColor}), hsl(${primaryColor} / 0.8))` }}
                        >
                          <info.icon className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm mb-0.5" style={{ color: "#1a1a1a" }}>{info.title}</h4>
                          <p className="text-xs font-medium whitespace-pre-line" style={{ color: "#4a5568" }}>
                            {info.content}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <Card className="border shadow-2xl overflow-hidden">
                <div 
                  className="h-1.5"
                  style={{ background: `linear-gradient(to right, hsl(${primaryColor}), hsl(${primaryColor} / 0.8), hsl(${primaryColor}))` }}
                />
                
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <div 
                      className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ background: `linear-gradient(135deg, hsl(${primaryColor}), hsl(${primaryColor} / 0.8))` }}
                    >
                      <MessageCircle className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="font-serif text-lg" style={{ color: "#1a1a1a" }}>Envie uma Mensagem</h3>
                  </div>
                  
                  <form className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold mb-1.5 block" style={{ color: "#1a1a1a" }}>
                          Nome
                        </label>
                        <Input 
                          placeholder="Seu nome" 
                          className="bg-gray-50 border-gray-200 rounded-xl font-medium text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold mb-1.5 block" style={{ color: "#1a1a1a" }}>
                          E-mail
                        </label>
                        <Input 
                          type="email" 
                          placeholder="seu@email.com"
                          className="bg-gray-50 border-gray-200 rounded-xl font-medium text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold mb-1.5 block" style={{ color: "#1a1a1a" }}>
                        Telefone
                      </label>
                      <Input 
                        placeholder="(11) 99999-9999"
                        className="bg-gray-50 border-gray-200 rounded-xl font-medium text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold mb-1.5 block" style={{ color: "#1a1a1a" }}>
                        Mensagem
                      </label>
                      <Textarea 
                        placeholder="Como posso ajudar você?"
                        rows={3}
                        className="bg-gray-50 border-gray-200 resize-none rounded-xl font-medium text-sm"
                      />
                    </div>
                    <Button 
                      className="w-full py-5 text-sm shadow-xl transition-all duration-300 hover:-translate-y-1 rounded-xl font-bold text-white"
                      style={{ 
                        background: `linear-gradient(to right, hsl(${primaryColor}), hsl(${primaryColor} / 0.8))`,
                        boxShadow: `0 10px 30px -10px hsl(${primaryColor} / 0.5)`
                      }}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Enviar Mensagem
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 relative overflow-hidden" style={{ backgroundColor: "#1a1a1a" }}>
        <div 
          className="absolute top-0 left-0 w-full h-1"
          style={{ background: `linear-gradient(to right, hsl(${primaryColor}), hsl(${accentColor}), hsl(${primaryColor}))` }}
        />
        <div 
          className="absolute top-20 right-10 w-40 h-40 rounded-full blur-3xl opacity-10"
          style={{ backgroundColor: `hsl(${primaryColor})` }}
        />
        <div 
          className="absolute bottom-10 left-10 w-32 h-32 rounded-full blur-3xl opacity-10"
          style={{ backgroundColor: `hsl(${accentColor})` }}
        />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div>
              <a href="#" className="flex items-center gap-2 mb-3 group">
                <div 
                  className="relative w-9 h-9 rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-105"
                  style={{ background: `linear-gradient(135deg, hsl(${primaryColor}), hsl(${primaryColor} / 0.8))` }}
                >
                  <Heart className="w-4 h-4 text-white" />
                  <Sparkles className="absolute -top-1 -right-1 w-2.5 h-2.5" style={{ color: `hsl(${accentColor})` }} />
                </div>
                <span className="font-serif text-base text-white">{profile?.full_name || "Nome do Profissional"}</span>
              </a>
              <p className="text-white/70 text-xs leading-relaxed font-medium">
                Psicólogo(a) clínico(a) especializado(a) em Terapia Cognitivo-Comportamental. Atendimento humanizado e personalizado.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2 text-white text-sm">
                <span className="w-6 h-0.5" style={{ background: `linear-gradient(to right, hsl(${primaryColor}), hsl(${accentColor}))` }} />
                Links Rápidos
              </h4>
              <div className="space-y-1.5">
                {["Serviços", "Sobre", "Agendar Consulta", "Contato"].map((link) => (
                  <a 
                    key={link}
                    href={`#${link.toLowerCase().replace(" ", "-")}`} 
                    className="block text-white/70 hover:text-white transition-colors text-xs font-medium hover:translate-x-1 transform duration-200"
                    style={{ color: "rgba(255,255,255,0.7)" }}
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>

            {/* Social */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2 text-white text-sm">
                <span className="w-6 h-0.5" style={{ background: `linear-gradient(to right, hsl(${accentColor}), hsl(${primaryColor}))` }} />
                Redes Sociais
              </h4>
              <div className="flex items-center gap-2">
                {[Instagram, Facebook, Linkedin].map((Icon, i) => (
                  <a 
                    key={i}
                    href="#" 
                    className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300 hover:scale-110"
                  >
                    <Icon className="w-4 h-4 text-white" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-white/50 text-xs font-medium">
              © 2024 {profile?.full_name || "Nome do Profissional"}. Todos os direitos reservados.
            </p>
            <p className="text-white/50 text-xs flex items-center gap-2 font-medium">
              <span 
                className="w-2 h-2 rounded-full"
                style={{ background: `linear-gradient(to right, hsl(${primaryColor}), hsl(${accentColor}))` }}
              />
              {profile?.crp || "CRP 00/00000"}
            </p>
          </div>
        </div>
      </footer>

      {/* WhatsApp Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button 
          size="sm"
          className="rounded-full shadow-lg text-white h-12 w-12"
          style={{ backgroundColor: "#25D366" }}
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
};

export default LandingPagePreview;
