import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import StudentSidebar from "./StudentSidebar";
import StudentHero from "./StudentHero";
import ModuleCarousel from "./ModuleCarousel";
import StudentModuleView from "./StudentModuleView";
import { useMemberProgress } from "@/hooks/useMemberProgress";

interface Professional {
  id: string;
  fullName: string;
  avatarUrl: string | null;
}

interface Module {
  id: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  isPublished: boolean;
  lessonsCount: number;
}

interface StudentAreaLayoutProps {
  professional: Professional;
  isOwnerPreview?: boolean;
}

const StudentAreaLayout = ({ professional, isOwnerPreview = false }: StudentAreaLayoutProps) => {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  const { getCompletedLessons } = useMemberProgress(professional.id);
  const completedLessons = getCompletedLessons();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user name
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("user_id", user.id)
            .single();
          
          if (profile?.full_name) {
            setUserName(profile.full_name.split(" ")[0]);
          }
        }

        // Fetch modules with lesson count
        const { data: modulesData, error } = await supabase
          .from("member_modules")
          .select(`
            id,
            title,
            description,
            thumbnail_url,
            is_published,
            order_index
          `)
          .eq("professional_id", professional.id)
          .eq("is_published", true)
          .order("order_index", { ascending: true });

        if (error) throw error;

        // Get lesson counts for each module
        const modulesWithCounts = await Promise.all(
          (modulesData || []).map(async (module) => {
            const { count } = await supabase
              .from("member_lessons")
              .select("*", { count: "exact", head: true })
              .eq("module_id", module.id);

            return {
              id: module.id,
              title: module.title,
              description: module.description,
              thumbnailUrl: module.thumbnail_url,
              isPublished: module.is_published || false,
              lessonsCount: count || 0,
            };
          })
        );

        setModules(modulesWithCounts);
      } catch (error) {
        console.error("Error fetching modules:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [professional.id]);

  // Calculate overall progress
  const getTotalLessons = () => modules.reduce((acc, m) => acc + m.lessonsCount, 0);
  const getOverallProgress = () => {
    const total = getTotalLessons();
    if (total === 0) return 0;
    return Math.round((completedLessons.size / total) * 100);
  };

  // Group modules into categories (for now, just one group)
  const moduleGroups = [
    {
      title: "Todos os Conteúdos",
      modules: modules,
    },
  ];

  // Find the first module with incomplete lessons for "Continue Watching"
  const getContinueWatching = () => {
    return modules.find((m) => m.lessonsCount > 0);
  };

  if (selectedModuleId) {
    return (
      <StudentModuleView
        moduleId={selectedModuleId}
        professionalId={professional.id}
        onBack={() => setSelectedModuleId(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Owner Preview Banner */}
      {isOwnerPreview && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-primary/90 backdrop-blur-sm text-white text-center py-2 text-sm font-medium">
          👁️ Modo Visualização — Você está vendo como seus alunos verão
        </div>
      )}

      {/* Sidebar */}
      <StudentSidebar
        professional={professional}
        modules={modules}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onSelectModule={(id) => {
          setSelectedModuleId(id);
          setActiveSection("courses");
        }}
        overallProgress={getOverallProgress()}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? "ml-20" : "ml-72"} ${isOwnerPreview ? "mt-10" : ""}`}>
        {loading ? (
          <div className="flex items-center justify-center h-screen">
            <div className="animate-spin w-10 h-10 border-3 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="pb-12">
            {/* Hero Section */}
            <StudentHero
              userName={userName}
              professionalName={professional.fullName}
              continueModule={getContinueWatching()}
              onContinue={(moduleId) => setSelectedModuleId(moduleId)}
              overallProgress={getOverallProgress()}
              totalLessons={getTotalLessons()}
              completedLessons={completedLessons.size}
            />

            {/* Module Carousels */}
            <div className="space-y-10 px-8 mt-8">
              {moduleGroups.map((group, index) => (
                <ModuleCarousel
                  key={index}
                  title={group.title}
                  modules={group.modules}
                  onSelectModule={setSelectedModuleId}
                  completedLessons={completedLessons}
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentAreaLayout;
