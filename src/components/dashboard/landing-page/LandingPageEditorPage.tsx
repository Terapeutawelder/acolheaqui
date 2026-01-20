import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import LandingPagePreview, { defaultConfig, LandingPageConfig } from "./LandingPagePreview";
import EditorSidebar from "./EditorSidebar";
import { Monitor, Tablet, Smartphone, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface LandingPageEditorPageProps {
  profileId: string;
}

type DeviceMode = "desktop" | "tablet" | "mobile";

const deviceWidths: Record<DeviceMode, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "375px",
};

const LandingPageEditorPage = ({ profileId }: LandingPageEditorPageProps) => {
  const [profile, setProfile] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<LandingPageConfig>(defaultConfig);
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("desktop");
  
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
    <div className="flex h-[calc(100vh-73px)]">
      {/* Editor Sidebar */}
      <div className="w-[340px] flex-shrink-0 overflow-y-auto p-4 border-r border-border bg-card">
        <EditorSidebar 
          config={config}
          onConfigChange={setConfig}
          profileUrl={getProfileUrl()}
          onPreview={openPreview}
        />
      </div>

      {/* Preview Area - Full bleed */}
      <div className="flex-1 min-w-0 bg-muted/30 flex flex-col">
        {/* Device Mode Toolbar */}
        <div className="h-12 bg-card border-b border-border flex items-center justify-between px-4 flex-shrink-0">
          <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
            <button
              onClick={() => setDeviceMode("desktop")}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                deviceMode === "desktop"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Monitor className="w-4 h-4" />
              <span className="hidden sm:inline">Desktop</span>
            </button>
            <button
              onClick={() => setDeviceMode("tablet")}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                deviceMode === "tablet"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Tablet className="w-4 h-4" />
              <span className="hidden sm:inline">Tablet</span>
            </button>
            <button
              onClick={() => setDeviceMode("mobile")}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                deviceMode === "mobile"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Smartphone className="w-4 h-4" />
              <span className="hidden sm:inline">Mobile</span>
            </button>
          </div>

          <button
            onClick={openPreview}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="hidden sm:inline">Abrir em nova aba</span>
          </button>
        </div>

        {/* Preview Container */}
        <div className="flex-1 overflow-hidden flex items-start justify-center p-4 bg-muted/20">
          <div 
            className={cn(
              "h-full bg-white rounded-xl overflow-hidden border border-border",
              "transition-all duration-500 ease-out transform-gpu",
              deviceMode === "desktop" && "shadow-2xl scale-100",
              deviceMode === "tablet" && "shadow-xl scale-100",
              deviceMode === "mobile" && "shadow-lg scale-100"
            )}
            style={{ 
              width: deviceWidths[deviceMode],
              maxWidth: "100%",
            }}
          >
            {/* Browser Mock Header */}
            <div className={cn(
              "bg-gray-100 border-b border-gray-200 flex items-center px-3 gap-2 flex-shrink-0 transition-all duration-300",
              deviceMode === "mobile" ? "h-7" : "h-8"
            )}>
              <div className="flex gap-1.5">
                <div className={cn(
                  "rounded-full bg-red-400 transition-all duration-300",
                  deviceMode === "mobile" ? "w-2 h-2" : "w-2.5 h-2.5"
                )}></div>
                <div className={cn(
                  "rounded-full bg-yellow-400 transition-all duration-300",
                  deviceMode === "mobile" ? "w-2 h-2" : "w-2.5 h-2.5"
                )}></div>
                <div className={cn(
                  "rounded-full bg-green-400 transition-all duration-300",
                  deviceMode === "mobile" ? "w-2 h-2" : "w-2.5 h-2.5"
                )}></div>
              </div>
              <div className="flex-1 mx-2">
                <div className={cn(
                  "bg-white rounded py-0.5 text-gray-500 mx-auto text-center truncate border border-gray-200 transition-all duration-300",
                  deviceMode === "mobile" ? "text-[8px] px-1.5 max-w-[140px]" : "text-[10px] px-2 max-w-xs"
                )}>
                  {getProfileUrl()}
                </div>
              </div>
            </div>

            {/* Preview Content - Scoped so fixed elements don't escape */}
            <div className={cn(
              "overflow-hidden relative isolate preview-light-theme transform-gpu transition-all duration-300",
              deviceMode === "mobile" ? "h-[calc(100%-28px)]" : "h-[calc(100%-32px)]"
            )}>
              <div className="h-full overflow-auto">
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
      </div>
    </div>
  );
};

export default LandingPageEditorPage;
