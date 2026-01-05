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
  Power,
  Cloud,
  MessageCircle,
  Bell,
  Save
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
  notification_whatsapp: string | null;
}

// DNS Providers supported for automatic configuration
const DNS_PROVIDERS: Record<string, { name: string; url: string; logo?: string; supportsAuto: boolean }> = {
  cloudflare: { name: "Cloudflare", url: "https://dash.cloudflare.com", supportsAuto: true },
  godaddy: { name: "GoDaddy", url: "https://dcc.godaddy.com/manage", supportsAuto: true },
  namecheap: { name: "Namecheap", url: "https://ap.www.namecheap.com/Domains/DomainControlPanel", supportsAuto: true },
  hostinger: { name: "Hostinger", url: "https://hpanel.hostinger.com", supportsAuto: true },
  digitalocean: { name: "DigitalOcean", url: "https://cloud.digitalocean.com/networking/domains", supportsAuto: true },
  vercel: { name: "Vercel", url: "https://vercel.com/dashboard/domains", supportsAuto: true },
  registrobr: { name: "Registro.br", url: "https://registro.br/painel", supportsAuto: false },
  hostgator: { name: "HostGator", url: "https://cliente.hostgator.com.br", supportsAuto: false },
  locaweb: { name: "Locaweb", url: "https://cliente.locaweb.com.br", supportsAuto: false },
  uolhost: { name: "UOL Host", url: "https://painel.uolhost.uol.com.br", supportsAuto: false },
  google: { name: "Google Domains", url: "https://domains.google.com", supportsAuto: false },
  aws: { name: "AWS Route 53", url: "https://console.aws.amazon.com/route53", supportsAuto: false },
  netlify: { name: "Netlify", url: "https://app.netlify.com/teams/*/dns", supportsAuto: false },
  unknown: { name: "Provedor Desconhecido", url: "", supportsAuto: false },
};

type SupportedAutoProvider = "cloudflare" | "godaddy" | "namecheap" | "hostinger" | "digitalocean" | "vercel";

type SetupStep = "intro" | "domain-input" | "analyzing" | "provider-detected" | "manual-setup" | "auto-setup" | "cloudflare-migration";

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

// IP para onde o domínio deve apontar (Approximated cluster)
const TARGET_IP = "149.248.203.97";

// TLDs públicos com múltiplos níveis (ex: ".com.br").
// Sem isso, "exemplo.com.br" viraria "com.br" e quebraria a detecção + automação.
const MULTI_PART_PUBLIC_SUFFIXES = new Set(["com.br", "net.br", "org.br", "gov.br", "edu.br"]);

