import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Video, FileText, Download, Play, ExternalLink, Copy, Loader2 } from "lucide-react";

interface TranscriptEntry {
  id: string;
  speaker: "professional" | "patient";
  text: string;
  timestamp: string;
  isFinal: boolean;
}

interface AppointmentSessionDetailsProps {
  appointment: {
    id: string;
    client_name: string;
    appointment_date: string;
    virtual_room_code?: string | null;
    virtual_room_link?: string | null;
    recording_url?: string | null;
    transcription?: TranscriptEntry[] | null;
  };
  isOpen: boolean;
  onClose: () => void;
}

export function AppointmentSessionDetails({
  appointment,
  isOpen,
  onClose,
}: AppointmentSessionDetailsProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleCopyLink = async () => {
    if (appointment.virtual_room_link) {
      await navigator.clipboard.writeText(appointment.virtual_room_link);
      toast.success("Link copiado!");
    }
  };

  const handleDownloadRecording = async () => {
    if (!appointment.recording_url) return;

    setIsDownloading(true);
    try {
      const { data, error } = await supabase.storage
        .from("session-recordings")
        .download(appointment.recording_url);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `gravacao_${appointment.client_name}_${appointment.appointment_date}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Download iniciado!");
    } catch (error) {
      console.error("Error downloading recording:", error);
      toast.error("Erro ao baixar gravação");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleExportTranscription = () => {
    if (!appointment.transcription || appointment.transcription.length === 0) return;

    const text = appointment.transcription
      .map((t) => {
        const time = new Date(t.timestamp).toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
        const speakerLabel = t.speaker === "professional" ? "Profissional" : "Paciente";
        return `[${time}] ${speakerLabel}: ${t.text}`;
      })
      .join("\n");

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transcricao_${appointment.client_name}_${appointment.appointment_date}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Transcrição exportada!");
  };

  const hasSessionData = appointment.recording_url || (appointment.transcription && appointment.transcription.length > 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" />
            Detalhes da Sessão - {appointment.client_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Virtual Room Link */}
          {appointment.virtual_room_link && (
            <div className="p-4 bg-muted/50 rounded-lg border border-border">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Link da Sala Virtual</p>
                  <p className="text-xs text-muted-foreground break-all">
                    {appointment.virtual_room_link}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button variant="outline" size="sm" onClick={handleCopyLink}>
                    <Copy className="h-4 w-4 mr-1" />
                    Copiar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(appointment.virtual_room_link!, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Abrir
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Recording */}
          {appointment.recording_url && (
            <div className="p-4 bg-muted/50 rounded-lg border border-border">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Play className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Gravação da Sessão</p>
                    <p className="text-xs text-muted-foreground">
                      Arquivo de vídeo disponível para download
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadRecording}
                  disabled={isDownloading}
                >
                  {isDownloading ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-1" />
                  )}
                  Baixar
                </Button>
              </div>
            </div>
          )}

          {/* Transcription */}
          {appointment.transcription && appointment.transcription.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <p className="font-medium text-foreground">Transcrição</p>
                  <Badge variant="secondary" className="text-xs">
                    {appointment.transcription.length} mensagens
                  </Badge>
                </div>
                <Button variant="outline" size="sm" onClick={handleExportTranscription}>
                  <Download className="h-4 w-4 mr-1" />
                  Exportar TXT
                </Button>
              </div>

              <ScrollArea className="h-64 rounded-lg border border-border p-4">
                <div className="space-y-3">
                  {appointment.transcription.map((entry) => (
                    <div
                      key={entry.id}
                      className={`flex gap-3 ${
                        entry.speaker === "professional" ? "" : "flex-row-reverse"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          entry.speaker === "professional"
                            ? "bg-primary/10 text-foreground"
                            : "bg-muted text-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium">
                            {entry.speaker === "professional" ? "Profissional" : "Paciente"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(entry.timestamp).toLocaleTimeString("pt-BR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-sm">{entry.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* No Session Data */}
          {!hasSessionData && !appointment.virtual_room_link && (
            <div className="text-center py-8 text-muted-foreground">
              <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum dado de sessão disponível</p>
              <p className="text-sm">A gravação e transcrição aparecerão aqui após a sessão.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}