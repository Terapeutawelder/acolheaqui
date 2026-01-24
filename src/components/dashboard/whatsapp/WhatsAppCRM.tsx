import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  MessageCircle,
  Phone,
  X,
  Loader2,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface WhatsAppCRMProps {
  profileId: string;
  connections: any[];
}

interface Stage {
  id: string;
  name: string;
  color: string;
  order_index: number;
}

interface Lead {
  id: string;
  name: string;
  phone: string;
  value_cents: number;
  tags: string[];
  notes: string | null;
  stage_id: string;
  last_interaction_at: string | null;
  connection_id: string | null;
}

const DEFAULT_STAGES: Omit<Stage, "id">[] = [
  { name: "Novo Lead", color: "#f59e0b", order_index: 0 },
  { name: "Contato Realizado", color: "#3b82f6", order_index: 1 },
  { name: "Venda Realizada", color: "#10b981", order_index: 2 },
  { name: "Perdido", color: "#ef4444", order_index: 3 },
];

export const WhatsAppCRM = ({ profileId, connections }: WhatsAppCRMProps) => {
  const [stages, setStages] = useState<Stage[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingStage, setIsAddingStage] = useState(false);
  const [newStageName, setNewStageName] = useState("");
  const [editingStage, setEditingStage] = useState<Stage | null>(null);
  const [isAddingLead, setIsAddingLead] = useState<string | null>(null);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [chatLead, setChatLead] = useState<Lead | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const [newLead, setNewLead] = useState({
    name: "",
    phone: "",
    value: "",
    notes: "",
  });

  useEffect(() => {
    fetchData();
  }, [profileId]);

  const fetchData = async () => {
    try {
      // Fetch stages
      const { data: stagesData, error: stagesError } = await supabase
        .from("whatsapp_crm_stages")
        .select("*")
        .eq("professional_id", profileId)
        .order("order_index");

      if (stagesError) throw stagesError;

      // If no stages, create defaults
      if (!stagesData || stagesData.length === 0) {
        const { data: newStages, error: createError } = await supabase
          .from("whatsapp_crm_stages")
          .insert(DEFAULT_STAGES.map(s => ({ ...s, professional_id: profileId })))
          .select();

        if (createError) throw createError;
        setStages(newStages || []);
      } else {
        setStages(stagesData);
      }

      // Fetch leads
      const { data: leadsData, error: leadsError } = await supabase
        .from("whatsapp_crm_leads")
        .select("*")
        .eq("professional_id", profileId)
        .order("created_at", { ascending: false });

      if (leadsError) throw leadsError;
      setLeads(leadsData || []);
    } catch (error) {
      console.error("Error fetching CRM data:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddStage = async () => {
    if (!newStageName.trim()) return;

    try {
      const maxOrder = stages.length > 0 ? Math.max(...stages.map(s => s.order_index)) : -1;
      
      const { data, error } = await supabase
        .from("whatsapp_crm_stages")
        .insert({
          professional_id: profileId,
          name: newStageName,
          color: "#10b981",
          order_index: maxOrder + 1,
        })
        .select()
        .single();

      if (error) throw error;

      setStages([...stages, data]);
      setNewStageName("");
      setIsAddingStage(false);
      toast.success("Etapa criada!");
    } catch (error) {
      console.error("Error adding stage:", error);
      toast.error("Erro ao criar etapa");
    }
  };

  const handleUpdateStage = async () => {
    if (!editingStage) return;

    try {
      const { error } = await supabase
        .from("whatsapp_crm_stages")
        .update({ name: editingStage.name, color: editingStage.color })
        .eq("id", editingStage.id);

      if (error) throw error;

      setStages(stages.map(s => s.id === editingStage.id ? editingStage : s));
      setEditingStage(null);
      toast.success("Etapa atualizada!");
    } catch (error) {
      console.error("Error updating stage:", error);
      toast.error("Erro ao atualizar etapa");
    }
  };

  const handleDeleteStage = async (stageId: string) => {
    try {
      const { error } = await supabase
        .from("whatsapp_crm_stages")
        .delete()
        .eq("id", stageId);

      if (error) throw error;

      setStages(stages.filter(s => s.id !== stageId));
      toast.success("Etapa excluída!");
    } catch (error) {
      console.error("Error deleting stage:", error);
      toast.error("Erro ao excluir etapa");
    }
  };

  const handleAddLead = async (stageId: string) => {
    if (!newLead.name.trim() || !newLead.phone.trim()) {
      toast.error("Preencha nome e telefone");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("whatsapp_crm_leads")
        .insert({
          professional_id: profileId,
          stage_id: stageId,
          name: newLead.name,
          phone: newLead.phone,
          value_cents: Math.round(parseFloat(newLead.value || "0") * 100),
          notes: newLead.notes || null,
          tags: [],
        })
        .select()
        .single();

      if (error) throw error;

      setLeads([data, ...leads]);
      setNewLead({ name: "", phone: "", value: "", notes: "" });
      setIsAddingLead(null);
      toast.success("Lead adicionado!");
    } catch (error) {
      console.error("Error adding lead:", error);
      toast.error("Erro ao adicionar lead");
    }
  };

  const handleUpdateLead = async () => {
    if (!editingLead) return;

    try {
      const { error } = await supabase
        .from("whatsapp_crm_leads")
        .update({
          name: editingLead.name,
          phone: editingLead.phone,
          value_cents: editingLead.value_cents,
          notes: editingLead.notes,
        })
        .eq("id", editingLead.id);

      if (error) throw error;

      setLeads(leads.map(l => l.id === editingLead.id ? editingLead : l));
      setEditingLead(null);
      toast.success("Lead atualizado!");
    } catch (error) {
      console.error("Error updating lead:", error);
      toast.error("Erro ao atualizar lead");
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    try {
      const { error } = await supabase
        .from("whatsapp_crm_leads")
        .delete()
        .eq("id", leadId);

      if (error) throw error;

      setLeads(leads.filter(l => l.id !== leadId));
      toast.success("Lead excluído!");
    } catch (error) {
      console.error("Error deleting lead:", error);
      toast.error("Erro ao excluir lead");
    }
  };

  const handleMoveLead = async (leadId: string, newStageId: string) => {
    try {
      const { error } = await supabase
        .from("whatsapp_crm_leads")
        .update({ stage_id: newStageId })
        .eq("id", leadId);

      if (error) throw error;

      setLeads(leads.map(l => l.id === leadId ? { ...l, stage_id: newStageId } : l));
    } catch (error) {
      console.error("Error moving lead:", error);
      toast.error("Erro ao mover lead");
    }
  };

  const openChat = async (lead: Lead) => {
    setChatLead(lead);
    
    // Fetch messages for this lead
    try {
      const { data, error } = await supabase
        .from("whatsapp_messages")
        .select("*")
        .eq("professional_id", profileId)
        .eq("lead_id", lead.id)
        .order("sent_at", { ascending: true });

      if (error) throw error;
      setChatMessages(data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !chatLead) return;

    setIsSendingMessage(true);
    try {
      // Here you would integrate with the actual WhatsApp API
      // For now, we'll just save the message to the database
      const connection = connections.find(c => c.status === "connected");
      
      const { data, error } = await supabase
        .from("whatsapp_messages")
        .insert({
          professional_id: profileId,
          connection_id: connection?.id || chatLead.connection_id,
          lead_id: chatLead.id,
          phone: chatLead.phone,
          content: newMessage,
          direction: "outbound",
          status: "sent",
        })
        .select()
        .single();

      if (error) throw error;

      setChatMessages([...chatMessages, data]);
      setNewMessage("");
      
      // Update last interaction
      await supabase
        .from("whatsapp_crm_leads")
        .update({ last_interaction_at: new Date().toISOString() })
        .eq("id", chatLead.id);

      toast.success("Mensagem enviada!");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Erro ao enviar mensagem");
    } finally {
      setIsSendingMessage(false);
    }
  };

  const getStageTotal = (stageId: string) => {
    const stageLeads = leads.filter(l => l.stage_id === stageId);
    const total = stageLeads.reduce((acc, l) => acc + (l.value_cents || 0), 0);
    return {
      count: stageLeads.length,
      total: total / 100,
    };
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
      </div>
    );
  }

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">CRM</h1>
          <p className="text-muted-foreground">
            Gerencie as etapas e cards do seu quadro CRM
          </p>
        </div>
        <Button
          onClick={() => setIsAddingStage(true)}
          className="bg-green-500 hover:bg-green-600 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Etapa
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-4 h-full min-w-max">
          {stages.map((stage) => {
            const stageStats = getStageTotal(stage.id);
            const stageLeads = leads.filter(l => l.stage_id === stage.id);

            return (
              <div
                key={stage.id}
                className="w-72 flex-shrink-0 flex flex-col bg-muted/30 rounded-lg"
              >
                {/* Stage Header */}
                <div className="p-3 border-b border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{stage.name}</h3>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <Pencil className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => setEditingStage(stage)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteStage(stage.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {stageStats.count} - R$ {stageStats.total.toLocaleString("pt-BR")}
                    </Badge>
                  </div>
                </div>

                {/* Lead Cards */}
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                  {stageLeads.map((lead) => (
                    <Card
                      key={lead.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => openChat(lead)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{lead.name}</h4>
                            <p className="text-lg font-bold text-green-600">
                              {formatCurrency(lead.value_cents)}
                            </p>
                            {lead.notes && (
                              <p className="text-xs text-muted-foreground truncate mt-1">
                                {lead.notes}
                              </p>
                            )}
                            {lead.tags && lead.tags.length > 0 && (
                              <div className="flex gap-1 mt-2">
                                {lead.tags.slice(0, 2).map((tag, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                <MessageCircle className="h-4 w-4 text-green-500" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                setEditingLead(lead);
                              }}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              {stages.filter(s => s.id !== lead.stage_id).map(s => (
                                <DropdownMenuItem
                                  key={s.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMoveLead(lead.id, s.id);
                                  }}
                                >
                                  Mover para {s.name}
                                </DropdownMenuItem>
                              ))}
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteLead(lead.id);
                                }}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Add Card Button */}
                <div className="p-2">
                  {isAddingLead === stage.id ? (
                    <Card className="p-3">
                      <div className="space-y-2">
                        <Input
                          placeholder="Nome"
                          value={newLead.name}
                          onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                        />
                        <Input
                          placeholder="Telefone"
                          value={newLead.phone}
                          onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                        />
                        <Input
                          placeholder="Valor (R$)"
                          type="number"
                          value={newLead.value}
                          onChange={(e) => setNewLead({ ...newLead, value: e.target.value })}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAddLead(stage.id)}
                            className="flex-1 bg-green-500 hover:bg-green-600"
                          >
                            Adicionar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setIsAddingLead(null);
                              setNewLead({ name: "", phone: "", value: "", notes: "" });
                            }}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ) : (
                    <Button
                      variant="ghost"
                      className="w-full text-green-600 hover:text-green-700 hover:bg-green-50"
                      onClick={() => setIsAddingLead(stage.id)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Card
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Stage Dialog */}
      <Dialog open={isAddingStage} onOpenChange={setIsAddingStage}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Etapa</DialogTitle>
            <DialogDescription>
              Crie uma nova etapa para organizar seus leads
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome da Etapa</Label>
              <Input
                placeholder="Ex: Em Negociação"
                value={newStageName}
                onChange={(e) => setNewStageName(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsAddingStage(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddStage} className="bg-green-500 hover:bg-green-600">
              Criar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Stage Dialog */}
      <Dialog open={!!editingStage} onOpenChange={() => setEditingStage(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Etapa</DialogTitle>
          </DialogHeader>
          {editingStage && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome da Etapa</Label>
                <Input
                  value={editingStage.name}
                  onChange={(e) => setEditingStage({ ...editingStage, name: e.target.value })}
                />
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditingStage(null)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateStage} className="bg-green-500 hover:bg-green-600">
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Lead Dialog */}
      <Dialog open={!!editingLead} onOpenChange={() => setEditingLead(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Lead</DialogTitle>
          </DialogHeader>
          {editingLead && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input
                  value={editingLead.name}
                  onChange={(e) => setEditingLead({ ...editingLead, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input
                  value={editingLead.phone}
                  onChange={(e) => setEditingLead({ ...editingLead, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Valor (R$)</Label>
                <Input
                  type="number"
                  value={(editingLead.value_cents / 100).toString()}
                  onChange={(e) => setEditingLead({ 
                    ...editingLead, 
                    value_cents: Math.round(parseFloat(e.target.value || "0") * 100) 
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>Observações</Label>
                <Textarea
                  value={editingLead.notes || ""}
                  onChange={(e) => setEditingLead({ ...editingLead, notes: e.target.value })}
                />
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditingLead(null)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateLead} className="bg-green-500 hover:bg-green-600">
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Chat Dialog */}
      <Dialog open={!!chatLead} onOpenChange={() => setChatLead(null)}>
        <DialogContent className="max-w-lg h-[600px] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-semibold">
                {chatLead?.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div>{chatLead?.name}</div>
                <div className="text-sm font-normal text-muted-foreground">
                  {chatLead?.phone}
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-2 p-4 bg-muted/20 rounded-lg">
            {chatMessages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                Nenhuma mensagem ainda
              </div>
            ) : (
              chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "max-w-[80%] p-3 rounded-lg",
                    msg.direction === "outbound"
                      ? "ml-auto bg-green-500 text-white"
                      : "bg-card"
                  )}
                >
                  <p className="text-sm">{msg.content}</p>
                  <span className="text-xs opacity-70">
                    {format(new Date(msg.sent_at), "HH:mm", { locale: ptBR })}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Input */}
          <div className="flex gap-2 pt-4">
            <Input
              placeholder="Digite uma mensagem..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <Button
              onClick={handleSendMessage}
              disabled={isSendingMessage || !newMessage.trim()}
              className="bg-green-500 hover:bg-green-600"
            >
              {isSendingMessage ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
