import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, List, Clock } from "lucide-react";
import AppointmentsCalendar from "./AppointmentsCalendar";
import AppointmentsHistory from "./AppointmentsHistory";
import AvailableHoursConfig from "./AvailableHoursConfig";
import GoogleCalendarPage from "./GoogleCalendarPage";

interface AppointmentsPageProps {
  profileId: string;
}

const AppointmentsPage = ({ profileId }: AppointmentsPageProps) => {
  const [activeTab, setActiveTab] = useState("calendar");

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Calendário</span>
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            <span className="hidden sm:inline">Lista</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Horários Disponíveis</span>
          </TabsTrigger>
          <TabsTrigger value="google" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Google Calendar</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="mt-4">
          <AppointmentsCalendar profileId={profileId} />
        </TabsContent>

        <TabsContent value="list" className="mt-4">
          <AppointmentsHistory profileId={profileId} />
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
