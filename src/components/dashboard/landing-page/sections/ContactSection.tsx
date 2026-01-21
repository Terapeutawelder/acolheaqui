import { MapPin, Phone, Mail, Clock, MessageCircle, Send } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LandingPageConfig } from "../LandingPagePreview";

interface ContactSectionProps {
  config: LandingPageConfig;
}

const ContactSection = ({ config }: ContactSectionProps) => {
  const contactInfo = [
    { icon: MapPin, title: "Endereço", content: config.contact.address },
    { icon: Phone, title: "Telefone", content: config.contact.phone },
    { icon: Mail, title: "E-mail", content: config.contact.email },
    { icon: Clock, title: "Horário", content: config.contact.hours },
  ];

  return (
    <section id="contato" className="py-20 relative overflow-hidden bg-cream">
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Info */}
          <div>
            <Badge className="bg-teal-light/60 text-teal border-0 px-4 py-1.5 text-sm font-semibold mb-6">
              Fale Conosco
            </Badge>
            <h2 className="font-serif text-3xl md:text-4xl text-charcoal mb-4">
              Entre em <span className="text-teal">Contato</span>
            </h2>
            <p className="text-slate font-medium leading-relaxed mb-10">
              {config.contact.subtitle}
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {contactInfo.map((info) => (
                <Card 
                  key={info.title} 
                  className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-teal flex items-center justify-center flex-shrink-0">
                        <info.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-charcoal mb-1">{info.title}</h4>
                        <p className="text-sm text-slate font-medium whitespace-pre-line">
                          {info.content}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <Card className="bg-white border border-teal rounded-2xl shadow-lg overflow-hidden">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-teal flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-serif text-xl text-charcoal">Envie uma Mensagem</h3>
                </div>
                
                <form className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-charcoal mb-2 block">
                        Nome
                      </label>
                      <Input 
                        placeholder="Seu nome" 
                        className="bg-gray-50 border-gray-200 rounded-lg font-medium h-11"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-charcoal mb-2 block">
                        E-mail
                      </label>
                      <Input 
                        type="email" 
                        placeholder="seu@email.com"
                        className="bg-gray-50 border-gray-200 rounded-lg font-medium h-11"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-charcoal mb-2 block">
                      Telefone
                    </label>
                    <Input 
                      placeholder="(11) 99999-9999"
                      className="bg-gray-50 border-gray-200 rounded-lg font-medium h-11"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-charcoal mb-2 block">
                      Mensagem
                    </label>
                    <Textarea 
                      placeholder="Como posso ajudar você?"
                      rows={4}
                      className="bg-gray-50 border-gray-200 resize-none rounded-lg font-medium"
                    />
                  </div>
                  <Button className="w-full py-6 bg-teal hover:bg-teal-dark text-white transition-all duration-300 rounded-lg font-semibold">
                    <Send className="w-5 h-5 mr-2" />
                    Enviar Mensagem
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
