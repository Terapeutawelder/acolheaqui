import HeroSection from "@/components/HeroSection";
import Marquee from "@/components/Marquee";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <HeroSection />
      <Marquee />
      <CTASection />
      <Footer />
    </main>
  );
};

export default Index;
