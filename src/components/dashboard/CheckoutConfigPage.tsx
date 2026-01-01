import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ShoppingCart, 
  Plus, 
  Trash2, 
  Save, 
  Loader2, 
  Clock,
  DollarSign,
  Edit2,
  CreditCard,
  Settings2
} from "lucide-react";
import PaymentGatewayConfig from "./PaymentGatewayConfig";
import CheckoutEditorPage from "./checkout/CheckoutEditorPage";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

interface CheckoutConfigPageProps {
  profileId: string;
}

interface Service {
  id?: string;
  name: string;
  description: string;
  duration_minutes: number;
  price_cents: number;
  is_active: boolean;
}

const CheckoutConfigPage = ({ profileId }: CheckoutConfigPageProps) => {
  const [editingCheckoutServiceId, setEditingCheckoutServiceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const [newService, setNewService] = useState<Service>({
    name: "",
    description: "",
    duration_minutes: 50,
    price_cents: 15000,
    is_active: true,
  });

  useEffect(() => {
    fetchServices();
  }, [profileId]);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("professional_id", profileId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const handleInputChange = (field: keyof Service, value: string | number | boolean) => {
    if (editingService) {
      setEditingService(prev => prev ? { ...prev, [field]: value } : null);
    } else {
      setNewService(prev => ({ ...prev, [field]: value }));
    }
  };

  const handlePriceChange = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    const cents = parseInt(numericValue) || 0;
    handleInputChange("price_cents", cents);
  };

  const resetForm = () => {
    setNewService({
      name: "",
      description: "",
      duration_minutes: 50,
      price_cents: 15000,
      is_active: true,
    });
    setEditingService(null);
  };

  const handleSave = async () => {
    const serviceToSave = editingService || newService;

    if (!serviceToSave.name.trim()) {
      toast.error("Nome do serviço é obrigatório");
      return;
    }

    if (serviceToSave.price_cents <= 0) {
      toast.error("Preço deve ser maior que zero");
      return;
    }

    setIsSaving(true);

    try {
      if (editingService?.id) {
        const { error } = await supabase
          .from("services")
          .update({
            name: serviceToSave.name,
            description: serviceToSave.description,
            duration_minutes: serviceToSave.duration_minutes,
            price_cents: serviceToSave.price_cents,
            is_active: serviceToSave.is_active,
          })
          .eq("id", editingService.id);

        if (error) throw error;

        setServices(prev => prev.map(s => 
          s.id === editingService.id ? { ...s, ...serviceToSave } : s
        ));
        toast.success("Serviço atualizado com sucesso!");
      } else {
        const { data, error } = await supabase
          .from("services")
          .insert({
            professional_id: profileId,
            name: serviceToSave.name,
            description: serviceToSave.description,
            duration_minutes: serviceToSave.duration_minutes,
            price_cents: serviceToSave.price_cents,
            is_active: serviceToSave.is_active,
          })
          .select()
          .single();

        if (error) throw error;

        setServices(prev => [data, ...prev]);
        toast.success("Serviço criado com sucesso!");
      }

      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving service:", error);
      toast.error("Erro ao salvar serviço");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (serviceId: string) => {
    if (!confirm("Tem certeza que deseja excluir este serviço?")) return;

    try {
      const { error } = await supabase
        .from("services")
        .delete()
        .eq("id", serviceId);

      if (error) throw error;

      setServices(prev => prev.filter(s => s.id !== serviceId));
      toast.success("Serviço excluído com sucesso!");
    } catch (error) {
      console.error("Error deleting service:", error);
      toast.error("Erro ao excluir serviço");
    }
  };

  const handleToggleActive = async (service: Service) => {
    try {
      const { error } = await supabase
        .from("services")
        .update({ is_active: !service.is_active })
        .eq("id", service.id);

      if (error) throw error;

      setServices(prev => prev.map(s => 
        s.id === service.id ? { ...s, is_active: !s.is_active } : s
      ));
    } catch (error) {
      console.error("Error toggling service:", error);
      toast.error("Erro ao atualizar serviço");
    }
  };

  const openEditDialog = (service: Service) => {
    setEditingService(service);
    setIsDialogOpen(true);
  };

  const currentService = editingService || newService;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show Checkout Editor (Full screen style like Starfy)
  if (editingCheckoutServiceId) {
    return (
      <CheckoutEditorPage
        profileId={profileId}
        serviceId={editingCheckoutServiceId}
        onBack={() => setEditingCheckoutServiceId(null)}
      />
    );
  }

  return (
    <div className="h-full">
      <Tabs defaultValue="services" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 bg-card border border-border/50">
          <TabsTrigger value="services" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Serviços
          </TabsTrigger>
          <TabsTrigger value="gateway" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <CreditCard className="h-4 w-4 mr-2" />
            Gateway
          </TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="mt-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground">Seus Serviços</h2>
              <p className="text-muted-foreground text-sm">Configure os serviços que você oferece</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Serviço
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border text-foreground">
                <DialogHeader>
                  <DialogTitle>
                    {editingService ? "Editar Serviço" : "Novo Serviço"}
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    {editingService 
                      ? "Atualize as informações do serviço"
                      : "Adicione um novo serviço ao seu catálogo"
                    }
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Nome do Serviço *</Label>
                    <Input
                      value={currentService.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Ex: Sessão de Terapia Individual"
                      className="bg-muted/50 border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Descrição</Label>
                    <Textarea
                      value={currentService.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Descreva seu serviço..."
                      rows={3}
                      className="bg-muted/50 border-border resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Duração (minutos)</Label>
                      <Input
                        type="number"
                        value={currentService.duration_minutes}
                        onChange={(e) => handleInputChange("duration_minutes", parseInt(e.target.value) || 0)}
                        min={15}
                        max={180}
                        className="bg-muted/50 border-border"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Preço</Label>
                      <Input
                        value={formatPrice(currentService.price_cents)}
                        onChange={(e) => handlePriceChange(e.target.value)}
                        placeholder="R$ 0,00"
                        className="bg-muted/50 border-border"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <Label>Ativo</Label>
                    <Switch
                      checked={currentService.is_active}
                      onCheckedChange={(checked) => handleInputChange("is_active", checked)}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      resetForm();
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Salvar
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Services List */}
          {services.length === 0 ? (
            <Card className="bg-card border-border/50">
              <CardContent className="py-12 text-center">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Nenhum serviço cadastrado</h3>
                <p className="text-muted-foreground mb-4">Crie seu primeiro serviço para começar a receber pagamentos</p>
                <Button onClick={() => setIsDialogOpen(true)} className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Serviço
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {services.map((service) => (
                <Card 
                  key={service.id} 
                  className={`bg-card border-border/50 ${!service.is_active ? "opacity-60" : ""}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-medium text-foreground">{service.name}</h3>
                          {!service.is_active && (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground">
                              Inativo
                            </span>
                          )}
                        </div>
                        {service.description && (
                          <p className="text-muted-foreground text-sm mb-4">{service.description}</p>
                        )}
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span className="text-sm">{service.duration_minutes} minutos</span>
                          </div>
                          <div className="flex items-center gap-2 text-primary font-semibold">
                            <DollarSign className="h-4 w-4" />
                            <span>{formatPrice(service.price_cents)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={service.is_active}
                          onCheckedChange={() => handleToggleActive(service)}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => service.id && setEditingCheckoutServiceId(service.id)}
                          className="text-primary hover:text-primary hover:bg-primary/10 gap-1"
                        >
                          <Settings2 className="h-4 w-4" />
                          <span className="hidden sm:inline">Checkout</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(service)}
                          className="text-muted-foreground hover:text-foreground hover:bg-muted"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => service.id && handleDelete(service.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="gateway" className="mt-6">
          <PaymentGatewayConfig profileId={profileId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CheckoutConfigPage;
