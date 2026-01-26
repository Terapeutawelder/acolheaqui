import { 
  Play, 
  BookOpen, 
  Award, 
  Check, 
  Shield,
  Sparkles,
  Users,
  Star,
  Infinity,
  ArrowRight,
  Zap,
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
      {/* Hero Section - Centered Premium */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        {/* Background Effects */}
        <div 
          className="absolute inset-0"
          style={{ 
            background: `radial-gradient(circle at 50% 0%, ${primaryColor}40, transparent 50%),
                        radial-gradient(circle at 0% 100%, ${accentColor}20, transparent 40%),
                        radial-gradient(circle at 100% 100%, ${primaryColor}15, transparent 40%)` 
          }}
        />
        
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full blur-[100px] opacity-20" style={{ backgroundColor: primaryColor }} />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-[120px] opacity-15" style={{ backgroundColor: accentColor }} />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-10">
            {/* Badge with Animation */}
            <div className="inline-flex">
              <Badge 
                className="px-6 py-2.5 text-sm font-semibold shadow-lg backdrop-blur-sm border"
                style={{ 
                  backgroundColor: `${primaryColor}25`,
                  color: primaryColor,
                  borderColor: `${primaryColor}40`,
                }}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {config.hero.badge}
              </Badge>
            </div>

            {/* Title with Gradient */}
            <h1 
              className={`text-4xl md:text-5xl lg:text-7xl font-bold leading-[1.1] tracking-tight ${textPrimary}`}
            >
              {config.hero.title || service.name}
            </h1>

            {(config.hero.subtitle || service.description) && (
              <p className={`text-xl md:text-2xl leading-relaxed max-w-2xl mx-auto ${textSecondary}`}>
                {config.hero.subtitle || service.description}
              </p>
            )}

            {/* Stats - Elegant Floating Cards */}
            <div className="flex flex-wrap justify-center gap-6 py-8">
              {[
                { icon: BookOpen, value: totalLessons, label: 'Aulas', suffix: '+' },
                { icon: Users, value: modules.length, label: 'Módulos', suffix: '' },
                { icon: Award, value: 'Grátis', label: 'Certificado', suffix: '' },
                { icon: Infinity, value: '∞', label: 'Acesso', suffix: '' },
              ].map((stat, i) => (
                <div 
                  key={i}
                  className={`flex flex-col items-center gap-3 p-6 rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl ${borderColor}`}
                  style={{ backgroundColor: isLightTheme ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.3)' }}
                >
                  <div 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}CC)` }}
                  >
                    <stat.icon className="w-7 h-7 text-white" />
                  </div>
                  <span className={`font-bold text-2xl ${textPrimary}`}>{stat.value}{stat.suffix}</span>
                  <span className={`text-sm ${textMuted}`}>{stat.label}</span>
                </div>
              ))}
            </div>

            {/* Main CTA - Premium Button */}
            <div className="flex flex-col items-center gap-6 pt-4">
              <Button
                size="lg"
                className="group font-bold text-xl px-14 py-8 text-white rounded-2xl shadow-2xl transition-all duration-300 hover:scale-[1.03]"
                style={{ 
                  background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}DD)`,
                  boxShadow: `0 25px 60px ${primaryColor}50`,
                }}
              >
                {config.hero.ctaText} por {formatPrice(service.price_cents)}
                <ArrowRight className="w-6 h-6 ml-3 transition-transform group-hover:translate-x-1" />
              </Button>

              <div className={`flex flex-wrap items-center justify-center gap-6 ${textMuted}`}>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-500" />
                  <span>Pagamento 100% seguro</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5" style={{ color: accentColor }} />
                  <span>Acesso imediato</span>
                </div>
              </div>
            </div>

            {/* Video Preview - Enhanced */}
            {config.hero.showVideo && heroImageUrl && (
              <div className="pt-12">
                <div className="relative max-w-4xl mx-auto">
                  {/* Glow Effect */}
                  <div 
                    className="absolute -inset-6 rounded-3xl blur-3xl opacity-25"
                    style={{ backgroundColor: primaryColor }}
                  />
                  
                  <div 
                    className={`relative aspect-video rounded-3xl overflow-hidden border-2 ${borderColor} shadow-2xl`}
                    style={{ backgroundColor: `hsl(${config.colors.background})` }}
                  >
                    <img
                      src={heroImageUrl}
                      alt={service.name}
                      className="w-full h-full object-cover"
                    />
                    <div className={`absolute inset-0 flex items-center justify-center ${bgOverlay} group cursor-pointer transition-all duration-300 hover:bg-black/50`}>
                      <div 
                        className="w-24 h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:scale-110"
                        style={{ 
                          background: 'white',
                          boxShadow: `0 15px 50px rgba(0,0,0,0.3)`,
                        }}
                      >
                        <Play className="w-10 h-10 md:w-12 md:h-12 text-gray-900 ml-1" fill="currentColor" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Benefits Section - Modern Grid */}
      {config.benefits.enabled && (
        <section className="py-24 md:py-32">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className={`text-3xl md:text-5xl font-bold ${textPrimary}`}>
                {config.benefits.title}
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {config.benefits.items.map((item, i) => (
                <div 
                  key={i} 
                  className={`group flex items-center gap-5 p-6 rounded-2xl border transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] ${borderColor}`}
                  style={{ backgroundColor: isLightTheme ? 'rgba(255,255,255,0.8)' : `hsl(${config.colors.background})` }}
                >
                  <div 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-transform duration-300 group-hover:scale-110"
                    style={{ background: `linear-gradient(135deg, ${primaryColor}30, ${primaryColor}10)` }}
                  >
                    <Check className="w-7 h-7" style={{ color: primaryColor }} />
                  </div>
                  <span className={`text-lg font-medium ${textPrimary}`}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Course Content - Elegant Cards */}
      <section className="py-24 md:py-32" style={{ backgroundColor: `${primaryColor}06` }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-5xl font-bold mb-5 ${textPrimary}`}>{config.content.sectionTitle}</h2>
            <p className={`text-xl max-w-2xl mx-auto ${textMuted}`}>{config.content.sectionSubtitle}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {modules.map((module, index) => (
              <div
                key={module.id}
                className={`group border ${borderColor} rounded-3xl p-7 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]`}
                style={{ backgroundColor: `hsl(${config.colors.background})` }}
              >
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 shadow-lg transition-transform duration-300 group-hover:scale-110"
                  style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}CC)` }}
                >
                  <span className="font-bold text-lg text-white">{index + 1}</span>
                </div>
                <h3 className={`font-bold text-xl mb-3 ${textPrimary}`}>{module.title}</h3>
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-4 h-4" style={{ color: primaryColor }} />
                  <span className={`text-sm font-medium ${textMuted}`}>{module.lessons_count} aulas</span>
                </div>
                {module.description && (
                  <p className={`text-sm leading-relaxed ${textSecondary} line-clamp-3`}>{module.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Premium Card */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4">
          <div 
            className={`max-w-3xl mx-auto rounded-[2.5rem] p-10 md:p-16 text-center border-2 ${borderColor} overflow-hidden relative`}
            style={{ 
              backgroundColor: `hsl(${config.colors.background})`,
            }}
          >
            {/* Background Gradient */}
            <div 
              className="absolute inset-0 opacity-50"
              style={{ 
                background: `radial-gradient(circle at 50% 0%, ${primaryColor}30, transparent 60%)` 
              }}
            />
            
            <div className="relative z-10">
              <div className="inline-flex mb-8">
                <Badge 
                  className="px-5 py-2 text-sm font-semibold"
                  style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Oferta especial
                </Badge>
              </div>

              <h2 className={`text-3xl md:text-4xl font-bold mb-5 ${textPrimary}`}>{config.cta.mainText}</h2>
              <p className={`text-xl mb-10 ${textSecondary}`}>{config.cta.subText}</p>
              
              <div className={`text-6xl md:text-7xl font-bold mb-10 ${textPrimary}`}>
                {formatPrice(service.price_cents)}
              </div>

              <Button
                size="lg"
                className="group font-bold text-xl px-14 py-8 text-white rounded-2xl shadow-2xl transition-all duration-300 hover:scale-[1.03] w-full sm:w-auto"
                style={{ 
                  background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}DD)`,
                  boxShadow: `0 25px 60px ${primaryColor}50`,
                }}
              >
                {config.cta.buttonText}
                <ArrowRight className="w-6 h-6 ml-3 transition-transform group-hover:translate-x-1" />
              </Button>

              {config.cta.urgencyText && (
                <p className="mt-8 text-lg font-semibold" style={{ color: accentColor }}>
                  ⚡ {config.cta.urgencyText}
                </p>
              )}

              {config.guarantee.enabled && (
                <div className={`mt-10 pt-8 border-t ${borderColor} flex items-center justify-center gap-3`}>
                  <Shield className="w-6 h-6 text-green-500" />
                  <span className={`font-medium ${textSecondary}`}>{config.guarantee.title}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Instructor Section - Elegant */}
      {config.instructor.showSection && profile && (
        <section className="py-24 md:py-32" style={{ backgroundColor: `${primaryColor}06` }}>
          <div className="container mx-auto px-4">
            <h2 className={`text-3xl md:text-5xl font-bold text-center mb-16 ${textPrimary}`}>
              {config.instructor.title}
            </h2>
            <div className="max-w-2xl mx-auto text-center">
              <div className="relative inline-block mb-8">
                <div 
                  className="absolute -inset-3 rounded-full blur-2xl opacity-30"
                  style={{ backgroundColor: primaryColor }}
                />
                <Avatar className="relative w-36 h-36 border-4 shadow-2xl" style={{ borderColor: primaryColor }}>
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback 
                    className="text-4xl font-bold"
                    style={{ 
                      background: `linear-gradient(135deg, ${primaryColor}40, ${primaryColor}20)`,
                      color: primaryColor 
                    }}
                  >
                    {getInitials(profile.full_name)}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              <h3 className={`text-3xl font-bold ${textPrimary}`}>{profile.full_name}</h3>
              {profile.specialty && (
                <p className={`mt-3 text-xl ${textMuted}`}>{profile.specialty}</p>
              )}
              {profile.crp && (
                <Badge variant="secondary" className="mt-4 px-4 py-1">CRP: {profile.crp}</Badge>
              )}
              {profile.bio && (
                <p className={`mt-8 text-lg leading-relaxed max-w-xl mx-auto ${textSecondary}`}>{profile.bio}</p>
              )}
              
              {/* Social Proof */}
              <div className="flex items-center justify-center gap-1 mt-6">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                ))}
                <span className={`ml-2 font-medium ${textPrimary}`}>5.0</span>
              </div>
            </div>
          </div>
        </section>
      )}

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

export default CenteredLayout;
