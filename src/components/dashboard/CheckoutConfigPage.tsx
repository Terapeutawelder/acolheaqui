import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import ProductCard from "./checkout/ProductCard";
import ProductEditModal from "./checkout/ProductEditModal";
import CheckoutEditorPage from "./checkout/CheckoutEditorPage";

interface CheckoutConfigPageProps {
  profileId: string;
}

interface Service {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price_cents: number;
  is_active: boolean;
  product_config?: Record<string, unknown>;
  checkout_config?: Record<string, unknown>;
}

const CheckoutConfigPage = ({ profileId }: CheckoutConfigPageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [userId, setUserId] = useState<string>("");
  const [gatewayType, setGatewayType] = useState("pushinpay");
  
  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  
  // Editor state
  const [editingCheckoutServiceId, setEditingCheckoutServiceId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [profileId]);

  const fetchData = async () => {
    try {
      // Get user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);

      // Fetch services
      const { data: servicesData, error: servicesError } = await supabase
        .from("services")
        .select("*")
        .eq("professional_id", profileId)
        .order("created_at", { ascending: false });

      if (servicesError) throw servicesError;
      
      // Type-safe mapping
      const typedServices: Service[] = (servicesData || []).map(s => ({
        id: s.id,
        name: s.name,
        description: s.description,
        duration_minutes: s.duration_minutes,
        price_cents: s.price_cents,
        is_active: s.is_active ?? true,
        product_config: undefined, // Will be updated when we add this column
        checkout_config: undefined,
      }));
      
      setServices(typedServices);

      // Fetch gateway type
      const { data: gatewayData } = await supabase
        .from("payment_gateways")
        .select("gateway_type")
        .eq("professional_id", profileId)
        .eq("is_active", true)
        .maybeSingle();

      if (gatewayData) {
        setGatewayType(gatewayData.gateway_type);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (serviceId: string) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;

    try {
      const { error } = await supabase
        .from("services")
        .delete()
        .eq("id", serviceId);

      if (error) throw error;

      setServices(prev => prev.filter(s => s.id !== serviceId));
      toast.success("Produto excluído com sucesso!");
    } catch (error) {
      console.error("Error deleting service:", error);
      toast.error("Erro ao excluir produto");
    }
  };

  const handleCopyLink = (serviceId: string) => {
    const url = `${window.location.origin}/checkout/${serviceId}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copiado para a área de transferência!");
  };

  const openNewProductModal = () => {
    setEditingService(null);
    setEditModalOpen(true);
  };

  const openEditProductModal = (service: Service) => {
    setEditingService(service);
    setEditModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  // Show Checkout Editor
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Meus Produtos</h2>
          <p className="text-muted-foreground">Gerencie seu catálogo, preços e formas de entrega.</p>
        </div>
        <Button
          onClick={openNewProductModal}
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      {/* Products Grid */}
      {services.length === 0 ? (
        <div className="bg-card rounded-xl border border-border/50 p-12 text-center">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-lg font-medium text-foreground mb-2">Nenhum produto cadastrado</h3>
          <p className="text-muted-foreground mb-6">Crie seu primeiro produto para começar a vender</p>
          <Button
            onClick={openNewProductModal}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Criar Primeiro Produto
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <ProductCard
              key={service.id}
              id={service.id}
              name={service.name}
              price_cents={service.price_cents}
              image_url={undefined}
              gateway_type={gatewayType}
              is_active={service.is_active}
              onEdit={() => openEditProductModal(service)}
              onEditCheckout={() => setEditingCheckoutServiceId(service.id)}
              onCopyLink={() => handleCopyLink(service.id)}
              onDelete={() => handleDelete(service.id)}
            />
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <ProductEditModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        service={editingService ? {
          id: editingService.id,
          name: editingService.name,
          description: editingService.description || "",
          price_cents: editingService.price_cents,
          duration_minutes: editingService.duration_minutes,
          is_active: editingService.is_active,
        } : null}
        profileId={profileId}
        userId={userId}
        gatewayType={gatewayType}
        onSave={fetchData}
      />
    </div>
  );
};

export default CheckoutConfigPage;
