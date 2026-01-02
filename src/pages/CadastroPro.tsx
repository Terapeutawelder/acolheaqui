import { 
  MessageCircle, 
  Clock, 
  Star, 
  Quote, 
  ArrowLeft, 
  Calendar, 
  Users, 
  Shield, 
  CreditCard, 
  Video, 
  BarChart3, 
  Headphones, 
  Sparkles,
  CheckCircle,
  Zap,
  Globe,
  Bell,
  HelpCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "@/components/Logo";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Marquee from "@/components/Marquee";
import avatar1 from "@/assets/avatar-1.jpg";
import avatar2 from "@/assets/avatar-2.jpg";
import avatar3 from "@/assets/avatar-3.jpg";

const benefits = [
  {
    icon: Users,
    title: "Perfil Profissional",
    description: "Seu perfil completo visível para milhares de pacientes que buscam terapia online.",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: Calendar,
    title: "Agenda Inteligente",
    description: "CRM completo com agenda automatizada e controle de sessões.",
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: CreditCard,
    title: "Controle Financeiro",
    description: "Gerencie pagamentos, recebimentos e tenha relatórios detalhados.",
    color: "from-green-500 to-emerald-500"
  },
  {
    icon: Video,
    title: "Sala Virtual",
    description: "Atenda seus pacientes com nossa sala de videochamada integrada.",
    color: "from-orange-500 to-amber-500"
  },
  {
    icon: Shield,
    title: "Segurança Total",
    description: "Dados protegidos com criptografia e conformidade com a LGPD.",
    color: "from-red-500 to-rose-500"
  },
  {
    icon: Headphones,
    title: "Suporte Dedicado",
    description: "Equipe de suporte exclusiva para ajudar você sempre que precisar.",
    color: "from-indigo-500 to-violet-500"
  }
];

const highlights = [
  {
    icon: Zap,
    title: "Ativação Imediata",
    description: "Seu perfil fica ativo em até 24 horas após aprovação."
  },
  {
    icon: Globe,
    title: "Alcance Nacional",
    description: "Pacientes de todo o Brasil podem encontrar seu perfil."
  },
  {
    icon: Bell,
    title: "Notificações em Tempo Real",
    description: "Receba alertas de novos agendamentos e mensagens."
  },
  {
    icon: BarChart3,
    title: "Métricas e Insights",
    description: "Acompanhe seu desempenho com relatórios detalhados."
  }
];

const includedFeatures = [
  "Perfil profissional completo",
  "Agenda com CRM integrado",
  "Sala de videochamada",
  "Controle financeiro",
  "Notificações por WhatsApp",
  "Suporte prioritário",
  "Relatórios mensais",
  "Visibilidade nas buscas"
];

const faqs = [
  {
    question: "O que é o AcolheAqui?",
    answer: "O AcolheAqui é uma plataforma digital que conecta psicoterapeutas (psicólogos, psicanalistas e terapeutas) a pessoas em busca de terapia online. Cada profissional tem seu próprio perfil com informações sobre sua prática e um botão direto para contato via WhatsApp."
  },
  {
    question: "Como o paciente entra em contato comigo?",
    answer: "O contato é feito diretamente pelo WhatsApp, através do seu perfil na plataforma. O AcolheAqui não intermedeia conversas, agendamentos ou pagamentos — o vínculo é direto entre você e o paciente."
  },
  {
    question: "O que está incluso no Plano Pro?",
    answer: "O Plano Pro oferece: perfil profissional completo na plataforma, CRM com agenda integrada, sala de videochamada para atendimentos, controle financeiro, notificações por WhatsApp, suporte prioritário, relatórios mensais e visibilidade nas buscas."
  },
  {
    question: "Como funciona a exibição dos perfis?",
    answer: "Os perfis são exibidos conforme os filtros de busca usados pelos pacientes (como cidade, tipo de atendimento e abordagem). A ordem é organizada para dar visibilidade equilibrada a todos os profissionais."
  },
  {
    question: "Posso editar meu perfil depois de publicado?",
    answer: "Sim. Você pode editar suas informações, foto, bio, abordagens e outras informações do seu perfil a qualquer momento através do painel do profissional."
  },
  {
    question: "O AcolheAqui garante pacientes?",
    answer: "Não. O AcolheAqui não oferece garantia de quantidade de contatos ou pacientes. O número de pessoas que chegam até o seu perfil depende de fatores como região, tipo de atendimento, especialidade e momento da busca."
  },
  {
    question: "Quanto tempo leva para meu perfil ficar ativo?",
    answer: "Após a aprovação do cadastro, seu perfil fica ativo em até 24 horas. Você receberá uma notificação assim que estiver disponível para receber pacientes."
  },
  {
    question: "Posso cancelar a qualquer momento?",
    answer: "Sim, você pode cancelar sua assinatura a qualquer momento sem multas ou taxas adicionais. O acesso continua até o fim do período pago."
  }
];

const CadastroPro = () => {
  const navigate = useNavigate();
  const whatsappLink = "https://chat.whatsapp.com/KxbbUiKKg8v3f3FB89nCV1";
  const targetDate = new Date("2026-01-30T00:00:00").getTime();

  const calculateTimeLeft = () => {
    const now = new Date().getTime();
    const difference = targetDate - now;

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((difference % (1000 * 60)) / 1000),
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen pro-theme">
      {/* Fixed Header with Back Button */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => {
              if (window.history.length > 1) {
                navigate(-1);
              } else {
                navigate("/");
              }
            }}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Voltar</span>
          </button>
          <Logo className="h-8" />
          <div className="w-20" /> {/* Spacer for centering logo */}
        </div>
      </header>

      {/* Hero Section */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 py-20 pt-28"
        style={{
          backgroundImage: `url('/hero-bg-pro.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/50 to-background/75" />

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto">

          {/* Title */}
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight animate-fade-in-up">
            Comece sua jornada com o{" "}
            <span className="text-primary">Plano Pro</span> e atraia mais pacientes!
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-in-up animate-delay-100">
            Perfil na plataforma, CRM com agenda e controle financeiro para você começar com tudo.
          </p>

          {/* CTA Button */}
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 text-lg font-semibold bg-primary text-primary-foreground rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl animate-pulse-glow animate-fade-in-up animate-delay-200"
          >
            <MessageCircle className="w-6 h-6" />
            ENTRAR NO GRUPO DE ESPERA!
          </a>

          {/* Countdown Timer */}
          <div className="mt-8 animate-fade-in-up animate-delay-300">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-primary/10 border border-primary/30 rounded-full">
              <Clock className="w-5 h-5 text-primary animate-pulse" />
              <span className="text-foreground font-medium">Inscrições encerram em:</span>
            </div>
            <div className="mt-4 flex items-center justify-center gap-3 md:gap-4">
              <div className="flex flex-col items-center bg-background/50 backdrop-blur-sm border border-border/50 rounded-lg px-4 py-3 min-w-[70px]">
                <span className="text-2xl md:text-3xl font-bold text-primary">{timeLeft.days}</span>
                <span className="text-xs text-muted-foreground uppercase">Dias</span>
              </div>
              <span className="text-2xl font-bold text-primary">:</span>
              <div className="flex flex-col items-center bg-background/50 backdrop-blur-sm border border-border/50 rounded-lg px-4 py-3 min-w-[70px]">
                <span className="text-2xl md:text-3xl font-bold text-primary">{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="text-xs text-muted-foreground uppercase">Horas</span>
              </div>
              <span className="text-2xl font-bold text-primary">:</span>
              <div className="flex flex-col items-center bg-background/50 backdrop-blur-sm border border-border/50 rounded-lg px-4 py-3 min-w-[70px]">
                <span className="text-2xl md:text-3xl font-bold text-primary">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="text-xs text-muted-foreground uppercase">Min</span>
              </div>
              <span className="text-2xl font-bold text-primary">:</span>
              <div className="flex flex-col items-center bg-background/50 backdrop-blur-sm border border-border/50 rounded-lg px-4 py-3 min-w-[70px]">
                <span className="text-2xl md:text-3xl font-bold text-primary">{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span className="text-xs text-muted-foreground uppercase">Seg</span>
              </div>
            </div>
          </div>

          {/* Extra info */}
          <p className="mt-4 text-sm text-muted-foreground italic animate-fade-in-up animate-delay-400">
            <strong>Acesso prioritário</strong> • Benefícios exclusivos • Suporte dedicado
          </p>
        </div>
      </section>

      {/* Marquee */}
      <Marquee />

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              Benefícios Exclusivos
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 animate-fade-in">
              Tudo que você precisa no <span className="text-primary">Plano Pro</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto animate-fade-in">
              Ferramentas profissionais para impulsionar sua carreira como psicoterapeuta
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="group relative bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-all duration-500 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${benefit.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <benefit.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Highlights Section with Pricing */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
                <Zap className="w-4 h-4" />
                Por que escolher o Pro?
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Destaque-se entre os <span className="text-primary">profissionais</span>
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Com o Plano Pro, você tem acesso a ferramentas exclusivas que vão transformar sua prática clínica e aumentar sua visibilidade para pacientes em todo o Brasil.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {highlights.map((highlight, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 bg-background rounded-xl border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-md"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <highlight.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">{highlight.title}</h4>
                      <p className="text-sm text-muted-foreground">{highlight.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-3xl p-8 border border-primary/20">
                <div className="text-center mb-8">
                  <span className="text-sm text-muted-foreground">A partir de</span>
                  <div className="flex items-baseline justify-center gap-1 mt-1">
                    <span className="text-lg text-muted-foreground">R$</span>
                    <span className="text-5xl font-bold text-primary">37</span>
                    <span className="text-2xl text-primary">,90</span>
                    <span className="text-muted-foreground">/mês</span>
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  {includedFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3 animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                      <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-3 px-8 py-4 text-lg font-semibold bg-primary text-primary-foreground rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl"
                >
                  <MessageCircle className="w-6 h-6" />
                  ENTRAR NO GRUPO DE ESPERA!
                </a>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-primary/30 to-primary/10 rounded-full blur-xl animate-pulse" />
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-lg animate-pulse" style={{ animationDelay: '1s' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4">
              O que dizem os <span className="text-primary">profissionais</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Veja como a AcolheAqui está transformando a carreira de psicólogos em todo o Brasil
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Testimonial 1 */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <Quote className="w-8 h-8 text-primary/30 mb-4" />
              <p className="text-foreground mb-6 leading-relaxed">
                "A plataforma me ajudou a organizar minha agenda e atrair novos pacientes. Em 3 meses, dobrei meus atendimentos!"
              </p>
              <div className="flex items-center gap-4">
                <img 
                  src={avatar1} 
                  alt="Dra. Mariana Silva" 
                  className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
                />
                <div>
                  <p className="font-semibold text-foreground">Dra. Mariana Silva</p>
                  <p className="text-sm text-muted-foreground">Psicóloga Clínica • SP</p>
                </div>
              </div>
              <div className="flex gap-1 mt-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <Quote className="w-8 h-8 text-primary/30 mb-4" />
              <p className="text-foreground mb-6 leading-relaxed">
                "O CRM integrado é incrível! Consigo acompanhar o histórico dos pacientes e ter controle financeiro em um só lugar."
              </p>
              <div className="flex items-center gap-4">
                <img 
                  src={avatar2} 
                  alt="Dr. Rafael Costa" 
                  className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
                />
                <div>
                  <p className="font-semibold text-foreground">Dr. Rafael Costa</p>
                  <p className="text-sm text-muted-foreground">Neuropsicólogo • RJ</p>
                </div>
              </div>
              <div className="flex gap-1 mt-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <Quote className="w-8 h-8 text-primary/30 mb-4" />
              <p className="text-foreground mb-6 leading-relaxed">
                "Finalmente uma plataforma pensada para nós! O suporte é excelente e a visibilidade do meu perfil aumentou muito."
              </p>
              <div className="flex items-center gap-4">
                <img 
                  src={avatar3} 
                  alt="Dra. Carolina Mendes" 
                  className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
                />
                <div>
                  <p className="font-semibold text-foreground">Dra. Carolina Mendes</p>
                  <p className="text-sm text-muted-foreground">Psicóloga TCC • MG</p>
                </div>
              </div>
              <div className="flex gap-1 mt-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4 animate-fade-in">
              <HelpCircle className="w-4 h-4" />
              Dúvidas Frequentes
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 animate-fade-in">
              Perguntas <span className="text-primary">Frequentes</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto animate-fade-in">
              Tire suas principais dúvidas sobre o Plano Pro
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card border border-border rounded-xl px-6 data-[state=open]:border-primary/50 transition-all duration-300 hover:shadow-md animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <AccordionTrigger className="text-left hover:no-underline py-5 text-foreground">
                  <span className="font-semibold text-base md:text-lg">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 text-base leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-background to-muted/30">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-primary mb-6">
            Atenção Psicoterapeutas!!
          </h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Se você deseja começar a sua jornada na plataforma AcolheAqui e receber pacientes para sessões de Terapia Online a partir de{" "}
            <strong className="text-foreground">R$ 37,90</strong> com vários benefícios, o Plano Pro é ideal para você.
          </p>

          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 text-lg font-semibold bg-primary text-primary-foreground rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl animate-pulse"
          >
            <MessageCircle className="w-6 h-6" />
            ENTRAR NO GRUPO DE ESPERA!
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-muted/50 border-t border-border">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-4">
          <Logo className="h-8" />
          <p className="text-sm text-muted-foreground">
            © Copyright 2025 - Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default CadastroPro;
