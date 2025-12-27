import { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Search,
  MapPin,
  MessageCircle,
  Star,
  Filter,
  ChevronRight,
  Video,
  Building,
  ArrowLeft,
} from "lucide-react";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/">
          <Logo size="sm" />
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Início
          </Link>
          <Link to="/psicoterapeutas" className="text-sm font-medium text-primary transition-colors">
            Encontrar profissionais
          </Link>
          <Link to="/profissionais" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Sou profissional
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            <ArrowLeft size={16} />
            Voltar
          </button>
          <Link to="/profissionais">
            <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-2">
              <User size={16} />
              Acesso profissional
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

// Mock data for professionals
const mockProfessionals = [
  {
    id: 1,
    name: "Dra. Maria Silva",
    title: "Psicóloga Clínica",
    crp: "CRP 06/123456",
    photo: null,
    rating: 4.9,
    reviews: 127,
    approach: "TCC - Terapia Cognitivo-Comportamental",
    areas: ["Ansiedade", "Depressão", "Estresse"],
    online: true,
    presencial: true,
    location: "São Paulo, SP",
    price: "R$ 150",
    description: "Psicóloga especializada em ansiedade e transtornos de humor. Atendimento acolhedor e humanizado.",
  },
  {
    id: 2,
    name: "Dr. Carlos Santos",
    title: "Psicanalista",
    crp: "CRP 05/654321",
    photo: null,
    rating: 4.8,
    reviews: 89,
    approach: "Psicanálise",
    areas: ["Autoestima", "Relacionamentos", "Trauma"],
    online: true,
    presencial: false,
    location: "Rio de Janeiro, RJ",
    price: "R$ 180",
    description: "Psicanalista com 10 anos de experiência. Especializado em questões de autoconhecimento e relações interpessoais.",
  },
  {
    id: 3,
    name: "Dra. Ana Oliveira",
    title: "Terapeuta Gestalt",
    crp: "CRP 04/789012",
    photo: null,
    rating: 5.0,
    reviews: 56,
    approach: "Gestalt-Terapia",
    areas: ["Conflitos Familiares", "Luto", "Autoestima"],
    online: true,
    presencial: true,
    location: "Belo Horizonte, MG",
    price: "R$ 140",
    description: "Especialista em Gestalt-terapia com foco em autoconhecimento e desenvolvimento pessoal.",
  },
  {
    id: 4,
    name: "Dr. Pedro Costa",
    title: "Psicólogo Comportamental",
    crp: "CRP 08/345678",
    photo: null,
    rating: 4.7,
    reviews: 103,
    approach: "Análise do Comportamento",
    areas: ["Fobias", "TOC", "Ansiedade"],
    online: true,
    presencial: true,
    location: "Curitiba, PR",
    price: "R$ 160",
    description: "Especializado em transtornos de ansiedade e comportamentos compulsivos. Abordagem baseada em evidências.",
  },
  {
    id: 5,
    name: "Dra. Juliana Lima",
    title: "Psicóloga Junguiana",
    crp: "CRP 06/901234",
    photo: null,
    rating: 4.9,
    reviews: 78,
    approach: "Psicologia Analítica (Junguiana)",
    areas: ["Autoconhecimento", "Sonhos", "Criatividade"],
    online: true,
    presencial: false,
    location: "São Paulo, SP",
    price: "R$ 170",
    description: "Psicóloga analítica focada em processos de individuação e desenvolvimento pessoal através da análise de sonhos.",
  },
  {
    id: 6,
    name: "Dr. Roberto Mendes",
    title: "Psicoterapeuta EMDR",
    crp: "CRP 03/567890",
    photo: null,
    rating: 4.8,
    reviews: 64,
    approach: "EMDR",
    areas: ["Trauma", "TEPT", "Ansiedade"],
    online: true,
    presencial: true,
    location: "Salvador, BA",
    price: "R$ 200",
    description: "Especialista em EMDR para tratamento de traumas e transtorno de estresse pós-traumático.",
  },
];

const areasOptions = [
  "Todas as áreas",
  "Ansiedade",
  "Depressão",
  "Estresse",
  "Autoestima",
  "Relacionamentos",
  "Conflitos Familiares",
  "Trauma",
  "Luto",
  "Fobias",
];

const approachOptions = [
  "Todas as abordagens",
  "TCC - Terapia Cognitivo-Comportamental",
  "Psicanálise",
  "Gestalt-Terapia",
  "Análise do Comportamento",
  "Psicologia Analítica (Junguiana)",
  "EMDR",
  "DBT",
];

