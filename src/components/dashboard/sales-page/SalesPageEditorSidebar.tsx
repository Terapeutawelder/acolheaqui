import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Palette, 
  Type, 
  Image as ImageIcon, 
  Eye, 
  Copy, 
  Check,
  ExternalLink,
  Sparkles,
  ShoppingCart,
  Shield,
  Gift,
  User,
  Save,
  Loader2,
  ArrowLeft,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { SalesPageConfig } from "./SalesPagePreview";

interface SalesPageEditorSidebarProps {
  config: SalesPageConfig;
  onConfigChange: (config: SalesPageConfig) => void;
  salesPageUrl: string;
  onPreview: () => void;
  onSaveNow?: () => Promise<void>;
  isSaving?: boolean;
  onBack: () => void;
  serviceName: string;
  professionalId: string;
}

const colorPresets = [
  { name: "Roxo", primary: "262 83% 58%", secondary: "262 50% 95%", accent: "42 87% 55%", background: "220 20% 4%" },
  { name: "Teal", primary: "166 76% 45%", secondary: "166 50% 95%", accent: "42 87% 55%", background: "180 20% 4%" },
  { name: "Azul", primary: "210 80% 50%", secondary: "210 50% 95%", accent: "42 87% 55%", background: "215 25% 4%" },
  { name: "Verde", primary: "145 65% 40%", secondary: "145 50% 95%", accent: "42 87% 55%", background: "145 20% 4%" },
  { name: "Rosa", primary: "330 70% 55%", secondary: "330 50% 95%", accent: "42 87% 55%", background: "330 15% 4%" },
  { name: "Laranja", primary: "25 95% 55%", secondary: "25 50% 95%", accent: "42 87% 55%", background: "25 15% 4%" },
];

