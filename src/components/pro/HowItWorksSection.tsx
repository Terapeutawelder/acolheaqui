import { MessageCircle, Eye, Search, UserCheck } from "lucide-react";

const features = [
  {
    icon: MessageCircle,
    title: "Contatos via WhatsApp",
    description: "Receba contatos direto no seu WhatsApp. Sem formulários complicados ou intermediação. Conexão direta entre você e quem busca atendimento psicológico.",
  },
  {
    icon: UserCheck,
    title: "Cadastro Simples",
    description: "Cadastre-se em minutos. Preencha seus dados, envie a documentação e em até 24 horas seu perfil estará aprovado e visível para pacientes.",
  },
  {
    icon: Eye,
    title: "Mais Visibilidade",
    description: "Apareça em várias páginas de busca por cidade, abordagem e tipo de atendimento. Mais pontos de entrada, mais oportunidades de receber novos pacientes.",
  },
];

const steps = [
  {
    number: "1",
    title: "Criação do Perfil",
    description: "Você cria seu perfil em poucos minutos e envia seus documentos para verificação.",
  },
  {
    number: "2",
    title: "Visibilidade",
    description: "Seu perfil aparece nas buscas por cidade, especialidade e abordagem.",
  },
  {
    number: "3",
    title: "Descoberta",
    description: "Pessoas que buscam terapia encontram seu perfil e conhecem seu trabalho.",
  },
  {
    number: "4",
    title: "Contato Direto",
    description: "O contato acontece diretamente pelo WhatsApp, sem intermediários.",
  },
];

const HowItWorksSection = () => {
  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="como-funciona" className="py-20 bg-card/50">
      <div className="container mx-auto px-4">
        {/* Section Title */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Apareça onde seus pacientes estão
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Uma plataforma pensada para conectar você a quem precisa de cuidado profissional
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-8 bg-card rounded-2xl border border-border hover:border-primary/50 transition-all hover:shadow-lg"
            >
              <div className="w-14 h-14 bg-primary/20 rounded-xl flex items-center justify-center mb-6">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Steps Section */}
        <div className="bg-card rounded-3xl border border-border p-8 md:p-12">
          <h3 className="text-2xl md:text-3xl font-bold text-center mb-12">
            Cadastro simples e rápido
          </h3>
          
          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative text-center">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {step.number}
                </div>
                <h4 className="text-lg font-bold mb-2">{step.title}</h4>
                <p className="text-sm text-muted-foreground">{step.description}</p>
                
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-border" />
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => scrollToSection("#precos")}
              className="px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-full hover:bg-primary/90 transition-all hover:scale-105"
            >
              Quero fazer parte
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
