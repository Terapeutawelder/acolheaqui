import Logo from "./Logo";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-8 px-4 bg-background border-t border-border">
      <div className="container mx-auto flex flex-col items-center gap-4">
        <Logo size="sm" />
        <p className="text-sm text-muted-foreground">
          © Copyright {currentYear} - Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
