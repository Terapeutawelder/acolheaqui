import { 
  Check, 
  Shield,
  ArrowRight,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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

const MinimalLayout = ({ service, profile, modules, config, themeColors }: LayoutProps) => {
  const { primaryColor, textPrimary, textSecondary, textMuted, borderColor, isLightTheme } = themeColors;

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
      {/* Hero Section - Ultra Minimal & Elegant */}
      <section className="min-h-[80vh] flex items-center">
        <div className="container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-3xl">
            <p className={`text-xs uppercase tracking-[0.3em] mb-8 font-medium ${textMuted}`}>
              {config.hero.badge}
            </p>

            <h1 className={`text-4xl md:text-6xl lg:text-7xl font-light leading-[1.1] mb-10 ${textPrimary}`}>
              {config.hero.title || service.name}
            </h1>

            {(config.hero.subtitle || service.description) && (
              <p className={`text-xl md:text-2xl leading-relaxed mb-14 font-light ${textSecondary}`}>
                {config.hero.subtitle || service.description}
              </p>
            )}

            <div className="flex flex-col sm:flex-row items-start gap-8">
              <Button
                size="lg"
                className="group font-medium text-lg px-10 py-7 text-white transition-all duration-300 hover:shadow-2xl"
                style={{ 
                  backgroundColor: primaryColor,
                  borderRadius: '2px',
                }}
              >
                {config.hero.ctaText}
                <ArrowRight className="w-5 h-5 ml-3 transition-transform group-hover:translate-x-1" />
              </Button>
              <div className={`flex flex-col gap-1 ${textMuted}`}>
                <span className={`text-4xl font-light ${textPrimary}`}>{formatPrice(service.price_cents)}</span>
                <span className="text-sm font-light">{config.cta.subText}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Elegant Divider */}
      <div className="container mx-auto px-4">
        <div className={`border-t ${borderColor}`} />
      </div>

      {/* Benefits Section - Clean List */}
      {config.benefits.enabled && (
        <section className="py-24 md:py-32">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <p className={`text-xs uppercase tracking-[0.3em] mb-10 font-medium ${textMuted}`}>
                {config.benefits.title}
              </p>
              <ul className="space-y-6">
                {config.benefits.items.map((item, i) => (
                  <li key={i} className={`flex items-center gap-6 text-xl font-light ${textPrimary} group`}>
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110"
                      style={{ backgroundColor: `${primaryColor}15` }}
                    >
                      <Check className="w-5 h-5" style={{ color: primaryColor }} />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Elegant Divider */}
      <div className="container mx-auto px-4">
        <div className={`border-t ${borderColor}`} />
      </div>

      {/* Course Content - Refined Timeline */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <p className={`text-xs uppercase tracking-[0.3em] mb-4 font-medium ${textMuted}`}>
              {config.content.sectionTitle}
            </p>
            <p className={`text-2xl md:text-3xl font-light mb-16 ${textPrimary}`}>{config.content.sectionSubtitle}</p>

            <div className="space-y-0">
              {modules.map((module, index) => (
                <div
                  key={module.id}
                  className={`relative pl-12 pb-12 border-l-2 last:border-l-0 last:pb-0 transition-all duration-300 group`}
                  style={{ borderColor: `${primaryColor}30` }}
                >
                  {/* Timeline dot - Enhanced */}
                  <div 
                    className="absolute left-[-9px] top-1 w-4 h-4 rounded-full transition-all duration-300 group-hover:scale-125"
                    style={{ 
                      backgroundColor: primaryColor,
                      boxShadow: `0 0 20px ${primaryColor}50`,
                    }}
                  />
                  
                  <div className="pt-0">
                    <div className="flex items-center gap-4 mb-2">
                      <span className={`text-xs uppercase tracking-[0.2em] font-medium ${textMuted}`}>
                        Módulo {index + 1}
                      </span>
                      <Minus className={`w-3 h-3 ${textMuted}`} />
                      <span className={`text-xs uppercase tracking-[0.2em] font-medium ${textMuted}`}>
                        {module.lessons_count} aulas
                      </span>
                    </div>
                    <h3 className={`text-xl md:text-2xl font-normal ${textPrimary} group-hover:translate-x-2 transition-transform duration-300`}>
                      {module.title}
                    </h3>
                    {module.description && (
                      <p className={`text-base mt-3 font-light leading-relaxed ${textSecondary}`}>{module.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className={`mt-16 pt-10 border-t ${borderColor}`}>
              <p className={`text-sm font-light ${textMuted}`}>
                Total: {modules.length} módulos • {totalLessons} aulas
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Elegant Divider */}
      <div className="container mx-auto px-4">
        <div className={`border-t ${borderColor}`} />
      </div>

      {/* Instructor Section - Elegant */}
      {config.instructor.showSection && profile && (
        <section className="py-24 md:py-32">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <p className={`text-xs uppercase tracking-[0.3em] mb-10 font-medium ${textMuted}`}>
                {config.instructor.title}
              </p>
              <div className="flex items-start gap-8">
                <Avatar className="w-24 h-24 shrink-0 shadow-xl">
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback 
                    className="text-2xl font-light"
                    style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                  >
                    {getInitials(profile.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className={`text-2xl md:text-3xl font-normal ${textPrimary}`}>{profile.full_name}</h3>
                  {profile.specialty && (
                    <p className={`mt-2 text-lg font-light ${textMuted}`}>{profile.specialty}</p>
                  )}
                  {profile.bio && (
                    <p className={`mt-6 text-lg leading-relaxed font-light ${textSecondary}`}>{profile.bio}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Elegant Divider */}
      <div className="container mx-auto px-4">
        <div className={`border-t ${borderColor}`} />
      </div>

      {/* CTA Section - Refined */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl flex flex-col md:flex-row md:items-end md:justify-between gap-10">
            <div>
              <h2 className={`text-3xl md:text-4xl font-light ${textPrimary}`}>{config.cta.mainText}</h2>
              {config.guarantee.enabled && (
                <div className={`flex items-center gap-3 mt-4 ${textMuted}`}>
                  <Shield className="w-5 h-5" />
                  <span className="text-sm font-light">{config.guarantee.title}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-8">
              <span className={`text-4xl md:text-5xl font-light ${textPrimary}`}>{formatPrice(service.price_cents)}</span>
              <Button
                size="lg"
                className="group font-medium px-10 py-7 text-white transition-all duration-300"
                style={{ 
                  backgroundColor: primaryColor,
                  borderRadius: '2px',
                }}
              >
                {config.cta.buttonText}
                <ArrowRight className="w-5 h-5 ml-3 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile CTA - Minimal */}
      <div 
        className={`lg:hidden fixed bottom-0 left-0 right-0 p-5 border-t backdrop-blur-xl ${borderColor}`}
        style={{ backgroundColor: isLightTheme ? 'rgba(255,255,255,0.95)' : `hsl(${config.colors.background} / 0.95)` }}
      >
        <Button
          className="w-full py-6 text-lg font-medium text-white"
          style={{ 
            backgroundColor: primaryColor,
            borderRadius: '2px',
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

export default MinimalLayout;
