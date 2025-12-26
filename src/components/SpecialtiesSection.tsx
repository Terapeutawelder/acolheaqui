import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const specialties = [
  "Psicologia Clínica",
  "Neuropsicologia",
  "Psicologia Hospitalar",
  "Psicologia Escolar",
  "Avaliação Psicológica",
  "Psicologia do Esporte",
  "Psicologia em Saúde",
  "Psicologia do Trânsito",
];

const approaches = [
  "TCC - Terapia Cognitivo-Comportamental",
  "Psicanálise",
  "Gestalt-Terapia",
  "Análise do Comportamento",
  "Psicologia Analítica (Junguiana)",
  "EMDR",
  "Logoterapia",
  "Terapia Comportamental Dialética (DBT)",
];

const areasDeApoio = [
  "Depressão",
  "Ansiedade",
  "Estresse",
  "Autoestima",
  "Relacionamentos",
  "Conflitos Familiares",
  "Estresse no Trabalho",
  "Trauma",
];

const SpecialtiesSection = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Cada pessoa é única. Cada terapia também.
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Conheça as diferentes especialidades, abordagens e áreas de apoio e explore quais podem fazer sentido para o seu momento.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Especialidades */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <h3 className="font-bold text-foreground mb-4">Especialidades</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Áreas reconhecidas pelo CFP para atuação de psicólogos.
            </p>
            <ul className="space-y-2">
              {specialties.map((item) => (
                <li key={item}>
                  <Link
                    to={`/psicoterapeutas?especialidade=${encodeURIComponent(item)}`}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              to="/psicoterapeutas"
              className="inline-flex items-center gap-1 text-sm text-primary font-medium mt-4 hover:underline"
            >
              Ver todas <ChevronRight size={14} />
            </Link>
          </div>

          {/* Áreas de Apoio */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <h3 className="font-bold text-foreground mb-4">Áreas de Apoio</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Áreas em que profissionais podem oferecer apoio emocional.
            </p>
            <ul className="space-y-2">
              {areasDeApoio.map((item) => (
                <li key={item}>
                  <Link
                    to={`/psicoterapeutas?area=${encodeURIComponent(item.toLowerCase())}`}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              to="/psicoterapeutas"
              className="inline-flex items-center gap-1 text-sm text-primary font-medium mt-4 hover:underline"
            >
              Ver todas <ChevronRight size={14} />
            </Link>
          </div>

          {/* Abordagens */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <h3 className="font-bold text-foreground mb-4">Abordagens</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Linhas teóricas utilizadas em psicoterapia.
            </p>
            <ul className="space-y-2">
              {approaches.map((item) => (
                <li key={item}>
                  <Link
                    to={`/psicoterapeutas?abordagem=${encodeURIComponent(item)}`}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              to="/psicoterapeutas"
              className="inline-flex items-center gap-1 text-sm text-primary font-medium mt-4 hover:underline"
            >
              Ver todas <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SpecialtiesSection;
