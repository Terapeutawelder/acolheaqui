import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  Users,
  Maximize,
  Minimize,
  LogIn
} from "lucide-react";
import { cn } from "@/lib/utils";

const SalaVirtual = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const [patientName, setPatientName] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [isInRoom, setIsInRoom] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [peerConnected, setPeerConnected] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const roomContainerRef = useRef<HTMLDivElement>(null);

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

  const createPeerConnection = (stream: MediaStream): RTCPeerConnection => {
    const configuration: RTCConfiguration = {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
      ]
    };
    
    const pc = new RTCPeerConnection(configuration);
    
    stream.getTracks().forEach(track => {
      pc.addTrack(track, stream);
    });
    
    pc.ontrack = (event) => {
      console.log("Remote track received:", event.streams[0]);
      setRemoteStream(event.streams[0]);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
      setPeerConnected(true);
    };
    
    pc.onconnectionstatechange = () => {
      console.log("Connection state:", pc.connectionState);
      if (pc.connectionState === "connected") {
        setPeerConnected(true);
        toast.success("Conectado à sessão!");
      } else if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
        setPeerConnected(false);
        toast.info("Profissional desconectado");
      }
    };
    
    return pc;
  };

  const joinRoom = async () => {
    if (!patientName.trim()) {
      toast.error("Por favor, digite seu nome");
      return;
    }
    
    if (!roomCode) {
      toast.error("Código da sala inválido");
      return;
    }
    
    setIsJoining(true);
    try {
      const stream = await startLocalStream();
      
      const storedOffer = localStorage.getItem(`room_${roomCode.toUpperCase()}_offer`);
      if (!storedOffer) {
        toast.error("Sala não encontrada ou expirada. Verifique o código e tente novamente.");
        setIsJoining(false);
        return;
      }
      
      const pc = createPeerConnection(stream);
      peerConnectionRef.current = pc;
      
      const offer = JSON.parse(storedOffer);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      
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
      
      localStorage.setItem(`room_${roomCode.toUpperCase()}_answer`, JSON.stringify(pc.localDescription));
      localStorage.setItem(`room_${roomCode.toUpperCase()}_patient_name`, patientName);
      
      setIsInRoom(true);
      toast.success("Conectado à sala!");
      
    } catch (error) {
      console.error("Error joining room:", error);
      toast.error("Erro ao entrar na sala");
    } finally {
      setIsJoining(false);
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const leaveRoom = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    
    setIsInRoom(false);
    setRemoteStream(null);
    setPeerConnected(false);
    
    toast.info("Você saiu da sala");
    navigate("/");
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      roomContainerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, []);

  // Pre-room view (join form)
  if (!isInRoom) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card border-border/50 shadow-xl">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Video className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Sala Virtual</CardTitle>
            <CardDescription>
              {roomCode ? (
                <>Entre na sala <strong className="text-primary">{roomCode}</strong></>
              ) : (
                "Digite o código da sala para entrar"
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="patientName">Seu nome</Label>
              <Input
                id="patientName"
                placeholder="Digite seu nome completo"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
              />
            </div>
            
            {!roomCode && (
              <div className="space-y-2">
                <Label htmlFor="roomCodeInput">Código da sala</Label>
                <Input
                  id="roomCodeInput"
                  placeholder="Ex: ABC12345"
                  className="uppercase"
                  maxLength={8}
                />
              </div>
            )}
            
            <Button 
              onClick={joinRoom} 
              disabled={isJoining || !patientName.trim()}
              className="w-full"
              size="lg"
            >
              {isJoining ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Conectando...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Entrar na Sala
                </>
              )}
            </Button>
            
            <p className="text-xs text-center text-muted-foreground">
              Ao entrar, você concorda em permitir acesso à sua câmera e microfone
            </p>
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
        "min-h-screen bg-background p-4",
        isFullscreen && "fixed inset-0 z-50 bg-background"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
            Ao vivo
          </Badge>
          <span className="text-sm text-muted-foreground">Sala: {roomCode}</span>
        </div>
        <Badge variant={peerConnected ? "default" : "secondary"}>
          <Users className="h-3 w-3 mr-1" />
          {peerConnected ? "Conectado" : "Aguardando..."}
        </Badge>
      </div>

      {/* Video grid */}
      <div className={cn(
        "grid gap-4 mb-20",
        peerConnected ? "md:grid-cols-2" : "grid-cols-1"
      )}>
        {/* Remote video (professional) */}
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
                Profissional
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
              Você ({patientName})
            </Badge>
          </div>
        </div>
      </div>

      {/* Waiting message */}
      {!peerConnected && (
        <div className="text-center p-6 rounded-xl bg-muted/30 border border-border/50">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <h3 className="text-lg font-medium mb-2">Aguardando profissional</h3>
          <p className="text-sm text-muted-foreground">
            O profissional será notificado da sua chegada
          </p>
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
          Sair
        </Button>
      </div>
    </div>
  );
};

export default SalaVirtual;
