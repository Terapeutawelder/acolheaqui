import { X, Trash2, Plus, AlertCircle } from "lucide-react";
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
import { useReactFlow } from "@xyflow/react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
            <div className="flex items-center justify-between p-4 border-b border-border/50">
                <div>
                    <h3 className="font-semibold text-lg">Editar Nó</h3>
                    <p className="text-xs text-muted-foreground capitalize">{selectedNode.data.label || selectedNode.type}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                    <X size={16} />
                </Button>
            </div>

            <div className="p-4 space-y-6 overflow-y-auto flex-1">

                {/* Common Fields */}
                <div className="space-y-2">
                    <Label htmlFor="title" className="font-semibold">Título</Label>
                    <Input
                        id="title"
                        value={selectedNode.data.label || ""}
                        onChange={(e) => handleChange("label", e.target.value)}
                        className="bg-muted/30"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description" className="font-semibold">Descrição</Label>
                    <Textarea
                        id="description"
                        placeholder="Descrição opcional"
                        className="resize-none h-24 bg-muted/30"
                        value={selectedNode.data.description || ""}
                        onChange={(e) => handleChange("description", e.target.value)}
                    />
                </div>

                {/* Specific Fields based on Node Type */}

                {/* --- ESPERAR (DELAY) --- */}
                {selectedNode.type === 'delay' && (
                    <div className="space-y-2">
                        <Label className="font-semibold">Tempo de Espera</Label>
                        <div className="flex gap-2">
                            <Input
                                type="number"
                                className="flex-1 bg-muted/30"
                                placeholder="5"
                                value={selectedNode.data.delayTime || ""}
                                onChange={(e) => handleChange("delayTime", e.target.value)}
                            />
                            <Select
                                value={selectedNode.data.delayUnit || "seconds"}
                                onValueChange={(val) => handleChange("delayUnit", val)}
                            >
                                <SelectTrigger className="w-[140px] bg-muted/30">
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
                                <SelectTrigger className="bg-muted/30">
                                    <SelectValue placeholder="Selecione um calendário" />
                                    <span className="flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-purple-500"></span>
                                        Calendário Principal
                                    </span>
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
                                value="https://id-preview--f8cb3d2a-c906-4"
                                className="bg-muted/50 text-muted-foreground"
                            />
                            <p className="text-xs text-muted-foreground">Link público de agendamento gerado automaticamente</p>
                        </div>
                    </>
                )}

                {/* --- MENSAGEM DO BOTÃO / BUTTONS --- */}
                {(selectedNode.type === 'button_message' || selectedNode.type === 'buttons') && (
                    <>
                        {(!selectedNode.data.message || (selectedNode.data.buttons && selectedNode.data.buttons.length === 0)) && (
                            <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive">
                                <AlertCircle className="h-4 w-4" />
                                <div className="ml-2">
                                    <AlertTitle className="text-sm font-semibold">Por favor, corrija os seguintes problemas:</AlertTitle>
                                    <AlertDescription className="text-xs mt-1 list-disc pl-4 space-y-1">
                                        {!selectedNode.data.message && <li>O texto da mensagem é obrigatório.</li>}
                                        {(!selectedNode.data.buttons || selectedNode.data.buttons.length === 0) && <li>Adicione pelo menos um botão.</li>}
                                    </AlertDescription>
                                </div>
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label className="font-semibold">Texto da mensagem <span className="text-destructive">(Obrigatório)</span></Label>
                            </div>
                            <Textarea
                                placeholder="Insira o texto da mensagem aqui..."
                                className="resize-none h-32 bg-muted/30"
                                value={selectedNode.data.message || ""}
                                onChange={(e) => handleChange("message", e.target.value)}
                                maxLength={1024}
                            />
                            <p className="text-right text-xs text-muted-foreground">{(selectedNode.data.message?.length || 0)}/1024</p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label className="font-semibold">Botões</Label>
                                <span className="text-xs text-muted-foreground">{(selectedNode.data.buttons?.length || 0)}/3</span>
                            </div>

                            <div className="space-y-2">
                                {selectedNode.data.buttons?.map((btn: any) => (
                                    <div key={btn.id} className="flex gap-2">
                                        <Input
                                            value={btn.label}
                                            className="bg-muted/30"
                                            onChange={(e) => {
                                                const newButtons = selectedNode.data.buttons.map((b: any) =>
                                                    b.id === btn.id ? { ...b, label: e.target.value } : b
                                                );
                                                handleChange("buttons", newButtons);
                                            }}
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleRemoveButton(btn.id)}
                                            className="text-muted-foreground hover:text-destructive"
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            {(selectedNode.data.buttons?.length || 0) < 3 && (
                                <Button
                                    variant="outline"
                                    className="w-full border-dashed border-primary/20 text-primary hover:bg-primary/5 hover:text-primary hover:border-primary/50"
                                    onClick={handleAddButton}
                                >
                                    <Plus size={16} className="mr-2" />
                                    Adicionar botão
                                </Button>
                            )}
                        </div>
                    </>
                )}

                {/* --- GATILHO (TRIGGER) --- */}
                {selectedNode.type === 'trigger' && 'input' && (
                    <div className="space-y-2">
                        <Label className="font-semibold">Tipo de Gatilho</Label>
                        <Select
                            defaultValue={selectedNode.data.triggerType || "keyword"}
                            onValueChange={(val) => handleChange("triggerType", val)}
                        >
                            <SelectTrigger className="bg-muted/30">
                                <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="keyword">Palavra-chave</SelectItem>
                                <SelectItem value="manual">Manual</SelectItem>
                                <SelectItem value="event">Evento</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}

            </div>

            <div className="p-4 border-t border-border/50 bg-background/50">
                <Button variant="destructive" className="w-full gap-2 font-semibold shadow-sm hover:bg-red-600 transition-colors" onClick={handleDelete}>
                    <Trash2 size={16} />
                    Excluir Nó
                </Button>
            </div>
        </div>
    );
}
