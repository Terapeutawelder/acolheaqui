import { Heart } from "lucide-react";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "light";
}

const Logo = ({ className = "", size = "md", variant = "default" }: LogoProps) => {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-4xl",
  };

  const iconSizes = {
    sm: 20,
    md: 28,
    lg: 40,
  };

  const textColor = variant === "light" ? "text-white" : "text-foreground";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Heart className="text-primary animate-pulse" size={iconSizes[size]} strokeWidth={2} fill="currentColor" />
      <span className={`font-bold ${sizeClasses[size]}`}>
        <span className={textColor}>Acolhe</span>
        <span className="text-primary">Aqui</span>
      </span>
    </div>
  );
};

export default Logo;
