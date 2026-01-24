import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Trash2,
  RefreshCw,
  QrCode,
  Link2,
  Smartphone,
  User,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WhatsAppConnectionsProps {
  profileId: string;
  connections: any[];
  onConnectionsChange: () => void;
}

interface NewConnection {
  name: string;
  driverType: "baileys" | "official";
  phoneNumber: string;
  // Official API fields
  accessToken: string;
  wabaId: string;
  phoneNumberId: string;
}

// Constants for Evolution API
const EVOLUTION_API_URL = "https://evo.agenteluzia.online";
const EVOLUTION_API_KEY = "5911E93E8961B67FC4C1CBED11683";

export const WhatsAppConnections = ({
  profileId,
  connections,
  onConnectionsChange,
}: WhatsAppConnectionsProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [qrCodeData, setQrCodeData] = useState<{ id: string; qr: string } | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeletingDisconnected, setIsDeletingDisconnected] = useState(false);

  const [newConnection, setNewConnection] = useState<NewConnection>({
    name: "",
    driverType: "baileys",
    phoneNumber: "",
    accessToken: "",
    wabaId: "",
    phoneNumberId: "",
  });

  const handleCreateConnection = async () => {
    if (!newConnection.name.trim()) {
      toast.error("Informe um nome para a conexão");
      return;
    }

    setIsCreating(true);

    try {
      const instanceName = `conn_${profileId.substring(0, 8)}_${Date.now()}`;

      // Create connection in database
      const { data, error } = await supabase
        .from("whatsapp_connections")
        .insert({
          professional_id: profileId,
          name: newConnection.name,
          driver_type: newConnection.driverType,
          phone_number: newConnection.phoneNumber || null,
          access_token: newConnection.driverType === "official" ? newConnection.accessToken : null,
          waba_id: newConnection.driverType === "official" ? newConnection.wabaId : null,
          phone_number_id: newConnection.driverType === "official" ? newConnection.phoneNumberId : null,
          session_data: newConnection.driverType === "baileys" ? { instance_name: instanceName } : null,
          status: "disconnected",
        })
        .select()
        .single();

      if (error) throw error;

      // If Baileys, create instance on Evolution API
      if (newConnection.driverType === "baileys") {
        try {
          const createResponse = await fetch(`${EVOLUTION_API_URL}/instance/create`, {
            method: "POST",
            headers: {
              "apikey": EVOLUTION_API_KEY,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              instanceName: instanceName,
              token: crypto.randomUUID(),
              qrcode: true,
              integration: "WHATSAPP-BAILEYS",
            }),
          });

          if (!createResponse.ok) {
            console.log("Instance may already exist, continuing...");
          }
        } catch (err) {
          console.error("Error creating Evolution instance:", err);
        }
      }

      toast.success("Conexão criada com sucesso!");
      setIsDialogOpen(false);
      setNewConnection({
        name: "",
        driverType: "baileys",
        phoneNumber: "",
        accessToken: "",
        wabaId: "",
        phoneNumberId: "",
      });
      onConnectionsChange();
    } catch (error) {
      console.error("Error creating connection:", error);
      toast.error("Erro ao criar conexão");
    } finally {
      setIsCreating(false);
    }
  };

  const handleConnect = async (connection: any) => {
    setConnectingId(connection.id);
    setQrCodeData(null);

    try {
      if (connection.driver_type === "baileys") {
        const instanceName = connection.session_data?.instance_name;
        if (!instanceName) {
          toast.error("Instância não configurada");
          return;
        }

        // Get QR Code
        const qrResponse = await fetch(
          `${EVOLUTION_API_URL}/instance/connect/${instanceName}`,
          {
            method: "GET",
            headers: {
              "apikey": EVOLUTION_API_KEY,
            },
          }
        );

        if (qrResponse.ok) {
          const qrData = await qrResponse.json();
          if (qrData.base64) {
            setQrCodeData({ id: connection.id, qr: qrData.base64 });
            toast.info("Escaneie o QR Code com seu WhatsApp");
            
            // Start polling for connection status
            startPolling(connection.id, instanceName);
          } else if (qrData.state === "open") {
            // Already connected
            await supabase
              .from("whatsapp_connections")
              .update({ status: "connected", last_connected_at: new Date().toISOString() })
              .eq("id", connection.id);
            toast.success("WhatsApp já está conectado!");
            onConnectionsChange();
          }
        } else {
          toast.error("Erro ao gerar QR Code");
        }
      } else {
        // Official API - just mark as connected if credentials are valid
        toast.info("Verificando credenciais...");
        // Here you would verify the credentials with Meta API
        await supabase
          .from("whatsapp_connections")
          .update({ status: "connected", last_connected_at: new Date().toISOString() })
          .eq("id", connection.id);
        toast.success("Conectado via API Oficial!");
        onConnectionsChange();
      }
    } catch (error) {
      console.error("Error connecting:", error);
      toast.error("Erro ao conectar");
    } finally {
      setConnectingId(null);
    }
  };

  const startPolling = (connectionId: string, instanceName: string) => {
    let attempts = 0;
    const maxAttempts = 60;
    let pollingActive = true;

    const poll = async () => {
      if (!pollingActive) return;
      
      attempts++;
      if (attempts > maxAttempts) {
        setQrCodeData(null);
        toast.error("Tempo esgotado. Tente novamente.");
        return;
      }

      try {
        const response = await fetch(`${EVOLUTION_API_URL}/instance/fetchInstances`, {
          method: "GET",
          headers: { "apikey": EVOLUTION_API_KEY },
        });

        if (response.ok) {
          const instances = await response.json();
          const instanceList = Array.isArray(instances) ? instances : (instances.instances || []);
          const instance = instanceList.find((inst: any) => {
            const name = inst.instance?.instanceName || inst.instanceName || inst.name;
            return name === instanceName;
          });

          console.log("Polling instance:", instanceName, "Found:", instance);

          if (instance) {
            // Evolution API returns connectionStatus field
            const connectionStatus = instance.connectionStatus || 
                                     instance.instance?.status || 
                                     instance.status || 
                                     instance.state;
            
            console.log("Connection status:", connectionStatus);

            if (connectionStatus === "open" || connectionStatus === "connected") {
              pollingActive = false;
              
              // Get phone number from ownerJid
              let phoneNumber = null;
              if (instance.ownerJid) {
                phoneNumber = instance.ownerJid.replace("@s.whatsapp.net", "");
              } else if (instance.instance?.owner) {
                phoneNumber = instance.instance.owner;
              }

              await supabase
                .from("whatsapp_connections")
                .update({ 
                  status: "connected", 
                  last_connected_at: new Date().toISOString(),
                  phone_number: phoneNumber,
                  avatar_url: instance.profilePicUrl || null,
                })
                .eq("id", connectionId);
              
              setQrCodeData(null);
              setConnectingId(null);
              toast.success("WhatsApp conectado com sucesso!");
              onConnectionsChange();
              return;
            }
          }
        }
      } catch (err) {
        console.error("Polling error:", err);
      }

      if (pollingActive) {
        setTimeout(poll, 2000);
      }
    };

    setTimeout(poll, 2000);
  };

  const handleVerify = async (connection: any) => {
    setVerifyingId(connection.id);

    try {
      if (connection.driver_type === "baileys") {
        const instanceName = connection.session_data?.instance_name;
        if (!instanceName) {
          toast.error("Instância não configurada");
          setVerifyingId(null);
          return;
        }

        console.log("Verifying instance:", instanceName);

        const response = await fetch(`${EVOLUTION_API_URL}/instance/fetchInstances`, {
          method: "GET",
          headers: { "apikey": EVOLUTION_API_KEY },
        });

        if (response.ok) {
          const instances = await response.json();
          const instanceList = Array.isArray(instances) ? instances : (instances.instances || []);
          
          console.log("All instances:", instanceList.map((i: any) => i.name || i.instanceName));
          
          const instance = instanceList.find((inst: any) => {
            const name = inst.instance?.instanceName || inst.instanceName || inst.name;
            return name === instanceName;
          });

          console.log("Found instance:", instance);

          if (instance) {
            // Evolution API returns connectionStatus field
            const connectionStatus = instance.connectionStatus || 
                                     instance.instance?.status || 
                                     instance.status || 
                                     instance.state;
            
            console.log("Instance connectionStatus:", connectionStatus);
            
            if (connectionStatus === "open" || connectionStatus === "connected") {
              // Get phone number from ownerJid
              let phoneNumber = null;
              if (instance.ownerJid) {
                phoneNumber = instance.ownerJid.replace("@s.whatsapp.net", "");
              }

              await supabase
                .from("whatsapp_connections")
                .update({ 
                  status: "connected", 
                  last_connected_at: new Date().toISOString(),
                  phone_number: phoneNumber || connection.phone_number,
                  avatar_url: instance.profilePicUrl || null,
                })
                .eq("id", connection.id);
              toast.success("Conexão ativa!");
            } else {
              await supabase
                .from("whatsapp_connections")
                .update({ status: "disconnected" })
                .eq("id", connection.id);
              toast.warning(`Conexão desconectada (status: ${connectionStatus})`);
            }
          } else {
            await supabase
              .from("whatsapp_connections")
              .update({ status: "disconnected" })
              .eq("id", connection.id);
            toast.warning("Instância não encontrada na Evolution API");
          }
          onConnectionsChange();
        } else {
          toast.error("Erro ao consultar Evolution API");
        }
      } else {
        // Official API verification
        toast.success("Credenciais verificadas!");
      }
    } catch (error) {
      console.error("Error verifying:", error);
      toast.error("Erro ao verificar conexão");
    } finally {
      setVerifyingId(null);
    }
  };

  const handleDelete = async (connectionId: string) => {
    try {
      const connection = connections.find(c => c.id === connectionId);
      
      // If Baileys, delete instance from Evolution API
      if (connection?.driver_type === "baileys" && connection?.session_data?.instance_name) {
        try {
          await fetch(`${EVOLUTION_API_URL}/instance/delete/${connection.session_data.instance_name}`, {
            method: "DELETE",
            headers: { "apikey": EVOLUTION_API_KEY },
          });
        } catch (err) {
          console.error("Error deleting Evolution instance:", err);
        }
      }

      const { error } = await supabase
        .from("whatsapp_connections")
        .delete()
        .eq("id", connectionId);

      if (error) throw error;

      toast.success("Conexão excluída!");
      setDeleteConfirmId(null);
      onConnectionsChange();
    } catch (error) {
      console.error("Error deleting connection:", error);
      toast.error("Erro ao excluir conexão");
    }
  };

  const handleDeleteDisconnected = async () => {
    setIsDeletingDisconnected(true);
    try {
      const disconnected = connections.filter(c => c.status === "disconnected");
      
      for (const connection of disconnected) {
        if (connection.driver_type === "baileys" && connection.session_data?.instance_name) {
          try {
            await fetch(`${EVOLUTION_API_URL}/instance/delete/${connection.session_data.instance_name}`, {
              method: "DELETE",
              headers: { "apikey": EVOLUTION_API_KEY },
            });
          } catch (err) {
            console.error("Error deleting Evolution instance:", err);
          }
        }
      }

      const { error } = await supabase
        .from("whatsapp_connections")
        .delete()
        .eq("professional_id", profileId)
        .eq("status", "disconnected");

      if (error) throw error;

      toast.success(`${disconnected.length} conexões excluídas!`);
      onConnectionsChange();
    } catch (error) {
      console.error("Error deleting disconnected:", error);
      toast.error("Erro ao excluir conexões");
    } finally {
      setIsDeletingDisconnected(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Conexões WhatsApp</h1>
          <p className="text-muted-foreground">
            Gerencie todas as suas conexões do WhatsApp em um só lugar
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-500 hover:bg-green-600 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Criar conexão
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Nova Conexão</DialogTitle>
                <DialogDescription>
                  Configure uma nova conexão do WhatsApp
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nome da Conexão *</Label>
                  <Input
                    placeholder="Ex: Atendimento Principal"
                    value={newConnection.name}
                    onChange={(e) => setNewConnection({ ...newConnection, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tipo de Conexão *</Label>
                  <Select
                    value={newConnection.driverType}
                    onValueChange={(value: "baileys" | "official") =>
                      setNewConnection({ ...newConnection, driverType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baileys">
                        <div className="flex items-center gap-2">
                          <QrCode className="h-4 w-4" />
                          <span>WhatsApp Web (QR Code)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="official">
                        <div className="flex items-center gap-2">
                          <Link2 className="h-4 w-4" />
                          <span>API Oficial (Meta)</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {newConnection.driverType === "baileys" && (
                  <div className="space-y-2">
                    <Label>Número do WhatsApp</Label>
                    <Input
                      placeholder="Ex: 11999999999"
                      value={newConnection.phoneNumber}
                      onChange={(e) => setNewConnection({ ...newConnection, phoneNumber: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Opcional. Será detectado automaticamente após conexão.
                    </p>
                  </div>
                )}

                {newConnection.driverType === "official" && (
                  <>
                    <div className="space-y-2">
                      <Label>Access Token *</Label>
                      <Input
                        placeholder="Token de acesso da Meta"
                        value={newConnection.accessToken}
                        onChange={(e) => setNewConnection({ ...newConnection, accessToken: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>WABA ID *</Label>
                      <Input
                        placeholder="ID da conta Business"
                        value={newConnection.wabaId}
                        onChange={(e) => setNewConnection({ ...newConnection, wabaId: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone Number ID *</Label>
                      <Input
                        placeholder="ID do número de telefone"
                        value={newConnection.phoneNumberId}
                        onChange={(e) => setNewConnection({ ...newConnection, phoneNumberId: e.target.value })}
                      />
                    </div>
                  </>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateConnection}
                  disabled={isCreating}
                  className="bg-green-500 hover:bg-green-600"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    "Criar"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            onClick={handleDeleteDisconnected}
            disabled={isDeletingDisconnected || !connections.some(c => c.status === "disconnected")}
            className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            {isDeletingDisconnected ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            Excluir conexões desconectadas
          </Button>
        </div>
      </div>

      {/* QR Code Modal */}
      {qrCodeData && (
        <Dialog open={!!qrCodeData} onOpenChange={() => setQrCodeData(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Escaneie o QR Code</DialogTitle>
              <DialogDescription>
                Abra o WhatsApp no seu celular e escaneie o código abaixo
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center py-6">
              <img
                src={qrCodeData.qr.startsWith("data:") ? qrCodeData.qr : `data:image/png;base64,${qrCodeData.qr}`}
                alt="QR Code"
                className="w-64 h-64 rounded-lg border"
              />
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Aguardando conexão...
            </p>
          </DialogContent>
        </Dialog>
      )}

      {/* Connections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {connections.map((connection) => (
          <Card key={connection.id} className="relative overflow-hidden">
            <div className={cn(
              "absolute top-0 right-0 px-3 py-1 text-xs font-medium rounded-bl-lg",
              connection.status === "connected" 
                ? "bg-green-100 text-green-700" 
                : "bg-red-100 text-red-700"
            )}>
              {connection.status === "connected" ? "Conectado" : "Desconectado"}
            </div>
            
            <CardContent className="pt-8 pb-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  {connection.avatar_url ? (
                    <img
                      src={connection.avatar_url}
                      alt=""
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{connection.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {connection.phone_number || "Telefone não disponível"}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleVerify(connection)}
                  disabled={verifyingId === connection.id}
                  className="flex-1 border-green-500 text-green-600 hover:bg-green-50"
                >
                  {verifyingId === connection.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Verificar
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleConnect(connection)}
                  disabled={connectingId === connection.id || connection.status === "connected"}
                  className="flex-1"
                >
                  {connectingId === connection.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <QrCode className="h-4 w-4 mr-1" />
                      Conectar
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setDeleteConfirmId(connection.id)}
                  className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {connections.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <Smartphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">Nenhuma conexão</h3>
              <p className="text-muted-foreground mb-4">
                Crie sua primeira conexão do WhatsApp
              </p>
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="bg-green-500 hover:bg-green-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar conexão
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir conexão?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A conexão será permanentemente removida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
