import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  CreditCard,
  Loader2,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface FinancesPageProps {
  profileId: string;
}

interface MonthlyData {
  month: string;
  monthLabel: string;
  revenue: number;
  sessions: number;
}

interface PaymentMethodData {
  name: string;
  value: number;
  color: string;
}

type PeriodFilter = 3 | 6 | 12;

const periodOptions: { value: PeriodFilter; label: string }[] = [
  { value: 3, label: "Últimos 3 meses" },
  { value: 6, label: "Últimos 6 meses" },
  { value: 12, label: "Últimos 12 meses" },
];

const FinancesPage = ({ profileId }: FinancesPageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>(6);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodData[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalSessions: 0,
    averagePerSession: 0,
    currentMonthRevenue: 0,
    lastMonthRevenue: 0,
    growthPercentage: 0,
  });

  useEffect(() => {
    fetchFinancialData();
  }, [profileId, periodFilter]);

  const fetchFinancialData = async () => {
    try {
      const { data: appointments, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("professional_id", profileId)
        .eq("payment_status", "paid");

      if (error) throw error;

      // Process monthly data based on period filter
      const monthsData: MonthlyData[] = [];
      for (let i = periodFilter - 1; i >= 0; i--) {
        const date = subMonths(new Date(), i);
        const monthStart = startOfMonth(date);
        const monthEnd = endOfMonth(date);
        
        const monthAppointments = appointments?.filter(apt => {
          const aptDate = parseISO(apt.appointment_date);
          return aptDate >= monthStart && aptDate <= monthEnd;
        }) || [];

        const revenue = monthAppointments.reduce((sum, apt) => sum + (apt.amount_cents || 0), 0) / 100;
        
        monthsData.push({
          month: format(date, "yyyy-MM"),
          monthLabel: format(date, "MMM", { locale: ptBR }),
          revenue,
          sessions: monthAppointments.length,
        });
      }
      setMonthlyData(monthsData);

      // Calculate stats for selected period
      const periodStart = startOfMonth(subMonths(new Date(), periodFilter - 1));
      const periodAppointments = appointments?.filter(apt => {
        const aptDate = parseISO(apt.appointment_date);
        return aptDate >= periodStart;
      }) || [];

      const totalRevenue = periodAppointments.reduce((sum, apt) => sum + (apt.amount_cents || 0), 0) / 100;
      const totalSessions = periodAppointments.length;
      const averagePerSession = totalSessions > 0 ? totalRevenue / totalSessions : 0;

      const currentMonth = monthsData[monthsData.length - 1]?.revenue || 0;
      const lastMonth = monthsData[monthsData.length - 2]?.revenue || 0;
      const growthPercentage = lastMonth > 0 ? ((currentMonth - lastMonth) / lastMonth) * 100 : 0;

      setStats({
        totalRevenue,
        totalSessions,
        averagePerSession,
        currentMonthRevenue: currentMonth,
        lastMonthRevenue: lastMonth,
        growthPercentage,
      });

      // Payment methods breakdown
      const methodCounts: Record<string, number> = {};
      appointments?.forEach(apt => {
        const method = apt.payment_method || "Não informado";
        methodCounts[method] = (methodCounts[method] || 0) + (apt.amount_cents || 0) / 100;
      });

      const colors = ["hsl(262, 83%, 58%)", "hsl(145, 70%, 45%)", "hsl(200, 80%, 50%)", "hsl(45, 100%, 55%)"];
      const methods = Object.entries(methodCounts).map(([name, value], index) => ({
        name: name === "pix" ? "PIX" : name === "card" ? "Cartão" : name,
        value,
        color: colors[index % colors.length],
      }));
      setPaymentMethods(methods);

    } catch (error) {
      console.error("Error fetching financial data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const statsCards = [
    {
      title: "Receita Total",
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      gradient: "from-[hsl(200,80%,50%)] to-[hsl(200,80%,35%)]",
      shadowColor: "shadow-[0_8px_30px_hsl(200,80%,50%,0.3)]",
    },
    {
      title: "Este Mês",
      value: formatCurrency(stats.currentMonthRevenue),
      icon: Calendar,
      trend: stats.growthPercentage,
      gradient: "from-[hsl(145,70%,45%)] to-[hsl(145,70%,30%)]",
      shadowColor: "shadow-[0_8px_30px_hsl(145,70%,45%,0.3)]",
    },
    {
      title: "Total de Sessões",
      value: stats.totalSessions.toString(),
      icon: CreditCard,
      gradient: "from-[hsl(262,83%,58%)] to-[hsl(262,83%,45%)]",
      shadowColor: "shadow-[0_8px_30px_hsl(262,83%,58%,0.3)]",
    },
    {
      title: "Média por Sessão",
      value: formatCurrency(stats.averagePerSession),
      icon: TrendingUp,
      gradient: "from-[hsl(45,100%,55%)] to-[hsl(35,100%,45%)]",
      shadowColor: "shadow-[0_8px_30px_hsl(45,100%,55%,0.3)]",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Period Filter */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-lg font-semibold text-white">Relatório Financeiro</h2>
        <div className="inline-flex bg-[hsl(215,40%,15%)] border border-white/10 rounded-xl p-1">
          {periodOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setPeriodFilter(option.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                periodFilter === option.value
                  ? "bg-primary text-white"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((card, index) => (
          <div
            key={index}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.gradient} ${card.shadowColor} p-6 transition-transform hover:scale-[1.02]`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-white/80">{card.title}</p>
                <p className="text-2xl font-bold text-white mt-2">{card.value}</p>
              </div>
              <div className="p-2 bg-white/20 rounded-xl">
                <card.icon className="h-5 w-5 text-white" />
              </div>
            </div>
            {card.trend !== undefined && (
              <div className="mt-3 flex items-center gap-1">
                {card.trend >= 0 ? (
                  <ArrowUpRight className="h-4 w-4 text-white/80" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-white/80" />
                )}
                <span className="text-sm font-medium text-white/80">
                  {card.trend >= 0 ? "+" : ""}{card.trend.toFixed(1)}% vs mês anterior
                </span>
              </div>
            )}
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 rounded-2xl bg-[hsl(215,40%,12%)] border border-white/5 p-6">
          <h3 className="text-lg font-bold text-white mb-6">Receita Mensal</h3>
          
          {monthlyData.some(d => d.revenue > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(200, 80%, 50%)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="hsl(200, 80%, 50%)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="monthLabel" 
                  stroke="rgba(255,255,255,0.5)"
                  tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.5)"
                  tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                  tickFormatter={(value) => `R$${value}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(215, 40%, 15%)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: 'white',
                  }}
                  formatter={(value: number) => [formatCurrency(value), 'Receita']}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="hsl(200, 80%, 50%)" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px] text-white/50">
              <TrendingUp className="h-12 w-12 mb-4 opacity-30" />
              <p>Nenhum dado financeiro ainda</p>
              <p className="text-sm mt-1">Os dados aparecerão quando você receber pagamentos</p>
            </div>
          )}
        </div>

        {/* Payment Methods */}
        <div className="rounded-2xl bg-[hsl(215,40%,12%)] border border-white/5 p-6">
          <h3 className="text-lg font-bold text-white mb-6">Métodos de Pagamento</h3>
          
          {paymentMethods.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={paymentMethods}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {paymentMethods.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(215, 40%, 15%)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: 'white',
                    }}
                    formatter={(value: number) => [formatCurrency(value), '']}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              <div className="space-y-3 mt-4">
                {paymentMethods.map((method, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: method.color }}
                      />
                      <span className="text-sm text-white/70">{method.name}</span>
                    </div>
                    <span className="text-sm font-medium text-white">
                      {formatCurrency(method.value)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-[200px] text-white/50">
              <CreditCard className="h-10 w-10 mb-3 opacity-30" />
              <p className="text-sm">Sem dados de pagamento</p>
            </div>
          )}
        </div>
      </div>

      {/* Sessions per Month */}
      <div className="rounded-2xl bg-[hsl(215,40%,12%)] border border-white/5 p-6">
        <h3 className="text-lg font-bold text-white mb-6">Sessões por Mês</h3>
        
        {monthlyData.some(d => d.sessions > 0) ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="monthLabel" 
                stroke="rgba(255,255,255,0.5)"
                tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.5)"
                tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(215, 40%, 15%)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: 'white',
                }}
                formatter={(value: number) => [value, 'Sessões']}
              />
              <Bar 
                dataKey="sessions" 
                fill="hsl(262, 83%, 58%)" 
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-[250px] text-white/50">
            <Calendar className="h-12 w-12 mb-4 opacity-30" />
            <p>Nenhuma sessão registrada</p>
          </div>
        )}
      </div>

      {/* Monthly Breakdown Table */}
      <div className="rounded-2xl bg-[hsl(215,40%,12%)] border border-white/5 p-6">
        <h3 className="text-lg font-bold text-white mb-6">Resumo Mensal</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-sm font-medium text-white/60">Mês</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-white/60">Sessões</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-white/60">Receita</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-white/60">Média/Sessão</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((month, index) => (
                <tr 
                  key={index} 
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="py-4 px-4">
                    <span className="text-white font-medium capitalize">
                      {format(parseISO(`${month.month}-01`), "MMMM yyyy", { locale: ptBR })}
                    </span>
                  </td>
                  <td className="text-right py-4 px-4 text-white/70">
                    {month.sessions}
                  </td>
                  <td className="text-right py-4 px-4">
                    <span className="text-white font-medium">
                      {formatCurrency(month.revenue)}
                    </span>
                  </td>
                  <td className="text-right py-4 px-4 text-white/70">
                    {month.sessions > 0 
                      ? formatCurrency(month.revenue / month.sessions)
                      : "-"
                    }
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-white/5">
                <td className="py-4 px-4 font-bold text-white">Total</td>
                <td className="text-right py-4 px-4 font-bold text-white">
                  {stats.totalSessions}
                </td>
                <td className="text-right py-4 px-4 font-bold text-primary">
                  {formatCurrency(stats.totalRevenue)}
                </td>
                <td className="text-right py-4 px-4 font-bold text-white/70">
                  {formatCurrency(stats.averagePerSession)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FinancesPage;
