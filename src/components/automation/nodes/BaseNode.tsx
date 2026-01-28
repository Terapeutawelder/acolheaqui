import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
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
    MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

const BaseNode = ({ data, selected, type = 'default' }: NodeProps) => {
    const Icon = icons[type] || icons.default;
    const colorClass = colors[type] || colors.default;

    return (
        <div className={cn(
            "min-w-[280px] rounded-lg border-2 bg-card shadow-sm transition-all duration-200",
            selected ? "ring-2 ring-primary ring-offset-2 border-transparent" : "border-transparent", // Selection state
            // We use a wrapper for the border color to separate it from selection ring
        )}>
            {/* Colored Border Wrapper */}
            <div className={cn(
                "rounded-lg border bg-card overflow-hidden",
                colorClass.split(' ')[0] // Extract border color
            )}>
                {/* Header */}
                <div className="flex items-center gap-3 p-3 border-b border-border/50 bg-background/50">
                    <div className={cn("p-1.5 rounded-md", colorClass.split(' ').slice(1).join(' '))}>
                        <Icon size={16} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-semibold leading-none">{data.label as string}</h3>
                    </div>
                    {/* Options/Menu placeholder */}
                    <MoreHorizontal size={16} className="text-muted-foreground opacity-50" />
                </div>

                {/* Body */}
                <div className="p-3">
                    <p className="text-xs text-muted-foreground line-clamp-2">
                        {data.description as string || "Nenhuma configuração definida"}
                    </p>
                </div>
            </div>

            {/* Standard Handles */}
            <Handle type="target" position={Position.Top} className="!w-3 !h-3 !-top-1.5 !bg-muted-foreground border-2 border-background" />
            <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !-bottom-1.5 !bg-muted-foreground border-2 border-background" />
        </div>
    );
};

export default memo(BaseNode);
