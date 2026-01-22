import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar, Users } from "lucide-react";
import CalendarSection from "./CalendarSection";
import GoogleCalendarPage from "./GoogleCalendarPage";
import GoogleIcon from "@/components/icons/GoogleIcon";
import PatientsPage from "./patients/PatientsPage";

interface AppointmentsPageProps {
  profileId: string;
}

const AppointmentsPage = ({ profileId }: AppointmentsPageProps) => {
  const [activeTab, setActiveTab] = useState<"calendars" | "patients" | "google">("calendars");
  const [open, setOpen] = useState(false);

  const title = useMemo(() => {
    if (activeTab === "calendars") return "Calendários";
    if (activeTab === "patients") return "Pacientes";
    return "Google";
  }, [activeTab]);

  const openTab = (tab: "calendars" | "patients" | "google") => {
    setActiveTab(tab);
    setOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Atalhos: abrem em popup central (como o modal do paciente) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Button variant="outline" className="justify-start gap-2" onClick={() => openTab("calendars")}>
          <Calendar className="h-4 w-4" />
          Calendários
        </Button>
        <Button variant="outline" className="justify-start gap-2" onClick={() => openTab("patients")}>
          <Users className="h-4 w-4" />
          Pacientes
        </Button>
        <Button variant="outline" className="justify-start gap-2" onClick={() => openTab("google")}>
          <GoogleIcon className="h-4 w-4" />
          Google
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-xl">{title}</DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="flex-1">
            <TabsList className="mx-6 mt-4 grid grid-cols-3 w-auto">
              <TabsTrigger value="calendars" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Calendários</span>
              </TabsTrigger>
              <TabsTrigger value="patients" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Pacientes</span>
              </TabsTrigger>
              <TabsTrigger value="google" className="flex items-center gap-2">
                <GoogleIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Google</span>
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[72vh] px-6 pb-6">
              <TabsContent value="calendars" className="mt-4">
                <CalendarSection profileId={profileId} />
              </TabsContent>

              <TabsContent value="patients" className="mt-4">
                <PatientsPage profileId={profileId} />
              </TabsContent>

              <TabsContent value="google" className="mt-4">
                <GoogleCalendarPage profileId={profileId} />
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppointmentsPage;
