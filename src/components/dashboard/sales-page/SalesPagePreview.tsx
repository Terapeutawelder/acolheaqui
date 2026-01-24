import { 
  Play, 
  BookOpen, 
  Clock, 
  Award, 
  Check, 
  Shield,
  Sparkles,
  Star,
  Users,
  Lock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";

export interface SalesPageConfig {
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
    showVideo: boolean;
  };
  content: {
    sectionTitle: string;
    sectionSubtitle: string;
  };
  cta: {
    mainText: string;
    subText: string;
    buttonText: string;
    urgencyText: string;
  };
  benefits: {
    enabled: boolean;
    title: string;
    items: string[];
  };
  guarantee: {
    enabled: boolean;
    title: string;
    description: string;
    days: number;
  };
  instructor: {
    showSection: boolean;
    title: string;
  };
  images?: {
    heroImage: string;
    videoThumbnail: string;
  };
  template?: string;
}

export const defaultSalesPageConfig: SalesPageConfig = {
  colors: {
    primary: "262 83% 58%",
    secondary: "262 50% 95%",
    accent: "42 87% 55%",
    background: "220 20% 4%",
  },
  hero: {
    badge: "Área de Membros Exclusiva",
    title: "",
    subtitle: "",
    ctaText: "Comprar Agora",
    showVideo: true,
  },
  content: {
    sectionTitle: "Conteúdo do Curso",
    sectionSubtitle: "Veja tudo que você vai aprender",
  },
  cta: {
    mainText: "Garanta seu acesso agora",
    subText: "Acesso imediato após a confirmação do pagamento",
    buttonText: "Quero me Inscrever",
    urgencyText: "Vagas limitadas",
  },
  benefits: {
    enabled: true,
    title: "O que você vai receber",
    items: [
      "Acesso vitalício ao conteúdo",
      "Certificado de conclusão",
      "Suporte exclusivo",
      "Atualizações gratuitas",
    ],
  },
  guarantee: {
    enabled: true,
    title: "Garantia de 7 dias",
    description: "Se você não ficar satisfeito, devolvemos 100% do seu dinheiro.",
    days: 7,
  },
  instructor: {
    showSection: true,
    title: "Conheça seu instrutor",
  },
  images: {
    heroImage: "",
    videoThumbnail: "",
  },
  template: "modern",
};

interface SalesPagePreviewProps {
  service: {
    id: string;
    name: string;
    description: string | null;
    price_cents: number;
    product_config?: Record<string, unknown>;
  };
  profile: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    specialty: string | null;
    crp: string | null;
  } | null;
  modules: {
    id: string;
    title: string;
    description: string | null;
    lessons_count: number;
  }[];
  config: SalesPageConfig;
}

