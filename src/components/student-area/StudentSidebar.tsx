import {
  Home,
  BookOpen,
  Trophy,
  MessageCircle,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Module {
  id: string;
  title: string;
  lessonsCount: number;
}

interface Professional {
  id: string;
  fullName: string;
  avatarUrl: string | null;
}

interface StudentSidebarProps {
  professional: Professional;
  modules: Module[];
  collapsed: boolean;
  onToggleCollapse: () => void;
  onSelectModule: (moduleId: string) => void;
  overallProgress: number;
}

const StudentSidebar = ({
  professional,
  modules,
  collapsed,
  onToggleCollapse,
  onSelectModule,
  overallProgress,
}: StudentSidebarProps) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const menuItems = [
    { icon: Home, label: "Início", action: () => {} },
    { icon: BookOpen, label: "Meus Cursos", action: () => {} },
    { icon: Trophy, label: "Certificados", action: () => {} },
    { icon: MessageCircle, label: "Comunidade", action: () => {} },
    { icon: Settings, label: "Configurações", action: () => {} },
  ];

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-gray-900/95 backdrop-blur-xl border-r border-gray-800 z-50 transition-all duration-300 flex flex-col",
        collapsed ? "w-20" : "w-72"
      )}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className={cn("flex items-center gap-3", collapsed && "justify-center w-full")}>
          <Avatar className="w-10 h-10 ring-2 ring-primary/50">
            <AvatarImage src={professional.avatarUrl || undefined} />
            <AvatarFallback className="bg-primary/20 text-primary">
              {professional.fullName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <h2 className="text-white font-semibold text-sm truncate">
                {professional.fullName}
              </h2>
              <p className="text-xs text-gray-400">Área de Membros</p>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className={cn(
            "text-gray-400 hover:text-white hover:bg-gray-800",
            collapsed && "absolute -right-3 top-6 bg-gray-900 border border-gray-800 rounded-full w-6 h-6"
          )}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* Progress */}
      {!collapsed && (
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span>Progresso Geral</span>
            <span className="text-primary font-medium">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-2 bg-gray-800" />
        </div>
      )}

      <Separator className="bg-gray-800" />

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={item.action}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors",
              collapsed && "justify-center px-0"
            )}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="text-sm">{item.label}</span>}
          </button>
        ))}

        {!collapsed && (
          <>
            <Separator className="bg-gray-800 my-4" />
            <div className="px-3 mb-2">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Módulos</p>
            </div>
            {modules.map((module) => (
              <button
                key={module.id}
                onClick={() => onSelectModule(module.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors text-left"
              >
                <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                <span className="text-sm truncate">{module.title}</span>
              </button>
            ))}
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors",
            collapsed && "justify-center px-0"
          )}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="text-sm">Sair</span>}
        </button>
      </div>
    </aside>
  );
};

export default StudentSidebar;
