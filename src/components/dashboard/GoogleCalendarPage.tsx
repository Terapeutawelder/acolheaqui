import { useState, useEffect } from "react";
import { 
  Calendar, 
  Video, 
  Check, 
  ExternalLink, 
  RefreshCw,
  Link2,
  Unlink,
  Clock,
  Users,
  Shield,
  Sparkles,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface GoogleCalendarPageProps {
  profileId: string;
}

interface GoogleSettings {
  id?: string;
  is_connected: boolean;
  google_email: string | null;
  sync_enabled: boolean;
  auto_create_meet: boolean;
  sync_direction: 'one_way' | 'two_way';
  last_sync_at: string | null;
}

const GoogleCalendarPage = ({ profileId }: GoogleCalendarPageProps) => {
  const [settings, setSettings] = useState<GoogleSettings>({
    is_connected: false,
    google_email: null,
    sync_enabled: true,
    auto_create_meet: true,
    sync_direction: 'two_way',
    last_sync_at: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [profileId]);

  const fetchSettings = async () => {
    try {
      // Check if profile has google settings stored (this would be in a future table)
      // For now, we'll simulate the initial state
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching Google settings:", error);
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    
    // Open Google OAuth flow
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          scopes: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events',
          redirectTo: `${window.location.origin}/dashboard?tab=google`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
      
    } catch (error: any) {
      console.error("Error connecting to Google:", error);
      toast.error("Erro ao conectar com Google. Tente novamente.");
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setSettings({
        ...settings,
        is_connected: false,
        google_email: null,
        last_sync_at: null,
      });
      toast.success("Conta Google desconectada com sucesso");
    } catch (error) {
      toast.error("Erro ao desconectar conta Google");
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      // Simulate sync
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSettings({
        ...settings,
        last_sync_at: new Date().toISOString(),
      });
      toast.success("Sincronização concluída com sucesso!");
    } catch (error) {
      toast.error("Erro ao sincronizar agenda");
    } finally {
      setIsSyncing(false);
    }
  };

  const updateSettings = (key: keyof GoogleSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const features = [
    {
      icon: Calendar,
      title: "Sincronização Automática",
      description: "Agendamentos sincronizam automaticamente com seu Google Agenda"
    },
    {
      icon: Video,
      title: "Google Meet Automático",
      description: "Links de reunião criados automaticamente para cada consulta"
    },
    {
      icon: Clock,
      title: "Evite Conflitos",
      description: "Seus horários ocupados são bloqueados automaticamente"
    },
    {
      icon: Users,
      title: "Convites Automáticos",
      description: "Pacientes recebem convites do Google Agenda automaticamente"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary" />
            Google Agenda & Meet
          </h2>
          <p className="text-muted-foreground mt-1">
            Sincronize sua agenda e crie reuniões automaticamente
          </p>
        </div>
        
        {settings.is_connected && (
          <Button
            variant="outline"
            onClick={handleSync}
            disabled={isSyncing}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Sincronizando...' : 'Sincronizar Agora'}
          </Button>
        )}
      </div>

      {/* Connection Status Card */}
      <Card className="border-border/50 bg-card">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            {settings.is_connected ? (
              <>
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                Conta Conectada
              </>
            ) : (
              <>
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                Não Conectado
              </>
            )}
          </CardTitle>
          <CardDescription>
            {settings.is_connected 
              ? `Conectado como ${settings.google_email}`
              : 'Conecte sua conta Google para sincronizar sua agenda'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {settings.is_connected ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
                    <img 
                      src="https://www.gstatic.com/images/branding/product/1x/calendar_48dp.png" 
                      alt="Google Calendar" 
                      className="w-6 h-6"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{settings.google_email}</p>
                    <p className="text-sm text-muted-foreground">
                      {settings.last_sync_at 
                        ? `Última sync: ${new Date(settings.last_sync_at).toLocaleString('pt-BR')}`
                        : 'Aguardando primeira sincronização'
                      }
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDisconnect}
                  className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Unlink className="w-4 h-4" />
                  Desconectar
                </Button>
              </div>
            </div>
          ) : (
            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full gap-3 h-14 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300"
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Conectando...
                </>
              ) : (
                <>
                  <img 
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                    alt="Google" 
                    className="w-5 h-5"
                  />
                  Conectar com Google
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((feature, index) => (
          <Card key={index} className="border-border/50 bg-card hover:border-primary/30 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Settings */}
      {settings.is_connected && (
        <Card className="border-border/50 bg-card">
          <CardHeader>
            <CardTitle className="text-lg">Configurações de Sincronização</CardTitle>
            <CardDescription>
              Personalize como a integração funciona
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Sync Enabled */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Sincronização Ativa</Label>
                <p className="text-sm text-muted-foreground">
                  Sincronizar agendamentos automaticamente
                </p>
              </div>
              <Switch
                checked={settings.sync_enabled}
                onCheckedChange={(checked) => updateSettings('sync_enabled', checked)}
              />
            </div>

            {/* Auto Meet */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium flex items-center gap-2">
                  Criar Google Meet Automático
                  <Video className="w-4 h-4 text-blue-500" />
                </Label>
                <p className="text-sm text-muted-foreground">
                  Gerar link de reunião para cada agendamento
                </p>
              </div>
              <Switch
                checked={settings.auto_create_meet}
                onCheckedChange={(checked) => updateSettings('auto_create_meet', checked)}
              />
            </div>

            {/* Sync Direction */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Direção da Sincronização</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  onClick={() => updateSettings('sync_direction', 'one_way')}
                  className={`p-4 rounded-xl border transition-all text-left ${
                    settings.sync_direction === 'one_way'
                      ? 'border-primary bg-primary/10'
                      : 'border-border/50 hover:border-primary/30'
                  }`}
                >
                  <p className="font-medium text-foreground">AcolheAqui → Google</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Apenas exporta para o Google Agenda
                  </p>
                </button>
                <button
                  onClick={() => updateSettings('sync_direction', 'two_way')}
                  className={`p-4 rounded-xl border transition-all text-left ${
                    settings.sync_direction === 'two_way'
                      ? 'border-primary bg-primary/10'
                      : 'border-border/50 hover:border-primary/30'
                  }`}
                >
                  <p className="font-medium text-foreground flex items-center gap-2">
                    Bidirecional
                    <Sparkles className="w-4 h-4 text-primary" />
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Sincroniza nos dois sentidos
                  </p>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Privacidade e Segurança</p>
              <p className="text-sm text-muted-foreground mt-1">
                Utilizamos OAuth 2.0 do Google para autenticação segura. Não armazenamos suas credenciais 
                do Google. Você pode revogar o acesso a qualquer momento nas configurações da sua conta Google.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GoogleCalendarPage;
