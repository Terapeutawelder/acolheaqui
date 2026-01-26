import { 
  Play, 
  BookOpen, 
  Award, 
  Check, 
  Shield,
  Sparkles,
  Users,
  ChevronDown,
  ChevronUp,
  Star,
  Clock,
  Infinity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
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

const ClassicLayout = ({ service, profile, modules, config, themeColors }: LayoutProps) => {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
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
  const heroImageUrl = config.images?.heroImage || config.images?.videoThumbnail || (service.product_config?.image_url as string) || null;

  return (
    <>
      {/* Hero Section - Premium Split Layout */}
      <section className="relative py-16 md:py-24 lg:py-32 overflow-hidden">
        {/* Background Effects */}
        <div 
          className="absolute inset-0"
          style={{ 
            background: `radial-gradient(ellipse 80% 50% at 50% -20%, ${primaryColor}35, transparent),
                        radial-gradient(ellipse 60% 40% at 100% 0%, ${accentColor}20, transparent)` 
          }}
        />
        <div 
          className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[120px] opacity-20"
          style={{ backgroundColor: primaryColor }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <Badge 
                className="px-5 py-2 text-sm font-medium backdrop-blur-sm border shadow-lg"
                style={{ 
                  backgroundColor: `${primaryColor}20`,
                  color: primaryColor,
                  borderColor: `${primaryColor}40`,
                }}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {config.hero.badge}
              </Badge>

              <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight ${textPrimary}`}>
                {config.hero.title || service.name}
              </h1>

              {(config.hero.subtitle || service.description) && (
                <p className={`text-lg md:text-xl leading-relaxed ${textSecondary} max-w-xl`}>
                  {config.hero.subtitle || service.description}
                </p>
              )}

              {/* Stats Row - Premium Design */}
              {config.layout?.showStats !== false && (
                <div className="flex flex-wrap gap-4 md:gap-6 py-2">
                  {[
                    { icon: BookOpen, value: `${totalLessons}`, label: 'Aulas' },
                    { icon: Users, value: `${modules.length}`, label: 'Módulos' },
                    { icon: Award, value: 'Incluso', label: 'Certificado' },
                    { icon: Infinity, value: 'Vitalício', label: 'Acesso' },
                  ].map((stat, i) => (
                    <div 
                      key={i}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-sm ${borderColor}`}
                      style={{ backgroundColor: isLightTheme ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.3)' }}
                    >
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${primaryColor}20` }}
                      >
                        <stat.icon className="w-5 h-5" style={{ color: primaryColor }} />
                      </div>
                      <div>
                        <p className={`font-bold ${textPrimary}`}>{stat.value}</p>
                        <p className={`text-xs ${textMuted}`}>{stat.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* CTA Desktop */}
              <div className="hidden lg:flex flex-col gap-4 pt-4">
                <Button
                  size="lg"
                  className="font-bold text-lg px-10 py-7 text-white rounded-xl shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-3xl"
                  style={{ 
                    backgroundColor: primaryColor,
                    boxShadow: `0 20px 50px ${primaryColor}50`,
                  }}
                >
                  {config.hero.ctaText} por {formatPrice(service.price_cents)}
                </Button>
                <div className={`flex items-center gap-6 ${textMuted}`}>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Pagamento 100% seguro</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Acesso imediato</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Course Preview - Enhanced */}
            {config.hero.showVideo && (
              <div className="relative">
                {/* Glow Effect */}
                <div 
                  className="absolute -inset-4 rounded-3xl blur-2xl opacity-30"
                  style={{ backgroundColor: primaryColor }}
                />
                
                <div 
                  className={`relative aspect-video rounded-2xl lg:rounded-3xl overflow-hidden border-2 ${borderColor} shadow-2xl`}
                  style={{ backgroundColor: `hsl(${config.colors.background})` }}
                >
                  {heroImageUrl ? (
                    <img
                      src={heroImageUrl}
                      alt={service.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div 
                      className="w-full h-full flex items-center justify-center"
                      style={{ 
                        background: `linear-gradient(135deg, ${primaryColor}30, ${accentColor}20)` 
                      }}
                    >
                      <Play className="w-24 h-24 text-white/30" />
                    </div>
                  )}

                  <div className={`absolute inset-0 flex items-center justify-center ${bgOverlay} group cursor-pointer transition-all duration-300 hover:bg-black/50`}>
                    <div 
                      className="w-20 h-20 lg:w-24 lg:h-24 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:scale-110"
                      style={{ 
                        backgroundColor: 'white',
                        boxShadow: `0 10px 40px rgba(0,0,0,0.3)`,
                      }}
                    >
                      <Play className="w-8 h-8 lg:w-10 lg:h-10 text-gray-900 ml-1" fill="currentColor" />
                    </div>
                  </div>
                </div>

                {/* Floating Badge - Enhanced */}
                {config.layout?.showFloatingBadge !== false && (
                  <div 
                    className={`absolute -bottom-6 -left-6 border ${borderColor} rounded-2xl p-5 shadow-2xl hidden md:flex items-center gap-4 backdrop-blur-sm`}
                    style={{ backgroundColor: isLightTheme ? 'rgba(255,255,255,0.95)' : `hsl(${config.colors.background} / 0.95)` }}
                  >
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}CC)` }}
                    >
                      <Check className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className={`font-bold text-lg ${textPrimary}`}>{modules.length} Módulos</p>
                      <p className={`text-sm ${textMuted}`}>Conteúdo completo e atualizado</p>
                    </div>
                  </div>
                )}

                {/* Rating Badge */}
                <div 
                  className={`absolute -top-4 -right-4 border ${borderColor} rounded-xl px-4 py-2 shadow-xl hidden md:flex items-center gap-2 backdrop-blur-sm`}
                  style={{ backgroundColor: isLightTheme ? 'rgba(255,255,255,0.95)' : `hsl(${config.colors.background} / 0.95)` }}
                >
                  <div className="flex">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                  <span className={`font-bold text-sm ${textPrimary}`}>5.0</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Benefits Section - Enhanced Cards */}
      {config.benefits.enabled && (
        <section className="py-20 md:py-28" style={{ backgroundColor: `${primaryColor}08` }}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-14">
              <h2 className={`text-3xl md:text-4xl font-bold ${textPrimary}`}>
                {config.benefits.title}
              </h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
              {config.benefits.items.map((item, i) => (
                <div 
                  key={i} 
                  className={`group flex items-start gap-4 p-6 rounded-2xl border transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${borderColor}`}
                  style={{ backgroundColor: `hsl(${config.colors.background})` }}
                >
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110"
                    style={{ 
                      background: `linear-gradient(135deg, ${primaryColor}30, ${primaryColor}10)`,
                    }}
                  >
                    <Check className="w-6 h-6" style={{ color: primaryColor }} />
                  </div>
                  <span className={`font-medium leading-relaxed ${textPrimary}`}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Course Content - Premium Accordion */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
            {/* Modules List */}
            <div className="lg:col-span-2 space-y-6">
              <div className="mb-10">
                <h2 className={`text-3xl md:text-4xl font-bold mb-3 ${textPrimary}`}>{config.content.sectionTitle}</h2>
                <p className={`text-lg ${textMuted}`}>{config.content.sectionSubtitle}</p>
              </div>

              {modules.length === 0 ? (
                <div 
                  className={`text-center py-16 rounded-2xl border ${borderColor}`}
                  style={{ backgroundColor: `${primaryColor}05` }}
                >
                  <BookOpen className={`w-16 h-16 mx-auto mb-6 ${textMuted}`} />
                  <p className={`text-lg ${textMuted}`}>Conteúdo em breve disponível</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {modules.map((module, index) => (
                    <div
                      key={module.id}
                      className={`border ${borderColor} rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg`}
                      style={{ backgroundColor: `hsl(${config.colors.background})` }}
                    >
                      <button
                        onClick={() => toggleModule(module.id)}
                        className="w-full flex items-center justify-between p-6 transition-all duration-200"
                        style={{ 
                          backgroundColor: expandedModules.has(module.id) ? `${primaryColor}10` : 'transparent' 
                        }}
                      >
                        <div className="flex items-center gap-5">
                          <div 
                            className="w-14 h-14 rounded-xl flex items-center justify-center font-bold text-lg text-white shadow-lg"
                            style={{ 
                              background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}CC)`,
                            }}
                          >
                            {index + 1}
                          </div>
                          <div className="text-left">
                            <h3 className={`font-bold text-lg ${textPrimary}`}>{module.title}</h3>
                            <p className={`text-sm mt-1 ${textMuted}`}>
                              {module.lessons_count} aulas disponíveis
                            </p>
                          </div>
                        </div>
                        <div 
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${borderColor}`}
                          style={{ backgroundColor: expandedModules.has(module.id) ? `${primaryColor}20` : 'transparent' }}
                        >
                          {expandedModules.has(module.id) ? (
                            <ChevronUp className="w-5 h-5" style={{ color: primaryColor }} />
                          ) : (
                            <ChevronDown className={`w-5 h-5 ${textMuted}`} />
                          )}
                        </div>
                      </button>

                      {expandedModules.has(module.id) && module.description && (
                        <div className={`px-6 pb-6 border-t ${borderColor}`}>
                          <p className={`pt-5 leading-relaxed ${textSecondary}`}>{module.description}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sticky Purchase Card - Premium */}
            <div className="lg:col-span-1">
              <div 
                className={`sticky top-8 border-2 ${borderColor} rounded-3xl overflow-hidden shadow-2xl`}
                style={{ backgroundColor: `hsl(${config.colors.background})` }}
              >
                {/* Card Header */}
                <div 
                  className="p-6 text-center"
                  style={{ background: `linear-gradient(135deg, ${primaryColor}15, ${primaryColor}05)` }}
                >
                  <p className={`text-sm font-medium mb-2 ${textMuted}`}>Investimento único</p>
                  <p className={`text-5xl font-bold ${textPrimary}`}>{formatPrice(service.price_cents)}</p>
                  <p className={`text-sm mt-2 ${textMuted}`}>{config.cta.subText}</p>
                </div>

                <div className="p-6 space-y-5">
                  <Button
                    className="w-full py-7 text-lg font-bold text-white rounded-xl shadow-xl transition-all duration-300 hover:scale-[1.02]"
                    style={{ 
                      backgroundColor: primaryColor,
                      boxShadow: `0 15px 40px ${primaryColor}40`,
                    }}
                  >
                    {config.cta.buttonText}
                  </Button>

                  {config.cta.urgencyText && (
                    <p className="text-center font-medium" style={{ color: accentColor }}>
                      ⚡ {config.cta.urgencyText}
                    </p>
                  )}

                  {/* What's Included */}
                  <div className={`pt-5 border-t space-y-3 ${borderColor}`}>
                    {[
                      { icon: BookOpen, text: `${totalLessons} aulas em vídeo` },
                      { icon: Award, text: 'Certificado de conclusão' },
                      { icon: Infinity, text: 'Acesso vitalício' },
                      { icon: Users, text: 'Comunidade exclusiva' },
                    ].map((item, i) => (
                      <div key={i} className={`flex items-center gap-3 ${textSecondary}`}>
                        <item.icon className="w-5 h-5" style={{ color: primaryColor }} />
                        <span className="text-sm">{item.text}</span>
                      </div>
                    ))}
                  </div>

                  {/* Guarantee */}
                  {config.guarantee.enabled && (
                    <div 
                      className={`p-5 rounded-xl border ${borderColor}`}
                      style={{ backgroundColor: `${primaryColor}05` }}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Shield className="w-6 h-6 text-green-500" />
                        <span className={`font-bold ${textPrimary}`}>{config.guarantee.title}</span>
                      </div>
                      <p className={`text-sm ${textMuted}`}>{config.guarantee.description}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Instructor Section - Enhanced */}
      {config.instructor.showSection && profile && (
        <section className="py-20 md:py-28" style={{ backgroundColor: `${primaryColor}08` }}>
          <div className="container mx-auto px-4">
            <h2 className={`text-3xl md:text-4xl font-bold text-center mb-14 ${textPrimary}`}>
              {config.instructor.title}
            </h2>
            <div className="max-w-3xl mx-auto">
              <div 
                className={`p-8 md:p-10 rounded-3xl border ${borderColor} shadow-xl`}
                style={{ backgroundColor: `hsl(${config.colors.background})` }}
              >
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="relative">
                    <div 
                      className="absolute -inset-2 rounded-full blur-xl opacity-30"
                      style={{ backgroundColor: primaryColor }}
                    />
                    <Avatar className="relative w-32 h-32 border-4 shadow-xl" style={{ borderColor: primaryColor }}>
                      <AvatarImage src={profile.avatar_url || undefined} />
                      <AvatarFallback 
                        className="text-3xl font-bold"
                        style={{ 
                          background: `linear-gradient(135deg, ${primaryColor}40, ${primaryColor}20)`,
                          color: primaryColor 
                        }}
                      >
                        {getInitials(profile.full_name)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="text-center md:text-left flex-1">
                    <h3 className={`text-2xl font-bold ${textPrimary}`}>{profile.full_name}</h3>
                    {profile.specialty && (
                      <p className={`mt-2 text-lg ${textMuted}`}>{profile.specialty}</p>
                    )}
                    {profile.crp && (
                      <Badge variant="secondary" className="mt-3">CRP: {profile.crp}</Badge>
                    )}
                    {profile.bio && (
                      <p className={`mt-5 leading-relaxed ${textSecondary}`}>{profile.bio}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Mobile CTA - Enhanced */}
      <div 
        className={`lg:hidden fixed bottom-0 left-0 right-0 p-4 border-t backdrop-blur-xl ${borderColor}`}
        style={{ backgroundColor: isLightTheme ? 'rgba(255,255,255,0.95)' : `hsl(${config.colors.background} / 0.95)` }}
      >
        <Button
          className="w-full py-6 text-lg font-bold text-white rounded-xl shadow-xl"
          style={{ 
            backgroundColor: primaryColor,
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

export default ClassicLayout;
