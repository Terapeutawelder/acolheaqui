import { MessageCircle, Calendar, Users } from "lucide-react";

const ProHeroSection = () => {
  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="inicio" className="relative min-h-screen flex items-center pt-20 pb-16 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      
      <div className="relative z-10 container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Conecte-se a quem precisa da sua{" "}
                <span className="text-primary">escuta profissional</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Tenha seu perfil exibido para quem busca terapia online ou presencial e{" "}
                <strong className="text-foreground">receba pacientes direto no WhatsApp.</strong>
              </p>
            </div>

            <button
              onClick={() => scrollToSection("#como-funciona")}
              className="px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-full hover:bg-primary/90 transition-all hover:scale-105"
            >
              Quero fazer parte do Mindset
            </button>

            {/* Features mini cards */}
            <div className="grid sm:grid-cols-3 gap-4 pt-6">
              <div className="flex items-center gap-3 p-4 bg-card/50 rounded-xl border border-border/50">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <MessageCircle className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-medium">Contato via WhatsApp</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-card/50 rounded-xl border border-border/50">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-medium">CRM Integrado</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-card/50 rounded-xl border border-border/50">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-medium">Mais visibilidade</span>
              </div>
            </div>
          </div>

          {/* Right content - Image grid */}
          <div className="relative hidden lg:block">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl p-6 aspect-square flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto bg-primary/30 rounded-full flex items-center justify-center mb-3">
                      <Users className="w-10 h-10 text-primary" />
                    </div>
                    <p className="text-sm font-medium">Pacientes conectados</p>
                  </div>
                </div>
                <div className="bg-card rounded-2xl p-4 border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Bem-vindo!</p>
                      <p className="text-xs text-muted-foreground">Vamos iniciar sua terapia?</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="bg-card rounded-2xl p-6 border border-border">
                  <div className="flex items-center gap-3 mb-3">
                    <Calendar className="w-5 h-5 text-primary" />
                    <span className="font-medium">Agenda Integrada</span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-primary/20 rounded-full w-full" />
                    <div className="h-2 bg-primary/10 rounded-full w-3/4" />
                    <div className="h-2 bg-primary/10 rounded-full w-1/2" />
                  </div>
                </div>
                <div className="bg-gradient-to-br from-accent/20 to-accent/5 rounded-2xl p-6 aspect-[4/3] flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary mb-1">CRM</p>
                    <p className="text-sm text-muted-foreground">Gestão completa</p>
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

export default ProHeroSection;
