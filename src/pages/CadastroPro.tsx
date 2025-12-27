import { MessageCircle, Users, Clock } from "lucide-react";
import Logo from "@/components/Logo";
import Marquee from "@/components/Marquee";

const CadastroPro = () => {
  const whatsappLink = "https://chat.whatsapp.com/KxbbUiKKg8v3f3FB89nCV1";
  const vagasRestantes = 7; // Número de vagas restantes

  return (
    <div className="min-h-screen pro-theme">
      {/* Hero Section */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 py-20"
        style={{
          backgroundImage: `url('/hero-bg-pro.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/70 to-background/85" />

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Logo */}
          <div className="mb-8">
            <Logo className="mx-auto h-12" />
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight animate-fade-in-up">
            Comece sua jornada com o{" "}
            <span className="text-primary">Plano Pro</span> e atraia mais pacientes!
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-in-up animate-delay-100">
            Perfil na plataforma, CRM com agenda e controle financeiro para você começar com tudo.
          </p>

          {/* CTA Button */}
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 text-lg font-semibold bg-primary text-primary-foreground rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl animate-pulse-glow animate-fade-in-up animate-delay-200"
          >
            <MessageCircle className="w-6 h-6" />
            ENTRAR NO GRUPO DE ESPERA!
          </a>

          {/* Urgency Counter */}
          <div className="mt-8 animate-fade-in-up animate-delay-300">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-destructive/10 border border-destructive/30 rounded-full">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-destructive animate-pulse" />
                <span className="text-destructive font-bold text-lg">{vagasRestantes}</span>
              </div>
              <span className="text-foreground font-medium">vagas restantes</span>
              <Clock className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>

          {/* Extra info */}
          <p className="mt-4 text-sm text-muted-foreground italic animate-fade-in-up animate-delay-400">
            <strong>Acesso prioritário</strong> • Benefícios exclusivos • Suporte dedicado
          </p>
        </div>
      </section>

      {/* Marquee */}
      <Marquee />

      {/* Second Section */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-6">
            Entre em contato e receba as informações completas sobre o Plano Pro.
          </h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Se você é psicólogo(a) e quer começar sua jornada na plataforma Mindset,{" "}
            <strong className="text-foreground">o Plano Pro é ideal para você.</strong>
          </p>

          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 text-lg font-semibold bg-primary text-primary-foreground rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl"
          >
            <MessageCircle className="w-6 h-6" />
            ENTRAR NO GRUPO DE ESPERA!
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-muted/50 border-t border-border">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-4">
          <Logo className="h-8" />
          <p className="text-sm text-muted-foreground">
            © Copyright 2025 - Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default CadastroPro;
