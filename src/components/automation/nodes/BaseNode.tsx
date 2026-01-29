import { memo, useState, useCallback } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from '@xyflow/react';
import {
    Zap,
    MessageSquare,
    ArrowRightCircle,
    Clock,
    MousePointerClick,
    Type,
    ImageIcon,
    Calendar,
    CreditCard,
    Bot,
    ChevronUp,
    ChevronDown,
    Copy,
    Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

const icons: Record<string, any> = {
    trigger: Zap,
    message: MessageSquare,
    condition: ArrowRightCircle,
    delay: Clock,
    buttons: MousePointerClick,
    button_message: MessageSquare,
    cta: MousePointerClick,
    input: Type,
    wait_input: Clock,
    api: Zap,
    webhook: Zap,
    crm: ArrowRightCircle,
    media: ImageIcon,
    calendar: Calendar,
    checkout: CreditCard,
    ai_agent: Bot,
    default: MessageSquare
};

const colors: Record<string, string> = {
    trigger: "border-orange-500 text-orange-500 bg-orange-500/10",
    message: "border-green-500 text-green-500 bg-green-500/10",
    condition: "border-purple-500 text-purple-500 bg-purple-500/10",
    delay: "border-blue-500 text-blue-500 bg-blue-500/10",
    buttons: "border-blue-400 text-blue-400 bg-blue-400/10",
    button_message: "border-pink-500 text-pink-500 bg-pink-500/10",
    cta: "border-yellow-500 text-yellow-500 bg-yellow-500/10",
    input: "border-violet-500 text-violet-500 bg-violet-500/10",
    wait_input: "border-cyan-500 text-cyan-500 bg-cyan-500/10",
    api: "border-orange-600 text-orange-600 bg-orange-600/10",
    webhook: "border-yellow-600 text-yellow-600 bg-yellow-600/10",
    crm: "border-blue-600 text-blue-600 bg-blue-600/10",
    media: "border-pink-600 text-pink-600 bg-pink-600/10",
    calendar: "border-blue-600 text-blue-600 bg-blue-600/10",
    checkout: "border-yellow-500 text-yellow-500 bg-yellow-500/10",
    ai_agent: "border-purple-600 text-purple-600 bg-purple-600/10",
    default: "border-primary text-primary bg-primary/10"
};

const BaseNode = ({ id, data, selected, type = 'default' }: NodeProps) => {
    const Icon = icons[type] || icons.default;
    const colorClass = colors[type] || colors.default;
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { setNodes, getNodes, setEdges, getEdges } = useReactFlow();

    const handleCollapse = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setIsCollapsed(!isCollapsed);
    }, [isCollapsed]);

    const handleDuplicate = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        const nodes = getNodes();
        const currentNode = nodes.find(n => n.id === id);
        
        if (currentNode) {
            const newNode = {
                ...currentNode,
                id: `${currentNode.id}_copy_${Date.now()}`,
                position: {
                    x: currentNode.position.x + 50,
                    y: currentNode.position.y + 50
                },
                data: { ...currentNode.data },
                selected: false
            };
            
            setNodes([...nodes, newNode]);
        }
    }, [id, getNodes, setNodes]);

    const handleDelete = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setNodes(nodes => nodes.filter(n => n.id !== id));
        setEdges(edges => edges.filter(e => e.source !== id && e.target !== id));
    }, [id, setNodes, setEdges]);

    return (
        <TooltipProvider delayDuration={300}>
            <div className={cn(
                "min-w-[280px] rounded-lg border-2 bg-card shadow-sm transition-all duration-200",
                selected ? "ring-2 ring-primary ring-offset-2 border-transparent" : "border-transparent",
            )}>
                {/* Colored Border Wrapper */}
                <div className={cn(
                    "rounded-lg border bg-card overflow-hidden",
                    colorClass.split(' ')[0]
                )}>
                    {/* Header */}
                    <div className="flex items-center gap-3 p-3 border-b border-border/50 bg-background/50">
                        <div className={cn("p-1.5 rounded-md", colorClass.split(' ').slice(1).join(' '))}>
                            <Icon size={16} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold leading-none">{data.label as string}</h3>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center gap-0.5">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                        onClick={handleCollapse}
                                    >
                                        {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                    <p>{isCollapsed ? 'Expandir' : 'Recolher'}</p>
                                </TooltipContent>
                            </Tooltip>
                            
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                        onClick={handleDuplicate}
                                    >
                                        <Copy size={14} />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                    <p>Duplicar</p>
                                </TooltipContent>
                            </Tooltip>
                            
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                        onClick={handleDelete}
                                    >
                                        <Trash2 size={14} />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                    <p>Excluir</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    </div>

                    {/* Body - Collapsible */}
                    {!isCollapsed && (
                        <div className="p-3">
                            <p className="text-xs text-muted-foreground line-clamp-2">
                                {data.description as string || "Nenhuma configuração definida"}
                            </p>
                        </div>
                    )}
                </div>

                {/* Standard Handles */}
                <Handle type="target" position={Position.Top} className="!w-3 !h-3 !-top-1.5 !bg-muted-foreground border-2 border-background" />
                <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !-bottom-1.5 !bg-muted-foreground border-2 border-background" />
            </div>
        </TooltipProvider>
    );
};

export default memo(BaseNode);
