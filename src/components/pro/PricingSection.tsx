import { Check, Star, Sparkles } from "lucide-react";
import { useState } from "react";

type BillingPeriod = "monthly" | "semiannual" | "annual";

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  name: string;
  icon: React.ElementType;
  description: string;
  prices: {
    monthly: number;
    semiannual: number;
    annual: number;
  };
  features: PlanFeature[];
  popular?: boolean;
}

const plans: Plan[] = [
  {
    name: "Plano Pro",
    icon: Star,
    description: "Ideal para começar sua jornada na plataforma",
    prices: {
      monthly: 147,
      semiannual: 597,
      annual: 997,
    },
    features: [
      { text: "Perfil na plataforma Mindset", included: true },
      { text: "Acesso a CRM com agenda", included: true },
      { text: "Controle financeiro", included: true },
      { text: "Integração com WhatsApp", included: false },
      { text: "Integração com Google Agenda", included: false },
      { text: "Agente de IA de agendamento", included: false },
    ],
  },
  {
    name: "Plano Premium",
    icon: Sparkles,
    description: "Recursos completos para profissionais que querem crescer",
    prices: {
      monthly: 247,
      semiannual: 997,
      annual: 1497,
    },
    features: [
      { text: "Perfil na plataforma Mindset", included: true },
      { text: "Acesso a CRM completo", included: true },
      { text: "Integração com WhatsApp", included: true },
      { text: "Integração com Google Agenda e Meet", included: true },
      { text: "Agente de IA de agendamento", included: true },
      { text: "Notificações de agendamentos no WhatsApp", included: true },
      { text: "Agente de IA do Instagram", included: true },
      { text: "Agente de IA Follow-up", included: true },
      { text: "Controle financeiro avançado", included: true },
    ],
    popular: true,
  },
];

const billingLabels: Record<BillingPeriod, string> = {
  monthly: "Mensal",
  semiannual: "Semestral",
  annual: "Anual",
};

const PricingSection = () => {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("monthly");

  const formatPrice = (price: number) => {
    return price.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    });
  };

  const getPeriodLabel = (period: BillingPeriod) => {
    switch (period) {
      case "monthly":
        return "/mês";
      case "semiannual":
        return "/semestre";
      case "annual":
        return "/ano";
    }
  };

  const getDiscount = (plan: Plan, period: BillingPeriod) => {
    if (period === "monthly") return null;
    const monthlyTotal = plan.prices.monthly * (period === "semiannual" ? 6 : 12);
    const periodPrice = plan.prices[period];
    const discount = Math.round(((monthlyTotal - periodPrice) / monthlyTotal) * 100);
    return discount > 0 ? discount : null;
  };

  return (
    <section id="precos" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Title */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Plano e preço
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Escolha o plano ideal para sua prática profissional
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-card border border-border rounded-full p-1">
            {(["monthly", "semiannual", "annual"] as BillingPeriod[]).map((period) => (
              <button
                key={period}
                onClick={() => setBillingPeriod(period)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  billingPeriod === period
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {billingLabels[period]}
              </button>
            ))}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => {
            const discount = getDiscount(plan, billingPeriod);
            
            return (
              <div
                key={index}
                className={`relative p-8 rounded-3xl border-2 transition-all ${
                  plan.popular
                    ? "border-primary bg-card shadow-2xl shadow-primary/10"
                    : "border-border bg-card hover:border-primary/50"
                }`}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-sm font-semibold px-4 py-1 rounded-full">
                      Mais popular
                    </span>
                  </div>
                )}

                {/* Plan header */}
                <div className="text-center mb-8">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                    plan.popular ? "bg-primary/20" : "bg-muted"
                  }`}>
                    <plan.icon className={`w-8 h-8 ${plan.popular ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="text-center mb-8">
                  {discount && (
                    <div className="mb-2">
                      <span className="bg-green-500/20 text-green-500 text-sm font-semibold px-3 py-1 rounded-full">
                        {discount}% OFF
                      </span>
                    </div>
                  )}
                  <div className="flex items-end justify-center gap-1">
                    <span className="text-4xl md:text-5xl font-bold">
                      {formatPrice(plan.prices[billingPeriod])}
                    </span>
                    <span className="text-muted-foreground mb-2">
                      {getPeriodLabel(billingPeriod)}
                    </span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        feature.included ? "bg-primary/20" : "bg-muted"
                      }`}>
                        <Check className={`w-3 h-3 ${
                          feature.included ? "text-primary" : "text-muted-foreground/50"
                        }`} />
                      </div>
                      <span className={feature.included ? "text-foreground" : "text-muted-foreground line-through"}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <a
                  href="https://wa.me/5511999999999?text=Olá! Tenho interesse no plano profissional Mindset"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block w-full py-4 text-center font-semibold rounded-full transition-all hover:scale-105 ${
                    plan.popular
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-muted text-foreground hover:bg-muted/80"
                  }`}
                >
                  Começar agora
                </a>
              </div>
            );
          })}
        </div>

        {/* Additional info */}
        <p className="text-center text-muted-foreground text-sm mt-8">
          Todos os planos incluem suporte via WhatsApp e atualizações gratuitas
        </p>
      </div>
    </section>
  );
};

export default PricingSection;
