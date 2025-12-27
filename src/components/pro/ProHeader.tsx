import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { User, Menu, X } from "lucide-react";
import { useState } from "react";

const navItems = [
  { label: "Início", href: "#inicio" },
  { label: "Como funciona?", href: "#como-funciona" },
  { label: "Plano e preço", href: "#precos" },
  { label: "Cadastro simples", href: "#cadastro" },
  { label: "Dúvidas frequentes", href: "#faq" },
];

const ProHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/">
            <Logo size="sm" />
          </Link>
          <span className="text-sm text-muted-foreground font-medium">| Para profissionais</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6">
          {navItems.map((item) => (
            <button
              key={item.href}
              onClick={() => scrollToSection(item.href)}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/" className="hidden sm:block">
            <Button variant="outline" size="sm" className="flex items-center gap-2 border-border text-foreground hover:bg-muted">
              <User size={16} />
              Sou cliente
            </Button>
          </Link>
          
          <button
            onClick={() => scrollToSection("#precos")}
            className="hidden sm:block px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-full hover:bg-primary/90 transition-colors"
          >
            Faça parte
          </button>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-background border-t border-border">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-3">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => scrollToSection(item.href)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors text-left py-2"
              >
                {item.label}
              </button>
            ))}
            <Link to="/" className="mt-2">
              <Button variant="outline" size="sm" className="w-full flex items-center justify-center gap-2">
                <User size={16} />
                Sou cliente
              </Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default ProHeader;
