import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  Globe, 
  Plus, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ExternalLink,
  Shield,
  Link2,
  Copy,
  Check,
  Star,
  ArrowRight,
  MoreHorizontal
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Logo from "@/components/Logo";

interface CustomDomainPageProps {
  profileId: string;
}

interface CustomDomain {
  id: string;
  domain: string;
  status: string;
  verification_token: string;
  dns_verified: boolean;
  ssl_status: string;
  created_at: string;
  is_primary: boolean;
  redirect_to: string | null;
  parent_domain_id: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: "Ação Necessária", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20", icon: <Clock className="h-3 w-3" /> },
  verifying: { label: "Verificando", color: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: <RefreshCw className="h-3 w-3 animate-spin" /> },
  ready: { label: "Pronto", color: "bg-green-500/10 text-green-500 border-green-500/20", icon: <CheckCircle2 className="h-3 w-3" /> },
  active: { label: "Ativo", color: "bg-green-500/10 text-green-500 border-green-500/20", icon: <CheckCircle2 className="h-3 w-3" /> },
  failed: { label: "Falhou", color: "bg-red-500/10 text-red-500 border-red-500/20", icon: <AlertCircle className="h-3 w-3" /> },
  offline: { label: "Offline", color: "bg-gray-500/10 text-gray-500 border-gray-500/20", icon: <AlertCircle className="h-3 w-3" /> },
};

const SSL_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: "Aguardando", color: "text-yellow-500" },
  provisioning: { label: "Provisionando", color: "text-blue-500" },
  active: { label: "Ativo", color: "text-green-500" },
  failed: { label: "Falhou", color: "text-red-500" },
};

// IP para onde o domínio deve apontar
const TARGET_IP = "185.158.133.1";

