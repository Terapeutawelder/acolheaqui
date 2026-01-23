import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
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
  Users,
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
  ShieldCheck,
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
  totalAppointments: number;
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
      <div className="group relative bg-white rounded-2xl border border-primary/30 overflow-hidden transition-all duration-300 hover:border-primary hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5">
        {/* Gradient Accent Top */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Verified Badge - Top Corner */}
        {professional.is_verified && (
          <div className="absolute top-4 right-4 z-10">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 bg-primary/10 border border-primary/30 rounded-full px-2.5 py-1 shadow-sm">
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
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden ring-2 ring-primary/30 group-hover:ring-primary/50 transition-all duration-500 shadow-md group-hover:shadow-lg">
                {professional.avatar_url ? (
                  <img 
                    src={professional.avatar_url} 
                    alt={professional.full_name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                    <User size={36} className="text-primary/60" />
                  </div>
                )}
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              
              {/* Online indicator */}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary border-2 border-white rounded-full flex items-center justify-center shadow-sm">
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
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="font-medium">Registro:</span> <span className="font-mono">{professional.crp}</span>
                </p>
              )}

              {/* Stats Badges - Rating & Appointments */}
              <div className="flex items-center gap-4 mt-3">
                {/* Rating Badge */}
                <div className="flex items-center gap-1.5">
                  <Star size={16} className="text-amber-400 fill-amber-400" />
                  <span className="text-sm font-bold text-foreground">
                    {professional.averageRating > 0 ? professional.averageRating.toFixed(0) : '–'}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ({professional.totalReviews} {professional.totalReviews === 1 ? 'comentário' : 'comentários'})
                  </span>
                </div>

                {/* Appointments Badge */}
                <div className="flex items-center gap-1.5">
                  <Users size={16} className="text-muted-foreground" />
                  <span className="text-sm font-bold text-foreground">
                    {professional.totalAppointments}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    atendimentos
                  </span>
                </div>
              </div>
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
            <div className="flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
              <Video size={12} />
              <span>Atende Online</span>
            </div>
            {professional.phone && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                <Phone size={12} />
                <span>{formatWhatsappNumber(professional.phone)}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-5 pt-5 border-t border-border group-hover:border-primary/30 transition-colors duration-500">
            <Link 
              to={landingPageUrl}
              className="flex-1"
              onClick={(e) => e.stopPropagation()}
            >
              <Button 
                size="sm" 
                variant="outline"
                className="w-full h-10 gap-2 rounded-xl font-medium border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
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
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [minRating, setMinRating] = useState("all");
  const [sortBy, setSortBy] = useState("rating-desc");

  // Mock professionals for visual demonstration
  const mockProfessionals: Professional[] = [
    {
      id: "mock-1",
      full_name: "Maria Silva",
      gender: "female",
      specialty: "Psicóloga Clínica",
      crp: "CRP 06/12345",
      avatar_url: "",
      bio: "Especialista em terapia cognitivo-comportamental com 10 anos de experiência.",
      phone: "11999990001",
      averageRating: 4.9,
      totalReviews: 47,
      totalAppointments: 312,
      is_verified: true,
      user_slug: null,
    },
    {
      id: "mock-2",
      full_name: "Carlos Oliveira",
      gender: "male",
      specialty: "Psicoterapeuta de Casal",
      crp: "CRP 05/54321",
      avatar_url: "",
      bio: "Psicólogo especializado em terapia de casal e família. Abordagem sistêmica.",
      phone: "21999990002",
      averageRating: 4.8,
      totalReviews: 38,
      totalAppointments: 245,
      is_verified: true,
      user_slug: null,
    },
    {
      id: "mock-3",
      full_name: "Ana Beatriz Costa",
      gender: "female",
      specialty: "Psicóloga Infantil",
      crp: "CRP 06/98765",
      avatar_url: "",
      bio: "Especialista em desenvolvimento infantil e ludoterapia.",
      phone: "11999990003",
      averageRating: 5.0,
      totalReviews: 52,
      totalAppointments: 380,
      is_verified: true,
      user_slug: null,
    },
    {
      id: "mock-4",
      full_name: "Roberto Santos",
      gender: "male",
      specialty: "Neuropsicólogo",
      crp: "CRP 04/11111",
      avatar_url: "",
      bio: "Avaliação e reabilitação neuropsicológica. Especialista em TDAH.",
      phone: "31999990004",
      averageRating: 4.7,
      totalReviews: 29,
      totalAppointments: 156,
      is_verified: true,
      user_slug: null,
    },
    {
      id: "mock-5",
      full_name: "Juliana Ferreira",
      gender: "female",
      specialty: "Psicóloga Organizacional",
      crp: "CRP 06/22222",
      avatar_url: "",
      bio: "Coaching de carreira e desenvolvimento pessoal. Especialista em burnout.",
      phone: "11999990005",
      averageRating: 4.6,
      totalReviews: 21,
      totalAppointments: 89,
      is_verified: false,
      user_slug: null,
    },
    {
      id: "mock-6",
      full_name: "Pedro Almeida",
      gender: "male",
      specialty: "Psicanalista",
      crp: "CRP 05/33333",
      avatar_url: "",
      bio: "Psicanálise lacaniana. 15 anos de experiência clínica.",
      phone: "21999990006",
      averageRating: 4.9,
      totalReviews: 63,
      totalAppointments: 420,
      is_verified: true,
      user_slug: null,
    },
    {
      id: "mock-7",
      full_name: "Fernanda Lima",
      gender: "female",
      specialty: "Especialista em Traumas",
      crp: "CRP 08/44444",
      avatar_url: "",
      bio: "Especialista em traumas e TEPT. Abordagem EMDR e terapia focada em compaixão.",
      phone: "41999990007",
      averageRating: 4.8,
      totalReviews: 34,
      totalAppointments: 198,
      is_verified: true,
      user_slug: null,
    },
    {
      id: "mock-8",
      full_name: "Lucas Mendes",
      gender: "male",
      specialty: "Gestalt-terapeuta",
      crp: "CRP 06/55555",
      avatar_url: "",
      bio: "Gestalt-terapia e mindfulness. Atendimento para ansiedade e autoconhecimento.",
      phone: "11999990008",
      averageRating: 4.5,
      totalReviews: 18,
      totalAppointments: 72,
      is_verified: false,
      user_slug: null,
    },
  ];

  // Fetch professionals with React Query for caching
  const { data: dbProfessionals = [], isLoading, error, refetch } = useQuery({
    queryKey: ["professionals-directory-v4"],
    queryFn: async () => {
      // Fetch all data in parallel
      const [profilesResult, testimonialsResult, appointmentsResult] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, full_name, specialty, crp, avatar_url, bio, phone, is_verified, user_slug, gender")
          .eq("is_professional", true),
        supabase
          .from("testimonials")
          .select("professional_id, rating")
          .eq("is_approved", true),
        supabase
          .from("appointments")
          .select("professional_id")
          .eq("status", "completed"),
      ]);

      if (profilesResult.error) {
        console.error("Erro ao buscar profiles:", profilesResult.error);
        throw profilesResult.error;
      }

      // Calculate average ratings for each professional
      const ratingsMap: Record<string, { sum: number; count: number }> = {};
      (testimonialsResult.data || []).forEach((t) => {
        if (!ratingsMap[t.professional_id]) {
          ratingsMap[t.professional_id] = { sum: 0, count: 0 };
        }
        ratingsMap[t.professional_id].sum += t.rating;
        ratingsMap[t.professional_id].count += 1;
      });

      // Count appointments per professional
      const appointmentsMap: Record<string, number> = {};
      (appointmentsResult.data || []).forEach((a) => {
        appointmentsMap[a.professional_id] = (appointmentsMap[a.professional_id] || 0) + 1;
      });

      // Filter out profiles with missing essential data (name, specialty, or CRP)
      const validProfiles = (profilesResult.data || []).filter((p) => 
        p.full_name && 
        p.full_name.trim() !== '' && 
        p.specialty && 
        p.specialty.trim() !== '' &&
        p.crp &&
        p.crp.trim() !== ''
      );

      const professionalsWithRatings: Professional[] = validProfiles.map((p) => {
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
          totalAppointments: appointmentsMap[p.id] || 0,
          is_verified: p.is_verified || false,
          user_slug: p.user_slug || null,
        };
      });

      return professionalsWithRatings;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes cache
    gcTime: 10 * 60 * 1000,
    refetchOnMount: true,
  });

  // Combine real professionals with mock data for visual demonstration
  const professionals = useMemo(() => {
    return [...dbProfessionals, ...mockProfessionals];
  }, [dbProfessionals]);

  const filteredAndSortedProfessionals = useMemo(() => {
    return professionals
      .filter((prof) => {
        const matchesSearch =
          prof.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          prof.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
          prof.specialty.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesRating = minRating === "all" || prof.averageRating >= parseFloat(minRating);
        const matchesVerified = !showVerifiedOnly || prof.is_verified;
        
        return matchesSearch && matchesRating && matchesVerified;
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
  }, [professionals, searchTerm, minRating, showVerifiedOnly, sortBy]);

  return (
    <main className="min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <section className="pt-24 pb-8 md:pt-28 bg-gradient-to-b from-primary/5 to-white">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold text-primary text-center mb-3">
            Encontre psicoterapeutas online
          </h1>
          <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
            Psicólogos, psicanalistas e terapeutas verificados e prontos para te acolher.
          </p>

          {/* Search & Filters */}
          <div className="max-w-5xl mx-auto bg-white rounded-2xl border border-gray-200 p-4 shadow-lg">
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

            <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-border">
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
              <button
                onClick={() => setShowVerifiedOnly(!showVerifiedOnly)}
                className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-full border transition-colors ${
                  showVerifiedOnly
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "border-border text-muted-foreground hover:border-emerald-500/50"
                }`}
              >
                <ShieldCheck size={14} />
                Apenas verificados
              </button>
              <span className="text-sm text-muted-foreground ml-auto">
                {filteredAndSortedProfessionals.length} profissionais encontrados
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-8 bg-gray-50">
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
