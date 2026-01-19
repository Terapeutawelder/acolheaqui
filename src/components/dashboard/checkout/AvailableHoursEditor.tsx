import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

interface AvailableHour {
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

interface AvailableHoursEditorProps {
  hours: AvailableHour[];
  onHoursChange: (hours: AvailableHour[]) => void;
}

const DAYS_OF_WEEK = [
  { value: 0, label: "Dom" },
  { value: 1, label: "Seg" },
  { value: 2, label: "Ter" },
  { value: 3, label: "Qua" },
  { value: 4, label: "Qui" },
  { value: 5, label: "Sex" },
  { value: 6, label: "Sáb" },
];

const TIME_OPTIONS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, "0");
  return [
    { value: `${hour}:00:00`, label: `${hour}:00` },
    { value: `${hour}:30:00`, label: `${hour}:30` },
  ];
}).flat();

const AvailableHoursEditor = ({ hours, onHoursChange }: AvailableHoursEditorProps) => {
  const addNewHour = () => {
    onHoursChange([
      ...hours,
      {
        day_of_week: 1,
        start_time: "08:00:00",
        end_time: "18:00:00",
        is_active: true,
      },
    ]);
  };

  const updateHour = (index: number, field: keyof AvailableHour, value: any) => {
    const updated = [...hours];
    updated[index] = { ...updated[index], [field]: value };
    onHoursChange(updated);
  };

  const removeHour = (index: number) => {
    onHoursChange(hours.filter((_, i) => i !== index));
  };

  // Group hours by day
  const groupedHours = DAYS_OF_WEEK.map(day => ({
    ...day,
    hours: hours.filter(h => h.day_of_week === day.value),
  }));

  return (
    <div className="space-y-3 mt-4">
      {hours.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          <p className="text-sm">Nenhum horário configurado</p>
          <p className="text-xs mt-1">Clique abaixo para adicionar</p>
        </div>
      ) : (
        <div className="space-y-2">
          {hours.map((hour, index) => (
            <div
              key={hour.id || index}
              className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200"
            >
              <Switch
                checked={hour.is_active}
                onCheckedChange={(checked) => updateHour(index, "is_active", checked)}
                className="scale-75"
              />

              <Select
                value={String(hour.day_of_week)}
                onValueChange={(value) => updateHour(index, "day_of_week", parseInt(value))}
              >
                <SelectTrigger className="w-16 h-8 text-xs bg-white border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAYS_OF_WEEK.map((day) => (
                    <SelectItem key={day.value} value={String(day.value)}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-1">
                <Select
                  value={hour.start_time}
                  onValueChange={(value) => updateHour(index, "start_time", value)}
                >
                  <SelectTrigger className="w-16 h-8 text-xs bg-white border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_OPTIONS.map((time) => (
                      <SelectItem key={time.value} value={time.value}>
                        {time.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <span className="text-xs text-gray-400">→</span>

                <Select
                  value={hour.end_time}
                  onValueChange={(value) => updateHour(index, "end_time", value)}
                >
                  <SelectTrigger className="w-16 h-8 text-xs bg-white border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_OPTIONS.map((time) => (
                      <SelectItem key={time.value} value={time.value}>
                        {time.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeHour(index)}
                className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10 ml-auto"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        onClick={addNewHour}
        className="w-full h-8 text-xs border-dashed border-gray-300 text-gray-600"
      >
        <Plus className="h-3.5 w-3.5 mr-1" />
        Adicionar Horário
      </Button>

      {/* Quick preview of configured days */}
      {hours.length > 0 && (
        <div className="flex justify-center gap-1 pt-2">
          {DAYS_OF_WEEK.map((day) => {
            const dayHours = hours.filter(h => h.day_of_week === day.value && h.is_active);
            const hasHours = dayHours.length > 0;
            return (
              <div
                key={day.value}
                className={`
                  w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-medium
                  ${hasHours 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-gray-100 text-gray-400"
                  }
                `}
              >
                {day.label.charAt(0)}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AvailableHoursEditor;
