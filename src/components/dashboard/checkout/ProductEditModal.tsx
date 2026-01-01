import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Save, Upload, X, FileText } from "lucide-react";

interface ProductConfig {
  delivery_type: "none" | "pdf" | "link";
  pdf_url?: string;
  pdf_name?: string;
  redirect_url?: string;
}

interface ProductEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: {
    id?: string;
    name: string;
    description: string;
    price_cents: number;
    duration_minutes: number;
    is_active: boolean;
    product_config?: ProductConfig;
    image_url?: string;
  } | null;
  profileId: string;
  userId: string;
  gatewayType: string;
  onSave: () => void;
}

const ProductEditModal = ({
  open,
  onOpenChange,
  service,
  profileId,
  userId,
  gatewayType,
  onSave,
}: ProductEditModalProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [name, setName] = useState(service?.name || "");
  const [description, setDescription] = useState(service?.description || "");
  const [priceCents, setPriceCents] = useState(service?.price_cents || 0);
  const [deliveryType, setDeliveryType] = useState<"none" | "pdf" | "link">(
    service?.product_config?.delivery_type || "none"
  );
  const [pdfUrl, setPdfUrl] = useState(service?.product_config?.pdf_url || "");
  const [pdfName, setPdfName] = useState(service?.product_config?.pdf_name || "");
  const [redirectUrl, setRedirectUrl] = useState(service?.product_config?.redirect_url || "");
  const [imageUrl, setImageUrl] = useState(service?.image_url || "");
  const [selectedGateway, setSelectedGateway] = useState(gatewayType || "pushinpay");

  // Reset form when service changes
  useState(() => {
    if (service) {
      setName(service.name);
      setDescription(service.description);
      setPriceCents(service.price_cents);
      setDeliveryType(service.product_config?.delivery_type || "none");
      setPdfUrl(service.product_config?.pdf_url || "");
      setPdfName(service.product_config?.pdf_name || "");
      setRedirectUrl(service.product_config?.redirect_url || "");
      setImageUrl(service.image_url || "");
    }
  });

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const handlePriceChange = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    setPriceCents(parseInt(numericValue) || 0);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem válida");
      return;
    }

    setIsUploadingImage(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("checkout-public")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("checkout-public")
        .getPublicUrl(fileName);

      setImageUrl(publicUrl);
      toast.success("Imagem enviada com sucesso!");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Erro ao enviar imagem");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Por favor, selecione um arquivo PDF");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("O arquivo deve ter no máximo 10MB");
      return;
    }

    setIsUploadingPdf(true);
    try {
      const fileName = `${userId}/${Date.now()}_${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("checkout-private")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("checkout-private")
        .getPublicUrl(fileName);

      setPdfUrl(publicUrl);
      setPdfName(file.name);
      toast.success("PDF enviado com sucesso!");
    } catch (error) {
      console.error("Error uploading PDF:", error);
      toast.error("Erro ao enviar PDF");
    } finally {
      setIsUploadingPdf(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Nome do produto é obrigatório");
      return;
    }

    if (priceCents <= 0) {
      toast.error("Preço deve ser maior que zero");
      return;
    }

    setIsSaving(true);

    const productConfig = {
      delivery_type: deliveryType,
      ...(deliveryType === "pdf" && { pdf_url: pdfUrl, pdf_name: pdfName }),
      ...(deliveryType === "link" && { redirect_url: redirectUrl }),
    };

    try {
      if (service?.id) {
        const { error } = await supabase
          .from("services")
          .update({
            name,
            description,
            price_cents: priceCents,
            product_config: JSON.parse(JSON.stringify(productConfig)),
          })
          .eq("id", service.id);

        if (error) throw error;
        toast.success("Produto atualizado com sucesso!");
      } else {
        const { error } = await supabase.from("services").insert([{
          professional_id: profileId,
          name,
          description,
          price_cents: priceCents,
          duration_minutes: 50,
          is_active: true,
          product_config: JSON.parse(JSON.stringify(productConfig)),
        }]);

        if (error) throw error;
        toast.success("Produto criado com sucesso!");
      }

      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving service:", error);
      toast.error("Erro ao salvar produto");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span className="text-2xl">📦</span>
            {service?.id ? "Editar Produto" : "Novo Produto"}
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Form (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Nome do Produto</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Curso de Terapia"
                  className="border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Preço (R$)</Label>
                <Input
                  value={formatPrice(priceCents)}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  placeholder="R$ 0,00"
                  className="border-gray-300"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">Descrição</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descrição do Produto"
                className="border-gray-300 resize-none"
                rows={4}
              />
            </div>

            {/* Delivery Config */}
            <div className="border border-gray-200 rounded-lg p-4 space-y-4">
              <div className="flex items-center gap-2 text-gray-700">
                <FileText className="h-5 w-5" />
                <span className="font-semibold">CONFIGURAÇÃO DE ENTREGA</span>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-600 text-sm">Como o cliente receberá o produto?</Label>
                <Select value={deliveryType} onValueChange={(v: "none" | "pdf" | "link") => setDeliveryType(v)}>
                  <SelectTrigger className="border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem entrega digital</SelectItem>
                    <SelectItem value="pdf">📄 Arquivo PDF (Anexo no E-mail)</SelectItem>
                    <SelectItem value="link">🔗 Link de Redirecionamento</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {deliveryType === "pdf" && (
                <div className="space-y-3">
                  <Label className="text-gray-600 text-sm">Upload do Arquivo PDF</Label>
                  
                  {pdfName && (
                    <div className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="p-2 bg-orange-100 rounded">
                        <FileText className="h-5 w-5 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Arquivo Atual:</p>
                        <p className="text-sm font-medium text-gray-700">{pdfName}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setPdfUrl("");
                          setPdfName("");
                        }}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-orange-400 hover:bg-orange-50/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {isUploadingPdf ? (
                      <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto" />
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">
                          <span className="text-orange-500 font-medium">Clique para enviar</span> ou arraste
                        </p>
                        <p className="text-xs text-gray-400 mt-1">PDF (MAX. 10MB)</p>
                      </>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={handlePdfUpload}
                  />
                </div>
              )}

              {deliveryType === "link" && (
                <div className="space-y-2">
                  <Label className="text-gray-600 text-sm">URL de Redirecionamento</Label>
                  <Input
                    value={redirectUrl}
                    onChange={(e) => setRedirectUrl(e.target.value)}
                    placeholder="https://seusite.com/area-de-membros"
                    className="border-gray-300"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right: Image + Gateway (1/3) */}
          <div className="space-y-6">
            {/* Product Image */}
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">Capa do Produto</Label>
              <div
                className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg overflow-hidden cursor-pointer relative group"
                onClick={() => imageInputRef.current?.click()}
              >
                {imageUrl ? (
                  <img src={imageUrl} alt="Capa" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {isUploadingImage ? (
                      <Loader2 className="h-10 w-10 animate-spin text-white/50" />
                    ) : (
                      <div className="text-center text-white/50">
                        <Upload className="h-10 w-10 mx-auto mb-2" />
                        <span className="text-sm">Clique para upload</span>
                      </div>
                    )}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Upload className="h-8 w-8 text-white" />
                </div>
              </div>
              <p className="text-xs text-gray-500 text-center">Recomendado: 400x600px (PNG/JPG)</p>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>

            {/* Payment Gateway */}
            <div className="border border-gray-200 rounded-lg p-4 space-y-3">
              <span className="text-sm font-semibold text-orange-500">Processador de Pagamento</span>
              <RadioGroup value={selectedGateway} onValueChange={setSelectedGateway}>
                <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:border-orange-300 transition-colors">
                  <RadioGroupItem value="mercado_pago" id="mp" />
                  <label htmlFor="mp" className="flex-1 cursor-pointer">
                    <span className="font-medium text-gray-800">Mercado Pago</span>
                    <p className="text-xs text-gray-500">Cartão, Pix e Boleto</p>
                  </label>
                </div>
                <div className="flex items-center space-x-3 p-3 border border-orange-300 bg-orange-50 rounded-lg">
                  <RadioGroupItem value="pushinpay" id="pp" />
                  <label htmlFor="pp" className="flex-1 cursor-pointer">
                    <span className="font-medium text-gray-800">PushinPay</span>
                    <p className="text-xs text-gray-500">Exclusivo para PIX</p>
                  </label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 pt-0 border-t border-gray-100 mt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductEditModal;
