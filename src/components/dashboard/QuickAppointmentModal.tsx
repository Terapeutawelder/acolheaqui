import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Loader2, User, Mail, Phone, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileId: string;
  onSuccess?: () => void;
  defaultDate?: Date;
  defaultTime?: string;
}

const TIME_OPTIONS = Array.from({ length: 28 }, (_, i) => {
  const hour = Math.floor(i / 2) + 7;
  const minute = (i % 2) * 30;
  const value = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}:00`;
  const label = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
  return { value, label };
});

const DURATION_OPTIONS = [
  { value: 30, label: "30 minutos" },
  { value: 50, label: "50 minutos" },
  { value: 60, label: "1 hora" },
  { value: 90, label: "1h 30min" },
  { value: 120, label: "2 horas" },
];

const STATUS_OPTIONS = [
  { value: "pending", label: "Pendente" },
  { value: "confirmed", label: "Confirmado" },
];

const QuickAppointmentModal = ({
  isOpen,
  onClose,
  profileId,
  onSuccess,
  defaultDate,
  defaultTime,
}: QuickAppointmentModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    client_name: "",
    client_email: "",
    client_phone: "",
    appointment_date: defaultDate || new Date(),
    appointment_time: defaultTime || "09:00:00",
    duration_minutes: 50,
    session_type: "",
    status: "confirmed",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.client_name.trim()) {
      toast.error("Nome do paciente é obrigatório");
      return;
    }

    if (!formData.appointment_date) {
      toast.error("Data é obrigatória");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("appointments").insert({
        professional_id: profileId,
        client_name: formData.client_name.trim(),
        client_email: formData.client_email.trim() || null,
        client_phone: formData.client_phone.trim() || null,
        appointment_date: format(formData.appointment_date, "yyyy-MM-dd"),
        appointment_time: formData.appointment_time,
        duration_minutes: formData.duration_minutes,
        session_type: formData.session_type.trim() || "Sessão Individual",
        status: formData.status,
        payment_status: "pending",
        notes: formData.notes.trim() || null,
      });

      if (error) throw error;

      toast.success("Agendamento criado com sucesso!");
      onSuccess?.();
      onClose();
      
      // Reset form
      setFormData({
        client_name: "",
        client_email: "",
        client_phone: "",
        appointment_date: defaultDate || new Date(),
        appointment_time: defaultTime || "09:00:00",
        duration_minutes: 50,
        session_type: "",
        status: "confirmed",
        notes: "",
      });
    } catch (error) {
      console.error("Error creating appointment:", error);
      toast.error("Erro ao criar agendamento");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Novo Agendamento
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Client Name */}
          <div className="space-y-2">
            <Label htmlFor="client_name" className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              Nome do Paciente *
            </Label>
            <Input
              id="client_name"
              placeholder="Nome completo"
              value={formData.client_name}
              onChange={(e) => updateField("client_name", e.target.value)}
              required
            />
          </div>

          {/* Email and Phone */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="client_email" className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                Email
              </Label>
              <Input
                id="client_email"
                type="email"
                placeholder="email@exemplo.com"
                value={formData.client_email}
                onChange={(e) => updateField("client_email", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client_phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                Telefone
              </Label>
              <Input
                id="client_phone"
                placeholder="(00) 00000-0000"
                value={formData.client_phone}
                onChange={(e) => updateField("client_phone", e.target.value)}
              />
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                Data *
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.appointment_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.appointment_date
                      ? format(formData.appointment_date, "dd/MM/yyyy", { locale: ptBR })
                      : "Selecione"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.appointment_date}
                    onSelect={(date) => date && updateField("appointment_date", date)}
                    locale={ptBR}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Horário *
              </Label>
              <Select
                value={formData.appointment_time}
                onValueChange={(v) => updateField("appointment_time", v)}
              >
                <SelectTrigger>
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
          </div>

          {/* Duration and Status */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Duração</Label>
              <Select
                value={String(formData.duration_minutes)}
                onValueChange={(v) => updateField("duration_minutes", parseInt(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DURATION_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={String(opt.value)}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(v) => updateField("status", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Session Type */}
          <div className="space-y-2">
            <Label htmlFor="session_type">Tipo de Sessão</Label>
            <Input
              id="session_type"
              placeholder="Ex: Sessão Individual, Terapia de Casal..."
              value={formData.session_type}
              onChange={(e) => updateField("session_type", e.target.value)}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              placeholder="Notas sobre o agendamento..."
              value={formData.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Criar Agendamento
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default QuickAppointmentModal;
