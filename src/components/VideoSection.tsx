import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const VideoSection = () => {
  return (
    <section className="relative min-h-[70vh] md:min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source 
          src="https://mindee.me/videos/home/video-capa.mp4" 
          type="video/mp4" 
        />
      </video>
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50" />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center max-w-4xl">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
          Encontre psicoterapeutas online no <span className="text-primary">Mindset</span>
        </h2>
        
        <p className="text-white/80 text-lg md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
          Mostramos perfis de psicoterapeutas com CRP ativo, diferentes abordagens 
          terapêuticas e formas de acolhimento — para você escolher com segurança.
        </p>
        
        <Link to="/psicoterapeutas">
          <Button 
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg rounded-full group"
          >
            Encontrar psicoterapeutas
            <ChevronRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default VideoSection;
