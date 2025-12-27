import { Check, Phone, Video } from "lucide-react";
import avatar1 from "@/assets/avatar-1.jpg";

const WhatsAppChat = () => {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* WhatsApp mockup - built in code for legibility */}
          <div className="flex-1 flex justify-center">
            <div className="relative">
              {/* Phone frame */}
              <div className="w-[300px] md:w-[340px] bg-[#111b21] rounded-[2.5rem] p-2 shadow-2xl">
                {/* Screen */}
                <div className="bg-[#0b141a] rounded-[2rem] overflow-hidden">
                  {/* Status bar */}
                  <div className="bg-[#202c33] px-4 py-2 flex items-center justify-between text-white/70 text-xs">
                    <span>09:41</span>
                    <div className="flex items-center gap-1">
                      <span>●●●●</span>
                      <span>WiFi</span>
                      <span>100%</span>
                    </div>
                  </div>
                  
                  {/* Chat header */}
                  <div className="bg-[#202c33] px-3 py-2 flex items-center gap-3">
                    <div className="text-white/70">←</div>
                    <img 
                      src={avatar1} 
                      alt="Dra. Ana Silva" 
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-white font-medium text-sm">Dra. Ana Silva</p>
                      <p className="text-green-400 text-xs">online</p>
                    </div>
                    <div className="flex items-center gap-4 text-white/70">
                      <Video size={18} />
                      <Phone size={16} />
                    </div>
                  </div>
                  
                  {/* Chat background */}
                  <div 
                    className="h-[380px] p-3 space-y-2 overflow-hidden"
                    style={{ 
                      backgroundColor: '#0b141a',
                      backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.02"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
                    }}
                  >
                    {/* User message */}
                    <div className="flex justify-end">
                      <div className="bg-[#005c4b] rounded-lg rounded-tr-sm px-3 py-2 max-w-[85%]">
                        <p className="text-white text-sm">
                          Olá, Dra. Ana! Encontrei seu perfil no Mindset e gostaria de agendar uma sessão de terapia. 😊
                        </p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <span className="text-white/60 text-[10px]">09:32</span>
                          <Check size={12} className="text-blue-400" />
                          <Check size={12} className="text-blue-400 -ml-2" />
                        </div>
                      </div>
                    </div>

                    {/* Therapist message */}
                    <div className="flex justify-start">
                      <div className="bg-[#202c33] rounded-lg rounded-tl-sm px-3 py-2 max-w-[85%]">
                        <p className="text-white text-sm">
                          Olá! Fico feliz que tenha me encontrado pelo Mindset! 💜
                        </p>
                        <p className="text-white/60 text-[10px] text-right mt-1">09:33</p>
                      </div>
                    </div>

                    {/* Therapist message 2 */}
                    <div className="flex justify-start">
                      <div className="bg-[#202c33] rounded-lg rounded-tl-sm px-3 py-2 max-w-[85%]">
                        <p className="text-white text-sm">
                          Posso te atender online ou presencial. Tenho horários disponíveis esta semana. Qual formato prefere?
                        </p>
                        <p className="text-white/60 text-[10px] text-right mt-1">09:33</p>
                      </div>
                    </div>

                    {/* User message 2 */}
                    <div className="flex justify-end">
                      <div className="bg-[#005c4b] rounded-lg rounded-tr-sm px-3 py-2 max-w-[85%]">
                        <p className="text-white text-sm">
                          Prefiro online! Tem horário na quinta às 19h?
                        </p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <span className="text-white/60 text-[10px]">09:35</span>
                          <Check size={12} className="text-blue-400" />
                          <Check size={12} className="text-blue-400 -ml-2" />
                        </div>
                      </div>
                    </div>

                    {/* Therapist message 3 */}
                    <div className="flex justify-start">
                      <div className="bg-[#202c33] rounded-lg rounded-tl-sm px-3 py-2 max-w-[85%]">
                        <p className="text-white text-sm">
                          Perfeito! Quinta às 19h está confirmado. Te envio o link da sessão na véspera. Até lá! 🙂
                        </p>
                        <p className="text-white/60 text-[10px] text-right mt-1">09:36</p>
                      </div>
                    </div>
                  </div>

                  {/* Input bar */}
                  <div className="bg-[#202c33] px-3 py-2 flex items-center gap-2">
                    <div className="text-white/50 text-xl">😊</div>
                    <div className="flex-1 bg-[#2a3942] rounded-full px-4 py-2 text-white/50 text-sm">
                      Mensagem
                    </div>
                    <div className="w-10 h-10 bg-[#00a884] rounded-full flex items-center justify-center">
                      <span className="text-white text-lg">🎤</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-green-500/20 to-primary/20 rounded-[3rem] blur-2xl -z-10" />
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
