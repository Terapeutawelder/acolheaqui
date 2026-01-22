import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, List } from "lucide-react";
import AppointmentsCalendar from "./AppointmentsCalendar";
import AppointmentsHistory from "./AppointmentsHistory";

interface AppointmentsPageProps {
  profileId: string;
}

const AppointmentsPage = ({ profileId }: AppointmentsPageProps) => {
  const [activeTab, setActiveTab] = useState("calendar");

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-xs grid-cols-2">
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Calendário</span>
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            <span className="hidden sm:inline">Lista</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="mt-4">
          <AppointmentsCalendar profileId={profileId} />
        </TabsContent>

        <TabsContent value="list" className="mt-4">
          <AppointmentsHistory profileId={profileId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AppointmentsPage;
