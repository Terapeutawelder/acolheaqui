import HeroSection from "@/components/HeroSection";
import Marquee from "@/components/Marquee";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { User } from "lucide-react";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-transparent">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/">
          <Logo size="sm" />
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
            Para clientes
          </Link>
          <Link to="/profissionais" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Para profissionais
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link to="/">
            <Button variant="outline" size="sm" className="flex items-center gap-2 border-foreground/20 text-foreground hover:bg-foreground/10">
              <User size={16} />
              Sou cliente
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

const Profissionais = () => {
  return (
    <main className="min-h-screen pro-theme">
      <Header />
      <HeroSection />
      <Marquee />
      <CTASection />
      <Footer />
    </main>
  );
};

export default Profissionais;
