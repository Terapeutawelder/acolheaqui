import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    BackgroundVariant,
    ReactFlowProvider,
    OnSelectionChangeParams,
    Node,
    Edge
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useCallback, useRef, useState, useMemo } from 'react';
import { toast } from 'sonner';
import NodeProperties from './NodeProperties';
import BaseNode from './nodes/BaseNode';
import DeletableEdge from './edges/DeletableEdge';

// Initial nodes for demonstration
const initialNodes = [
    { id: '1', position: { x: 100, y: 100 }, data: { label: 'Gatilho: Solicitação', description: 'Palavra-chave: agendar, consulta' }, type: 'trigger' },
    { id: '2', position: { x: 100, y: 300 }, data: { label: 'Mensagem: Olá!', description: 'Vamos agendar sua consulta! 🗓️' }, type: 'message' },
];
const initialEdges: Edge[] = [{ id: 'e1-2', source: '1', target: '2', type: 'deletable' }];

let id = 0;
const getId = () => `dndnode_${id++}`;

interface FlowProps {
    onSave?: (nodes: Node[], edges: Edge[]) => void;
    onSimulate?: () => void;
}

const Flow = ({ onSave, onSimulate }: FlowProps) => {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);

    // Register custom node types
    const nodeTypes = useMemo(() => ({
        trigger: BaseNode,
        message: BaseNode,
        condition: BaseNode,
        delay: BaseNode,
        buttons: BaseNode,
        button_message: BaseNode,
        cta: BaseNode,
        input: BaseNode,
        wait_input: BaseNode,
        api: BaseNode,
        webhook: BaseNode,
        crm: BaseNode,
        media: BaseNode,
        calendar: BaseNode,
        checkout: BaseNode,
        ai_agent: BaseNode,
        default: BaseNode
    }), []);

    // Register custom edge types
    const edgeTypes = useMemo(() => ({
        deletable: DeletableEdge,
    }), []);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge({ ...params, type: 'deletable' }, eds)),
        [setEdges],
    );

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            if (!reactFlowWrapper.current || !reactFlowInstance) {
                return;
            }

            const type = event.dataTransfer.getData('application/reactflow');
            const label = event.dataTransfer.getData('application/reactflow/label');

            // check if the dropped element is valid
            if (typeof type === 'undefined' || !type) {
                return;
            }

            const position = reactFlowInstance.screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const newNode = {
                id: getId(),
                type: type,
                position,
                data: { label: `${label}`, description: 'Nova configuração' },
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [reactFlowInstance, setNodes],
    );

    const onSelectionChange = useCallback(({ nodes }: OnSelectionChangeParams) => {
        setSelectedNode(nodes[0] || null);
    }, []);

    const handleSave = useCallback(() => {
        if (onSave) {
            onSave(nodes, edges);
        }
        // Save to localStorage for persistence
        const flowData = {
            nodes,
            edges,
            savedAt: new Date().toISOString(),
        };
        localStorage.setItem('automation-flow', JSON.stringify(flowData));
        toast.success('Automação salva com sucesso!');
    }, [nodes, edges, onSave]);

    const handleClear = useCallback(() => {
        setNodes([]);
        setEdges([]);
        toast.info('Fluxo limpo');
    }, [setNodes, setEdges]);

    const handleExport = useCallback(() => {
        const flowData = {
            nodes,
            edges,
            exportedAt: new Date().toISOString(),
        };
        const dataStr = JSON.stringify(flowData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'automacao-flow.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success('Fluxo exportado!');
    }, [nodes, edges]);

    const handleImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target?.result as string);
                if (data.nodes && data.edges) {
                    setNodes(data.nodes);
                    setEdges(data.edges.map((edge: Edge) => ({ ...edge, type: 'deletable' })));
                    toast.success('Fluxo importado com sucesso!');
                }
            } catch (err) {
                toast.error('Erro ao importar arquivo');
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    }, [setNodes, setEdges]);

    return (
        <div className="flex-1 h-full relative" ref={reactFlowWrapper}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onInit={setReactFlowInstance}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onSelectionChange={onSelectionChange}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                defaultEdgeOptions={{ type: 'deletable' }}
                fitView
                className="bg-background/50"
            >
                <Controls />
                <MiniMap zoomable pannable />
                <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            </ReactFlow>

            {/* Hidden file input for import */}
            <input
                type="file"
                id="import-flow"
                accept=".json"
                className="hidden"
                onChange={handleImport}
            />

            {selectedNode && (
                <NodeProperties
                    selectedNode={selectedNode}
                    onClose={() => setSelectedNode(null)}
                />
            )}
        </div>
    );
};

export interface FlowEditorProps {
    onSave?: (nodes: Node[], edges: Edge[]) => void;
    onSimulate?: () => void;
}

export default function FlowEditor({ onSave, onSimulate }: FlowEditorProps) {
    return (
        <ReactFlowProvider>
            <Flow onSave={onSave} onSimulate={onSimulate} />
        </ReactFlowProvider>
    );
}
