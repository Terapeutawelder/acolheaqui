import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ChevronRight, MessageCircle, Brain, User } from "lucide-react";
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
import SessionPackagesSection from "@/components/SessionPackagesSection";

const avatars = [avatar1, avatar2, avatar3, avatar4, avatar5];

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-transparent">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/">
          <Logo size="sm" variant="light" />
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/psicoterapeutas" className="text-sm font-medium text-white/90 hover:text-white transition-colors">
            Encontrar profissionais
          </Link>
          <Link to="/profissionais" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
            Sou profissional
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link to="/psicoterapeutas">
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-white">
              Agendar sessão
            </Button>
          </Link>
          <Link to="/profissionais">
            <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10 hover:border-white/50">
              Entrar
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image - Full screen */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBgNew})` }}
      />
      
      {/* Gradient Overlay - darker on left for text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />

      {/* Content - Left aligned */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 opacity-0 animate-fade-in-up">
            O cuidado que a sua{" "}
            <span className="text-primary">mente</span> precisa!
          </h1>
          
          <p className="text-lg md:text-xl text-white/80 mb-8 max-w-xl opacity-0 animate-fade-in-up animate-delay-100">
            Agora você pode <strong className="text-white">encontrar o psicoterapeuta ideal</strong> e{" "}
            <strong className="text-white">cuidar da sua saúde mental</strong> com profissionais verificados.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-start gap-4 mb-8 opacity-0 animate-fade-in-up animate-delay-200">
            <Link to="/psicoterapeutas">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg group">
                Agendar sessão
                <ChevronRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/profissionais">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white/40 text-white hover:bg-white/10 hover:border-white/60 px-8 py-6 text-lg"
              >
                Sou profissional
              </Button>
            </Link>
          </div>

          {/* Trust indicators with real avatars */}
          <div className="flex items-center gap-6 opacity-0 animate-fade-in-up animate-delay-300">
            <div className="flex -space-x-3">
              {avatars.map((avatar, i) => (
                <img
                  key={i}
                  src={avatar}
                  alt={`Psicoterapeuta ${i + 1}`}
                  className="w-11 h-11 rounded-full border-2 border-white/30 object-cover"
                />
              ))}
            </div>
            <span className="text-white/70 text-sm">+500 psicoterapeutas verificados</span>
          </div>
        </div>
      </div>

      {/* Bottom Banner */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <div className="container mx-auto px-4 pb-10">
          <div className="text-center">
            <p className="text-white text-xl md:text-2xl font-semibold">
              Sessões de Terapia Online a partir de R$ 37,90!
            </p>
            <p className="text-primary text-lg md:text-xl font-medium mt-2 flex items-center justify-center gap-2">
              <MessageCircle size={22} className="fill-primary" />
              Agende em minutos pelo WhatsApp!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

const FeaturesSection = () => {
  const features = [
    {
      icon: MessageCircle,
      title: "Converse pelo WhatsApp",
      description: "Um primeiro contato simples e direto para entender como podemos te ajudar.",
    },
    {
      icon: Brain,
      title: "Profissionais verificados",
      description: "Psicólogos, psicanalistas e terapeutas com registro ativo e verificado.",
    },
    {
      icon: User,
      title: "Escolha com segurança",
      description: "Perfis completos com diferentes abordagens e especializações.",
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-card">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-4">
          Seu ponto seguro para descobrir psicoterapeutas
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Profissionais preparados para caminhar com você no seu tempo.
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-background rounded-2xl p-6 text-center hover:shadow-lg transition-shadow"
            >
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <feature.icon size={24} className="text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
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
      text: "Achei super fácil encontrar um psicoterapeuta e já comecei meu atendimento no mesmo dia.",
      author: "Ana S.",
      role: "Cliente Mindset",
    },
    {
      text: "Gostei da plataforma, é prática e intuitiva. Em poucos cliques encontrei alguém que combinava comigo.",
      author: "Bruna C.",
      role: "Cliente Mindset",
    },
    {
      text: "Nunca imaginei que seria tão fácil agendar. A experiência foi acolhedora do início ao fim.",
      author: "Camila T.",
      role: "Cliente Mindset",
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-card">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-4">
          O que estão falando sobre o Mindset?
        </h2>
        <p className="text-center text-muted-foreground mb-12">
          Veja alguns depoimentos de quem encontrou seu psicoterapeuta
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-background rounded-2xl p-6 border border-border hover:border-primary/30 transition-colors"
            >
              <p className="text-foreground mb-6 italic">"{testimonial.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
                  <User size={16} className="text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">{testimonial.author}</p>
                  <p className="text-muted-foreground text-xs">{testimonial.role}</p>
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
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-primary/10 to-accent/10">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
          Seu bem-estar começa com um simples passo
        </h2>
        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
          Encontre o psicoterapeuta ideal para você em poucos cliques.
        </p>
        <Link to="/psicoterapeutas">
          <Button size="lg" className="group">
            Encontrar psicoterapeutas
            <ChevronRight size={18} className="ml-1 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
    </section>
  );
};

const CrisisAlert = () => {
  return (
    <div className="bg-muted py-4 text-center">
      <p className="text-sm text-muted-foreground max-w-2xl mx-auto px-4">
        Se você estiver passando por uma crise emocional ou pensando em suicídio, procure ajuda imediatamente.{" "}
        <a href="tel:188" className="text-primary font-medium hover:underline">
          Ligue para o CVV – 188
        </a>{" "}
        (24h, ligação gratuita).
      </p>
    </div>
  );
};

const Footer = () => {
  return (
    <footer className="py-8 px-4 bg-card border-t border-border">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <Logo size="sm" />
        <nav className="flex items-center gap-6">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Início
          </Link>
          <Link to="/psicoterapeutas" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Encontrar profissionais
          </Link>
          <Link to="/profissionais" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Para profissionais
          </Link>
        </nav>
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Mindset. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
};

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      
      <FeaturesSection />
      <SessionPackagesSection />
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