import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import LandingPagePreview, { defaultConfig, LandingPageConfig } from "./LandingPagePreview";
import EditorSidebar from "./EditorSidebar";

interface LandingPageEditorPageProps {
  profileId: string;
}

const LandingPageEditorPage = ({ profileId }: LandingPageEditorPageProps) => {
  const [profile, setProfile] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<LandingPageConfig>(defaultConfig);
  
  useEffect(() => {
    fetchData();
  }, [profileId]);

  const fetchData = async () => {
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", profileId)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch services
      const { data: servicesData, error: servicesError } = await supabase
        .from("services")
        .select("*")
        .eq("professional_id", profileId)
        .eq("is_active", true)
        .order("price_cents", { ascending: true });

      if (servicesError) throw servicesError;
      setServices(servicesData || []);

      // Fetch testimonials
      const { data: testimonialsData, error: testimonialsError } = await supabase
        .from("testimonials")
        .select("*")
        .eq("professional_id", profileId)
        .eq("is_approved", true)
        .order("is_featured", { ascending: false })
        .limit(6);

      if (!testimonialsError && testimonialsData) {
        setTestimonials(testimonialsData);
      }

      // Update contact info from profile
      if (profileData) {
        setConfig(prev => ({
          ...prev,
          contact: {
            ...prev.contact,
            phone: profileData.phone || prev.contact.phone,
            email: profileData.email || prev.contact.email,
          }
        }));
      }

    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const getProfileUrl = () => {
    const baseUrl = window.location.origin;
    if (profile?.user_slug) {
      return `${baseUrl}/site/${profile.user_slug}`;
    }
    return `${baseUrl}/site/${profileId}`;
  };

  const openPreview = () => {
    window.open(getProfileUrl(), "_blank");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] flex overflow-hidden -m-6">
      {/* Editor Sidebar */}
      <div className="w-[380px] flex-shrink-0 overflow-hidden">
        <EditorSidebar 
          config={config}
          onConfigChange={setConfig}
          profileUrl={getProfileUrl()}
          onPreview={openPreview}
        />
      </div>

      {/* Preview Area */}
      <div className="flex-1 bg-muted/30 p-6 overflow-hidden">
        <div className="h-full bg-white rounded-xl shadow-lg overflow-hidden border border-border">
          {/* Browser Mock Header */}
          <div className="h-10 bg-muted/50 border-b border-border flex items-center px-4 gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <div className="flex-1 mx-4">
              <div className="bg-background rounded-md px-3 py-1 text-xs text-muted-foreground max-w-md mx-auto text-center truncate">
                {getProfileUrl()}
              </div>
            </div>
          </div>

          {/* Preview Content */}
          <div className="h-[calc(100%-40px)] overflow-auto">
            <LandingPagePreview
              profile={profile}
              services={services}
              testimonials={testimonials}
              config={config}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPageEditorPage;
