import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
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
  Video,
  Building,
  ArrowLeft,
  Phone,
  ChevronRight,
  ArrowUpDown,
  Loader2,
  BadgeCheck,
  Calendar,
  ExternalLink,
  Globe,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatProfessionalName } from "@/lib/formatProfessionalName";

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

interface Professional {
  id: string;
  full_name: string;
  gender?: 'male' | 'female' | 'other';
  specialty: string;
  crp: string;
  avatar_url: string;
  bio: string;
  phone: string;
  averageRating: number;
  totalReviews: number;
  is_verified: boolean;
  user_slug: string | null;
}

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

const ratingFilterOptions = [
  { value: "all", label: "Todas as avaliações" },
  { value: "4", label: "4+ estrelas" },
  { value: "4.5", label: "4.5+ estrelas" },
  { value: "5", label: "5 estrelas" },
];

const sortOptions = [
  { value: "rating-desc", label: "Maior avaliação" },
  { value: "rating-asc", label: "Menor avaliação" },
  { value: "reviews-desc", label: "Mais avaliados" },
  { value: "name-asc", label: "Nome (A-Z)" },
];

interface ProfessionalCardProps {
  professional: Professional;
}

const ProfessionalCard = ({ professional }: ProfessionalCardProps) => {
  const whatsappMessage = `Olá! Gostaria de agendar uma sessão.`;
  const cleanPhone = professional.phone?.replace(/\D/g, "") || "";
  const whatsappUrl = cleanPhone ? `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(whatsappMessage)}` : null;
  
  const formatWhatsappNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= Math.floor(rating);
          const partial = star === Math.ceil(rating) && rating % 1 !== 0;
          const fillPercentage = partial ? (rating % 1) * 100 : 0;
          
          return (
            <div key={star} className="relative">
              <Star className="w-3.5 h-3.5 text-muted/30" />
              {filled && (
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 absolute inset-0" />
              )}
              {partial && (
                <div 
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${fillPercentage}%` }}
                >
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const landingPageUrl = professional.user_slug ? `/profissional/${professional.user_slug}` : `/profissional/${professional.id}`;

  return (
    <TooltipProvider>
      <div className="group relative bg-card rounded-3xl border border-border/50 overflow-hidden transition-all duration-500 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1">
        {/* Gradient Accent Top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Verified Badge - Top Corner */}
        {professional.is_verified && (
          <div className="absolute top-4 right-4 z-10">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-full px-2.5 py-1 shadow-sm">
                  <BadgeCheck size={14} className="text-primary" />
                  <span className="text-xs font-medium text-primary">Verificado</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Profissional com cadastro verificado</p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}

        <div className="p-6">
          {/* Header with Avatar and Info */}
          <div className="flex gap-5">
            {/* Avatar */}
            <Link 
              to={landingPageUrl} 
              className="relative flex-shrink-0"
            >
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden ring-2 ring-border/50 group-hover:ring-primary/50 transition-all duration-500 shadow-lg group-hover:shadow-xl">
                {professional.avatar_url ? (
                  <img 
                    src={professional.avatar_url} 
                    alt={professional.full_name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5 flex items-center justify-center">
                    <User size={36} className="text-primary/60" />
                  </div>
                )}
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              
              {/* Online indicator */}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-card rounded-full flex items-center justify-center shadow-sm">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              </div>
            </Link>

            {/* Info */}
            <div className="flex-1 min-w-0 pt-1">
              <Link to={landingPageUrl} className="block group/name">
                <h3 className="font-bold text-lg text-foreground group-hover/name:text-primary transition-colors duration-300 truncate">
                  {formatProfessionalName(professional.full_name, professional.gender)}
                </h3>
              </Link>
              
              {professional.specialty && (
                <p className="text-sm font-medium text-muted-foreground mt-0.5">
                  {professional.specialty}
                </p>
              )}
              
              {professional.crp && (
                <p className="text-xs text-muted-foreground/70 mt-1 font-mono">
                  {professional.crp}
                </p>
              )}

              {/* Rating */}
              {professional.totalReviews > 0 && (
                <div className="flex items-center gap-2 mt-3">
                  {renderStars(professional.averageRating)}
                  <span className="text-sm font-semibold text-foreground">
                    {professional.averageRating.toFixed(1)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({professional.totalReviews} {professional.totalReviews === 1 ? 'avaliação' : 'avaliações'})
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Bio */}
          {professional.bio && (
            <p className="text-sm text-muted-foreground mt-4 line-clamp-2 leading-relaxed">
              {professional.bio}
            </p>
          )}

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full">
              <Video size={12} />
              <span>Atende Online</span>
            </div>
            {professional.phone && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-full">
                <Phone size={12} />
                <span>{formatWhatsappNumber(professional.phone)}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-5 pt-5 border-t border-border/50 group-hover:border-primary/20 transition-colors duration-500">
            <Link 
              to={landingPageUrl}
              className="flex-1"
              onClick={(e) => e.stopPropagation()}
            >
              <Button 
                size="sm" 
                variant="outline"
                className="w-full h-10 gap-2 rounded-xl font-medium border-border/80 hover:border-primary hover:bg-primary/5 hover:text-primary transition-all duration-300"
              >
                <Globe size={16} />
                <span className="truncate">Ver Site {formatProfessionalName(professional.full_name, professional.gender).split(' ').slice(0, 2).join(' ')}</span>
              </Button>
            </Link>
            
            {whatsappUrl && (
              <Button 
                size="sm" 
                className="flex-1 h-10 gap-2 rounded-xl font-medium bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 shadow-md hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.open(whatsappUrl, "_blank");
                }}
              >
                <MessageCircle size={16} />
                <span className="hidden sm:inline">Conversar no WhatsApp</span>
                <span className="sm:hidden">WhatsApp</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

// Component for the therapists page
const Psicoterapeutas = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArea, setSelectedArea] = useState("Todas as áreas");
  const [selectedApproach, setSelectedApproach] = useState("Todas as abordagens");
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [minRating, setMinRating] = useState("all");
  const [sortBy, setSortBy] = useState("rating-desc");
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProfessionals();
  }, []);

  const fetchProfessionals = async () => {
    try {
      setIsLoading(true);

      // Fetch all professionals
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, specialty, crp, avatar_url, bio, phone, is_verified, user_slug, gender")
        .eq("is_professional", true);

      if (profilesError) throw profilesError;

      // Fetch all testimonials to calculate ratings
      const { data: testimonialsData, error: testimonialsError } = await supabase
        .from("testimonials")
        .select("professional_id, rating")
        .eq("is_approved", true);

      if (testimonialsError) throw testimonialsError;

      // Calculate average ratings for each professional
      const ratingsMap: Record<string, { sum: number; count: number }> = {};
      (testimonialsData || []).forEach((t) => {
        if (!ratingsMap[t.professional_id]) {
          ratingsMap[t.professional_id] = { sum: 0, count: 0 };
        }
        ratingsMap[t.professional_id].sum += t.rating;
        ratingsMap[t.professional_id].count += 1;
      });

      const professionalsWithRatings: Professional[] = (profilesData || []).map((p) => {
        const ratingData = ratingsMap[p.id];
        return {
          id: p.id,
          full_name: p.full_name || "Profissional",
          gender: (p.gender as 'male' | 'female' | 'other') || 'female',
          specialty: p.specialty || "",
          crp: p.crp || "",
          avatar_url: p.avatar_url || "",
          bio: p.bio || "",
          phone: p.phone || "",
          averageRating: ratingData ? ratingData.sum / ratingData.count : 0,
          totalReviews: ratingData ? ratingData.count : 0,
          is_verified: p.is_verified || false,
          user_slug: p.user_slug || null,
        };
      });

      setProfessionals(professionalsWithRatings);
    } catch (error) {
      console.error("Error fetching professionals:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAndSortedProfessionals = professionals
    .filter((prof) => {
      const matchesSearch =
        prof.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prof.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prof.specialty.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRating = minRating === "all" || prof.averageRating >= parseFloat(minRating);
      
      return matchesSearch && matchesRating;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "rating-desc":
          return b.averageRating - a.averageRating;
        case "rating-asc":
          return a.averageRating - b.averageRating;
        case "reviews-desc":
          return b.totalReviews - a.totalReviews;
        case "name-asc":
          return a.full_name.localeCompare(b.full_name);
        default:
          return b.averageRating - a.averageRating;
      }
    });

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50/50 dark:from-background dark:via-background dark:to-background">
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
          <div className="max-w-5xl mx-auto bg-card rounded-2xl border border-border p-4 shadow-sm">
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
              <Select value={minRating} onValueChange={setMinRating}>
                <SelectTrigger className="w-full md:w-48">
                  <Star className="w-4 h-4 mr-2 text-yellow-400 fill-yellow-400" />
                  <SelectValue placeholder="Avaliação" />
                </SelectTrigger>
                <SelectContent>
                  {ratingFilterOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-48">
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Ordenar" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
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
                {filteredAndSortedProfessionals.length} profissionais encontrados
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {filteredAndSortedProfessionals.map((professional) => (
                <ProfessionalCard
                  key={professional.id}
                  professional={professional}
                />
              ))}
            </div>
          )}

          {!isLoading && filteredAndSortedProfessionals.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                Nenhum profissional encontrado com os filtros selecionados.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setMinRating("all");
                  setSortBy("rating-desc");
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
            © {new Date().getFullYear()} AcolheAqui. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </main>
  );
};

export default Psicoterapeutas;
