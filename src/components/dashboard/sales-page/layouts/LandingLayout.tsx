import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Play, 
  BookOpen, 
  Award, 
  Check, 
  Shield,
  ChevronRight,
  MessageCircle,
  Heart,
  Video,
  Star,
  Users,
  Clock,
  Infinity,
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

const LandingLayout = ({ service, profile, modules, config, themeColors }: LayoutProps) => {
  const navigate = useNavigate();
  const { primaryColor, accentColor, textPrimary, textSecondary, textMuted, borderColor, isLightTheme } = themeColors;
  const [visibleMessages, setVisibleMessages] = useState(0);
  const [showTyping, setShowTyping] = useState(false);
  const [bgLoaded, setBgLoaded] = useState(false);

  const handleCheckout = () => {
    navigate(`/checkout/${service.id}`);
  };

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

  // Chat messages animation
  const messages = [
    { type: 'user', text: 'Olá! Tenho interesse no curso.' },
    { type: 'instructor', text: 'Oi! Que bom te ver por aqui! 😊' },
    { type: 'user', text: 'O curso tem certificado?' },
    { type: 'instructor', text: 'Sim! Certificado incluso após conclusão.' },
  ];

  useEffect(() => {
    setBgLoaded(true);
    
    let currentMessage = 0;
    const showNextMessage = () => {
      if (currentMessage >= messages.length) return;
      setShowTyping(true);
      setTimeout(() => {
        setShowTyping(false);
        setVisibleMessages(prev => prev + 1);
        currentMessage++;
        if (currentMessage < messages.length) {
          setTimeout(showNextMessage, 1000);
        }
      }, 1200);
    };

    const timer = setTimeout(showNextMessage, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Hero Section - Full Screen with Background Image */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background Image */}
        {heroImageUrl ? (
          <div
            className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700 ${
              bgLoaded ? "opacity-100" : "opacity-0"
            }`}
            style={{ backgroundImage: `url(${heroImageUrl})` }}
          />
        ) : (
          <div 
            className="absolute inset-0"
            style={{ 
              background: `linear-gradient(135deg, ${primaryColor}40 0%, transparent 50%), 
                          radial-gradient(circle at 80% 20%, ${accentColor}30, transparent 50%)` 
            }}
          />
        )}
        
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40" />

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 py-20">
          <div className="max-w-2xl">
            {/* Badge */}
            <div 
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-6 backdrop-blur-sm animate-fade-in"
              style={{ backgroundColor: `${primaryColor}30`, border: `1px solid ${primaryColor}50` }}
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-sm font-medium text-white">{config.hero.badge}</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 opacity-0 animate-fade-in-up">
              {config.hero.title || service.name}
            </h1>
            
            {(config.hero.subtitle || service.description) && (
              <p className="text-base sm:text-lg md:text-xl text-white/80 mb-8 max-w-xl opacity-0 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                {config.hero.subtitle || service.description}
              </p>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-4 mb-8 opacity-0 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <Button 
                size="lg" 
                onClick={handleCheckout}
                className="group px-8 py-6 text-lg font-bold text-white rounded-xl shadow-2xl transition-all duration-300 hover:scale-[1.02]"
                style={{ 
                  backgroundColor: primaryColor,
                  boxShadow: `0 20px 50px ${primaryColor}50`,
                }}
              >
                {config.hero.ctaText}
                <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 opacity-0 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              {profile && (
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12 border-2 border-white/30">
                    <AvatarImage src={profile.avatar_url || undefined} />
                    <AvatarFallback style={{ backgroundColor: `${primaryColor}50`, color: 'white' }}>
                      {getInitials(profile.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-white font-medium text-sm">{profile.full_name}</p>
                    <p className="text-white/60 text-xs">{profile.specialty || 'Instrutor'}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                ))}
                <span className="text-white/70 text-sm ml-2">+100 alunos</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="absolute bottom-0 left-0 right-0 z-20">
          <div className="container mx-auto px-4 pb-8">
            <div className="text-center opacity-0 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
              <p className="text-white text-lg sm:text-xl md:text-2xl font-semibold">
                Por apenas {formatPrice(service.price_cents)}
              </p>
              <p className="text-sm sm:text-base font-medium mt-2 flex items-center justify-center gap-2" style={{ color: primaryColor }}>
                <MessageCircle className="w-4 h-4 fill-current animate-pulse" />
                {config.cta.urgencyText || 'Acesso imediato após a compra!'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24" style={{ backgroundColor: `hsl(${config.colors.background})` }}>
        <div className="container mx-auto px-4">
          <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4 ${textPrimary}`}>
            O que você vai aprender
          </h2>
          <p className={`text-center mb-12 max-w-2xl mx-auto ${textMuted}`}>
            {config.content.sectionSubtitle}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[
              { icon: BookOpen, title: `${totalLessons}+ Aulas`, description: 'Conteúdo completo e atualizado' },
              { icon: Award, title: 'Certificado', description: 'Reconhecido e verificado' },
              { icon: Infinity, title: 'Acesso Vitalício', description: 'Estude quando quiser' },
            ].map((feature, index) => (
              <div
                key={index}
                className="rounded-2xl p-6 text-center transition-all duration-300 hover:shadow-2xl hover:scale-105 border"
                style={{ 
                  background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}CC)`,
                  borderColor: `${primaryColor}50`,
                }}
              >
                <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-white/80 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WhatsApp Chat Section */}
      <section 
        className="py-16 md:py-24"
        style={{ backgroundColor: isLightTheme ? `${primaryColor}08` : `${primaryColor}15` }}
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Content */}
            <div className="flex-1 text-center lg:text-left order-2 lg:order-1">
              <div className="flex items-center gap-2 justify-center lg:justify-start mb-6">
                <MessageCircle className="w-6 h-6" style={{ color: primaryColor }} />
                <span className={`font-medium ${textPrimary}`}>Suporte Exclusivo</span>
              </div>
              
              <h2 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight ${textPrimary}`}>
                Tire suas dúvidas{" "}
                <span style={{ color: primaryColor }}>diretamente</span>{" "}
                com o instrutor
              </h2>
              
              <p className={`mb-8 max-w-md mx-auto lg:mx-0 text-base md:text-lg ${textMuted}`}>
                Um canal direto para você ter suporte personalizado durante todo o curso.
              </p>
              
              <Button 
                size="lg" 
                onClick={handleCheckout}
                className="group px-8 py-6 text-lg font-semibold text-white rounded-xl w-full sm:w-auto"
                style={{ backgroundColor: primaryColor }}
              >
                Quero ter acesso
                <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
            
            {/* Chat Mockup */}
            <div className="flex-1 flex justify-center order-1 lg:order-2">
              <div className="relative">
                <div 
                  className="w-[280px] sm:w-[320px] rounded-[2rem] p-2 shadow-2xl"
                  style={{ 
                    backgroundColor: isLightTheme ? 'white' : `hsl(${config.colors.background})`,
                    border: `2px solid ${borderColor}`,
                  }}
                >
                  <div className="bg-[#ece5dd] rounded-[1.5rem] overflow-hidden">
                    {/* Chat header */}
                    <div className="px-4 py-3 flex items-center gap-3" style={{ backgroundColor: primaryColor }}>
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={profile?.avatar_url || undefined} />
                        <AvatarFallback className="bg-white/20 text-white font-bold">
                          {getInitials(profile?.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-white font-medium text-sm">{profile?.full_name || 'Instrutor'}</p>
                        <p className="text-white/80 text-xs">online</p>
                      </div>
                    </div>
                    
                    {/* Chat messages */}
                    <div className="h-[350px] p-3 space-y-2 overflow-hidden flex flex-col">
                      {messages.slice(0, visibleMessages).map((message, index) => (
                        <div 
                          key={index}
                          className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                        >
                          <div 
                            className={`${
                              message.type === 'user' 
                                ? 'bg-[#DCF8C6] rounded-lg rounded-tr-sm' 
                                : 'bg-white rounded-lg rounded-tl-sm'
                            } px-3 py-2 max-w-[85%] shadow-sm`}
                          >
                            <p className="text-gray-800 text-sm">{message.text}</p>
                            <div className="flex items-center justify-end gap-1 mt-1">
                              <span className="text-gray-500 text-[10px]">12:34</span>
                              {message.type === 'user' && (
                                <>
                                  <Check className="w-3 h-3 text-blue-500" />
                                  <Check className="w-3 h-3 text-blue-500 -ml-2" />
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}

                      {showTyping && visibleMessages < messages.length && (
                        <div className="flex justify-start animate-fade-in">
                          <div className="bg-white rounded-lg rounded-tl-sm px-4 py-3 shadow-sm">
                            <div className="flex items-center gap-1">
                              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Glow effect */}
                <div 
                  className="absolute -inset-4 rounded-[3rem] blur-2xl -z-10 opacity-30"
                  style={{ backgroundColor: primaryColor }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Therapy/Benefit Section */}
      <section className="py-16 md:py-24 overflow-hidden" style={{ backgroundColor: `hsl(${config.colors.background})` }}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Image Side */}
            <div className="relative w-full lg:w-1/2 flex justify-center">
              {/* Decorative elements */}
              <div 
                className="absolute top-4 right-1/4 w-4 h-4 rounded-full animate-pulse"
                style={{ backgroundColor: `${primaryColor}60` }}
              />
              <div 
                className="absolute bottom-8 left-8 w-3 h-3 rounded-full"
                style={{ backgroundColor: `${accentColor}80` }}
              />

              {/* Main card */}
              <div className="relative">
                <div 
                  className="absolute inset-0 -inset-x-4 -inset-y-4 rounded-3xl transform rotate-3"
                  style={{ background: `linear-gradient(135deg, ${primaryColor}20, ${accentColor}10)` }}
                />
                <div 
                  className="absolute inset-0 -inset-x-2 -inset-y-2 rounded-3xl transform -rotate-2"
                  style={{ background: `linear-gradient(225deg, ${accentColor}30, ${primaryColor}10)` }}
                />
                
                <div 
                  className="relative z-10 rounded-2xl overflow-hidden p-2"
                  style={{ background: `linear-gradient(135deg, ${accentColor}30, ${primaryColor}20)` }}
                >
                  {heroImageUrl ? (
                    <img
                      src={heroImageUrl}
                      alt={service.name}
                      className="w-full max-w-sm sm:max-w-md rounded-xl object-cover"
                    />
                  ) : (
                    <div 
                      className="w-full max-w-sm sm:max-w-md h-80 rounded-xl flex items-center justify-center"
                      style={{ background: `linear-gradient(135deg, ${primaryColor}30, ${accentColor}20)` }}
                    >
                      <Play className="w-20 h-20" style={{ color: `${primaryColor}60` }} />
                    </div>
                  )}
                </div>

                {/* Floating badge */}
                <div 
                  className="absolute -right-4 top-1/3 z-20 rounded-2xl p-3 shadow-lg animate-bounce"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Heart className="w-6 h-6 text-white fill-white" />
                </div>
              </div>
            </div>

            {/* Text Side */}
            <div className="w-full lg:w-1/2 text-center lg:text-left">
              {/* Tag */}
              <div 
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-6"
                style={{ backgroundColor: `${primaryColor}15` }}
              >
                <Video className="w-4 h-4" style={{ color: primaryColor }} />
                <span className={`text-sm font-medium ${textPrimary}`}>Conteúdo Premium</span>
              </div>

              {/* Title */}
              <h2 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight ${textPrimary}`}>
                {config.benefits.title || 'Você merece ter acesso a '}
                <span style={{ color: primaryColor }}>conhecimento de qualidade</span>
              </h2>

              {/* Description */}
              <p className={`text-base md:text-lg mb-8 max-w-lg mx-auto lg:mx-0 ${textMuted}`}>
                {config.guarantee.description || 'Acesso completo a todo o conteúdo com garantia de satisfação.'}
              </p>

              {/* CTA Button */}
              <Button 
                size="lg" 
                onClick={handleCheckout}
                className="group px-8 py-6 text-base font-semibold text-white rounded-full"
                style={{ backgroundColor: primaryColor }}
              >
                {config.cta.buttonText}
                <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Course Modules - Cards */}
      <section className="py-16 md:py-24" style={{ backgroundColor: isLightTheme ? `${primaryColor}05` : `${primaryColor}10` }}>
        <div className="container mx-auto px-4">
          <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4 ${textPrimary}`}>
            {config.content.sectionTitle}
          </h2>
          <p className={`text-center mb-12 max-w-2xl mx-auto ${textMuted}`}>
            {modules.length} módulos • {totalLessons} aulas
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {modules.map((module, index) => (
              <div
                key={module.id}
                className="group rounded-2xl p-5 border transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
                style={{ 
                  backgroundColor: `hsl(${config.colors.background})`,
                  borderColor: borderColor,
                }}
              >
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors group-hover:scale-110"
                  style={{ background: `linear-gradient(135deg, ${primaryColor}25, ${primaryColor}10)` }}
                >
                  <span className="font-bold" style={{ color: primaryColor }}>{index + 1}</span>
                </div>
                <h3 className={`font-semibold mb-2 group-hover:text-primary transition-colors text-sm sm:text-base ${textPrimary}`}>
                  {module.title}
                </h3>
                <p className={`text-xs sm:text-sm ${textMuted}`}>
                  {module.lessons_count} aulas
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Instructor Section */}
      {config.instructor.showSection && profile && (
        <section className="py-16 md:py-24" style={{ backgroundColor: `hsl(${config.colors.background})` }}>
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-12 ${textPrimary}`}>
                {config.instructor.title}
              </h2>
              
              <div 
                className="rounded-3xl p-8 md:p-12 border shadow-xl"
                style={{ 
                  backgroundColor: isLightTheme ? 'white' : `hsl(${config.colors.background})`,
                  borderColor: borderColor,
                }}
              >
                <div className="relative inline-block mb-6">
                  <div 
                    className="absolute -inset-3 rounded-full blur-xl opacity-40"
                    style={{ backgroundColor: primaryColor }}
                  />
                  <Avatar className="relative w-28 h-28 border-4 shadow-xl" style={{ borderColor: primaryColor }}>
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

                <h3 className={`text-2xl font-bold ${textPrimary}`}>{profile.full_name}</h3>
                {profile.specialty && (
                  <p className={`mt-2 text-lg ${textMuted}`}>{profile.specialty}</p>
                )}
                {profile.crp && (
                  <Badge variant="secondary" className="mt-3">CRP: {profile.crp}</Badge>
                )}
                
                <div className="flex items-center justify-center gap-1 mt-4">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>

                {profile.bio && (
                  <p className={`mt-6 text-base leading-relaxed max-w-xl mx-auto ${textSecondary}`}>{profile.bio}</p>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 md:py-24" style={{ background: `linear-gradient(135deg, ${primaryColor}15, ${accentColor}10)` }}>
        <div className="container mx-auto px-4 text-center">
          <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-4 ${textPrimary}`}>
            {config.cta.mainText}
          </h2>
          <p className={`mb-8 max-w-xl mx-auto text-base md:text-lg ${textMuted}`}>
            {config.cta.subText}
          </p>

          <div className={`text-5xl md:text-6xl font-bold mb-8 ${textPrimary}`}>
            {formatPrice(service.price_cents)}
          </div>

          <Button 
            size="lg" 
            onClick={handleCheckout}
            className="group text-lg px-10 py-7 font-bold text-white rounded-xl shadow-2xl transition-all duration-300 hover:scale-[1.02]"
            style={{ 
              backgroundColor: primaryColor,
              boxShadow: `0 20px 50px ${primaryColor}50`,
            }}
          >
            {config.cta.buttonText}
            <ChevronRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>

          {config.guarantee.enabled && (
            <div className={`flex items-center justify-center gap-3 mt-8 ${textMuted}`}>
              <Shield className="w-5 h-5 text-green-500" />
              <span>{config.guarantee.title}</span>
            </div>
          )}
        </div>
      </section>

      {/* Mobile CTA */}
      <div 
        className="lg:hidden fixed bottom-0 left-0 right-0 p-4 border-t backdrop-blur-xl"
        style={{ 
          backgroundColor: isLightTheme ? 'rgba(255,255,255,0.95)' : `hsl(${config.colors.background} / 0.95)`,
          borderColor: borderColor,
        }}
      >
        <Button
          onClick={handleCheckout}
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

export default LandingLayout;
