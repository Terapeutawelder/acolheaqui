import { useState } from "react";
import { 
  Calendar, 
  Bot, 
  Bell, 
  MessageSquare, 
  Users, 
  BarChart3,
  CheckCircle2,
  Clock,
  Smartphone
} from "lucide-react";

const features = [
  {
    id: "dashboard",
    title: "Dashboard Completo",
    description: "Tenha visão completa da sua agenda, pacientes e finanças em um único lugar.",
    icon: BarChart3,
  },
  {
    id: "calendar",
    title: "Calendário Inteligente",
    description: "Gerencie sua disponibilidade e visualize todos os agendamentos de forma clara.",
    icon: Calendar,
  },
  {
    id: "ai-agent",
    title: "Agentes de IA",
    description: "Automatize agendamentos e respostas com assistentes de IA integrados.",
    icon: Bot,
  },
  {
    id: "notifications",
    title: "Notificações WhatsApp",
    description: "Receba alertas de novos agendamentos direto no seu WhatsApp.",
    icon: Bell,
  },
];

// Dashboard Mockup Component
const DashboardMockup = () => (
  <div className="bg-[hsl(215,35%,10%)] rounded-2xl p-6 border border-white/10">
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
        <Users className="w-5 h-5 text-primary" />
      </div>
      <div>
        <p className="text-white font-medium">Olá, Dra. Maria</p>
        <p className="text-white/50 text-sm">Seu resumo de hoje</p>
      </div>
    </div>
    
    <div className="grid grid-cols-3 gap-4 mb-6">
      <div className="bg-[hsl(215,35%,15%)] rounded-xl p-4 text-center">
        <p className="text-3xl font-bold text-primary">12</p>
        <p className="text-white/50 text-xs">Consultas hoje</p>
      </div>
      <div className="bg-[hsl(215,35%,15%)] rounded-xl p-4 text-center">
        <p className="text-3xl font-bold text-emerald-400">28</p>
        <p className="text-white/50 text-xs">Esta semana</p>
      </div>
      <div className="bg-[hsl(215,35%,15%)] rounded-xl p-4 text-center">
        <p className="text-3xl font-bold text-amber-400">95%</p>
        <p className="text-white/50 text-xs">Taxa presença</p>
      </div>
    </div>
    
    <div className="space-y-3">
      <p className="text-white/70 text-sm font-medium">Próximas consultas</p>
      {[
        { name: "João Silva", time: "09:00", status: "confirmed" },
        { name: "Ana Costa", time: "10:30", status: "confirmed" },
        { name: "Pedro Lima", time: "14:00", status: "pending" },
      ].map((appointment, i) => (
        <div key={i} className="flex items-center justify-between bg-[hsl(215,35%,15%)] rounded-lg p-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
              <span className="text-primary text-sm font-medium">{appointment.name[0]}</span>
            </div>
            <div>
              <p className="text-white text-sm font-medium">{appointment.name}</p>
              <p className="text-white/50 text-xs">{appointment.time}</p>
            </div>
          </div>
          <CheckCircle2 className={`w-5 h-5 ${appointment.status === 'confirmed' ? 'text-emerald-400' : 'text-amber-400'}`} />
        </div>
      ))}
    </div>
  </div>
);

