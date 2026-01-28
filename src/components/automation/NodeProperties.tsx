import { X, Trash2, Plus, AlertCircle, Upload, Link as LinkIcon, Save, Copy, Check } from "lucide-react";
import { useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import { useReactFlow } from "@xyflow/react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface NodePropertiesProps {
    selectedNode: any;
    onClose: () => void;
}

export default function NodeProperties({ selectedNode, onClose }: NodePropertiesProps) {
    const { setNodes } = useReactFlow();
    const [copied, setCopied] = useState(false);

    const handleChange = (field: string, value: any) => {
        setNodes((nodes) =>
            nodes.map((node) => {
                if (node.id === selectedNode.id) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            [field]: value,
                        },
                    };
                }
                return node;
            })
        );
    };

    const handleDelete = () => {
        setNodes((nodes) => nodes.filter((n) => n.id !== selectedNode.id));
        onClose();
    };

    const handleAddButton = () => {
        const currentButtons = (selectedNode.data.buttons as any[]) || [];
        if (currentButtons.length >= 3) return;

        handleChange("buttons", [...currentButtons, { id: crypto.randomUUID(), label: `Botão ${currentButtons.length + 1}` }]);
    };

    const handleRemoveButton = (id: string) => {
        const currentButtons = (selectedNode.data.buttons as any[]) || [];
        handleChange("buttons", currentButtons.filter(b => b.id !== id));
    };

    const handleAddHeader = () => {
        const currentHeaders = (selectedNode.data.headers as any[]) || [];
        handleChange("headers", [...currentHeaders, { id: crypto.randomUUID(), key: "", value: "" }]);
    };

    const handleRemoveHeader = (id: string) => {
        const currentHeaders = (selectedNode.data.headers as any[]) || [];
        handleChange("headers", currentHeaders.filter(h => h.id !== id));
    };

    const handleCopyWebhookUrl = () => {
        const url = `https://api.acolheaqui.com/webhooks/${selectedNode.id}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success("URL copiada!");
        setTimeout(() => setCopied(false), 2000);
    };

    if (!selectedNode) return null;

    return (
        <div className="absolute right-4 top-4 w-96 bg-card border border-border/50 rounded-xl shadow-xl flex flex-col animate-in slide-in-from-right-10 fade-in duration-200 z-10 max-h-[calc(100vh-32px)]">
            <div className="flex items-center justify-between p-4 border-b border-border/50 bg-muted/20">
                <div>
                    <h3 className="font-semibold text-lg">Editar Nó</h3>
                    <p className="text-xs text-muted-foreground capitalize">{selectedNode.data.label || selectedNode.type}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                    <X size={16} />
                </Button>
            </div>

            <div className="p-4 space-y-6 overflow-y-auto flex-1 custom-scrollbar">

                {/* Common Fields */}
                <div className="space-y-4 pb-4 border-b border-border/50">
                    <div className="space-y-2">
                        <Label htmlFor="title" className="font-semibold text-xs uppercase text-muted-foreground tracking-wider">Título Interno</Label>
                        <Input
                            id="title"
                            value={selectedNode.data.label || ""}
                            onChange={(e) => handleChange("label", e.target.value)}
                            className="bg-background"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description" className="font-semibold text-xs uppercase text-muted-foreground tracking-wider">Descrição Interna</Label>
                        <Input
                            id="description"
                            placeholder="Ex: Envia msg de boas vindas"
                            className="bg-background"
                            value={selectedNode.data.description || ""}
                            onChange={(e) => handleChange("description", e.target.value)}
                        />
                    </div>
                </div>

                {/* --- GATILHO (TRIGGER) --- */}
                {selectedNode.type === 'trigger' && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="font-semibold">Tipo de Gatilho</Label>
                            <Select
                                value={selectedNode.data.triggerType || "keyword"}
                                onValueChange={(val) => handleChange("triggerType", val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="keyword">Palavra-chave</SelectItem>
                                    <SelectItem value="manual">Manual (Link/Botão)</SelectItem>
                                    <SelectItem value="event">Evento do Sistema</SelectItem>
                                    <SelectItem value="schedule">Agendamento</SelectItem>
                                    <SelectItem value="webhook">Webhook Externo</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {(selectedNode.data.triggerType === 'keyword' || !selectedNode.data.triggerType) && (
                            <div className="space-y-2">
                                <Label className="font-semibold">Palavras-chave</Label>
                                <Input
                                    placeholder="Ex: agendar, consulta, marcar"
                                    value={selectedNode.data.keywords || ""}
                                    onChange={(e) => handleChange("keywords", e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">Separe por vírgulas</p>
                            </div>
                        )}

                        {selectedNode.data.triggerType === 'event' && (
                            <div className="space-y-2">
                                <Label className="font-semibold">Evento</Label>
                                <Select
                                    value={selectedNode.data.eventType || "appointment_created"}
                                    onValueChange={(val) => handleChange("eventType", val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o evento" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="appointment_created">Agendamento Criado</SelectItem>
                                        <SelectItem value="appointment_confirmed">Agendamento Confirmado</SelectItem>
                                        <SelectItem value="appointment_cancelled">Agendamento Cancelado</SelectItem>
                                        <SelectItem value="payment_received">Pagamento Recebido</SelectItem>
                                        <SelectItem value="new_lead">Novo Lead</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {selectedNode.data.triggerType === 'schedule' && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="font-semibold">Frequência</Label>
                                    <Select
                                        value={selectedNode.data.scheduleFrequency || "daily"}
                                        onValueChange={(val) => handleChange("scheduleFrequency", val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="daily">Diário</SelectItem>
                                            <SelectItem value="weekly">Semanal</SelectItem>
                                            <SelectItem value="monthly">Mensal</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-semibold">Horário</Label>
                                    <Input
                                        type="time"
                                        value={selectedNode.data.scheduleTime || "09:00"}
                                        onChange={(e) => handleChange("scheduleTime", e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        {selectedNode.data.triggerType === 'webhook' && (
                            <div className="space-y-2">
                                <Label className="font-semibold">URL do Webhook</Label>
                                <div className="flex gap-2">
                                    <Input
                                        readOnly
                                        value={`https://api.acolheaqui.com/webhooks/${selectedNode.id}`}
                                        className="bg-muted text-xs font-mono"
                                    />
                                    <Button variant="outline" size="icon" onClick={handleCopyWebhookUrl}>
                                        {copied ? <Check size={14} /> : <Copy size={14} />}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* --- MENSAGEM (TEXTO SIMPLES) --- */}
                {selectedNode.type === 'message' && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="font-semibold">Conteúdo da Mensagem</Label>
                            <Textarea
                                placeholder="Olá! Como posso ajudar?"
                                className="resize-none h-40"
                                value={selectedNode.data.message || ""}
                                onChange={(e) => handleChange("message", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Variáveis disponíveis:</Label>
                            <div className="flex flex-wrap gap-1">
                                {["{nome}", "{email}", "{telefone}", "{data}"].map((v) => (
                                    <button
                                        key={v}
                                        className="text-xs px-2 py-1 bg-muted rounded hover:bg-muted/80 transition-colors"
                                        onClick={() => handleChange("message", (selectedNode.data.message || "") + " " + v)}
                                    >
                                        {v}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <Label className="cursor-pointer" htmlFor="typing">Simular digitação</Label>
                            <Switch
                                id="typing"
                                checked={selectedNode.data.simulateTyping || false}
                                onCheckedChange={(val) => handleChange("simulateTyping", val)}
                            />
                        </div>
                    </div>
                )}

                {/* --- PERGUNTA (INPUT) --- */}
                {selectedNode.type === 'input' && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="font-semibold">Pergunta</Label>
                            <Textarea
                                placeholder="Qual o seu nome completo?"
                                className="resize-none h-24"
                                value={selectedNode.data.question || ""}
                                onChange={(e) => handleChange("question", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-semibold">Salvar resposta em</Label>
                            <Select
                                value={selectedNode.data.variable || "name"}
                                onValueChange={(val) => handleChange("variable", val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione a variável" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="name">Nome do Cliente</SelectItem>
                                    <SelectItem value="email">Email</SelectItem>
                                    <SelectItem value="phone">Telefone</SelectItem>
                                    <SelectItem value="cpf">CPF</SelectItem>
                                    <SelectItem value="custom">Variável Personalizada</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {selectedNode.data.variable === 'custom' && (
                            <div className="space-y-2">
                                <Label className="font-semibold">Nome da Variável</Label>
                                <Input
                                    placeholder="minha_variavel"
                                    value={selectedNode.data.customVariable || ""}
                                    onChange={(e) => handleChange("customVariable", e.target.value)}
                                />
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label className="font-semibold">Validação</Label>
                            <Select
                                value={selectedNode.data.validation || "none"}
                                onValueChange={(val) => handleChange("validation", val)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Nenhuma</SelectItem>
                                    <SelectItem value="email">Email válido</SelectItem>
                                    <SelectItem value="phone">Telefone válido</SelectItem>
                                    <SelectItem value="cpf">CPF válido</SelectItem>
                                    <SelectItem value="number">Apenas números</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                )}

                {/* --- AGUARDAR RESPOSTA --- */}
                {selectedNode.type === 'wait_input' && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="font-semibold">Tempo de Espera</Label>
                            <div className="flex gap-2">
                                <Input
                                    type="number"
                                    value={selectedNode.data.waitTime || "30"}
                                    onChange={(e) => handleChange("waitTime", e.target.value)}
                                    className="flex-1"
                                />
                                <Select
                                    value={selectedNode.data.waitUnit || "minutes"}
                                    onValueChange={(val) => handleChange("waitUnit", val)}
                                >
                                    <SelectTrigger className="w-[120px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="seconds">Segundos</SelectItem>
                                        <SelectItem value="minutes">Minutos</SelectItem>
                                        <SelectItem value="hours">Horas</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="font-semibold">Mensagem de Timeout</Label>
                            <Textarea
                                placeholder="Não recebi sua resposta. Por favor, tente novamente."
                                className="resize-none h-20"
                                value={selectedNode.data.timeoutMessage || ""}
                                onChange={(e) => handleChange("timeoutMessage", e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {/* --- CONDIÇÃO --- */}
                {selectedNode.type === 'condition' && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="font-semibold">Variável</Label>
                            <Select
                                value={selectedNode.data.conditionVariable || "name"}
                                onValueChange={(val) => handleChange("conditionVariable", val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione a variável" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="name">Nome</SelectItem>
                                    <SelectItem value="email">Email</SelectItem>
                                    <SelectItem value="phone">Telefone</SelectItem>
                                    <SelectItem value="lastMessage">Última Mensagem</SelectItem>
                                    <SelectItem value="custom">Personalizada</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="font-semibold">Operador</Label>
                            <Select
                                value={selectedNode.data.conditionOperator || "equals"}
                                onValueChange={(val) => handleChange("conditionOperator", val)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="equals">Igual a</SelectItem>
                                    <SelectItem value="contains">Contém</SelectItem>
                                    <SelectItem value="starts_with">Começa com</SelectItem>
                                    <SelectItem value="ends_with">Termina com</SelectItem>
                                    <SelectItem value="exists">Existe</SelectItem>
                                    <SelectItem value="not_exists">Não existe</SelectItem>
                                    <SelectItem value="greater_than">Maior que</SelectItem>
                                    <SelectItem value="less_than">Menor que</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="font-semibold">Valor</Label>
                            <Input
                                placeholder="Digite o valor"
                                value={selectedNode.data.conditionValue || ""}
                                onChange={(e) => handleChange("conditionValue", e.target.value)}
                            />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground px-2 pt-2 border-t">
                            <span className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                Saída Verdadeiro
                            </span>
                            <span className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-red-500" />
                                Saída Falso
                            </span>
                        </div>
                    </div>
                )}

                {/* --- ESPERAR (DELAY) --- */}
                {selectedNode.type === 'delay' && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="font-semibold">Tempo de Espera</Label>
                            <div className="flex gap-2">
                                <Input
                                    type="number"
                                    className="flex-1"
                                    placeholder="5"
                                    value={selectedNode.data.delayTime || ""}
                                    onChange={(e) => handleChange("delayTime", e.target.value)}
                                />
                                <Select
                                    value={selectedNode.data.delayUnit || "seconds"}
                                    onValueChange={(val) => handleChange("delayUnit", val)}
                                >
                                    <SelectTrigger className="w-[140px]">
                                        <SelectValue placeholder="Unidade" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="seconds">Segundos</SelectItem>
                                        <SelectItem value="minutes">Minutos</SelectItem>
                                        <SelectItem value="hours">Horas</SelectItem>
                                        <SelectItem value="days">Dias</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <Label className="cursor-pointer" htmlFor="businessHours">Apenas horário comercial</Label>
                            <Switch
                                id="businessHours"
                                checked={selectedNode.data.businessHoursOnly || false}
                                onCheckedChange={(val) => handleChange("businessHoursOnly", val)}
                            />
                        </div>
                    </div>
                )}

                {/* --- CHAMADA À AÇÃO (CTA) --- */}
                {selectedNode.type === 'cta' && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="font-semibold">Tipo de CTA</Label>
                            <Select
                                value={selectedNode.data.ctaType || "url"}
                                onValueChange={(val) => handleChange("ctaType", val)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="url">Link Externo</SelectItem>
                                    <SelectItem value="phone">Ligação</SelectItem>
                                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="font-semibold">Texto do Botão</Label>
                            <Input
                                placeholder="Acessar agora"
                                value={selectedNode.data.ctaText || ""}
                                onChange={(e) => handleChange("ctaText", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-semibold">
                                {selectedNode.data.ctaType === 'phone' ? 'Número de Telefone' : 
                                 selectedNode.data.ctaType === 'whatsapp' ? 'Número do WhatsApp' : 'URL'}
                            </Label>
                            <Input
                                placeholder={selectedNode.data.ctaType === 'url' ? 'https://...' : '+55 11 99999-9999'}
                                value={selectedNode.data.ctaUrl || ""}
                                onChange={(e) => handleChange("ctaUrl", e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {/* --- CALENDÁRIO --- */}
                {selectedNode.type === 'calendar' && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="font-semibold">Ação</Label>
                            <Select
                                value={selectedNode.data.calendarAction || "show_slots"}
                                onValueChange={(val) => handleChange("calendarAction", val)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="show_slots">Mostrar Horários Disponíveis</SelectItem>
                                    <SelectItem value="create_appointment">Criar Agendamento</SelectItem>
                                    <SelectItem value="cancel_appointment">Cancelar Agendamento</SelectItem>
                                    <SelectItem value="reschedule">Reagendar</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="font-semibold">Serviço</Label>
                            <Select
                                value={selectedNode.data.serviceId || ""}
                                onValueChange={(val) => handleChange("serviceId", val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione um serviço" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="session">Sessão Individual</SelectItem>
                                    <SelectItem value="consultation">Consulta Inicial</SelectItem>
                                    <SelectItem value="couple">Terapia de Casal</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="font-semibold">Dias a frente</Label>
                            <Input
                                type="number"
                                placeholder="7"
                                value={selectedNode.data.daysAhead || "7"}
                                onChange={(e) => handleChange("daysAhead", e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">Quantos dias mostrar para agendamento</p>
                        </div>
                    </div>
                )}

                {/* --- MENSAGEM DO BOTÃO / BUTTONS --- */}
                {(selectedNode.type === 'button_message' || selectedNode.type === 'buttons') && (
                    <>
                        {(!selectedNode.data.message || (selectedNode.data.buttons && selectedNode.data.buttons.length === 0)) && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Configuração Incompleta</AlertTitle>
                                <AlertDescription>
                                    Adicione um texto e pelo menos um botão.
                                </AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <Label className="font-semibold">Texto da mensagem</Label>
                            <Textarea
                                placeholder="Insira o texto..."
                                className="resize-none h-24"
                                value={selectedNode.data.message || ""}
                                onChange={(e) => handleChange("message", e.target.value)}
                                maxLength={1024}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="font-semibold">Botões ({selectedNode.data.buttons?.length || 0}/3)</Label>
                            <div className="space-y-2">
                                {selectedNode.data.buttons?.map((btn: any) => (
                                    <div key={btn.id} className="flex gap-2">
                                        <Input
                                            value={btn.label}
                                            onChange={(e) => {
                                                const newButtons = selectedNode.data.buttons.map((b: any) =>
                                                    b.id === btn.id ? { ...b, label: e.target.value } : b
                                                );
                                                handleChange("buttons", newButtons);
                                            }}
                                        />
                                        <Button variant="ghost" size="icon" onClick={() => handleRemoveButton(btn.id)}>
                                            <Trash2 size={16} className="text-destructive" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            {(selectedNode.data.buttons?.length || 0) < 3 && (
                                <Button variant="outline" className="w-full border-dashed" onClick={handleAddButton}>
                                    <Plus size={16} className="mr-2" /> Adicionar botão
                                </Button>
                            )}
                        </div>
                    </>
                )}

                {/* --- API REQUEST --- */}
                {selectedNode.type === 'api' && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="font-semibold">Método</Label>
                            <Select
                                value={selectedNode.data.apiMethod || "GET"}
                                onValueChange={(val) => handleChange("apiMethod", val)}
                            >
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="GET">GET</SelectItem>
                                    <SelectItem value="POST">POST</SelectItem>
                                    <SelectItem value="PUT">PUT</SelectItem>
                                    <SelectItem value="PATCH">PATCH</SelectItem>
                                    <SelectItem value="DELETE">DELETE</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="font-semibold">URL do Endpoint</Label>
                            <Input
                                placeholder="https://api.exemplo.com/v1/..."
                                value={selectedNode.data.apiUrl || ""}
                                onChange={(e) => handleChange("apiUrl", e.target.value)}
                            />
                        </div>
                        <Tabs defaultValue="headers" className="w-full">
                            <TabsList className="w-full">
                                <TabsTrigger value="headers" className="flex-1">Headers</TabsTrigger>
                                <TabsTrigger value="body" className="flex-1">Body</TabsTrigger>
                            </TabsList>
                            <TabsContent value="headers" className="space-y-2">
                                {(selectedNode.data.headers || []).map((header: any) => (
                                    <div key={header.id} className="flex gap-2">
                                        <Input
                                            placeholder="Key"
                                            value={header.key}
                                            onChange={(e) => {
                                                const newHeaders = selectedNode.data.headers.map((h: any) =>
                                                    h.id === header.id ? { ...h, key: e.target.value } : h
                                                );
                                                handleChange("headers", newHeaders);
                                            }}
                                            className="flex-1"
                                        />
                                        <Input
                                            placeholder="Value"
                                            value={header.value}
                                            onChange={(e) => {
                                                const newHeaders = selectedNode.data.headers.map((h: any) =>
                                                    h.id === header.id ? { ...h, value: e.target.value } : h
                                                );
                                                handleChange("headers", newHeaders);
                                            }}
                                            className="flex-1"
                                        />
                                        <Button variant="ghost" size="icon" onClick={() => handleRemoveHeader(header.id)}>
                                            <Trash2 size={14} className="text-destructive" />
                                        </Button>
                                    </div>
                                ))}
                                <Button variant="outline" size="sm" className="w-full border-dashed" onClick={handleAddHeader}>
                                    <Plus size={14} className="mr-2" /> Adicionar Header
                                </Button>
                            </TabsContent>
                            <TabsContent value="body">
                                <Textarea
                                    placeholder='{ "key": "value" }'
                                    className="font-mono text-xs h-32"
                                    value={selectedNode.data.apiBody || ""}
                                    onChange={(e) => handleChange("apiBody", e.target.value)}
                                />
                            </TabsContent>
                        </Tabs>
                        <div className="space-y-2">
                            <Label className="font-semibold">Salvar resposta em</Label>
                            <Input
                                placeholder="api_response"
                                value={selectedNode.data.apiResponseVariable || ""}
                                onChange={(e) => handleChange("apiResponseVariable", e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {/* --- WEBHOOK --- */}
                {selectedNode.type === 'webhook' && (
                    <div className="space-y-4">
                        <Alert className="bg-yellow-500/10 border-yellow-500/20 text-yellow-600">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Webhook de Saída</AlertTitle>
                            <AlertDescription>
                                Envia dados para uma URL externa quando ativado.
                            </AlertDescription>
                        </Alert>
                        <div className="space-y-2">
                            <Label className="font-semibold">URL do Webhook</Label>
                            <Input
                                placeholder="https://seu-servidor.com/webhook"
                                value={selectedNode.data.webhookUrl || ""}
                                onChange={(e) => handleChange("webhookUrl", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-semibold">Dados a enviar</Label>
                            <Textarea
                                placeholder='{"nome": "{nome}", "email": "{email}"}'
                                className="font-mono text-xs h-24"
                                value={selectedNode.data.webhookPayload || ""}
                                onChange={(e) => handleChange("webhookPayload", e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {/* --- AGENTE IA --- */}
                {selectedNode.type === 'ai_agent' && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="font-semibold">Modelo</Label>
                            <Select
                                value={selectedNode.data.aiModel || "gpt4"}
                                onValueChange={(val) => handleChange("aiModel", val)}
                            >
                                <SelectTrigger><SelectValue placeholder="Selecione o modelo" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="gpt4">GPT-4 Omni (Recomendado)</SelectItem>
                                    <SelectItem value="gpt4mini">GPT-4 Mini (Rápido)</SelectItem>
                                    <SelectItem value="gemini">Gemini Pro</SelectItem>
                                    <SelectItem value="claude">Claude 3.5 Sonnet</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="font-semibold">Prompt do Sistema</Label>
                            <Textarea
                                placeholder="Você é uma secretária virtual..."
                                className="h-40 resize-none font-sans"
                                value={selectedNode.data.prompt || "Você é um assistente útil."}
                                onChange={(e) => handleChange("prompt", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-semibold">Temperatura</Label>
                            <Input
                                type="number"
                                min="0"
                                max="2"
                                step="0.1"
                                value={selectedNode.data.temperature || "0.7"}
                                onChange={(e) => handleChange("temperature", e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">0 = mais preciso, 2 = mais criativo</p>
                        </div>
                        <div className="flex items-center justify-between">
                            <Label className="cursor-pointer" htmlFor="context">Usar histórico da conversa</Label>
                            <Switch
                                id="context"
                                checked={selectedNode.data.useContext !== false}
                                onCheckedChange={(val) => handleChange("useContext", val)}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label className="cursor-pointer" htmlFor="streaming">Resposta em streaming</Label>
                            <Switch
                                id="streaming"
                                checked={selectedNode.data.streaming || false}
                                onCheckedChange={(val) => handleChange("streaming", val)}
                            />
                        </div>
                    </div>
                )}

                {/* --- CHECKOUT --- */}
                {selectedNode.type === 'checkout' && (
                    <div className="space-y-4">
                        <Alert className="bg-blue-500/10 border-blue-500/20 text-blue-600">
                            <LinkIcon size={14} />
                            <AlertTitle>Link de Pagamento</AlertTitle>
                            <AlertDescription>
                                O link será enviado para o cliente.
                            </AlertDescription>
                        </Alert>
                        <div className="space-y-2">
                            <Label className="font-semibold">Produto / Serviço</Label>
                            <Select
                                value={selectedNode.data.productId || ""}
                                onValueChange={(val) => handleChange("productId", val)}
                            >
                                <SelectTrigger><SelectValue placeholder="Selecione o produto" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cons_1">Consulta Avulsa (R$ 150)</SelectItem>
                                    <SelectItem value="pack_5">Pacote 5 Sessões (R$ 600)</SelectItem>
                                    <SelectItem value="course_1">Curso Ansiedade Zero (R$ 97)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="font-semibold">Mensagem personalizada</Label>
                            <Textarea
                                placeholder="Aqui está seu link de pagamento..."
                                className="resize-none h-20"
                                value={selectedNode.data.checkoutMessage || ""}
                                onChange={(e) => handleChange("checkoutMessage", e.target.value)}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label className="cursor-pointer" htmlFor="expiresCheckout">Link expira</Label>
                            <Switch
                                id="expiresCheckout"
                                checked={selectedNode.data.checkoutExpires || false}
                                onCheckedChange={(val) => handleChange("checkoutExpires", val)}
                            />
                        </div>
                        {selectedNode.data.checkoutExpires && (
                            <div className="space-y-2">
                                <Label className="font-semibold">Expiração (horas)</Label>
                                <Input
                                    type="number"
                                    value={selectedNode.data.checkoutExpiresHours || "24"}
                                    onChange={(e) => handleChange("checkoutExpiresHours", e.target.value)}
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* --- MÍDIA --- */}
                {selectedNode.type === 'media' && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="font-semibold">Tipo de Mídia</Label>
                            <Select
                                value={selectedNode.data.mediaType || "image"}
                                onValueChange={(val) => handleChange("mediaType", val)}
                            >
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="image">Imagem</SelectItem>
                                    <SelectItem value="video">Vídeo</SelectItem>
                                    <SelectItem value="document">Documento (PDF)</SelectItem>
                                    <SelectItem value="audio">Áudio</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="border-2 border-dashed border-border/50 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer">
                            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-sm font-medium">Clique para fazer upload</p>
                            <p className="text-xs text-muted-foreground">ou arraste o arquivo aqui</p>
                        </div>
                        <div className="space-y-2">
                            <Label>Ou URL direta</Label>
                            <Input
                                placeholder="https://..."
                                value={selectedNode.data.mediaUrl || ""}
                                onChange={(e) => handleChange("mediaUrl", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-semibold">Legenda (opcional)</Label>
                            <Textarea
                                placeholder="Descrição da mídia..."
                                className="resize-none h-16"
                                value={selectedNode.data.mediaCaption || ""}
                                onChange={(e) => handleChange("mediaCaption", e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {/* --- CRM --- */}
                {selectedNode.type === 'crm' && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="font-semibold">Ação</Label>
                            <Select
                                value={selectedNode.data.crmAction || "add_tag"}
                                onValueChange={(val) => handleChange("crmAction", val)}
                            >
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="add_tag">Adicionar Tag</SelectItem>
                                    <SelectItem value="remove_tag">Remover Tag</SelectItem>
                                    <SelectItem value="update_field">Atualizar Campo</SelectItem>
                                    <SelectItem value="create_deal">Criar Oportunidade</SelectItem>
                                    <SelectItem value="move_stage">Mover Estágio</SelectItem>
                                    <SelectItem value="add_note">Adicionar Nota</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {(selectedNode.data.crmAction === 'add_tag' || selectedNode.data.crmAction === 'remove_tag' || !selectedNode.data.crmAction) && (
                            <div className="space-y-2">
                                <Label className="font-semibold">Tag</Label>
                                <Input
                                    placeholder="Ex: Lead Quente, Agendou"
                                    value={selectedNode.data.crmTag || ""}
                                    onChange={(e) => handleChange("crmTag", e.target.value)}
                                />
                            </div>
                        )}
                        {selectedNode.data.crmAction === 'update_field' && (
                            <>
                                <div className="space-y-2">
                                    <Label className="font-semibold">Campo</Label>
                                    <Select
                                        value={selectedNode.data.crmField || ""}
                                        onValueChange={(val) => handleChange("crmField", val)}
                                    >
                                        <SelectTrigger><SelectValue placeholder="Selecione o campo" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="name">Nome</SelectItem>
                                            <SelectItem value="email">Email</SelectItem>
                                            <SelectItem value="phone">Telefone</SelectItem>
                                            <SelectItem value="custom">Personalizado</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-semibold">Valor</Label>
                                    <Input
                                        placeholder="Novo valor"
                                        value={selectedNode.data.crmFieldValue || ""}
                                        onChange={(e) => handleChange("crmFieldValue", e.target.value)}
                                    />
                                </div>
                            </>
                        )}
                        {selectedNode.data.crmAction === 'move_stage' && (
                            <div className="space-y-2">
                                <Label className="font-semibold">Estágio</Label>
                                <Select
                                    value={selectedNode.data.crmStage || ""}
                                    onValueChange={(val) => handleChange("crmStage", val)}
                                >
                                    <SelectTrigger><SelectValue placeholder="Selecione o estágio" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="new">Novo Lead</SelectItem>
                                        <SelectItem value="contacted">Contatado</SelectItem>
                                        <SelectItem value="qualified">Qualificado</SelectItem>
                                        <SelectItem value="scheduled">Agendado</SelectItem>
                                        <SelectItem value="converted">Convertido</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        {selectedNode.data.crmAction === 'add_note' && (
                            <div className="space-y-2">
                                <Label className="font-semibold">Nota</Label>
                                <Textarea
                                    placeholder="Texto da nota..."
                                    className="resize-none h-20"
                                    value={selectedNode.data.crmNote || ""}
                                    onChange={(e) => handleChange("crmNote", e.target.value)}
                                />
                            </div>
                        )}
                    </div>
                )}

            </div>

            <div className="p-4 border-t border-border/50 bg-muted/20">
                <Button variant="destructive" className="w-full gap-2 font-semibold shadow-sm hover:bg-red-600 transition-colors" onClick={handleDelete}>
                    <Trash2 size={16} />
                    Excluir Nó
                </Button>
            </div>
        </div>
    );
}
