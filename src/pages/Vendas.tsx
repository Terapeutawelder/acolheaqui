import { 
  MessageCircle, 
  Calendar, 
  Users, 
  CreditCard, 
  Video, 
  Bot,
  ChevronRight,
  Star,
  CheckCircle,
  Zap,
  Award,
  TrendingUp,
  Brain,
  Shield,
  Sparkles,
  Play,
  BookOpen,
  GraduationCap,
  Heart,
  Clock,
  ArrowRight,
  Rocket,
  Check,
  Crown,
  Instagram,
  PhoneCall,
  FileText,
  Lock,
  Globe,
  Palette,
  BarChart3,
  Bell
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import membersAreaMockup from "@/assets/members-area-mockup-acolheaqui-v3.png";
import crmAgendaMockup from "@/assets/feature-crm-agenda.webp";
import checkoutMockup from "@/assets/feature-checkout-proprio.png";
import instagramAgentMockup from "@/assets/feature-instagram-agent.png";
import whatsappMockup from "@/assets/whatsapp-mockup.png";
import virtualRoomMockup from "@/assets/feature-virtual-room.jpg";
import landingPageMockup from "@/assets/feature-landing-page.jpg";

const avatar1 = "/avatars/avatar-1.jpg";
const avatar2 = "/avatars/avatar-2.jpg";
const avatar3 = "/avatars/avatar-3.jpg";
const avatar4 = "/avatars/avatar-4.jpg";
const avatar5 = "/avatars/avatar-5.jpg";

const features = [
  {
    icon: Bot,
    title: "Agentes de IA",
    description: "Automatize agendamentos e atendimento via WhatsApp e Instagram com IA.",
    color: "from-cyan-500 to-blue-600"
  },
  {
    icon: Video,
    title: "Área de Membros",
    description: "Plataforma estilo Netflix para cursos, aulas e materiais exclusivos.",
    color: "from-pink-500 to-rose-600"
  },
  {
    icon: Calendar,
    title: "CRM + Agenda",
    description: "Gestão completa de pacientes com integração Google Calendar e Meet.",
    color: "from-purple-500 to-violet-600"
  },
  {
    icon: CreditCard,
    title: "Checkout Próprio",
    description: "Receba pagamentos via Pix, cartão e boleto diretamente na sua conta.",
    color: "from-green-500 to-emerald-600"
  },
  {
    icon: Globe,
    title: "Site Profissional",
    description: "Página personalizada com domínio próprio e editor visual completo.",
    color: "from-amber-500 to-orange-600"
  },
  {
    icon: Award,
    title: "Certificados PDF",
    description: "Emissão automática de certificados para seus cursos e mentorias.",
    color: "from-yellow-500 to-amber-600"
  }
];

const stats = [
  { value: "500+", label: "Profissionais ativos" },
  { value: "10k+", label: "Agendamentos/mês" },
  { value: "98%", label: "Satisfação" },
  { value: "24/7", label: "IA trabalhando" }
];

const testimonials = [
  {
    name: "Dra. Marina Silva",
    role: "Psicóloga Clínica",
    avatar: avatar1,
    text: "O AcolheAqui transformou minha prática. Os agentes de IA agendam consultas enquanto durmo e a área de membros me permite escalar meu conhecimento.",
    rating: 5
  },
  {
    name: "Dr. Carlos Mendes",
    role: "Psicanalista",
    avatar: avatar2,
    text: "Finalmente uma plataforma completa para psicoterapeutas. O checkout próprio e o CRM integrado economizam horas do meu dia.",
    rating: 5
  },
  {
    name: "Dra. Beatriz Costa",
    role: "Terapeuta de Casal",
    avatar: avatar3,
    text: "A sala de telepsicoterapia é impecável e os certificados automáticos dão um diferencial enorme pros meus cursos online.",
    rating: 5
  }
];

const Vendas = () => {
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState(0);
  const [isVisible, setIsVisible] = useState<Record<string, boolean>>({});
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    const sections = document.querySelectorAll("[data-animate]");
    sections.forEach((section) => observerRef.current?.observe(section));

    return () => observerRef.current?.disconnect();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[hsl(215,30%,8%)] text-white overflow-hidden">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[hsl(215,30%,8%)]/80 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Logo className="h-8" />
          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollToSection("funcionalidades")} className="text-white/70 hover:text-white transition-colors text-sm font-medium">
              Funcionalidades
            </button>
            <button onClick={() => scrollToSection("como-funciona")} className="text-white/70 hover:text-white transition-colors text-sm font-medium">
              Como Funciona
            </button>
            <button onClick={() => scrollToSection("depoimentos")} className="text-white/70 hover:text-white transition-colors text-sm font-medium">
              Depoimentos
            </button>
            <button onClick={() => scrollToSection("precos")} className="text-white/70 hover:text-white transition-colors text-sm font-medium">
              Preços
            </button>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10">
                Entrar
              </Button>
            </Link>
            <Link to="/cadastro/premium">
              <Button size="sm" className="bg-gradient-to-r from-primary to-violet-500 hover:from-primary/90 hover:to-violet-500/90 text-white font-semibold">
                Começar Grátis
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 pb-12 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[150px]" />
        </div>

        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "60px 60px"
          }}
        />

        <div className="relative z-10 container mx-auto px-4">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 border border-primary/30 rounded-full text-sm font-medium mb-8 animate-fade-in">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-primary">A plataforma #1 para psicoterapeutas</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6 animate-fade-in-up">
              Tudo que você precisa para{" "}
              <span className="relative">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-violet-400 to-cyan-400">
                  escalar sua prática
                </span>
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                  <path d="M2 10C50 4 100 2 150 6C200 10 250 4 298 8" stroke="url(#gradient)" strokeWidth="3" strokeLinecap="round"/>
                  <defs>
                    <linearGradient id="gradient" x1="0" y1="0" x2="300" y2="0">
                      <stop offset="0%" stopColor="hsl(262,83%,58%)" />
                      <stop offset="50%" stopColor="hsl(280,80%,60%)" />
                      <stop offset="100%" stopColor="hsl(190,90%,50%)" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl md:text-2xl text-white/60 max-w-3xl mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              CRM, agenda, agentes de IA, área de membros, checkout próprio e muito mais — 
              <strong className="text-white"> tudo em uma única plataforma.</strong>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <Link to="/cadastro/premium">
                <Button 
                  size="lg" 
                  className="h-14 px-8 text-lg font-bold bg-gradient-to-r from-primary to-violet-500 hover:from-primary/90 hover:to-violet-500/90 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all hover:scale-105"
                >
                  Começar Agora — É Grátis
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="h-14 px-8 text-lg font-semibold border-white/20 text-white hover:bg-white/10"
                onClick={() => scrollToSection("funcionalidades")}
              >
                <Play className="mr-2 w-5 h-5" />
                Ver Demonstração
              </Button>
            </div>

            {/* Social Proof */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
              <div className="flex -space-x-3">
                {[avatar1, avatar2, avatar3, avatar4, avatar5].map((avatar, i) => (
                  <img 
                    key={i}
                    src={avatar} 
                    alt="" 
                    className="w-10 h-10 rounded-full border-2 border-[hsl(215,30%,8%)]"
                  />
                ))}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-amber-400 font-bold ml-2">4.9/5</span>
                </div>
                <p className="text-white/50 text-sm">+500 profissionais confiam no AcolheAqui</p>
              </div>
            </div>
          </div>

          {/* Floating Feature Cards */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {stats.map((stat, i) => (
              <div 
                key={i}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 text-center hover:bg-white/10 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1"
              >
                <p className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-violet-400">{stat.value}</p>
                <p className="text-white/50 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-primary rounded-full" />
          </div>
        </div>
      </section>

      {/* Features Showcase Section */}
      <section id="funcionalidades" className="py-24 relative" data-animate>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 rounded-full text-sm font-medium mb-6">
              <Rocket className="w-4 h-4 text-primary" />
              <span className="text-primary">Funcionalidades Poderosas</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Uma plataforma,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-violet-400">infinitas possibilidades</span>
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Tudo que você precisa para gerenciar, automatizar e escalar sua prática profissional em um só lugar.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature, i) => (
              <div 
                key={i}
                className={`group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-primary/40 transition-all duration-500 hover:-translate-y-2 cursor-pointer ${
                  activeFeature === i ? "border-primary/40 bg-primary/5" : ""
                }`}
                onMouseEnter={() => setActiveFeature(i)}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-500`} />
                
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{feature.title}</h3>
                <p className="text-white/60">{feature.description}</p>
                
                <div className="mt-4 flex items-center text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-sm font-medium">Saiba mais</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Agents Section */}
      <section id="como-funciona" className="py-24 bg-gradient-to-b from-[hsl(215,30%,10%)] to-[hsl(215,30%,8%)]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/20 rounded-full text-sm font-medium mb-6">
                <Bot className="w-4 h-4 text-cyan-400" />
                <span className="text-cyan-400">Agentes de IA</span>
              </div>
              
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                Sua clínica funcionando{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">24 horas por dia</span>
              </h2>

              <p className="text-lg text-white/70 mb-8 max-w-lg">
                Nossos agentes de IA agendam consultas, respondem dúvidas e fazem follow-up automaticamente no WhatsApp e Instagram.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  { icon: MessageCircle, text: "Agendamento automático via WhatsApp" },
                  { icon: Instagram, text: "Respostas inteligentes no Instagram DM" },
                  { icon: Bell, text: "Lembretes e follow-up personalizados" },
                  { icon: Brain, text: "Análise de sessões com IA generativa" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-cyan-400" />
                    </div>
                    <span className="text-white/80">{item.text}</span>
                  </div>
                ))}
              </div>

              <Link to="/cadastro/premium">
                <Button size="lg" className="h-14 px-8 text-lg font-bold bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 shadow-lg shadow-cyan-500/25">
                  Quero Automatizar Minha Clínica
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>

            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 rounded-3xl blur-3xl" />
                <div className="relative bg-gradient-to-br from-[hsl(215,35%,15%)] to-[hsl(215,35%,10%)] rounded-3xl p-6 border border-cyan-500/20">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                      <Bot className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold">Agente AcolheAqui</h4>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-cyan-400 text-sm">Online agora</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="bg-white/5 rounded-2xl rounded-tl-sm p-4 max-w-[85%]">
                      <p className="text-white/80 text-sm">Olá! Gostaria de agendar uma consulta para essa semana.</p>
                    </div>
                    <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl rounded-tr-sm p-4 max-w-[85%] ml-auto">
                      <p className="text-cyan-300 text-sm">Claro! 😊 Temos horários na terça às 14h ou quinta às 16h. Qual prefere?</p>
                    </div>
                    <div className="bg-white/5 rounded-2xl rounded-tl-sm p-4 max-w-[85%]">
                      <p className="text-white/80 text-sm">Terça às 14h!</p>
                    </div>
                    <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl rounded-tr-sm p-4 max-w-[85%] ml-auto">
                      <p className="text-cyan-300 text-sm">Perfeito! ✅ Confirmado para terça, 14h. Enviarei um lembrete no dia anterior!</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Members Area Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-500/20 rounded-full text-sm font-medium mb-6">
                <Video className="w-4 h-4 text-pink-400" />
                <span className="text-pink-400">Área de Membros</span>
              </div>
              
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                Sua plataforma{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-500">estilo Netflix</span>
              </h2>

              <p className="text-lg text-white/70 mb-8 max-w-lg">
                Crie cursos, mentorias e conteúdos exclusivos com uma interface moderna e profissional para seus alunos.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { icon: BookOpen, text: "Módulos e aulas" },
                  { icon: Award, text: "Certificados PDF" },
                  { icon: Users, text: "Comunidade" },
                  { icon: Calendar, text: "Eventos ao vivo" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 p-3 bg-white/5 rounded-xl border border-white/10">
                    <item.icon className="w-5 h-5 text-pink-400" />
                    <span className="text-white/80 text-sm">{item.text}</span>
                  </div>
                ))}
              </div>

              <Link to="/cadastro/premium">
                <Button size="lg" className="h-14 px-8 text-lg font-bold bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-lg shadow-pink-500/25">
                  Criar Minha Área de Membros
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>

            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-3xl blur-3xl" />
                <img 
                  src={membersAreaMockup} 
                  alt="Área de Membros" 
                  className="relative w-full max-w-xl mx-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Checkout + CRM Section */}
      <section className="py-24 bg-gradient-to-b from-[hsl(215,30%,10%)] to-[hsl(215,30%,8%)]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Mais funcionalidades{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">incríveis</span>
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Checkout Card */}
            <div className="group bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-3xl p-8 hover:border-green-500/40 transition-all duration-500">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <CreditCard className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Checkout Profissional</h3>
                  <p className="text-white/50">Receba pagamentos direto na sua conta</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {["Pix instantâneo 24h", "Cartão em até 12x", "Boleto bancário", "Sem taxas ocultas"].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-white/70">{item}</span>
                  </div>
                ))}
              </div>

              <img 
                src={checkoutMockup} 
                alt="Checkout" 
                className="w-full rounded-xl border border-white/10"
              />
            </div>

            {/* CRM Card */}
            <div className="group bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-3xl p-8 hover:border-purple-500/40 transition-all duration-500">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                  <Calendar className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">CRM + Agenda</h3>
                  <p className="text-white/50">Gestão completa da sua clínica</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {["Google Calendar integrado", "Prontuário digital", "Controle financeiro", "Relatórios detalhados"].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-purple-500" />
                    <span className="text-white/70">{item}</span>
                  </div>
                ))}
              </div>

              <img 
                src={crmAgendaMockup} 
                alt="CRM e Agenda" 
                className="w-full rounded-xl border border-white/10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="depoimentos" className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 rounded-full text-sm font-medium mb-6">
              <Heart className="w-4 h-4 text-amber-400" />
              <span className="text-amber-400">Depoimentos</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Quem usa,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">recomenda</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((testimonial, i) => (
              <div 
                key={i}
                className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-6 hover:border-primary/30 transition-all duration-300"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                
                <p className="text-white/70 mb-6 italic">"{testimonial.text}"</p>
                
                <div className="flex items-center gap-3">
                  <img src={testimonial.avatar} alt={testimonial.name} className="w-12 h-12 rounded-full" />
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-white/50 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="precos" className="py-24 bg-gradient-to-b from-[hsl(215,30%,10%)] to-[hsl(215,30%,8%)]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 rounded-full text-sm font-medium mb-6">
              <Crown className="w-4 h-4 text-primary" />
              <span className="text-primary">Preços Simples</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Um plano,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-violet-400">tudo incluso</span>
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Sem surpresas. Acesso completo a todas as funcionalidades por um único valor.
            </p>
          </div>

          <div className="max-w-lg mx-auto">
            <div className="relative bg-gradient-to-br from-primary/10 to-violet-500/10 border-2 border-primary rounded-3xl p-8 overflow-hidden">
              <div className="absolute top-0 right-0 bg-gradient-to-r from-primary to-violet-500 text-white text-sm font-bold px-4 py-1 rounded-bl-xl">
                MAIS POPULAR
              </div>

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">Plano Premium</h3>
                <p className="text-white/60 mb-4">Acesso completo a tudo</p>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-5xl font-extrabold">R$ 97</span>
                  <span className="text-white/60">/mês</span>
                </div>
                <p className="text-primary text-sm mt-2">ou R$ 970/ano (economize 2 meses)</p>
              </div>

              <div className="space-y-3 mb-8">
                {[
                  "Perfil profissional completo",
                  "CRM + Agenda integrada",
                  "Agentes de IA (WhatsApp + Instagram)",
                  "Área de membros ilimitada",
                  "Checkout próprio",
                  "Sala de telepsicoterapia",
                  "Certificados automáticos",
                  "Suporte prioritário 24/7"
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-white/80">{feature}</span>
                  </div>
                ))}
              </div>

              <Link to="/cadastro/premium" className="block">
                <Button className="w-full h-14 text-lg font-bold bg-gradient-to-r from-primary to-violet-500 hover:from-primary/90 hover:to-violet-500/90 shadow-lg shadow-primary/25">
                  Começar Agora — 7 Dias Grátis
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>

              <p className="text-center text-white/50 text-sm mt-4">
                Cancele quando quiser. Sem multas ou taxas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[200px]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Pronto para transformar sua{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-violet-400">prática profissional?</span>
            </h2>
            <p className="text-xl text-white/60 mb-10">
              Junte-se a centenas de psicoterapeutas que já estão usando o AcolheAqui para escalar seus atendimentos.
            </p>

            <Link to="/cadastro/premium">
              <Button 
                size="lg" 
                className="h-16 px-10 text-xl font-bold bg-gradient-to-r from-primary to-violet-500 hover:from-primary/90 hover:to-violet-500/90 shadow-2xl shadow-primary/30 hover:scale-105 transition-transform"
              >
                Começar Gratuitamente
                <Rocket className="ml-3 w-6 h-6" />
              </Button>
            </Link>

            <p className="text-white/40 mt-6">
              7 dias grátis • Sem compromisso • Cancele quando quiser
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Logo className="h-8" />
              <span className="text-white/40">|</span>
              <span className="text-white/60 text-sm">A plataforma para psicoterapeutas</span>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <Link to="/" className="text-white/60 hover:text-white transition-colors">Início</Link>
              <Link to="/psicoterapeutas" className="text-white/60 hover:text-white transition-colors">Profissionais</Link>
              <Link to="/termos-de-uso" className="text-white/60 hover:text-white transition-colors">Termos</Link>
              <Link to="/politica-de-privacidade" className="text-white/60 hover:text-white transition-colors">Privacidade</Link>
            </div>
            
            <p className="text-white/40 text-sm">
              © {new Date().getFullYear()} AcolheAqui
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Vendas;