// Calendar Mockup Component
const CalendarMockup = () => {
  const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const currentDate = new Date();
  const appointments = [8, 10, 12, 15, 18, 22, 25]; // Days with appointments
  
  return (
    <div className="bg-[hsl(215,35%,10%)] rounded-2xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-semibold">Janeiro 2025</h3>
        <div className="flex gap-2">
          <button className="w-8 h-8 rounded-lg bg-[hsl(215,35%,15%)] text-white/50 hover:text-white transition-colors">‹</button>
          <button className="w-8 h-8 rounded-lg bg-[hsl(215,35%,15%)] text-white/50 hover:text-white transition-colors">›</button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-2 mb-2">
        {days.map((day) => (
          <div key={day} className="text-center text-white/50 text-xs py-2">{day}</div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
          <button
            key={day}
            className={`
              aspect-square rounded-lg text-sm font-medium transition-all
              ${day === 15 ? 'bg-primary text-white' : ''}
              ${appointments.includes(day) && day !== 15 ? 'bg-primary/20 text-primary' : ''}
              ${!appointments.includes(day) && day !== 15 ? 'bg-[hsl(215,35%,15%)] text-white/70 hover:bg-[hsl(215,35%,20%)]' : ''}
            `}
          >
            {day}
          </button>
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t border-white/10">
        <p className="text-white/70 text-sm mb-3">Horários disponíveis - 15 Jan</p>
        <div className="flex flex-wrap gap-2">
          {["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"].map((time) => (
            <button
              key={time}
              className="px-3 py-1.5 bg-[hsl(215,35%,15%)] rounded-lg text-white/70 text-sm hover:bg-primary/20 hover:text-primary transition-colors"
            >
              {time}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// AI Agent Mockup Component
const AIAgentMockup = () => (
  <div className="bg-[hsl(215,35%,10%)] rounded-2xl p-6 border border-white/10">
    <div className="flex items-center gap-3 mb-6">
      <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/50 rounded-xl flex items-center justify-center">
        <Bot className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-white font-medium">Agente de Agendamento</p>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-emerald-400 text-sm">Online</span>
        </div>
      </div>
    </div>
    
    <div className="space-y-4 mb-6">
      <div className="flex gap-3">
        <div className="w-8 h-8 bg-white/10 rounded-full flex-shrink-0 flex items-center justify-center">
          <span className="text-white/70 text-sm">P</span>
        </div>
        <div className="bg-[hsl(215,35%,15%)] rounded-2xl rounded-tl-none p-3 max-w-[80%]">
          <p className="text-white/80 text-sm">Olá! Gostaria de agendar uma consulta para essa semana.</p>
        </div>
      </div>
      
      <div className="flex gap-3 justify-end">
        <div className="bg-primary/20 rounded-2xl rounded-tr-none p-3 max-w-[80%]">
          <p className="text-white/80 text-sm">Olá! Sou o assistente da Dra. Maria. Temos horários disponíveis na quinta-feira às 14h ou sexta às 10h. Qual prefere?</p>
        </div>
        <div className="w-8 h-8 bg-primary/30 rounded-full flex-shrink-0 flex items-center justify-center">
          <Bot className="w-4 h-4 text-primary" />
        </div>
      </div>
      
      <div className="flex gap-3">
        <div className="w-8 h-8 bg-white/10 rounded-full flex-shrink-0 flex items-center justify-center">
          <span className="text-white/70 text-sm">P</span>
        </div>
        <div className="bg-[hsl(215,35%,15%)] rounded-2xl rounded-tl-none p-3 max-w-[80%]">
          <p className="text-white/80 text-sm">Quinta às 14h seria perfeito!</p>
        </div>
      </div>
      
      <div className="flex gap-3 justify-end">
        <div className="bg-primary/20 rounded-2xl rounded-tr-none p-3 max-w-[80%]">
          <p className="text-white/80 text-sm">Perfeito! ✓ Agendado: Quinta, 16/01 às 14h. Enviarei um lembrete no dia anterior.</p>
        </div>
        <div className="w-8 h-8 bg-primary/30 rounded-full flex-shrink-0 flex items-center justify-center">
          <Bot className="w-4 h-4 text-primary" />
        </div>
      </div>
    </div>
    
    <div className="flex items-center gap-2 text-white/50 text-sm bg-[hsl(215,35%,15%)] rounded-lg p-3">
      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
      <span>Agendamento automático concluído</span>
    </div>
  </div>
);

// WhatsApp Notification Mockup Component
const WhatsAppNotificationMockup = () => (
  <div className="bg-[hsl(215,35%,10%)] rounded-2xl p-6 border border-white/10">
    <div className="flex items-center gap-3 mb-6">
      <Smartphone className="w-6 h-6 text-white/70" />
      <p className="text-white/70 text-sm">Prévia de Notificação</p>
    </div>
    
    {/* Phone mockup */}
    <div className="relative mx-auto w-64 bg-black rounded-[2rem] p-2 border-4 border-gray-800">
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-full z-10" />
      
      <div className="bg-[#0b141a] rounded-[1.5rem] overflow-hidden">
        {/* Status bar */}
        <div className="bg-[#1f2c34] px-4 py-2 flex items-center justify-between">
          <span className="text-white/70 text-xs">09:41</span>
          <div className="flex items-center gap-1">
            <div className="w-4 h-2 border border-white/50 rounded-sm">
              <div className="w-3/4 h-full bg-white/50 rounded-sm" />
            </div>
          </div>
        </div>
        
        {/* WhatsApp header */}
        <div className="bg-[#1f2c34] px-4 py-3 flex items-center gap-3 border-b border-white/10">
          <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-medium text-sm">Mindset</p>
            <p className="text-white/50 text-xs">Notificações</p>
          </div>
        </div>
        
        {/* Messages */}
        <div className="p-4 space-y-3 min-h-[280px]">
          <div className="bg-[#005c4b] rounded-lg rounded-tl-none p-3 max-w-[90%] ml-auto">
            <p className="text-white text-sm mb-1">🔔 <strong>Novo Agendamento!</strong></p>
            <p className="text-white/90 text-xs leading-relaxed">
              Paciente: João Silva<br/>
              Data: 16/01/2025<br/>
              Horário: 14:00<br/>
              Tipo: Primeira consulta
            </p>
            <p className="text-white/50 text-[10px] text-right mt-2">09:32</p>
          </div>
          
          <div className="bg-[#005c4b] rounded-lg rounded-tl-none p-3 max-w-[90%] ml-auto">
            <p className="text-white text-sm mb-1">⏰ <strong>Lembrete</strong></p>
            <p className="text-white/90 text-xs leading-relaxed">
              Você tem 3 consultas amanhã.<br/>
              Primeira às 09:00.
            </p>
            <p className="text-white/50 text-[10px] text-right mt-2">20:00</p>
          </div>
          
          <div className="bg-[#005c4b] rounded-lg rounded-tl-none p-3 max-w-[90%] ml-auto">
            <p className="text-white text-sm mb-1">✅ <strong>Confirmação</strong></p>
            <p className="text-white/90 text-xs leading-relaxed">
              Ana Costa confirmou presença para amanhã às 10:30.
            </p>
            <p className="text-white/50 text-[10px] text-right mt-2">21:15</p>
          </div>
        </div>
      </div>
    </div>
    
    <div className="mt-6 flex items-center justify-center gap-2 text-white/50 text-sm">
      <Bell className="w-4 h-4" />
      <span>Notificações em tempo real</span>
    </div>
  </div>
);

const FeaturesShowcaseSection = () => {
  const [activeFeature, setActiveFeature] = useState("dashboard");
  
  const renderMockup = () => {
    switch (activeFeature) {
      case "dashboard":
        return <DashboardMockup />;
      case "calendar":
        return <CalendarMockup />;
      case "ai-agent":
        return <AIAgentMockup />;
      case "notifications":
        return <WhatsAppNotificationMockup />;
      default:
        return <DashboardMockup />;
    }
  };
  
  const activeFeatureData = features.find(f => f.id === activeFeature);

  return (
    <section id="funcionalidades" className="py-20 bg-[hsl(215,35%,8%)]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            Funcionalidades
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Tudo que você precisa em um só lugar
          </h2>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Uma plataforma completa para gerenciar sua agenda, pacientes e automatizar seu atendimento
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Feature selector */}
          <div className="space-y-4">
            {features.map((feature) => (
              <button
                key={feature.id}
                onClick={() => setActiveFeature(feature.id)}
                className={`
                  w-full text-left p-6 rounded-2xl transition-all duration-300
                  ${activeFeature === feature.id 
                    ? 'bg-primary/20 border-2 border-primary shadow-lg shadow-primary/20' 
                    : 'bg-[hsl(215,35%,12%)] border-2 border-transparent hover:border-white/20'
                  }
                `}
              >
                <div className="flex items-start gap-4">
                  <div className={`
                    w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                    ${activeFeature === feature.id ? 'bg-primary' : 'bg-white/10'}
                  `}>
                    <feature.icon className={`w-6 h-6 ${activeFeature === feature.id ? 'text-white' : 'text-white/70'}`} />
                  </div>
                  <div>
                    <h3 className={`text-lg font-bold mb-1 ${activeFeature === feature.id ? 'text-primary' : 'text-white'}`}>
                      {feature.title}
                    </h3>
                    <p className="text-white/60 text-sm">{feature.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Mockup display */}
          <div className="lg:sticky lg:top-8">
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent rounded-3xl blur-xl" />
              
              {/* Mockup container */}
              <div className="relative">
                {renderMockup()}
              </div>
            </div>
            
            {/* Active feature label */}
            <div className="mt-6 text-center">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-[hsl(215,35%,12%)] rounded-full text-white/70 text-sm">
                {activeFeatureData && <activeFeatureData.icon className="w-4 h-4 text-primary" />}
                {activeFeatureData?.title}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesShowcaseSection;
