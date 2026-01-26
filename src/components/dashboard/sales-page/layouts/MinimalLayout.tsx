import { 
  Check, 
  Shield,
  ArrowRight,
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
  const cardBorder = isLightTheme ? 'border-gray-200' : 'border-white/10';

  return (
    <div className="font-sans">
      {/* Hero - Minimal */}
      <section className="min-h-[70vh] flex items-center py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <p className={`text-xs uppercase tracking-[0.25em] mb-6 font-medium ${textMuted}`}>
              {config.hero.badge}
            </p>

            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-light leading-tight mb-8 ${textPrimary}`}>
              {config.hero.title || service.name}
            </h1>

            {(config.hero.subtitle || service.description) && (
              <p className={`text-lg md:text-xl leading-relaxed mb-12 font-light ${textSecondary}`}>
                {config.hero.subtitle || service.description}
              </p>
            )}

            <div className="flex flex-col sm:flex-row items-start gap-6">
              <Button
                size="lg"
                className="font-medium text-base px-8 py-6 text-white rounded-none transition-all hover:opacity-90"
                style={{ backgroundColor: primaryColor }}
              >
                {config.hero.ctaText}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <div className={`flex flex-col gap-1 ${textMuted}`}>
                <span className={`text-3xl font-light ${textPrimary}`}>{formatPrice(service.price_cents)}</span>
                <span className="text-sm font-light">{config.cta.subText}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="container mx-auto px-4">
        <div className={`border-t ${cardBorder}`} />
      </div>

      {/* Benefits - Clean */}
      {config.benefits.enabled && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl">
              <p className={`text-xs uppercase tracking-[0.25em] mb-8 font-medium ${textMuted}`}>
                {config.benefits.title}
              </p>
              <ul className="space-y-5">
                {config.benefits.items.map((item, i) => (
                  <li key={i} className={`flex items-center gap-4 text-lg font-light ${textPrimary}`}>
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${primaryColor}15` }}
                    >
                      <Check className="w-4 h-4" style={{ color: primaryColor }} />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Divider */}
      <div className="container mx-auto px-4">
        <div className={`border-t ${cardBorder}`} />
      </div>

      {/* Course Content - Timeline */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <p className={`text-xs uppercase tracking-[0.25em] mb-4 font-medium ${textMuted}`}>
              {config.content.sectionTitle}
            </p>
            <p className={`text-xl md:text-2xl font-light mb-12 ${textPrimary}`}>{config.content.sectionSubtitle}</p>

            <div className="space-y-0">
              {modules.map((module, index) => (
                <div
                  key={module.id}
                  className="relative pl-10 pb-10 border-l-2 last:border-l-0 last:pb-0"
                  style={{ borderColor: `${primaryColor}30` }}
                >
                  <div 
                    className="absolute left-[-7px] top-1 w-3 h-3 rounded-full"
                    style={{ backgroundColor: primaryColor }}
                  />
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-xs uppercase tracking-[0.15em] font-medium ${textMuted}`}>
                      Módulo {index + 1}
                    </span>
                    <span className={`text-xs ${textMuted}`}>•</span>
                    <span className={`text-xs uppercase tracking-[0.15em] font-medium ${textMuted}`}>
                      {module.lessons_count} aulas
                    </span>
                  </div>
                  <h3 className={`text-lg font-normal ${textPrimary}`}>{module.title}</h3>
                  {module.description && (
                    <p className={`text-sm mt-2 font-light ${textSecondary}`}>{module.description}</p>
                  )}
                </div>
              ))}
            </div>

            <div className={`mt-12 pt-8 border-t ${cardBorder}`}>
              <p className={`text-sm font-light ${textMuted}`}>
                Total: {modules.length} módulos • {totalLessons} aulas
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="container mx-auto px-4">
        <div className={`border-t ${cardBorder}`} />
      </div>

      {/* Instructor */}
      {config.instructor.showSection && profile && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl">
              <p className={`text-xs uppercase tracking-[0.25em] mb-8 font-medium ${textMuted}`}>
                {config.instructor.title}
              </p>
              <div className="flex items-start gap-6">
                <Avatar className="w-20 h-20 shrink-0">
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback 
                    className="text-xl font-light"
                    style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                  >
                    {getInitials(profile.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className={`text-xl font-normal ${textPrimary}`}>{profile.full_name}</h3>
                  {profile.specialty && (
                    <p className={`mt-1 font-light ${textMuted}`}>{profile.specialty}</p>
                  )}
                  {profile.bio && (
                    <p className={`mt-4 font-light leading-relaxed ${textSecondary}`}>{profile.bio}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Divider */}
      <div className="container mx-auto px-4">
        <div className={`border-t ${cardBorder}`} />
      </div>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <div>
              <h2 className={`text-2xl md:text-3xl font-light ${textPrimary}`}>{config.cta.mainText}</h2>
              {config.guarantee.enabled && (
                <div className={`flex items-center gap-2 mt-3 ${textMuted}`}>
                  <Shield className="w-4 h-4" />
                  <span className="text-sm font-light">{config.guarantee.title}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-6">
              <span className={`text-3xl font-light ${textPrimary}`}>{formatPrice(service.price_cents)}</span>
              <Button
                size="lg"
                className="font-medium px-8 py-6 text-white rounded-none"
                style={{ backgroundColor: primaryColor }}
              >
                {config.cta.buttonText}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile CTA */}
      <div 
        className={`lg:hidden fixed bottom-0 left-0 right-0 p-4 border-t backdrop-blur-xl ${cardBorder}`}
        style={{ backgroundColor: isLightTheme ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.9)' }}
      >
        <Button
          className="w-full py-5 text-base font-medium text-white rounded-none"
          style={{ backgroundColor: primaryColor }}
        >
          {config.cta.buttonText} • {formatPrice(service.price_cents)}
        </Button>
      </div>

      <div className="h-20 lg:hidden" />
    </div>
  );
};

export default MinimalLayout;
