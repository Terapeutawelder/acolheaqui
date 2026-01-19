import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import Index from "./pages/Index";
import Profissionais from "./pages/Profissionais";
import Psicoterapeutas from "./pages/Psicoterapeutas";
import CadastroPro from "./pages/CadastroPro";
import CadastroPremium from "./pages/CadastroPremium";
import PoliticaPrivacidade from "./pages/PoliticaPrivacidade";
import TermosUso from "./pages/TermosUso";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import ProfessionalProfile from "./pages/ProfessionalProfile";
import Checkout from "./pages/Checkout";
import SalaVirtual from "./pages/SalaVirtual";
import NotFound from "./pages/NotFound";
import MeusAgendamentos from "./pages/MeusAgendamentos";
import CookieConsent from "./components/CookieConsent";

const LegacyCheckoutRedirect = () => {
  const { slug, serviceId } = useParams();
  if (!slug || !serviceId) return <Navigate to="/" replace />;
  return <Navigate to={`/${slug}/checkout/${serviceId}`} replace />;
};

const App = () => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/profissionais" element={<Profissionais />} />
            <Route path="/psicoterapeutas" element={<Psicoterapeutas />} />
            <Route path="/profissional/:id" element={<ProfessionalProfile />} />
            <Route path="/site/:slug" element={<ProfessionalProfile />} />
            <Route path="/p/:slug" element={<ProfessionalProfile />} />
            <Route path="/cadastro/pro" element={<CadastroPro />} />
            <Route path="/cadastro/premium" element={<CadastroPremium />} />
            <Route path="/politica-de-privacidade" element={<PoliticaPrivacidade />} />
            <Route path="/termos-de-uso" element={<TermosUso />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/checkout/:serviceId" element={<Checkout />} />
            <Route path="/:slug/checkout/:serviceId" element={<Checkout />} />
            <Route path="/u/:slug/checkout/:serviceId" element={<LegacyCheckoutRedirect />} />
            <Route path="/sala/:roomCode" element={<SalaVirtual />} />
            <Route path="/sala" element={<SalaVirtual />} />
            <Route path="/meus-agendamentos" element={<MeusAgendamentos />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <CookieConsent />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
