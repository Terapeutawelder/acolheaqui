import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Receipt,
  Settings,
  Plug,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  Menu,
  ChevronDown,
  Wallet,
} from "lucide-react";
import Logo from "@/components/Logo";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onLogout: () => void;
  userEmail?: string;
  userRole?: string | null;
}

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  children?: { id: string; label: string; icon: any }[];
}

const menuItems: MenuItem[] = [
  { id: "overview", label: "Visão Geral", icon: LayoutDashboard },
  { id: "professionals", label: "Profissionais", icon: Users },
  { id: "subscriptions", label: "Assinaturas", icon: CreditCard },
  { id: "payments", label: "Pagamentos", icon: Receipt },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { 
    id: "integrations", 
    label: "Integrações", 
    icon: Plug,
    children: [
      { id: "gateways", label: "Gateways de Pagamento", icon: Wallet },
    ]
  },
  { id: "settings", label: "Configurações", icon: Settings },
];

const AdminSidebar = ({ collapsed, onToggle, onLogout, userEmail, userRole }: AdminSidebarProps) => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get("tab") || "overview";
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        <Link to="/admin" className={cn(collapsed && "mx-auto")}>
          <Logo size="sm" variant="light" />
        </Link>
        <button
          onClick={onToggle}
          className={cn(
            "p-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-600 text-slate-400 hover:text-white transition-colors hidden lg:block",
            collapsed && "hidden"
          )}
        >
          <ChevronLeft size={18} />
        </button>
      </div>

      {/* Admin Badge */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-slate-700">
          <div className="flex items-center gap-2 text-primary">
            <Shield size={16} />
            <span className="text-sm font-medium">
              {userRole === "super_admin" ? "Super Admin" : "Admin"}
            </span>
          </div>
        </div>
      )}

      {/* Expand button when collapsed */}
      {collapsed && (
        <button
          onClick={onToggle}
          className="mx-auto mt-4 p-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-600 text-slate-400 hover:text-white transition-colors hidden lg:block"
        >
          <ChevronRight size={18} />
        </button>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          if (item.children && item.children.length > 0) {
            const isChildActive = item.children.some((child) => currentTab === child.id);
            const isParentActive = currentTab === item.id || isChildActive;

            return (
              <Collapsible key={item.id} defaultOpen={isParentActive}>
                <CollapsibleTrigger asChild>
                  <button
                    className={cn(
                      "flex items-center justify-between w-full px-3 py-2.5 rounded-xl transition-all duration-200",
                      isParentActive
                        ? "bg-gradient-to-r from-primary/20 to-primary/5 text-primary"
                        : "text-slate-400 hover:bg-slate-700/50 hover:text-white"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={18} className={cn(collapsed && "mx-auto")} />
                      {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                    </div>
                    {!collapsed && (
                      <ChevronDown size={16} className="transition-transform duration-200 group-data-[state=open]:rotate-180" />
                    )}
                  </button>
                </CollapsibleTrigger>
                {!collapsed && (
                  <CollapsibleContent className="pl-6 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.id}
                        to={`/admin?tab=${child.id}`}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm",
                          currentTab === child.id
                            ? "bg-primary/10 text-primary border-l-2 border-primary"
                            : "text-slate-400 hover:bg-slate-700/50 hover:text-white"
                        )}
                      >
                        <child.icon size={16} />
                        <span>{child.label}</span>
                      </Link>
                    ))}
                  </CollapsibleContent>
                )}
              </Collapsible>
            );
          }

          return (
            <Link
              key={item.id}
              to={`/admin?tab=${item.id}`}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                currentTab === item.id
                  ? "bg-gradient-to-r from-primary/20 to-primary/5 text-primary border-l-2 border-primary"
                  : "text-slate-400 hover:bg-slate-700/50 hover:text-white"
              )}
            >
              <item.icon size={18} className={cn(collapsed && "mx-auto")} />
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User info and logout */}
      <div className="p-4 border-t border-slate-700 space-y-3">
        {!collapsed && userEmail && (
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-700/30">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Shield size={14} className="text-primary" />
            </div>
            <span className="text-sm text-slate-400 truncate">{userEmail}</span>
          </div>
        )}
        <button
          onClick={() => {
            setMobileOpen(false);
            onLogout();
          }}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all w-full",
            collapsed && "justify-center"
          )}
        >
          <LogOut size={18} />
          {!collapsed && <span className="font-medium">Sair</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed top-4 left-4 z-50 lg:hidden bg-slate-800 text-white hover:bg-slate-700"
          >
            <Menu size={20} />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0 bg-slate-800 border-slate-700">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen bg-slate-800 border-r border-slate-700 flex-col transition-all duration-300 z-40 hidden lg:flex",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <SidebarContent />
      </aside>
    </>
  );
};

export default AdminSidebar;