const CustomDomainPage = ({ profileId }: CustomDomainPageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [domains, setDomains] = useState<CustomDomain[]>([]);
  const [newDomain, setNewDomain] = useState("");
  const [newDomainWhatsApp, setNewDomainWhatsApp] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [verificationProgress, setVerificationProgress] = useState<{
    step: number;
    steps: { label: string; status: 'pending' | 'loading' | 'done' | 'error' }[];
    message: string;
  } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [expandedDomain, setExpandedDomain] = useState<string | null>(null);
  
  // New setup flow states
  const [setupStep, setSetupStep] = useState<SetupStep>("intro");
  const [detectedProvider, setDetectedProvider] = useState<string>("unknown");
  const [analysisSteps, setAnalysisSteps] = useState<{step: string; done: boolean}[]>([]);
  const [pendingDomainData, setPendingDomainData] = useState<CustomDomain | null>(null);
  const [existingARecords, setExistingARecords] = useState<{name: string; ip: string}[]>([]);
  const [isAuthorizingDNS, setIsAuthorizingDNS] = useState(false);
  const [providerCredentials, setProviderCredentials] = useState<Record<string, string>>({});
  const [plannedVerificationToken, setPlannedVerificationToken] = useState<string | null>(null);
  const [cloudflareNameservers, setCloudflareNameservers] = useState<string[]>([]);
  const [isMigratingToCloudflare, setIsMigratingToCloudflare] = useState(false);
  
  // Domain removal states
  const [deletingDomainId, setDeletingDomainId] = useState<string | null>(null);
  const [deleteCloudflareToken, setDeleteCloudflareToken] = useState("");
  const [isDeletingDomain, setIsDeletingDomain] = useState(false);
  const [deleteCleanupFailed, setDeleteCleanupFailed] = useState(false);
  const [deleteCleanupError, setDeleteCleanupError] = useState<string | null>(null);
  
  // WhatsApp notification states
  const [editingWhatsAppDomainId, setEditingWhatsAppDomainId] = useState<string | null>(null);
  const [whatsAppNumber, setWhatsAppNumber] = useState("");
  const [isSavingWhatsApp, setIsSavingWhatsApp] = useState(false);


  useEffect(() => {
    fetchDomains();
  }, [profileId]);

  // Polling automático para domínios em verificação ou aguardando SSL
  useEffect(() => {
    const POLLING_INTERVAL_MS = 45000; // 45 segundos

    const domainsNeedingPolling = domains.filter(d => 
      d.status === "verifying" || 
      (d.status === "ready" && d.ssl_status === "provisioning")
    );

    if (domainsNeedingPolling.length === 0) return;

    const pollDomainStatus = async () => {
      for (const domain of domainsNeedingPolling) {
        try {
          console.log(`[Polling] Checking status for ${domain.domain}`);
          const { data, error } = await supabase.functions.invoke("approximated-domain", {
            body: { action: "status", domainId: domain.id },
          });

          if (error) {
            console.error(`[Polling] Error checking ${domain.domain}:`, error);
            continue;
          }

          // Refresh domains to get updated status
          const { data: updatedDomain } = await supabase
            .from("custom_domains")
            .select("*")
            .eq("id", domain.id)
            .single();

          if (updatedDomain) {
            setDomains(prev => prev.map(d => 
              d.id === domain.id ? updatedDomain : d
            ));

            // Notify user if status changed to active
            if (updatedDomain.status === "active" && domain.status !== "active") {
              toast.success(`🎉 Domínio ${domain.domain} está ativo!`);
            } else if (updatedDomain.status === "failed" && domain.status !== "failed") {
              toast.error(`Falha na configuração do domínio ${domain.domain}`);
            }
          }
        } catch (err) {
          console.error(`[Polling] Exception for ${domain.domain}:`, err);
        }
      }
    };

    // Execute immediately on mount
    pollDomainStatus();

    // Set up interval
    const intervalId = setInterval(pollDomainStatus, POLLING_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [domains]);

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
    const parts = domain.split(".").filter(Boolean);
    if (parts.length <= 2) return domain;

    const last2 = parts.slice(-2).join(".");
    if (MULTI_PART_PUBLIC_SUFFIXES.has(last2) && parts.length >= 3) {
      return parts.slice(-3).join(".");
    }

    return last2;
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

  // Simplified: run setup directly, adding domain to our Cloudflare
  const runAutoSetup = async (domain: string) => {
    setSetupStep("analyzing");
    setAnalysisSteps([
      { step: `Preparando ${domain}`, done: false },
      { step: "Adicionando ao Cloudflare", done: false },
      { step: "Configurando registros DNS", done: false },
    ]);

    const isWww = domain.startsWith("www.");
    const rootDomain = isWww ? domain.slice(4) : getRootDomain(domain);
    const parentDomain = domains.find(d => d.domain === rootDomain);

    try {
      // Step 1: Prepare domain
      await new Promise(resolve => setTimeout(resolve, 800));
      setAnalysisSteps(prev => prev.map((s, i) => i === 0 ? { ...s, done: true } : s));

      const isFirstDomain = domains.length === 0;
      const verificationToken = crypto.randomUUID().replace(/-/g, "");

      // Create domain record in database first
      let domainRow: CustomDomain | null = null;

      const { data, error } = await supabase
        .from("custom_domains")
        .insert({
          professional_id: profileId,
          domain: domain,
          is_primary: isFirstDomain,
          parent_domain_id: parentDomain?.id || null,
          verification_token: verificationToken,
          notification_whatsapp: newDomainWhatsApp.trim() || null,
        })
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          const { data: existing } = await supabase
            .from("custom_domains")
            .select("*")
            .eq("professional_id", profileId)
            .eq("domain", domain)
            .maybeSingle();

          if (!existing) {
            toast.error("Este domínio já está cadastrado");
            setSetupStep("domain-input");
            return;
          }
          domainRow = existing as CustomDomain;
        } else {
          throw error;
        }
      } else {
        domainRow = data as CustomDomain;
        setDomains(prev => [domainRow!, ...prev]);
      }

      if (!domainRow) {
        toast.error("Não foi possível preparar o domínio.");
        setSetupStep("domain-input");
        return;
      }

      setPendingDomainData(domainRow);
      setPlannedVerificationToken(domainRow.verification_token);

      // Create virtual host first
      const { data: apxCreate, error: apxCreateError } = await supabase.functions.invoke("approximated-domain", {
        body: { action: "create", domainId: domainRow.id },
      });

      if (apxCreateError || !apxCreate?.success) {
        console.log("[Auto Setup] Virtual host creation result:", apxCreate?.message || apxCreateError?.message);
        // Continue anyway - the domain might already exist
      }

      // Step 2: Add to Cloudflare
      setAnalysisSteps(prev => prev.map((s, i) => i === 1 ? { ...s, done: true } : s));

      const { data: cfResult, error: cfError } = await supabase.functions.invoke("cloudflare-add-domain", {
        body: { domainId: domainRow.id },
      });

      if (cfError || !cfResult?.success) {
        const msg = cfResult?.message || cfError?.message || "Falha ao adicionar domínio ao Cloudflare";
        toast.error(msg);
        // Fall back to manual setup
        setSetupStep("manual-setup");
        return;
      }

      // Step 3: DNS configured
      await new Promise(resolve => setTimeout(resolve, 500));
      setAnalysisSteps(prev => prev.map((s, i) => i === 2 ? { ...s, done: true } : s));

      await new Promise(resolve => setTimeout(resolve, 500));

      // If domain was already on Cloudflare, DNS records are configured - verify immediately
      if (cfResult.alreadyOnCloudflare) {
        toast.success("Domínio configurado! Registros DNS criados automaticamente.");
        handleFinishSetup();
        // Auto-verify after a short delay
        setTimeout(() => {
          if (domainRow) {
            handleVerifyDomain(domainRow.id);
          }
        }, 1500);
        return;
      }

      // Store the nameservers for display
      setCloudflareNameservers(cfResult.nameservers || []);
      setSetupStep("cloudflare-migration");
      toast.success("Domínio adicionado ao Cloudflare! Agora configure os nameservers.");

    } catch (error) {
      console.error("Error during auto setup:", error);
      toast.error("Erro ao configurar. Tente novamente.");
      setSetupStep("domain-input");
    }
  };

  const handleStartSetup = () => {
    setSetupStep("domain-input");
  };

  const handleConnectDomain = async () => {
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

    // Go directly to auto setup
    await runAutoSetup(domain);
  };

  const handleConfirmSetup = async (useAutomatic: boolean) => {
    const domain = newDomain.trim().toLowerCase();

    // If user wants automatic setup for a supported provider, show authorization screen
    const providerInfo = DNS_PROVIDERS[detectedProvider];
    if (useAutomatic && providerInfo?.supportsAuto) {
      // Generate a verification token upfront so UI can display it
      const token = crypto.randomUUID().replace(/-/g, '');
      setPlannedVerificationToken(token);
      setSetupStep("auto-setup");
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

  // Handle auto DNS configuration for supported providers
  const handleAutoSetup = async () => {
    const domain = newDomain.trim().toLowerCase();
    const isWww = domain.startsWith("www.");
    const rootDomain = isWww ? domain.slice(4) : getRootDomain(domain);
    const parentDomain = domains.find(d => d.domain === rootDomain);

    // Validate credentials based on provider
    const provider = detectedProvider as SupportedAutoProvider;

    // Cloudflare: now requires user's API token to configure DNS on their Cloudflare
    if (provider === "cloudflare" && !providerCredentials.apiToken?.trim()) {
      toast.error("Informe o token de API do Cloudflare");
      return;
    }

    if (provider === "godaddy" && (!providerCredentials.apiKey?.trim() || !providerCredentials.apiSecret?.trim())) {
      toast.error("Informe a API Key e API Secret do GoDaddy");
      return;
    }
    if (provider === "namecheap" && (!providerCredentials.apiUser?.trim() || !providerCredentials.apiKey?.trim() || !providerCredentials.clientIp?.trim())) {
      toast.error("Informe API User, API Key e seu IP público do Namecheap");
      return;
    }
    if (provider === "hostinger" && !providerCredentials.apiToken?.trim()) {
      toast.error("Informe o token de API da Hostinger");
      return;
    }
    if (provider === "digitalocean" && !providerCredentials.apiToken?.trim()) {
      toast.error("Informe o token de API do DigitalOcean");
      return;
    }
    if (provider === "vercel" && !providerCredentials.apiToken?.trim()) {
      toast.error("Informe o token de API da Vercel");
      return;
    }

    const sanitizedCredentials = Object.fromEntries(
      Object.entries(providerCredentials).map(([k, v]) => [k, typeof v === "string" ? v.trim() : v])
    ) as Record<string, string>;

    setIsAuthorizingDNS(true);
    try {
      const isFirstDomain = domains.length === 0;

      // Use the token we already generated for display
      const verificationToken = plannedVerificationToken ?? crypto.randomUUID().replace(/-/g, "");

      // 1) Reutiliza um domínio já criado nesta tentativa (para permitir retry)
      // ou cria um novo registro se ainda não existir.
      let domainRow: CustomDomain | null =
        pendingDomainData && pendingDomainData.domain === domain ? pendingDomainData : null;

      if (!domainRow) {
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
          // Se já existir, buscamos e tentamos configurar mesmo assim (corrige o caso de “travou no manual”).
          if (error.code === "23505") {
            const { data: existing } = await supabase
              .from("custom_domains")
              .select("*")
              .eq("professional_id", profileId)
              .eq("domain", domain)
              .maybeSingle();

            if (!existing) {
              toast.error("Este domínio já está cadastrado");
              return;
            }

            domainRow = existing as CustomDomain;
          } else {
            throw error;
          }
        } else {
          domainRow = data as CustomDomain;
          setDomains(prev => [domainRow!, ...prev]);
        }

        setPendingDomainData(domainRow);
      }

      // Mantém o token da UI consistente com o token do domínio (especialmente em retries)
      setPlannedVerificationToken(domainRow.verification_token);

      // 2) Garantir que o domínio exista no nosso roteamento (virtual host) antes de apontar o DNS
      const { data: apxCreate, error: apxCreateError } = await supabase.functions.invoke("approximated-domain", {
        body: { action: "create", domainId: domainRow.id },
      });

      if (apxCreateError || !apxCreate?.success) {
        const msg =
          apxCreate?.message ||
          apxCreateError?.message ||
          "Falha ao preparar o domínio para ativação.";
        toast.error(msg);
        return;
      }

      // 3) Configurar DNS automaticamente no provedor
      let setupResult: { success?: boolean; message?: string } | null = null;
      let setupError: Error | null = null;

      if (provider === "cloudflare") {
        // Use cloudflare-dns-setup for Cloudflare (user's own Cloudflare account)
        const res = await supabase.functions.invoke("cloudflare-dns-setup", {
          body: {
            domainId: domainRow.id,
            cloudflareApiToken: sanitizedCredentials.apiToken,
          },
        });
        setupResult = res.data;
        setupError = res.error;
      } else {
        // Use dns-auto-setup for other providers
        const res = await supabase.functions.invoke("dns-auto-setup", {
          body: {
            domainId: domainRow.id,
            provider,
            credentials: sanitizedCredentials,
          },
        });
        setupResult = res.data;
        setupError = res.error;
      }

      if (setupError || !setupResult?.success) {
        const msg =
          setupResult?.message ||
          setupError?.message ||
          `Falha ao configurar DNS via ${DNS_PROVIDERS[provider].name}`;

        toast.error(msg);
        // Mantém o usuário na etapa de automação para ele corrigir credenciais e tentar novamente.
        return;
      }

      toast.success(`DNS configurado automaticamente via ${DNS_PROVIDERS[provider].name}!`);

      // 4) Verificar status (propagação/SSL)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const { data: verifyResult, error: verifyError } = await supabase.functions.invoke("approximated-domain", {
        body: { action: "verify", domainId: domainRow.id },
      });

      const statusMsg =
        verifyResult?.message ||
        "DNS configurado. Aguarde a propagação e clique em Verificar.";

      if (verifyError) {
        toast.info("DNS configurado. Aguarde a propagação e clique em Verificar.");
      } else if (typeof statusMsg === "string" && statusMsg.toLowerCase().includes("ativo")) {
        toast.success(statusMsg);
      } else {
        toast.info(statusMsg);
      }
      fetchDomains();
      handleCloseDialog();
    } catch (error) {
      console.error("Error during auto DNS setup:", error);
      toast.error("Erro ao configurar. Tente novamente.");
    } finally {
      setIsAuthorizingDNS(false);
    }
  };

  // Handle automatic Approximated setup (simplified - just creates virtual host)
  const handleApproximatedSetup = async () => {
    const domain = newDomain.trim().toLowerCase();
    const isWww = domain.startsWith("www.");
    const rootDomain = isWww ? domain.slice(4) : getRootDomain(domain);
    const parentDomain = domains.find(d => d.domain === rootDomain);

    setIsAuthorizingDNS(true);
    try {
      const isFirstDomain = domains.length === 0;
      const verificationToken = crypto.randomUUID().replace(/-/g, "");

      // Create domain record in database
      let domainRow: CustomDomain | null = pendingDomainData && pendingDomainData.domain === domain ? pendingDomainData : null;

      if (!domainRow) {
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
            const { data: existing } = await supabase
              .from("custom_domains")
              .select("*")
              .eq("professional_id", profileId)
              .eq("domain", domain)
              .maybeSingle();

            if (!existing) {
              toast.error("Este domínio já está cadastrado");
              return;
            }
            domainRow = existing as CustomDomain;
          } else {
            throw error;
          }
        } else {
          domainRow = data as CustomDomain;
          setDomains(prev => [domainRow!, ...prev]);
        }
        setPendingDomainData(domainRow);
      }

      // Call the Approximated edge function to create virtual host
      const { data: setupResult, error: setupError } = await supabase.functions.invoke("approximated-domain", {
        body: { action: "create", domainId: domainRow.id },
      });

      if (setupError || !setupResult?.success) {
        const msg = setupResult?.message || setupError?.message || "Falha ao configurar domínio";
        toast.error(msg);
        // Still show manual setup so user can configure DNS
        setSetupStep("manual-setup");
        return;
      }

      toast.success("Domínio configurado! Agora configure o DNS.");
      setSetupStep("manual-setup");
      fetchDomains();

    } catch (error) {
      console.error("Error during Approximated setup:", error);
      toast.error("Erro ao configurar. Tente novamente.");
    } finally {
      setIsAuthorizingDNS(false);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSetupStep("intro");
    setNewDomain("");
    setNewDomainWhatsApp("");
    setDetectedProvider("unknown");
    setAnalysisSteps([]);
    setPendingDomainData(null);
    setExistingARecords([]);
    setProviderCredentials({});
    setPlannedVerificationToken(null);
    setCloudflareNameservers([]);
    setIsMigratingToCloudflare(false);
  };

  // Handle migration to Cloudflare - adds domain to CF account and returns nameservers
  const handleMigrateToCloudflare = async () => {
    const domain = newDomain.trim().toLowerCase();
    const isWww = domain.startsWith("www.");
    const rootDomain = isWww ? domain.slice(4) : getRootDomain(domain);
    const parentDomain = domains.find(d => d.domain === rootDomain);

    setIsMigratingToCloudflare(true);
    try {
      const isFirstDomain = domains.length === 0;
      const verificationToken = plannedVerificationToken ?? crypto.randomUUID().replace(/-/g, "");

      // Create domain record in database first
      let domainRow: CustomDomain | null = pendingDomainData && pendingDomainData.domain === domain ? pendingDomainData : null;

      if (!domainRow) {
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
            const { data: existing } = await supabase
              .from("custom_domains")
              .select("*")
              .eq("professional_id", profileId)
              .eq("domain", domain)
              .maybeSingle();

            if (!existing) {
              toast.error("Este domínio já está cadastrado");
              return;
            }
            domainRow = existing as CustomDomain;
          } else {
            throw error;
          }
        } else {
          domainRow = data as CustomDomain;
          setDomains(prev => [domainRow!, ...prev]);
        }
      }

      if (!domainRow) {
        toast.error("Não foi possível preparar o domínio para migração.");
        return;
      }

      setPendingDomainData(domainRow);

      // Garantir que o domínio exista no nosso roteamento (virtual host) antes de apontar o DNS
      const { data: apxCreate, error: apxCreateError } = await supabase.functions.invoke("approximated-domain", {
        body: { action: "create", domainId: domainRow.id },
      });

      if (apxCreateError || !apxCreate?.success) {
        const msg =
          apxCreate?.message ||
          apxCreateError?.message ||
          "Falha ao preparar o domínio para ativação.";
        toast.error(msg);
        return;
      }

      // Call the cloudflare-add-domain edge function
      const { data: cfResult, error: cfError } = await supabase.functions.invoke("cloudflare-add-domain", {
        body: { domainId: domainRow.id },
      });

      if (cfError || !cfResult?.success) {
        const msg = cfResult?.message || cfError?.message || "Falha ao adicionar domínio ao Cloudflare";
        toast.error(msg);
        return;
      }

      // If domain was already on Cloudflare, DNS records are configured - skip nameserver step
      if (cfResult.alreadyOnCloudflare) {
        toast.success("Domínio configurado! Registros DNS criados automaticamente.");
        // Trigger verification immediately since DNS is already pointing correctly
        if (domainRow) {
          handleFinishSetup();
          // Auto-verify after a short delay
          setTimeout(() => {
            handleVerifyDomain(domainRow.id);
          }, 1000);
        }
        return;
      }

      // Store the nameservers for display (only for new zones that need nameserver change)
      setCloudflareNameservers(cfResult.nameservers || []);
      setSetupStep("cloudflare-migration");
      toast.success("Domínio adicionado ao Cloudflare! Agora configure os nameservers.");

    } catch (error) {
      console.error("Error migrating to Cloudflare:", error);
      toast.error("Erro ao migrar para Cloudflare. Tente novamente.");
    } finally {
      setIsMigratingToCloudflare(false);
    }
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

  const handleOpenWhatsAppConfig = (domain: CustomDomain) => {
    setEditingWhatsAppDomainId(domain.id);
    setWhatsAppNumber(domain.notification_whatsapp || "");
  };

  const handleSaveWhatsAppNumber = async () => {
    if (!editingWhatsAppDomainId) return;

    setIsSavingWhatsApp(true);
    try {
      // Format phone number - remove non-digits and ensure country code
      let formattedNumber = whatsAppNumber.replace(/\D/g, "");
      
      // If empty, set to null
      if (!formattedNumber) {
        formattedNumber = "";
      } else if (!formattedNumber.startsWith("55") && formattedNumber.length <= 11) {
        formattedNumber = "55" + formattedNumber;
      }

      const { error } = await supabase
        .from("custom_domains")
        .update({ notification_whatsapp: formattedNumber || null })
        .eq("id", editingWhatsAppDomainId);

      if (error) throw error;

      setDomains(prev => prev.map(d => 
        d.id === editingWhatsAppDomainId 
          ? { ...d, notification_whatsapp: formattedNumber || null }
          : d
      ));

      // Refresh from backend to guarantee the badge/state updates on the correct domain card
      fetchDomains();

      toast.success(formattedNumber ? "WhatsApp configurado para notificações" : "Notificação por WhatsApp removida");
      setEditingWhatsAppDomainId(null);
      setWhatsAppNumber("");
    } catch (error) {
      console.error("Error saving WhatsApp number:", error);
      toast.error("Erro ao salvar número de WhatsApp");
    } finally {
      setIsSavingWhatsApp(false);
    }
  };

  const handleVerifyDomain = async (domainId: string) => {
    setVerifyingId(domainId);
    
    type StepStatus = 'pending' | 'loading' | 'done' | 'error';
    type Step = { label: string; status: StepStatus };
    
    const createSteps = (statuses: StepStatus[]): Step[] => [
      { label: 'Verificando DNS', status: statuses[0] },
      { label: 'Configurando servidor', status: statuses[1] },
      { label: 'Provisionando SSL', status: statuses[2] },
      { label: 'Finalizando', status: statuses[3] },
    ];
    
    setVerificationProgress({ 
      step: 0, 
      steps: createSteps(['loading', 'pending', 'pending', 'pending']), 
      message: 'Iniciando verificação...' 
    });

    try {
      // Step 1: Checking DNS
      await new Promise(resolve => setTimeout(resolve, 500));
      setVerificationProgress({ 
        step: 1, 
        steps: createSteps(['done', 'loading', 'pending', 'pending']), 
        message: 'DNS verificado, configurando servidor...' 
      });

      // Step 2: Calling the verification API
      const { data, error } = await supabase.functions.invoke("approximated-domain", {
        body: { action: "verify", domainId },
      });

      if (error) throw error;

      // Step 3: Processing result
      setVerificationProgress({ 
        step: 2, 
        steps: createSteps(['done', 'done', 'loading', 'pending']), 
        message: 'Servidor configurado, verificando SSL...' 
      });
      
      await new Promise(resolve => setTimeout(resolve, 500));

      if (data.success) {
        setVerificationProgress({ 
          step: 3, 
          steps: createSteps(['done', 'done', 'done', 'loading']), 
          message: 'Finalizando configuração...' 
        });
        
        await new Promise(resolve => setTimeout(resolve, 500));
        setVerificationProgress({ 
          step: 4, 
          steps: createSteps(['done', 'done', 'done', 'done']), 
          message: 'Domínio verificado com sucesso!' 
        });
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success(data.message || "Verificação concluída!");
        fetchDomains();
      } else if (data.isPending) {
        setVerificationProgress({ 
          step: 2, 
          steps: createSteps(['done', 'done', 'pending', 'pending']), 
          message: data.message || 'Aguardando propagação...' 
        });
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        toast.info(data.message || "Aguardando propagação dos nameservers. Tente novamente mais tarde.");
      } else {
        setVerificationProgress({ 
          step: 1, 
          steps: createSteps(['done', 'error', 'pending', 'pending']), 
          message: data.message || 'DNS não propagou ainda.' 
        });
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        toast.info(data.message || "DNS ainda não propagou. Tente novamente em alguns minutos.");
      }
    } catch (error) {
      console.error("Error verifying domain:", error);
      setVerificationProgress({ 
        step: 0, 
        steps: createSteps(['error', 'pending', 'pending', 'pending']), 
        message: 'Erro ao verificar domínio.' 
      });
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.error("Erro ao verificar domínio. Aguarde a propagação dos nameservers.");
    } finally {
      await new Promise(resolve => setTimeout(resolve, 500));
      setVerifyingId(null);
      setVerificationProgress(null);
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

  const handleDeleteDomain = async (domainId: string, cloudflareToken?: string) => {
    setIsDeletingDomain(true);
    setDeleteCleanupFailed(false);
    setDeleteCleanupError(null);
    
    try {
      const domainToDelete = domains.find(d => d.id === domainId);
      
      // First, cleanup DNS records from Cloudflare (before deleting from DB)
      let cleanupSuccess = false;
      try {
        console.log("[CustomDomainPage] Cleaning up Cloudflare DNS records for domain:", domainId);
        const cleanupBody: { domainId: string; cloudflareToken?: string } = { domainId };
        if (cloudflareToken?.trim()) {
          cleanupBody.cloudflareToken = cloudflareToken.trim();
        }
        
        const { data: cleanupResult, error: cleanupError } = await supabase.functions.invoke("cloudflare-dns-cleanup", {
          body: cleanupBody,
        });
        
        if (cleanupError) {
          console.error("[CustomDomainPage] DNS cleanup error:", cleanupError);
          setDeleteCleanupError("Erro ao limpar registros DNS: " + cleanupError.message);
        } else {
          console.log("[CustomDomainPage] DNS cleanup result:", cleanupResult);
          if (cleanupResult?.success) {
            cleanupSuccess = true;
          } else if (cleanupResult?.error) {
            setDeleteCleanupError(cleanupResult.error);
          }
        }
      } catch (cleanupErr: any) {
        console.error("[CustomDomainPage] DNS cleanup exception:", cleanupErr);
        setDeleteCleanupError("Erro ao limpar registros DNS: " + (cleanupErr?.message || "Erro desconhecido"));
      }
      
      // If cleanup failed and no token was provided, show the optional token field
      if (!cleanupSuccess && !cloudflareToken?.trim()) {
        setDeleteCleanupFailed(true);
        setIsDeletingDomain(false);
        return; // Don't delete yet, let user optionally provide token or confirm anyway
      }
      
      // Proceed with deletion
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
      toast.success("Domínio removido com sucesso");
      
      // Reset delete dialog state
      setDeletingDomainId(null);
      setDeleteCloudflareToken("");
      setDeleteCleanupFailed(false);
      setDeleteCleanupError(null);
    } catch (error) {
      console.error("Error deleting domain:", error);
      toast.error("Erro ao remover domínio");
    } finally {
      setIsDeletingDomain(false);
    }
  };

  const handleForceDeleteDomain = async (domainId: string) => {
    // Force delete without cleanup
    setIsDeletingDomain(true);
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
      toast.success("Domínio removido (limpeza DNS manual necessária)");
      
      // Reset delete dialog state
      setDeletingDomainId(null);
      setDeleteCloudflareToken("");
      setDeleteCleanupFailed(false);
      setDeleteCleanupError(null);
    } catch (error) {
      console.error("Error deleting domain:", error);
      toast.error("Erro ao remover domínio");
    } finally {
      setIsDeletingDomain(false);
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
          <DialogContent className={`${setupStep === "auto-setup" ? "sm:max-w-2xl" : "sm:max-w-lg"} bg-card border-border p-0 overflow-hidden`}>
            {/* Close button - hide on auto-setup (has its own header) */}
            {setupStep !== "auto-setup" && (
              <button
                onClick={handleCloseDialog}
                className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 z-10"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Fechar</span>
              </button>
            )}

            {/* Step Indicator - simplified for new flow */}
            {setupStep !== "intro" && setupStep !== "cloudflare-migration" && setupStep !== "manual-setup" && (
              <div className="flex items-center justify-center gap-2 pt-6">
                <div className={`w-2 h-2 rounded-full ${setupStep === "domain-input" ? "bg-primary" : "bg-muted"}`} />
                <div className={`w-8 h-0.5 ${setupStep === "analyzing" ? "bg-primary" : "bg-muted"}`} />
                <div className={`w-2 h-2 rounded-full ${setupStep === "analyzing" ? "bg-primary" : "bg-muted"}`} />
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
                      onKeyDown={(e) => e.key === "Enter" && handleConnectDomain()}
                      className="pl-10 bg-background border-border py-6"
                      autoFocus
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Por exemplo: meusite.com.br ou www.meusite.com.br
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-green-500" />
                    WhatsApp para notificações
                    <span className="text-xs text-muted-foreground font-normal">(opcional)</span>
                  </label>
                  <div className="relative">
                    <Input
                      placeholder="5511999999999"
                      value={newDomainWhatsApp}
                      onChange={(e) => setNewDomainWhatsApp(e.target.value.replace(/\D/g, ''))}
                      className="bg-background border-border py-6"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Receba notificações de novos agendamentos neste número
                  </p>
                </div>

                <Button 
                  onClick={handleConnectDomain}
                  disabled={!newDomain.trim()}
                  className="w-full py-6 text-base"
                >
                  Conectar domínio
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
                    Configurando seu domínio
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
                    Domínio analisado!
                  </h3>
                    <p className="text-sm text-muted-foreground">
                      {DNS_PROVIDERS[detectedProvider]?.supportsAuto ? (
                        <>
                          Detectamos que seu DNS está no{" "}
                          <span className="font-medium text-foreground">
                            {DNS_PROVIDERS[detectedProvider]?.name}
                          </span>
                          . Podemos configurar tudo automaticamente — você não precisa criar registros A/TXT manualmente.
                        </>
                      ) : (
                        <>
                          Agora vamos te mostrar os registros DNS que você precisa adicionar no painel do seu provedor.
                        </>
                      )}
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

                  <div className="space-y-4">
                    {DNS_PROVIDERS[detectedProvider]?.supportsAuto ? (
                      <>
                        <div className="space-y-2">
                          <Button
                            onClick={() => handleConfirmSetup(true)}
                            disabled={isAuthorizingDNS || isAdding}
                            className="w-full py-6 text-base"
                          >
                            <Zap className="h-4 w-4 mr-2" />
                            Configurar automaticamente
                          </Button>
                          <p className="text-xs text-center text-muted-foreground">
                            Vamos solicitar uma credencial de API e configurar os registros no seu provedor.
                          </p>
                        </div>

                        <div className="text-center">
                          <Button
                            variant="link"
                            onClick={handleApproximatedSetup}
                            disabled={isAuthorizingDNS || isAdding}
                            className="text-xs"
                          >
                            Prefiro configurar manualmente
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-2">
                        <Button
                          onClick={handleApproximatedSetup}
                          disabled={isAuthorizingDNS || isAdding}
                          className="w-full py-6 text-base"
                        >
                          {isAuthorizingDNS ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Globe className="h-4 w-4 mr-2" />
                          )}
                          Ver registros DNS
                        </Button>
                        <p className="text-xs text-center text-muted-foreground">
                          Vamos mostrar os registros (A e TXT) para você adicionar no painel do seu provedor de DNS.
                        </p>
                      </div>
                    )}
                  </div>
              </div>
            )}

            {/* Step: Auto Setup for supported providers */}
            {setupStep === "auto-setup" && (
              <div className="p-0 max-h-[80vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-primary" />
                    <span className="font-medium text-foreground">
                      Configurar {DNS_PROVIDERS[detectedProvider]?.name ?? "DNS"}
                    </span>
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
                      Configurar DNS automaticamente
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Informe suas credenciais de API. Vamos criar/atualizar os registros DNS necessários.
                    </p>
                  </div>

                  {/* Provider-specific credentials */}
                  <div className="rounded-lg border border-border p-4 space-y-4">
                    {detectedProvider === "cloudflare" && (
                      <>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium text-foreground">Token de API</p>
                            <Button
                              type="button"
                              variant="link"
                              className="h-auto p-0 text-xs"
                              onClick={() => window.open("https://dash.cloudflare.com/profile/api-tokens", "_blank")}
                            >
                              Criar token <ExternalLink className="h-3 w-3 ml-1" />
                            </Button>
                          </div>
                          <Input
                            type="password"
                            value={providerCredentials.apiToken ?? ""}
                            onChange={(e) => setProviderCredentials(prev => ({ ...prev, apiToken: e.target.value }))}
                            placeholder="Cole aqui seu token de API"
                          />
                          <p className="text-xs text-muted-foreground">
                            Crie um token com permissões de <span className="font-medium">Zone.DNS Edit</span> para seu domínio.
                          </p>
                        </div>

                        {/* Alternative: Migrate to managed Cloudflare */}
                        <div className="pt-4 border-t border-border">
                          <div className="rounded-lg bg-muted/50 p-4 space-y-3">
                            <div className="flex items-start gap-3">
                              <Cloud className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                              <div className="space-y-1">
                                <p className="text-sm font-medium text-foreground">Não tem token de API?</p>
                                <p className="text-xs text-muted-foreground">
                                  Podemos gerenciar seu domínio no nosso Cloudflare. Você precisará alterar os nameservers no seu registrador.
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleMigrateToCloudflare}
                              disabled={isMigratingToCloudflare}
                              className="w-full"
                            >
                              {isMigratingToCloudflare ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  Migrando...
                                </>
                              ) : (
                                <>
                                  <ArrowRight className="h-4 w-4 mr-2" />
                                  Migrar para Cloudflare gerenciado
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </>
                    )}

                    {detectedProvider === "godaddy" && (
                      <>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium text-foreground">API Key</p>
                            <Button
                              type="button"
                              variant="link"
                              className="h-auto p-0 text-xs"
                              onClick={() => window.open("https://developer.godaddy.com/keys", "_blank")}
                            >
                              Obter credenciais <ExternalLink className="h-3 w-3 ml-1" />
                            </Button>
                          </div>
                          <Input
                            type="password"
                            value={providerCredentials.apiKey ?? ""}
                            onChange={(e) => setProviderCredentials(prev => ({ ...prev, apiKey: e.target.value }))}
                            placeholder="API Key"
                          />
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-foreground">API Secret</p>
                          <Input
                            type="password"
                            value={providerCredentials.apiSecret ?? ""}
                            onChange={(e) => setProviderCredentials(prev => ({ ...prev, apiSecret: e.target.value }))}
                            placeholder="API Secret"
                          />
                        </div>
                      </>
                    )}

                    {detectedProvider === "namecheap" && (
                      <>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium text-foreground">API User</p>
                            <Button
                              type="button"
                              variant="link"
                              className="h-auto p-0 text-xs"
                              onClick={() => window.open("https://ap.www.namecheap.com/settings/tools/apiaccess/", "_blank")}
                            >
                              Obter credenciais <ExternalLink className="h-3 w-3 ml-1" />
                            </Button>
                          </div>
                          <Input
                            type="text"
                            value={providerCredentials.apiUser ?? ""}
                            onChange={(e) => setProviderCredentials(prev => ({ ...prev, apiUser: e.target.value }))}
                            placeholder="Seu nome de usuário Namecheap"
                          />
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-foreground">API Key</p>
                          <Input
                            type="password"
                            value={providerCredentials.apiKey ?? ""}
                            onChange={(e) => setProviderCredentials(prev => ({ ...prev, apiKey: e.target.value }))}
                            placeholder="API Key"
                          />
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-foreground">Seu IP Público</p>
                          <Input
                            type="text"
                            value={providerCredentials.clientIp ?? ""}
                            onChange={(e) => setProviderCredentials(prev => ({ ...prev, clientIp: e.target.value }))}
                            placeholder="Ex: 189.123.45.67"
                          />
                          <p className="text-xs text-muted-foreground">
                            Namecheap exige que você autorize seu IP. <a href="https://api.ipify.org" target="_blank" rel="noopener noreferrer" className="underline">Descobrir meu IP</a>
                          </p>
                        </div>
                      </>
                    )}

                    {detectedProvider === "hostinger" && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium text-foreground">Token de API</p>
                          <Button
                            type="button"
                            variant="link"
                            className="h-auto p-0 text-xs"
                            onClick={() => window.open("https://hpanel.hostinger.com/api-tokens", "_blank")}
                          >
                            Criar token <ExternalLink className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                        <Input
                          type="password"
                          value={providerCredentials.apiToken ?? ""}
                          onChange={(e) => setProviderCredentials(prev => ({ ...prev, apiToken: e.target.value }))}
                          placeholder="Cole aqui seu token de API"
                        />
                        <p className="text-xs text-muted-foreground">
                          Gere um token com permissões de <span className="font-medium">DNS</span> no painel da Hostinger.
                        </p>
                      </div>
                    )}

                    {detectedProvider === "digitalocean" && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium text-foreground">Token de API</p>
                          <Button
                            type="button"
                            variant="link"
                            className="h-auto p-0 text-xs"
                            onClick={() => window.open("https://cloud.digitalocean.com/account/api/tokens", "_blank")}
                          >
                            Criar token <ExternalLink className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                        <Input
                          type="password"
                          value={providerCredentials.apiToken ?? ""}
                          onChange={(e) => setProviderCredentials(prev => ({ ...prev, apiToken: e.target.value }))}
                          placeholder="Cole aqui seu token de API"
                        />
                        <p className="text-xs text-muted-foreground">
                          Crie um token com permissões de <span className="font-medium">Write</span> no painel DigitalOcean.
                        </p>
                      </div>
                    )}

                    {detectedProvider === "vercel" && (
                      <>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium text-foreground">Token de API</p>
                            <Button
                              type="button"
                              variant="link"
                              className="h-auto p-0 text-xs"
                              onClick={() => window.open("https://vercel.com/account/tokens", "_blank")}
                            >
                              Criar token <ExternalLink className="h-3 w-3 ml-1" />
                            </Button>
                          </div>
                          <Input
                            type="password"
                            value={providerCredentials.apiToken ?? ""}
                            onChange={(e) => setProviderCredentials(prev => ({ ...prev, apiToken: e.target.value }))}
                            placeholder="Cole aqui seu token de API"
                          />
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-foreground">Team ID (opcional)</p>
                          <Input
                            type="text"
                            value={providerCredentials.teamId ?? ""}
                            onChange={(e) => setProviderCredentials(prev => ({ ...prev, teamId: e.target.value }))}
                            placeholder="team_xxxxx (deixe vazio para conta pessoal)"
                          />
                          <p className="text-xs text-muted-foreground">
                            Informe o Team ID se o domínio pertence a uma equipe.
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Records to be added */}
                  <div className="space-y-3">
                    <p className="text-sm text-foreground">
                      Vamos adicionar/atualizar os seguintes registros para <span className="font-semibold">{newDomain}</span>
                    </p>

                    <div className="rounded-lg border border-border overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tipo</th>
                            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nome</th>
                            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Conteúdo</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          <tr className="bg-background">
                            <td className="px-4 py-3 font-semibold text-foreground">A</td>
                            <td className="px-4 py-3 text-muted-foreground">@ (root)</td>
                            <td className="px-4 py-3 font-mono text-muted-foreground">{TARGET_IP}</td>
                          </tr>
                          <tr className="bg-background">
                            <td className="px-4 py-3 font-semibold text-foreground">A</td>
                            <td className="px-4 py-3 text-muted-foreground">www</td>
                            <td className="px-4 py-3 font-mono text-muted-foreground">{TARGET_IP}</td>
                          </tr>
                          <tr className="bg-background">
                            <td className="px-4 py-3 font-semibold text-foreground">TXT</td>
                            <td className="px-4 py-3 text-muted-foreground">_acolheaqui</td>
                            <td className="px-4 py-3 font-mono text-xs text-muted-foreground break-all">
                              acolheaqui_verify={plannedVerificationToken ?? "…"}
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
                          Alguns registros A atuais apontam para outro IP. Vamos atualizá-los.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex items-center gap-3 pt-4 border-t border-border">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => setSetupStep("provider-detected")}
                      disabled={isAuthorizingDNS || isMigratingToCloudflare}
                    >
                      Cancelar
                    </Button>

                    <Button
                      type="button"
                      onClick={handleAutoSetup}
                      disabled={isAuthorizingDNS}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      {isAuthorizingDNS ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Configurando...
                        </>
                      ) : (
                        "Autorizar e configurar"
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

                <div className="text-xs text-muted-foreground space-y-2">
                  <p>
                    <strong>Importante:</strong> remova registros conflitantes (A/AAAA/CNAME) para <span className="font-mono">@</span> e <span className="font-mono">www</span> antes de adicionar os novos.
                  </p>
                  <p>
                    Se o seu provedor tiver modo <strong>Proxy/CDN</strong> para o registro DNS, deixe desativado durante a verificação (modo <strong>DNS only</strong>).
                  </p>
                  <p>
                    A propagação de DNS pode levar até 48 horas.
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

            {/* Step: Cloudflare Migration - Shows nameservers to configure */}
            {setupStep === "cloudflare-migration" && (
              <div className="p-8 space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#F6821F]/10 flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8 text-[#F6821F]" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Domínio adicionado ao Cloudflare!
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Seu domínio foi adicionado e os registros DNS foram configurados automaticamente.
                    <br />
                    <strong>Último passo:</strong> atualize os nameservers no seu registrador.
                  </p>
                </div>

                {/* Why Cloudflare info box */}
                <div className="bg-[#F6821F]/5 border border-[#F6821F]/20 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-[#F6821F] font-medium">
                    <Shield className="h-4 w-4" />
                    Por que usar Cloudflare?
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
                    <li>SSL/HTTPS gratuito e automático</li>
                    <li>Proteção contra ataques DDoS</li>
                    <li>CDN global para carregamento mais rápido</li>
                    <li>Configuração simplificada</li>
                  </ul>
                </div>

                {/* Nameservers section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    Configure estes nameservers no seu registrador:
                  </div>

                  <div className="rounded-lg border border-border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left px-3 py-2 font-medium text-muted-foreground">Nameserver</th>
                          <th className="w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {cloudflareNameservers.map((ns, index) => (
                          <tr key={index} className="bg-background">
                            <td className="px-3 py-2 font-mono text-xs text-foreground">{ns}</td>
                            <td className="px-3 py-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(ns, `ns-${index}`)}
                              >
                                {copiedField === `ns-${index}` ? (
                                  <Check className="h-3 w-3 text-green-500" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Instructions for common registrars */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-foreground">
                    Como alterar os nameservers:
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary shrink-0">
                        1
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Acesse o painel do seu registrador (onde você comprou o domínio)
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary shrink-0">
                        2
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Procure por "Nameservers", "DNS" ou "Servidores de nome"
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary shrink-0">
                        3
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Substitua os nameservers atuais pelos listados acima
                      </div>
                    </div>
                  </div>
                </div>

                {/* Provider-specific links */}
                {detectedProvider && DNS_PROVIDERS[detectedProvider] && (
                  <div className="text-center">
                    <Button
                      variant="link"
                      className="text-primary"
                      onClick={() => window.open(DNS_PROVIDERS[detectedProvider].url, "_blank")}
                    >
                      Abrir painel do {DNS_PROVIDERS[detectedProvider].name}
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                )}

                <div className="text-xs text-muted-foreground space-y-1 text-center">
                  <p>
                    <strong>Importante:</strong> A propagação de nameservers pode levar até 48 horas.
                  </p>
                  <p>
                    Assim que os nameservers forem propagados, seu domínio estará ativo automaticamente.
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
                          {domain.notification_whatsapp && (
                            <Badge variant="secondary" className="text-xs">
                              <MessageCircle className="h-3 w-3 mr-1" />
                              WhatsApp
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
                        <div className="relative">
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
                          
                          {/* Progress Indicator Popup */}
                          {isVerifying && verificationProgress && (
                            <div className="absolute top-full right-0 mt-2 z-50 w-72 bg-background border border-border rounded-lg shadow-lg p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-foreground">Verificando domínio</span>
                                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                </div>
                                
                                <div className="space-y-2">
                                  {verificationProgress.steps.map((step, index) => (
                                    <div key={step.label} className="flex items-center gap-2">
                                      <div className={`
                                        w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300
                                        ${step.status === 'done' ? 'bg-green-500 text-white' : ''}
                                        ${step.status === 'loading' ? 'bg-primary text-primary-foreground animate-pulse' : ''}
                                        ${step.status === 'pending' ? 'bg-muted text-muted-foreground' : ''}
                                        ${step.status === 'error' ? 'bg-destructive text-destructive-foreground' : ''}
                                      `}>
                                        {step.status === 'done' ? (
                                          <Check className="h-3 w-3" />
                                        ) : step.status === 'loading' ? (
                                          <Loader2 className="h-3 w-3 animate-spin" />
                                        ) : step.status === 'error' ? (
                                          <X className="h-3 w-3" />
                                        ) : (
                                          <span>{index + 1}</span>
                                        )}
                                      </div>
                                      <span className={`text-sm transition-colors duration-300 ${
                                        step.status === 'done' ? 'text-green-600 dark:text-green-400' :
                                        step.status === 'loading' ? 'text-foreground font-medium' :
                                        step.status === 'error' ? 'text-destructive' :
                                        'text-muted-foreground'
                                      }`}>
                                        {step.label}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                                
                                <div className="pt-2 border-t border-border">
                                  <p className="text-xs text-muted-foreground">{verificationProgress.message}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
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
                        <Dialog 
                          open={deletingDomainId === domain.id} 
                          onOpenChange={(open) => {
                            if (!open) {
                              setDeletingDomainId(null);
                              setDeleteCloudflareToken("");
                              setDeleteCleanupFailed(false);
                              setDeleteCleanupError(null);
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1.5 text-destructive border-destructive/20 hover:bg-destructive/10 hover:border-destructive/30"
                              onClick={() => setDeletingDomainId(domain.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="hidden sm:inline">Remover</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>Remover domínio?</DialogTitle>
                              <DialogDescription>
                                O domínio <strong>{domain.domain}</strong> será desconectado permanentemente.
                                {domain.is_primary && " Um novo domínio primário será selecionado automaticamente."}
                              </DialogDescription>
                            </DialogHeader>
                            
                            {/* Show cleanup failed message and optional token field */}
                            {deleteCleanupFailed && (
                              <div className="space-y-4 py-2">
                                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                                  <div className="flex items-start gap-2">
                                    <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                                    <div className="space-y-1">
                                      <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                                        Limpeza automática de DNS falhou
                                      </p>
                                      {deleteCleanupError && (
                                        <p className="text-xs text-muted-foreground">
                                          {deleteCleanupError}
                                        </p>
                                      )}
                                      <p className="text-xs text-muted-foreground">
                                        Você pode fornecer seu token Cloudflare para remover os registros automaticamente, 
                                        ou continuar sem limpeza (você precisará remover os registros DNS manualmente).
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                                    <Cloud className="h-4 w-4 text-muted-foreground" />
                                    Token Cloudflare (opcional)
                                  </label>
                                  <Input
                                    type="password"
                                    value={deleteCloudflareToken}
                                    onChange={(e) => setDeleteCloudflareToken(e.target.value)}
                                    placeholder="Cole seu token de API Cloudflare aqui"
                                    className="font-mono text-sm"
                                  />
                                  <p className="text-xs text-muted-foreground">
                                    Obtenha em{" "}
                                    <a 
                                      href="https://dash.cloudflare.com/profile/api-tokens" 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-primary hover:underline"
                                    >
                                      dash.cloudflare.com/profile/api-tokens
                                    </a>
                                  </p>
                                </div>
                              </div>
                            )}
                            
                            <div className="flex justify-end gap-2 pt-2">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setDeletingDomainId(null);
                                  setDeleteCloudflareToken("");
                                  setDeleteCleanupFailed(false);
                                  setDeleteCleanupError(null);
                                }}
                                disabled={isDeletingDomain}
                              >
                                Cancelar
                              </Button>
                              
                              {deleteCleanupFailed ? (
                                <>
                                  {deleteCloudflareToken.trim() ? (
                                    <Button
                                      onClick={() => handleDeleteDomain(domain.id, deleteCloudflareToken)}
                                      disabled={isDeletingDomain}
                                      className="bg-primary hover:bg-primary/90"
                                    >
                                      {isDeletingDomain ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                      ) : null}
                                      Tentar novamente com token
                                    </Button>
                                  ) : (
                                    <Button
                                      onClick={() => handleForceDeleteDomain(domain.id)}
                                      disabled={isDeletingDomain}
                                      className="bg-destructive hover:bg-destructive/90"
                                    >
                                      {isDeletingDomain ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                      ) : null}
                                      Remover sem limpeza DNS
                                    </Button>
                                  )}
                                </>
                              ) : (
                                <Button
                                  onClick={() => handleDeleteDomain(domain.id)}
                                  disabled={isDeletingDomain}
                                  className="bg-destructive hover:bg-destructive/90"
                                >
                                  {isDeletingDomain ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  ) : null}
                                  Remover
                                </Button>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>

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

                              {/* WhatsApp Notification Option */}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleOpenWhatsAppConfig(domain)}>
                                <MessageCircle className="h-4 w-4 mr-2 text-primary" />
                                {domain.notification_whatsapp ? "Editar WhatsApp" : "Notificar via WhatsApp"}
                                {domain.notification_whatsapp && (
                                  <Check className="h-3 w-3 ml-auto text-primary" />
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}

                        {/* WhatsApp Config Dialog */}
                        {editingWhatsAppDomainId === domain.id && (
                          <Dialog open={true} onOpenChange={(open) => !open && setEditingWhatsAppDomainId(null)}>
                            <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <MessageCircle className="h-5 w-5 text-primary" />
                                  Notificações por WhatsApp
                                </DialogTitle>
                                <DialogDescription>
                                  Receba uma notificação no WhatsApp quando o status do domínio <strong>{domain.domain}</strong> mudar (ativado, falhou ou offline).
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                                    <Bell className="h-4 w-4 text-muted-foreground" />
                                    Número do WhatsApp
                                  </label>
                                  <Input
                                    type="tel"
                                    value={whatsAppNumber}
                                    onChange={(e) => setWhatsAppNumber(e.target.value)}
                                    placeholder="(11) 99999-9999"
                                    className="font-mono"
                                  />
                                  <p className="text-xs text-muted-foreground">
                                    Informe o número com DDD. Deixe vazio para desativar notificações por WhatsApp.
                                  </p>
                                </div>

                                {domain.notification_whatsapp && (
                                  <div className="flex items-center gap-2 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                                    <CheckCircle2 className="h-4 w-4 text-primary" />
                                    <span className="text-sm text-foreground">
                                      Notificações ativas para: <span className="font-mono">{domain.notification_whatsapp}</span>
                                    </span>
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() => setEditingWhatsAppDomainId(null)}
                                  disabled={isSavingWhatsApp}
                                >
                                  Cancelar
                                </Button>
                                <Button
                                  onClick={handleSaveWhatsAppNumber}
                                  disabled={isSavingWhatsApp}
                                >
                                  {isSavingWhatsApp ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  ) : (
                                    <Save className="h-4 w-4 mr-2" />
                                  )}
                                  Salvar
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
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
              <p>Escolha a <strong>configuração automática via Cloudflare</strong> e siga as instruções para apontar os nameservers do seu registrador</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium shrink-0">3</span>
              <p>Após a propagação dos nameservers (geralmente algumas horas), os registros DNS e SSL serão configurados automaticamente</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium shrink-0">4</span>
              <p>Você receberá um email quando seu domínio estiver ativo e funcionando</p>
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
