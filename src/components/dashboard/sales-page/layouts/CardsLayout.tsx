import { 
  Play, 
  BookOpen, 
  Award, 
  Check, 
  Shield,
  Sparkles,
  Users,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SalesPageConfig } from "../SalesPagePreview";

interface LayoutProps {
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
  themeColors: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    borderColor: string;
    bgOverlay: string;
    isLightTheme: boolean;
  };
}

const CardsLayout = ({ service, profile, modules, config, themeColors }: LayoutProps) => {
  const { primaryColor, accentColor, textPrimary, textSecondary, textMuted, borderColor, bgOverlay } = themeColors;

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

  const totalLessons = modules.reduce((acc, m) => acc + m.lessons_count, 0);
  const heroImageUrl = config.images?.heroImage || config.images?.videoThumbnail || (service.product_config?.image_url as string) || null;

  return (
    <>
      {/* Hero Section - Cards Layout */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-5 gap-6">
            {/* Main Card - Hero Content */}
            <div 
              className={`lg:col-span-3 rounded-3xl p-8 md:p-12 border ${borderColor}`}
              style={{ backgroundColor: `${primaryColor}08` }}
            >
              <Badge 
                className="px-4 py-1.5 mb-6"
                style={{ 
                  backgroundColor: `${primaryColor}33`,
                  color: primaryColor,
                }}
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                {config.hero.badge}
              </Badge>

              <h1 className={`text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6 ${textPrimary}`}>
                {config.hero.title || service.name}
              </h1>

              {(config.hero.subtitle || service.description) && (
                <p className={`text-lg leading-relaxed mb-8 ${textSecondary}`}>
                  {config.hero.subtitle || service.description}
                </p>
              )}

              {/* Video Thumbnail */}
              {config.hero.showVideo && heroImageUrl && (
                <div className={`relative aspect-video rounded-2xl overflow-hidden border ${borderColor} mb-8`}>
                  <img
                    src={heroImageUrl}
                    alt={service.name}
                    className="w-full h-full object-cover"
                  />
                  <div className={`absolute inset-0 flex items-center justify-center ${bgOverlay} group cursor-pointer`}>
                    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 text-gray-900 ml-1" fill="currentColor" />
                    </div>
                  </div>
                </div>
              )}

              <Button
                size="lg"
                className="font-bold text-lg px-8 py-6 shadow-lg text-white hidden lg:inline-flex"
                style={{ 
                  backgroundColor: primaryColor,
                  boxShadow: `0 10px 40px ${primaryColor}40`,
                }}
              >
                {config.hero.ctaText} por {formatPrice(service.price_cents)}
              </Button>
            </div>

            {/* Stats Cards Column */}
            <div className="lg:col-span-2 grid grid-cols-2 lg:grid-cols-1 gap-4">
              <div 
                className={`rounded-2xl p-6 border ${borderColor} flex flex-col justify-center`}
                style={{ backgroundColor: `hsl(${config.colors.background})` }}
              >
                <BookOpen className="w-8 h-8 mb-3" style={{ color: primaryColor }} />
                <p className={`text-3xl font-bold ${textPrimary}`}>{totalLessons}</p>
                <p className={`text-sm ${textMuted}`}>Aulas em vídeo</p>
              </div>
              
              <div 
                className={`rounded-2xl p-6 border ${borderColor} flex flex-col justify-center`}
                style={{ backgroundColor: `hsl(${config.colors.background})` }}
              >
                <Users className="w-8 h-8 mb-3" style={{ color: primaryColor }} />
                <p className={`text-3xl font-bold ${textPrimary}`}>{modules.length}</p>
                <p className={`text-sm ${textMuted}`}>Módulos</p>
              </div>
              
              <div 
                className={`rounded-2xl p-6 border ${borderColor} flex flex-col justify-center`}
                style={{ backgroundColor: `hsl(${config.colors.background})` }}
              >
                <Award className="w-8 h-8 mb-3" style={{ color: primaryColor }} />
                <p className={`text-lg font-bold ${textPrimary}`}>Certificado</p>
                <p className={`text-sm ${textMuted}`}>Incluso</p>
              </div>
              
              <div 
                className={`rounded-2xl p-6 border ${borderColor} flex flex-col justify-center`}
                style={{ backgroundColor: `hsl(${config.colors.background})` }}
              >
                <Clock className="w-8 h-8 mb-3" style={{ color: primaryColor }} />
                <p className={`text-lg font-bold ${textPrimary}`}>Acesso</p>
                <p className={`text-sm ${textMuted}`}>Vitalício</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section - Floating Cards */}
      {config.benefits.enabled && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className={`text-2xl font-bold text-center mb-10 ${textPrimary}`}>
              {config.benefits.title}
            </h2>
            <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
              {config.benefits.items.map((item, i) => (
                <div 
                  key={i} 
                  className={`flex items-center gap-3 px-6 py-4 rounded-full border ${borderColor} shadow-sm`}
                  style={{ backgroundColor: `hsl(${config.colors.background})` }}
                >
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${primaryColor}30` }}
                  >
                    <Check className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                  </div>
                  <span className={`text-sm font-medium ${textPrimary}`}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Course Content - Cards Grid */}
      <section className="py-16" style={{ backgroundColor: `${primaryColor}05` }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className={`text-2xl font-bold mb-3 ${textPrimary}`}>{config.content.sectionTitle}</h2>
            <p className={textMuted}>{config.content.sectionSubtitle}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {modules.map((module, index) => (
              <div
                key={module.id}
                className={`border ${borderColor} rounded-2xl p-6 hover:shadow-lg transition-shadow`}
                style={{ backgroundColor: `hsl(${config.colors.background})` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${primaryColor}20` }}
                  >
                    <span style={{ color: primaryColor }} className="font-bold">{index + 1}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {module.lessons_count} aulas
                  </Badge>
                </div>
                <h3 className={`font-bold mb-2 ${textPrimary}`}>{module.title}</h3>
                {module.description && (
                  <p className={`text-sm ${textMuted} line-clamp-2`}>{module.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Instructor Card */}
      {config.instructor.showSection && profile && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <div 
                className={`rounded-3xl p-8 border ${borderColor}`}
                style={{ backgroundColor: `${primaryColor}08` }}
              >
                <p className={`text-sm uppercase tracking-wider mb-6 ${textMuted}`}>{config.instructor.title}</p>
                <div className="flex items-center gap-6">
                  <Avatar className="w-20 h-20 border-4" style={{ borderColor: primaryColor }}>
                    <AvatarImage src={profile.avatar_url || undefined} />
                    <AvatarFallback 
                      className="text-2xl"
                      style={{ backgroundColor: `${primaryColor}33`, color: primaryColor }}
                    >
                      {getInitials(profile.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className={`text-xl font-bold ${textPrimary}`}>{profile.full_name}</h3>
                    {profile.specialty && (
                      <p className={textMuted}>{profile.specialty}</p>
                    )}
                  </div>
                </div>
                {profile.bio && (
                  <p className={`mt-6 leading-relaxed ${textSecondary}`}>{profile.bio}</p>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Price Card */}
            <div 
              className={`rounded-3xl p-8 border ${borderColor} flex flex-col justify-center`}
              style={{ backgroundColor: `hsl(${config.colors.background})` }}
            >
              <p className={`text-sm mb-2 ${textMuted}`}>{config.cta.mainText}</p>
              <p className={`text-5xl font-bold mb-2 ${textPrimary}`}>{formatPrice(service.price_cents)}</p>
              <p className={`text-sm ${textMuted}`}>{config.cta.subText}</p>
            </div>

            {/* CTA Card */}
            <div 
              className="rounded-3xl p-8 flex flex-col justify-center text-white"
              style={{ backgroundColor: primaryColor }}
            >
              <Button
                size="lg"
                className="font-bold text-lg py-6 bg-white hover:bg-white/90 mb-4"
                style={{ color: primaryColor }}
              >
                {config.cta.buttonText}
              </Button>
              
              {config.cta.urgencyText && (
                <p className="text-center text-sm opacity-90">⚡ {config.cta.urgencyText}</p>
              )}

              {config.guarantee.enabled && (
                <div className="flex items-center justify-center gap-2 mt-4 text-sm opacity-80">
                  <Shield className="w-4 h-4" />
                  {config.guarantee.title}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Mobile CTA */}
      <div 
        className={`lg:hidden fixed bottom-0 left-0 right-0 p-4 border-t ${borderColor}`}
        style={{ backgroundColor: `hsl(${config.colors.background})` }}
      >
        <Button
          className="w-full py-6 text-lg font-bold text-white rounded-xl"
          style={{ 
            backgroundColor: primaryColor,
            boxShadow: `0 -4px 20px ${primaryColor}40`,
          }}
        >
          {config.cta.buttonText} • {formatPrice(service.price_cents)}
        </Button>
      </div>
    </>
  );
};

export default CardsLayout;
