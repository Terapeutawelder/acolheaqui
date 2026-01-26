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

  const totalLessons = modules.reduce((acc, m) => acc + m.lessons_count, 0);

  return (
    <>
      {/* Hero Section - Ultra Minimal */}
      <section className="min-h-[70vh] flex items-center">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-2xl">
            <p className={`text-sm uppercase tracking-widest mb-6 ${textMuted}`}>
              {config.hero.badge}
            </p>

            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-light leading-tight mb-8 ${textPrimary}`}>
              {config.hero.title || service.name}
            </h1>

            {(config.hero.subtitle || service.description) && (
              <p className={`text-xl leading-relaxed mb-12 ${textSecondary}`}>
                {config.hero.subtitle || service.description}
              </p>
            )}

            <div className="flex flex-col sm:flex-row items-start gap-6">
              <Button
                size="lg"
                className="font-medium text-lg px-8 py-6 text-white rounded-none"
                style={{ backgroundColor: primaryColor }}
              >
                {config.hero.ctaText}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <div className={`flex flex-col ${textMuted}`}>
                <span className={`text-3xl font-light ${textPrimary}`}>{formatPrice(service.price_cents)}</span>
                <span className="text-sm">{config.cta.subText}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section - Simple List */}
      {config.benefits.enabled && (
        <section className={`py-20 border-t ${borderColor}`}>
          <div className="container mx-auto px-4">
            <div className="max-w-2xl">
              <h2 className={`text-sm uppercase tracking-widest mb-8 ${textMuted}`}>
                {config.benefits.title}
              </h2>
              <ul className="space-y-4">
                {config.benefits.items.map((item, i) => (
                  <li key={i} className={`flex items-center gap-4 text-lg ${textPrimary}`}>
                    <Check className="w-5 h-5 shrink-0" style={{ color: primaryColor }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Course Content - Timeline Style */}
      <section className={`py-20 border-t ${borderColor}`}>
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <h2 className={`text-sm uppercase tracking-widest mb-2 ${textMuted}`}>
              {config.content.sectionTitle}
            </h2>
            <p className={`text-2xl mb-12 ${textPrimary}`}>{config.content.sectionSubtitle}</p>

            <div className="space-y-0">
              {modules.map((module, index) => (
                <div
                  key={module.id}
                  className={`relative pl-8 pb-8 border-l-2 ${borderColor} last:border-l-0 last:pb-0`}
                >
                  {/* Timeline dot */}
                  <div 
                    className="absolute left-[-9px] top-0 w-4 h-4 rounded-full"
                    style={{ backgroundColor: primaryColor }}
                  />
                  
                  <div className="pt-0">
                    <span className={`text-xs uppercase tracking-widest ${textMuted}`}>
                      Módulo {index + 1} • {module.lessons_count} aulas
                    </span>
                    <h3 className={`text-xl font-medium mt-1 ${textPrimary}`}>{module.title}</h3>
                    {module.description && (
                      <p className={`text-sm mt-2 ${textSecondary}`}>{module.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className={`mt-12 pt-8 border-t ${borderColor}`}>
              <p className={`text-sm ${textMuted}`}>
                Total: {modules.length} módulos • {totalLessons} aulas
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Instructor Section */}
      {config.instructor.showSection && profile && (
        <section className={`py-20 border-t ${borderColor}`}>
          <div className="container mx-auto px-4">
            <div className="max-w-2xl">
              <h2 className={`text-sm uppercase tracking-widest mb-8 ${textMuted}`}>
                {config.instructor.title}
              </h2>
              <div className="flex items-start gap-6">
                <Avatar className="w-20 h-20 shrink-0">
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback 
                    className="text-xl"
                    style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
                  >
                    {getInitials(profile.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className={`text-xl font-medium ${textPrimary}`}>{profile.full_name}</h3>
                  {profile.specialty && (
                    <p className={`mt-1 ${textMuted}`}>{profile.specialty}</p>
                  )}
                  {profile.bio && (
                    <p className={`mt-4 leading-relaxed ${textSecondary}`}>{profile.bio}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className={`py-20 border-t ${borderColor}`}>
        <div className="container mx-auto px-4">
          <div className="max-w-2xl flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div>
              <h2 className={`text-2xl font-light ${textPrimary}`}>{config.cta.mainText}</h2>
              {config.guarantee.enabled && (
                <div className={`flex items-center gap-2 mt-2 ${textMuted}`}>
                  <Shield className="w-4 h-4" />
                  <span className="text-sm">{config.guarantee.title}</span>
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
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile CTA */}
      <div 
        className={`lg:hidden fixed bottom-0 left-0 right-0 p-4 border-t ${borderColor}`}
        style={{ backgroundColor: `hsl(${config.colors.background})` }}
      >
        <Button
          className="w-full py-6 text-lg font-medium text-white rounded-none"
          style={{ backgroundColor: primaryColor }}
        >
          {config.cta.buttonText} • {formatPrice(service.price_cents)}
        </Button>
      </div>
    </>
  );
};

export default MinimalLayout;
