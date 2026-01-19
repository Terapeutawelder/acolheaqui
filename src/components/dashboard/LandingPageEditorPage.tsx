import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Eye, Copy, Check, Palette, Layout, Image, Type } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface LandingPageEditorPageProps {
  profileId: string;
}

const LandingPageEditorPage = ({ profileId }: LandingPageEditorPageProps) => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  
  useEffect(() => {
    fetchProfile();
  }, [profileId]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", profileId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Erro ao carregar perfil");
    } finally {
      setLoading(false);
    }
  };

  const getProfileUrl = () => {
    const baseUrl = window.location.origin;
    if (profile?.user_slug) {
      return `${baseUrl}/p/${profile.user_slug}`;
    }
    return `${baseUrl}/p/${profileId}`;
  };

  const copyLink = () => {
    navigator.clipboard.writeText(getProfileUrl());
    setCopied(true);
    toast.success("Link copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  const openPreview = () => {
    window.open(getProfileUrl(), "_blank");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Landing Page</h2>
          <p className="text-muted-foreground mt-1">
            Personalize sua página de apresentação profissional
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={openPreview} className="gap-2">
            <Eye className="h-4 w-4" />
            Visualizar
          </Button>
          <Button onClick={copyLink} className="gap-2">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copiado!" : "Copiar Link"}
          </Button>
        </div>
      </div>

      {/* URL Preview */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <ExternalLink className="h-5 w-5 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground mb-1">Sua Landing Page está disponível em:</p>
              <p className="text-sm font-mono text-primary truncate">{getProfileUrl()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <FeatureCard
          icon={Layout}
          title="Layout"
          description="Em breve você poderá escolher entre diferentes templates de layout"
          comingSoon
        />
        <FeatureCard
          icon={Palette}
          title="Cores"
          description="Personalize as cores da sua landing page para combinar com sua marca"
          comingSoon
        />
        <FeatureCard
          icon={Image}
          title="Imagens"
          description="Adicione imagens de capa e galeria para destacar seu trabalho"
          comingSoon
        />
        <FeatureCard
          icon={Type}
          title="Textos"
          description="Edite os textos e descrições diretamente na página de perfil"
          linkText="Editar Perfil"
          linkHref="/dashboard?tab=profile"
        />
      </div>

      {/* Current Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informações Atuais</CardTitle>
          <CardDescription>
            Dados exibidos na sua landing page (edite em "Dados do Perfil")
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground text-xs">Nome</Label>
              <p className="text-foreground font-medium">{profile?.full_name || "Não definido"}</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Especialidade</Label>
              <p className="text-foreground font-medium">{profile?.specialty || "Não definido"}</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">CRP</Label>
              <p className="text-foreground font-medium">{profile?.crp || "Não definido"}</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Slug personalizado</Label>
              <p className="text-foreground font-medium">{profile?.user_slug || "Não definido"}</p>
            </div>
          </div>
          <div>
            <Label className="text-muted-foreground text-xs">Bio</Label>
            <p className="text-foreground text-sm mt-1">
              {profile?.bio || "Nenhuma bio definida. Acesse 'Dados do Perfil' para adicionar."}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  comingSoon?: boolean;
  linkText?: string;
  linkHref?: string;
}

const FeatureCard = ({ icon: Icon, title, description, comingSoon, linkText, linkHref }: FeatureCardProps) => {
  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-300",
      comingSoon ? "opacity-70" : "hover:border-primary/50"
    )}>
      {comingSoon && (
        <div className="absolute top-3 right-3">
          <span className="px-2 py-1 text-[10px] font-medium bg-primary/20 text-primary rounded-full">
            Em breve
          </span>
        </div>
      )}
      <CardContent className="p-5">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <h3 className="font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        {linkText && linkHref && (
          <a 
            href={linkHref}
            className="text-sm text-primary hover:underline font-medium"
          >
            {linkText} →
          </a>
        )}
      </CardContent>
    </Card>
  );
};

export default LandingPageEditorPage;
