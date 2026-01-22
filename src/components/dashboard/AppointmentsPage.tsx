import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, List, Clock, Users } from "lucide-react";
import AppointmentsCalendar from "./AppointmentsCalendar";
import AppointmentsHistory from "./AppointmentsHistory";
import AvailableHoursConfig from "./AvailableHoursConfig";
import GoogleCalendarPage from "./GoogleCalendarPage";
import GoogleIcon from "@/components/icons/GoogleIcon";
import PatientsPage from "./patients/PatientsPage";

interface AppointmentsPageProps {
  profileId: string;
}

const AppointmentsPage = ({ profileId }: AppointmentsPageProps) => {
  const [activeTab, setActiveTab] = useState("calendar");

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-3xl grid-cols-5">
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Calendário</span>
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            <span className="hidden sm:inline">Lista</span>
          </TabsTrigger>
          <TabsTrigger value="patients" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Pacientes</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Horários</span>
          </TabsTrigger>
          <TabsTrigger value="google" className="flex items-center gap-2">
            <GoogleIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Google</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="mt-4">
          <AppointmentsCalendar profileId={profileId} />
        </TabsContent>

        <TabsContent value="list" className="mt-4">
          <AppointmentsHistory profileId={profileId} />
        </TabsContent>

        <TabsContent value="patients" className="mt-4">
          <PatientsPage profileId={profileId} />
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <AvailableHoursConfig profileId={profileId} />
        </TabsContent>

        <TabsContent value="google" className="mt-4">
          <GoogleCalendarPage profileId={profileId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AppointmentsPage;
