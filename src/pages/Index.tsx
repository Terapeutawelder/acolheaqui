import { useState, useEffect, useRef } from "react";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { 
  ChevronRight, 
  MessageCircle, 
  Brain, 
  User, 
  Menu, 
  X,
  Search,
  Calendar,
  Shield,
  Star,
  CheckCircle,
  Heart,
  Clock,
  ArrowRight
} from "lucide-react";
import heroBgNew from "@/assets/hero-bg-new.jpg";
import avatar1 from "@/assets/avatar-1.jpg";
import avatar2 from "@/assets/avatar-2.jpg";
import avatar3 from "@/assets/avatar-3.jpg";
import avatar4 from "@/assets/avatar-4.jpg";
import avatar5 from "@/assets/avatar-5.jpg";

import AreasSection from "@/components/AreasSection";
import WhatsAppChat from "@/components/WhatsAppChat";
import FAQSection from "@/components/FAQSection";
import SpecialtiesSection from "@/components/SpecialtiesSection";
import VideoSection from "@/components/VideoSection";
import TherapyOnlineSection from "@/components/TherapyOnlineSection";

const avatars = [avatar1, avatar2, avatar3, avatar4, avatar5];

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    };
    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileMenuOpen]);

  return (
    <header 
      ref={menuRef} 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-background/95 backdrop-blur-md shadow-lg border-b border-border/50' 
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/">
          <Logo size="sm" variant={isScrolled ? "default" : "light"} />
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          <a 
            href="#como-funciona" 
            className={`text-sm font-medium transition-colors ${
              isScrolled ? 'text-muted-foreground hover:text-foreground' : 'text-white/80 hover:text-white'
            }`}
          >
            Como funciona
          </a>
          <Link 
            to="/psicoterapeutas" 
            className={`text-sm font-medium transition-colors ${
              isScrolled ? 'text-primary hover:text-primary/80' : 'text-white hover:text-white/80'
            }`}
          >
            Encontrar profissional
          </Link>
          <Link 
            to="/profissionais" 
            className={`text-sm font-medium transition-colors ${
              isScrolled ? 'text-muted-foreground hover:text-foreground' : 'text-white/80 hover:text-white'
            }`}
          >
            Sou profissional
          </Link>
        </nav>
        
        <div className="hidden md:flex items-center gap-3">
          <Link to="/auth">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`${isScrolled ? 'text-foreground hover:bg-muted' : 'text-white hover:bg-white/10'}`}
            >
              Entrar
            </Button>
          </Link>
          <Link to="/psicoterapeutas">
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25">
              Agendar sessão
            </Button>
          </Link>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`md:hidden p-2 rounded-lg transition-colors ${
            isScrolled ? 'text-foreground hover:bg-muted' : 'text-white hover:bg-white/10'
          }`}
          aria-label="Menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div 
        className={`md:hidden bg-background/95 backdrop-blur-md border-t border-border overflow-hidden transition-all duration-300 ${
          mobileMenuOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="container mx-auto px-4 py-4 flex flex-col gap-3">
          <a 
            href="#como-funciona" 
            className="text-sm font-medium text-muted-foreground hover:text-foreground py-2"
            onClick={() => setMobileMenuOpen(false)}
          >
            Como funciona
          </a>
          <Link 
            to="/psicoterapeutas" 
            className="text-sm font-medium text-primary py-2"
            onClick={() => setMobileMenuOpen(false)}
          >
            Encontrar profissional
          </Link>
          <Link 
            to="/profissionais" 
            className="text-sm font-medium text-muted-foreground hover:text-foreground py-2"
            onClick={() => setMobileMenuOpen(false)}
          >
            Sou profissional
          </Link>
          <div className="flex flex-col gap-2 pt-2 border-t border-border">
            <Link to="/psicoterapeutas" onClick={() => setMobileMenuOpen(false)}>
              <Button size="sm" className="w-full">
                Agendar sessão
              </Button>
            </Link>
            <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" size="sm" className="w-full">
                Entrar
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

const HeroSection = () => {
  const [bgLoaded, setBgLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const img = new Image();
    img.src = heroBgNew;
    img.onload = () => setBgLoaded(true);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
          bgLoaded ? "opacity-100" : "opacity-0"
        }`}
        style={{ backgroundImage: `url(${heroBgNew})` }}
      />
      <div className={`absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/20 transition-opacity duration-1000 ${bgLoaded ? "opacity-0" : "opacity-100"}`} />
      
      {/* Overlays for depth */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40" />

      <div className="relative z-10 container mx-auto px-4 pt-24 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-sm text-white/90 animate-fade-in">
                <Shield className="w-4 h-4 text-primary" />
                <span>+300 profissionais verificados</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight animate-fade-in">
                Sua saúde mental 
                <span className="block text-primary mt-2">merece atenção</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-white/80 max-w-lg leading-relaxed animate-fade-in animate-delay-100">
                Encontre o psicoterapeuta ideal e agende sua sessão online em poucos cliques. 
                Cuidar de você nunca foi tão simples.
              </p>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center gap-6 animate-fade-in animate-delay-200">
              <div className="flex items-center gap-2 text-white/70">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span className="text-sm">Profissionais com CRP</span>
              </div>
              <div className="flex items-center gap-2 text-white/70">
                <Clock className="w-5 h-5 text-primary" />
                <span className="text-sm">Sessões de 50min</span>
              </div>
              <div className="flex items-center gap-2 text-white/70">
                <Heart className="w-5 h-5 text-primary" />
                <span className="text-sm">100% online</span>
              </div>
            </div>

            {/* Avatars */}
            <div className="flex items-center gap-4 animate-fade-in animate-delay-300">
              <div className="flex -space-x-3">
                {avatars.map((avatar, i) => (
                  <img
                    key={i}
                    src={avatar}
                    alt={`Psicoterapeuta ${i + 1}`}
                    className="w-10 h-10 rounded-full border-2 border-white/30 object-cover"
                  />
                ))}
              </div>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map((i) => (
                  <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                ))}
                <span className="text-white/70 text-sm ml-2">4.9/5 avaliações</span>
              </div>
            </div>
          </div>

          {/* Right Content - Search Card */}
          <div className="animate-fade-in animate-delay-100">
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-2xl mb-4">
                  <Calendar className="w-7 h-7 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Agende sua sessão</h2>
                <p className="text-muted-foreground mt-2">
                  Encontre um profissional e cuide da sua saúde mental hoje
                </p>
              </div>

              <div className="space-y-4">
                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="text-center p-3 bg-primary/5 rounded-xl">
                    <p className="text-2xl font-bold text-primary">300+</p>
                    <p className="text-xs text-muted-foreground">Profissionais</p>
                  </div>
                  <div className="text-center p-3 bg-primary/5 rounded-xl">
                    <p className="text-2xl font-bold text-primary">5mil+</p>
                    <p className="text-xs text-muted-foreground">Sessões</p>
                  </div>
                  <div className="text-center p-3 bg-primary/5 rounded-xl">
                    <p className="text-2xl font-bold text-primary">4.9</p>
                    <p className="text-xs text-muted-foreground">Avaliação</p>
                  </div>
                </div>

                {/* Price Badge */}
                <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-4 text-center border border-primary/20">
                  <p className="text-sm text-muted-foreground">Sessões a partir de</p>
                  <p className="text-3xl font-bold text-primary">R$ 37,90</p>
                  <p className="text-xs text-muted-foreground mt-1">Primeira sessão com desconto especial</p>
                </div>

                {/* CTA Buttons */}
                <Button 
                  size="lg" 
                  className="w-full py-6 text-lg group shadow-lg shadow-primary/25"
                  onClick={() => navigate('/psicoterapeutas')}
                >
                  <Search className="w-5 h-5 mr-2" />
                  Encontrar meu profissional
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>

                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full py-6 text-lg border-2"
                  onClick={() => window.open('https://wa.me/5511999999999', '_blank')}
                >
                  <MessageCircle className="w-5 h-5 mr-2 text-green-600" />
                  Falar pelo WhatsApp
                </Button>
              </div>

              <p className="text-center text-xs text-muted-foreground mt-4">
                ✓ Sem compromisso · ✓ Cancele quando quiser · ✓ 100% online
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const HowItWorksSection = () => {
  const steps = [
    {
      number: "01",
      icon: Search,
      title: "Encontre seu profissional",
      description: "Explore perfis verificados e escolha o psicoterapeuta que mais combina com você.",
    },
    {
      number: "02",
      icon: Calendar,
      title: "Agende sua sessão",
      description: "Escolha o melhor dia e horário diretamente na agenda do profissional.",
    },
    {
      number: "03",
      icon: Heart,
      title: "Cuide da sua mente",
      description: "Realize suas sessões 100% online, no conforto da sua casa.",
    },
  ];

  return (
    <section id="como-funciona" className="py-20 md:py-28 bg-background scroll-mt-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-sm font-semibold text-primary mb-4 tracking-wider uppercase">
            Como funciona
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Cuidar da sua saúde mental é simples
          </h2>
          <p className="text-lg text-muted-foreground">
            Em apenas três passos, você estará no caminho do seu bem-estar
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative group"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
              )}
              
              <div className="bg-card rounded-2xl p-8 border border-border hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-5xl font-bold text-primary/20 group-hover:text-primary/30 transition-colors">
                    {step.number}
                  </span>
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                    <step.icon className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const FeaturesSection = () => {
  const features = [
    {
      icon: Shield,
      title: "Profissionais Verificados",
      description: "Todos os psicólogos possuem CRP ativo e são cuidadosamente verificados pela nossa equipe.",
    },
    {
      icon: MessageCircle,
      title: "Atendimento Humanizado",
      description: "Suporte dedicado pelo WhatsApp para te ajudar em cada etapa do processo.",
    },
    {
      icon: Brain,
      title: "Diversas Abordagens",
      description: "Encontre profissionais especializados em TCC, Psicanálise, Gestalt e outras abordagens.",
    },
    {
      icon: Clock,
      title: "Flexibilidade Total",
      description: "Sessões online que se adaptam à sua rotina. Agende de qualquer lugar.",
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-sm font-semibold text-primary mb-4 tracking-wider uppercase">
            Por que nos escolher
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Uma plataforma pensada para você
          </h2>
          <p className="text-lg text-muted-foreground">
            Conectamos você aos melhores profissionais de saúde mental do Brasil
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-background rounded-2xl p-6 border border-border hover:border-primary/20 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                <feature.icon className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const TestimonialsSection = () => {
  const testimonials = [
    {
      text: "Encontrei um profissional incrível que me ajudou a superar momentos difíceis. A plataforma tornou tudo muito simples.",
      author: "Ana S.",
      role: "Cliente há 6 meses",
      rating: 5,
    },
    {
      text: "A praticidade de agendar online e a qualidade dos profissionais me surpreenderam. Recomendo a todos.",
      author: "Carlos M.",
      role: "Cliente há 3 meses",
      rating: 5,
    },
    {
      text: "Finalmente encontrei um espaço seguro para cuidar da minha saúde mental. Gratidão pela plataforma.",
      author: "Juliana R.",
      role: "Cliente há 1 ano",
      rating: 5,
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-sm font-semibold text-primary mb-4 tracking-wider uppercase">
            Depoimentos
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            O que dizem nossos clientes
          </h2>
          <p className="text-lg text-muted-foreground">
            Histórias de pessoas que transformaram suas vidas
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-card rounded-2xl p-8 border border-border hover:border-primary/20 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex gap-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-foreground mb-6 leading-relaxed">"{testimonial.text}"</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const CTASection = () => {
  const navigate = useNavigate();
  
  return (
    <section className="py-20 md:py-28 bg-gradient-to-br from-primary to-primary/80 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
      
      <div className="container mx-auto px-4 text-center relative z-10">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
          Comece sua jornada de autocuidado
        </h2>
        <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
          Dê o primeiro passo para uma vida mais equilibrada. 
          Nossos profissionais estão prontos para te acolher.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            variant="secondary"
            className="py-6 px-8 text-lg shadow-xl"
            onClick={() => navigate('/psicoterapeutas')}
          >
            Encontrar meu profissional
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="py-6 px-8 text-lg border-white/30 text-white hover:bg-white/10"
            onClick={() => navigate('/profissionais')}
          >
            Sou profissional
          </Button>
        </div>
      </div>
    </section>
  );
};

const CrisisAlert = () => {
  return (
    <div className="bg-muted py-4 text-center">
      <p className="text-sm text-muted-foreground max-w-3xl mx-auto px-4">
        Se você estiver passando por uma crise emocional ou pensando em suicídio, procure ajuda imediatamente.{" "}
        <a href="tel:188" className="text-primary font-semibold hover:underline">
          Ligue para o CVV – 188
        </a>{" "}
        (24h, ligação gratuita).
      </p>
    </div>
  );
};

const Footer = () => {
  return (
    <footer className="py-16 px-4 bg-card border-t border-border">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-2">
            <Logo size="md" />
            <p className="text-muted-foreground mt-4 max-w-sm">
              Conectamos você aos melhores profissionais de saúde mental do Brasil. 
              Cuide da sua mente com quem entende.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <div className="flex -space-x-2">
                {avatars.slice(0, 3).map((avatar, i) => (
                  <img
                    key={i}
                    src={avatar}
                    alt=""
                    className="w-8 h-8 rounded-full border-2 border-card object-cover"
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">+300 profissionais</span>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-foreground mb-4">Links</h4>
            <nav className="flex flex-col gap-3">
              <Link to="/psicoterapeutas" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Encontrar profissional
              </Link>
              <Link to="/profissionais" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Para profissionais
              </Link>
              <a href="#como-funciona" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Como funciona
              </a>
            </nav>
          </div>
          
          <div>
            <h4 className="font-semibold text-foreground mb-4">Legal</h4>
            <nav className="flex flex-col gap-3">
              <Link to="/politica-de-privacidade" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Política de Privacidade
              </Link>
              <Link to="/termos-de-uso" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Termos de Uso
              </Link>
            </nav>
          </div>
        </div>
        
        <div className="pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} AcolheAqui. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <TherapyOnlineSection />
      <VideoSection />
      <WhatsAppChat />
      <AreasSection />
      <TestimonialsSection />
      <SpecialtiesSection />
      <FAQSection />
      <CTASection />
      <CrisisAlert />
      <Footer />
    </main>
  );
};

export default Index;
