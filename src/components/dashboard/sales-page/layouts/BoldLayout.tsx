import { 
  Play, 
  BookOpen, 
  Award, 
  Check, 
  Shield,
  Sparkles,
  Users,
  Zap,
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

const BoldLayout = ({ service, profile, modules, config, themeColors }: LayoutProps) => {
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
      {/* Hero Section - BOLD Full Width */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background Gradient */}
        <div 
          className="absolute inset-0"
          style={{ 
            background: `linear-gradient(135deg, ${primaryColor}40 0%, transparent 50%), 
                        linear-gradient(225deg, ${accentColor}30 0%, transparent 50%)` 
          }}
        />
        
        {/* Animated circles */}
        <div 
          className="absolute top-20 right-20 w-96 h-96 rounded-full blur-3xl opacity-30"
          style={{ backgroundColor: primaryColor }}
        />
        <div 
          className="absolute bottom-20 left-20 w-64 h-64 rounded-full blur-3xl opacity-20"
          style={{ backgroundColor: accentColor }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <Badge 
              className="px-8 py-3 text-base mb-8 animate-pulse"
              style={{ 
                backgroundColor: accentColor,
                color: 'white',
              }}
            >
              <Zap className="w-5 h-5 mr-2" />
              {config.hero.badge}
            </Badge>

            <h1 className={`text-5xl md:text-6xl lg:text-8xl font-black leading-none mb-8 ${textPrimary}`}>
              {config.hero.title || service.name}
            </h1>

            {(config.hero.subtitle || service.description) && (
              <p className={`text-xl md:text-2xl leading-relaxed max-w-3xl mx-auto mb-12 ${textSecondary}`}>
                {config.hero.subtitle || service.description}
              </p>
            )}

            {/* Stats Row */}
            <div className="flex flex-wrap justify-center gap-12 mb-12">
              <div className="text-center">
                <p className={`text-5xl font-black ${textPrimary}`}>{totalLessons}+</p>
                <p className={`text-sm uppercase tracking-wider mt-1 ${textMuted}`}>Aulas</p>
              </div>
              <div className="text-center">
                <p className={`text-5xl font-black ${textPrimary}`}>{modules.length}</p>
                <p className={`text-sm uppercase tracking-wider mt-1 ${textMuted}`}>Módulos</p>
              </div>
              <div className="text-center">
                <p className={`text-5xl font-black ${textPrimary}`}>100%</p>
                <p className={`text-sm uppercase tracking-wider mt-1 ${textMuted}`}>Online</p>
              </div>
            </div>

            {/* Giant CTA */}
            <Button
              size="lg"
              className="font-black text-2xl px-16 py-10 shadow-2xl text-white rounded-2xl transform hover:scale-105 transition-transform"
              style={{ 
                backgroundColor: primaryColor,
                boxShadow: `0 25px 60px ${primaryColor}60`,
              }}
            >
              {config.hero.ctaText} • {formatPrice(service.price_cents)}
            </Button>

            <div className={`flex items-center justify-center gap-8 mt-8 ${textMuted}`}>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <span>Pagamento seguro</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5" />
                <span>Acesso imediato</span>
              </div>
              {config.guarantee.enabled && (
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  <span>{config.guarantee.days} dias de garantia</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section - Bold Cards */}
      {config.benefits.enabled && (
        <section className="py-24" style={{ backgroundColor: `${primaryColor}10` }}>
          <div className="container mx-auto px-4">
            <h2 className={`text-4xl md:text-5xl font-black text-center mb-16 ${textPrimary}`}>
              {config.benefits.title}
            </h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {config.benefits.items.map((item, i) => (
                <div 
                  key={i} 
                  className={`p-8 rounded-3xl border-2 ${borderColor} transform hover:scale-[1.02] transition-transform`}
                  style={{ backgroundColor: `hsl(${config.colors.background})` }}
                >
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                    style={{ backgroundColor: `${primaryColor}30` }}
                  >
                    <Check className="w-8 h-8" style={{ color: primaryColor }} />
                  </div>
                  <p className={`text-xl font-bold ${textPrimary}`}>{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Course Content - Bold Cards */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`text-4xl md:text-5xl font-black mb-4 ${textPrimary}`}>{config.content.sectionTitle}</h2>
            <p className={`text-xl ${textMuted}`}>{config.content.sectionSubtitle}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {modules.map((module, index) => (
              <div
                key={module.id}
                className={`relative border-2 ${borderColor} rounded-3xl p-8 overflow-hidden group hover:border-primary transition-colors`}
                style={{ backgroundColor: `hsl(${config.colors.background})` }}
              >
                {/* Module number badge */}
                <div 
                  className="absolute top-6 right-6 w-12 h-12 rounded-full flex items-center justify-center font-black text-lg text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  {index + 1}
                </div>

                <BookOpen className="w-10 h-10 mb-4" style={{ color: primaryColor }} />
                <h3 className={`text-xl font-bold mb-2 pr-12 ${textPrimary}`}>{module.title}</h3>
                <p className={`text-sm mb-4 ${textMuted}`}>
                  {module.lessons_count} aulas
                </p>
                {module.description && (
                  <p className={`text-sm ${textSecondary} line-clamp-3`}>{module.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Instructor Section */}
      {config.instructor.showSection && profile && (
        <section className="py-24" style={{ backgroundColor: `${primaryColor}10` }}>
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-12">
              <Avatar className="w-48 h-48 border-8 shrink-0" style={{ borderColor: primaryColor }}>
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback 
                  className="text-5xl font-black"
                  style={{ backgroundColor: `${primaryColor}33`, color: primaryColor }}
                >
                  {getInitials(profile.full_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className={`text-sm uppercase tracking-widest mb-2 ${textMuted}`}>{config.instructor.title}</p>
                <h3 className={`text-4xl font-black ${textPrimary}`}>{profile.full_name}</h3>
                {profile.specialty && (
                  <p className={`mt-2 text-xl ${textMuted}`}>{profile.specialty}</p>
                )}
                {profile.bio && (
                  <p className={`mt-6 text-lg leading-relaxed ${textSecondary}`}>{profile.bio}</p>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Final CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div 
            className="max-w-4xl mx-auto rounded-[3rem] p-12 md:p-16 text-center"
            style={{ 
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}CC 100%)`,
              boxShadow: `0 30px 80px ${primaryColor}50`,
            }}
          >
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">{config.cta.mainText}</h2>
            <p className="text-xl text-white/80 mb-10">{config.cta.subText}</p>
            
            <div className="text-6xl font-black text-white mb-10">
              {formatPrice(service.price_cents)}
            </div>

            <Button
              size="lg"
              className="font-black text-2xl px-16 py-10 shadow-2xl rounded-2xl"
              style={{ 
                backgroundColor: 'white',
                color: primaryColor,
              }}
            >
              {config.cta.buttonText}
            </Button>

            {config.cta.urgencyText && (
              <p className="mt-8 text-xl font-bold text-white">
                ⚡ {config.cta.urgencyText}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Sticky Bottom CTA */}
      <div 
        className={`fixed bottom-0 left-0 right-0 p-4 border-t ${borderColor}`}
        style={{ backgroundColor: `hsl(${config.colors.background})` }}
      >
        <div className="container mx-auto flex items-center justify-between gap-4">
          <div className="hidden sm:block">
            <p className={`font-bold ${textPrimary}`}>{service.name}</p>
            <p className={`text-sm ${textMuted}`}>{config.cta.subText}</p>
          </div>
          <Button
            className="font-bold text-lg py-6 px-8 text-white flex-1 sm:flex-none"
            style={{ 
              backgroundColor: primaryColor,
            }}
          >
            {config.cta.buttonText} • {formatPrice(service.price_cents)}
          </Button>
        </div>
      </div>
    </>
  );
};

export default BoldLayout;
