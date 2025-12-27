import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, CreditCard, TrendingUp } from "lucide-react";

interface DashboardOverviewProps {
  profileId: string;
}

interface Stats {
  totalAppointments: number;
  pendingAppointments: number;
  completedAppointments: number;
  totalRevenue: number;
}

const DashboardOverview = ({ profileId }: DashboardOverviewProps) => {
  const [stats, setStats] = useState<Stats>({
    totalAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
    totalRevenue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [profileId]);

  const fetchStats = async () => {
    try {
      const { data: appointments, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("professional_id", profileId);

      if (error) throw error;

      const total = appointments?.length || 0;
      const pending = appointments?.filter(a => a.status === "pending" || a.status === "confirmed").length || 0;
      const completed = appointments?.filter(a => a.status === "completed").length || 0;
      const revenue = appointments
        ?.filter(a => a.payment_status === "paid")
        .reduce((sum, a) => sum + (a.amount_cents || 0), 0) || 0;

      setStats({
        totalAppointments: total,
        pendingAppointments: pending,
        completedAppointments: completed,
        totalRevenue: revenue / 100,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const statsCards = [
    {
      title: "Total de Agendamentos",
      value: stats.totalAppointments,
      icon: Calendar,
      description: "Todos os agendamentos",
    },
    {
      title: "Pendentes/Confirmados",
      value: stats.pendingAppointments,
      icon: Clock,
      description: "Aguardando atendimento",
    },
    {
      title: "Concluídos",
      value: stats.completedAppointments,
      icon: TrendingUp,
      description: "Sessões realizadas",
    },
    {
      title: "Receita Total",
      value: `R$ ${stats.totalRevenue.toFixed(2).replace(".", ",")}`,
      icon: CreditCard,
      description: "Pagamentos recebidos",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-card border-border animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-muted rounded w-24"></div>
              <div className="h-4 w-4 bg-muted rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-16 mb-2"></div>
              <div className="h-3 bg-muted rounded w-32"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((card, index) => (
          <Card key={index} className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <card.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Bem-vindo ao seu Dashboard!</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          <p className="mb-4">
            Aqui você pode gerenciar todos os aspectos do seu atendimento online:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li><strong>Pagamentos:</strong> Configure seus métodos de recebimento (PIX, cartão de crédito)</li>
            <li><strong>Horários:</strong> Defina sua disponibilidade semanal</li>
            <li><strong>Agendamentos:</strong> Acompanhe o histórico de sessões e pagamentos</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardOverview;