const CustomDomainPage = ({ profileId }: CustomDomainPageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [domains, setDomains] = useState<CustomDomain[]>([]);
  const [newDomain, setNewDomain] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [expandedDomain, setExpandedDomain] = useState<string | null>(null);

  useEffect(() => {
    fetchDomains();
  }, [profileId]);

  const fetchDomains = async () => {
    try {
      const { data, error } = await supabase
        .from("custom_domains")
        .select("*")
        .eq("professional_id", profileId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDomains(data || []);
      
      // Auto-expand first pending domain
      const pendingDomain = data?.find(d => d.status === "pending");
      if (pendingDomain) {
        setExpandedDomain(pendingDomain.id);
      }
    } catch (error) {
      console.error("Error fetching domains:", error);
      toast.error("Erro ao carregar domínios");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions
  const getRootDomain = (domain: string): string => {
    const parts = domain.split(".");
    if (parts.length <= 2) return domain;
    return parts.slice(-2).join(".");
  };

  const isSubdomain = (domain: string): boolean => {
    return domain.split(".").length > 2;
  };

  const getActiveDomains = (): CustomDomain[] => {
    return domains.filter(d => d.status === "active");
  };

  const handleAddDomain = async () => {
    const domain = newDomain.trim().toLowerCase();
    
    if (!domain) {
      toast.error("Digite um domínio válido");
      return;
    }

    const domainRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/;
    if (!domainRegex.test(domain)) {
      toast.error("Formato de domínio inválido");
      return;
    }

    // Check if this is a www subdomain and find root domain
    const isWww = domain.startsWith("www.");
    const rootDomain = isWww ? domain.slice(4) : getRootDomain(domain);
    const parentDomain = domains.find(d => d.domain === rootDomain);

    setIsAdding(true);
    try {
      const isFirstDomain = domains.length === 0;
      
      const { data, error } = await supabase
        .from("custom_domains")
        .insert({
          professional_id: profileId,
          domain: domain,
          is_primary: isFirstDomain,
          parent_domain_id: parentDomain?.id || null,
        })
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          toast.error("Este domínio já está cadastrado");
        } else {
          throw error;
        }
        return;
      }

      setDomains(prev => [data, ...prev]);
      setNewDomain("");
      setIsDialogOpen(false);
      setExpandedDomain(data.id);
      toast.success("Domínio adicionado! Configure os registros DNS abaixo.");
    } catch (error) {
      console.error("Error adding domain:", error);
      toast.error("Erro ao adicionar domínio");
    } finally {
      setIsAdding(false);
    }
  };

  const handleSetPrimary = async (domainId: string) => {
    try {
      // First, unset all primary
      await supabase
        .from("custom_domains")
        .update({ is_primary: false })
        .eq("professional_id", profileId);

      // Then set the new primary
      const { error } = await supabase
        .from("custom_domains")
        .update({ is_primary: true, redirect_to: null })
        .eq("id", domainId);

      if (error) throw error;

      // Update redirects for other domains to point to new primary
      const primaryDomain = domains.find(d => d.id === domainId);
      if (primaryDomain) {
        await supabase
          .from("custom_domains")
          .update({ redirect_to: primaryDomain.domain })
          .eq("professional_id", profileId)
          .neq("id", domainId);
      }

      fetchDomains();
      toast.success("Domínio primário atualizado");
    } catch (error) {
      console.error("Error setting primary:", error);
      toast.error("Erro ao definir domínio primário");
    }
  };

  const handleSetRedirect = async (domainId: string, redirectTo: string | null) => {
    try {
      const { error } = await supabase
        .from("custom_domains")
        .update({ redirect_to: redirectTo })
        .eq("id", domainId);

      if (error) throw error;

      fetchDomains();
      toast.success(redirectTo ? "Redirecionamento configurado" : "Redirecionamento removido");
    } catch (error) {
      console.error("Error setting redirect:", error);
      toast.error("Erro ao configurar redirecionamento");
    }
  };

  const handleVerifyDomain = async (domainId: string) => {
    setVerifyingId(domainId);
    try {
      const { data, error } = await supabase.functions.invoke("domain-verification", {
        body: { action: "verify", domainId },
      });

      if (error) throw error;

      if (data.success) {
        toast.success(data.message || "Verificação concluída! SSL será provisionado automaticamente.");
        fetchDomains();
      } else {
        toast.info(data.message || "DNS ainda não propagou. Tente novamente em alguns minutos.");
      }
    } catch (error) {
      console.error("Error verifying domain:", error);
      toast.error("Erro ao verificar domínio");
    } finally {
      setVerifyingId(null);
    }
  };

  const handleDeleteDomain = async (domainId: string) => {
    try {
      const domainToDelete = domains.find(d => d.id === domainId);
      
      const { error } = await supabase
        .from("custom_domains")
        .delete()
        .eq("id", domainId);

      if (error) throw error;

      // If deleted domain was primary, set the first remaining active domain as primary
      if (domainToDelete?.is_primary) {
        const remainingDomains = domains.filter(d => d.id !== domainId);
        const newPrimary = remainingDomains.find(d => d.status === "active") || remainingDomains[0];
        if (newPrimary) {
          await supabase
            .from("custom_domains")
            .update({ is_primary: true })
            .eq("id", newPrimary.id);
        }
      }

      setDomains(prev => prev.filter(d => d.id !== domainId));
      toast.success("Domínio removido");
    } catch (error) {
      console.error("Error deleting domain:", error);
      toast.error("Erro ao remover domínio");
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success("Copiado!");
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast.error("Erro ao copiar");
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Domínio Personalizado</h2>
          <p className="text-muted-foreground">
            Conecte seu próprio domínio ao seu perfil profissional.
          </p>
        </div>

        {/* Add Domain Button with Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Conectar domínio
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-card border-border">
            <DialogHeader className="space-y-4">
              <div className="flex justify-center">
                <Logo size="md" colorScheme="default" />
              </div>
              <div className="text-center space-y-2">
                <DialogTitle className="text-xl font-semibold">
                  Domínio personalizado
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Insira o nome do domínio que você gostaria de conectar ao seu projeto.
                </DialogDescription>
              </div>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Nome de domínio
                </label>
                <div className="relative">
                  <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="meusite.com.br"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddDomain()}
                    className="pl-10 bg-background border-border"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Por exemplo, meusite.com.br ou subdomain.meusite.com.br
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                className="px-6"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleAddDomain} 
                disabled={isAdding || !newDomain.trim()}
                className="px-6"
              >
                {isAdding ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Conectar domínio
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Domains List */}
      {domains.length === 0 ? (
        <Card className="border-border/50 border-dashed">
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Globe className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              Nenhum domínio conectado
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Conecte um domínio personalizado para criar uma experiência profissional com sua própria marca.
            </p>
            <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Conectar primeiro domínio
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {domains.map((domain) => {
            const statusConfig = STATUS_CONFIG[domain.status] || STATUS_CONFIG.pending;
            const sslConfig = SSL_STATUS_CONFIG[domain.ssl_status] || SSL_STATUS_CONFIG.pending;
            const isVerifying = verifyingId === domain.id;
            const isExpanded = expandedDomain === domain.id;
            const isPending = domain.status === "pending" || domain.status === "failed";

            return (
              <Card key={domain.id} className={`border-border/50 overflow-hidden ${domain.is_primary ? 'ring-2 ring-primary/30' : ''}`}>
                <CardContent className="p-0">
                  {/* Domain Header */}
                  <div 
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => isPending && setExpandedDomain(isExpanded ? null : domain.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Globe className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-foreground">{domain.domain}</h3>
                          {domain.is_primary && (
                            <Badge variant="default" className="bg-primary/20 text-primary border-primary/30">
                              <Star className="h-3 w-3 mr-1" />
                              Primário
                            </Badge>
                          )}
                          <Badge variant="outline" className={statusConfig.color}>
                            {statusConfig.icon}
                            <span className="ml-1">{statusConfig.label}</span>
                          </Badge>
                          {isSubdomain(domain.domain) && (
                            <Badge variant="secondary" className="text-xs">
                              Subdomínio
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Shield className="h-3 w-3" />
                            <span>SSL: <span className={sslConfig.color}>{sslConfig.label}</span></span>
                          </div>
                          {domain.redirect_to && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <ArrowRight className="h-3 w-3" />
                              <span>Redireciona para: <span className="text-foreground">{domain.redirect_to}</span></span>
                            </div>
                          )}
                          {domain.status === "active" && (
                            <a
                              href={`https://${domain.domain}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Visitar
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      {domain.status !== "active" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVerifyDomain(domain.id)}
                          disabled={isVerifying}
                        >
                          {isVerifying ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4" />
                          )}
                          <span className="ml-2">Verificar</span>
                        </Button>
                      )}

                      {/* Actions Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          {!domain.is_primary && domain.status === "active" && (
                            <DropdownMenuItem onClick={() => handleSetPrimary(domain.id)}>
                              <Star className="h-4 w-4 mr-2" />
                              Definir como primário
                            </DropdownMenuItem>
                          )}
                          
                          {domain.status === "active" && getActiveDomains().length > 1 && (
                            <>
                              <DropdownMenuSeparator />
                              <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
                                Redirecionar para:
                              </div>
                              {getActiveDomains()
                                .filter(d => d.id !== domain.id)
                                .map(d => (
                                  <DropdownMenuItem
                                    key={d.id}
                                    onClick={() => handleSetRedirect(domain.id, d.domain)}
                                    className={domain.redirect_to === d.domain ? "bg-primary/10" : ""}
                                  >
                                    <ArrowRight className="h-4 w-4 mr-2" />
                                    {d.domain}
                                    {d.is_primary && <Star className="h-3 w-3 ml-auto text-primary" />}
                                  </DropdownMenuItem>
                                ))}
                              {domain.redirect_to && (
                                <DropdownMenuItem onClick={() => handleSetRedirect(domain.id, null)}>
                                  <span className="text-muted-foreground">Remover redirecionamento</span>
                                </DropdownMenuItem>
                              )}
                            </>
                          )}
                          
                          <DropdownMenuSeparator />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem 
                                className="text-destructive focus:text-destructive"
                                onSelect={(e) => e.preventDefault()}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remover domínio
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remover domínio?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  O domínio <strong>{domain.domain}</strong> será desconectado permanentemente.
                                  {domain.is_primary && " Um novo domínio primário será selecionado automaticamente."}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteDomain(domain.id)}
                                  className="bg-destructive hover:bg-destructive/90"
                                >
                                  Remover
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* DNS Instructions - Expanded */}
                  {isPending && isExpanded && (
                    <div className="border-t border-border/50 bg-muted/20 p-4 space-y-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                        Configure os seguintes registros DNS no seu provedor:
                      </div>

                      {/* DNS Records Table */}
                      <div className="rounded-lg border border-border overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-muted/50">
                            <tr>
                              <th className="text-left px-4 py-2 font-medium text-muted-foreground">Tipo</th>
                              <th className="text-left px-4 py-2 font-medium text-muted-foreground">Nome</th>
                              <th className="text-left px-4 py-2 font-medium text-muted-foreground">Valor</th>
                              <th className="w-10"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {/* A Record for root domain */}
                            <tr className="bg-background">
                              <td className="px-4 py-3">
                                <Badge variant="secondary" className="font-mono">A</Badge>
                              </td>
                              <td className="px-4 py-3 font-mono text-foreground">@</td>
                              <td className="px-4 py-3 font-mono text-foreground">{TARGET_IP}</td>
                              <td className="px-4 py-3">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(TARGET_IP, `a-root-${domain.id}`)}
                                >
                                  {copiedField === `a-root-${domain.id}` ? (
                                    <Check className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </Button>
                              </td>
                            </tr>
                            {/* A Record for www */}
                            <tr className="bg-background">
                              <td className="px-4 py-3">
                                <Badge variant="secondary" className="font-mono">A</Badge>
                              </td>
                              <td className="px-4 py-3 font-mono text-foreground">www</td>
                              <td className="px-4 py-3 font-mono text-foreground">{TARGET_IP}</td>
                              <td className="px-4 py-3">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(TARGET_IP, `a-www-${domain.id}`)}
                                >
                                  {copiedField === `a-www-${domain.id}` ? (
                                    <Check className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </Button>
                              </td>
                            </tr>
                            {/* TXT Record for verification */}
                            <tr className="bg-background">
                              <td className="px-4 py-3">
                                <Badge variant="secondary" className="font-mono">TXT</Badge>
                              </td>
                              <td className="px-4 py-3 font-mono text-foreground">_acolheaqui</td>
                              <td className="px-4 py-3 font-mono text-foreground break-all">
                                acolheaqui_verify={domain.verification_token}
                              </td>
                              <td className="px-4 py-3">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(`acolheaqui_verify=${domain.verification_token}`, `txt-${domain.id}`)}
                                >
                                  {copiedField === `txt-${domain.id}` ? (
                                    <Check className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </Button>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <div className="text-sm text-muted-foreground space-y-2">
                        <p>
                          <strong>Importante:</strong> A propagação de DNS pode levar até 48 horas. 
                          Após configurar os registros, clique em "Verificar" para checar a configuração.
                        </p>
                        <p>
                          Você pode verificar a propagação do DNS em{" "}
                          <a 
                            href="https://dnschecker.org" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            dnschecker.org
                          </a>
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Status messages for non-pending states */}
                  {domain.status === "verifying" && (
                    <div className="bg-blue-500/5 border-t border-blue-500/20 px-4 py-3">
                      <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Verificando DNS... Isso pode levar alguns minutos.
                      </div>
                    </div>
                  )}

                  {domain.status === "active" && (
                    <div className="bg-green-500/5 border-t border-green-500/20 px-4 py-3">
                      <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                        <CheckCircle2 className="h-4 w-4" />
                        Domínio ativo e funcionando!
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Info Section */}
      <Card className="border-border/50 bg-muted/20">
        <CardContent className="p-6">
          <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            Como funciona?
          </h4>
          <div className="grid gap-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium shrink-0">1</span>
              <p>Insira seu domínio (ex: meusite.com.br ou www.meusite.com.br) e clique em "Conectar domínio"</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium shrink-0">2</span>
              <p>Configure os registros DNS (A e TXT) no painel do seu provedor de domínio (Cloudflare, GoDaddy, Registro.br, etc)</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium shrink-0">3</span>
              <p>Clique em "Verificar" após configurar. O SSL será provisionado automaticamente.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium shrink-0">4</span>
              <p>Adicione www e root domain separadamente e configure o redirecionamento para ter ambos funcionando</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border/50">
            <h5 className="font-medium text-foreground mb-2 flex items-center gap-2">
              <Star className="h-4 w-4 text-primary" />
              Domínio Primário e Redirecionamento
            </h5>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>O <strong>domínio primário</strong> é o destino principal do seu site</li>
              <li>Configure outros domínios para <strong>redirecionar</strong> para o primário</li>
              <li>Exemplo: www.meusite.com.br redireciona para meusite.com.br (ou vice-versa)</li>
              <li>Subdomínios como app.meusite.com.br também podem ser configurados</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomDomainPage;
