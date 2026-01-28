import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge,
    BackgroundVariant,
    ReactFlowProvider,
    Panel,
    OnSelectionChangeParams,
    Node
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useCallback, useRef, useState } from 'react';
import NodeProperties from './NodeProperties';

// Initial nodes for demonstration
const initialNodes = [
    { id: '1', position: { x: 100, y: 100 }, data: { label: 'Gatilho: Solicitação de Agendamento', description: 'Palavra-chave: agendar, consulta' }, type: 'input' },
    { id: '2', position: { x: 100, y: 250 }, data: { label: 'Mensagem: Início Agendamento', description: 'Vamos agendar sua consulta! 🗓️' } },
];
const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }];

let id = 0;
const getId = () => `dndnode_${id++}`;

const Flow = () => {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
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
                type: type === 'trigger' ? 'input' : 'default', // Mapping for better default look
                position,
                data: { label: `${label}`, description: '' },
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [reactFlowInstance, setNodes],
    );

    const onSelectionChange = useCallback(({ nodes }: OnSelectionChangeParams) => {
        setSelectedNode(nodes[0] || null);
    }, []);

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
                fitView
                className="bg-background/50"
            >
                <Controls />
                <MiniMap zoomable pannable />
                <Background variant={BackgroundVariant.Dots} gap={12} size={1} />

                <Panel position="top-right" className="flex gap-2">
                    <div className="bg-card p-2 rounded-lg border border-border/50 shadow-sm flex items-center gap-2">
                        <button className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
                            Salvar
                        </button>
                    </div>
                </Panel>
            </ReactFlow>

            {selectedNode && (
                <NodeProperties
                    selectedNode={selectedNode}
                    onClose={() => setSelectedNode(null)}
                />
            )}
        </div>
    );
};

export default function FlowEditor() {
    return (
        <ReactFlowProvider>
            <Flow />
        </ReactFlowProvider>
    );
}
