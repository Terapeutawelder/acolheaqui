import { 
  Play, 
  BookOpen, 
  Award, 
  Check, 
  Shield,
  Users,
  Zap,
  Star,
  ArrowRight,
  Sparkles,
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
  const { primaryColor, accentColor, textPrimary, textSecondary, textMuted, borderColor, isLightTheme } = themeColors;

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

  return (
    <>
      {/* Hero Section - BOLD & Dramatic */}
      <section className="relative min-h-screen flex items-center overflow-hidden py-20">
        {/* Background Gradients - More Dynamic */}
        <div 
          className="absolute inset-0"
          style={{ 
            background: `radial-gradient(circle at 20% 20%, ${primaryColor}50 0%, transparent 40%), 
                        radial-gradient(circle at 80% 80%, ${accentColor}40 0%, transparent 40%),
                        radial-gradient(circle at 50% 50%, ${primaryColor}20 0%, transparent 60%)` 
          }}
        />
        
        {/* Animated Blobs */}
        <div 
          className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full blur-[150px] opacity-30"
          style={{ backgroundColor: primaryColor }}
        />
        <div 
          className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full blur-[120px] opacity-25"
          style={{ backgroundColor: accentColor }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto text-center">
            {/* Animated Badge */}
            <div className="inline-flex mb-10">
              <Badge 
                className="px-8 py-4 text-lg font-bold shadow-2xl border-0"
                style={{ 
                  background: `linear-gradient(135deg, ${accentColor}, ${accentColor}DD)`,
                  color: 'white',
                  boxShadow: `0 15px 40px ${accentColor}50`,
                }}
              >
                <Zap className="w-6 h-6 mr-3" />
                {config.hero.badge}
              </Badge>
            </div>

            {/* Giant Title */}
            <h1 className={`text-5xl md:text-7xl lg:text-[8rem] font-black leading-[0.9] tracking-tight mb-10 ${textPrimary}`}>
              {config.hero.title || service.name}
            </h1>

            {(config.hero.subtitle || service.description) && (
              <p className={`text-xl md:text-3xl leading-relaxed max-w-4xl mx-auto mb-14 font-medium ${textSecondary}`}>
                {config.hero.subtitle || service.description}
              </p>
            )}

            {/* Stats Row - Bold Numbers */}
            <div className="flex flex-wrap justify-center gap-16 mb-16">
              {[
                { value: `${totalLessons}+`, label: 'AULAS' },
                { value: `${modules.length}`, label: 'MÓDULOS' },
                { value: '100%', label: 'ONLINE' },
              ].map((stat, i) => (
                <div key={i} className="text-center group cursor-default">
                  <p 
                    className={`text-6xl md:text-8xl font-black transition-transform duration-300 group-hover:scale-110 ${textPrimary}`}
                    style={{ 
                      textShadow: `0 10px 40px ${primaryColor}40`,
                    }}
                  >
                    {stat.value}
                  </p>
                  <p className={`text-sm md:text-base uppercase tracking-[0.3em] mt-3 font-bold ${textMuted}`}>{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Giant CTA */}
            <Button
              size="lg"
              className="group font-black text-2xl md:text-3xl px-16 md:px-24 py-10 md:py-14 text-white shadow-2xl transition-all duration-300 hover:scale-105"
              style={{ 
                background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}DD)`,
                boxShadow: `0 30px 80px ${primaryColor}60`,
                borderRadius: '2rem',
              }}
            >
              {config.hero.ctaText} • {formatPrice(service.price_cents)}
              <ArrowRight className="w-8 h-8 ml-4 transition-transform group-hover:translate-x-2" />
            </Button>

            <div className={`flex flex-wrap items-center justify-center gap-10 mt-12 ${textMuted}`}>
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-green-500" />
                <span className="font-bold">Pagamento seguro</span>
              </div>
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6" style={{ color: accentColor }} />
                <span className="font-bold">Acesso imediato</span>
              </div>
              {config.guarantee.enabled && (
                <div className="flex items-center gap-3">
                  <Star className="w-6 h-6 text-yellow-500" />
                  <span className="font-bold">{config.guarantee.days} dias de garantia</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section - Bold Cards */}
      {config.benefits.enabled && (
        <section className="py-28 md:py-40" style={{ backgroundColor: `${primaryColor}08` }}>
          <div className="container mx-auto px-4">
            <h2 className={`text-4xl md:text-6xl lg:text-7xl font-black text-center mb-20 ${textPrimary}`}>
              {config.benefits.title}
            </h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {config.benefits.items.map((item, i) => (
                <div 
                  key={i} 
                  className={`group p-10 rounded-[2rem] border-2 transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl ${borderColor}`}
                  style={{ backgroundColor: `hsl(${config.colors.background})` }}
                >
                  <div 
                    className="w-20 h-20 rounded-2xl flex items-center justify-center mb-8 shadow-xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                    style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}CC)` }}
                  >
                    <Check className="w-10 h-10 text-white" />
                  </div>
                  <p className={`text-xl md:text-2xl font-bold ${textPrimary}`}>{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Course Content - Bold Cards */}
      <section className="py-28 md:py-40">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className={`text-4xl md:text-6xl lg:text-7xl font-black mb-6 ${textPrimary}`}>{config.content.sectionTitle}</h2>
            <p className={`text-xl md:text-2xl ${textMuted}`}>{config.content.sectionSubtitle}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {modules.map((module, index) => (
              <div
                key={module.id}
                className={`group relative border-2 ${borderColor} rounded-[2rem] p-10 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]`}
                style={{ backgroundColor: `hsl(${config.colors.background})` }}
              >
                {/* Module number badge - Floating */}
                <div 
                  className="absolute top-8 right-8 w-16 h-16 rounded-full flex items-center justify-center font-black text-xl text-white shadow-xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12"
                  style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}CC)` }}
                >
                  {index + 1}
                </div>

                <BookOpen className="w-12 h-12 mb-6" style={{ color: primaryColor }} />
                <h3 className={`text-xl md:text-2xl font-bold mb-4 pr-16 ${textPrimary}`}>{module.title}</h3>
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="secondary" className="font-bold">
                    {module.lessons_count} aulas
                  </Badge>
                </div>
                {module.description && (
                  <p className={`leading-relaxed ${textSecondary} line-clamp-3`}>{module.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Instructor Section - Bold */}
      {config.instructor.showSection && profile && (
        <section className="py-28 md:py-40" style={{ backgroundColor: `${primaryColor}08` }}>
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-16">
              <div className="relative">
                <div 
                  className="absolute -inset-4 rounded-full blur-2xl opacity-40"
                  style={{ backgroundColor: primaryColor }}
                />
                <Avatar className="relative w-56 h-56 border-8 shadow-2xl" style={{ borderColor: primaryColor }}>
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback 
                    className="text-6xl font-black"
                    style={{ 
                      background: `linear-gradient(135deg, ${primaryColor}40, ${primaryColor}20)`,
                      color: primaryColor 
                    }}
                  >
                    {getInitials(profile.full_name)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="text-center md:text-left">
                <p className={`text-sm uppercase tracking-[0.3em] mb-4 font-bold ${textMuted}`}>{config.instructor.title}</p>
                <h3 className={`text-4xl md:text-5xl font-black ${textPrimary}`}>{profile.full_name}</h3>
                {profile.specialty && (
                  <p className={`mt-4 text-xl md:text-2xl font-medium ${textMuted}`}>{profile.specialty}</p>
                )}
                {profile.bio && (
                  <p className={`mt-8 text-lg md:text-xl leading-relaxed ${textSecondary}`}>{profile.bio}</p>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Final CTA Section - Massive Gradient Card */}
      <section className="py-28 md:py-40">
        <div className="container mx-auto px-4">
          <div 
            className="max-w-5xl mx-auto rounded-[3rem] p-14 md:p-20 text-center overflow-hidden relative"
            style={{ 
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}CC 50%, ${accentColor}99 100%)`,
              boxShadow: `0 40px 100px ${primaryColor}50`,
            }}
          >
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-[100px] opacity-30 bg-white" />
            <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-[80px] opacity-20 bg-white" />
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-black text-white mb-8">{config.cta.mainText}</h2>
              <p className="text-xl md:text-2xl text-white/80 mb-14 font-medium">{config.cta.subText}</p>
              
              <div className="text-7xl md:text-9xl font-black text-white mb-14">
                {formatPrice(service.price_cents)}
              </div>

              <Button
                size="lg"
                className="group font-black text-2xl md:text-3xl px-16 md:px-20 py-10 md:py-12 shadow-2xl transition-all duration-300 hover:scale-105"
                style={{ 
                  backgroundColor: 'white',
                  color: primaryColor,
                  borderRadius: '2rem',
                }}
              >
                {config.cta.buttonText}
                <ArrowRight className="w-8 h-8 ml-4 transition-transform group-hover:translate-x-2" />
              </Button>

              {config.cta.urgencyText && (
                <p className="mt-10 text-xl md:text-2xl font-bold text-white">
                  ⚡ {config.cta.urgencyText}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Bottom CTA - Premium */}
      <div 
        className={`fixed bottom-0 left-0 right-0 p-4 border-t backdrop-blur-xl ${borderColor}`}
        style={{ backgroundColor: isLightTheme ? 'rgba(255,255,255,0.95)' : `hsl(${config.colors.background} / 0.95)` }}
      >
        <div className="container mx-auto flex items-center justify-between gap-4">
          <div className="hidden sm:block">
            <p className={`font-bold text-lg ${textPrimary}`}>{service.name}</p>
            <p className={`text-sm ${textMuted}`}>{config.cta.subText}</p>
          </div>
          <Button
            className="font-bold text-lg py-6 px-10 text-white flex-1 sm:flex-none shadow-xl"
            style={{ 
              background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}DD)`,
              borderRadius: '1rem',
            }}
          >
            {config.cta.buttonText} • {formatPrice(service.price_cents)}
          </Button>
        </div>
      </div>

      {/* Bottom Spacer */}
      <div className="h-24" />
    </>
  );
};

export default BoldLayout;
