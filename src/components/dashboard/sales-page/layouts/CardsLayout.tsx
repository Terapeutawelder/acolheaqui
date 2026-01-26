import { 
  Play, 
  BookOpen, 
  Award, 
  Check, 
  Shield,
  Sparkles,
  Users,
  Clock,
  Infinity,
  ArrowRight,
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

const CardsLayout = ({ service, profile, modules, config, themeColors }: LayoutProps) => {
  const { primaryColor, accentColor, textPrimary, textSecondary, textMuted, borderColor, bgOverlay, isLightTheme } = themeColors;

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
      {/* Hero Section - Modern Bento Grid */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-5 gap-5">
            {/* Main Card - Hero Content */}
            <div 
              className={`lg:col-span-3 rounded-3xl p-8 md:p-12 border-2 transition-all duration-300 hover:shadow-2xl ${borderColor}`}
              style={{ 
                background: `linear-gradient(135deg, ${primaryColor}12, ${primaryColor}05)`,
              }}
            >
              <Badge 
                className="px-5 py-2 mb-8 font-semibold shadow-lg"
                style={{ 
                  backgroundColor: `${primaryColor}25`,
                  color: primaryColor,
                }}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {config.hero.badge}
              </Badge>

              <h1 className={`text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.1] mb-6 ${textPrimary}`}>
                {config.hero.title || service.name}
              </h1>

              {(config.hero.subtitle || service.description) && (
                <p className={`text-lg md:text-xl leading-relaxed mb-10 ${textSecondary}`}>
                  {config.hero.subtitle || service.description}
                </p>
              )}

              {/* Video Thumbnail - Enhanced */}
              {config.hero.showVideo && heroImageUrl && (
                <div className="relative mb-10">
                  <div 
                    className="absolute -inset-3 rounded-3xl blur-xl opacity-20"
                    style={{ backgroundColor: primaryColor }}
                  />
                  <div className={`relative aspect-video rounded-2xl overflow-hidden border-2 ${borderColor} shadow-xl`}>
                    <img
                      src={heroImageUrl}
                      alt={service.name}
                      className="w-full h-full object-cover"
                    />
                    <div className={`absolute inset-0 flex items-center justify-center ${bgOverlay} group cursor-pointer transition-all duration-300 hover:bg-black/50`}>
                      <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:scale-110">
                        <Play className="w-8 h-8 text-gray-900 ml-1" fill="currentColor" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <Button
                size="lg"
                className="group font-bold text-lg px-10 py-7 text-white rounded-xl shadow-2xl transition-all duration-300 hover:scale-[1.02] hidden lg:inline-flex"
                style={{ 
                  background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}DD)`,
                  boxShadow: `0 15px 40px ${primaryColor}40`,
                }}
              >
                {config.hero.ctaText} por {formatPrice(service.price_cents)}
                <ArrowRight className="w-5 h-5 ml-3 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>

            {/* Stats Cards Column - Enhanced */}
            <div className="lg:col-span-2 grid grid-cols-2 lg:grid-cols-1 gap-4">
              {[
                { icon: BookOpen, value: totalLessons, label: 'Aulas em vídeo', color: primaryColor },
                { icon: Users, value: modules.length, label: 'Módulos completos', color: primaryColor },
                { icon: Award, value: 'Grátis', label: 'Certificado incluso', color: accentColor },
                { icon: Infinity, value: 'Vitalício', label: 'Acesso ilimitado', color: primaryColor },
              ].map((stat, i) => (
                <div 
                  key={i}
                  className={`group rounded-2xl p-6 border-2 flex flex-col justify-center transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${borderColor}`}
                  style={{ backgroundColor: `hsl(${config.colors.background})` }}
                >
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-lg transition-transform duration-300 group-hover:scale-110"
                    style={{ background: `linear-gradient(135deg, ${stat.color}, ${stat.color}CC)` }}
                  >
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <p className={`text-3xl font-bold ${textPrimary}`}>{stat.value}</p>
                  <p className={`text-sm mt-1 ${textMuted}`}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section - Floating Pills */}
      {config.benefits.enabled && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className={`text-3xl md:text-4xl font-bold text-center mb-12 ${textPrimary}`}>
              {config.benefits.title}
            </h2>
            <div className="flex flex-wrap justify-center gap-4 max-w-5xl mx-auto">
              {config.benefits.items.map((item, i) => (
                <div 
                  key={i} 
                  className={`group flex items-center gap-4 px-6 py-4 rounded-full border-2 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.03] ${borderColor}`}
                  style={{ backgroundColor: `hsl(${config.colors.background})` }}
                >
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                    style={{ background: `linear-gradient(135deg, ${primaryColor}30, ${primaryColor}10)` }}
                  >
                    <Check className="w-4 h-4" style={{ color: primaryColor }} />
                  </div>
                  <span className={`font-medium ${textPrimary}`}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Course Content - Premium Cards Grid */}
      <section className="py-20" style={{ backgroundColor: `${primaryColor}05` }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${textPrimary}`}>{config.content.sectionTitle}</h2>
            <p className={`text-lg ${textMuted}`}>{config.content.sectionSubtitle}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
            {modules.map((module, index) => (
              <div
                key={module.id}
                className={`group border-2 ${borderColor} rounded-2xl p-7 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]`}
                style={{ backgroundColor: `hsl(${config.colors.background})` }}
              >
                <div className="flex items-start justify-between mb-5">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110"
                    style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}CC)` }}
                  >
                    <span className="font-bold text-lg text-white">{index + 1}</span>
                  </div>
                  <Badge variant="secondary" className="font-semibold px-3 py-1">
                    {module.lessons_count} aulas
                  </Badge>
                </div>
                <h3 className={`font-bold text-lg mb-3 ${textPrimary}`}>{module.title}</h3>
                {module.description && (
                  <p className={`text-sm leading-relaxed ${textMuted} line-clamp-2`}>{module.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Instructor Card - Premium */}
      {config.instructor.showSection && profile && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div 
                className={`rounded-3xl p-10 border-2 ${borderColor} shadow-xl`}
                style={{ 
                  background: `linear-gradient(135deg, ${primaryColor}12, ${primaryColor}05)`,
                }}
              >
                <p className={`text-xs uppercase tracking-[0.2em] mb-8 font-bold ${textMuted}`}>{config.instructor.title}</p>
                <div className="flex flex-col sm:flex-row items-center gap-8">
                  <div className="relative">
                    <div 
                      className="absolute -inset-2 rounded-full blur-xl opacity-30"
                      style={{ backgroundColor: primaryColor }}
                    />
                    <Avatar className="relative w-24 h-24 border-4 shadow-xl" style={{ borderColor: primaryColor }}>
                      <AvatarImage src={profile.avatar_url || undefined} />
                      <AvatarFallback 
                        className="text-2xl font-bold"
                        style={{ 
                          background: `linear-gradient(135deg, ${primaryColor}40, ${primaryColor}20)`,
                          color: primaryColor 
                        }}
                      >
                        {getInitials(profile.full_name)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="text-center sm:text-left flex-1">
                    <h3 className={`text-2xl font-bold ${textPrimary}`}>{profile.full_name}</h3>
                    {profile.specialty && (
                      <p className={`mt-1 ${textMuted}`}>{profile.specialty}</p>
                    )}
                    <div className="flex items-center gap-1 mt-3 justify-center sm:justify-start">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      ))}
                    </div>
                  </div>
                </div>
                {profile.bio && (
                  <p className={`mt-8 leading-relaxed text-center sm:text-left ${textSecondary}`}>{profile.bio}</p>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section - Bento Style */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">
            {/* Price Card */}
            <div 
              className={`rounded-3xl p-10 border-2 ${borderColor} flex flex-col justify-center transition-all duration-300 hover:shadow-xl`}
              style={{ backgroundColor: `hsl(${config.colors.background})` }}
            >
              <p className={`text-sm font-medium mb-3 ${textMuted}`}>{config.cta.mainText}</p>
              <p className={`text-5xl md:text-6xl font-bold mb-3 ${textPrimary}`}>{formatPrice(service.price_cents)}</p>
              <p className={`text-sm ${textMuted}`}>{config.cta.subText}</p>
              
              {/* Included Features */}
              <div className={`mt-8 pt-6 border-t space-y-3 ${borderColor}`}>
                {[
                  'Acesso vitalício',
                  'Certificado incluso',
                  'Suporte exclusivo',
                ].map((item, i) => (
                  <div key={i} className={`flex items-center gap-3 ${textSecondary}`}>
                    <Check className="w-4 h-4" style={{ color: primaryColor }} />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Card - Gradient */}
            <div 
              className="rounded-3xl p-10 flex flex-col justify-center text-white transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]"
              style={{ 
                background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}DD)`,
                boxShadow: `0 20px 50px ${primaryColor}40`,
              }}
            >
              <Button
                size="lg"
                className="group font-bold text-lg py-7 bg-white hover:bg-white/95 mb-6 shadow-xl transition-all duration-300"
                style={{ color: primaryColor }}
              >
                {config.cta.buttonText}
                <ArrowRight className="w-5 h-5 ml-3 transition-transform group-hover:translate-x-1" />
              </Button>
              
              {config.cta.urgencyText && (
                <p className="text-center font-medium opacity-90">⚡ {config.cta.urgencyText}</p>
              )}

              {config.guarantee.enabled && (
                <div className="flex items-center justify-center gap-3 mt-6 text-sm opacity-90">
                  <Shield className="w-5 h-5" />
                  {config.guarantee.title}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Mobile CTA - Premium */}
      <div 
        className={`lg:hidden fixed bottom-0 left-0 right-0 p-4 border-t backdrop-blur-xl ${borderColor}`}
        style={{ backgroundColor: isLightTheme ? 'rgba(255,255,255,0.95)' : `hsl(${config.colors.background} / 0.95)` }}
      >
        <Button
          className="w-full py-6 text-lg font-bold text-white rounded-xl shadow-xl"
          style={{ 
            background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}DD)`,
            boxShadow: `0 -10px 30px ${primaryColor}40`,
          }}
        >
          {config.cta.buttonText} • {formatPrice(service.price_cents)}
        </Button>
      </div>

      {/* Bottom Spacer for Mobile */}
      <div className="h-24 lg:hidden" />
    </>
  );
};

export default CardsLayout;
