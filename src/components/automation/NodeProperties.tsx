import { X, Trash2, Plus, AlertCircle, Upload, Link as LinkIcon, Save } from "lucide-react";
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

interface NodePropertiesProps {
    selectedNode: any;
    onClose: () => void;
}

export default function NodeProperties({ selectedNode, onClose }: NodePropertiesProps) {
    const { setNodes } = useReactFlow();

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
                                defaultValue={selectedNode.data.triggerType || "keyword"}
                                onValueChange={(val) => handleChange("triggerType", val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="keyword">Palavra-chave</SelectItem>
                                    <SelectItem value="manual">Manual (Link/Botão)</SelectItem>
                                    <SelectItem value="event">Evento do Sistema</SelectItem>
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
                    </div>
                )}

                {/* --- MENSAGEM (TEXTO SIMPLES) --- */}
                {selectedNode.type === 'message' && (
                    <div className="space-y-2">
                        <Label className="font-semibold">Conteúdo da Mensagem</Label>
                        <Textarea
                            placeholder="Olá! Como posso ajudar?"
                            className="resize-none h-40"
                            value={selectedNode.data.message || ""}
                            onChange={(e) => handleChange("message", e.target.value)}
                        />
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
                                defaultValue={selectedNode.data.variable || "name"}
                                onValueChange={(val) => handleChange("variable", val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione a variável" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="name">Nome do Cliente</SelectItem>
                                    <SelectItem value="email">Email</SelectItem>
                                    <SelectItem value="phone">Telefone</SelectItem>
                                    <SelectItem value="custom">Variável Personalizada</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                )}

                {/* --- CONDIÇÃO --- */}
                {selectedNode.type === 'condition' && (
                    <div className="space-y-4">
                        <div className="p-3 bg-muted/30 rounded-lg border border-border/50 text-sm">
                            <p className="font-medium mb-2">Se cumprir a condição:</p>
                            <div className="flex gap-2 items-center mb-2">
                                <Select defaultValue="variable">
                                    <SelectTrigger className="h-8"><SelectValue placeholder="Variável" /></SelectTrigger>
                                    <SelectContent><SelectItem value="variable">Variável</SelectItem></SelectContent>
                                </Select>
                                <Select defaultValue="equals">
                                    <SelectTrigger className="h-8"><SelectValue placeholder="Igual a" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="equals">Igual a</SelectItem>
                                        <SelectItem value="contains">Contém</SelectItem>
                                        <SelectItem value="exists">Existe</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Input placeholder="Valor" className="h-8" />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground px-2">
                            <span>Saída Verdadeiro (Verde)</span>
                            <span>Saída Falso (Vermelho)</span>
                        </div>
                    </div>
                )}


                {/* --- ESPERAR (DELAY) --- */}
                {selectedNode.type === 'delay' && (
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
                )}

                {/* --- CALENDÁRIO --- */}
                {selectedNode.type === 'calendar' && (
                    <>
                        <div className="space-y-2">
                            <Label className="font-semibold">Calendário</Label>
                            <Select
                                value={selectedNode.data.calendarId || ""}
                                onValueChange={(val) => handleChange("calendarId", val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione um calendário" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cal_1">Calendário Principal</SelectItem>
                                    <SelectItem value="cal_2">Consulta Online</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="font-semibold">URL do Calendário</Label>
                            <Input
                                readOnly
                                value="https://acolheaqui.com/c/agendamento"
                                className="bg-muted text-muted-foreground"
                            />
                        </div>
                    </>
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
                            <Select defaultValue="GET">
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="GET">GET</SelectItem>
                                    <SelectItem value="POST">POST</SelectItem>
                                    <SelectItem value="PUT">PUT</SelectItem>
                                    <SelectItem value="DELETE">DELETE</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="font-semibold">URL do Endpoint</Label>
                            <Input placeholder="https://api.exemplo.com/v1/..." />
                        </div>
                        <Tabs defaultValue="headers" className="w-full">
                            <TabsList className="w-full">
                                <TabsTrigger value="headers" className="flex-1">Headers</TabsTrigger>
                                <TabsTrigger value="body" className="flex-1">Body</TabsTrigger>
                            </TabsList>
                            <TabsContent value="headers">
                                <Textarea placeholder='{ "Authorization": "Bearer..." }' className="font-mono text-xs h-32" />
                            </TabsContent>
                            <TabsContent value="body">
                                <Textarea placeholder='{ "key": "value" }' className="font-mono text-xs h-32" />
                            </TabsContent>
                        </Tabs>
                    </div>
                )}

                {/* --- AGENTE IA --- */}
                {selectedNode.type === 'ai_agent' && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="font-semibold">Agente</Label>
                            <Select defaultValue="gpt4">
                                <SelectTrigger><SelectValue placeholder="Selecione o modelo" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="gpt4">GPT-4 Omni (Agendamento)</SelectItem>
                                    <SelectItem value="gpt3">GPT-3.5 Turbo (Rápido)</SelectItem>
                                    <SelectItem value="claude">Claude 3.5 Sonnet (Analítico)</SelectItem>
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
                        <div className="flex items-center justify-between">
                            <Label className="cursor-pointer" htmlFor="context">Usar histórico da conversa</Label>
                            <Switch id="context" defaultChecked />
                        </div>
                    </div>
                )}

                {/* --- CHECKOUT --- */}
                {selectedNode.type === 'checkout' && (
                    <div className="space-y-4">
                        <Alert className="bg-blue-500/10 border-blue-500/20 text-blue-600">
                            <AlertTitle className="flex items-center gap-2"><LinkIcon size={14} /> Link de Pagamento</AlertTitle>
                            <AlertDescription>
                                O link será enviado para o cliente.
                            </AlertDescription>
                        </Alert>
                        <div className="space-y-2">
                            <Label className="font-semibold">Produto / Serviço</Label>
                            <Select>
                                <SelectTrigger><SelectValue placeholder="Selecione o produto" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cons_1">Consulta Avulsa (R$ 150)</SelectItem>
                                    <SelectItem value="pack_5">Pacote 5 Sessões (R$ 600)</SelectItem>
                                    <SelectItem value="course_1">Curso Ansiedade Zero (R$ 97)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                )}

                {/* --- MÍDIA --- */}
                {selectedNode.type === 'media' && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="font-semibold">Tipo de Mídia</Label>
                            <Select defaultValue="image">
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
                            <Input placeholder="https://..." />
                        </div>
                    </div>
                )}

                {/* --- CRM --- */}
                {selectedNode.type === 'crm' && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="font-semibold">Ação</Label>
                            <Select defaultValue="update_tag">
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="update_tag">Adicionar Tag</SelectItem>
                                    <SelectItem value="remove_tag">Remover Tag</SelectItem>
                                    <SelectItem value="update_field">Atualizar Campo</SelectItem>
                                    <SelectItem value="create_deal">Criar Oportunidade</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="font-semibold">Tag</Label>
                            <Input placeholder="Ex: Lead Quente, Agendou" />
                        </div>
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
