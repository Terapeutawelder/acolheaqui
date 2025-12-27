import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { LogOut, CreditCard, Calendar, Clock, LayoutDashboard } from "lucide-react";
import Logo from "@/components/Logo";
import DashboardOverview from "@/components/dashboard/DashboardOverview";
import PaymentGatewayConfig from "@/components/dashboard/PaymentGatewayConfig";
import AvailableHoursConfig from "@/components/dashboard/AvailableHoursConfig";
import AppointmentsHistory from "@/components/dashboard/AppointmentsHistory";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileId, setProfileId] = useState<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session?.user) {
        navigate("/auth");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session?.user) {
        navigate("/auth");
      } else {
        fetchProfile(session.user.id);
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (data) {
      setProfileId(data.id);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logout realizado com sucesso");
    navigate("/auth");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pro-theme flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !profileId) {
    return null;
  }

  return (
    <div className="min-h-screen pro-theme">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user.email}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-border text-foreground hover:bg-muted"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Dashboard do Profissional</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie seus agendamentos, pagamentos e horários disponíveis
          </p>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-muted mb-8">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Visão Geral</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Pagamentos</span>
            </TabsTrigger>
            <TabsTrigger value="hours" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Horários</span>
            </TabsTrigger>
            <TabsTrigger value="appointments" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Agendamentos</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <DashboardOverview profileId={profileId} />
          </TabsContent>

          <TabsContent value="payments">
            <PaymentGatewayConfig profileId={profileId} />
          </TabsContent>

          <TabsContent value="hours">
            <AvailableHoursConfig profileId={profileId} />
          </TabsContent>

          <TabsContent value="appointments">
            <AppointmentsHistory profileId={profileId} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
