import { Clock, Star, GraduationCap, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LandingPageConfig } from "../LandingPagePreview";
import { formatProfessionalName } from "@/lib/formatProfessionalName";

interface AboutSectionProps {
  config: LandingPageConfig;
  profile: any;
  averageRating: number;
}

const AboutSection = ({ config, profile, averageRating }: AboutSectionProps) => {
  return (
    <section id="sobre" className="py-20 relative overflow-hidden bg-cream">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-teal-light/40 to-transparent opacity-40" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
          {/* Image */}
          <div className="relative">
            <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-teal-light to-cream">
              {config.images.aboutPhoto || profile?.avatar_url ? (
                <img 
                  src={config.images.aboutPhoto || profile.avatar_url} 
                  alt={profile?.full_name || "Profissional"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-8xl font-bold text-teal">
                    {profile?.full_name?.charAt(0) || "P"}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-teal/20 to-transparent" />
            </div>
            
            {/* Floating card - Experience */}
            <div className="absolute -bottom-6 -right-6 bg-white p-5 rounded-2xl shadow-2xl border border-teal-light">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold to-gold-light flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <span className="font-serif text-3xl text-charcoal">10+</span>
              </div>
              <p className="text-sm font-medium text-slate">Anos de experiência</p>
            </div>
            
            {/* Rating badge */}
            <div className="absolute -top-4 -left-4 bg-white px-4 py-2 rounded-full shadow-xl border border-teal-light flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                ))}
              </div>
              <span className="text-sm font-bold text-charcoal">{averageRating.toFixed(1)}</span>
            </div>
          </div>

          {/* Content */}
          <div>
            <Badge className="bg-teal-light text-teal border border-teal/20 px-4 py-1.5 text-sm font-semibold mb-6">
              {config.about.title}
            </Badge>
            
            <h2 className="font-serif text-3xl md:text-4xl text-charcoal mb-6">
              {profile ? formatProfessionalName(profile.full_name, profile.gender) : "Nome do Profissional"}
            </h2>
            
            <p className="text-slate leading-relaxed mb-8 font-medium">
              {profile?.bio || "Sou psicólogo(a) clínico(a) com especialização em Terapia Cognitivo-Comportamental e Psicoterapia Humanista. Minha abordagem é integrativa, combinando diferentes técnicas para atender às necessidades únicas de cada pessoa."}
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-teal-light/50 border border-teal/10 transition-all duration-300 hover:shadow-md">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal to-teal-dark flex items-center justify-center shadow-lg">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-charcoal">Formação Acadêmica</h4>
                  <p className="text-sm text-slate font-medium">{profile?.specialty || "Especialização em Psicologia"}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-gold/10 border border-gold/20 transition-all duration-300 hover:shadow-md">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold to-gold-light flex items-center justify-center shadow-lg">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-charcoal">Registro Profissional</h4>
                  <p className="text-sm text-slate font-medium">{profile?.crp || "CRP 00/00000"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
