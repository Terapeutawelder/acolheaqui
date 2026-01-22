import { useState } from "react";
import { 
  Play, 
  Clock, 
  CheckCircle2, 
  BookOpen,
  User,
  Calendar,
  ShoppingCart,
  MessageCircle,
  Bot,
  Video,
  DollarSign,
  Settings,
  Webhook,
  ChevronRight,
  ExternalLink,
  Sparkles
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface Tutorial {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  difficulty: "iniciante" | "intermediário" | "avançado";
  videoUrl?: string;
  steps: string[];
  completed?: boolean;
}

const tutorials: Tutorial[] = [
  // Perfil e Landing Page
  {
    id: "profile-setup",
    title: "Como configurar seu Perfil Profissional",
    description: "Aprenda a preencher todos os dados do seu perfil para transmitir credibilidade aos pacientes.",
    duration: "5 min",
    category: "perfil",
    difficulty: "iniciante",
    steps: [
      "Acesse o menu 'Dados do Perfil' no sidebar",
      "Preencha seu nome completo e registro profissional (CRP/CRM)",
      "Adicione uma foto profissional de qualidade",
      "Escreva uma bio envolvente sobre sua experiência",
      "Selecione suas especialidades e abordagens terapêuticas",
      "Configure suas redes sociais",
      "Defina um slug personalizado para sua URL"
    ]
  },
  {
    id: "landing-page",
    title: "Personalizando sua Landing Page",
    description: "Crie uma página profissional atraente para conquistar novos pacientes.",
    duration: "8 min",
    category: "perfil",
    difficulty: "iniciante",
    steps: [
      "Acesse o menu 'Landing Page' no sidebar",
      "Use o painel lateral para editar cada seção",
      "Personalize as cores para combinar com sua marca",
      "Adicione depoimentos de pacientes (com permissão)",
      "Configure as perguntas frequentes (FAQ)",
      "Reorganize as seções arrastando e soltando",
      "Visualize as alterações em tempo real no preview"
    ]
  },
  // Agenda e CRM
  {
    id: "schedule-config",
    title: "Configurando seus Horários de Atendimento",
    description: "Defina seus horários disponíveis para que pacientes possam agendar.",
    duration: "4 min",
    category: "agenda",
    difficulty: "iniciante",
    steps: [
      "Acesse 'Agenda / CRM' no menu principal",
      "Clique na aba 'Horários'",
      "Adicione intervalos para cada dia da semana",
      "Defina horário de início e término",
      "Ative ou desative dias específicos",
      "Configure múltiplos turnos se necessário (manhã e tarde)"
    ]
  },
  {
    id: "appointments-management",
    title: "Gerenciando Agendamentos",
    description: "Aprenda a visualizar, criar e gerenciar todos os seus agendamentos.",
    duration: "6 min",
    category: "agenda",
    difficulty: "iniciante",
    steps: [
      "Acesse 'Agenda / CRM' no menu principal",
      "Visualize todos os agendamentos no calendário",
      "Clique em um agendamento para ver detalhes",
      "Use o botão '+' para criar agendamentos manuais",
      "Altere o status: pending, confirmed, completed, cancelled",
      "Adicione notas e observações ao agendamento"
    ]
  },
  {
    id: "patient-crm",
    title: "Utilizando o CRM de Pacientes",
    description: "Gerencie sua base de pacientes e acompanhe o histórico de cada um.",
    duration: "7 min",
    category: "agenda",
    difficulty: "intermediário",
    steps: [
      "Acesse a lista de pacientes na aba 'Pacientes'",
      "Visualize todos os pacientes atendidos",
      "Clique em um paciente para ver a ficha completa",
      "Acesse o histórico de sessões do paciente",
      "Adicione notas e observações ao prontuário",
      "Exporte a lista de pacientes em CSV"
    ]
  },
  // Checkout e Pagamentos
  {
    id: "checkout-setup",
    title: "Configurando seu Checkout Personalizado",
    description: "Crie um checkout profissional para receber pagamentos online.",
    duration: "10 min",
    category: "pagamentos",
    difficulty: "intermediário",
    steps: [
      "Acesse o menu 'Checkout' no sidebar",
      "Personalize as cores e layout do checkout",
      "Configure seus serviços com preços e durações",
      "Adicione fotos e descrições atrativas",
      "Configure order bumps (produtos adicionais)",
      "Copie o link do checkout para compartilhar",
      "Teste o checkout antes de divulgar"
    ]
  },
  {
    id: "payment-gateway",
    title: "Configurando Gateway de Pagamento",
    description: "Conecte sua conta para receber pagamentos automaticamente.",
    duration: "8 min",
    category: "pagamentos",
    difficulty: "intermediário",
    steps: [
      "Acesse 'Finanças' > 'Visão Geral'",
      "Escolha seu gateway: Stripe, MercadoPago, PagSeguro, etc.",
      "Crie uma conta no gateway escolhido (se não tiver)",
      "Copie as chaves de API do gateway",
      "Cole as chaves na configuração da AcolheAqui",
      "Teste uma transação para validar a integração",
      "Ative o recebimento automático"
    ]
  },
  // WhatsApp e Notificações
  {
    id: "whatsapp-integration",
    title: "Integrando o WhatsApp Business",
    description: "Configure o WhatsApp para enviar notificações automáticas aos pacientes.",
    duration: "12 min",
    category: "conexoes",
    difficulty: "avançado",
    steps: [
      "Acesse o menu 'WhatsApp' no sidebar",
      "Escolha o tipo de integração (Evolution API ou Oficial)",
      "Configure a URL e chave da API",
      "Escaneie o QR Code para conectar seu WhatsApp",
      "Configure os templates de mensagens",
      "Ative as notificações automáticas (confirmação, lembrete, etc.)",
      "Teste enviando uma mensagem de teste"
    ]
  },
  {
    id: "notification-templates",
    title: "Personalizando Templates de Notificação",
    description: "Crie mensagens personalizadas para cada tipo de notificação.",
    duration: "5 min",
    category: "conexoes",
    difficulty: "intermediário",
    steps: [
      "Acesse 'WhatsApp' > 'Templates'",
      "Edite o template de confirmação de agendamento",
      "Personalize o lembrete pré-sessão",
      "Configure mensagem de cancelamento",
      "Use variáveis: {nome}, {data}, {horario}, {servico}",
      "Salve e teste cada template"
    ]
  },
  // Agente IA
  {
    id: "ai-agent-setup",
    title: "Configurando o Agente IA de Agendamento",
    description: "Ative a IA para atender pacientes automaticamente via WhatsApp.",
    duration: "8 min",
    category: "ia",
    difficulty: "avançado",
    steps: [
      "Primeiro configure a integração com WhatsApp",
      "Acesse 'IA Agendamento' no menu",
      "Defina o nome do seu agente virtual",
      "Escreva uma saudação personalizada",
      "Adicione instruções específicas para a IA",
      "Ative o agente",
      "Teste enviando uma mensagem no WhatsApp"
    ]
  },
  {
    id: "ai-custom-key",
    title: "Usando sua Própria Chave OpenAI",
    description: "Configure sua chave de API para usar modelos GPT-4.",
    duration: "4 min",
    category: "ia",
    difficulty: "avançado",
    steps: [
      "Acesse 'Config. IA' no menu de integrações",
      "Crie uma conta na OpenAI (se não tiver)",
      "Gere uma API Key no painel da OpenAI",
      "Cole a chave na configuração",
      "Teste a conexão",
      "Selecione o modelo desejado (GPT-4, GPT-3.5)"
    ]
  },
  // Sala Virtual
  {
    id: "virtual-room",
    title: "Realizando Sessões na Sala Virtual",
    description: "Aprenda a usar a sala virtual para atendimentos online.",
    duration: "6 min",
    category: "atendimento",
    difficulty: "iniciante",
    steps: [
      "Acesse 'Agenda / CRM' e selecione um agendamento",
      "Clique em 'Iniciar Sessão' ou 'Entrar na Sala'",
      "Permita acesso à câmera e microfone",
      "Aguarde o paciente entrar (ele recebe o link por email/WhatsApp)",
      "Use o chat para trocar mensagens",
      "Compartilhe sua tela se necessário",
      "Encerre a sessão quando terminar"
    ]
  },
  // Integrações
  {
    id: "google-calendar",
    title: "Sincronizando com Google Calendar",
    description: "Mantenha sua agenda sincronizada com o Google automaticamente.",
    duration: "5 min",
    category: "conexoes",
    difficulty: "intermediário",
    steps: [
      "Acesse 'Google Agenda' no menu de integrações",
      "Clique em 'Conectar conta Google'",
      "Autorize o acesso ao Google Calendar",
      "Selecione o calendário que deseja sincronizar",
      "Ative a sincronização bidirecional",
      "Novos agendamentos aparecerão automaticamente no Google"
    ]
  },
  {
    id: "webhooks-setup",
    title: "Configurando Webhooks para Integrações",
    description: "Conecte a AcolheAqui com outros sistemas externos.",
    duration: "10 min",
    category: "conexoes",
    difficulty: "avançado",
    steps: [
      "Acesse 'Webhooks' no menu de integrações",
      "Clique em 'Novo Webhook'",
      "Cole a URL do sistema destino",
      "Defina uma Secret Key para segurança",
      "Selecione os eventos que disparam o webhook",
      "Salve e teste o webhook",
      "Verifique os logs de envio"
    ]
  }
];

const categories = [
  { id: "todos", label: "Todos", icon: BookOpen },
  { id: "perfil", label: "Perfil", icon: User },
  { id: "agenda", label: "Agenda", icon: Calendar },
  { id: "pagamentos", label: "Pagamentos", icon: DollarSign },
  { id: "conexoes", label: "Conexões", icon: MessageCircle },
  { id: "ia", label: "IA", icon: Bot },
  { id: "atendimento", label: "Atendimento", icon: Video },
];

const TutorialsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("todos");
  const [expandedTutorial, setExpandedTutorial] = useState<string | null>(null);
  const [completedTutorials, setCompletedTutorials] = useState<Set<string>>(new Set());

  const filteredTutorials = selectedCategory === "todos" 
    ? tutorials 
    : tutorials.filter(t => t.category === selectedCategory);

  const toggleComplete = (tutorialId: string) => {
    setCompletedTutorials(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tutorialId)) {
        newSet.delete(tutorialId);
      } else {
        newSet.add(tutorialId);
      }
      return newSet;
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "iniciante":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "intermediário":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "avançado":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const progress = Math.round((completedTutorials.size / tutorials.length) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="h-7 w-7 text-primary" />
            Central de Tutoriais
          </h2>
          <p className="text-muted-foreground mt-1">
            Guias passo a passo para dominar todas as funcionalidades da plataforma
          </p>
        </div>
        
        {/* Progress Card */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="relative">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  className="stroke-muted fill-none"
                  strokeWidth="4"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  className="stroke-primary fill-none"
                  strokeWidth="4"
                  strokeDasharray={`${progress * 1.76} 176`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-primary">
                {progress}%
              </span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Progresso</p>
              <p className="text-lg font-semibold text-foreground">
                {completedTutorials.size} de {tutorials.length} tutoriais
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto flex-nowrap bg-muted/50 p-1 h-auto">
          {categories.map((cat) => (
            <TabsTrigger 
              key={cat.id} 
              value={cat.id}
              className="flex items-center gap-2 px-4 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap"
            >
              <cat.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{cat.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          <div className="grid gap-4">
            {filteredTutorials.map((tutorial) => {
              const isExpanded = expandedTutorial === tutorial.id;
              const isCompleted = completedTutorials.has(tutorial.id);
              
              return (
                <Card 
                  key={tutorial.id}
                  className={cn(
                    "transition-all duration-300 cursor-pointer hover:shadow-lg",
                    isCompleted && "border-green-500/30 bg-green-500/5",
                    isExpanded && "ring-2 ring-primary/50"
                  )}
                >
                  <CardHeader 
                    className="pb-2"
                    onClick={() => setExpandedTutorial(isExpanded ? null : tutorial.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant="outline" className={getDifficultyColor(tutorial.difficulty)}>
                            {tutorial.difficulty}
                          </Badge>
                          <div className="flex items-center gap-1 text-muted-foreground text-sm">
                            <Clock className="h-3.5 w-3.5" />
                            {tutorial.duration}
                          </div>
                        </div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {isCompleted && (
                            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                          )}
                          {tutorial.title}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {tutorial.description}
                        </CardDescription>
                      </div>
                      <ChevronRight 
                        className={cn(
                          "h-5 w-5 text-muted-foreground transition-transform flex-shrink-0",
                          isExpanded && "rotate-90"
                        )} 
                      />
                    </div>
                  </CardHeader>
                  
                  {isExpanded && (
                    <CardContent className="pt-4 border-t border-border/50">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-primary" />
                            Passo a Passo
                          </h4>
                          <ol className="space-y-2">
                            {tutorial.steps.map((step, index) => (
                              <li 
                                key={index} 
                                className="flex items-start gap-3 text-sm text-muted-foreground"
                              >
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
                                  {index + 1}
                                </span>
                                <span className="pt-0.5">{step}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                        
                        <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                          <Button
                            variant={isCompleted ? "outline" : "default"}
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleComplete(tutorial.id);
                            }}
                            className="gap-2"
                          >
                            {isCompleted ? (
                              <>
                                <CheckCircle2 className="h-4 w-4" />
                                Concluído
                              </>
                            ) : (
                              <>
                                <Play className="h-4 w-4" />
                                Marcar como Concluído
                              </>
                            )}
                          </Button>
                          
                          {tutorial.videoUrl && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(tutorial.videoUrl, '_blank');
                              }}
                            >
                              <ExternalLink className="h-4 w-4" />
                              Ver Vídeo
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Start Section */}
      <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Início Rápido Recomendado
          </CardTitle>
          <CardDescription>
            Siga esta ordem para configurar sua conta da melhor forma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { step: 1, title: "Configure seu Perfil", id: "profile-setup" },
              { step: 2, title: "Defina seus Horários", id: "schedule-config" },
              { step: 3, title: "Personalize o Checkout", id: "checkout-setup" },
              { step: 4, title: "Integre o WhatsApp", id: "whatsapp-integration" },
            ].map((item) => (
              <button
                key={item.step}
                onClick={() => setExpandedTutorial(item.id)}
                className="flex items-center gap-3 p-4 rounded-xl bg-background/50 border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {item.step}
                </div>
                <span className="text-sm font-medium text-foreground">{item.title}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TutorialsPage;
