import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { 
  Image as ImageIcon, 
  Upload, 
  Trash2, 
  User, 
  ImagePlus,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { LandingPageConfig } from "./LandingPagePreview";

interface ImageEditorProps {
  config: LandingPageConfig;
  onConfigChange: (config: LandingPageConfig) => void;
  profileId: string;
  currentAvatarUrl?: string;
}

const ImageEditor = ({ config, onConfigChange, profileId, currentAvatarUrl }: ImageEditorProps) => {
  const [isUploadingAbout, setIsUploadingAbout] = useState(false);
  const [isUploadingHero, setIsUploadingHero] = useState(false);
  const aboutPhotoInputRef = useRef<HTMLInputElement>(null);
  const heroInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (
    file: File,
    type: "aboutPhoto" | "heroBanner",
    setLoading: (value: boolean) => void
  ) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB");
      return;
    }

    setLoading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${profileId}/landing-${type}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      const imageUrl = `${publicUrl}?t=${Date.now()}`;

      onConfigChange({
        ...config,
        images: {
          ...config.images,
          [type]: imageUrl,
        },
      });

      toast.success("Imagem atualizada com sucesso!");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Erro ao fazer upload da imagem");
    } finally {
      setLoading(false);
    }
  };

  const handleAboutPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file, "aboutPhoto", setIsUploadingAbout);
    }
  };

  const handleHeroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file, "heroBanner", setIsUploadingHero);
    }
  };

  const removeImage = (type: "aboutPhoto" | "heroBanner") => {
    onConfigChange({
      ...config,
      images: {
        ...config.images,
        [type]: "",
      },
    });
    toast.success("Imagem removida");
  };

  const aboutPhotoUrl = config.images.aboutPhoto || currentAvatarUrl;

  return (
    <div className="space-y-4">
      <input
        ref={aboutPhotoInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAboutPhotoChange}
      />
      <input
        ref={heroInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleHeroChange}
      />

      {/* Foto Sobre Mim */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            Foto - Seção "Sobre Mim"
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Esta imagem aparece na seção "Sobre Mim" da sua landing page. Recomendamos uma foto profissional em formato retrato (4:5).
          </p>
          
          <div className="flex gap-3">
            {/* Preview */}
            <div className="w-24 h-28 rounded-lg overflow-hidden bg-muted border border-border flex-shrink-0">
              {aboutPhotoUrl ? (
                <img 
                  src={aboutPhotoUrl}
                  alt="Preview Sobre Mim"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 flex-1">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => aboutPhotoInputRef.current?.click()}
                disabled={isUploadingAbout}
                className="w-full justify-start gap-2"
              >
                {isUploadingAbout ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                {config.images.aboutPhoto ? "Alterar foto" : "Enviar foto"}
              </Button>
              
              {config.images.aboutPhoto && (
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => removeImage("aboutPhoto")}
                  className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  Usar foto do perfil
                </Button>
              )}

              <p className="text-[10px] text-muted-foreground mt-1">
                {config.images.aboutPhoto 
                  ? "Usando foto personalizada" 
                  : "Usando foto do perfil"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Banner Hero */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <ImagePlus className="h-4 w-4 text-primary" />
            Banner Hero (Opcional)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Imagem de fundo para a seção principal. Deixe em branco para usar o gradiente padrão.
          </p>
          
          <div className="flex gap-3">
            {/* Preview */}
            <div className="w-28 h-16 rounded-lg overflow-hidden bg-muted border border-border flex-shrink-0">
              {config.images.heroBanner ? (
                <img 
                  src={config.images.heroBanner}
                  alt="Preview Hero"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-200/50 to-gold-200/30">
                  <ImageIcon className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 flex-1">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => heroInputRef.current?.click()}
                disabled={isUploadingHero}
                className="w-full justify-start gap-2"
              >
                {isUploadingHero ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                {config.images.heroBanner ? "Alterar banner" : "Enviar banner"}
              </Button>
              
              {config.images.heroBanner && (
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => removeImage("heroBanner")}
                  className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  Remover banner
                </Button>
              )}

              <p className="text-[10px] text-muted-foreground mt-1">
                {config.images.heroBanner 
                  ? "Banner personalizado ativo" 
                  : "Usando gradiente padrão"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-dashed">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <ImageIcon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs font-medium text-foreground mb-1">Dicas de Imagens</p>
              <ul className="text-[10px] text-muted-foreground space-y-0.5">
                <li>• Formatos aceitos: JPG, PNG, WebP</li>
                <li>• Tamanho máximo: 5MB</li>
                <li>• Foto "Sobre Mim": proporção 4:5 (retrato)</li>
                <li>• Banner Hero: proporção 16:9 (paisagem)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImageEditor;