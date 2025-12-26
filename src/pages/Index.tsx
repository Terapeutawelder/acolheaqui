import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ChevronRight, MessageCircle, Brain, User } from "lucide-react";
import heroClient from "@/assets/hero-client.png";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/">
          <Logo size="sm" />
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Encontrar profissionais
          </Link>
          <Link to="/profissionais" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Sou profissional
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link to="/profissionais">
            <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-2">
              <User size={16} />
              Acesso profissional
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

const HeroSection = () => {
  return (
    <section className="pt-24 pb-16 md:pt-32 md:pb-24">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-6 opacity-0 animate-fade-in-up">
              Encontre profissionais para quem busca{" "}
              <span className="text-primary">apoio</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto lg:mx-0 opacity-0 animate-fade-in-up animate-delay-100">
              Um espaço seguro para falar sobre o que você vive e sentir-se acolhido(a).
            </p>
            
            {/* Avatar stack */}
            <div className="flex items-center justify-center lg:justify-start gap-2 mb-8 opacity-0 animate-fade-in-up animate-delay-200">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 border-2 border-background flex items-center justify-center"
                  >
                    <User size={16} className="text-primary" />
                  </div>
                ))}
              </div>
              <span className="text-sm text-muted-foreground ml-2">+500 profissionais</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 opacity-0 animate-fade-in-up animate-delay-300">
              <Button size="lg" className="w-full sm:w-auto group">
                Encontrar profissionais
                <ChevronRight size={18} className="ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            <p className="flex items-center justify-center lg:justify-start gap-2 mt-6 text-sm text-muted-foreground opacity-0 animate-fade-in-up animate-delay-400">
              <Brain size={18} className="text-accent" />
              Agende em minutos pelo WhatsApp
            </p>
          </div>

          {/* Right Image */}
          <div className="flex-1 relative opacity-0 animate-fade-in-up animate-delay-200">
            <div className="relative">
              {/* Pink circle background */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[90%] aspect-square rounded-full bg-primary/20" />
              </div>
              <img
                src={heroClient}
                alt="Pessoa usando o Mindset"
                className="relative z-10 w-full max-w-md mx-auto"
              />
              {/* Floating chat bubble */}
              <div className="absolute top-4 right-0 md:right-8 bg-card rounded-xl p-3 shadow-lg border border-border animate-fade-in-up animate-delay-400">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <User size={14} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-foreground">Olá! Quero agendar</p>
                    <p className="text-xs text-muted-foreground">minha consulta.</p>
                  </div>
                </div>
              </div>
            </div>
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
      description: "Todos os profissionais passam por verificação para garantir qualidade.",
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
          Seu ponto seguro para descobrir profissionais
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
      text: "Achei super fácil encontrar um profissional e já comecei meu atendimento no mesmo dia.",
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
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-4">
          O que estão falando sobre o Mindset?
        </h2>
        <p className="text-center text-muted-foreground mb-12">
          Veja alguns depoimentos de quem encontrou seu profissional
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-card rounded-2xl p-6 border border-border hover:border-primary/30 transition-colors"
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
          Comece sua jornada hoje
        </h2>
        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
          Encontre o profissional ideal para você em poucos cliques.
        </p>
        <Button size="lg" className="group">
          Encontrar profissionais
          <ChevronRight size={18} className="ml-1 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="py-8 px-4 bg-card border-t border-border">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <Logo size="sm" />
        <nav className="flex items-center gap-6">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Para clientes
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
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </main>
  );
};

export default Index;
