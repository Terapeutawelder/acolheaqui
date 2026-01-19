import { Heart, Calendar, Sparkles, Brain, Users, Star, Clock, ChevronDown, Check, Package, CalendarDays, MessageCircle, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

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
    primary: "166 76% 45%",
    secondary: "166 50% 95%",
    accent: "42 87% 55%",
    background: "0 0% 100%",
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
      { question: "Como funciona a terapia online?", answer: "As sessões são realizadas por videochamada, oferecendo a mesma qualidade do atendimento presencial com mais comodidade." },
      { question: "Qual a duração de cada sessão?", answer: "As sessões têm duração de 50 minutos a 1 hora, dependendo do tipo de atendimento escolhido." },
      { question: "Com que frequência devo fazer terapia?", answer: "Geralmente recomendamos sessões semanais no início, podendo ajustar conforme sua evolução." },
      { question: "A terapia online é tão eficaz quanto a presencial?", answer: "Sim, pesquisas mostram que a terapia online tem a mesma eficácia que a presencial." },
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

const LandingPagePreview = ({ profile, services, testimonials, config }: LandingPagePreviewProps) => {
  const primaryColor = config.colors.primary;
  const secondaryColor = config.colors.secondary;
  const accentColor = config.colors.accent;

  const defaultServices = [
    { icon: Brain, title: "Terapia Individual", description: "Sessões personalizadas para trabalhar questões emocionais e de desenvolvimento pessoal." },
    { icon: Users, title: "Terapia de Casal", description: "Apoio para casais que desejam melhorar a comunicação e fortalecer o relacionamento." },
    { icon: Heart, title: "Ansiedade e Depressão", description: "Tratamento especializado para transtornos de ansiedade e depressão." },
    { icon: Sparkles, title: "Autoconhecimento", description: "Processo terapêutico focado em desenvolver maior consciência de si mesmo." },
  ];

  return (
    <div 
      className="w-full min-h-full overflow-auto rounded-lg shadow-inner"
      style={{ 
        backgroundColor: `hsl(${config.colors.background})`,
        "--preview-primary": primaryColor,
        "--preview-secondary": secondaryColor,
        "--preview-accent": accentColor,
      } as React.CSSProperties}
    >
      {/* Hero Section */}
      <section 
        className="relative min-h-[50vh] flex items-center justify-center overflow-hidden py-16"
        style={{ background: `linear-gradient(to bottom, hsl(${secondaryColor}), hsl(${config.colors.background}))` }}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="absolute -top-20 -right-20 w-48 h-48 rounded-full blur-3xl opacity-30"
            style={{ backgroundColor: `hsl(${primaryColor})` }}
          />
          <div 
            className="absolute top-1/3 -left-16 w-40 h-40 rounded-full blur-3xl opacity-20"
            style={{ backgroundColor: `hsl(${accentColor})` }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-xs"
              style={{ 
                backgroundColor: `hsl(${secondaryColor})`,
                border: `1px solid hsl(${primaryColor} / 0.2)`,
                color: `hsl(${primaryColor})`
              }}
            >
              <Sparkles className="w-3 h-3" />
              <span className="font-semibold">{config.hero.badge}</span>
              <Heart className="w-3 h-3" />
            </div>
            
            <h1 
              className="text-2xl md:text-3xl lg:text-4xl font-serif leading-tight mb-4"
              style={{ color: "#1a1a1a" }}
            >
              {config.hero.title.split("paz interior").map((part, i) => 
                i === 0 ? (
                  <span key={i}>{part}<span style={{ color: `hsl(${primaryColor})` }}>paz interior</span></span>
                ) : part
              )}
            </h1>
            
            <p className="text-sm md:text-base text-gray-600 max-w-xl mx-auto mb-6">
              {config.hero.subtitle}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                size="sm"
                className="text-white shadow-lg"
                style={{ 
                  background: `linear-gradient(to right, hsl(${primaryColor}), hsl(${primaryColor} / 0.9))`,
                }}
              >
                <Calendar className="w-4 h-4 mr-2" />
                {config.hero.ctaText}
              </Button>
              <Button size="sm" variant="outline" className="border-gray-300">
                Saiba Mais
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-12" style={{ backgroundColor: `hsl(${secondaryColor})` }}>
        <div className="container mx-auto px-4">
          <div className="text-center max-w-lg mx-auto mb-8">
            <span 
              className="inline-block px-3 py-1 text-xs font-semibold rounded-full mb-3"
              style={{ 
                backgroundColor: `hsl(${secondaryColor})`,
                color: `hsl(${primaryColor})`,
                border: `1px solid hsl(${primaryColor} / 0.2)`
              }}
            >
              Nossos Serviços
            </span>
            <h2 className="text-xl md:text-2xl font-serif mb-2" style={{ color: "#1a1a1a" }}>
              {config.services.title.split("Ajudar").map((part, i) => 
                i === 0 ? (
                  <span key={i}>{part}<span style={{ color: `hsl(${primaryColor})` }}>Ajudar</span></span>
                ) : part
              )}
            </h2>
            <p className="text-sm text-gray-600">{config.services.subtitle}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {defaultServices.map((service, index) => (
              <Card key={index} className="bg-white border shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <div 
                    className="inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3"
                    style={{ backgroundColor: `hsl(${secondaryColor})` }}
                  >
                    <service.icon className="w-5 h-5" style={{ color: `hsl(${primaryColor})` }} />
                  </div>
                  <h3 className="text-sm font-semibold mb-1" style={{ color: "#1a1a1a" }}>{service.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center gap-6">
            <div className="w-32 h-32 rounded-2xl overflow-hidden shadow-lg flex-shrink-0">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
              ) : (
                <div 
                  className="w-full h-full flex items-center justify-center text-white text-3xl font-bold"
                  style={{ backgroundColor: `hsl(${primaryColor})` }}
                >
                  {profile?.full_name?.charAt(0) || "P"}
                </div>
              )}
            </div>
            <div>
              <span 
                className="inline-block px-3 py-1 text-xs font-semibold rounded-full mb-2"
                style={{ 
                  backgroundColor: `hsl(${secondaryColor})`,
                  color: `hsl(${primaryColor})`
                }}
              >
                {config.about.title}
              </span>
              <h2 className="text-xl font-serif mb-2" style={{ color: "#1a1a1a" }}>
                {profile?.full_name || "Nome do Profissional"}
              </h2>
              <p className="text-sm text-gray-600 mb-3">
                {profile?.bio || "Psicólogo(a) clínico(a) com especialização em terapia cognitivo-comportamental."}
              </p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                {profile?.specialty && (
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3" style={{ color: `hsl(${accentColor})` }} />
                    {profile.specialty}
                  </span>
                )}
                {profile?.crp && (
                  <span className="flex items-center gap-1">
                    <Check className="w-3 h-3" style={{ color: `hsl(${primaryColor})` }} />
                    {profile.crp}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Schedule Section */}
      <section 
        className="py-12 relative overflow-hidden"
        style={{ 
          background: `linear-gradient(135deg, hsl(${primaryColor}), hsl(${primaryColor} / 0.85))`
        }}
      >
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-lg mx-auto mb-6">
            <Badge className="bg-white/20 backdrop-blur-sm border border-white/30 text-white mb-3 px-3 py-1.5">
              <CalendarDays className="w-3 h-3 mr-1" />
              <span className="text-xs font-semibold">Agenda Online</span>
            </Badge>
            <h2 className="text-xl md:text-2xl font-serif text-white mb-2">
              Agende Sua Consulta
            </h2>
            <p className="text-sm text-white/90">
              Escolha seu plano, dia e horário
            </p>
          </div>

          <div className="max-w-xl mx-auto">
            <Card className="border-none shadow-xl bg-white">
              <div 
                className="h-1.5 rounded-t-lg"
                style={{ background: `linear-gradient(to right, hsl(${primaryColor}), hsl(${accentColor}))` }}
              />
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-2">
                  {services.slice(0, 4).map((service, i) => (
                    <div 
                      key={i} 
                      className="p-3 rounded-xl border-2 cursor-pointer hover:shadow-md transition-all"
                      style={{ borderColor: i === 0 ? `hsl(${primaryColor})` : "#e5e5e5" }}
                    >
                      <div className="text-[10px] uppercase tracking-wider font-bold" style={{ color: `hsl(${primaryColor})` }}>
                        {service.duration_minutes} min
                      </div>
                      <h3 className="text-sm font-bold text-gray-900">{service.name}</h3>
                      <div className="text-base font-bold mt-1" style={{ color: `hsl(${primaryColor})` }}>
                        R$ {(service.price_cents / 100).toFixed(2).replace('.', ',')}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      {testimonials.length > 0 && (
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-lg mx-auto mb-8">
              <span 
                className="inline-block px-3 py-1 text-xs font-semibold rounded-full mb-3"
                style={{ 
                  backgroundColor: `hsl(${secondaryColor})`,
                  color: `hsl(${primaryColor})`
                }}
              >
                Depoimentos
              </span>
              <h2 className="text-xl md:text-2xl font-serif mb-2" style={{ color: "#1a1a1a" }}>
                {config.testimonials.title}
              </h2>
              <p className="text-sm text-gray-600">{config.testimonials.subtitle}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
              {testimonials.slice(0, 3).map((testimonial, i) => (
                <Card key={i} className="bg-white border shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex gap-0.5 mb-2">
                      {Array.from({ length: testimonial.rating || 5 }).map((_, j) => (
                        <Star key={j} className="w-3 h-3 fill-current" style={{ color: `hsl(${accentColor})` }} />
                      ))}
                    </div>
                    <p className="text-xs text-gray-600 mb-3 line-clamp-3">"{testimonial.content}"</p>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: `hsl(${primaryColor})` }}
                      >
                        {testimonial.client_name?.charAt(0) || "C"}
                      </div>
                      <span className="text-xs font-semibold">{testimonial.client_name}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      <section className="py-12" style={{ backgroundColor: `hsl(${secondaryColor})` }}>
        <div className="container mx-auto px-4">
          <div className="text-center max-w-lg mx-auto mb-8">
            <span 
              className="inline-block px-3 py-1 text-xs font-semibold rounded-full mb-3"
              style={{ 
                backgroundColor: "white",
                color: `hsl(${primaryColor})`
              }}
            >
              Dúvidas Frequentes
            </span>
            <h2 className="text-xl md:text-2xl font-serif mb-2" style={{ color: "#1a1a1a" }}>
              {config.faq.title}
            </h2>
            <p className="text-sm text-gray-600">{config.faq.subtitle}</p>
          </div>

          <div className="max-w-xl mx-auto bg-white rounded-xl shadow-sm p-4">
            <Accordion type="single" collapsible>
              {config.faq.items.map((item, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="border-b border-gray-100">
                  <AccordionTrigger className="text-sm font-semibold text-left py-3 hover:no-underline">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-xs text-gray-600 pb-3">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-lg mx-auto mb-8">
            <span 
              className="inline-block px-3 py-1 text-xs font-semibold rounded-full mb-3"
              style={{ 
                backgroundColor: `hsl(${secondaryColor})`,
                color: `hsl(${primaryColor})`
              }}
            >
              Fale Conosco
            </span>
            <h2 className="text-xl md:text-2xl font-serif mb-2" style={{ color: "#1a1a1a" }}>
              {config.contact.title}
            </h2>
            <p className="text-sm text-gray-600">{config.contact.subtitle}</p>
          </div>

          <div className="max-w-lg mx-auto grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: `hsl(${secondaryColor})` }}>
              <MapPin className="w-4 h-4" style={{ color: `hsl(${primaryColor})` }} />
              <div>
                <p className="text-xs font-semibold">Endereço</p>
                <p className="text-xs text-gray-600">{config.contact.address}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: `hsl(${secondaryColor})` }}>
              <Phone className="w-4 h-4" style={{ color: `hsl(${primaryColor})` }} />
              <div>
                <p className="text-xs font-semibold">Telefone</p>
                <p className="text-xs text-gray-600">{config.contact.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: `hsl(${secondaryColor})` }}>
              <Mail className="w-4 h-4" style={{ color: `hsl(${primaryColor})` }} />
              <div>
                <p className="text-xs font-semibold">E-mail</p>
                <p className="text-xs text-gray-600">{config.contact.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: `hsl(${secondaryColor})` }}>
              <Clock className="w-4 h-4" style={{ color: `hsl(${primaryColor})` }} />
              <div>
                <p className="text-xs font-semibold">Horário</p>
                <p className="text-xs text-gray-600">{config.contact.hours}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button 
          size="sm"
          className="rounded-full shadow-lg text-white"
          style={{ backgroundColor: "#25D366" }}
        >
          <MessageCircle className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default LandingPagePreview;
