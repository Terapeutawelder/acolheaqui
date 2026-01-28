import { useNavigate } from "react-router-dom";
import { ArrowLeft, Play, Save, RotateCcw, Download, Upload, Trash2 } from "lucide-react";
import AutomationSidebar from "@/components/automation/AutomationSidebar";
import FlowEditor from "@/components/automation/FlowEditor";
import { Button } from "@/components/ui/button";

export default function Automation() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Header */}
            <header className="h-14 border-b border-border/50 px-4 flex items-center justify-between bg-card text-card-foreground">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="hover:bg-muted">
                        <ArrowLeft size={20} />
                    </Button>
                    <div>
                        <h1 className="font-semibold text-sm md:text-base">Nova Automação</h1>
                        <p className="text-xs text-muted-foreground hidden md:block">Arraste e conecte os nós para criar seu fluxo</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="hidden md:flex items-center bg-muted/50 rounded-lg p-1 mr-2 border border-border/50">
                        <Button variant="ghost" size="sm" className="h-8 gap-2 text-xs font-medium">
                            <span className="truncate max-w-[100px]">Novo Fluxo</span>
                        </Button>
                        <div className="h-4 w-[1px] bg-border mx-1" />
                        <Button variant="ghost" size="sm" className="h-8 gap-2 text-xs font-medium hover:text-primary">
                            <Play size={14} />
                            Simular
                        </Button>
                    </div>

                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                            <Download size={16} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                            <Upload size={16} />
                        </Button>
                        <div className="h-4 w-[1px] bg-border mx-1" />
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                            <RotateCcw size={16} />
                        </Button>
                        <div className="h-4 w-[1px] bg-border mx-1" />
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10">
                            <Trash2 size={16} />
                        </Button>
                        <Button className="h-8 gap-2 ml-2 bg-green-600 hover:bg-green-700 text-white">
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
        </div>
    );
}
