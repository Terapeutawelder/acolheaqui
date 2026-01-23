import { 
  MessageCircle, 
  Clock, 
  ArrowLeft, 
  Calendar, 
  Users, 
  CreditCard, 
  Video, 
  Headphones, 
  Crown,
  Bot,
  ChevronRight,
  Star,
  CheckCircle,
  Zap,
  Award,
  TrendingUp,
  Brain,
  Shield,
  Sparkles,
  Play,
  BookOpen,
  GraduationCap,
  MessageSquare,
  Heart,
  Target,
  Wifi
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import Marquee from "@/components/Marquee";
import membersAreaMockup from "@/assets/members-area-mockup-acolheaqui-v3.png";

const ProfissionalPremium = () => {
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
  const [bgLoaded, setBgLoaded] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    const img = new Image();
    img.src = '/hero-bg-pro.jpg';
    img.onload = () => setBgLoaded(true);

    return () => clearInterval(timer);
  }, []);

  const handleScrollToPricing = () => {
    const el = document.querySelector("#precos");
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen pro-theme">
      {/* Fixed Header */}
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
          <div className="w-20" />
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 py-20 pt-28">
        <div
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700 ${
            bgLoaded ? "opacity-100" : "opacity-0"
          }`}
          style={{ backgroundImage: `url('/hero-bg-pro.jpg')` }}
        />
        
        <div
          className={`absolute inset-0 bg-gradient-to-br from-primary/20 to-muted transition-opacity duration-700 ${
            bgLoaded ? "opacity-0" : "opacity-100"
          }`}
        />
        
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/50 to-background/75" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400 rounded-full text-sm font-bold mb-6 animate-fade-in">
            <Crown className="w-4 h-4" />
            PLANO MAIS COMPLETO
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight animate-fade-in-up">
            Desbloqueie todo o potencial com o{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Plano Premium</span>!
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-in-up animate-delay-100">
            Recursos completos: CRM, integrações, agentes de IA, checkout próprio e muito mais para você crescer.
          </p>

          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 text-lg font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl animate-pulse-glow animate-fade-in-up animate-delay-200"
          >
            <MessageCircle className="w-6 h-6" />
            ENTRAR NO GRUPO DE ESPERA!
          </a>

          <div className="mt-8 animate-fade-in-up animate-delay-300">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500/10 border border-amber-500/30 rounded-full">
              <Clock className="w-5 h-5 text-amber-400 animate-pulse" />
              <span className="text-foreground font-medium">Inscrições encerram em:</span>
            </div>
            <div className="mt-4 flex items-center justify-center gap-3 md:gap-4">
              <div className="flex flex-col items-center bg-background/50 backdrop-blur-sm border border-amber-500/30 rounded-lg px-4 py-3 min-w-[70px]">
                <span className="text-2xl md:text-3xl font-bold text-amber-400">{timeLeft.days}</span>
                <span className="text-xs text-muted-foreground uppercase">Dias</span>
              </div>
              <span className="text-2xl font-bold text-amber-400">:</span>
              <div className="flex flex-col items-center bg-background/50 backdrop-blur-sm border border-amber-500/30 rounded-lg px-4 py-3 min-w-[70px]">
                <span className="text-2xl md:text-3xl font-bold text-amber-400">{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="text-xs text-muted-foreground uppercase">Horas</span>
              </div>
              <span className="text-2xl font-bold text-amber-400">:</span>
              <div className="flex flex-col items-center bg-background/50 backdrop-blur-sm border border-amber-500/30 rounded-lg px-4 py-3 min-w-[70px]">
                <span className="text-2xl md:text-3xl font-bold text-amber-400">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="text-xs text-muted-foreground uppercase">Min</span>
              </div>
              <span className="text-2xl font-bold text-amber-400">:</span>
              <div className="flex flex-col items-center bg-background/50 backdrop-blur-sm border border-amber-500/30 rounded-lg px-4 py-3 min-w-[70px]">
                <span className="text-2xl md:text-3xl font-bold text-amber-400">{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span className="text-xs text-muted-foreground uppercase">Seg</span>
              </div>
            </div>
          </div>

          <p className="mt-4 text-sm text-muted-foreground italic animate-fade-in-up animate-delay-400">
            <strong>Vagas limitadas</strong> • Acesso prioritário • Benefícios exclusivos
          </p>
        </div>
      </section>

      {/* Marquee */}
      <Marquee />

      {/* Members Area Section */}
      <section className="py-24 bg-[hsl(215_35%_14%)]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 text-primary rounded-full text-sm font-medium mb-6">
                <Video className="w-4 h-4" />
                Área de Membros
              </div>
              
              <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">
                Sua própria plataforma{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-violet-400">estilo Netflix</span>
              </h2>

              <div className="flex flex-wrap gap-6 mb-8 justify-center lg:justify-start">
                <div className="flex items-center gap-2 text-white/75">
                  <Video size={18} className="text-primary" />
                  <span className="font-medium">Estilo Netflix</span>
                </div>
                <div className="flex items-center gap-2 text-white/75">
                  <Users size={18} className="text-amber-500" />
                  <span className="font-medium">Sem custos extras</span>
                </div>
                <div className="flex items-center gap-2 text-white/75">
                  <Star size={18} className="text-primary" />
                  <span className="font-medium">Personalizável</span>
                </div>
              </div>

              <p className="text-lg text-white/75 mb-4 max-w-lg mx-auto lg:mx-0">
                Crie cursos, módulos e aulas organizadas em uma interface moderna e profissional. Seus alunos terão acesso a uma experiência premium.
              </p>
              <p className="text-lg text-white/60 mb-8 max-w-lg mx-auto lg:mx-0">
                Emita certificados PDF automáticos, crie comunidades e organize eventos ao vivo com integração Google Meet.
              </p>

              <Button
                size="lg"
                onClick={handleScrollToPricing}
                className="h-14 px-8 text-lg font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Começar Agora
                <ChevronRight className="ml-2" size={20} />
              </Button>
            </div>

            <div className="flex-[1.5]">
              <div className="overflow-hidden">
                <img
                  src={membersAreaMockup}
                  alt="Área de Membros AcolheAqui"
                  loading="lazy"
                  className="block w-full max-w-none transform-gpu scale-[1.04]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Agents Section */}
      <section className="py-24 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-20">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 rounded-full text-sm font-medium mb-6">
                <Bot className="w-4 h-4" />
                Agentes de IA
              </div>
              
              <h2 className="text-3xl md:text-5xl font-extrabold text-foreground mb-6">
                Automatize sua clínica com{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Inteligência Artificial</span>
              </h2>

              <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto lg:mx-0">
                Nossos agentes de IA trabalham 24/7 para você. Agendam consultas, respondem pacientes no WhatsApp e fazem follow-up automático.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="flex items-start gap-3 p-4 bg-card rounded-xl border border-border hover:border-cyan-500/30 transition-all duration-300">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center shrink-0">
                    <MessageCircle className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Agendamento Automático</h4>
                    <p className="text-sm text-muted-foreground">IA agenda consultas via WhatsApp</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-card rounded-xl border border-border hover:border-cyan-500/30 transition-all duration-300">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center shrink-0">
                    <Heart className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Follow-up Inteligente</h4>
                    <p className="text-sm text-muted-foreground">Acompanhamento automático de pacientes</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-card rounded-xl border border-border hover:border-cyan-500/30 transition-all duration-300">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center shrink-0">
                    <Brain className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Análise de Sessões</h4>
                    <p className="text-sm text-muted-foreground">Transcrição e insights com IA</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-card rounded-xl border border-border hover:border-cyan-500/30 transition-all duration-300">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center shrink-0">
                    <Zap className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Respostas Instantâneas</h4>
                    <p className="text-sm text-muted-foreground">Atendimento 24/7 no WhatsApp</p>
                  </div>
                </div>
              </div>

              <Button
                size="lg"
                onClick={handleScrollToPricing}
                className="h-14 px-8 text-lg font-bold rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Quero Automatizar
                <Bot className="ml-2" size={20} />
              </Button>
            </div>

            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-3xl blur-3xl" />
                <div className="relative bg-gradient-to-br from-[hsl(215_35%_18%)] to-[hsl(215_35%_12%)] rounded-3xl p-8 border border-cyan-500/20">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                      <Bot className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white">Agente AcolheAqui</h4>
                      <p className="text-cyan-400 text-sm">Online 24/7</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-white/5 rounded-2xl rounded-tl-sm p-4 max-w-[80%]">
                      <p className="text-white/80 text-sm">Olá! Gostaria de agendar uma consulta para próxima semana.</p>
                    </div>
                    <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl rounded-tr-sm p-4 max-w-[80%] ml-auto">
                      <p className="text-cyan-300 text-sm">Claro! Temos horários disponíveis na terça às 14h ou quinta às 16h. Qual prefere? 🗓️</p>
                    </div>
                    <div className="bg-white/5 rounded-2xl rounded-tl-sm p-4 max-w-[80%]">
                      <p className="text-white/80 text-sm">Terça às 14h está ótimo!</p>
                    </div>
                    <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl rounded-tr-sm p-4 max-w-[80%] ml-auto">
                      <p className="text-cyan-300 text-sm">Perfeito! Agendamento confirmado ✅ Enviarei um lembrete no dia anterior.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CRM Section */}
      <section className="py-24 bg-[hsl(215_35%_14%)]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 rounded-full text-sm font-medium mb-6">
                <Calendar className="w-4 h-4" />
                CRM Completo
              </div>
              
              <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">
                Gerencie sua clínica com{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">CRM profissional</span>
              </h2>

              <p className="text-lg text-white/75 mb-8 max-w-lg mx-auto lg:mx-0">
                Agenda inteligente, prontuário digital, histórico de sessões e controle financeiro completo em um só lugar.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  { icon: Calendar, text: "Agenda com integração Google Calendar" },
                  { icon: Users, text: "Prontuário digital por paciente" },
                  { icon: TrendingUp, text: "Dashboard com métricas e relatórios" },
                  { icon: Shield, text: "Dados protegidos com criptografia" }
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-purple-400" />
                    </div>
                    <span className="text-white/80">{item.text}</span>
                  </div>
                ))}
              </div>

              <Button
                size="lg"
                onClick={handleScrollToPricing}
                className="h-14 px-8 text-lg font-bold rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Organizar Minha Clínica
                <Calendar className="ml-2" size={20} />
              </Button>
            </div>

            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl blur-3xl" />
                <div className="relative bg-gradient-to-br from-[hsl(215_35%_18%)] to-[hsl(215_35%_12%)] rounded-3xl p-6 border border-purple-500/20">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/5 rounded-xl p-4 text-center">
                      <span className="text-3xl font-bold text-purple-400">247</span>
                      <p className="text-white/60 text-sm mt-1">Sessões realizadas</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 text-center">
                      <span className="text-3xl font-bold text-pink-400">42</span>
                      <p className="text-white/60 text-sm mt-1">Pacientes ativos</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                          M
                        </div>
                        <div>
                          <p className="text-white font-medium">Maria Silva</p>
                          <p className="text-white/50 text-sm">14:00 - Sessão individual</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">Confirmado</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                          J
                        </div>
                        <div>
                          <p className="text-white font-medium">João Santos</p>
                          <p className="text-white/50 text-sm">16:00 - Sessão de casal</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-full">Pendente</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Checkout Section */}
      <section className="py-24 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-20">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 rounded-full text-sm font-medium mb-6">
                <CreditCard className="w-4 h-4" />
                Checkout Personalizado
              </div>
              
              <h2 className="text-3xl md:text-5xl font-extrabold text-foreground mb-6">
                Receba pagamentos com{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">checkout próprio</span>
              </h2>

              <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto lg:mx-0">
                Seu checkout personalizado com sua marca. Aceite Pix, cartão de crédito e boleto. Receba direto na sua conta.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-foreground">Pix instantâneo</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-foreground">Cartão em até 12x</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-foreground">Sem taxas ocultas</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-foreground">Receba na sua conta</span>
                </div>
              </div>

              <Button
                size="lg"
                onClick={handleScrollToPricing}
                className="h-14 px-8 text-lg font-bold rounded-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Quero Meu Checkout
                <CreditCard className="ml-2" size={20} />
              </Button>
            </div>

            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-3xl blur-3xl" />
                <div className="relative bg-gradient-to-br from-[hsl(215_35%_18%)] to-[hsl(215_35%_12%)] rounded-3xl p-6 border border-green-500/20">
                  <div className="text-center mb-6">
                    <p className="text-white/60 text-sm mb-2">Sessão Individual</p>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-white/60">R$</span>
                      <span className="text-4xl font-bold text-white">200</span>
                      <span className="text-white/60">,00</span>
                    </div>
                    <p className="text-green-400 text-sm mt-2">ou 3x de R$ 66,67</p>
                  </div>

                  <div className="space-y-3 mb-6">
                    <button className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                      <Zap className="w-5 h-5" />
                      Pagar com Pix
                    </button>
                    <button className="w-full py-4 bg-white/10 text-white font-medium rounded-xl flex items-center justify-center gap-2 hover:bg-white/15 transition-colors">
                      <CreditCard className="w-5 h-5" />
                      Cartão de Crédito
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-white/50 text-sm">
                    <Shield className="w-4 h-4" />
                    <span>Pagamento 100% seguro</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Courses & Certificates Section */}
      <section className="py-24 bg-[hsl(215_35%_14%)]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 rounded-full text-sm font-medium mb-6">
                <GraduationCap className="w-4 h-4" />
                Cursos & Certificados
              </div>
              
              <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">
                Crie cursos e emita{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">certificados automáticos</span>
              </h2>

              <p className="text-lg text-white/75 mb-8 max-w-lg mx-auto lg:mx-0">
                Organize seu conteúdo em módulos e aulas. Quando o aluno concluir, o certificado PDF é gerado automaticamente.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  { icon: BookOpen, text: "Módulos e aulas ilimitadas" },
                  { icon: Play, text: "Player de vídeo profissional" },
                  { icon: Award, text: "Certificados PDF personalizados" },
                  { icon: TrendingUp, text: "Acompanhamento de progresso" }
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-amber-400" />
                    </div>
                    <span className="text-white/80">{item.text}</span>
                  </div>
                ))}
              </div>

              <Button
                size="lg"
                onClick={handleScrollToPricing}
                className="h-14 px-8 text-lg font-bold rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Criar Meus Cursos
                <GraduationCap className="ml-2" size={20} />
              </Button>
            </div>

            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-3xl blur-3xl" />
                <div className="relative bg-gradient-to-br from-[hsl(215_35%_18%)] to-[hsl(215_35%_12%)] rounded-3xl p-6 border border-amber-500/20">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h4 className="text-white font-bold text-lg">Curso de Ansiedade</h4>
                      <p className="text-white/50 text-sm">12 módulos • 48 aulas</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-white/60">Progresso</span>
                      <span className="text-amber-400 font-medium">100%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full w-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl p-4 border border-amber-500/20">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-amber-400 font-semibold">Certificado Disponível!</p>
                        <p className="text-white/50 text-sm">Clique para baixar seu PDF</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community & Events Section */}
      <section className="py-24 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-20">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500/20 to-pink-500/20 text-rose-400 rounded-full text-sm font-medium mb-6">
                <MessageSquare className="w-4 h-4" />
                Comunidade & Eventos
              </div>
              
              <h2 className="text-3xl md:text-5xl font-extrabold text-foreground mb-6">
                Conecte-se com seus alunos em{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-pink-500">comunidade própria</span>
              </h2>

              <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto lg:mx-0">
                Crie um espaço de discussão para seus alunos. Organize eventos ao vivo com integração automática ao Google Meet.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="flex items-start gap-3 p-4 bg-card rounded-xl border border-border hover:border-rose-500/30 transition-all duration-300">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rose-500/20 to-pink-500/20 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-5 h-5 text-rose-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Fórum de Discussão</h4>
                    <p className="text-sm text-muted-foreground">Espaço para dúvidas e troca</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-card rounded-xl border border-border hover:border-rose-500/30 transition-all duration-300">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rose-500/20 to-pink-500/20 flex items-center justify-center shrink-0">
                    <Video className="w-5 h-5 text-rose-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Aulas ao Vivo</h4>
                    <p className="text-sm text-muted-foreground">Eventos com Google Meet</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-card rounded-xl border border-border hover:border-rose-500/30 transition-all duration-300">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rose-500/20 to-pink-500/20 flex items-center justify-center shrink-0">
                    <Heart className="w-5 h-5 text-rose-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Engajamento</h4>
                    <p className="text-sm text-muted-foreground">Likes e interações</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-card rounded-xl border border-border hover:border-rose-500/30 transition-all duration-300">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rose-500/20 to-pink-500/20 flex items-center justify-center shrink-0">
                    <Target className="w-5 h-5 text-rose-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Posts Fixados</h4>
                    <p className="text-sm text-muted-foreground">Destaque conteúdos importantes</p>
                  </div>
                </div>
              </div>

              <Button
                size="lg"
                onClick={handleScrollToPricing}
                className="h-14 px-8 text-lg font-bold rounded-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Criar Minha Comunidade
                <Users className="ml-2" size={20} />
              </Button>
            </div>

            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-rose-500/20 to-pink-500/20 rounded-3xl blur-3xl" />
                <div className="relative bg-gradient-to-br from-[hsl(215_35%_18%)] to-[hsl(215_35%_12%)] rounded-3xl p-6 border border-rose-500/20">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold">Comunidade Premium</h4>
                      <p className="text-white/50 text-sm">127 membros ativos</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-white/5 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-pink-500" />
                        <span className="text-white font-medium">Ana Paula</span>
                        <span className="text-white/40 text-sm">há 2h</span>
                      </div>
                      <p className="text-white/70 text-sm">Amei a aula sobre técnicas de respiração! Já estou aplicando com meus pacientes 🙏</p>
                      <div className="flex items-center gap-4 mt-3">
                        <button className="flex items-center gap-1 text-rose-400 text-sm">
                          <Heart className="w-4 h-4 fill-rose-400" /> 24
                        </button>
                        <button className="flex items-center gap-1 text-white/50 text-sm">
                          <MessageSquare className="w-4 h-4" /> 8
                        </button>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-rose-500/10 to-pink-500/10 rounded-xl p-4 border border-rose-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Video className="w-4 h-4 text-rose-400" />
                        <span className="text-rose-400 font-medium text-sm">Evento ao vivo</span>
                      </div>
                      <p className="text-white font-semibold">Supervisão em Grupo</p>
                      <p className="text-white/50 text-sm">Amanhã às 19h • Google Meet</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VIP Support Section */}
      <section className="py-24 bg-[hsl(215_35%_14%)]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500/20 to-violet-500/20 text-indigo-400 rounded-full text-sm font-medium mb-6">
                <Headphones className="w-4 h-4" />
                Suporte VIP
              </div>
              
              <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">
                Atendimento prioritário{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-500">24 horas por dia</span>
              </h2>

              <p className="text-lg text-white/75 mb-8 max-w-lg mx-auto lg:mx-0">
                Como membro Premium, você tem acesso a uma equipe dedicada de suporte que responde suas dúvidas em minutos, não horas.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  { icon: Zap, text: "Resposta em até 15 minutos" },
                  { icon: Wifi, text: "Chat ao vivo exclusivo" },
                  { icon: Sparkles, text: "Onboarding personalizado" },
                  { icon: Award, text: "Prioridade em novas features" }
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-indigo-400" />
                    </div>
                    <span className="text-white/80">{item.text}</span>
                  </div>
                ))}
              </div>

              <Button
                size="lg"
                onClick={handleScrollToPricing}
                className="h-14 px-8 text-lg font-bold rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Quero Suporte VIP
                <Headphones className="ml-2" size={20} />
              </Button>
            </div>

            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-violet-500/20 rounded-3xl blur-3xl" />
                <div className="relative bg-gradient-to-br from-[hsl(215_35%_18%)] to-[hsl(215_35%_12%)] rounded-3xl p-6 border border-indigo-500/20">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                      <Headphones className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-lg">Suporte Premium</h4>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-green-400 text-sm">Online agora</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="bg-white/5 rounded-2xl rounded-tl-sm p-4 max-w-[85%]">
                      <p className="text-white/80 text-sm">Olá! Como posso ajudar você hoje?</p>
                    </div>
                    <div className="bg-gradient-to-r from-indigo-500/20 to-violet-500/20 rounded-2xl rounded-tr-sm p-4 max-w-[85%] ml-auto">
                      <p className="text-indigo-300 text-sm">Preciso de ajuda para configurar meu checkout.</p>
                    </div>
                    <div className="bg-white/5 rounded-2xl rounded-tl-sm p-4 max-w-[85%]">
                      <p className="text-white/80 text-sm">Claro! Vou te guiar passo a passo. Primeiro, acesse Configurações &gt; Checkout...</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-indigo-500/10 to-violet-500/10 rounded-xl border border-indigo-500/20">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-indigo-400" />
                      <span className="text-white/80 text-sm">Tempo médio de resposta</span>
                    </div>
                    <span className="text-indigo-400 font-bold">~5 min</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing CTA Section */}
      <section id="precos" className="py-24 bg-gradient-to-b from-background via-primary/5 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 rounded-full text-sm font-bold mb-6">
              <Crown className="w-4 h-4" />
              OFERTA ESPECIAL
            </div>

            <h2 className="text-3xl md:text-5xl font-extrabold text-foreground mb-6">
              Comece sua jornada{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Premium hoje</span>
            </h2>

            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
              Tudo que você precisa para crescer sua prática: CRM, agentes de IA, área de membros, checkout e suporte VIP.
            </p>

            <div className="bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-transparent rounded-3xl p-8 border border-amber-500/20 max-w-md mx-auto mb-10">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full text-sm font-bold shadow-lg">
                  <Crown className="w-4 h-4" />
                  PREMIUM
                </span>
              </div>

              <div className="text-center mb-8 mt-4">
                <span className="text-sm text-muted-foreground">A partir de</span>
                <div className="flex items-baseline justify-center gap-1 mt-1">
                  <span className="text-lg text-muted-foreground">R$</span>
                  <span className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">197</span>
                  <span className="text-2xl text-amber-500">,00</span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
              </div>

              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-3 px-8 py-4 text-lg font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <MessageCircle className="w-6 h-6" />
                ENTRAR NO GRUPO DE ESPERA
              </a>
            </div>

            <p className="text-sm text-muted-foreground">
              <strong>Vagas limitadas</strong> • Garantia de 7 dias • Cancele quando quiser
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-[hsl(215_35%_10%)] border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <Logo className="h-10 mx-auto mb-6" />
          <p className="text-muted-foreground text-sm mb-4">
            A plataforma completa para profissionais de saúde mental
          </p>
          <p className="text-muted-foreground/60 text-xs">
            © {new Date().getFullYear()} AcolheAqui. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ProfissionalPremium;
