import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  CreditCard, 
  Clock, 
  Calendar, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  User,
  MessageCircle,
  DollarSign,
  CalendarCheck,
  Bot,
  Bell,
  Instagram,
  UserCheck,
  ShoppingCart,
  UserCircle,
  Settings,
  Heart
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onLogout: () => void;
  userEmail?: string;
}

const menuItems = [
  { id: "overview", label: "Dashboard", icon: LayoutDashboard, section: "principal" },
  { id: "profile", label: "Meu Perfil", icon: UserCircle, section: "principal" },
  { id: "appointments", label: "Agenda / CRM", icon: CalendarCheck, section: "principal" },
  { id: "finances", label: "Financeiro", icon: DollarSign, section: "principal" },
  { id: "hours", label: "Horários", icon: Clock, section: "principal" },
  { id: "checkout", label: "Checkout", icon: ShoppingCart, section: "premium" },
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle, section: "integrações" },
  { id: "google", label: "Google Calendar", icon: Calendar, section: "integrações" },
  { id: "ai-scheduling", label: "IA Agendamento", icon: Bot, section: "ia" },
  { id: "ai-notifications", label: "Notificações", icon: Bell, section: "ia" },
  { id: "ai-instagram", label: "IA Instagram", icon: Instagram, section: "ia" },
  { id: "ai-followup", label: "IA Follow-up", icon: UserCheck, section: "ia" },
];

const DashboardSidebar = ({ collapsed, onToggle, onLogout, userEmail }: DashboardSidebarProps) => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get("tab") || "overview";

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-card border-r border-border/50 flex flex-col transition-all duration-300 z-50",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="p-4 border-b border-border/50">
        <Link to="/" className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center neon-glow">
              <Heart className="h-5 w-5 text-white" />
            </div>
          </div>
          {!collapsed && (
            <div>
              <span className="text-lg font-bold text-foreground">AcolheAqui</span>
              <span className="block text-xs text-muted-foreground">Dashboard</span>
            </div>
          )}
        </Link>
      </div>

      {/* Toggle button */}
      <button
        onClick={onToggle}
        className={cn(
          "absolute -right-3 top-20 p-1.5 rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 transition-colors z-10",
          "neon-glow"
        )}
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-6 overflow-y-auto">
        {/* Principal */}
        <div>
          {!collapsed && (
            <p className="text-xs uppercase text-muted-foreground font-semibold px-3 mb-2 tracking-wider">
              Principal
            </p>
          )}
          <div className="space-y-1">
            {menuItems.filter(item => item.section === "principal").map((item) => (
              <Link
                key={item.id}
                to={`/dashboard?tab=${item.id}`}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                  currentTab === item.id
                    ? "bg-primary/10 text-primary neon-border"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon 
                  size={18} 
                  className={cn(
                    "transition-transform group-hover:scale-110",
                    collapsed && "mx-auto",
                    currentTab === item.id && "drop-shadow-[0_0_8px_hsl(262,83%,58%)]"
                  )} 
                />
                {!collapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
                {currentTab === item.id && !collapsed && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* Premium */}
        <div>
          {!collapsed && (
            <p className="text-xs uppercase text-muted-foreground font-semibold px-3 mb-2 tracking-wider flex items-center gap-2">
              Premium
              <span className="px-1.5 py-0.5 text-[10px] bg-primary/20 text-primary rounded-full">PRO</span>
            </p>
          )}
          <div className="space-y-1">
            {menuItems.filter(item => item.section === "premium").map((item) => (
              <Link
                key={item.id}
                to={`/dashboard?tab=${item.id}`}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                  currentTab === item.id
                    ? "bg-primary/10 text-primary neon-border"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon 
                  size={18} 
                  className={cn(
                    "transition-transform group-hover:scale-110",
                    collapsed && "mx-auto"
                  )} 
                />
                {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            ))}
          </div>
        </div>

        {/* Integrações */}
        <div>
          {!collapsed && (
            <p className="text-xs uppercase text-muted-foreground font-semibold px-3 mb-2 tracking-wider">
              Integrações
            </p>
          )}
          <div className="space-y-1">
            {menuItems.filter(item => item.section === "integrações").map((item) => (
              <Link
                key={item.id}
                to={`/dashboard?tab=${item.id}`}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                  currentTab === item.id
                    ? "bg-primary/10 text-primary neon-border"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon 
                  size={18} 
                  className={cn(
                    "transition-transform group-hover:scale-110",
                    collapsed && "mx-auto"
                  )} 
                />
                {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            ))}
          </div>
        </div>

        {/* IA */}
        <div>
          {!collapsed && (
            <p className="text-xs uppercase text-muted-foreground font-semibold px-3 mb-2 tracking-wider flex items-center gap-2">
              Agentes IA
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
            </p>
          )}
          <div className="space-y-1">
            {menuItems.filter(item => item.section === "ia").map((item) => (
              <Link
                key={item.id}
                to={`/dashboard?tab=${item.id}`}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                  currentTab === item.id
                    ? "bg-primary/10 text-primary neon-border"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon 
                  size={18} 
                  className={cn(
                    "transition-transform group-hover:scale-110",
                    collapsed && "mx-auto"
                  )} 
                />
                {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* User info and logout */}
      <div className="p-3 border-t border-border/50 space-y-2">
        {!collapsed && userEmail && (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-muted/50">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              <User size={14} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm text-foreground font-medium truncate block">
                {userEmail.split("@")[0]}
              </span>
              <span className="text-xs text-muted-foreground truncate block">
                {userEmail}
              </span>
            </div>
          </div>
        )}
        <button
          onClick={onLogout}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all w-full group",
            collapsed && "justify-center"
          )}
        >
          <LogOut size={18} className="group-hover:scale-110 transition-transform" />
          {!collapsed && <span className="text-sm font-medium">Sair</span>}
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
