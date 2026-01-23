import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Play, Calendar, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BannerSlide {
  id: string;
  type: "welcome" | "event" | "course" | "community";
  title: string;
  subtitle: string;
  buttonText?: string;
  buttonAction?: () => void;
  gradient: string;
  icon: React.ElementType;
}

interface StudentBannerProps {
  professionalName: string;
  userName?: string;
  upcomingEvent?: {
    title: string;
    date: string;
  };
  onContinueLearning?: () => void;
  onViewEvents?: () => void;
  onJoinCommunity?: () => void;
}

const StudentBanner = ({
  professionalName,
  userName,
  upcomingEvent,
  onContinueLearning,
  onViewEvents,
  onJoinCommunity,
}: StudentBannerProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const slides: BannerSlide[] = [
    {
      id: "welcome",
      type: "welcome",
      title: userName ? `Olá, ${userName}! 👋` : "Bem-vindo!",
      subtitle: `Continue sua jornada de aprendizado com ${professionalName}`,
      buttonText: "Continuar Aprendendo",
      buttonAction: onContinueLearning,
      gradient: "from-primary/20 via-purple-600/20 to-blue-600/20",
      icon: Play,
    },
    {
      id: "community",
      type: "community",
      title: "Comunidade Exclusiva",
      subtitle: "Conecte-se com outros alunos e compartilhe experiências",
      buttonText: "Participar",
      buttonAction: onJoinCommunity,
      gradient: "from-green-600/20 via-emerald-600/20 to-teal-600/20",
      icon: Users,
    },
  ];

  // Add event slide if there's an upcoming event
  if (upcomingEvent) {
    slides.splice(1, 0, {
      id: "event",
      type: "event",
      title: upcomingEvent.title,
      subtitle: `Evento ao vivo: ${upcomingEvent.date}`,
      buttonText: "Ver Detalhes",
      buttonAction: onViewEvents,
      gradient: "from-orange-600/20 via-red-600/20 to-pink-600/20",
      icon: Calendar,
    });
  }

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const nextSlide = () => goToSlide((currentSlide + 1) % slides.length);
  const prevSlide = () => goToSlide((currentSlide - 1 + slides.length) % slides.length);

  const currentSlideData = slides[currentSlide];
  const IconComponent = currentSlideData.icon;

  return (
    <div className="relative w-full h-48 md:h-56 overflow-hidden rounded-2xl mx-auto">
      {/* Background with gradient */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-r transition-all duration-700",
          currentSlideData.gradient
        )}
      />
      
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center px-8 md:px-12">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2 text-primary/80">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">
              {currentSlideData.type === "welcome" && "Área de Membros"}
              {currentSlideData.type === "event" && "Próximo Evento"}
              {currentSlideData.type === "community" && "Comunidade"}
              {currentSlideData.type === "course" && "Novo Conteúdo"}
            </span>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">
            {currentSlideData.title}
          </h2>
          
          <p className="text-sm md:text-base text-gray-300 max-w-lg">
            {currentSlideData.subtitle}
          </p>

          {currentSlideData.buttonText && currentSlideData.buttonAction && (
            <Button
              onClick={currentSlideData.buttonAction}
              className="mt-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white"
            >
              <IconComponent className="w-4 h-4 mr-2" />
              {currentSlideData.buttonText}
            </Button>
          )}
        </div>

        {/* Icon decoration */}
        <div className="hidden md:flex items-center justify-center w-32 h-32 rounded-full bg-white/5 backdrop-blur-sm border border-white/10">
          <IconComponent className="w-12 h-12 text-white/60" />
        </div>
      </div>

      {/* Navigation arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-white/70 hover:text-white transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-white/70 hover:text-white transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Slide indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                index === currentSlide
                  ? "w-6 bg-white"
                  : "w-1.5 bg-white/40 hover:bg-white/60"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentBanner;
