import { X, Trash2 } from "lucide-react";
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

interface NodePropertiesProps {
    selectedNode: any;
    onClose: () => void;
}

export default function NodeProperties({ selectedNode, onClose }: NodePropertiesProps) {
    const { setNodes } = useReactFlow();

    const handleChange = (field: string, value: string) => {
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

    if (!selectedNode) return null;

    return (
        <div className="absolute right-4 top-4 w-80 bg-card border border-border/50 rounded-xl shadow-xl flex flex-col animate-in slide-in-from-right-10 fade-in duration-200 z-10">
            <div className="flex items-center justify-between p-4 border-b border-border/50">
                <div>
                    <h3 className="font-semibold text-sm">Editar Nó</h3>
                    <p className="text-xs text-muted-foreground capitalize">{selectedNode.type === 'default' ? 'Mensagem' : selectedNode.type}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                    <X size={16} />
                </Button>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-200px)]">
                <div className="space-y-2">
                    <Label htmlFor="title">Título</Label>
                    <Input
                        id="title"
                        value={selectedNode.data.label || ""}
                        onChange={(e) => handleChange("label", e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                        id="description"
                        placeholder="Adicione uma descrição..."
                        className="resize-none h-24"
                        value={selectedNode.data.description || ""}
                        onChange={(e) => handleChange("description", e.target.value)}
                    />
                </div>

                {selectedNode.type === 'input' && (
                    <div className="space-y-2">
                        <Label>Tipo de Gatilho</Label>
                        <Select defaultValue="keyword">
                            <SelectTrigger>
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

                <div className="pt-4 border-t border-border/50">
                    <Button variant="destructive" className="w-full gap-2" onClick={handleDelete}>
                        <Trash2 size={16} />
                        Excluir Nó
                    </Button>
                </div>
            </div>
        </div>
    );
}
