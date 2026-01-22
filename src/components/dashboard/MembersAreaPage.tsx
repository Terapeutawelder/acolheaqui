import { useState } from "react";
import { 
  Play, 
  Lock, 
  Clock, 
  Users, 
  Star,
  ChevronRight,
  Plus,
  Settings,
  Upload,
  Video,
  FileText,
  Folder,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Search
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// Mock data for modules
const mockModules = [
  {
    id: "1",
    title: "Introdução à Terapia Online",
    description: "Aprenda os fundamentos da terapia online e como atender seus pacientes remotamente.",
    thumbnail: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=600&fit=crop",
    lessonsCount: 8,
    totalDuration: "2h 30min",
    isPublished: true,
    order: 1,
  },
  {
    id: "2", 
    title: "Técnicas de Acolhimento",
    description: "Domine as melhores técnicas para acolher e criar vínculo com seus pacientes.",
    thumbnail: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=400&h=600&fit=crop",
    lessonsCount: 12,
    totalDuration: "4h 15min",
    isPublished: true,
    order: 2,
  },
  {
    id: "3",
    title: "Gestão de Consultório",
    description: "Organize seu consultório, agenda e finanças de forma profissional.",
    thumbnail: "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=400&h=600&fit=crop",
    lessonsCount: 6,
    totalDuration: "1h 45min",
    isPublished: false,
    order: 3,
  },
  {
    id: "4",
    title: "Marketing para Terapeutas",
    description: "Estratégias de marketing digital para atrair mais pacientes.",
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=600&fit=crop",
    lessonsCount: 10,
    totalDuration: "3h 20min",
    isPublished: true,
    order: 4,
  },
];

// Mock stats
const mockStats = {
  totalMembers: 156,
  activeMembers: 142,
  totalModules: 4,
  totalLessons: 36,
  averageRating: 4.8,
};

const ModuleCard = ({ 
  module, 
  index,
  onEdit,
  onDelete,
  onView 
}: { 
  module: typeof mockModules[0];
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="group relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer transition-all duration-500"
      style={{ 
        animationDelay: `${index * 100}ms`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Image */}
      <div 
        className={cn(
          "absolute inset-0 bg-cover bg-center transition-transform duration-700",
          isHovered && "scale-110"
        )}
        style={{ backgroundImage: `url(${module.thumbnail})` }}
      />
      
      {/* Gradient Overlay */}
      <div className={cn(
        "absolute inset-0 transition-opacity duration-500",
        "bg-gradient-to-t from-black via-black/60 to-transparent",
        isHovered && "opacity-90"
      )} />

      {/* Red/Purple Accent Glow */}
      <div className={cn(
        "absolute inset-0 opacity-0 transition-opacity duration-500",
        "bg-gradient-to-br from-primary/40 via-transparent to-primary/20",
        isHovered && "opacity-100"
      )} />

      {/* Status Badge */}
      <div className="absolute top-3 right-3 z-10">
        {module.isPublished ? (
          <Badge className="bg-green-500/90 hover:bg-green-500 text-white text-xs">
            Publicado
          </Badge>
        ) : (
          <Badge variant="secondary" className="bg-gray-800/90 text-gray-300 text-xs">
            <Lock className="w-3 h-3 mr-1" />
            Rascunho
          </Badge>
        )}
      </div>

      {/* Module Order Badge */}
      <div className="absolute top-3 left-3 z-10">
        <div className="w-8 h-8 rounded-lg bg-primary/90 flex items-center justify-center">
          <span className="text-white text-sm font-bold">{module.order}</span>
        </div>
      </div>

      {/* Content */}
      <div className="absolute inset-x-0 bottom-0 p-4 z-10">
        {/* Play Button on Hover */}
        <div className={cn(
          "absolute -top-12 left-1/2 -translate-x-1/2 transition-all duration-300",
          isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          <button 
            className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/50 hover:scale-110 transition-transform"
            onClick={onView}
          >
            <Play className="w-6 h-6 text-white fill-white ml-1" />
          </button>
        </div>

        {/* Module Title */}
        <h3 className="text-white font-bold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {module.title}
        </h3>

        {/* Description - Shows on hover */}
        <p className={cn(
          "text-gray-300 text-sm mb-3 line-clamp-2 transition-all duration-300",
          isHovered ? "opacity-100 max-h-20" : "opacity-0 max-h-0 overflow-hidden"
        )}>
          {module.description}
        </p>

        {/* Meta Info */}
        <div className="flex items-center gap-3 text-gray-400 text-xs">
          <div className="flex items-center gap-1">
            <Video className="w-3.5 h-3.5" />
            <span>{module.lessonsCount} aulas</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{module.totalDuration}</span>
          </div>
        </div>

        {/* Actions on Hover */}
        <div className={cn(
          "flex items-center gap-2 mt-3 transition-all duration-300",
          isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          <Button 
            size="sm" 
            variant="secondary" 
            className="flex-1 bg-white/10 hover:bg-white/20 text-white text-xs"
            onClick={onEdit}
          >
            <Edit className="w-3.5 h-3.5 mr-1" />
            Editar
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" className="text-white hover:bg-white/10">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-gray-900 border-gray-800">
              <DropdownMenuItem className="text-gray-300 hover:text-white focus:text-white focus:bg-gray-800">
                <Eye className="w-4 h-4 mr-2" />
                Visualizar
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-400 hover:text-red-300 focus:text-red-300 focus:bg-gray-800" onClick={onDelete}>
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

const MembersAreaPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("modules");

  const filteredModules = mockModules.filter(module => 
    module.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      {/* Header */}
      <div className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        
        <div className="relative px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Área de Membros
              </h1>
              <p className="text-gray-400">
                Gerencie seus módulos, aulas e conteúdos exclusivos
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800">
                <Settings className="w-4 h-4 mr-2" />
                Configurações
              </Button>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Novo Módulo
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{mockStats.totalMembers}</p>
                    <p className="text-xs text-gray-500">Total Membros</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{mockStats.activeMembers}</p>
                    <p className="text-xs text-gray-500">Ativos</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Folder className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{mockStats.totalModules}</p>
                    <p className="text-xs text-gray-500">Módulos</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <Video className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{mockStats.totalLessons}</p>
                    <p className="text-xs text-gray-500">Aulas</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                    <Star className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{mockStats.averageRating}</p>
                    <p className="text-xs text-gray-500">Avaliação</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <TabsList className="bg-gray-900/50 border border-gray-800">
              <TabsTrigger 
                value="modules" 
                className="data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                <Folder className="w-4 h-4 mr-2" />
                Módulos
              </TabsTrigger>
              <TabsTrigger 
                value="members"
                className="data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                <Users className="w-4 h-4 mr-2" />
                Membros
              </TabsTrigger>
              <TabsTrigger 
                value="analytics"
                className="data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                <FileText className="w-4 h-4 mr-2" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input 
                placeholder="Buscar módulos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-900/50 border-gray-800 text-white placeholder:text-gray-500"
              />
            </div>
          </div>

          <TabsContent value="modules" className="mt-0">
            {/* Modules Grid - Netflix Style */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredModules.map((module, index) => (
                <ModuleCard 
                  key={module.id} 
                  module={module} 
                  index={index}
                  onEdit={() => console.log("Edit", module.id)}
                  onDelete={() => console.log("Delete", module.id)}
                  onView={() => console.log("View", module.id)}
                />
              ))}

              {/* Add New Module Card */}
              <div className="aspect-[3/4] rounded-xl border-2 border-dashed border-gray-700 hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-3 cursor-pointer group bg-gray-900/30 hover:bg-gray-900/50">
                <div className="w-16 h-16 rounded-full bg-gray-800 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                  <Plus className="w-8 h-8 text-gray-500 group-hover:text-primary transition-colors" />
                </div>
                <span className="text-gray-500 group-hover:text-gray-300 text-sm font-medium transition-colors">
                  Adicionar Módulo
                </span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="members" className="mt-0">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Lista de Membros</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mb-4">
                    <Users className="w-10 h-10 text-gray-600" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">Nenhum membro ainda</h3>
                  <p className="text-gray-500 max-w-md">
                    Quando você tiver membros na sua área exclusiva, eles aparecerão aqui.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="mt-0">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mb-4">
                    <FileText className="w-10 h-10 text-gray-600" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">Em breve</h3>
                  <p className="text-gray-500 max-w-md">
                    Análises detalhadas sobre o engajamento dos seus membros estarão disponíveis em breve.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MembersAreaPage;
