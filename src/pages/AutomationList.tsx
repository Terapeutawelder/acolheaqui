import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Plus, Play, Pause, Edit2, Trash2, Clock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useProfessionalProfile } from "@/hooks/useProfessionalProfile";
import {
  useAutomationFlows,
  useCreateAutomationFlow,
  useDeleteAutomationFlow,
  useToggleAutomationFlow,
} from "@/hooks/useAutomationFlows";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AutomationList() {
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading } = useProfessionalProfile();
  const { data: flows = [], isLoading: flowsLoading } = useAutomationFlows(profile?.id || null);
  const createFlow = useCreateAutomationFlow();
  const deleteFlow = useDeleteAutomationFlow();
  const toggleFlow = useToggleAutomationFlow();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newFlowName, setNewFlowName] = useState("");
  const [newFlowDescription, setNewFlowDescription] = useState("");

  const handleCreate = async () => {
    if (!profile?.id || !newFlowName.trim()) return;

    await createFlow.mutateAsync({
      professional_id: profile.id,
      name: newFlowName.trim(),
      description: newFlowDescription.trim() || undefined,
    });

    setShowCreateDialog(false);
    setNewFlowName("");
    setNewFlowDescription("");
  };

  const handleDelete = async (flowId: string) => {
    await deleteFlow.mutateAsync(flowId);
  };

  const handleToggle = async (flowId: string, isActive: boolean) => {
    await toggleFlow.mutateAsync({ id: flowId, is_active: isActive });
  };

  const getTriggerLabel = (triggerType: string | null) => {
    switch (triggerType) {
      case "keyword": return "Palavra-chave";
      case "event": return "Evento";
      case "webhook": return "Webhook";
      case "schedule": return "Agendado";
      default: return "Não configurado";
    }
  };

  if (profileLoading || flowsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Automações</h1>
            <p className="text-muted-foreground">Gerencie seus fluxos de automação</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
            <Plus size={16} />
            Nova Automação
          </Button>
        </div>

        {flows.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Zap className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Nenhuma automação</h3>
              <p className="text-muted-foreground text-center mb-4">
                Crie sua primeira automação para automatizar suas interações com clientes.
              </p>
              <Button onClick={() => setShowCreateDialog(true)} variant="outline" className="gap-2">
                <Plus size={16} />
                Criar Automação
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {flows.map((flow) => (
              <Card key={flow.id} className="hover:border-primary/50 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{flow.name}</CardTitle>
                      {flow.description && (
                        <CardDescription className="line-clamp-2 mt-1">
                          {flow.description}
                        </CardDescription>
                      )}
                    </div>
                    <Switch
                      checked={flow.is_active}
                      onCheckedChange={(checked) => handleToggle(flow.id, checked)}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant={flow.is_active ? "default" : "secondary"}>
                      {flow.is_active ? (
                        <>
                          <Play size={12} className="mr-1" />
                          Ativo
                        </>
                      ) : (
                        <>
                          <Pause size={12} className="mr-1" />
                          Inativo
                        </>
                      )}
                    </Badge>
                    <Badge variant="outline">
                      <Zap size={12} className="mr-1" />
                      {getTriggerLabel(flow.trigger_type)}
                    </Badge>
                  </div>

                  <div className="flex items-center text-xs text-muted-foreground mb-4">
                    <Clock size={12} className="mr-1" />
                    Atualizado em {format(new Date(flow.updated_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/dashboard/automacao/${flow.id}`)}
                    >
                      <Edit2 size={14} className="mr-1" />
                      Editar
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10">
                          <Trash2 size={14} />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir automação?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação irá excluir permanentemente a automação "{flow.name}". Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => handleDelete(flow.id)}
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Automação</DialogTitle>
              <DialogDescription>
                Crie um novo fluxo de automação para interagir com seus clientes.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  placeholder="Ex: Boas-vindas WhatsApp"
                  value={newFlowName}
                  onChange={(e) => setNewFlowName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva o objetivo desta automação..."
                  value={newFlowDescription}
                  onChange={(e) => setNewFlowDescription(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreate} disabled={!newFlowName.trim() || createFlow.isPending}>
                {createFlow.isPending ? "Criando..." : "Criar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
