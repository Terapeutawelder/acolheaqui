import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Clock, Package, Calendar, ChevronRight } from "lucide-react";

export interface SessionPackage {
  id: string;
  name: string;
  duration: number;
  sessions: number;
  price: number;
  type: "single" | "pack-2" | "pack-4";
}

export const sessionPackages: SessionPackage[] = [
  {
    id: "single-30",
    name: "Sessão de 30 minutos",
    duration: 30,
    sessions: 1,
    price: 37.90,
    type: "single",
  },
  {
    id: "pack-2-30",
    name: "Pacote de 2 sessões de 30 min",
    duration: 30,
    sessions: 2,
    price: 69.80,
    type: "pack-2",
  },
  {
    id: "pack-4-30",
    name: "Pacote mensal com 4 sessões de 30 min",
    duration: 30,
    sessions: 4,
    price: 129.80,
    type: "pack-4",
  },
  {
    id: "single-45",
    name: "Sessão de 45 minutos",
    duration: 45,
    sessions: 1,
    price: 57.90,
    type: "single",
  },
  {
    id: "pack-2-45",
    name: "Pacote de 2 sessões de 45 min",
    duration: 45,
    sessions: 2,
    price: 99.80,
    type: "pack-2",
  },
  {
    id: "pack-4-45",
    name: "Pacote mensal com 4 sessões de 45 min",
    duration: 45,
    sessions: 4,
    price: 189.80,
    type: "pack-4",
  },
];

const formatPrice = (price: number) => {
  return price.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

const getIcon = (type: SessionPackage["type"]) => {
  switch (type) {
    case "single":
      return Clock;
    case "pack-2":
      return Package;
    case "pack-4":
      return Calendar;
  }
};

const SessionPackagesSection = () => {
  const packages30 = sessionPackages.filter((p) => p.duration === 30);
  const packages45 = sessionPackages.filter((p) => p.duration === 45);

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-4">
          Escolha o plano ideal para você
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Sessões individuais ou pacotes com desconto. Escolha a opção que melhor se adapta à sua rotina.
        </p>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* 30 min packages */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock size={20} className="text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Sessões de 30 minutos</h3>
            </div>

            <div className="space-y-4">
              {packages30.map((pkg) => {
                const Icon = getIcon(pkg.type);
                return (
                  <Link
                    key={pkg.id}
                    to={`/psicoterapeutas?pacote=${pkg.id}`}
                    className="block"
                  >
                    <div className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all group">
                      <div className="flex items-center gap-3">
                        <Icon size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
                        <div>
                          <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                            {pkg.sessions === 1 ? "1 sessão" : `${pkg.sessions} sessões`}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {pkg.type === "pack-4" ? "Pacote mensal" : pkg.type === "pack-2" ? "Pacote duplo" : "Sessão única"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{formatPrice(pkg.price)}</span>
                        <ChevronRight size={18} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* 45 min packages */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                <Clock size={20} className="text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Sessões de 45 minutos</h3>
            </div>

            <div className="space-y-4">
              {packages45.map((pkg) => {
                const Icon = getIcon(pkg.type);
                return (
                  <Link
                    key={pkg.id}
                    to={`/psicoterapeutas?pacote=${pkg.id}`}
                    className="block"
                  >
                    <div className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-accent/50 hover:bg-accent/5 transition-all group">
                      <div className="flex items-center gap-3">
                        <Icon size={18} className="text-muted-foreground group-hover:text-accent transition-colors" />
                        <div>
                          <p className="font-medium text-foreground group-hover:text-accent transition-colors">
                            {pkg.sessions === 1 ? "1 sessão" : `${pkg.sessions} sessões`}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {pkg.type === "pack-4" ? "Pacote mensal" : pkg.type === "pack-2" ? "Pacote duplo" : "Sessão única"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{formatPrice(pkg.price)}</span>
                        <ChevronRight size={18} className="text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link to="/psicoterapeutas">
            <Button variant="outline" size="lg" className="gap-2">
              Ver todos os profissionais
              <ChevronRight size={18} />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default SessionPackagesSection;
