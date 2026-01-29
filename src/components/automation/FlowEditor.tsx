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
import { useCallback, useRef, useState, useMemo, useEffect, forwardRef, useImperativeHandle } from 'react';
import NodeProperties from './NodeProperties';
import BaseNode from './nodes/BaseNode';
import DeletableEdge from './edges/DeletableEdge';

// Default initial nodes for new flows
const defaultNodes: Node[] = [
    { id: '1', position: { x: 100, y: 100 }, data: { label: 'Gatilho: Solicitação', description: 'Palavra-chave: agendar, consulta' }, type: 'trigger' },
    { id: '2', position: { x: 100, y: 300 }, data: { label: 'Mensagem: Olá!', description: 'Vamos agendar sua consulta! 🗓️' }, type: 'message' },
];
const defaultEdges: Edge[] = [{ id: 'e1-2', source: '1', target: '2', type: 'deletable' }];

let id = 0;
const getId = () => `dndnode_${id++}`;

export interface FlowEditorRef {
    getFlowData: () => { nodes: Node[]; edges: Edge[] };
    setFlowData: (nodes: Node[], edges: Edge[]) => void;
    clearFlow: () => void;
}

interface FlowEditorProps {
    initialNodes?: Node[];
    initialEdges?: Edge[];
    onChange?: () => void;
}

const Flow = forwardRef<FlowEditorRef, FlowEditorProps>(({ initialNodes, initialEdges, onChange }, ref) => {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes || defaultNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(
        (initialEdges || defaultEdges).map(edge => ({ ...edge, type: 'deletable' }))
    );
    const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);

    // Update nodes/edges when initialNodes/initialEdges change
    useEffect(() => {
        if (initialNodes) {
            setNodes(initialNodes);
        }
    }, [initialNodes, setNodes]);

    useEffect(() => {
        if (initialEdges) {
            setEdges(initialEdges.map(edge => ({ ...edge, type: 'deletable' })));
        }
    }, [initialEdges, setEdges]);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
        getFlowData: () => ({ nodes, edges }),
        setFlowData: (newNodes: Node[], newEdges: Edge[]) => {
            setNodes(newNodes);
            setEdges(newEdges.map(edge => ({ ...edge, type: 'deletable' })));
        },
        clearFlow: () => {
            setNodes([]);
            setEdges([]);
        },
    }));

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

    const handleNodesChange = useCallback((changes: any) => {
        onNodesChange(changes);
        onChange?.();
    }, [onNodesChange, onChange]);

    const handleEdgesChange = useCallback((changes: any) => {
        onEdgesChange(changes);
        onChange?.();
    }, [onEdgesChange, onChange]);

    const onConnect = useCallback(
        (params: Connection) => {
            setEdges((eds) => addEdge({ ...params, type: 'deletable' }, eds));
            onChange?.();
        },
        [setEdges, onChange],
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
            onChange?.();
        },
        [reactFlowInstance, setNodes, onChange],
    );

    const onSelectionChange = useCallback(({ nodes }: OnSelectionChangeParams) => {
        setSelectedNode(nodes[0] || null);
    }, []);

    const handleNodeUpdate = useCallback((nodeId: string, data: any) => {
        setNodes((nds) =>
            nds.map((node) =>
                node.id === nodeId
                    ? { ...node, data: { ...node.data, ...data } }
                    : node
            )
        );
        onChange?.();
    }, [setNodes, onChange]);

    return (
        <div className="flex-1 h-full relative" ref={reactFlowWrapper}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={handleNodesChange}
                onEdgesChange={handleEdgesChange}
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

            {selectedNode && (
                <NodeProperties
                    selectedNode={selectedNode}
                    onClose={() => setSelectedNode(null)}
                />
            )}
        </div>
    );
});

Flow.displayName = 'Flow';

const FlowEditor = forwardRef<FlowEditorRef, FlowEditorProps>((props, ref) => {
    return (
        <ReactFlowProvider>
            <Flow ref={ref} {...props} />
        </ReactFlowProvider>
    );
});

FlowEditor.displayName = 'FlowEditor';

export default FlowEditor;
