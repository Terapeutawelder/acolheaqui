import { Brain, Users, Heart, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { LandingPageConfig } from "../LandingPagePreview";

interface ServicesSectionProps {
  config: LandingPageConfig;
}

const defaultServices = [
  { icon: Brain, title: "Terapia Individual", description: "Sessões personalizadas para trabalhar questões emocionais, comportamentais e de desenvolvimento pessoal." },
  { icon: Users, title: "Terapia de Casal", description: "Apoio para casais que desejam melhorar a comunicação e fortalecer o relacionamento." },
  { icon: Heart, title: "Ansiedade e Depressão", description: "Tratamento especializado para transtornos de ansiedade e depressão com abordagem humanizada." },
  { icon: Sparkles, title: "Autoconhecimento", description: "Processo terapêutico focado em desenvolver maior consciência de si mesmo e seu potencial." },
];

const ServicesSection = ({ config }: ServicesSectionProps) => {
  return (
    <section 
      id="servicos" 
      className="py-20"
      style={{ backgroundColor: `hsl(${config.colors.background} / 0.5)` }}
    >
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span 
            className="inline-block px-4 py-1.5 font-semibold text-sm rounded-full mb-4"
            style={{ 
              backgroundColor: `hsl(${config.colors.secondary})`,
              color: `hsl(${config.colors.primary})`,
              borderWidth: '1px',
              borderColor: `hsl(${config.colors.primary} / 0.2)`
            }}
          >
            Nossos Serviços
          </span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl mb-4 text-charcoal">
            {config.services.title}
          </h2>
          <p className="text-slate text-lg font-medium">{config.services.subtitle}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {defaultServices.map((service, index) => (
            <Card 
              key={index} 
              className="group bg-white rounded-2xl border border-slate/10 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 opacity-0 animate-fade-in-up overflow-hidden"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <CardContent className="p-8 text-center">
                <div 
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 group-hover:scale-110 transition-all duration-500"
                  style={{ 
                    backgroundColor: `hsl(${config.colors.secondary})`,
                  }}
                >
                  <service.icon 
                    className="w-7 h-7 transition-colors duration-500" 
                    style={{ color: `hsl(${config.colors.primary})` }}
                  />
                </div>
                <h3 
                  className="font-serif text-lg mb-3 text-charcoal transition-colors duration-300"
                  style={{ '--hover-color': `hsl(${config.colors.primary})` } as React.CSSProperties}
                >
                  {service.title}
                </h3>
                <p className="text-slate text-sm leading-relaxed">{service.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