const ProfessionalCard = ({ professional }: { professional: typeof mockProfessionals[0] }) => {
  return (
    <div className="bg-card rounded-2xl border border-border p-5 hover:border-primary/30 hover:shadow-lg transition-all">
      <div className="flex gap-4">
        {/* Photo */}
        <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
          <User size={32} className="text-primary" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-foreground">{professional.name}</h3>
              <p className="text-sm text-muted-foreground">{professional.title}</p>
              <p className="text-xs text-muted-foreground">{professional.crp}</p>
            </div>
            <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-lg">
              <Star size={14} className="text-primary fill-primary" />
              <span className="text-sm font-medium text-primary">{professional.rating}</span>
              <span className="text-xs text-muted-foreground">({professional.reviews})</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {professional.description}
          </p>

          <div className="flex flex-wrap gap-1.5 mt-3">
            {professional.areas.slice(0, 3).map((area) => (
              <Badge key={area} variant="secondary" className="text-xs">
                {area}
              </Badge>
            ))}
          </div>

          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin size={14} />
              <span>{professional.location}</span>
            </div>
            {professional.online && (
              <div className="flex items-center gap-1 text-green-600">
                <Video size={14} />
                <span>Online</span>
              </div>
            )}
            {professional.presencial && (
              <div className="flex items-center gap-1">
                <Building size={14} />
                <span>Presencial</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <div>
              <span className="text-xs text-muted-foreground">A partir de</span>
              <p className="font-semibold text-foreground">{professional.price}</p>
            </div>
            <Button size="sm" className="gap-2">
              <MessageCircle size={16} />
              Conversar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Psicoterapeutas = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArea, setSelectedArea] = useState("Todas as áreas");
  const [selectedApproach, setSelectedApproach] = useState("Todas as abordagens");
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  const filteredProfessionals = mockProfessionals.filter((prof) => {
    const matchesSearch =
      prof.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prof.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesArea =
      selectedArea === "Todas as áreas" || prof.areas.includes(selectedArea);
    const matchesApproach =
      selectedApproach === "Todas as abordagens" || prof.approach === selectedApproach;
    const matchesOnline = !showOnlineOnly || prof.online;
    return matchesSearch && matchesArea && matchesApproach && matchesOnline;
  });

  return (
    <main className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="pt-24 pb-8 md:pt-28">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-2">
            Encontre psicoterapeutas online
          </h1>
          <p className="text-center text-muted-foreground mb-8">
            Psicólogos, psicanalistas e terapeutas verificados e prontos para te acolher.
          </p>

          {/* Search & Filters */}
          <div className="max-w-4xl mx-auto bg-card rounded-2xl border border-border p-4 shadow-sm">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou especialidade..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedArea} onValueChange={setSelectedArea}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Área de apoio" />
                </SelectTrigger>
                <SelectContent>
                  {areasOptions.map((area) => (
                    <SelectItem key={area} value={area}>
                      {area}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedApproach} onValueChange={setSelectedApproach}>
                <SelectTrigger className="w-full md:w-56">
                  <SelectValue placeholder="Abordagem" />
                </SelectTrigger>
                <SelectContent>
                  {approachOptions.map((approach) => (
                    <SelectItem key={approach} value={approach}>
                      {approach}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
              <button
                onClick={() => setShowOnlineOnly(!showOnlineOnly)}
                className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-full border transition-colors ${
                  showOnlineOnly
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:border-primary/50"
                }`}
              >
                <Video size={14} />
                Atendimento online
              </button>
              <span className="text-sm text-muted-foreground">
                {filteredProfessionals.length} profissionais encontrados
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {filteredProfessionals.map((professional) => (
              <ProfessionalCard key={professional.id} professional={professional} />
            ))}
          </div>

          {filteredProfessionals.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                Nenhum profissional encontrado com os filtros selecionados.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedArea("Todas as áreas");
                  setSelectedApproach("Todas as abordagens");
                  setShowOnlineOnly(false);
                }}
              >
                Limpar filtros
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3">
            É profissional de saúde mental?
          </h2>
          <p className="text-muted-foreground mb-6">
            Faça parte da nossa plataforma e conecte-se com novos pacientes.
          </p>
          <Link to="/profissionais">
            <Button className="gap-2">
              Cadastre-se como profissional
              <ChevronRight size={16} />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-card border-t border-border">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo size="sm" />
          <nav className="flex items-center gap-6">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Início
            </Link>
            <Link to="/psicoterapeutas" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Encontrar profissionais
            </Link>
            <Link to="/profissionais" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Para profissionais
            </Link>
          </nav>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Mindset. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </main>
  );
};

export default Psicoterapeutas;
