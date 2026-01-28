import {
  MessageSquare,
  Zap,
  MousePointerClick,
  Clock,
  ArrowRightCircle,
  Type,
  Image as ImageIcon,
  Calendar,
  CreditCard,
  Bot
} from "lucide-react";

export default function AutomationSidebar() {
  const onDragStart = (event: React.DragEvent, nodeType: string, label: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.setData("application/reactflow/label", label);
    event.dataTransfer.effectAllowed = "move";
  };

  const menuItems = [
    {
      category: "Básico",
      items: [
        { type: "trigger", label: "Gatilho", icon: Zap, color: "text-orange-500" },
        { type: "message", label: "Mensagem", icon: MessageSquare, color: "text-green-500" },
        { type: "condition", label: "Condição", icon: ArrowRightCircle, color: "text-purple-500" },
        { type: "delay", label: "Esperar", icon: Clock, color: "text-blue-500" },
      ]
    },
    {
      category: "Interação",
      items: [
        { type: "buttons", label: "Botões Simples", icon: MousePointerClick, color: "text-blue-400" },
        { type: "button_message", label: "Mensagem do Botão", icon: MessageSquare, color: "text-pink-500" },
        { type: "cta", label: "Chamada à Ação", icon: MousePointerClick, color: "text-yellow-500" },
        { type: "input", label: "Pergunta", icon: Type, color: "text-violet-500" },
        { type: "wait_input", label: "Aguardar Resposta", icon: Clock, color: "text-cyan-500" },
      ]
    },
    {
      category: "Integração",
      items: [
        { type: "api", label: "Solicitação de API", icon: Zap, color: "text-orange-600" },
        { type: "webhook", label: "Webhook", icon: Zap, color: "text-yellow-600" },
        { type: "crm", label: "CRM", icon: ArrowRightCircle, color: "text-blue-600" },
        { type: "media", label: "Mídia", icon: ImageIcon, color: "text-pink-600" },
        { type: "calendar", label: "Calendário", icon: Calendar, color: "text-blue-600" },
        { type: "checkout", label: "Checkout", icon: CreditCard, color: "text-yellow-500" },
        { type: "ai_agent", label: "Agente IA", icon: Bot, color: "text-purple-600" },
      ]
    }
  ];

  return (
    <aside className="w-64 bg-card border-r border-border/50 h-full flex flex-col">
      <div className="p-4 border-b border-border/50">
        <h2 className="font-semibold text-sm text-foreground">Nós</h2>
        <p className="text-xs text-muted-foreground">Arraste ou clique</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {menuItems.map((section, idx) => (
          <div key={idx}>
            <h3 className="text-xs font-semibold text-muted-foreground mb-3">{section.category}</h3>
            <div className="space-y-2">
              {section.items.map((item) => (
                <div
                  key={item.type}
                  onDragStart={(event) => onDragStart(event, item.type, item.label)}
                  draggable
                  className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border/50 cursor-grab hover:border-primary/50 transition-colors group"
                >
                  <div className={`p-1.5 rounded-md bg-muted ${item.color} bg-opacity-10`}>
                    <item.icon size={16} className={item.color} />
                  </div>
                  <span className="text-sm font-medium text-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
