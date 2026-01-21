import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LandingPageConfig } from "../LandingPagePreview";

interface TestimonialsSectionProps {
  config: LandingPageConfig;
  testimonials: any[];
}

const TestimonialsSection = ({ config, testimonials }: TestimonialsSectionProps) => {
  if (testimonials.length === 0) return null;

  return (
    <section className="py-20 relative overflow-hidden bg-teal-light">
      {/* Background decoration */}
      <div className="absolute top-10 right-10 w-40 h-40 rounded-full blur-3xl bg-teal/10" />
      <div className="absolute bottom-10 left-10 w-48 h-48 rounded-full blur-3xl bg-gold/10" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge className="bg-teal-light text-teal border border-teal/20 px-4 py-1.5 text-sm font-semibold mb-4">
            Depoimentos
          </Badge>
          <h2 className="font-serif text-3xl md:text-4xl text-charcoal mb-4">
            {config.testimonials.title.includes("Pacientes") ? (
              <>
                {config.testimonials.title.split("Pacientes")[0]}
                <span className="text-teal">Pacientes</span>
                {config.testimonials.title.split("Pacientes")[1]}
              </>
            ) : config.testimonials.title}
          </h2>
          <p className="text-slate font-medium">{config.testimonials.subtitle}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.slice(0, 6).map((testimonial, index) => (
            <Card 
              key={testimonial.id || index} 
              className={`bg-white border border-border shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1 ${
                testimonial.is_featured ? 'ring-2 ring-gold/50' : ''
              }`}
            >
              <CardContent className="p-6 relative">
                <Quote className="absolute top-4 right-4 w-8 h-8 text-teal/10" />
                
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < testimonial.rating ? 'fill-gold text-gold' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                
                <p className="text-slate mb-6 text-sm leading-relaxed italic">
                  "{testimonial.content}"
                </p>
                
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal to-teal-dark flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {testimonial.client_name?.charAt(0) || "?"}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-charcoal text-sm">{testimonial.client_name}</p>
                    <p className="text-xs text-slate">Paciente</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
