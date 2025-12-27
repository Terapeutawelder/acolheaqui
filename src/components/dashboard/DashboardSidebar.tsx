import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, CreditCard, Clock, Calendar, LogOut, ChevronLeft, ChevronRight, User } from "lucide-react";
import Logo from "@/components/Logo";
import { cn } from "@/lib/utils";

interface DashboardSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onLogout: () => void;
  userEmail?: string;
}

const menuItems = [
  { id: "overview", label: "Visão Geral", icon: LayoutDashboard },
  { id: "payments", label: "Pagamentos", icon: CreditCard },
  { id: "hours", label: "Horários", icon: Clock },
  { id: "appointments", label: "Agendamentos", icon: Calendar },
];

const DashboardSidebar = ({ collapsed, onToggle, onLogout, userEmail }: DashboardSidebarProps) => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get("tab") || "overview";

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-[hsl(215,35%,12%)] border-r border-white/10 flex flex-col transition-all duration-300 z-50",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <Link to="/" className={cn(collapsed && "mx-auto")}>
          <Logo size="sm" />
        </Link>
        <button
          onClick={onToggle}
          className={cn(
            "p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors",
            collapsed && "hidden"
          )}
        >
          <ChevronLeft size={18} />
        </button>
      </div>

      {/* Expand button when collapsed */}
      {collapsed && (
        <button
          onClick={onToggle}
          className="mx-auto mt-4 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.id}
            to={`/dashboard?tab=${item.id}`}
            className={cn(
              "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200",
              currentTab === item.id
                ? "bg-gradient-to-r from-primary/20 to-primary/5 text-primary border-l-2 border-primary"
                : "text-white/70 hover:bg-white/5 hover:text-white"
            )}
          >
            <item.icon size={20} className={cn(collapsed && "mx-auto")} />
            {!collapsed && <span className="font-medium">{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* User info and logout */}
      <div className="p-4 border-t border-white/10 space-y-3">
        {!collapsed && userEmail && (
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <User size={16} className="text-primary" />
            </div>
            <span className="text-sm text-white/70 truncate">{userEmail}</span>
          </div>
        )}
        <button
          onClick={onLogout}
          className={cn(
            "flex items-center gap-3 px-3 py-3 rounded-xl text-white/70 hover:bg-red-500/10 hover:text-red-400 transition-all w-full",
            collapsed && "justify-center"
          )}
        >
          <LogOut size={20} />
          {!collapsed && <span className="font-medium">Sair</span>}
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
