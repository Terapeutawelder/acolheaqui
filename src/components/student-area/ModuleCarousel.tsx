import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight, Play, Lock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Module {
  id: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  lessonsCount: number;
}

interface ModuleCarouselProps {
  title: string;
  modules: Module[];
  onSelectModule: (moduleId: string) => void;
  completedLessons: Set<string>;
}

const ModuleCarousel = ({
  title,
  modules,
  onSelectModule,
  completedLessons,
}: ModuleCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 400;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
    setTimeout(checkScroll, 300);
  };

  if (modules.length === 0) return null;

  return (
    <div className="relative group">
      {/* Title */}
      <h2 className="text-xl font-bold text-white mb-4">{title}</h2>

      {/* Scroll Buttons */}
      {canScrollLeft && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gray-950/80 hover:bg-gray-900 text-white w-12 h-12 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => scroll("left")}
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
      )}

      {canScrollRight && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-gray-950/80 hover:bg-gray-900 text-white w-12 h-12 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => scroll("right")}
        >
          <ChevronRight className="w-6 h-6" />
        </Button>
      )}

      {/* Cards Container */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {modules.map((module, index) => (
          <ModuleCard
            key={module.id}
            module={module}
            index={index}
            onClick={() => onSelectModule(module.id)}
          />
        ))}
      </div>
    </div>
  );
};

interface ModuleCardProps {
  module: Module;
  index: number;
  onClick: () => void;
}

const ModuleCard = ({ module, index, onClick }: ModuleCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  const gradients = [
    "from-primary/80 via-primary/40 to-transparent",
    "from-purple-600/80 via-purple-600/40 to-transparent",
    "from-blue-600/80 via-blue-600/40 to-transparent",
    "from-pink-600/80 via-pink-600/40 to-transparent",
    "from-teal-600/80 via-teal-600/40 to-transparent",
  ];

  const gradient = gradients[index % gradients.length];

  return (
    <div
      className="relative flex-shrink-0 w-72 aspect-[4/5] rounded-xl overflow-hidden cursor-pointer group/card transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/20"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Background Image */}
      {module.thumbnailUrl && !imageError ? (
        <img
          src={module.thumbnailUrl}
          alt={module.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-110"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className={cn("absolute inset-0 bg-gradient-to-br", gradient)} />
      )}

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/50 to-transparent" />

      {/* Badge */}
      <div className="absolute top-3 left-3">
        <Badge className="bg-primary/90 text-white text-xs">
          Módulo {index + 1}
        </Badge>
      </div>

      {/* Play Button */}
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center transition-opacity duration-300",
          isHovered ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center shadow-lg shadow-primary/50 transform transition-transform duration-300 hover:scale-110">
          <Play className="w-7 h-7 text-white ml-1" fill="currentColor" />
        </div>
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="text-lg font-bold text-white mb-1 line-clamp-2">
          {module.title}
        </h3>
        {module.description && (
          <p className="text-sm text-gray-300 line-clamp-2 mb-2 opacity-80">
            {module.description}
          </p>
        )}
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>{module.lessonsCount} aulas</span>
        </div>
      </div>

      {/* Hover Border Effect */}
      <div
        className={cn(
          "absolute inset-0 border-2 rounded-xl transition-colors duration-300",
          isHovered ? "border-primary" : "border-transparent"
        )}
      />
    </div>
  );
};

export default ModuleCarousel;
