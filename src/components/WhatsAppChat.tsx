import { MessageCircle } from "lucide-react";

const WhatsAppChat = () => {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Chat mockup */}
          <div className="flex-1 flex justify-center">
            <div className="bg-card rounded-2xl shadow-xl border border-border p-4 max-w-sm w-full">
              {/* Chat header */}
              <div className="flex items-center gap-3 pb-4 border-b border-border">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                  P
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">Psicoterapeuta</p>
                  <p className="text-xs text-green-500">online</p>
                </div>
              </div>
              
              {/* Messages */}
              <div className="py-4 space-y-3">
                <div className="bg-primary/10 rounded-xl rounded-bl-sm p-3 max-w-[80%]">
                  <p className="text-sm text-foreground">
                    Olá! Vim do Mindset e gostaria de saber mais sobre o seu atendimento.
                  </p>
                  <p className="text-xs text-muted-foreground text-right mt-1">12:34</p>
                </div>
                <div className="bg-muted rounded-xl rounded-br-sm p-3 max-w-[80%] ml-auto">
                  <p className="text-sm text-foreground">
                    Olá! Fico feliz com seu interesse. Posso te ajudar com mais informações. 😊
                  </p>
                  <p className="text-xs text-muted-foreground text-right mt-1">12:35</p>
                </div>
              </div>
              
              {/* Input */}
              <div className="flex items-center gap-2 pt-3 border-t border-border">
                <div className="flex-1 bg-muted rounded-full px-4 py-2 text-sm text-muted-foreground">
                  Digite uma mensagem...
                </div>
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                  <MessageCircle size={18} className="text-primary-foreground" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 text-center lg:text-left">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Converse com o psicoterapeuta pelo WhatsApp
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
