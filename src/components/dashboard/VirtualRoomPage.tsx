import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff, 
  Copy, 
  Users, 
  MonitorUp,
  Settings,
  MessageSquare,
  Maximize,
  Minimize,
  Circle,
  Square,
  FileText,
  Download
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranscription } from "@/hooks/useTranscription";
import { useRecording, formatRecordingTime } from "@/hooks/useRecording";

interface VirtualRoomPageProps {
  profileId: string;
}

interface TranscriptEntry {
  id: string;
  speaker: "professional" | "patient";
  text: string;
  timestamp: Date;
  isFinal: boolean;
}

const VirtualRoomPage = ({ profileId }: VirtualRoomPageProps) => {
  const [roomId, setRoomId] = useState<string>("");
  const [isInRoom, setIsInRoom] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [peerConnected, setPeerConnected] = useState(false);
  const [showTranscripts, setShowTranscripts] = useState(false);
  const [combinedTranscripts, setCombinedTranscripts] = useState<TranscriptEntry[]>([]);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const roomContainerRef = useRef<HTMLDivElement>(null);
  const transcriptsEndRef = useRef<HTMLDivElement>(null);

  // Transcription hook
  const {
    isTranscribing,
    transcripts,
    startTranscription,
    stopTranscription,
    exportTranscripts,
  } = useTranscription("professional");

  // Recording hook
  const {
    isRecording,
    recordingTime,
    startRecording,
    stopRecording,
    downloadRecording,
  } = useRecording();

  // Update combined transcripts when local transcripts change
  useEffect(() => {
    setCombinedTranscripts(prev => {
      const existingIds = new Set(prev.map(t => t.id));
      const newTranscripts = transcripts.filter(t => !existingIds.has(t.id));
      if (newTranscripts.length === 0) return prev;
      return [...prev, ...newTranscripts].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    });
  }, [transcripts]);

  // Auto-scroll transcripts
  useEffect(() => {
    transcriptsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [combinedTranscripts]);

  // Generate unique room ID
  const generateRoomId = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Get user media
  const startLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      return stream;
    } catch (error) {
      console.error("Error accessing media devices:", error);
      toast.error("Não foi possível acessar câmera/microfone. Verifique as permissões.");
      throw error;
    }
  };

  // Create room as host
  const createRoom = async () => {
    setIsConnecting(true);
    try {
      const stream = await startLocalStream();
      const newRoomId = generateRoomId();
      setRoomId(newRoomId);
      setIsHost(true);
      setIsInRoom(true);
      
      // Store offer in localStorage for demo (in production, use Supabase or signaling server)
      const pc = createPeerConnection(stream);
      peerConnectionRef.current = pc;
      
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      // Wait for ICE gathering to complete
      await new Promise<void>((resolve) => {
        if (pc.iceGatheringState === "complete") {
          resolve();
        } else {
          const checkState = () => {
            if (pc.iceGatheringState === "complete") {
              pc.removeEventListener("icegatheringstatechange", checkState);
              resolve();
            }
          };
          pc.addEventListener("icegatheringstatechange", checkState);
        }
      });
      
      // Store the offer
      localStorage.setItem(`room_${newRoomId}_offer`, JSON.stringify(pc.localDescription));
      
      toast.success("Sala criada com sucesso!");
      toast.info("Compartilhe o código da sala com seu paciente.");
      
    } catch (error) {
      console.error("Error creating room:", error);
      toast.error("Erro ao criar sala");
    } finally {
      setIsConnecting(false);
    }
  };

  // Join existing room
  const joinRoom = async () => {
    if (!roomId.trim()) {
      toast.error("Digite o código da sala");
      return;
    }
    
    setIsConnecting(true);
    try {
      const stream = await startLocalStream();
      setIsHost(false);
      setIsInRoom(true);
      
      // Get the stored offer
      const storedOffer = localStorage.getItem(`room_${roomId.toUpperCase()}_offer`);
      if (!storedOffer) {
        toast.error("Sala não encontrada ou expirada");
        setIsInRoom(false);
        return;
      }
      
      const pc = createPeerConnection(stream);
      peerConnectionRef.current = pc;
      
      const offer = JSON.parse(storedOffer);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      
      // Wait for ICE gathering
      await new Promise<void>((resolve) => {
        if (pc.iceGatheringState === "complete") {
          resolve();
        } else {
          const checkState = () => {
            if (pc.iceGatheringState === "complete") {
              pc.removeEventListener("icegatheringstatechange", checkState);
              resolve();
            }
          };
          pc.addEventListener("icegatheringstatechange", checkState);
        }
      });
      
      // Store the answer
      localStorage.setItem(`room_${roomId.toUpperCase()}_answer`, JSON.stringify(pc.localDescription));
      
      toast.success("Conectado à sala!");
      
    } catch (error) {
      console.error("Error joining room:", error);
      toast.error("Erro ao entrar na sala");
    } finally {
      setIsConnecting(false);
    }
  };

  // Check for answer (host polling)
  useEffect(() => {
    if (!isHost || !isInRoom || !roomId) return;
    
    const checkForAnswer = setInterval(async () => {
      const storedAnswer = localStorage.getItem(`room_${roomId}_answer`);
      if (storedAnswer && peerConnectionRef.current) {
        try {
          const answer = JSON.parse(storedAnswer);
          if (peerConnectionRef.current.signalingState === "have-local-offer") {
            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
            clearInterval(checkForAnswer);
          }
        } catch (error) {
          console.error("Error processing answer:", error);
        }
      }
    }, 1000);
    
    return () => clearInterval(checkForAnswer);
  }, [isHost, isInRoom, roomId]);

  // Create peer connection
  const createPeerConnection = (stream: MediaStream): RTCPeerConnection => {
    const configuration: RTCConfiguration = {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
      ]
    };
    
    const pc = new RTCPeerConnection(configuration);
    
    // Add local tracks
    stream.getTracks().forEach(track => {
      pc.addTrack(track, stream);
    });
    
    // Handle remote tracks
    pc.ontrack = (event) => {
      console.log("Remote track received:", event.streams[0]);
      setRemoteStream(event.streams[0]);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
      setPeerConnected(true);
    };
    
    // Handle connection state
    pc.onconnectionstatechange = () => {
      console.log("Connection state:", pc.connectionState);
      if (pc.connectionState === "connected") {
        setPeerConnected(true);
        toast.success("Participante conectado!");
      } else if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
        setPeerConnected(false);
        toast.info("Participante desconectado");
      }
    };
    
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("ICE candidate:", event.candidate);
      }
    };
    
    return pc;
  };

  // Toggle audio
  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  // Toggle transcription
  const toggleTranscription = () => {
    if (isTranscribing) {
      stopTranscription();
      toast.info("Transcrição pausada");
    } else {
      startTranscription();
      toast.success("Transcrição iniciada");
    }
  };

  // Toggle recording
  const toggleRecording = async () => {
    if (isRecording) {
      const blob = await stopRecording();
      if (blob) {
        downloadRecording(blob, `sessao_${roomId}_${new Date().toISOString().slice(0, 10)}.webm`);
      }
    } else if (localStream) {
      // Combine local and remote streams for recording
      const combinedStream = new MediaStream();
      localStream.getTracks().forEach(track => combinedStream.addTrack(track));
      if (remoteStream) {
        remoteStream.getTracks().forEach(track => combinedStream.addTrack(track));
      }
      startRecording(combinedStream);
    }
  };

  // Export transcripts
  const handleExportTranscripts = () => {
    const text = combinedTranscripts.map((t) => {
      const time = t.timestamp.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      const speakerLabel = t.speaker === "professional" ? "Profissional" : "Paciente";
      return `[${time}] ${speakerLabel}: ${t.text}`;
    }).join("\n");

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transcricao_${roomId}_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Transcrição exportada");
  };

  // Leave room
  const leaveRoom = async () => {
    // Stop recording if active
    if (isRecording) {
      const blob = await stopRecording();
      if (blob) {
        downloadRecording(blob, `sessao_${roomId}_${new Date().toISOString().slice(0, 10)}.webm`);
      }
    }

    // Stop transcription
    if (isTranscribing) {
      stopTranscription();
    }

    // Export transcripts if any
    if (combinedTranscripts.length > 0) {
      handleExportTranscripts();
    }

    // Stop all tracks
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    
    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    
    // Clean up storage
    if (roomId) {
      localStorage.removeItem(`room_${roomId}_offer`);
      localStorage.removeItem(`room_${roomId}_answer`);
    }
    
    setIsInRoom(false);
    setRoomId("");
    setRemoteStream(null);
    setPeerConnected(false);
    setIsHost(false);
    setCombinedTranscripts([]);
    
    toast.info("Você saiu da sala");
  };

  // Copy room link
  const copyRoomLink = () => {
    const link = `${window.location.origin}/sala/${roomId}`;
    navigator.clipboard.writeText(link);
    toast.success("Link da sala copiado!");
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      roomContainerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      if (isTranscribing) {
        stopTranscription();
      }
    };
  }, []);

  // Pre-room view
  if (!isInRoom) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Sala Virtual</h2>
          <p className="text-muted-foreground">
            Realize atendimentos online diretamente pela plataforma
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Create Room */}
          <Card className="bg-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5 text-primary" />
                Criar Nova Sala
              </CardTitle>
              <CardDescription>
                Crie uma sala de videoconferência e compartilhe o código com seu paciente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={createRoom} 
                disabled={isConnecting}
                className="w-full"
              >
                {isConnecting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Criando sala...
                  </>
                ) : (
                  <>
                    <Video className="mr-2 h-4 w-4" />
                    Criar Sala
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Join Room */}
          <Card className="bg-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Entrar em Sala
              </CardTitle>
              <CardDescription>
                Digite o código da sala para entrar em uma videoconferência existente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="roomCode">Código da Sala</Label>
                <Input
                  id="roomCode"
                  placeholder="Digite o código (ex: ABC12345)"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                  className="uppercase"
                  maxLength={8}
                />
              </div>
              <Button 
                onClick={joinRoom} 
                disabled={isConnecting || !roomId.trim()}
                variant="secondary"
                className="w-full"
              >
                {isConnecting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                    Conectando...
                  </>
                ) : (
                  <>
                    <Users className="mr-2 h-4 w-4" />
                    Entrar na Sala
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="bg-muted/30 border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Como funciona?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">1</Badge>
              <p className="text-sm text-muted-foreground">
                Clique em <strong>"Criar Sala"</strong> para iniciar uma nova videoconferência
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">2</Badge>
              <p className="text-sm text-muted-foreground">
                Copie o <strong>link da sala</strong> e envie para seu paciente via WhatsApp ou e-mail
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">3</Badge>
              <p className="text-sm text-muted-foreground">
                O paciente entra na sala acessando o link compartilhado
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">4</Badge>
              <p className="text-sm text-muted-foreground">
                Use a <strong>transcrição automática</strong> e <strong>gravação</strong> para documentar a sessão
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // In-room view
  return (
    <div 
      ref={roomContainerRef}
      className={cn(
        "relative",
        isFullscreen && "fixed inset-0 z-50 bg-background p-4"
      )}
    >
      {/* Room header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
            Ao vivo
          </Badge>
          {isRecording && (
            <Badge variant="destructive" className="animate-pulse">
              <Circle className="h-3 w-3 mr-1 fill-current" />
              REC {formatRecordingTime(recordingTime)}
            </Badge>
          )}
          {isTranscribing && (
            <Badge variant="secondary">
              <FileText className="h-3 w-3 mr-1" />
              Transcrevendo
            </Badge>
          )}
          <span className="text-sm text-muted-foreground">Sala: {roomId}</span>
          <Button size="sm" variant="ghost" onClick={copyRoomLink}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            variant={showTranscripts ? "default" : "outline"} 
            onClick={() => setShowTranscripts(!showTranscripts)}
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            Transcrição
          </Button>
          <Badge variant={peerConnected ? "default" : "secondary"}>
            <Users className="h-3 w-3 mr-1" />
            {peerConnected ? "2 participantes" : "Aguardando..."}
          </Badge>
        </div>
      </div>

      <div className="flex gap-4">
        {/* Video grid */}
        <div className={cn(
          "flex-1 grid gap-4",
          peerConnected ? "md:grid-cols-2" : "grid-cols-1"
        )}>
          {/* Remote video (main) */}
          {peerConnected && (
            <div className="relative aspect-video bg-muted rounded-xl overflow-hidden border border-border/50">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3">
                <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                  Paciente
                </Badge>
              </div>
            </div>
          )}

          {/* Local video */}
          <div className={cn(
            "relative aspect-video bg-muted rounded-xl overflow-hidden border border-border/50",
            peerConnected ? "" : "max-w-2xl mx-auto w-full"
          )}>
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={cn(
                "w-full h-full object-cover",
                isVideoOff && "hidden"
              )}
            />
            {isVideoOff && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <div className="text-center">
                  <VideoOff className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Câmera desligada</p>
                </div>
              </div>
            )}
            <div className="absolute bottom-3 left-3">
              <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                Você {isHost && "(Anfitrião)"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Transcripts panel */}
        {showTranscripts && (
          <div className="w-80 flex flex-col bg-card border border-border/50 rounded-xl overflow-hidden">
            <div className="p-3 border-b border-border/50 flex items-center justify-between">
              <h3 className="font-medium text-sm">Transcrição</h3>
              <div className="flex gap-1">
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={handleExportTranscripts}
                  disabled={combinedTranscripts.length === 0}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <ScrollArea className="flex-1 p-3">
              {combinedTranscripts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {isTranscribing ? "Aguardando fala..." : "Inicie a transcrição para capturar a conversa"}
                </p>
              ) : (
                <div className="space-y-3">
                  {combinedTranscripts.map((t) => (
                    <div 
                      key={t.id} 
                      className={cn(
                        "text-sm p-2 rounded-lg",
                        t.speaker === "professional" 
                          ? "bg-primary/10 ml-2" 
                          : "bg-muted mr-2"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-xs">
                          {t.speaker === "professional" ? "Você" : "Paciente"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {t.timestamp.toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-foreground">{t.text}</p>
                    </div>
                  ))}
                  <div ref={transcriptsEndRef} />
                </div>
              )}
            </ScrollArea>
          </div>
        )}
      </div>

      {/* Waiting message */}
      {!peerConnected && (
        <div className="mt-6 text-center p-6 rounded-xl bg-muted/30 border border-border/50">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <h3 className="text-lg font-medium mb-2">Aguardando participante</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Compartilhe o link <strong className="text-primary">{window.location.origin}/sala/{roomId}</strong> com seu paciente
          </p>
          <Button variant="outline" size="sm" onClick={copyRoomLink}>
            <Copy className="h-4 w-4 mr-2" />
            Copiar link
          </Button>
        </div>
      )}

      {/* Controls */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 p-3 rounded-2xl bg-card/90 backdrop-blur-xl border border-border/50 shadow-lg">
        <Button
          size="lg"
          variant={isMuted ? "destructive" : "secondary"}
          className="rounded-xl"
          onClick={toggleAudio}
        >
          {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </Button>
        
        <Button
          size="lg"
          variant={isVideoOff ? "destructive" : "secondary"}
          className="rounded-xl"
          onClick={toggleVideo}
        >
          {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
        </Button>

        <div className="w-px h-8 bg-border" />

        <Button
          size="lg"
          variant={isTranscribing ? "default" : "secondary"}
          className="rounded-xl"
          onClick={toggleTranscription}
          title={isTranscribing ? "Parar transcrição" : "Iniciar transcrição"}
        >
          <FileText className="h-5 w-5" />
        </Button>

        <Button
          size="lg"
          variant={isRecording ? "destructive" : "secondary"}
          className="rounded-xl"
          onClick={toggleRecording}
          title={isRecording ? "Parar gravação" : "Iniciar gravação"}
        >
          {isRecording ? <Square className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
        </Button>

        <div className="w-px h-8 bg-border" />
        
        <Button
          size="lg"
          variant="secondary"
          className="rounded-xl"
          onClick={toggleFullscreen}
        >
          {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
        </Button>
        
        <div className="w-px h-8 bg-border" />
        
        <Button
          size="lg"
          variant="destructive"
          className="rounded-xl px-6"
          onClick={leaveRoom}
        >
          <PhoneOff className="h-5 w-5 mr-2" />
          Encerrar
        </Button>
      </div>
    </div>
  );
};

export default VirtualRoomPage;
