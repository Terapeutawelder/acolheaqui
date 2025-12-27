import whatsappMockup from "@/assets/whatsapp-mockup.png";

const WhatsAppChat = () => {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* WhatsApp mockup image */}
          <div className="flex-1 flex justify-center">
            <div className="relative">
              <img 
                src={whatsappMockup} 
                alt="Conversa no WhatsApp com psicoterapeuta"
                className="max-w-xs md:max-w-sm rounded-3xl shadow-2xl"
              />
              {/* Glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-green-500/20 to-primary/20 rounded-3xl blur-2xl -z-10" />
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 text-center lg:text-left">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Converse com psicoterapeutas pelo WhatsApp
            </h2>
            <p className="text-muted-foreground mb-6 max-w-lg">
              Um primeiro contato simples e direto para entender como o profissional pode te acolher. 
              Sem formulários, sem burocracia.
            </p>
            <ul className="space-y-3 text-left max-w-lg mx-auto lg:mx-0">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary text-xs">✓</span>
                </span>
                <span className="text-muted-foreground text-sm">
                  Tire suas dúvidas sobre o atendimento
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary text-xs">✓</span>
                </span>
                <span className="text-muted-foreground text-sm">
                  Agende sua primeira sessão de forma prática
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary text-xs">✓</span>
                </span>
                <span className="text-muted-foreground text-sm">
                  Escolha entre atendimento online ou presencial
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatsAppChat;
