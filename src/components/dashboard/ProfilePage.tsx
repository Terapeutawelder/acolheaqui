import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Camera, Save, Loader2, User, ExternalLink, FileText, Upload, Trash2, Instagram, Linkedin, Star, Plus, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ProfilePageProps {
  profileId: string;
  userId: string;
}

const profileSchema = z.object({
  full_name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100),
  crp: z.string().max(20).optional().or(z.literal("")),
  specialty: z.string().max(100).optional().or(z.literal("")),
  bio: z.string().max(1000).optional().or(z.literal("")),
  phone: z.string().max(20).optional().or(z.literal("")),
  whatsapp_number: z.string().max(20).optional().or(z.literal("")),
  instagram_url: z.string().max(200).optional().or(z.literal("")),
  linkedin_url: z.string().max(200).optional().or(z.literal("")),
});

interface ProfileData {
  full_name: string;
  gender: 'male' | 'female';
  crp: string;
  specialty: string;
  bio: string;
  phone: string;
  whatsapp_number: string;
  avatar_url: string;
  resume_url: string;
  instagram_url: string;
  linkedin_url: string;
}

interface Testimonial {
  id: string;
  client_name: string;
  rating: number;
  content: string;
  is_featured: boolean;
  created_at: string;
}

const ProfilePage = ({ profileId, userId }: ProfilePageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);
  
  // Testimonials state
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isAddingTestimonial, setIsAddingTestimonial] = useState(false);
  const [testimonialDialogOpen, setTestimonialDialogOpen] = useState(false);
  const [newTestimonial, setNewTestimonial] = useState({
    client_name: "",
    rating: 5,
    content: "",
  });

  const [profile, setProfile] = useState<ProfileData>({
    full_name: "",
    gender: "female",
    crp: "",
    specialty: "",
    bio: "",
    phone: "",
    whatsapp_number: "",
    avatar_url: "",
    resume_url: "",
    instagram_url: "",
    linkedin_url: "",
  });

  useEffect(() => {
    fetchProfile();
    fetchTestimonials();
  }, [profileId]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", profileId)
        .single();

      if (error) throw error;

      if (data) {
        setProfile({
          full_name: data.full_name || "",
          gender: ((data as any).gender as 'male' | 'female') || "female",
          crp: data.crp || "",
          specialty: data.specialty || "",
          bio: data.bio || "",
          phone: data.phone || "",
          whatsapp_number: (data as any).whatsapp_number || "",
          avatar_url: data.avatar_url || "",
          resume_url: (data as any).resume_url || "",
          instagram_url: (data as any).instagram_url || "",
          linkedin_url: (data as any).linkedin_url || "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Erro ao carregar perfil");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .eq("professional_id", profileId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTestimonials(data || []);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
    }
  };

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleResumeClick = () => {
    resumeInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB");
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      const avatarUrl = `${publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: avatarUrl })
        .eq("id", profileId);

      if (updateError) throw updateError;

      setProfile(prev => ({ ...prev, avatar_url: avatarUrl }));
      toast.success("Foto atualizada com sucesso!");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Erro ao fazer upload da foto");
    } finally {
      setIsUploading(false);
    }
  };

  const handleResumeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setIsUploadingResume(true);

    try {
      const fileName = `${userId}/curriculo.pdf`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      const resumeUrl = `${publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ resume_url: resumeUrl } as any)
        .eq("id", profileId);

      if (updateError) throw updateError;

      setProfile(prev => ({ ...prev, resume_url: resumeUrl }));
      toast.success("Currículo enviado com sucesso!");
    } catch (error) {
      console.error("Error uploading resume:", error);
      toast.error("Erro ao fazer upload do currículo");
    } finally {
      setIsUploadingResume(false);
    }
  };

  const handleRemoveResume = async () => {
    try {
      const fileName = `${userId}/curriculo.pdf`;
      
      await supabase.storage
        .from("avatars")
        .remove([fileName]);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ resume_url: null } as any)
        .eq("id", profileId);

      if (updateError) throw updateError;

      setProfile(prev => ({ ...prev, resume_url: "" }));
      toast.success("Currículo removido com sucesso!");
    } catch (error) {
      console.error("Error removing resume:", error);
      toast.error("Erro ao remover currículo");
    }
  };

  const handleSave = async () => {
    const result = profileSchema.safeParse(profile);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          newErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(newErrors);
      return;
    }

    setIsSaving(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
          crp: profile.crp || null,
          specialty: profile.specialty || null,
          bio: profile.bio || null,
          phone: profile.phone || null,
          whatsapp_number: profile.whatsapp_number || null,
          instagram_url: profile.instagram_url || null,
          linkedin_url: profile.linkedin_url || null,
        } as any)
        .eq("id", profileId);

      if (error) throw error;

      toast.success("Perfil atualizado com sucesso!");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Erro ao salvar perfil");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTestimonial = async () => {
    if (!newTestimonial.client_name || !newTestimonial.content) {
      toast.error("Preencha o nome e o depoimento");
      return;
    }

    setIsAddingTestimonial(true);

    try {
      const { error } = await supabase
        .from("testimonials")
        .insert({
          professional_id: profileId,
          client_name: newTestimonial.client_name,
          rating: newTestimonial.rating,
          content: newTestimonial.content,
        });

      if (error) throw error;

      toast.success("Depoimento adicionado com sucesso!");
      setNewTestimonial({ client_name: "", rating: 5, content: "" });
      setTestimonialDialogOpen(false);
      fetchTestimonials();
    } catch (error) {
      console.error("Error adding testimonial:", error);
      toast.error("Erro ao adicionar depoimento");
    } finally {
      setIsAddingTestimonial(false);
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    try {
      const { error } = await supabase
        .from("testimonials")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Depoimento removido!");
      fetchTestimonials();
    } catch (error) {
      console.error("Error deleting testimonial:", error);
      toast.error("Erro ao remover depoimento");
    }
  };

  const handleToggleFeatured = async (id: string, currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from("testimonials")
        .update({ is_featured: !currentValue })
        .eq("id", id);

      if (error) throw error;

      fetchTestimonials();
    } catch (error) {
      console.error("Error updating testimonial:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Public Profile Link */}
      <div className="rounded-2xl bg-gradient-to-r from-primary/20 to-primary/5 border border-primary/20 p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Seu Perfil Público</h3>
            <p className="text-sm text-white/60">
              Compartilhe este link para seus clientes agendarem sessões.
            </p>
          </div>
          <Link to={`/profissional/${profileId}`} target="_blank">
            <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
              <ExternalLink className="w-4 h-4 mr-2" />
              Ver Perfil Público
            </Button>
          </Link>
        </div>
      </div>

      {/* Avatar Section */}
      <div className="rounded-2xl bg-[hsl(215,40%,12%)] border border-white/5 p-8">
        <h3 className="text-lg font-bold text-white mb-6">Foto de Perfil</h3>
        
        <div className="flex items-center gap-6">
          <div className="relative">
            <div 
              className="w-28 h-28 rounded-full bg-white/10 border-2 border-white/20 overflow-hidden cursor-pointer group"
              onClick={handleAvatarClick}
            >
              {profile.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-12 h-12 text-white/40" />
                </div>
              )}
              
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {isUploading ? (
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <Camera className="w-6 h-6 text-white" />
                )}
              </div>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </div>
          
          <div>
            <p className="text-white font-medium mb-1">Clique para alterar</p>
            <p className="text-sm text-white/50">JPG, PNG ou GIF. Máximo 5MB.</p>
          </div>
        </div>
      </div>

      {/* Resume/Curriculum Section */}
      <div className="rounded-2xl bg-[hsl(215,40%,12%)] border border-white/5 p-8">
        <h3 className="text-lg font-bold text-white mb-6">Currículo</h3>
        
        <div className="space-y-4">
          {profile.resume_url ? (
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-white font-medium">Currículo.pdf</p>
                  <p className="text-sm text-white/50">Arquivo enviado</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-white hover:bg-white/10"
                  onClick={() => window.open(profile.resume_url, "_blank")}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Visualizar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                  onClick={handleRemoveResume}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div 
              className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
              onClick={handleResumeClick}
            >
              {isUploadingResume ? (
                <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
              ) : (
                <Upload className="w-8 h-8 text-white/40 mb-3" />
              )}
              <p className="text-white font-medium mb-1">
                {isUploadingResume ? "Enviando..." : "Clique para enviar seu currículo"}
              </p>
              <p className="text-sm text-white/50">Apenas arquivos PDF. Máximo 10MB.</p>
            </div>
          )}
          
          <input
            ref={resumeInputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={handleResumeChange}
            disabled={isUploadingResume}
          />
          
          <p className="text-xs text-white/40">
            Seu currículo será exibido no seu perfil público para que clientes possam conhecer melhor sua formação e experiência.
          </p>
        </div>
      </div>

      {/* Social Media Section */}
      <div className="rounded-2xl bg-[hsl(215,40%,12%)] border border-white/5 p-8">
        <h3 className="text-lg font-bold text-white mb-6">Redes Sociais</h3>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="instagram_url" className="text-white/80 flex items-center gap-2">
              <Instagram className="w-4 h-4" />
              Instagram
            </Label>
            <Input
              id="instagram_url"
              value={profile.instagram_url}
              onChange={(e) => handleInputChange("instagram_url", e.target.value)}
              placeholder="https://instagram.com/seu_perfil"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedin_url" className="text-white/80 flex items-center gap-2">
              <Linkedin className="w-4 h-4" />
              LinkedIn
            </Label>
            <Input
              id="linkedin_url"
              value={profile.linkedin_url}
              onChange={(e) => handleInputChange("linkedin_url", e.target.value)}
              placeholder="https://linkedin.com/in/seu_perfil"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="rounded-2xl bg-[hsl(215,40%,12%)] border border-white/5 p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Depoimentos
          </h3>
          <Dialog open={testimonialDialogOpen} onOpenChange={setTestimonialDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[hsl(215,40%,12%)] border-white/10">
              <DialogHeader>
                <DialogTitle className="text-white">Novo Depoimento</DialogTitle>
                <DialogDescription className="text-white/60">
                  Adicione um depoimento de cliente para exibir no seu perfil público.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label className="text-white/80">Nome do Cliente</Label>
                  <Input
                    value={newTestimonial.client_name}
                    onChange={(e) => setNewTestimonial(prev => ({ ...prev, client_name: e.target.value }))}
                    placeholder="Nome do cliente"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white/80">Avaliação</Label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewTestimonial(prev => ({ ...prev, rating: star }))}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-6 h-6 transition-colors ${
                            star <= newTestimonial.rating
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-white/20"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-white/80">Depoimento</Label>
                  <Textarea
                    value={newTestimonial.content}
                    onChange={(e) => setNewTestimonial(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="O que o cliente disse sobre você..."
                    rows={4}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 resize-none"
                  />
                </div>

                <Button
                  onClick={handleAddTestimonial}
                  disabled={isAddingTestimonial}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  {isAddingTestimonial ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar Depoimento"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {testimonials.length > 0 ? (
          <div className="space-y-4">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className={`p-4 rounded-xl border ${
                  testimonial.is_featured
                    ? "bg-primary/10 border-primary/30"
                    : "bg-white/5 border-white/10"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-medium text-white">{testimonial.client_name}</p>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= testimonial.rating
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-white/20"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-white/70 text-sm">{testimonial.content}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleFeatured(testimonial.id, testimonial.is_featured)}
                      className={testimonial.is_featured ? "text-primary" : "text-white/40"}
                    >
                      <Star className={`w-4 h-4 ${testimonial.is_featured ? "fill-current" : ""}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTestimonial(testimonial.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/60 text-sm">
              Nenhum depoimento adicionado ainda.
            </p>
            <p className="text-white/40 text-xs mt-1">
              Clique em "Adicionar" para incluir depoimentos de clientes.
            </p>
          </div>
        )}
      </div>

      {/* Profile Form */}
      <div className="rounded-2xl bg-[hsl(215,40%,12%)] border border-white/5 p-8">
        <h3 className="text-lg font-bold text-white mb-6">Informações Profissionais</h3>
        
        <div className="space-y-6">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="full_name" className="text-white/80">
              Nome Completo *
            </Label>
            <Input
              id="full_name"
              value={profile.full_name}
              onChange={(e) => handleInputChange("full_name", e.target.value)}
              placeholder="Seu nome completo"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary"
            />
            {errors.full_name && (
              <p className="text-sm text-red-400">{errors.full_name}</p>
            )}
          </div>

          {/* Gender Selection */}
          <div className="space-y-2">
            <Label className="text-white/80">
              Gênero (para pronome Dr./Dra.)
            </Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={profile.gender === "female"}
                  onChange={() => handleInputChange("gender", "female")}
                  className="w-4 h-4 accent-primary"
                />
                <span className="text-white/80">Feminino (Dra.)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={profile.gender === "male"}
                  onChange={() => handleInputChange("gender", "male")}
                  className="w-4 h-4 accent-primary"
                />
                <span className="text-white/80">Masculino (Dr.)</span>
              </label>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="crp" className="text-white/80">
                Registro Profissional
              </Label>
              <Input
                id="crp"
                value={profile.crp}
                onChange={(e) => handleInputChange("crp", e.target.value)}
                placeholder="Ex: CRP 06/123456, CRM 12345-SP"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary"
              />
              <p className="text-xs text-white/40">
                CRP, CRM, CREFITO ou outro registro profissional
              </p>
              {errors.crp && (
                <p className="text-sm text-red-400">{errors.crp}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialty" className="text-white/80">
                Especialidade
              </Label>
              <Input
                id="specialty"
                value={profile.specialty}
                onChange={(e) => handleInputChange("specialty", e.target.value)}
                placeholder="Ex: Terapia Cognitivo-Comportamental"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary"
              />
              {errors.specialty && (
                <p className="text-sm text-red-400">{errors.specialty}</p>
              )}
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-white/80">
              Telefone
            </Label>
            <Input
              id="phone"
              value={profile.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder="Ex: (11) 99999-9999"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary"
            />
            {errors.phone && (
              <p className="text-sm text-red-400">{errors.phone}</p>
            )}
          </div>

          {/* WhatsApp Number for AI Agent */}
          <div className="space-y-2">
            <Label htmlFor="whatsapp_number" className="text-white/80">
              Número do WhatsApp (Agente de IA)
            </Label>
            <Input
              id="whatsapp_number"
              value={profile.whatsapp_number}
              onChange={(e) => handleInputChange("whatsapp_number", e.target.value)}
              placeholder="Ex: 5511999999999 (apenas números com DDI)"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary"
            />
            <p className="text-xs text-white/40">
              Este número é usado pelo Agente de IA para identificar seu perfil automaticamente. Use o formato internacional (DDI + DDD + número, sem espaços ou caracteres especiais).
            </p>
            {errors.whatsapp_number && (
              <p className="text-sm text-red-400">{errors.whatsapp_number}</p>
            )}
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio" className="text-white/80">
              Bio / Apresentação
            </Label>
            <Textarea
              id="bio"
              value={profile.bio}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              placeholder="Fale um pouco sobre você, sua abordagem terapêutica e experiência..."
              rows={5}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary resize-none"
            />
            <p className="text-xs text-white/40">
              {profile.bio.length}/1000 caracteres
            </p>
            {errors.bio && (
              <p className="text-sm text-red-400">{errors.bio}</p>
            )}
          </div>

          {/* Save Button */}
          <div className="pt-4">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full sm:w-auto bg-primary hover:bg-primary/90"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;