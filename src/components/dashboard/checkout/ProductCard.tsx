import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Eye, Link2, Trash2, ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  id: string;
  name: string;
  price_cents: number;
  image_url?: string | null;
  gateway_type?: string;
  is_active?: boolean;
  onEdit: () => void;
  onEditCheckout: () => void;
  onCopyLink: () => void;
  onDelete: () => void;
}

const ProductCard = ({
  id,
  name,
  price_cents,
  image_url,
  gateway_type,
  is_active = true,
  onEdit,
  onEditCheckout,
  onCopyLink,
  onDelete,
}: ProductCardProps) => {
  const [showActions, setShowActions] = useState(false);

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const gatewayLabel = gateway_type === "mercado_pago" ? "MERCADO PAGO" : "PUSHINPAY";
  const gatewayColor = gateway_type === "mercado_pago" ? "bg-blue-500" : "bg-orange-500";

  return (
    <Card
      className={cn(
        "group relative overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer",
        !is_active && "opacity-60"
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Image area */}
      <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
        {image_url ? (
          <img
            src={image_url}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center text-gray-500">
              <ImageOff className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <span className="text-sm">Sem imagem</span>
            </div>
          </div>
        )}

        {/* Gateway Badge */}
        <div className={cn("absolute top-3 right-3 px-2.5 py-1 rounded text-[10px] font-bold text-white shadow-lg", gatewayColor)}>
          {gatewayLabel}
        </div>

        {/* Hover Actions */}
        <div
          className={cn(
            "absolute inset-0 bg-black/60 flex items-center justify-center gap-2 transition-opacity duration-200",
            showActions ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          <Button
            size="icon"
            variant="secondary"
            className="h-10 w-10 rounded-full bg-white/90 hover:bg-white text-gray-800"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-10 w-10 rounded-full bg-orange-500 hover:bg-orange-600 text-white"
            onClick={(e) => {
              e.stopPropagation();
              onEditCheckout();
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-10 w-10 rounded-full bg-white/90 hover:bg-white text-gray-800"
            onClick={(e) => {
              e.stopPropagation();
              onCopyLink();
            }}
          >
            <Link2 className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-10 w-10 rounded-full bg-red-500 hover:bg-red-600 text-white"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Info */}
      <CardContent className="p-4 bg-white">
        <h3 className="font-semibold text-gray-800 truncate mb-3">{name}</h3>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 uppercase tracking-wide">PREÇO</span>
            <p className="text-lg font-bold text-orange-500">{formatPrice(price_cents)}</p>
          </div>
          <div className="text-gray-300">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
