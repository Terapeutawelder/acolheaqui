import { 
  Check, 
  Shield,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Star,
  ArrowRight,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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

const SplitLayout = ({ service, profile, modules, config, themeColors }: LayoutProps) => {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
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
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Fixed Left Side - Premium Image/Video */}
      <div 
        className="lg:fixed lg:left-0 lg:top-0 lg:bottom-0 lg:w-1/2 h-[60vh] lg:h-auto relative group"
      >
        {heroImageUrl ? (
          <>
            <img
              src={heroImageUrl}
              alt={service.name}
              className="w-full h-full object-cover"
            />
            {/* Gradient Overlay */}
            <div 
              className="absolute inset-0"
              style={{ 
                background: `linear-gradient(to right, ${primaryColor}20, transparent),
                            linear-gradient(to top, rgba(0,0,0,0.4), transparent 50%)` 
              }}
            />
            {/* Play Button */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer">
              <div 
                className="w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-transform duration-300 hover:scale-110"
                style={{ 
                  backgroundColor: 'white',
                  boxShadow: `0 20px 50px rgba(0,0,0,0.3)`,
                }}
              >
                <Play className="w-10 h-10 text-gray-900 ml-1" fill="currentColor" />
              </div>
            </div>
          </>
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center"
            style={{ 
              background: `linear-gradient(135deg, ${primaryColor}30, ${primaryColor}10, ${accentColor}10)` 
            }}
          >
            <div 
              className="w-40 h-40 rounded-full flex items-center justify-center shadow-2xl"
              style={{ 
                background: `linear-gradient(135deg, ${primaryColor}40, ${primaryColor}20)`,
              }}
            >
              <BookOpen className="w-20 h-20" style={{ color: primaryColor }} />
            </div>
          </div>
        )}

        {/* Floating Stats - Bottom Left */}
        <div className="absolute bottom-8 left-8 right-8 hidden lg:flex gap-4">
          {[
            { value: `${totalLessons}+`, label: 'Aulas' },
            { value: `${modules.length}`, label: 'Módulos' },
          ].map((stat, i) => (
            <div 
              key={i}
              className="px-6 py-4 rounded-2xl backdrop-blur-xl border border-white/20"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
            >
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-sm text-white/80">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Side - Scrollable Content */}
      <div className="lg:ml-[50%] lg:w-1/2 min-h-screen">
        <div className="p-8 md:p-12 lg:p-16 space-y-12">
          {/* Header - Premium */}
          <div className="space-y-8">
            <Badge 
              className="px-5 py-2 font-semibold"
              style={{ 
                backgroundColor: `${primaryColor}20`,
                color: primaryColor,
              }}
            >
              {config.hero.badge}
            </Badge>

            <h1 className={`text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.1] ${textPrimary}`}>
              {config.hero.title || service.name}
            </h1>

            {(config.hero.subtitle || service.description) && (
              <p className={`text-lg md:text-xl leading-relaxed ${textSecondary}`}>
                {config.hero.subtitle || service.description}
              </p>
            )}

            {/* Price - Highlighted */}
            <div 
              className={`inline-flex items-baseline gap-2 px-6 py-4 rounded-2xl border ${borderColor}`}
              style={{ backgroundColor: `${primaryColor}08` }}
            >
              <span className={`text-4xl md:text-5xl font-bold ${textPrimary}`}>
                {formatPrice(service.price_cents)}
              </span>
              <span className={`text-sm ${textMuted}`}>/ acesso vitalício</span>
            </div>

            <Button
              size="lg"
              className="group w-full font-bold text-lg py-7 text-white rounded-xl shadow-xl transition-all duration-300 hover:shadow-2xl"
              style={{ 
                background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}DD)`,
                boxShadow: `0 15px 40px ${primaryColor}40`,
              }}
            >
              {config.hero.ctaText}
              <ArrowRight className="w-5 h-5 ml-3 transition-transform group-hover:translate-x-1" />
            </Button>

            <div className={`flex flex-wrap items-center gap-6 text-sm ${textMuted}`}>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-500" />
                <span>Compra 100% segura</span>
              </div>
              {config.guarantee.enabled && (
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5" style={{ color: primaryColor }} />
                  <span>{config.guarantee.days} dias de garantia</span>
                </div>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className={`border-t ${borderColor}`} />

          {/* Benefits - Enhanced */}
          {config.benefits.enabled && (
            <div className="space-y-6">
              <h2 className={`text-xl font-bold ${textPrimary}`}>{config.benefits.title}</h2>
              <ul className="grid gap-4">
                {config.benefits.items.map((item, i) => (
                  <li key={i} className={`group flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 hover:shadow-lg ${borderColor}`}
                    style={{ backgroundColor: `${primaryColor}05` }}
                  >
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110"
                      style={{ background: `linear-gradient(135deg, ${primaryColor}30, ${primaryColor}15)` }}
                    >
                      <Check className="w-5 h-5" style={{ color: primaryColor }} />
                    </div>
                    <span className={`font-medium ${textPrimary}`}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Divider */}
          <div className={`border-t ${borderColor}`} />

          {/* Course Content - Premium Accordion */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className={`text-xl font-bold ${textPrimary}`}>{config.content.sectionTitle}</h2>
              <span className={`text-sm font-medium px-4 py-2 rounded-full ${textMuted}`}
                style={{ backgroundColor: `${primaryColor}10` }}
              >
                {modules.length} módulos • {totalLessons} aulas
              </span>
            </div>

            <div className="space-y-3">
              {modules.map((module, index) => (
                <div
                  key={module.id}
                  className={`border ${borderColor} rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg`}
                  style={{ backgroundColor: `hsl(${config.colors.background})` }}
                >
                  <button
                    onClick={() => toggleModule(module.id)}
                    className={`w-full flex items-center justify-between p-5 text-left transition-all duration-200`}
                    style={{ 
                      backgroundColor: expandedModules.has(module.id) ? `${primaryColor}10` : 'transparent' 
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <span 
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-lg"
                        style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}CC)` }}
                      >
                        {index + 1}
                      </span>
                      <div>
                        <p className={`font-semibold ${textPrimary}`}>{module.title}</p>
                        <p className={`text-sm ${textMuted}`}>{module.lessons_count} aulas</p>
                      </div>
                    </div>
                    <div 
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200`}
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
                    <div className={`px-5 pb-5 border-t ${borderColor}`}>
                      <p className={`pt-4 leading-relaxed ${textSecondary}`}>{module.description}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className={`border-t ${borderColor}`} />

          {/* Instructor - Premium Card */}
          {config.instructor.showSection && profile && (
            <div 
              className={`p-8 rounded-2xl border ${borderColor}`}
              style={{ background: `linear-gradient(135deg, ${primaryColor}10, ${primaryColor}05)` }}
            >
              <h2 className={`text-xl font-bold mb-6 ${textPrimary}`}>{config.instructor.title}</h2>
              <div className="flex items-start gap-5">
                <div className="relative">
                  <div 
                    className="absolute -inset-1 rounded-full blur-lg opacity-30"
                    style={{ backgroundColor: primaryColor }}
                  />
                  <Avatar className="relative w-20 h-20 shrink-0 border-4 shadow-xl" style={{ borderColor: primaryColor }}>
                    <AvatarImage src={profile.avatar_url || undefined} />
                    <AvatarFallback 
                      className="text-xl font-bold"
                      style={{ 
                        background: `linear-gradient(135deg, ${primaryColor}40, ${primaryColor}20)`,
                        color: primaryColor 
                      }}
                    >
                      {getInitials(profile.full_name)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1">
                  <p className={`font-bold text-xl ${textPrimary}`}>{profile.full_name}</p>
                  {profile.specialty && (
                    <p className={`text-sm mt-1 ${textMuted}`}>{profile.specialty}</p>
                  )}
                  <div className="flex items-center gap-1 mt-2">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                  {profile.bio && (
                    <p className={`text-sm mt-4 leading-relaxed ${textSecondary}`}>{profile.bio}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Guarantee - Premium */}
          {config.guarantee.enabled && (
            <div 
              className={`p-8 rounded-2xl border-2 border-green-500/30`}
              style={{ backgroundColor: 'rgba(34, 197, 94, 0.08)' }}
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-green-500" />
                </div>
                <span className={`font-bold text-xl ${textPrimary}`}>{config.guarantee.title}</span>
              </div>
              <p className={`leading-relaxed ${textSecondary}`}>{config.guarantee.description}</p>
            </div>
          )}

          {/* Final CTA */}
          <div className="space-y-4">
            <Button
              size="lg"
              className="group w-full font-bold text-lg py-7 text-white rounded-xl shadow-xl transition-all duration-300 hover:shadow-2xl"
              style={{ 
                background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}DD)`,
                boxShadow: `0 15px 40px ${primaryColor}40`,
              }}
            >
              {config.cta.buttonText} • {formatPrice(service.price_cents)}
              <ArrowRight className="w-5 h-5 ml-3 transition-transform group-hover:translate-x-1" />
            </Button>
            {config.cta.urgencyText && (
              <p className={`text-center font-medium ${textMuted}`}>
                ⚡ {config.cta.urgencyText}
              </p>
            )}
          </div>

          {/* Bottom Spacer */}
          <div className="h-8" />
        </div>
      </div>

      {/* Mobile CTA - Overlay */}
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
    </div>
  );
};

export default SplitLayout;
