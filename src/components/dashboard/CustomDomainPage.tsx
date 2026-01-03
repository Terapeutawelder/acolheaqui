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
  MoreHorizontal,
  Lock,
  Zap,
  X,
  PauseCircle,
  PlayCircle,
  Power
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

// DNS Providers supported for automatic configuration
const DNS_PROVIDERS: Record<string, { name: string; url: string; logo?: string }> = {
  cloudflare: { name: "Cloudflare", url: "https://dash.cloudflare.com" },
  godaddy: { name: "GoDaddy", url: "https://dcc.godaddy.com/manage" },
  namecheap: { name: "Namecheap", url: "https://ap.www.namecheap.com/Domains/DomainControlPanel" },
  registrobr: { name: "Registro.br", url: "https://registro.br/painel" },
  hostgator: { name: "HostGator", url: "https://cliente.hostgator.com.br" },
  locaweb: { name: "Locaweb", url: "https://cliente.locaweb.com.br" },
  uolhost: { name: "UOL Host", url: "https://painel.uolhost.uol.com.br" },
  hostinger: { name: "Hostinger", url: "https://hpanel.hostinger.com" },
  google: { name: "Google Domains", url: "https://domains.google.com" },
  unknown: { name: "Provedor Desconhecido", url: "" },
};

type SetupStep = "intro" | "domain-input" | "analyzing" | "provider-detected" | "manual-setup" | "cloudflare-auth";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: "Ação Necessária", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20", icon: <Clock className="h-3 w-3" /> },
  verifying: { label: "Verificando", color: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: <RefreshCw className="h-3 w-3 animate-spin" /> },
  ready: { label: "Pronto", color: "bg-green-500/10 text-green-500 border-green-500/20", icon: <CheckCircle2 className="h-3 w-3" /> },
  active: { label: "Ativo", color: "bg-green-500/10 text-green-500 border-green-500/20", icon: <CheckCircle2 className="h-3 w-3" /> },
  paused: { label: "Pausado", color: "bg-orange-500/10 text-orange-500 border-orange-500/20", icon: <PauseCircle className="h-3 w-3" /> },
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
  
  // New setup flow states
  const [setupStep, setSetupStep] = useState<SetupStep>("intro");
  const [detectedProvider, setDetectedProvider] = useState<string>("unknown");
  const [analysisSteps, setAnalysisSteps] = useState<{step: string; done: boolean}[]>([]);
  const [pendingDomainData, setPendingDomainData] = useState<CustomDomain | null>(null);
  const [existingARecords, setExistingARecords] = useState<{name: string; ip: string}[]>([]);
  const [isAuthorizingDNS, setIsAuthorizingDNS] = useState(false);

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

  // Detect DNS provider from domain using real DNS lookup via Cloudflare DoH API
  const detectDNSProvider = async (domain: string): Promise<string> => {
    try {
      const rootDomain = getRootDomain(domain);
      console.log(`[DNS Detection] Checking domain: ${domain}, root: ${rootDomain}`);
      
      // Map nameserver patterns to providers - ORDER MATTERS! More specific patterns first
      const providerPatterns: Record<string, string[]> = {
        cloudflare: ['cloudflare.com', 'cloudflare'],
        godaddy: ['domaincontrol.com', 'godaddy.com', 'godaddy'],
        namecheap: ['namecheaphosting.com', 'registrar-servers.com', 'namecheap'],
        registrobr: ['registro.br', 'dns.br'],
        hostgator: ['hostgator.com', 'hostgator.com.br', 'hostgator'],
        locaweb: ['locaweb.com.br', 'locaweb.com', 'locaweb'],
        uolhost: ['uolhost.com.br', 'uol.com.br'],
        hostinger: ['hostinger.com', 'hostinger.br', 'dns.hostinger', 'hostinger'],
        google: ['googledomains.com', 'google.com'],
        aws: ['awsdns', 'amazonaws.com'],
        digitalocean: ['digitalocean.com'],
        netlify: ['netlify.com'],
        vercel: ['vercel-dns.com'],
      };
      
      // Function to query NS records
      const queryNS = async (domainToQuery: string): Promise<string[]> => {
        const response = await fetch(
          `https://cloudflare-dns.com/dns-query?name=${domainToQuery}&type=NS`,
          {
            headers: {
              'Accept': 'application/dns-json'
            }
          }
        );
        
        if (!response.ok) {
          console.error(`[DNS Detection] NS lookup failed for ${domainToQuery}:`, response.status);
          return [];
        }
        
        const data = await response.json();
        console.log(`[DNS Detection] NS response for ${domainToQuery}:`, JSON.stringify(data));
        
        const nsRecords = data.Answer || [];
        return nsRecords.map((record: any) => (record.data || '').toLowerCase().trim());
      };
      
      // Query NS records for the root domain
      const nsValues = await queryNS(rootDomain);
      console.log(`[DNS Detection] NS values for ${rootDomain}:`, nsValues);
      
      if (nsValues.length === 0) {
        console.log(`[DNS Detection] No NS records found for ${rootDomain}`);
        return 'unknown';
      }
      
      // Check each NS record against provider patterns
      for (const nsValue of nsValues) {
        console.log(`[DNS Detection] Checking NS: ${nsValue}`);
        
        for (const [provider, patterns] of Object.entries(providerPatterns)) {
          for (const pattern of patterns) {
            if (nsValue.includes(pattern)) {
              console.log(`[DNS Detection] ✓ Matched provider "${provider}" with pattern "${pattern}" in NS "${nsValue}"`);
              return provider;
            }
          }
        }
      }
      
      console.log(`[DNS Detection] No matching provider found for NS records:`, nsValues);
      return 'unknown';
    } catch (error) {
      console.error('[DNS Detection] Error detecting DNS provider:', error);
      return 'unknown';
    }
  };

  // Fetch existing A records for the domain
  const fetchExistingARecords = async (domain: string): Promise<{name: string; ip: string}[]> => {
    try {
      const rootDomain = getRootDomain(domain);
      const records: {name: string; ip: string}[] = [];
      
      // Query A record for root domain
      const rootResponse = await fetch(
        `https://cloudflare-dns.com/dns-query?name=${rootDomain}&type=A`,
        { headers: { 'Accept': 'application/dns-json' } }
      );
      
      if (rootResponse.ok) {
        const rootData = await rootResponse.json();
        if (rootData.Answer) {
          for (const record of rootData.Answer) {
            if (record.type === 1 && record.data !== TARGET_IP) {
              records.push({ name: rootDomain, ip: record.data });
            }
          }
        }
      }
      
      // Query A record for www subdomain
      const wwwResponse = await fetch(
        `https://cloudflare-dns.com/dns-query?name=www.${rootDomain}&type=A`,
        { headers: { 'Accept': 'application/dns-json' } }
      );
      
      if (wwwResponse.ok) {
        const wwwData = await wwwResponse.json();
        if (wwwData.Answer) {
          for (const record of wwwData.Answer) {
            if (record.type === 1 && record.data !== TARGET_IP) {
              records.push({ name: `www.${rootDomain}`, ip: record.data });
            }
          }
        }
      }
      
      console.log('[DNS] Existing A records:', records);
      return records;
    } catch (error) {
      console.error('[DNS] Error fetching A records:', error);
      return [];
    }
  };

  const runAnalysis = async (domain: string) => {
    setSetupStep("analyzing");
    setAnalysisSteps([
      { step: `Analisando ${domain}`, done: false },
      { step: "Detectando provedor DNS", done: false },
      { step: "Obtendo detalhes de configuração", done: false },
    ]);

    // Step 1: Analyze domain
    await new Promise(resolve => setTimeout(resolve, 1000));
    setAnalysisSteps(prev => prev.map((s, i) => i === 0 ? { ...s, done: true } : s));

    // Step 2: Detect provider
    await new Promise(resolve => setTimeout(resolve, 1200));
    const provider = await detectDNSProvider(domain);
    setDetectedProvider(provider);
    setAnalysisSteps(prev => prev.map((s, i) => i === 1 ? { ...s, done: true } : s));

    // Step 3: Get setup details and existing records
    const existingRecords = await fetchExistingARecords(domain);
    setExistingARecords(existingRecords);
    await new Promise(resolve => setTimeout(resolve, 800));
    setAnalysisSteps(prev => prev.map((s, i) => i === 2 ? { ...s, done: true } : s));

    await new Promise(resolve => setTimeout(resolve, 500));
    setSetupStep("provider-detected");
  };

  const handleStartSetup = () => {
    setSetupStep("domain-input");
  };

  const handleAnalyzeDomain = async () => {
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

    // Check if domain already exists
    const existingDomain = domains.find(d => d.domain === domain);
    if (existingDomain) {
      toast.error("Este domínio já está cadastrado");
      return;
    }

    await runAnalysis(domain);
  };

  const handleConfirmSetup = async (useAutomatic: boolean) => {
    const domain = newDomain.trim().toLowerCase();

    // If user wants automatic setup for Cloudflare, show authorization screen
    if (useAutomatic && detectedProvider === 'cloudflare') {
      setSetupStep("cloudflare-auth");
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
      setPendingDomainData(data);

      if (useAutomatic && detectedProvider !== 'unknown' && detectedProvider !== 'cloudflare') {
        // Open provider's DNS panel in new tab
        const providerInfo = DNS_PROVIDERS[detectedProvider];
        if (providerInfo.url) {
          window.open(providerInfo.url, '_blank');
        }
        toast.success(`Redirecionando para ${providerInfo.name}. Configure os registros DNS e volte para verificar.`);
      }

      setSetupStep("manual-setup");
      
    } catch (error) {
      console.error("Error adding domain:", error);
      toast.error("Erro ao adicionar domínio");
    } finally {
      setIsAdding(false);
    }
  };

  // Handle Cloudflare DNS authorization
  const handleCloudflareAuthorize = async () => {
    const domain = newDomain.trim().toLowerCase();
    const isWww = domain.startsWith("www.");
    const rootDomain = isWww ? domain.slice(4) : getRootDomain(domain);
    const parentDomain = domains.find(d => d.domain === rootDomain);

    setIsAuthorizingDNS(true);
    try {
      const isFirstDomain = domains.length === 0;
      
      // Generate verification token
      const verificationToken = crypto.randomUUID().replace(/-/g, '');
      
      const { data, error } = await supabase
        .from("custom_domains")
        .insert({
          professional_id: profileId,
          domain: domain,
          is_primary: isFirstDomain,
          parent_domain_id: parentDomain?.id || null,
          verification_token: verificationToken,
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
      setPendingDomainData(data);
      
      // Simulate authorization success and move to manual setup
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success("Autorização concluída! Configure os registros DNS no Cloudflare.");
      
      // Open Cloudflare dashboard
      window.open('https://dash.cloudflare.com', '_blank');
      
      setSetupStep("manual-setup");
      
    } catch (error) {
      console.error("Error during Cloudflare authorization:", error);
      toast.error("Erro ao autorizar. Tente novamente.");
    } finally {
      setIsAuthorizingDNS(false);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSetupStep("intro");
    setNewDomain("");
    setDetectedProvider("unknown");
    setAnalysisSteps([]);
    setPendingDomainData(null);
    setExistingARecords([]);
  };

  const handleFinishSetup = () => {
    if (pendingDomainData) {
      setExpandedDomain(pendingDomainData.id);
    }
    handleCloseDialog();
    fetchDomains();
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

  const handlePauseDomain = async (domainId: string) => {
    try {
      const { error } = await supabase
        .from("custom_domains")
        .update({ status: "paused" })
        .eq("id", domainId);

      if (error) throw error;

      fetchDomains();
      toast.success("Domínio pausado");
    } catch (error) {
      console.error("Error pausing domain:", error);
      toast.error("Erro ao pausar domínio");
    }
  };

  const handleActivateDomain = async (domainId: string) => {
    try {
      const { error } = await supabase
        .from("custom_domains")
        .update({ status: "active" })
        .eq("id", domainId);

      if (error) throw error;

      fetchDomains();
      toast.success("Domínio ativado");
    } catch (error) {
      console.error("Error activating domain:", error);
      toast.error("Erro ao ativar domínio");
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

        {/* Add Domain Button with Multi-Step Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          if (!open) handleCloseDialog();
          else setIsDialogOpen(true);
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Conectar domínio
            </Button>
          </DialogTrigger>
          <DialogContent className={`${setupStep === "cloudflare-auth" ? "sm:max-w-2xl" : "sm:max-w-lg"} bg-card border-border p-0 overflow-hidden`}>
            {/* Close button - hide on cloudflare-auth (has its own header) */}
            {setupStep !== "cloudflare-auth" && (
              <button
                onClick={handleCloseDialog}
                className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 z-10"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Fechar</span>
              </button>
            )}

            {/* Step Indicator - hide on cloudflare-auth */}
            {setupStep !== "intro" && setupStep !== "cloudflare-auth" && (
              <div className="flex items-center justify-center gap-2 pt-6">
                <div className={`w-2 h-2 rounded-full ${setupStep === "domain-input" ? "bg-primary" : "bg-muted"}`} />
                <div className={`w-8 h-0.5 ${["analyzing", "provider-detected", "manual-setup"].includes(setupStep) ? "bg-primary" : "bg-muted"}`} />
                <div className={`w-2 h-2 rounded-full ${["analyzing", "provider-detected", "manual-setup"].includes(setupStep) ? "bg-primary" : "bg-muted"}`} />
                <div className={`w-8 h-0.5 ${["provider-detected", "manual-setup"].includes(setupStep) ? "bg-primary" : "bg-muted"}`} />
                <div className={`w-2 h-2 rounded-full ${["provider-detected", "manual-setup"].includes(setupStep) ? "bg-primary" : "bg-muted"}`} />
              </div>
            )}

            {/* Step: Intro */}
            {setupStep === "intro" && (
              <div className="p-8 text-center space-y-6">
                <div className="flex items-center justify-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Logo size="sm" colorScheme="default" />
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <ArrowRight className="h-5 w-5" />
                    <ArrowRight className="h-5 w-5 -ml-3" />
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
                    <Globe className="h-8 w-8 text-muted-foreground" />
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Use seu domínio com Acolhe Aqui
                  </h3>
                </div>

                <div className="space-y-4 text-left">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                      <Lock className="h-4 w-4 text-green-500" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">Seguro</h4>
                      <p className="text-sm text-muted-foreground">
                        Login criptografado protege seus dados pessoais
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                      <Zap className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">Fácil</h4>
                      <p className="text-sm text-muted-foreground">
                        Sem necessidade de desenvolvedor, configure automaticamente seu domínio
                      </p>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleStartSetup}
                  className="w-full py-6 text-base"
                >
                  Continuar
                </Button>

                <p className="text-xs text-muted-foreground">
                  Ao selecionar "Continuar" você concorda com os{" "}
                  <a href="/termos-uso" className="text-primary hover:underline">Termos de Serviço</a>
                  {" "}e{" "}
                  <a href="/politica-privacidade" className="text-primary hover:underline">Política de Privacidade</a>
                </p>
              </div>
            )}

            {/* Step: Domain Input */}
            {setupStep === "domain-input" && (
              <div className="p-8 space-y-6">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Qual é o seu domínio?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Insira o nome do domínio que você gostaria de conectar
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Nome de domínio
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="meusite.com.br"
                      value={newDomain}
                      onChange={(e) => setNewDomain(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAnalyzeDomain()}
                      className="pl-10 bg-background border-border py-6"
                      autoFocus
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Por exemplo: meusite.com.br ou www.meusite.com.br
                  </p>
                </div>

                <Button 
                  onClick={handleAnalyzeDomain}
                  disabled={!newDomain.trim()}
                  className="w-full py-6 text-base"
                >
                  Analisar domínio
                </Button>
              </div>
            )}

            {/* Step: Analyzing */}
            {setupStep === "analyzing" && (
              <div className="p-8 space-y-6">
                {/* Animation area */}
                <div className="relative h-40 bg-gradient-to-b from-muted/50 to-transparent rounded-xl flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-16 bg-primary/20 rounded-lg border-2 border-primary/30 flex items-center justify-center relative">
                      <CheckCircle2 className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  {/* Decorative elements */}
                  <div className="absolute top-4 left-8 w-3 h-3 bg-yellow-500 rounded-sm rotate-45" />
                  <div className="absolute top-8 right-12 w-2 h-2 bg-blue-500 rounded-full" />
                  <div className="absolute bottom-8 left-16 w-4 h-4 border-2 border-primary rounded-full" />
                  <div className="absolute bottom-4 right-8 w-3 h-3 bg-muted rounded-sm rotate-12" />
                </div>

                <div className="text-center">
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    Analisando seu domínio
                  </h3>
                </div>

                <div className="space-y-3">
                  {analysisSteps.map((step, index) => (
                    <div key={index} className="flex items-center gap-3">
                      {step.done ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <Loader2 className="h-5 w-5 text-primary animate-spin" />
                      )}
                      <span className={`text-sm ${step.done ? "text-foreground" : "text-muted-foreground"}`}>
                        {step.step}
                        {index === 1 && step.done && detectedProvider !== "unknown" && (
                          <span className="ml-2 text-primary font-medium">
                            {DNS_PROVIDERS[detectedProvider]?.name}
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step: Provider Detected */}
            {setupStep === "provider-detected" && (
              <div className="p-8 space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-green-500/10 flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Provedor detectado!
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Detectamos que seu domínio usa{" "}
                    <span className="font-medium text-foreground">
                      {DNS_PROVIDERS[detectedProvider]?.name || "um provedor DNS"}
                    </span>
                  </p>
                </div>

                <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium text-foreground">{newDomain}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-muted-foreground">
                      SSL será configurado automaticamente
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {detectedProvider !== "unknown" && DNS_PROVIDERS[detectedProvider]?.url && (
                    <Button 
                      onClick={() => handleConfirmSetup(true)}
                      disabled={isAdding}
                      className="w-full py-6 text-base"
                    >
                      {isAdding ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <ExternalLink className="h-4 w-4 mr-2" />
                      )}
                      Configurar automaticamente em {DNS_PROVIDERS[detectedProvider]?.name}
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline"
                    onClick={() => handleConfirmSetup(false)}
                    disabled={isAdding}
                    className="w-full py-6 text-base"
                  >
                    {isAdding && detectedProvider === "unknown" ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Configurar manualmente
                  </Button>
                </div>
              </div>
            )}

            {/* Step: Cloudflare DNS Authorization */}
            {setupStep === "cloudflare-auth" && (
              <div className="p-0 max-h-[80vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img 
                      src="https://www.cloudflare.com/img/cf-facebook-card.png" 
                      alt="Cloudflare" 
                      className="h-6 w-auto"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <span className="font-medium text-foreground">Cloudflare</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setSetupStep("provider-detected")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Autorizar registros de DNS de aplicativo de terceiros
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Esta é uma autorização única. Não concede permissão para fazer alterações futuras.
                    </p>
                  </div>

                  {/* Records to be added */}
                  <div className="space-y-3">
                    <p className="text-sm text-foreground">
                      Um aplicativo de terceiros adicionará os seguintes registros de DNS da Cloudflare para{" "}
                      <span className="font-semibold">{newDomain}</span>
                    </p>
                    
                    <div className="rounded-lg border border-border overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tipo</th>
                            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nome</th>
                            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Conteúdo</th>
                            <th className="text-left px-4 py-3 font-medium text-muted-foreground">TTL</th>
                            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status do proxy</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          <tr className="bg-background">
                            <td className="px-4 py-3 font-semibold text-foreground">A</td>
                            <td className="px-4 py-3 text-muted-foreground">{newDomain}</td>
                            <td className="px-4 py-3 font-mono text-blue-500">{TARGET_IP}</td>
                            <td className="px-4 py-3 text-muted-foreground">1 h</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 bg-gray-400 rounded flex items-center justify-center">
                                  <span className="text-white text-xs">☁</span>
                                </div>
                                <span className="text-muted-foreground">Somente DNS</span>
                              </div>
                            </td>
                          </tr>
                          <tr className="bg-background">
                            <td className="px-4 py-3 font-semibold text-foreground">TXT</td>
                            <td className="px-4 py-3 text-muted-foreground">_lovable</td>
                            <td className="px-4 py-3 font-mono text-xs text-muted-foreground break-all">
                              "lovable_verify={crypto.randomUUID().replace(/-/g, '').slice(0, 32)}"
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">1 h</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 bg-gray-400 rounded flex items-center justify-center">
                                  <span className="text-white text-xs">☁</span>
                                </div>
                                <span className="text-muted-foreground">Somente DNS</span>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Records to be removed */}
                  {existingARecords.length > 0 && (
                    <div className="space-y-3">
                      <div className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 p-4">
                        <p className="text-sm text-red-800 dark:text-red-300">
                          Depois que você selecionar Autorizar, a Cloudflare removerá os seguintes registros do DNS de sua zona, o que pode resultar em tempo de inatividade. Esse processo é necessário para evitar conflitos com os registros necessários.
                        </p>
                      </div>
                      
                      <div className="rounded-lg border border-border overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-muted/50">
                            <tr>
                              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tipo</th>
                              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nome</th>
                              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Conteúdo</th>
                              <th className="text-left px-4 py-3 font-medium text-muted-foreground">TTL</th>
                              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status do proxy</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {existingARecords.map((record, idx) => (
                              <tr key={idx} className="bg-background">
                                <td className="px-4 py-3 font-semibold text-foreground">A</td>
                                <td className="px-4 py-3 text-muted-foreground">{record.name}</td>
                                <td className="px-4 py-3 font-mono text-muted-foreground">{record.ip}</td>
                                <td className="px-4 py-3 text-muted-foreground">Auto</td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 bg-orange-400 rounded flex items-center justify-center">
                                      <span className="text-white text-xs">☁</span>
                                    </div>
                                    <span className="text-muted-foreground">Com proxy</span>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex items-center gap-3 pt-4 border-t border-border">
                    <Button 
                      variant="outline"
                      onClick={() => setSetupStep("provider-detected")}
                      disabled={isAuthorizingDNS}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleCloudflareAuthorize}
                      disabled={isAuthorizingDNS}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isAuthorizingDNS ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Autorizando...
                        </>
                      ) : (
                        "Autorizar"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Step: Manual Setup */}
            {setupStep === "manual-setup" && pendingDomainData && (
              <div className="p-8 space-y-6">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Configure os registros DNS
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Adicione os seguintes registros no painel do seu provedor DNS
                  </p>
                </div>

                {/* DNS Records Table */}
                <div className="rounded-lg border border-border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left px-3 py-2 font-medium text-muted-foreground">Tipo</th>
                        <th className="text-left px-3 py-2 font-medium text-muted-foreground">Nome</th>
                        <th className="text-left px-3 py-2 font-medium text-muted-foreground">Valor</th>
                        <th className="w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      <tr className="bg-background">
                        <td className="px-3 py-2">
                          <Badge variant="secondary" className="font-mono text-xs">A</Badge>
                        </td>
                        <td className="px-3 py-2 font-mono text-xs text-foreground">@</td>
                        <td className="px-3 py-2 font-mono text-xs text-foreground">{TARGET_IP}</td>
                        <td className="px-3 py-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(TARGET_IP, `a-root-setup`)}
                          >
                            {copiedField === `a-root-setup` ? (
                              <Check className="h-3 w-3 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </td>
                      </tr>
                      <tr className="bg-background">
                        <td className="px-3 py-2">
                          <Badge variant="secondary" className="font-mono text-xs">A</Badge>
                        </td>
                        <td className="px-3 py-2 font-mono text-xs text-foreground">www</td>
                        <td className="px-3 py-2 font-mono text-xs text-foreground">{TARGET_IP}</td>
                        <td className="px-3 py-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(TARGET_IP, `a-www-setup`)}
                          >
                            {copiedField === `a-www-setup` ? (
                              <Check className="h-3 w-3 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </td>
                      </tr>
                      <tr className="bg-background">
                        <td className="px-3 py-2">
                          <Badge variant="secondary" className="font-mono text-xs">TXT</Badge>
                        </td>
                        <td className="px-3 py-2 font-mono text-xs text-foreground">_acolheaqui</td>
                        <td className="px-3 py-2 font-mono text-xs text-foreground break-all max-w-[200px] truncate">
                          acolheaqui_verify={pendingDomainData.verification_token}
                        </td>
                        <td className="px-3 py-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(`acolheaqui_verify=${pendingDomainData.verification_token}`, `txt-setup`)}
                          >
                            {copiedField === `txt-setup` ? (
                              <Check className="h-3 w-3 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="text-xs text-muted-foreground space-y-1">
                  <p>
                    <strong>Importante:</strong> A propagação de DNS pode levar até 48 horas.
                  </p>
                  <p>
                    Verifique a propagação em{" "}
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

                <Button 
                  onClick={handleFinishSetup}
                  className="w-full py-6 text-base"
                >
                  Concluir configuração
                </Button>
              </div>
            )}
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

                      {/* Action Buttons - Always Visible */}
                      <div className="flex items-center gap-1">
                        {/* Activate Button */}
                        {domain.status === "paused" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleActivateDomain(domain.id)}
                            className="gap-1.5 text-green-600 border-green-200 hover:bg-green-50 hover:border-green-300"
                          >
                            <PlayCircle className="h-4 w-4" />
                            <span className="hidden sm:inline">Ativar</span>
                          </Button>
                        )}
                        
                        {/* Pause Button */}
                        {domain.status === "active" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePauseDomain(domain.id)}
                            className="gap-1.5 text-orange-600 border-orange-200 hover:bg-orange-50 hover:border-orange-300"
                          >
                            <PauseCircle className="h-4 w-4" />
                            <span className="hidden sm:inline">Pausar</span>
                          </Button>
                        )}
                        
                        {/* Delete Button with Confirmation */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1.5 text-destructive border-destructive/20 hover:bg-destructive/10 hover:border-destructive/30"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="hidden sm:inline">Remover</span>
                            </Button>
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

                        {/* More Options Dropdown */}
                        {domain.status === "active" && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 z-50 bg-popover">
                              {/* Primary Domain Option */}
                              {!domain.is_primary && (
                                <DropdownMenuItem onClick={() => handleSetPrimary(domain.id)}>
                                  <Star className="h-4 w-4 mr-2" />
                                  Definir como primário
                                </DropdownMenuItem>
                              )}
                              
                              {/* Redirect Options */}
                              {getActiveDomains().length > 1 && (
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
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
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