const SalesPageEditorSidebar = ({ 
  config, 
  onConfigChange, 
  salesPageUrl, 
  onPreview, 
  onSaveNow, 
  isSaving, 
  onBack,
  serviceName,
  professionalId,
}: SalesPageEditorSidebarProps) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("cores");

  const copyLink = () => {
    navigator.clipboard.writeText(salesPageUrl);
    setCopied(true);
    toast.success("Link copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  const updateColors = (preset: typeof colorPresets[0]) => {
    onConfigChange({
      ...config,
      colors: {
        primary: preset.primary,
        secondary: preset.secondary,
        accent: preset.accent,
        background: preset.background,
      },
    });
  };

  const updateHero = (field: keyof typeof config.hero, value: any) => {
    onConfigChange({
      ...config,
      hero: { ...config.hero, [field]: value },
    });
  };

  const updateContent = (field: keyof typeof config.content, value: string) => {
    onConfigChange({
      ...config,
      content: { ...config.content, [field]: value },
    });
  };

  const updateCta = (field: keyof typeof config.cta, value: string) => {
    onConfigChange({
      ...config,
      cta: { ...config.cta, [field]: value },
    });
  };

  const updateBenefits = (field: keyof typeof config.benefits, value: any) => {
    onConfigChange({
      ...config,
      benefits: { ...config.benefits, [field]: value },
    });
  };

  const updateGuarantee = (field: keyof typeof config.guarantee, value: any) => {
    onConfigChange({
      ...config,
      guarantee: { ...config.guarantee, [field]: value },
    });
  };

  const updateInstructor = (field: keyof typeof config.instructor, value: any) => {
    onConfigChange({
      ...config,
      instructor: { ...config.instructor, [field]: value },
    });
  };

  const addBenefitItem = () => {
    if (config.benefits.items.length >= 8) {
      toast.error("Máximo de 8 benefícios");
      return;
    }
    updateBenefits("items", [...config.benefits.items, "Novo benefício"]);
  };

  const removeBenefitItem = (index: number) => {
    const newItems = config.benefits.items.filter((_, i) => i !== index);
    updateBenefits("items", newItems);
  };

  const updateBenefitItem = (index: number, value: string) => {
    const newItems = [...config.benefits.items];
    newItems[index] = value;
    updateBenefits("items", newItems);
  };

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Header */}
      <div className="p-4 border-b border-border space-y-3">
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={onBack} className="h-8 w-8 p-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-foreground truncate">Editor de Página de Vendas</h2>
            <p className="text-xs text-muted-foreground truncate">{serviceName}</p>
          </div>
          <Button size="sm" variant="outline" onClick={onPreview} className="gap-1.5 shrink-0">
            <Eye className="h-3.5 w-3.5" />
            Ver
          </Button>
        </div>

        {/* URL */}
        <div className="flex items-center gap-2 p-2.5 bg-muted/50 rounded-lg">
          <ExternalLink className="h-4 w-4 text-primary shrink-0" />
          <p className="text-xs font-mono text-muted-foreground truncate flex-1">{salesPageUrl}</p>
          <Button size="sm" variant="ghost" onClick={copyLink} className="h-7 w-7 p-0">
            {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="grid grid-cols-2 mx-4 mt-4">
          <TabsTrigger value="cores" className="text-xs gap-1.5">
            <Palette className="h-3.5 w-3.5" />
            Cores
          </TabsTrigger>
          <TabsTrigger value="textos" className="text-xs gap-1.5">
            <Type className="h-3.5 w-3.5" />
            Textos
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto p-4">
          {/* Cores Tab */}
          <TabsContent value="cores" className="mt-0 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Palette className="h-4 w-4 text-primary" />
                  Paleta de Cores
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Temas Prontos</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {colorPresets.map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => updateColors(preset)}
                        className={`p-2 rounded-lg border-2 transition-all hover:scale-105 ${
                          config.colors.primary === preset.primary
                            ? "border-primary shadow-md"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex gap-1 mb-1">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: `hsl(${preset.primary})` }}
                          />
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: `hsl(${preset.background})` }}
                          />
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: `hsl(${preset.accent})` }}
                          />
                        </div>
                        <span className="text-[10px] font-medium">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-border">
                  <Label className="text-xs text-muted-foreground mb-2 block">Cores Atuais</Label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-lg border"
                        style={{ backgroundColor: `hsl(${config.colors.primary})` }}
                      />
                      <span className="text-xs">Principal</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-lg border"
                        style={{ backgroundColor: `hsl(${config.colors.background})` }}
                      />
                      <span className="text-xs">Fundo</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-lg border"
                        style={{ backgroundColor: `hsl(${config.colors.accent})` }}
                      />
                      <span className="text-xs">Destaque</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Textos Tab */}
          <TabsContent value="textos" className="mt-0 space-y-4">
            {/* Save Button */}
            <div className="flex justify-end">
              <Button
                onClick={onSaveNow}
                disabled={isSaving}
                size="sm"
                className="gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Salvar
                  </>
                )}
              </Button>
            </div>

            <Accordion type="multiple" defaultValue={["hero"]} className="space-y-2">
              {/* Hero Section */}
              <AccordionItem value="hero" className="border rounded-lg px-3">
                <AccordionTrigger className="text-sm font-semibold hover:no-underline py-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Seção Principal (Hero)
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-3 pb-4">
                  <div>
                    <Label className="text-xs">Badge</Label>
                    <Input
                      value={config.hero.badge}
                      onChange={(e) => updateHero("badge", e.target.value)}
                      className="h-8 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Título (deixe vazio para usar nome do produto)</Label>
                    <Textarea
                      value={config.hero.title}
                      onChange={(e) => updateHero("title", e.target.value)}
                      className="text-sm mt-1 min-h-[60px]"
                      placeholder="Título personalizado..."
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Subtítulo (deixe vazio para usar descrição)</Label>
                    <Textarea
                      value={config.hero.subtitle}
                      onChange={(e) => updateHero("subtitle", e.target.value)}
                      className="text-sm mt-1 min-h-[60px]"
                      placeholder="Subtítulo personalizado..."
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Texto do Botão</Label>
                    <Input
                      value={config.hero.ctaText}
                      onChange={(e) => updateHero("ctaText", e.target.value)}
                      className="h-8 text-sm mt-1"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <Label className="text-xs">Mostrar área de vídeo/imagem</Label>
                    <Switch
                      checked={config.hero.showVideo}
                      onCheckedChange={(checked) => updateHero("showVideo", checked)}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Benefits Section */}
              <AccordionItem value="benefits" className="border rounded-lg px-3">
                <AccordionTrigger className="text-sm font-semibold hover:no-underline py-3">
                  <div className="flex items-center gap-2">
                    <Gift className="h-4 w-4 text-primary" />
                    Benefícios
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-3 pb-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Exibir seção de benefícios</Label>
                    <Switch
                      checked={config.benefits.enabled}
                      onCheckedChange={(checked) => updateBenefits("enabled", checked)}
                    />
                  </div>
                  {config.benefits.enabled && (
                    <>
                      <div>
                        <Label className="text-xs">Título</Label>
                        <Input
                          value={config.benefits.title}
                          onChange={(e) => updateBenefits("title", e.target.value)}
                          className="h-8 text-sm mt-1"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-xs">Itens</Label>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={addBenefitItem}
                            className="h-6 text-xs"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Adicionar
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {config.benefits.items.map((item, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <Input
                                value={item}
                                onChange={(e) => updateBenefitItem(i, e.target.value)}
                                className="h-7 text-xs flex-1"
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeBenefitItem(i)}
                                className="h-7 w-7 p-0 text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </AccordionContent>
              </AccordionItem>

              {/* Content Section */}
              <AccordionItem value="content" className="border rounded-lg px-3">
                <AccordionTrigger className="text-sm font-semibold hover:no-underline py-3">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-primary" />
                    Seção de Conteúdo
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-3 pb-4">
                  <div>
                    <Label className="text-xs">Título</Label>
                    <Input
                      value={config.content.sectionTitle}
                      onChange={(e) => updateContent("sectionTitle", e.target.value)}
                      className="h-8 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Subtítulo</Label>
                    <Textarea
                      value={config.content.sectionSubtitle}
                      onChange={(e) => updateContent("sectionSubtitle", e.target.value)}
                      className="text-sm mt-1 min-h-[60px]"
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* CTA Section */}
              <AccordionItem value="cta" className="border rounded-lg px-3">
                <AccordionTrigger className="text-sm font-semibold hover:no-underline py-3">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-primary" />
                    Card de Compra
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-3 pb-4">
                  <div>
                    <Label className="text-xs">Texto Principal</Label>
                    <Input
                      value={config.cta.mainText}
                      onChange={(e) => updateCta("mainText", e.target.value)}
                      className="h-8 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Subtexto</Label>
                    <Input
                      value={config.cta.subText}
                      onChange={(e) => updateCta("subText", e.target.value)}
                      className="h-8 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Texto do Botão</Label>
                    <Input
                      value={config.cta.buttonText}
                      onChange={(e) => updateCta("buttonText", e.target.value)}
                      className="h-8 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Texto de Urgência</Label>
                    <Input
                      value={config.cta.urgencyText}
                      onChange={(e) => updateCta("urgencyText", e.target.value)}
                      className="h-8 text-sm mt-1"
                      placeholder="Ex: Vagas limitadas"
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Guarantee Section */}
              <AccordionItem value="guarantee" className="border rounded-lg px-3">
                <AccordionTrigger className="text-sm font-semibold hover:no-underline py-3">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    Garantia
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-3 pb-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Exibir garantia</Label>
                    <Switch
                      checked={config.guarantee.enabled}
                      onCheckedChange={(checked) => updateGuarantee("enabled", checked)}
                    />
                  </div>
                  {config.guarantee.enabled && (
                    <>
                      <div>
                        <Label className="text-xs">Título</Label>
                        <Input
                          value={config.guarantee.title}
                          onChange={(e) => updateGuarantee("title", e.target.value)}
                          className="h-8 text-sm mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Descrição</Label>
                        <Textarea
                          value={config.guarantee.description}
                          onChange={(e) => updateGuarantee("description", e.target.value)}
                          className="text-sm mt-1 min-h-[60px]"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Dias de Garantia</Label>
                        <Input
                          type="number"
                          value={config.guarantee.days}
                          onChange={(e) => updateGuarantee("days", parseInt(e.target.value) || 7)}
                          className="h-8 text-sm mt-1"
                        />
                      </div>
                    </>
                  )}
                </AccordionContent>
              </AccordionItem>

              {/* Instructor Section */}
              <AccordionItem value="instructor" className="border rounded-lg px-3">
                <AccordionTrigger className="text-sm font-semibold hover:no-underline py-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    Instrutor
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-3 pb-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Exibir seção do instrutor</Label>
                    <Switch
                      checked={config.instructor.showSection}
                      onCheckedChange={(checked) => updateInstructor("showSection", checked)}
                    />
                  </div>
                  {config.instructor.showSection && (
                    <div>
                      <Label className="text-xs">Título da Seção</Label>
                      <Input
                        value={config.instructor.title}
                        onChange={(e) => updateInstructor("title", e.target.value)}
                        className="h-8 text-sm mt-1"
                      />
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default SalesPageEditorSidebar;
