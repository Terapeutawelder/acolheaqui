import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight, Heart, Brain, Frown, Smile, Users, Briefcase, Shield, Sparkles } from "lucide-react";

const areas = [
  {
    icon: Frown,
    title: "Depressão",
    description: "Profissionais que trabalham com temas relacionados à depressão, acolhendo sua experiência emocional.",
    slug: "depressao",
  },
  {
    icon: Brain,
    title: "Ansiedade",
    description: "Psicoterapeutas que atuam com ansiedade e oferecem espaços de escuta acolhedora.",
    slug: "ansiedade",
  },
  {
    icon: Sparkles,
    title: "Estresse",
    description: "Profissionais que trabalham com temas ligados ao estresse do dia a dia.",
    slug: "estresse",
  },
  {
    icon: Smile,
    title: "Autoestima",
    description: "Apoio para fortalecer sua autoestima e autoconfiança.",
    slug: "autoestima",
  },
  {
    icon: Users,
    title: "Conflitos Familiares",
    description: "Suporte para lidar com questões e dinâmicas familiares.",
    slug: "conflitos-familiares",
  },
  {
    icon: Briefcase,
    title: "Estresse no Trabalho",
    description: "Apoio para lidar com pressões e desafios profissionais.",
    slug: "estresse-trabalho",
  },
  {
    icon: Heart,
    title: "Relacionamentos",
    description: "Suporte para questões afetivas e interpessoais.",
    slug: "relacionamentos",
  },
  {
    icon: Shield,
    title: "Trauma",
    description: "Profissionais especializados em trabalhar com experiências traumáticas.",
    slug: "trauma",
  },
];

const AreasSection = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-4">
          Psicoterapeutas por área de apoio
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Encontre psicólogos, psicanalistas e terapeutas nas áreas que mais fazem sentido para o seu momento.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {areas.map((area) => (
            <Link
              key={area.slug}
              to={`/psicoterapeutas?area=${area.slug}`}
              className="group bg-card rounded-2xl p-5 border border-border hover:border-primary/40 hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <area.icon size={22} className="text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                {area.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {area.description}
              </p>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link to="/psicoterapeutas">
            <Button variant="outline" className="group">
              Ver todas as áreas de apoio
              <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default AreasSection;
