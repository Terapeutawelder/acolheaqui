import { useState } from "react";
import {
  ArrowLeft,
  Play,
  Pause,
  Check,
  CheckCircle,
  Lock,
  Clock,
  ChevronDown,
  ChevronUp,
  Download,
  FileText,
  MessageCircle,
  ThumbsUp,
  Share2,
  Bookmark,
  Volume2,
  VolumeX,
  Maximize,
  Settings,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface Lesson {
  id: string;
  title: string;
  duration: string;
  isCompleted: boolean;
  isLocked: boolean;
  videoUrl?: string;
  description?: string;
  attachments?: { name: string; url: string; type: string }[];
}

interface Module {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  lessons: Lesson[];
  totalDuration: string;
}

// Mock data for module with lessons
const mockModule: Module = {
  id: "1",
  title: "Introdução à Terapia Online",
  description:
    "Aprenda os fundamentos da terapia online e como atender seus pacientes remotamente com qualidade e profissionalismo.",
  thumbnail:
    "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&h=450&fit=crop",
  totalDuration: "2h 30min",
  lessons: [
    {
      id: "1",
      title: "Bem-vindo ao curso",
      duration: "5:30",
      isCompleted: true,
      isLocked: false,
      videoUrl: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4",
      description:
        "Nesta aula de boas-vindas, vamos apresentar o curso e o que você vai aprender ao longo dos módulos.",
      attachments: [
        { name: "Material de Apoio.pdf", url: "#", type: "pdf" },
        { name: "Checklist Inicial.docx", url: "#", type: "doc" },
      ],
    },
    {
      id: "2",
      title: "Configurando seu ambiente de atendimento",
      duration: "12:45",
      isCompleted: true,
      isLocked: false,
      videoUrl: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4",
      description:
        "Aprenda a configurar o ambiente ideal para realizar atendimentos online com qualidade profissional.",
    },
    {
      id: "3",
      title: "Escolhendo a plataforma ideal",
      duration: "18:20",
      isCompleted: false,
      isLocked: false,
      videoUrl: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4",
      description:
        "Comparamos as principais plataformas de videochamada e ajudamos você a escolher a melhor para seus atendimentos.",
    },
    {
      id: "4",
      title: "Técnicas de comunicação online",
      duration: "22:10",
      isCompleted: false,
      isLocked: false,
      videoUrl: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4",
      description:
        "Domine as técnicas de comunicação específicas para o ambiente virtual.",
    },
    {
      id: "5",
      title: "Lidando com imprevistos técnicos",
      duration: "15:00",
      isCompleted: false,
      isLocked: false,
      description: "Como resolver problemas técnicos durante o atendimento.",
    },
    {
      id: "6",
      title: "Ética e sigilo no ambiente digital",
      duration: "25:30",
      isCompleted: false,
      isLocked: true,
      description:
        "Aspectos éticos importantes para a prática da terapia online.",
    },
    {
      id: "7",
      title: "Documentação e prontuário eletrônico",
      duration: "20:15",
      isCompleted: false,
      isLocked: true,
      description: "Como manter a documentação adequada dos atendimentos.",
    },
    {
      id: "8",
      title: "Encerramento e próximos passos",
      duration: "10:45",
      isCompleted: false,
      isLocked: true,
      description: "Resumo do curso e orientações para continuar aprendendo.",
    },
  ],
};

interface ModuleViewPageProps {
  moduleId?: string;
  onBack: () => void;
}

const ModuleViewPage = ({ moduleId, onBack }: ModuleViewPageProps) => {
  const [currentLesson, setCurrentLesson] = useState<Lesson>(mockModule.lessons[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showDescription, setShowDescription] = useState(true);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(
    new Set(mockModule.lessons.filter((l) => l.isCompleted).map((l) => l.id))
  );

  const totalLessons = mockModule.lessons.length;
  const completedCount = completedLessons.size;
  const progressPercentage = Math.round((completedCount / totalLessons) * 100);

  const handleLessonClick = (lesson: Lesson) => {
    if (!lesson.isLocked) {
      setCurrentLesson(lesson);
      setProgress(0);
      setIsPlaying(false);
    }
  };

  const handleMarkComplete = () => {
    const newCompleted = new Set(completedLessons);
    if (newCompleted.has(currentLesson.id)) {
      newCompleted.delete(currentLesson.id);
    } else {
      newCompleted.add(currentLesson.id);
    }
    setCompletedLessons(newCompleted);
  };

  const handleNextLesson = () => {
    const currentIndex = mockModule.lessons.findIndex(
      (l) => l.id === currentLesson.id
    );
    if (currentIndex < mockModule.lessons.length - 1) {
      const nextLesson = mockModule.lessons[currentIndex + 1];
      if (!nextLesson.isLocked) {
        setCurrentLesson(nextLesson);
        setProgress(0);
      }
    }
  };

  const handlePrevLesson = () => {
    const currentIndex = mockModule.lessons.findIndex(
      (l) => l.id === currentLesson.id
    );
    if (currentIndex > 0) {
      setCurrentLesson(mockModule.lessons[currentIndex - 1]);
      setProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      {/* Top Navigation */}
      <div className="sticky top-0 z-50 bg-gray-950/90 backdrop-blur-xl border-b border-gray-800">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Voltar
            </Button>
            <Separator orientation="vertical" className="h-6 bg-gray-800" />
            <div>
              <h1 className="text-white font-semibold text-sm md:text-base line-clamp-1">
                {mockModule.title}
              </h1>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>
                  {completedCount}/{totalLessons} aulas
                </span>
                <span>•</span>
                <span>{progressPercentage}% concluído</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              <Bookmark className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        {/* Progress Bar */}
        <Progress
          value={progressPercentage}
          className="h-1 bg-gray-800 rounded-none"
        />
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Video Player Section */}
        <div className="flex-1 lg:max-w-[calc(100%-380px)]">
          {/* Video Container */}
          <div className="relative aspect-video bg-black group">
            {/* Video Placeholder/Thumbnail */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${mockModule.thumbnail})` }}
            />
            <div className="absolute inset-0 bg-black/60" />

            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                className={cn(
                  "w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center",
                  "shadow-lg shadow-primary/30 hover:scale-110 transition-all duration-300",
                  "group-hover:opacity-100",
                  isPlaying && "opacity-0"
                )}
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8 text-white" />
                ) : (
                  <Play className="w-8 h-8 text-white fill-white ml-1" />
                )}
              </button>
            </div>

            {/* Video Controls */}
            <div
              className={cn(
                "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4",
                "transition-opacity duration-300",
                isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100"
              )}
            >
              {/* Progress Bar */}
              <div className="mb-3">
                <div className="relative h-1 bg-gray-700 rounded-full cursor-pointer group/progress">
                  <div
                    className="absolute h-full bg-primary rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                  <div
                    className="absolute w-3 h-3 bg-primary rounded-full -top-1 opacity-0 group-hover/progress:opacity-100 transition-opacity"
                    style={{ left: `${progress}%`, transform: "translateX(-50%)" }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>0:00</span>
                  <span>{currentLesson.duration}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePrevLesson}
                    className="text-white hover:bg-white/10"
                  >
                    <SkipBack className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="text-white hover:bg-white/10"
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6" />
                    ) : (
                      <Play className="w-6 h-6" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleNextLesson}
                    className="text-white hover:bg-white/10"
                  >
                    <SkipForward className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMuted(!isMuted)}
                    className="text-white hover:bg-white/10"
                  >
                    {isMuted ? (
                      <VolumeX className="w-5 h-5" />
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/10"
                  >
                    <Settings className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/10"
                  >
                    <Maximize className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Lesson Info */}
          <div className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge
                    variant="secondary"
                    className="bg-primary/20 text-primary text-xs"
                  >
                    Aula{" "}
                    {mockModule.lessons.findIndex(
                      (l) => l.id === currentLesson.id
                    ) + 1}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-gray-800 text-gray-400 text-xs"
                  >
                    <Clock className="w-3 h-3 mr-1" />
                    {currentLesson.duration}
                  </Badge>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
                  {currentLesson.title}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={
                    completedLessons.has(currentLesson.id)
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={handleMarkComplete}
                  className={cn(
                    completedLessons.has(currentLesson.id)
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800"
                  )}
                >
                  {completedLessons.has(currentLesson.id) ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Concluída
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Marcar como concluída
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 mb-6">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
              >
                <ThumbsUp className="w-4 h-4 mr-2" />
                Gostei
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Comentários
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar
              </Button>
            </div>

            {/* Description */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
              <button
                className="flex items-center justify-between w-full text-left"
                onClick={() => setShowDescription(!showDescription)}
              >
                <span className="font-medium text-white">Sobre esta aula</span>
                {showDescription ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>
              {showDescription && (
                <div className="mt-3 space-y-4">
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {currentLesson.description}
                  </p>

                  {/* Attachments */}
                  {currentLesson.attachments &&
                    currentLesson.attachments.length > 0 && (
                      <div className="pt-3 border-t border-gray-800">
                        <h4 className="text-sm font-medium text-white mb-2">
                          Materiais de apoio
                        </h4>
                        <div className="space-y-2">
                          {currentLesson.attachments.map((attachment, index) => (
                            <a
                              key={index}
                              href={attachment.url}
                              className="flex items-center gap-3 p-2 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors"
                            >
                              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                                <FileText className="w-4 h-4 text-primary" />
                              </div>
                              <span className="text-sm text-gray-300">
                                {attachment.name}
                              </span>
                              <Download className="w-4 h-4 text-gray-500 ml-auto" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lessons Sidebar */}
        <div className="lg:w-[380px] border-t lg:border-t-0 lg:border-l border-gray-800 bg-gray-950/50">
          <div className="sticky top-[73px]">
            <div className="p-4 border-b border-gray-800">
              <h3 className="font-semibold text-white mb-2">
                Conteúdo do módulo
              </h3>
              <div className="flex items-center gap-3">
                <Progress
                  value={progressPercentage}
                  className="h-2 flex-1 bg-gray-800"
                />
                <span className="text-sm text-gray-400 whitespace-nowrap">
                  {progressPercentage}%
                </span>
              </div>
            </div>

            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="p-2">
                {mockModule.lessons.map((lesson, index) => {
                  const isActive = currentLesson.id === lesson.id;
                  const isCompleted = completedLessons.has(lesson.id);

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => handleLessonClick(lesson)}
                      disabled={lesson.isLocked}
                      className={cn(
                        "w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all duration-200",
                        isActive
                          ? "bg-primary/20 border border-primary/30"
                          : "hover:bg-gray-800/50",
                        lesson.isLocked && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {/* Lesson Number/Status */}
                      <div
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm font-medium",
                          isCompleted
                            ? "bg-green-500/20 text-green-500"
                            : isActive
                            ? "bg-primary text-white"
                            : lesson.isLocked
                            ? "bg-gray-800 text-gray-600"
                            : "bg-gray-800 text-gray-400"
                        )}
                      >
                        {isCompleted ? (
                          <Check className="w-4 h-4" />
                        ) : lesson.isLocked ? (
                          <Lock className="w-3.5 h-3.5" />
                        ) : (
                          index + 1
                        )}
                      </div>

                      {/* Lesson Info */}
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            "text-sm font-medium line-clamp-2 mb-1",
                            isActive ? "text-primary" : "text-white",
                            lesson.isLocked && "text-gray-500"
                          )}
                        >
                          {lesson.title}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{lesson.duration}</span>
                          {isCompleted && (
                            <>
                              <span>•</span>
                              <span className="text-green-500">Concluída</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Playing Indicator */}
                      {isActive && !lesson.isLocked && (
                        <div className="shrink-0">
                          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                            <Play className="w-3 h-3 text-primary fill-primary" />
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleViewPage;
