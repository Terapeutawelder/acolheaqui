import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Crown,
  Star,
  GripVertical,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  features: string[];
  price_monthly_cents: number;
  price_semiannual_cents: number | null;
  price_annual_cents: number | null;
  price_monthly_enabled: boolean;
  price_semiannual_enabled: boolean;
  price_annual_enabled: boolean;
  trial_days: number;
  is_active: boolean;
  is_featured: boolean;
  display_order: number;
  badge_text: string | null;
}

interface AdminPlansProps {
  userRole?: string | null;
}

const defaultPlan: Omit<Plan, "id"> = {
  name: "",
  slug: "",
  description: "",
  features: [],
  price_monthly_cents: 0,
  price_semiannual_cents: null,
  price_annual_cents: null,
  price_monthly_enabled: true,
  price_semiannual_enabled: true,
  price_annual_enabled: true,
  trial_days: 7,
  is_active: true,
  is_featured: false,
  display_order: 0,
  badge_text: null,
};

const AdminPlans = ({ userRole }: AdminPlansProps) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [featuresText, setFeaturesText] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [priceToggles, setPriceToggles] = useState({
    monthly: true,
    semiannual: true,
    annual: true,
  });
  const { toast } = useToast();

  const isSuperAdmin = userRole === "super_admin";

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;

      setPlans(
        (data || []).map((p) => ({
          ...p,
          features: Array.isArray(p.features) 
            ? (p.features as unknown as string[]) 
            : [],
        })) as Plan[]
      );
    } catch (error) {
      console.error("Error fetching plans:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os planos.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingPlan(null);
    setFeaturesText("");
    setPriceToggles({ monthly: true, semiannual: true, annual: true });
    setIsDialogOpen(true);
  };

  const openEditDialog = (plan: Plan) => {
    setEditingPlan(plan);
    setFeaturesText(plan.features.join("\n"));
    setPriceToggles({
      monthly: plan.price_monthly_enabled ?? true,
      semiannual: plan.price_semiannual_enabled ?? true,
      annual: plan.price_annual_enabled ?? true,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isSuperAdmin) return;

    setIsSaving(true);
    const form = e.currentTarget;
    const formData = new FormData(form);

    const planData = {
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      description: formData.get("description") as string || null,
      features: featuresText.split("\n").filter((f) => f.trim()),
      price_monthly_cents: Math.round(parseFloat(formData.get("price_monthly") as string || "0") * 100),
      price_semiannual_cents: formData.get("price_semiannual")
        ? Math.round(parseFloat(formData.get("price_semiannual") as string) * 100)
        : null,
      price_annual_cents: formData.get("price_annual")
        ? Math.round(parseFloat(formData.get("price_annual") as string) * 100)
        : null,
      price_monthly_enabled: priceToggles.monthly,
      price_semiannual_enabled: priceToggles.semiannual,
      price_annual_enabled: priceToggles.annual,
      trial_days: parseInt(formData.get("trial_days") as string || "0"),
      is_active: formData.get("is_active") === "on",
      is_featured: formData.get("is_featured") === "on",
      display_order: parseInt(formData.get("display_order") as string || "0"),
      badge_text: (formData.get("badge_text") as string) || null,
    };

    try {
      if (editingPlan) {
        const { error } = await supabase
          .from("subscription_plans")
          .update(planData)
          .eq("id", editingPlan.id);

        if (error) throw error;

        toast({
          title: "Plano atualizado",
          description: `O plano "${planData.name}" foi atualizado com sucesso.`,
        });
      } else {
        const { error } = await supabase.from("subscription_plans").insert(planData);

        if (error) throw error;

        toast({
          title: "Plano criado",
          description: `O plano "${planData.name}" foi criado com sucesso.`,
        });
      }

      setIsDialogOpen(false);
      fetchPlans();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível salvar o plano.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!isSuperAdmin) return;

    try {
      const { error } = await supabase.from("subscription_plans").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Plano excluído",
        description: "O plano foi excluído com sucesso.",
      });

      setDeleteConfirmId(null);
      fetchPlans();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível excluir o plano.",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (cents: number | null) => {
    if (cents === null || cents === undefined) return "-";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Planos de Assinatura</h1>
          <p className="text-slate-400 mt-1">Gerencie os planos Pro e Premium da plataforma</p>
        </div>
        {isSuperAdmin && (
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Plano
          </Button>
        )}
      </div>

      {/* Plans Cards for Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`bg-slate-800/50 border-slate-700 relative ${
              plan.is_featured ? "ring-2 ring-primary" : ""
            }`}
          >
            {plan.badge_text && (
              <Badge className="absolute -top-2 left-4 bg-primary text-primary-foreground">
                {plan.badge_text}
              </Badge>
            )}
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {plan.is_featured ? (
                    <Crown className="w-5 h-5 text-primary" />
                  ) : (
                    <Star className="w-5 h-5 text-slate-400" />
                  )}
                  <CardTitle className="text-white">{plan.name}</CardTitle>
                </div>
                <Badge
                  className={
                    plan.is_active
                      ? "bg-green-500/20 text-green-400 border-green-500/30"
                      : "bg-slate-500/20 text-slate-400 border-slate-500/30"
                  }
                >
                  {plan.is_active ? "Ativo" : "Inativo"}
                </Badge>
              </div>
              <CardDescription className="text-slate-400">{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Mensal:</span>
                  <span className={`font-medium ${plan.price_monthly_enabled !== false ? 'text-white' : 'text-slate-500 line-through'}`}>
                    {formatCurrency(plan.price_monthly_cents)}
                    {plan.price_monthly_enabled === false && <span className="text-xs ml-1">(desativado)</span>}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Semestral:</span>
                  <span className={`font-medium ${plan.price_semiannual_enabled !== false ? 'text-white' : 'text-slate-500 line-through'}`}>
                    {formatCurrency(plan.price_semiannual_cents)}
                    {plan.price_semiannual_enabled === false && <span className="text-xs ml-1">(desativado)</span>}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Anual:</span>
                  <span className={`font-medium ${plan.price_annual_enabled !== false ? 'text-white' : 'text-slate-500 line-through'}`}>
                    {formatCurrency(plan.price_annual_cents)}
                    {plan.price_annual_enabled === false && <span className="text-xs ml-1">(desativado)</span>}
                  </span>
                </div>
              </div>

              <div className="text-sm text-slate-400">
                <span className="font-medium">{plan.features.length}</span> recursos incluídos
              </div>

              {isSuperAdmin && (
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openEditDialog(plan)}
                  >
                    <Pencil className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    onClick={() => setDeleteConfirmId(plan.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Plans Table */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Todos os Planos</CardTitle>
          <CardDescription className="text-slate-400">
            Lista completa com detalhes de preços e configurações
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-300">Ordem</TableHead>
                  <TableHead className="text-slate-300">Nome</TableHead>
                  <TableHead className="text-slate-300">Slug</TableHead>
                  <TableHead className="text-slate-300">Mensal</TableHead>
                  <TableHead className="text-slate-300">Semestral</TableHead>
                  <TableHead className="text-slate-300">Anual</TableHead>
                  <TableHead className="text-slate-300">Trial</TableHead>
                  <TableHead className="text-slate-300">Status</TableHead>
                  <TableHead className="text-slate-300">Destaque</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((plan) => (
                  <TableRow key={plan.id} className="border-slate-700">
                    <TableCell className="text-slate-400">
                      <GripVertical className="w-4 h-4 inline mr-1" />
                      {plan.display_order}
                    </TableCell>
                    <TableCell className="text-white font-medium">{plan.name}</TableCell>
                    <TableCell className="text-slate-400 font-mono text-sm">{plan.slug}</TableCell>
                    <TableCell className="text-white">
                      {formatCurrency(plan.price_monthly_cents)}
                    </TableCell>
                    <TableCell className="text-white">
                      {formatCurrency(plan.price_semiannual_cents)}
                    </TableCell>
                    <TableCell className="text-white">
                      {formatCurrency(plan.price_annual_cents)}
                    </TableCell>
                    <TableCell className="text-slate-400">{plan.trial_days} dias</TableCell>
                    <TableCell>
                      {plan.is_active ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-slate-500" />
                      )}
                    </TableCell>
                    <TableCell>
                      {plan.is_featured ? (
                        <Crown className="w-5 h-5 text-primary" />
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit/Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPlan ? "Editar Plano" : "Criar Novo Plano"}</DialogTitle>
            <DialogDescription className="text-slate-400">
              Configure os detalhes do plano de assinatura
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Plano</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={editingPlan?.name || ""}
                  required
                  className="bg-slate-700/50 border-slate-600"
                  placeholder="Plano Pro"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL)</Label>
                <Input
                  id="slug"
                  name="slug"
                  defaultValue={editingPlan?.slug || ""}
                  required
                  className="bg-slate-700/50 border-slate-600"
                  placeholder="pro"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={editingPlan?.description || ""}
                className="bg-slate-700/50 border-slate-600"
                placeholder="Ideal para profissionais que..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="features">Recursos (um por linha)</Label>
              <Textarea
                id="features"
                value={featuresText}
                onChange={(e) => setFeaturesText(e.target.value)}
                className="bg-slate-700/50 border-slate-600"
                placeholder="CRM completo&#10;Agenda online&#10;Checkout personalizado"
                rows={5}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="price_monthly">Preço Mensal (R$)</Label>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="price_monthly_enabled"
                      checked={priceToggles.monthly}
                      onCheckedChange={(checked) => setPriceToggles(prev => ({ ...prev, monthly: checked }))}
                    />
                    <span className="text-xs text-slate-400">Ativo</span>
                  </div>
                </div>
                <Input
                  id="price_monthly"
                  name="price_monthly"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={editingPlan ? (editingPlan.price_monthly_cents / 100).toFixed(2) : ""}
                  required
                  disabled={!priceToggles.monthly}
                  className="bg-slate-700/50 border-slate-600 disabled:opacity-50"
                  placeholder="147.00"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="price_semiannual">Preço Semestral (R$)</Label>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="price_semiannual_enabled"
                      checked={priceToggles.semiannual}
                      onCheckedChange={(checked) => setPriceToggles(prev => ({ ...prev, semiannual: checked }))}
                    />
                    <span className="text-xs text-slate-400">Ativo</span>
                  </div>
                </div>
                <Input
                  id="price_semiannual"
                  name="price_semiannual"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={
                    editingPlan?.price_semiannual_cents
                      ? (editingPlan.price_semiannual_cents / 100).toFixed(2)
                      : ""
                  }
                  disabled={!priceToggles.semiannual}
                  className="bg-slate-700/50 border-slate-600 disabled:opacity-50"
                  placeholder="735.00"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="price_annual">Preço Anual (R$)</Label>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="price_annual_enabled"
                      checked={priceToggles.annual}
                      onCheckedChange={(checked) => setPriceToggles(prev => ({ ...prev, annual: checked }))}
                    />
                    <span className="text-xs text-slate-400">Ativo</span>
                  </div>
                </div>
                <Input
                  id="price_annual"
                  name="price_annual"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={
                    editingPlan?.price_annual_cents
                      ? (editingPlan.price_annual_cents / 100).toFixed(2)
                      : ""
                  }
                  disabled={!priceToggles.annual}
                  className="bg-slate-700/50 border-slate-600 disabled:opacity-50"
                  placeholder="1176.00"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="trial_days">Dias de Trial</Label>
                <Input
                  id="trial_days"
                  name="trial_days"
                  type="number"
                  min="0"
                  defaultValue={editingPlan?.trial_days || 7}
                  className="bg-slate-700/50 border-slate-600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="display_order">Ordem de Exibição</Label>
                <Input
                  id="display_order"
                  name="display_order"
                  type="number"
                  min="0"
                  defaultValue={editingPlan?.display_order || 0}
                  className="bg-slate-700/50 border-slate-600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="badge_text">Badge (opcional)</Label>
                <Input
                  id="badge_text"
                  name="badge_text"
                  defaultValue={editingPlan?.badge_text || ""}
                  className="bg-slate-700/50 border-slate-600"
                  placeholder="Mais Popular"
                />
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  id="is_active"
                  name="is_active"
                  defaultChecked={editingPlan?.is_active ?? true}
                />
                <Label htmlFor="is_active">Plano Ativo</Label>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="is_featured"
                  name="is_featured"
                  defaultChecked={editingPlan?.is_featured ?? false}
                />
                <Label htmlFor="is_featured">Destaque</Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : editingPlan ? (
                  "Salvar Alterações"
                ) : (
                  "Criar Plano"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription className="text-slate-400">
              Tem certeza que deseja excluir este plano? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
            >
              Excluir Plano
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPlans;
