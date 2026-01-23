import { Heart, Users, ThumbsUp } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import membersAreaMockup from "@/assets/members-area-mockup.jpg";

const stats = [
  {
    icon: Heart,
    title: "Plataforma completa para sua prática",
    description: "CRM, agenda, checkout, área de membros, agentes de IA e muito mais. Tudo integrado para você crescer.",
    highlight: true,
  },
  {
    icon: Users,
    title: "+ de 300 profissionais ativos",
    description: "Uma comunidade que não para de crescer.",
    highlight: false,
  },
  {
    icon: ThumbsUp,
    title: "+ 95% de satisfação",
    description: "Profissionais que recomendam nossa plataforma.",
    highlight: false,
  },
];

const FeaturesShowcaseSection = () => {
  return (
    <section id="funcionalidades" className="py-20 bg-[hsl(215,35%,95%)] overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Text and Stats */}
          <div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-[hsl(215,35%,15%)] leading-tight">
              Por que investir na sua carreira é a melhor opção?
            </h2>
            <p className="text-[hsl(215,35%,40%)] text-lg mb-10 max-w-xl">
              Invista na sua carreira e dê o primeiro passo rumo ao seu crescimento e bem-estar profissional.
              Veja, em números, o que temos a oferecer.
            </p>

            {/* Stats cards */}
            <div className="space-y-4">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className={`
                    p-5 rounded-2xl transition-all duration-300 hover:translate-x-2
                    ${stat.highlight 
                      ? 'bg-white shadow-lg border-l-4 border-primary' 
                      : 'bg-white/70 hover:bg-white hover:shadow-md'
                    }
                  `}
                >
                  <div className="flex items-start gap-4">
                    <div className={`
                      w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                      ${stat.highlight ? 'bg-primary/10' : 'bg-[hsl(215,35%,90%)]'}
                    `}>
                      <stat.icon className={`w-5 h-5 ${stat.highlight ? 'text-primary' : 'text-[hsl(215,35%,40%)]'}`} />
                    </div>
                    <div>
                      <h3 className={`font-bold mb-1 ${stat.highlight ? 'text-[hsl(215,35%,15%)]' : 'text-[hsl(215,35%,25%)]'}`}>
                        {stat.title}
                      </h3>
                      {stat.highlight && (
                        <p className="text-[hsl(215,35%,50%)] text-sm">{stat.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right side - Members Area Image */}
          <div className="relative">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-3xl -rotate-3 scale-105" />
            <div className="absolute inset-0 bg-gradient-to-tl from-primary/10 via-transparent to-primary/5 rounded-3xl rotate-2 scale-105" />
            
            {/* Grid pattern overlay */}
            <div 
              className="absolute inset-0 rounded-3xl opacity-30"
              style={{
                backgroundImage: `
                  linear-gradient(to right, hsl(var(--primary) / 0.3) 1px, transparent 1px),
                  linear-gradient(to bottom, hsl(var(--primary) / 0.3) 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px'
              }}
            />

            {/* Members Area Image */}
            <div className="relative z-10 p-4">
              <div className="relative group">
                {/* Image container with effects */}
                <div className="relative overflow-hidden rounded-2xl shadow-2xl transform transition-all duration-500 group-hover:scale-[1.02]">
                  <img
                    src={membersAreaMockup}
                    alt="Área de Membros AcolheAqui"
                    className="w-full h-auto object-cover"
                  />
                  
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Title overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <span className="inline-block px-4 py-2 bg-primary text-white rounded-full text-sm font-medium">
                      Área de Membros
                    </span>
                  </div>
                </div>
                
                {/* Glow effect */}
                <div className="absolute -inset-2 bg-primary/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
              </div>
            </div>

            {/* Floating badges */}
            <div className="absolute -top-4 -right-4 px-4 py-2 bg-white rounded-full shadow-lg z-20 animate-bounce">
              <span className="text-sm font-medium text-primary">✨ AcolheAqui</span>
            </div>
            
            <Link to="#planos" className="absolute -bottom-4 -left-4 z-20">
              <Button className="rounded-full shadow-lg bg-primary hover:bg-primary/90 text-white">
                Começar Agora
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesShowcaseSection;
