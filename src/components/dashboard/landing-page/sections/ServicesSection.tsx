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
    <section id="servicos" className="py-20 bg-sand/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block px-4 py-1.5 bg-teal-light border border-teal/20 text-teal font-semibold text-sm rounded-full mb-4">
            Nossos Serviços
          </span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl mb-4 text-charcoal">
            {config.services.title.includes("Ajudar") ? (
              <>
                {config.services.title.split("Ajudar")[0]}
                <span className="text-teal">Ajudar</span>
                {config.services.title.split("Ajudar")[1]}
              </>
            ) : config.services.title}
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
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-light/60 mb-6 group-hover:scale-110 group-hover:bg-teal transition-all duration-500">
                  <service.icon className="w-7 h-7 text-teal group-hover:text-white transition-colors duration-500" />
                </div>
                <h3 className="font-serif text-lg mb-3 text-charcoal group-hover:text-teal transition-colors duration-300">{service.title}</h3>
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
