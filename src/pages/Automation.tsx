import { useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import { ArrowLeft, Play, Save, RotateCcw, Download, Upload, Trash2 } from "lucide-react";
import AutomationSidebar from "@/components/automation/AutomationSidebar";
import FlowEditor from "@/components/automation/FlowEditor";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Automation() {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [flowName, setFlowName] = useState("Novo Fluxo");
    const [isSimulating, setIsSimulating] = useState(false);
    const [simulationDialog, setSimulationDialog] = useState(false);

    const handleSave = () => {
        // Trigger save via localStorage (FlowEditor handles it internally)
        const saveEvent = new CustomEvent('automation-save');
        window.dispatchEvent(saveEvent);
        toast.success('Automação salva com sucesso!');
    };

    const handleExport = () => {
        // Get flow data from localStorage
        const flowData = localStorage.getItem('automation-flow');
        if (flowData) {
            const dataBlob = new Blob([flowData], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${flowName.toLowerCase().replace(/\s+/g, '-')}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            toast.success('Fluxo exportado!');
        } else {
            toast.error('Nenhum fluxo para exportar');
        }
    };

    const handleImport = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target?.result as string);
                if (data.nodes && data.edges) {
                    localStorage.setItem('automation-flow', JSON.stringify(data));
                    window.location.reload(); // Reload to apply imported flow
                    toast.success('Fluxo importado com sucesso!');
                }
            } catch (err) {
                toast.error('Erro ao importar arquivo');
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    };

    const handleClear = () => {
        localStorage.removeItem('automation-flow');
        window.location.reload();
        toast.info('Fluxo limpo');
    };

    const handleSimulate = () => {
        setSimulationDialog(true);
        setIsSimulating(true);
        
        // Simulate a flow execution
        setTimeout(() => {
            setIsSimulating(false);
        }, 3000);
    };

    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Hidden file input */}
            <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                className="hidden"
                onChange={handleFileChange}
            />

            {/* Header */}
            <header className="h-14 border-b border-border/50 px-4 flex items-center justify-between bg-card text-card-foreground">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="hover:bg-muted">
                        <ArrowLeft size={20} />
                    </Button>
                    <div>
                        <Input
                            value={flowName}
                            onChange={(e) => setFlowName(e.target.value)}
                            className="font-semibold text-sm md:text-base bg-transparent border-none p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                        <p className="text-xs text-muted-foreground hidden md:block">Arraste e conecte os nós para criar seu fluxo</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="hidden md:flex items-center bg-muted/50 rounded-lg p-1 mr-2 border border-border/50">
                        <Button variant="ghost" size="sm" className="h-8 gap-2 text-xs font-medium hover:text-primary" onClick={handleSimulate}>
                            <Play size={14} />
                            Simular
                        </Button>
                    </div>

                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={handleExport} title="Exportar">
                            <Download size={16} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={handleImport} title="Importar">
                            <Upload size={16} />
                        </Button>
                        <div className="h-4 w-[1px] bg-border mx-1" />
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" title="Limpar">
                                    <RotateCcw size={16} />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Limpar fluxo?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Esta ação irá remover todos os nós e conexões do fluxo atual. Esta ação não pode ser desfeita.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleClear}>Limpar</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        <div className="h-4 w-[1px] bg-border mx-1" />
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" title="Excluir">
                                    <Trash2 size={16} />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Excluir automação?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Esta ação irá excluir permanentemente esta automação. Esta ação não pode ser desfeita.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleClear}>
                                        Excluir
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        <Button className="h-8 gap-2 ml-2 bg-green-600 hover:bg-green-700 text-white" onClick={handleSave}>
                            <Save size={16} />
                            Salvar
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                <AutomationSidebar />
                <main className="flex-1 relative">
                    <FlowEditor />
                </main>
            </div>

            {/* Simulation Dialog */}
            <Dialog open={simulationDialog} onOpenChange={setSimulationDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Simulação do Fluxo</DialogTitle>
                        <DialogDescription>
                            Testando a execução do fluxo de automação
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {isSimulating ? (
                            <div className="flex flex-col items-center gap-4">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                                <p className="text-sm text-muted-foreground">Executando simulação...</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    <span className="text-sm">Gatilho ativado</span>
                                </div>
                                <div className="flex items-center gap-2 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    <span className="text-sm">Mensagem enviada</span>
                                </div>
                                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg border">
                                    <div className="w-2 h-2 rounded-full bg-muted-foreground"></div>
                                    <span className="text-sm text-muted-foreground">Aguardando resposta do usuário...</span>
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
