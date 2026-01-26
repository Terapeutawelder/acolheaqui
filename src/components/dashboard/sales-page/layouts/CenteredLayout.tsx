import { 
  Play, 
  BookOpen, 
  Award, 
  Check, 
  Shield,
  Sparkles,
  Users,
  Star,
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

const CenteredLayout = ({ service, profile, modules, config, themeColors }: LayoutProps) => {
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
      {/* Hero Section - Centered */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div 
          className="absolute inset-0"
          style={{ 
            background: `radial-gradient(circle at center top, ${primaryColor}30, transparent 60%)` 
          }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Badge 
              className="px-6 py-2 text-sm"
              style={{ 
                backgroundColor: `${primaryColor}33`,
                color: primaryColor,
                borderColor: `${primaryColor}4D`,
              }}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {config.hero.badge}
            </Badge>

            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold leading-tight ${textPrimary}`}>
              {config.hero.title || service.name}
            </h1>

            {(config.hero.subtitle || service.description) && (
              <p className={`text-xl leading-relaxed max-w-2xl mx-auto ${textSecondary}`}>
                {config.hero.subtitle || service.description}
              </p>
            )}

            {/* Stats - Icons Style */}
            <div className="flex flex-wrap justify-center gap-8 py-6">
              <div className="flex flex-col items-center gap-2">
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: `${primaryColor}20` }}
                >
                  <BookOpen className="w-7 h-7" style={{ color: primaryColor }} />
                </div>
                <span className={`font-bold text-lg ${textPrimary}`}>{totalLessons}</span>
                <span className={`text-sm ${textMuted}`}>Aulas</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: `${primaryColor}20` }}
                >
                  <Users className="w-7 h-7" style={{ color: primaryColor }} />
                </div>
                <span className={`font-bold text-lg ${textPrimary}`}>{modules.length}</span>
                <span className={`text-sm ${textMuted}`}>Módulos</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: `${primaryColor}20` }}
                >
                  <Award className="w-7 h-7" style={{ color: primaryColor }} />
                </div>
                <span className={`font-bold text-lg ${textPrimary}`}>Incluso</span>
                <span className={`text-sm ${textMuted}`}>Certificado</span>
              </div>
            </div>

            {/* Main CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button
                size="lg"
                className="font-bold text-xl px-12 py-8 shadow-xl text-white rounded-2xl"
                style={{ 
                  backgroundColor: primaryColor,
                  boxShadow: `0 20px 50px ${primaryColor}50`,
                }}
              >
                {config.hero.ctaText} por {formatPrice(service.price_cents)}
              </Button>
            </div>

            <div className={`flex items-center justify-center gap-6 ${textMuted}`}>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span className="text-sm">Pagamento seguro</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span className="text-sm">Acesso imediato</span>
              </div>
            </div>

            {/* Video Preview */}
            {config.hero.showVideo && heroImageUrl && (
              <div className="pt-8">
                <div className={`relative aspect-video rounded-3xl overflow-hidden border-2 ${borderColor} shadow-2xl max-w-3xl mx-auto`}
                  style={{ backgroundColor: `hsl(${config.colors.background})` }}
                >
                  <img
                    src={heroImageUrl}
                    alt={service.name}
                    className="w-full h-full object-cover"
                  />
                  <div className={`absolute inset-0 flex items-center justify-center ${bgOverlay} group cursor-pointer hover:bg-black/40 transition-colors`}>
                    <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                      <Play className="w-10 h-10 text-gray-900 ml-1" fill="currentColor" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Benefits Section - Icons Style */}
      {config.benefits.enabled && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className={`text-3xl font-bold text-center mb-12 ${textPrimary}`}>
              {config.benefits.title}
            </h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {config.benefits.items.map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-5">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${primaryColor}20` }}
                  >
                    <Check className="w-6 h-6" style={{ color: primaryColor }} />
                  </div>
                  <span className={`text-lg ${textPrimary}`}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Course Content - Cards Style */}
      <section className="py-20" style={{ backgroundColor: `${primaryColor}08` }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-bold mb-4 ${textPrimary}`}>{config.content.sectionTitle}</h2>
            <p className={`text-lg ${textMuted}`}>{config.content.sectionSubtitle}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {modules.map((module, index) => (
              <div
                key={module.id}
                className={`border ${borderColor} rounded-2xl p-6 transition-all hover:scale-[1.02] hover:shadow-lg`}
                style={{ backgroundColor: `hsl(${config.colors.background})` }}
              >
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${primaryColor}20` }}
                >
                  <span style={{ color: primaryColor }} className="font-bold text-lg">{index + 1}</span>
                </div>
                <h3 className={`font-bold text-lg mb-2 ${textPrimary}`}>{module.title}</h3>
                <p className={`text-sm mb-3 ${textMuted}`}>
                  {module.lessons_count} aulas
                </p>
                {module.description && (
                  <p className={`text-sm ${textSecondary} line-clamp-2`}>{module.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div 
            className={`max-w-2xl mx-auto rounded-3xl p-8 md:p-12 text-center border ${borderColor}`}
            style={{ 
              backgroundColor: `${primaryColor}10`,
              boxShadow: `0 0 60px ${primaryColor}20`,
            }}
          >
            <h2 className={`text-3xl font-bold mb-4 ${textPrimary}`}>{config.cta.mainText}</h2>
            <p className={`text-lg mb-8 ${textSecondary}`}>{config.cta.subText}</p>
            
            <div className={`text-5xl font-bold mb-6 ${textPrimary}`}>
              {formatPrice(service.price_cents)}
            </div>

            <Button
              size="lg"
              className="font-bold text-xl px-12 py-8 shadow-xl text-white rounded-2xl w-full sm:w-auto"
              style={{ 
                backgroundColor: primaryColor,
                boxShadow: `0 20px 50px ${primaryColor}50`,
              }}
            >
              {config.cta.buttonText}
            </Button>

            {config.cta.urgencyText && (
              <p className="mt-6 text-lg font-medium" style={{ color: accentColor }}>
                ⚡ {config.cta.urgencyText}
              </p>
            )}

            {config.guarantee.enabled && (
              <div className={`mt-8 pt-6 border-t ${borderColor} flex items-center justify-center gap-3`}>
                <Shield className="w-6 h-6 text-green-500" />
                <span className={textSecondary}>{config.guarantee.title}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Instructor Section */}
      {config.instructor.showSection && profile && (
        <section className="py-20" style={{ backgroundColor: `${primaryColor}08` }}>
          <div className="container mx-auto px-4">
            <h2 className={`text-3xl font-bold text-center mb-12 ${textPrimary}`}>
              {config.instructor.title}
            </h2>
            <div className="max-w-xl mx-auto text-center">
              <Avatar className="w-32 h-32 mx-auto border-4 mb-6" style={{ borderColor: primaryColor }}>
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback 
                  className="text-3xl"
                  style={{ backgroundColor: `${primaryColor}33`, color: primaryColor }}
                >
                  {getInitials(profile.full_name)}
                </AvatarFallback>
              </Avatar>
              <h3 className={`text-2xl font-bold ${textPrimary}`}>{profile.full_name}</h3>
              {profile.specialty && (
                <p className={`mt-2 text-lg ${textMuted}`}>{profile.specialty}</p>
              )}
              {profile.crp && (
                <p className={`text-sm mt-1 ${textMuted}`}>CRP: {profile.crp}</p>
              )}
              {profile.bio && (
                <p className={`mt-6 text-lg leading-relaxed ${textSecondary}`}>{profile.bio}</p>
              )}
            </div>
          </div>
        </section>
      )}

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

export default CenteredLayout;