const SalesPagePreview = ({ service, profile, modules, config }: SalesPagePreviewProps) => {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const getInitials = (name: string | null) => {
    if (!name) return "P";
    return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
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

  const totalLessons = modules.reduce((acc, m) => acc + m.lessons_count, 0);
  
  // Priority: config.images.heroImage > config.images.videoThumbnail > product_config.image_url
  const heroImageUrl = config.images?.heroImage || config.images?.videoThumbnail || (service.product_config?.image_url as string) || null;
  const imageUrl = heroImageUrl;

  // Apply dynamic colors
  const primaryColor = `hsl(${config.colors.primary})`;
  const secondaryColor = `hsl(${config.colors.secondary})`;
  const accentColor = `hsl(${config.colors.accent})`;

  return (
    <div 
      className="min-h-screen"
      style={{ 
        backgroundColor: `hsl(${config.colors.background})`,
        '--sp-primary': config.colors.primary,
        '--sp-secondary': config.colors.secondary,
        '--sp-accent': config.colors.accent,
      } as React.CSSProperties}
    >
      {/* Hero Section */}
      <section className="relative py-12 md:py-20 overflow-hidden">
        <div 
          className="absolute inset-0"
          style={{ 
            background: `linear-gradient(to bottom, ${primaryColor}33, transparent 60%)` 
          }}
        />
        <div 
          className="absolute inset-0"
          style={{ 
            background: `radial-gradient(ellipse at top, ${primaryColor}26, transparent 50%)` 
          }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <Badge 
                className="px-4 py-1.5"
                style={{ 
                  backgroundColor: `${primaryColor}33`,
                  color: primaryColor,
                  borderColor: `${primaryColor}4D`,
                }}
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                {config.hero.badge}
              </Badge>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                {config.hero.title || service.name}
              </h1>

              {(config.hero.subtitle || service.description) && (
                <p className="text-lg text-gray-300 leading-relaxed">
                  {config.hero.subtitle || service.description}
                </p>
              )}

              {/* Stats */}
              <div className="flex flex-wrap gap-6 py-4">
                <div className="flex items-center gap-2 text-gray-300">
                  <BookOpen className="w-5 h-5" style={{ color: primaryColor }} />
                  <span className="font-medium">{totalLessons} aulas</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Award className="w-5 h-5" style={{ color: primaryColor }} />
                  <span className="font-medium">Certificado incluso</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Users className="w-5 h-5" style={{ color: primaryColor }} />
                  <span className="font-medium">{modules.length} módulos</span>
                </div>
              </div>

              {/* CTA Desktop */}
              <div className="hidden lg:flex items-center gap-4 pt-4">
                <Button
                  size="lg"
                  className="font-bold text-lg px-8 py-6 shadow-lg text-white"
                  style={{ 
                    backgroundColor: primaryColor,
                    boxShadow: `0 10px 40px ${primaryColor}40`,
                  }}
                >
                  {config.hero.ctaText} por {formatPrice(service.price_cents)}
                </Button>
                <div className="flex items-center gap-2 text-gray-400">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm">Pagamento seguro</span>
                </div>
              </div>
            </div>

            {/* Right - Course Preview */}
            {config.hero.showVideo && (
              <div className="relative">
                <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
                  style={{ backgroundColor: `hsl(${config.colors.background})` }}
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={service.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div 
                      className="w-full h-full flex items-center justify-center"
                      style={{ 
                        background: `linear-gradient(135deg, ${primaryColor}4D, ${accentColor}33)` 
                      }}
                    >
                      <Play className="w-20 h-20 text-white/50" />
                    </div>
                  )}

                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 group cursor-pointer hover:bg-black/40 transition-colors">
                    <div className="w-20 h-20 rounded-full bg-white/95 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 text-gray-900 ml-1" fill="currentColor" />
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-6 -left-6 border border-white/10 rounded-xl p-4 shadow-xl hidden md:block"
                  style={{ backgroundColor: `hsl(${config.colors.background})` }}
                >
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
            )}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      {config.benefits.enabled && (
        <section className="py-16" style={{ backgroundColor: `${primaryColor}0D` }}>
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-white text-center mb-8">
              {config.benefits.title}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {config.benefits.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-4 rounded-xl border border-white/10"
                  style={{ backgroundColor: `hsl(${config.colors.background})` }}
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${primaryColor}33` }}
                  >
                    <Check className="w-4 h-4" style={{ color: primaryColor }} />
                  </div>
                  <span className="text-gray-200 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Course Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Modules List */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-2xl font-bold text-white mb-2">{config.content.sectionTitle}</h2>
              <p className="text-gray-400 mb-6">{config.content.sectionSubtitle}</p>

              {modules.length === 0 ? (
                <div className="text-center py-12 rounded-xl border border-white/10"
                  style={{ backgroundColor: `${primaryColor}0D` }}
                >
                  <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Conteúdo em breve disponível</p>
                </div>
              ) : (
                modules.map((module, index) => (
                  <div
                    key={module.id}
                    className="border border-white/10 rounded-xl overflow-hidden"
                    style={{ backgroundColor: `${primaryColor}0D` }}
                  >
                    <button
                      onClick={() => toggleModule(module.id)}
                      className="w-full flex items-center justify-between p-5 transition-colors"
                      style={{ 
                        backgroundColor: expandedModules.has(module.id) ? `${primaryColor}1A` : 'transparent' 
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${primaryColor}33` }}
                        >
                          <span style={{ color: primaryColor }} className="font-bold">{index + 1}</span>
                        </div>
                        <div className="text-left">
                          <h3 className="text-white font-semibold">{module.title}</h3>
                          <p className="text-sm text-gray-400">
                            {module.lessons_count} aulas
                          </p>
                        </div>
                      </div>
                      {expandedModules.has(module.id) ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </button>

                    {expandedModules.has(module.id) && module.description && (
                      <div className="px-5 pb-4 border-t border-white/10">
                        <p className="text-gray-400 text-sm pt-4">{module.description}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Sticky Purchase Card */}
            <div className="lg:col-span-1">
              <div 
                className="sticky top-8 border border-white/10 rounded-2xl p-6 space-y-6"
                style={{ backgroundColor: `hsl(${config.colors.background})` }}
              >
                <div className="text-center pb-6 border-b border-white/10">
                  <p className="text-4xl font-bold text-white">{formatPrice(service.price_cents)}</p>
                  <p className="text-sm text-gray-400 mt-1">{config.cta.subText}</p>
                </div>

                <Button
                  className="w-full py-6 text-lg font-bold text-white"
                  style={{ 
                    backgroundColor: primaryColor,
                    boxShadow: `0 10px 40px ${primaryColor}40`,
                  }}
                >
                  {config.cta.buttonText}
                </Button>

                {config.cta.urgencyText && (
                  <p className="text-center text-sm" style={{ color: accentColor }}>
                    ⚡ {config.cta.urgencyText}
                  </p>
                )}

                {/* Guarantee */}
                {config.guarantee.enabled && (
                  <div className="pt-4 border-t border-white/10">
                    <div className="flex items-center gap-3 mb-2">
                      <Shield className="w-5 h-5 text-green-500" />
                      <span className="text-white font-medium">{config.guarantee.title}</span>
                    </div>
                    <p className="text-sm text-gray-400">{config.guarantee.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Instructor Section */}
      {config.instructor.showSection && profile && (
        <section className="py-16" style={{ backgroundColor: `${primaryColor}0D` }}>
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-white text-center mb-8">
              {config.instructor.title}
            </h2>
            <div className="max-w-2xl mx-auto">
              <div 
                className="p-6 rounded-2xl border border-white/10"
                style={{ backgroundColor: `hsl(${config.colors.background})` }}
              >
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <Avatar className="w-24 h-24 border-4" style={{ borderColor: primaryColor }}>
                    <AvatarImage src={profile.avatar_url || undefined} />
                    <AvatarFallback 
                      className="text-2xl"
                      style={{ backgroundColor: `${primaryColor}33`, color: primaryColor }}
                    >
                      {getInitials(profile.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center sm:text-left">
                    <h3 className="text-xl font-bold text-white">{profile.full_name}</h3>
                    {profile.specialty && (
                      <p className="text-gray-400 mt-1">{profile.specialty}</p>
                    )}
                    {profile.crp && (
                      <p className="text-sm text-gray-500 mt-1">CRP: {profile.crp}</p>
                    )}
                    {profile.bio && (
                      <p className="text-gray-300 mt-4 text-sm leading-relaxed">{profile.bio}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Mobile CTA */}
      <div 
        className="lg:hidden fixed bottom-0 left-0 right-0 p-4 border-t border-white/10"
        style={{ backgroundColor: `hsl(${config.colors.background})` }}
      >
        <Button
          className="w-full py-6 text-lg font-bold text-white"
          style={{ 
            backgroundColor: primaryColor,
            boxShadow: `0 -4px 20px ${primaryColor}40`,
          }}
        >
          {config.cta.buttonText} • {formatPrice(service.price_cents)}
        </Button>
      </div>
    </div>
  );
};

export default SalesPagePreview;
