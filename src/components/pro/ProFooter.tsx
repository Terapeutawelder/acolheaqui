import Logo from "@/components/Logo";
import { Link } from "react-router-dom";

const ProFooter = () => {
  return (
    <footer className="py-12 bg-card border-t border-border">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Logo size="sm" />
            <span className="text-muted-foreground">| Para profissionais</span>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              Para clientes
            </Link>
            <a href="#como-funciona" className="text-muted-foreground hover:text-foreground transition-colors">
              Como funciona
            </a>
            <a href="#precos" className="text-muted-foreground hover:text-foreground transition-colors">
              Planos
            </a>
            <a href="#faq" className="text-muted-foreground hover:text-foreground transition-colors">
              FAQ
            </a>
          </div>
          
          <p className="text-muted-foreground text-sm">
            © 2024 Mindset. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default ProFooter;
