import { 
  Check, 
  Shield,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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

const SplitLayout = ({ service, profile, modules, config, themeColors }: LayoutProps) => {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const { primaryColor, textPrimary, textSecondary, textMuted, borderColor } = themeColors;

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
      {/* Fixed Left Side - Image */}
      <div 
        className="lg:fixed lg:left-0 lg:top-0 lg:bottom-0 lg:w-1/2 h-[50vh] lg:h-auto"
        style={{ 
          backgroundColor: `${primaryColor}20`,
        }}
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
              background: `linear-gradient(135deg, ${primaryColor}40, ${primaryColor}10)` 
            }}
          >
            <div 
              className="w-32 h-32 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${primaryColor}30` }}
            >
              <BookOpen className="w-16 h-16" style={{ color: primaryColor }} />
            </div>
          </div>
        )}
      </div>

      {/* Right Side - Scrollable Content */}
      <div className="lg:ml-[50%] lg:w-1/2 min-h-screen">
        <div className="p-8 md:p-12 lg:p-16 space-y-12">
          {/* Header */}
          <div className="space-y-6">
            <p className={`text-sm uppercase tracking-widest ${textMuted}`}>
              {config.hero.badge}
            </p>

            <h1 className={`text-3xl md:text-4xl font-bold leading-tight ${textPrimary}`}>
              {config.hero.title || service.name}
            </h1>

            {(config.hero.subtitle || service.description) && (
              <p className={`text-lg leading-relaxed ${textSecondary}`}>
                {config.hero.subtitle || service.description}
              </p>
            )}

            <div className={`text-4xl font-bold ${textPrimary}`}>
              {formatPrice(service.price_cents)}
            </div>

            <Button
              size="lg"
              className="w-full font-bold text-lg py-6 text-white"
              style={{ backgroundColor: primaryColor }}
            >
              {config.hero.ctaText}
            </Button>

            <div className={`flex items-center justify-center gap-4 text-sm ${textMuted}`}>
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4" />
                Compra segura
              </div>
              {config.guarantee.enabled && (
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  {config.guarantee.days} dias de garantia
                </div>
              )}
            </div>
          </div>

          {/* Benefits */}
          {config.benefits.enabled && (
            <div className={`space-y-4 pt-8 border-t ${borderColor}`}>
              <h2 className={`text-lg font-bold ${textPrimary}`}>{config.benefits.title}</h2>
              <ul className="space-y-3">
                {config.benefits.items.map((item, i) => (
                  <li key={i} className={`flex items-center gap-3 ${textSecondary}`}>
                    <Check className="w-5 h-5 shrink-0" style={{ color: primaryColor }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Course Content */}
          <div className={`space-y-4 pt-8 border-t ${borderColor}`}>
            <div className="flex items-center justify-between">
              <h2 className={`text-lg font-bold ${textPrimary}`}>{config.content.sectionTitle}</h2>
              <span className={`text-sm ${textMuted}`}>
                {modules.length} módulos • {totalLessons} aulas
              </span>
            </div>

            <div className="space-y-2">
              {modules.map((module, index) => (
                <div
                  key={module.id}
                  className={`border ${borderColor} rounded-lg overflow-hidden`}
                >
                  <button
                    onClick={() => toggleModule(module.id)}
                    className={`w-full flex items-center justify-between p-4 text-left transition-colors hover:bg-muted/50`}
                  >
                    <div className="flex items-center gap-3">
                      <span 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                        style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
                      >
                        {index + 1}
                      </span>
                      <div>
                        <p className={`font-medium ${textPrimary}`}>{module.title}</p>
                        <p className={`text-xs ${textMuted}`}>{module.lessons_count} aulas</p>
                      </div>
                    </div>
                    {expandedModules.has(module.id) ? (
                      <ChevronUp className={`w-5 h-5 ${textMuted}`} />
                    ) : (
                      <ChevronDown className={`w-5 h-5 ${textMuted}`} />
                    )}
                  </button>

                  {expandedModules.has(module.id) && module.description && (
                    <div className={`px-4 pb-4 border-t ${borderColor}`}>
                      <p className={`text-sm pt-3 ${textMuted}`}>{module.description}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Instructor */}
          {config.instructor.showSection && profile && (
            <div className={`pt-8 border-t ${borderColor}`}>
              <h2 className={`text-lg font-bold mb-6 ${textPrimary}`}>{config.instructor.title}</h2>
              <div className="flex items-start gap-4">
                <Avatar className="w-16 h-16 shrink-0">
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}>
                    {getInitials(profile.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className={`font-bold ${textPrimary}`}>{profile.full_name}</p>
                  {profile.specialty && (
                    <p className={`text-sm ${textMuted}`}>{profile.specialty}</p>
                  )}
                  {profile.bio && (
                    <p className={`text-sm mt-2 ${textSecondary}`}>{profile.bio}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Guarantee */}
          {config.guarantee.enabled && (
            <div 
              className={`p-6 rounded-xl border ${borderColor}`}
              style={{ backgroundColor: `${primaryColor}08` }}
            >
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-6 h-6 text-green-500" />
                <span className={`font-bold ${textPrimary}`}>{config.guarantee.title}</span>
              </div>
              <p className={`text-sm ${textMuted}`}>{config.guarantee.description}</p>
            </div>
          )}

          {/* Final CTA */}
          <div className={`pt-8 border-t ${borderColor}`}>
            <Button
              size="lg"
              className="w-full font-bold text-lg py-6 text-white"
              style={{ backgroundColor: primaryColor }}
            >
              {config.cta.buttonText} • {formatPrice(service.price_cents)}
            </Button>
            {config.cta.urgencyText && (
              <p className={`text-center text-sm mt-4 ${textMuted}`}>
                ⚡ {config.cta.urgencyText}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplitLayout;
