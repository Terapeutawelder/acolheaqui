import { memo } from 'react';
import {
    EdgeProps,
    getBezierPath,
    EdgeLabelRenderer,
    BaseEdge,
    useReactFlow,
} from '@xyflow/react';
import { X } from 'lucide-react';

const DeletableEdge = ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
}: EdgeProps) => {
    const { setEdges } = useReactFlow();

    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    const onEdgeClick = () => {
        setEdges((edges) => edges.filter((edge) => edge.id !== id));
    };

    return (
        <>
            <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
            <EdgeLabelRenderer>
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                        pointerEvents: 'all',
                    }}
                    className="nodrag nopan"
                >
                    <button
                        className="w-5 h-5 bg-destructive hover:bg-destructive/80 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 shadow-md hover:scale-110 border border-destructive-foreground/20"
                        onClick={onEdgeClick}
                        title="Remover conexão"
                    >
                        <X size={12} className="text-destructive-foreground" />
                    </button>
                </div>
            </EdgeLabelRenderer>
        </>
    );
};

export default memo(DeletableEdge);
