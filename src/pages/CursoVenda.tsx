import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  Play, 
  BookOpen, 
  Clock, 
  Users, 
  Award, 
  Check, 
  Star,
  Lock,
  ChevronDown,
  ChevronUp,
  Shield,
  Sparkles,
  ArrowRight,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Service {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  product_config?: Record<string, unknown>;
  member_access_config?: {
    access_type: "lifetime" | "period" | "subscription";
    duration_months?: number;
  };
}

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  specialty: string | null;
  crp: string | null;
}

interface Module {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  lessons_count: number;
  is_published: boolean;
}

interface Lesson {
  id: string;
  title: string;
  duration_seconds: number;
  is_free: boolean;
}

const CursoVenda = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessonsMap, setLessonsMap] = useState<Record<string, Lesson[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (serviceId) {
      fetchData();
    }
  }, [serviceId]);

  const fetchData = async () => {
    try {
      // Fetch service
      const { data: serviceData, error: serviceError } = await supabase
        .from("public_services")
        .select("*")
        .eq("id", serviceId)
        .eq("is_active", true)
        .maybeSingle();

      if (serviceError) throw serviceError;
      if (!serviceData) {
        toast.error("Serviço não encontrado");
        navigate("/");
        return;
      }

      setService({
        id: serviceData.id,
        name: serviceData.name || "",
        description: serviceData.description,
        price_cents: serviceData.price_cents || 0,
        product_config: serviceData.product_config as Record<string, unknown> | undefined,
        member_access_config: undefined, // Not exposed in public view
      });

      // Fetch professional profile
      if (serviceData.professional_id) {
        const { data: profileData } = await supabase
          .from("public_professional_profiles")
          .select("*")
          .eq("id", serviceData.professional_id)
          .maybeSingle();

        if (profileData) {
          setProfile({
            id: profileData.id || "",
            full_name: profileData.full_name,
            avatar_url: profileData.avatar_url,
            bio: profileData.bio,
            specialty: profileData.specialty,
            crp: profileData.crp,
          });
        }

        // Fetch modules (only published ones)
        const { data: modulesData } = await supabase
          .from("member_modules")
          .select("id, title, description, thumbnail_url, is_published, order_index")
          .eq("professional_id", serviceData.professional_id)
          .eq("is_published", true)
          .order("order_index");

        if (modulesData) {
          // Fetch lessons for each module
          const { data: lessonsData } = await supabase
            .from("member_lessons")
            .select("id, module_id, title, duration_seconds, is_free, order_index")
            .eq("professional_id", serviceData.professional_id)
            .order("order_index");

          const lessonsGrouped: Record<string, Lesson[]> = {};
          (lessonsData || []).forEach((lesson: any) => {
            if (!lessonsGrouped[lesson.module_id]) {
              lessonsGrouped[lesson.module_id] = [];
            }
            lessonsGrouped[lesson.module_id].push({
              id: lesson.id,
              title: lesson.title,
              duration_seconds: lesson.duration_seconds || 0,
              is_free: lesson.is_free || false,
            });
          });

          setLessonsMap(lessonsGrouped);

          const modulesWithCount = modulesData.map((mod: any) => ({
            id: mod.id,
            title: mod.title,
            description: mod.description,
            thumbnail_url: mod.thumbnail_url,
            lessons_count: lessonsGrouped[mod.id]?.length || 0,
            is_published: mod.is_published,
          }));

          setModules(modulesWithCount);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes}min`;
  };

  const getTotalDuration = () => {
    let total = 0;
    Object.values(lessonsMap).forEach(lessons => {
      lessons.forEach(lesson => {
        total += lesson.duration_seconds;
      });
    });
    return total;
  };

  const getTotalLessons = () => {
    let total = 0;
    Object.values(lessonsMap).forEach(lessons => {
      total += lessons.length;
    });
    return total;
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  const handleBuyNow = () => {
    if (!serviceId) return;
    setIsProcessing(true);
    // Redirect to checkout page
    navigate(`/checkout/${serviceId}`);
  };

  const getInitials = (name: string | null) => {
    if (!name) return "P";
    return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Curso não encontrado</h1>
          <p className="text-gray-400 mb-4">O curso que você está procurando não existe ou foi removido.</p>
          <Button onClick={() => navigate("/")}>Voltar ao início</Button>
        </div>
      </div>
    );
  }

  const totalLessons = getTotalLessons();
  const totalDuration = getTotalDuration();
  const imageUrl = (service.product_config?.image_url as string) || null;

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero Section */}
      <section className="relative py-12 md:py-20 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-gray-950 to-gray-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(124,58,237,0.15),transparent_50%)]" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              {/* Badge */}
              <Badge className="bg-primary/20 text-primary border-primary/30 px-4 py-1.5">
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                Área de Membros Exclusiva
              </Badge>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                {service.name}
              </h1>

              {/* Description */}
              {service.description && (
                <p className="text-lg text-gray-300 leading-relaxed">
                  {service.description}
                </p>
              )}

              {/* Stats */}
              <div className="flex flex-wrap gap-6 py-4">
                <div className="flex items-center gap-2 text-gray-300">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <span className="font-medium">{totalLessons} aulas</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Clock className="w-5 h-5 text-primary" />
                  <span className="font-medium">{formatDuration(totalDuration)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Award className="w-5 h-5 text-primary" />
                  <span className="font-medium">Certificado incluso</span>
                </div>
              </div>

              {/* Instructor */}
              {profile && (
                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                  <Avatar className="w-14 h-14 border-2 border-primary">
                    <AvatarImage src={profile.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/20 text-primary text-lg">
                      {getInitials(profile.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-white font-semibold">{profile.full_name}</p>
                    <p className="text-sm text-gray-400">{profile.specialty}</p>
                    {profile.crp && (
                      <p className="text-xs text-gray-500 mt-0.5">CRP: {profile.crp}</p>
                    )}
                  </div>
                </div>
              )}

              {/* CTA Desktop */}
              <div className="hidden lg:flex items-center gap-4 pt-4">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-white font-bold text-lg px-8 py-6 shadow-lg shadow-primary/25"
                  onClick={handleBuyNow}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : null}
                  Comprar Agora por {formatPrice(service.price_cents)}
                </Button>
                <div className="flex items-center gap-2 text-gray-400">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm">Pagamento seguro</span>
                </div>
              </div>
            </div>

            {/* Right - Course Preview */}
            <div className="relative">
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-900 border border-white/10 shadow-2xl">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={service.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/30 via-purple-600/20 to-pink-600/20 flex items-center justify-center">
                    <Play className="w-20 h-20 text-white/50" />
                  </div>
                )}
                
                {/* Play overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 group cursor-pointer hover:bg-black/40 transition-colors">
                  <div className="w-20 h-20 rounded-full bg-white/95 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                    <Play className="w-8 h-8 text-gray-900 ml-1" fill="currentColor" />
                  </div>
                </div>
              </div>
              
              {/* Floating card */}
              <div className="absolute -bottom-6 -left-6 bg-gray-900 border border-white/10 rounded-xl p-4 shadow-xl hidden md:block">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Check className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{modules.length} Módulos</p>
                    <p className="text-sm text-gray-400">Conteúdo completo</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Content */}
      <section className="py-16 bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Modules List */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-2xl font-bold text-white mb-6">Conteúdo do Curso</h2>
              
              {modules.length === 0 ? (
                <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
                  <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Conteúdo em breve disponível</p>
                </div>
              ) : (
                modules.map((module, index) => (
                  <div
                    key={module.id}
                    className="bg-white/5 border border-white/10 rounded-xl overflow-hidden"
                  >
                    {/* Module Header */}
                    <button
                      onClick={() => toggleModule(module.id)}
                      className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                          <span className="text-primary font-bold">{index + 1}</span>
                        </div>
                        <div className="text-left">
                          <h3 className="text-white font-semibold">{module.title}</h3>
                          <p className="text-sm text-gray-400">
                            {lessonsMap[module.id]?.length || 0} aulas
                          </p>
                        </div>
                      </div>
                      {expandedModules.has(module.id) ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </button>

                    {/* Module Lessons */}
                    {expandedModules.has(module.id) && lessonsMap[module.id] && (
                      <div className="border-t border-white/10">
                        {lessonsMap[module.id].map((lesson, lessonIndex) => (
                          <div
                            key={lesson.id}
                            className="flex items-center justify-between px-5 py-3 border-b border-white/5 last:border-0 hover:bg-white/5"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
                                {lesson.is_free ? (
                                  <Play className="w-3.5 h-3.5 text-primary" />
                                ) : (
                                  <Lock className="w-3.5 h-3.5 text-gray-500" />
                                )}
                              </div>
                              <div>
                                <p className="text-gray-300 text-sm">{lesson.title}</p>
                                {lesson.is_free && (
                                  <Badge variant="outline" className="text-xs text-green-500 border-green-500/30 mt-1">
                                    Grátis
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <span className="text-xs text-gray-500">
                              {formatDuration(lesson.duration_seconds)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Sticky Purchase Card */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 bg-gray-900 border border-white/10 rounded-2xl p-6 space-y-6">
                {/* Price */}
                <div className="text-center pb-6 border-b border-white/10">
                  <p className="text-4xl font-bold text-white">{formatPrice(service.price_cents)}</p>
                  <p className="text-sm text-gray-400 mt-1">Pagamento único</p>
                </div>

                {/* What's included */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-white">O que está incluso:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-gray-300 text-sm">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>{totalLessons} aulas em vídeo</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-300 text-sm">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>{modules.length} módulos completos</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-300 text-sm">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>Certificado de conclusão</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-300 text-sm">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>Acesso à comunidade</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-300 text-sm">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>Materiais de apoio</span>
                    </li>
                  </ul>
                </div>

                {/* CTA */}
                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-6 text-lg"
                  onClick={handleBuyNow}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : null}
                  Comprar Agora
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>

                {/* Trust badges */}
                <div className="flex items-center justify-center gap-4 text-gray-500 text-xs">
                  <div className="flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Pagamento seguro</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Dados protegidos</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Instructor Section */}
      {profile && (
        <section className="py-16 bg-gray-900/50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl font-bold text-white mb-8">Sobre o Instrutor</h2>
              
              <Avatar className="w-24 h-24 mx-auto border-4 border-primary mb-6">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/20 text-primary text-2xl">
                  {getInitials(profile.full_name)}
                </AvatarFallback>
              </Avatar>

              <h3 className="text-xl font-semibold text-white mb-2">{profile.full_name}</h3>
              {profile.specialty && (
                <p className="text-primary mb-4">{profile.specialty}</p>
              )}
              {profile.bio && (
                <p className="text-gray-400 leading-relaxed">{profile.bio}</p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Mobile Fixed CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-950/95 backdrop-blur border-t border-white/10 lg:hidden z-50">
        <Button
          className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-5 text-lg"
          onClick={handleBuyNow}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
          ) : null}
          Comprar por {formatPrice(service.price_cents)}
        </Button>
      </div>
    </div>
  );
};

export default CursoVenda;
