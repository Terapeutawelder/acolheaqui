import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Clock, Users, Video, Save, Loader2 } from "lucide-react";
import { MemberEvent } from "@/hooks/useMemberEvents";

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: MemberEvent | null;
  onSave: (data: {
    title: string;
    description?: string;
    eventDate: string;
    eventTime: string;
    durationMinutes: number;
    eventType: string;
    meetingUrl?: string;
    maxParticipants?: number;
    isPublished?: boolean;
  }) => Promise<void>;
}

const EventFormModal = ({ isOpen, onClose, event, onSave }: EventFormModalProps) => {
  const [title, setTitle] = useState(event?.title || "");
  const [description, setDescription] = useState(event?.description || "");
  const [eventDate, setEventDate] = useState(event?.eventDate || "");
  const [eventTime, setEventTime] = useState(event?.eventTime?.slice(0, 5) || "");
  const [durationMinutes, setDurationMinutes] = useState(event?.durationMinutes || 60);
  const [eventType, setEventType] = useState(event?.eventType || "live");
  const [meetingUrl, setMeetingUrl] = useState(event?.meetingUrl || "");
  const [maxParticipants, setMaxParticipants] = useState<string>(
    event?.maxParticipants?.toString() || ""
  );
  const [isPublished, setIsPublished] = useState(event?.isPublished ?? true);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !eventDate || !eventTime) return;

    try {
      setSaving(true);
      await onSave({
        title,
        description: description || undefined,
        eventDate,
        eventTime,
        durationMinutes,
        eventType,
        meetingUrl: meetingUrl || undefined,
        maxParticipants: maxParticipants ? parseInt(maxParticipants) : undefined,
        isPublished,
      });
      onClose();
    } catch (error) {
      console.error("Error saving event:", error);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setTitle(event?.title || "");
    setDescription(event?.description || "");
    setEventDate(event?.eventDate || "");
    setEventTime(event?.eventTime?.slice(0, 5) || "");
    setDurationMinutes(event?.durationMinutes || 60);
    setEventType(event?.eventType || "live");
    setMeetingUrl(event?.meetingUrl || "");
    setMaxParticipants(event?.maxParticipants?.toString() || "");
    setIsPublished(event?.isPublished ?? true);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          resetForm();
          onClose();
        }
      }}
    >
      <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            {event ? "Editar Evento" : "Novo Evento"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Título do Evento *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Aula ao Vivo - Introdução"
              className="bg-gray-800 border-gray-700"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o conteúdo do evento..."
              className="bg-gray-800 border-gray-700 min-h-[80px]"
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="eventDate" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Data *
              </Label>
              <Input
                id="eventDate"
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="bg-gray-800 border-gray-700"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eventTime" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Horário *
              </Label>
              <Input
                id="eventTime"
                type="time"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                className="bg-gray-800 border-gray-700"
                required
              />
            </div>
          </div>

          {/* Duration and Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duração (minutos)</Label>
              <Select
                value={durationMinutes.toString()}
                onValueChange={(v) => setDurationMinutes(parseInt(v))}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="30">30 minutos</SelectItem>
                  <SelectItem value="45">45 minutos</SelectItem>
                  <SelectItem value="60">1 hora</SelectItem>
                  <SelectItem value="90">1h30</SelectItem>
                  <SelectItem value="120">2 horas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="eventType">Tipo de Evento</Label>
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger className="bg-gray-800 border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="live">Aula ao Vivo</SelectItem>
                  <SelectItem value="webinar">Webinar</SelectItem>
                  <SelectItem value="workshop">Workshop</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Meeting URL */}
          <div className="space-y-2">
            <Label htmlFor="meetingUrl" className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              Link da Reunião
            </Label>
            <Input
              id="meetingUrl"
              value={meetingUrl}
              onChange={(e) => setMeetingUrl(e.target.value)}
              placeholder="https://meet.google.com/..."
              className="bg-gray-800 border-gray-700"
            />
            <p className="text-xs text-gray-500">
              Cole o link do Google Meet, Zoom ou outra plataforma
            </p>
          </div>

          {/* Max Participants */}
          <div className="space-y-2">
            <Label htmlFor="maxParticipants" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Limite de Participantes
            </Label>
            <Input
              id="maxParticipants"
              type="number"
              min="1"
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(e.target.value)}
              placeholder="Deixe vazio para ilimitado"
              className="bg-gray-800 border-gray-700"
            />
          </div>

          {/* Published Switch */}
          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
            <div>
              <Label htmlFor="published" className="font-medium">
                Publicar Evento
              </Label>
              <p className="text-xs text-gray-500">
                Eventos publicados são visíveis para membros
              </p>
            </div>
            <Switch
              id="published"
              checked={isPublished}
              onCheckedChange={setIsPublished}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-gray-700"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90"
              disabled={saving || !title || !eventDate || !eventTime}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {event ? "Salvar Alterações" : "Criar Evento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EventFormModal;
