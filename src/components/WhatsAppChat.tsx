import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const WhatsAppChat = () => {
  const [showMessage1, setShowMessage1] = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  const [showMessage2, setShowMessage2] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    const section = document.getElementById('whatsapp-chat-section');
    if (section) {
      observer.observe(section);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    // Start animation sequence
    const timer1 = setTimeout(() => setShowMessage1(true), 500);
    const timer2 = setTimeout(() => setShowTyping(true), 1500);
    const timer3 = setTimeout(() => {
      setShowTyping(false);
      setShowMessage2(true);
    }, 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isVisible]);

  return (
    <section 
      id="whatsapp-chat-section"
      className="py-16 md:py-24 bg-gradient-to-br from-secondary/50 to-muted/30"
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Content - Left side */}
          <div className="flex-1 text-center lg:text-left order-2 lg:order-1">
            {/* WhatsApp badge */}
            <div className="flex items-center gap-2 justify-center lg:justify-start mb-6">
              <svg 
                viewBox="0 0 24 24" 
                className="w-6 h-6 text-[#25D366]"
                fill="currentColor"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span className="text-foreground font-medium">Agendar pelo WhatsApp</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
              Converse com o(a)<br />
              psicoterapeuta pelo<br />
              <span className="text-[#25D366]">WhatsApp</span>
            </h2>
            
            <p className="text-muted-foreground mb-8 max-w-md mx-auto lg:mx-0 text-lg">
              Um primeiro contato simples e direto para entender como ele pode te acolher.
            </p>
            
            <Link to="/psicoterapeutas">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg rounded-xl group"
              >
                Buscar psicoterapeutas
                <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
          
          {/* WhatsApp mockup - Right side */}
          <div className="flex-1 flex justify-center order-1 lg:order-2">
            <div className="relative">
              {/* Phone frame */}
              <div className="w-[280px] md:w-[320px] bg-card rounded-[2rem] p-2 shadow-2xl border border-border">
                {/* Screen */}
                <div className="bg-[#ece5dd] rounded-[1.5rem] overflow-hidden">
                  {/* Chat header */}
                  <div className="bg-[#075E54] px-4 py-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center">
                      <span className="text-white font-bold text-lg">P</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium text-sm">Psicoterapeuta</p>
                      <p className="text-white/80 text-xs">online</p>
                    </div>
                  </div>
                  
                  {/* Chat background */}
                  <div 
                    className="h-[340px] md:h-[380px] p-3 space-y-3 overflow-hidden flex flex-col"
                    style={{ 
                      backgroundColor: '#ece5dd',
                    }}
                  >
                    {/* User message with animation */}
                    <div 
                      className={`flex justify-end transition-all duration-500 ${
                        showMessage1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                      }`}
                    >
                      <div className="bg-[#DCF8C6] rounded-lg rounded-tr-sm px-3 py-2 max-w-[80%] shadow-sm">
                        <p className="text-gray-800 text-sm">
                          Olá! Vim do mindset e gostaria de saber mais sobre o seu atendimento.
                        </p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <span className="text-gray-500 text-[10px]">12:34</span>
                          <Check size={12} className="text-blue-500" />
                          <Check size={12} className="text-blue-500 -ml-2" />
                        </div>
                      </div>
                    </div>

                    {/* Typing indicator */}
                    <div 
                      className={`flex justify-start transition-all duration-300 ${
                        showTyping ? 'opacity-100' : 'opacity-0 h-0'
                      }`}
                    >
                      <div className="bg-white rounded-lg rounded-tl-sm px-4 py-3 shadow-sm">
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>

                    {/* Therapist message with animation */}
                    <div 
                      className={`flex justify-start transition-all duration-500 ${
                        showMessage2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                      }`}
                    >
                      <div className="bg-white rounded-lg rounded-tl-sm px-3 py-2 max-w-[80%] shadow-sm">
                        <p className="text-gray-800 text-sm">
                          Olá! Fico feliz em te ajudar.<br />
                          Como posso te acolher hoje?
                        </p>
                        <p className="text-gray-500 text-[10px] text-right mt-1">12:34</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Subtle glow effect using design system */}
              <div className="absolute -inset-4 bg-primary/10 rounded-[3rem] blur-2xl -z-10" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatsAppChat;
