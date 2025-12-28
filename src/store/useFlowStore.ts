import { create } from 'zustand';
import {
    Connection,
    Edge,
    EdgeChange,
    Node,
    NodeChange,
    addEdge,
    OnNodesChange,
    OnEdgesChange,
    OnConnect,
    applyNodeChanges,
    applyEdgeChanges,
} from 'reactflow';
import dagre from 'dagre';

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

// Helper to create clean, short titles using AI
const generateTitle = async (input: string): Promise<string> => {
    try {
        const res = await fetch('/api/generate-title', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userInput: input })
        });
        const data = await res.json();
        return data.title || input.slice(0, 30);
    } catch {
        // Fallback: just use first few words
        return input.split(' ').slice(0, 3).join(' ');
    }
};

// Dagre Layout Helper - Mind Map Style
const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
    // Create fresh graph each time to avoid stale data
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    // TB = Top to Bottom tree layout with large spacing
    dagreGraph.setGraph({
        rankdir: 'TB',
        nodesep: 100,    // Horizontal space between sibling nodes
        ranksep: 180,    // Vertical space between parent/child levels
        marginx: 100,
        marginy: 100
    });

    nodes.forEach((node) => {
        // Larger node size to account for images
        const hasImage = node.data?.imageUrl || node.data?.imageLoading;
        dagreGraph.setNode(node.id, {
            width: 400,
            height: hasImage ? 350 : 200
        });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        const hasImage = node.data?.imageUrl || node.data?.imageLoading;
        return {
            ...node,
            position: {
                x: nodeWithPosition.x - 200,
                y: nodeWithPosition.y - (hasImage ? 175 : 100),
            },
        };
    });

    return { nodes: layoutedNodes, edges };
};

type FlowState = {
    // React Flow State
    nodes: Node[];
    edges: Edge[];
    currentSessionId: string | null;
    recentSessions: any[]; // Metadata only
    chatHistory: ChatMessage[];
    onNodesChange: OnNodesChange;
    onEdgesChange: OnEdgesChange;
    onConnect: OnConnect;
    setNodes: (nodes: Node[]) => void;
    setEdges: (edges: Edge[]) => void;
    // Actions
    generateGraph: (topic: string) => Promise<void>;
    expandNode: (parentId: string, topic: string) => Promise<void>;
    addNodesFromChat: (action: any) => void;
    // Persistence Actions
    loadSessions: () => Promise<void>;
    loadSession: (id: string) => Promise<void>;
    saveSession: (title: string) => Promise<void>;
    deleteSession: (id: string) => Promise<void>;
    createNewSession: () => void;
    setChatHistory: (history: ChatMessage[]) => void;

    isLoading: boolean;
    shouldFitView: boolean;
    clearFitView: () => void;
    expandingNodeId: string | null; // Track which node is expanding

    // UI State
    sidebarOpen: boolean;
    chatOpen: boolean;
    toggleSidebar: () => void;
    toggleChat: () => void;

    // Document Context (for PDFs, etc.)
    documentContext: string | null;
    setDocumentContext: (context: string | null) => void;
};

const useFlowStore = create<FlowState>((set, get) => ({
    nodes: [],
    edges: [],
    onNodesChange: (changes: NodeChange[]) => {
        set({
            nodes: applyNodeChanges(changes, get().nodes),
        });
    },
    onEdgesChange: (changes: EdgeChange[]) => {
        set({
            edges: applyEdgeChanges(changes, get().edges),
        });
    },
    onConnect: (connection: Connection) => {
        set({
            edges: addEdge(connection, get().edges),
        });
    },
    isLoading: false,
    shouldFitView: false,
    clearFitView: () => set({ shouldFitView: false }),
    expandingNodeId: null,
    currentSessionId: null,
    recentSessions: [],
    chatHistory: [{ role: 'model', text: 'Hi! Select a node or ask me anything to deepen your understanding.' }], // Default start

    generateGraph: async (topic: string) => {
        set({ isLoading: true });
        try {
            // Use AI to create a clean, short topic title
            const displayTitle = await generateTitle(topic);

            // Chat-First: Only create the ROOT node. 
            // Children are added via chat interaction.
            const rootNode: Node = {
                id: 'root',
                position: { x: 0, y: 0 },
                data: {
                    label: displayTitle,
                    isRoot: true,
                    description: topic, // Keep original request for context
                    emoji: "🎯"
                },
                type: 'mindNode',
            };

            set({
                nodes: [rootNode],
                edges: [],
                currentSessionId: null, // New session
                chatHistory: [{
                    role: 'model',
                    text: `Great choice! Let's learn about **${displayTitle}** together. I'll guide you step by step.\n\nBefore we dive in, what do you already know about this topic?`
                }]
            });
        } catch (error) {
            console.error('Failed to generate graph:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    expandNode: async (parentId: string, topic: string) => {
        set({ expandingNodeId: parentId }); // Set local loading
        try {
            const nodes = get().nodes;
            const parentNode = nodes.find(n => n.id === parentId);
            if (!parentNode) return;

            const response = await fetch('/api/generate-graph', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic, parentNodeId: parentId }),
            });

            const data = await response.json();

            if (data.nodes && data.nodes.length > 0) {
                const currentNodes = get().nodes;
                const currentEdges = get().edges;

                const newNodes: Node[] = data.nodes.map((node: any, index: number) => {
                    return {
                        id: `node-${Date.now()}-${index}`,
                        position: { x: 0, y: 0 }, // Dagre will fix
                        data: {
                            label: node.label,
                            description: node.description,
                            diagram: node.diagram,
                            index: index
                        },
                        type: 'mindNode',
                    };
                });

                const newEdges: Edge[] = newNodes.map((node) => ({
                    id: `e-${parentId}-${node.id}`,
                    source: parentId,
                    target: node.id,
                    animated: true,
                    type: 'smoothstep',
                    style: { stroke: '#cbd5e1' },
                }));

                const allNodes = [...currentNodes, ...newNodes];
                const allEdges = [...currentEdges, ...newEdges];

                // RE-RUN LAYOUT on everything so it adjusts perfectly
                const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(allNodes, allEdges);

                set({
                    nodes: layoutedNodes,
                    edges: layoutedEdges
                });
            }

        } catch (error) {
            console.error("Failed to expand node:", error);
        } finally {
            set({ expandingNodeId: null }); // Clear local loading
        }
    },

    addNodesFromChat: (action: any) => {
        if (action.type !== 'add_node') return;

        const { label, description, emoji, parentLabel, diagram, imagePrompt } = action;
        const nodes = get().nodes;
        const edges = get().edges;
        const rootNode = nodes.find(n => n.data?.isRoot);

        // Count direct children of root
        const rootChildren = edges.filter(e => e.source === rootNode?.id).length;

        // Smart branching logic:
        // 1. If parentLabel specified → use that parent
        // 2. If root has < 4 branches → add to root (create main branches)
        // 3. If root has 4+ branches → add to last non-root node (create depth)
        let parentNode;

        if (parentLabel) {
            parentNode = nodes.find(n => n.data?.label?.toLowerCase().includes(parentLabel.toLowerCase()));
        }

        // If no parent found or specified, default to ROOT to encourage breadth
        // This prevents the "long snake" problem where everything chains to the last node
        if (!parentNode) {
            parentNode = rootNode;
        }

        if (!parentNode) parentNode = nodes[0];
        if (!parentNode) return;

        const newId = `node-chat-${Date.now()}`;

        const newNode: Node = {
            id: newId,
            position: { x: 0, y: 0 },
            data: {
                label,
                description,
                emoji: emoji || "📝",
                diagram: diagram || null,
                imageUrl: null,
                imageLoading: !!imagePrompt // Show loading state if we'll generate an image
            },
            type: 'mindNode'
        };

        const newEdge: Edge = {
            id: `e-chat-${parentNode.id}-${newId}`,
            source: parentNode.id,
            target: newId,
            animated: true,
            style: { stroke: '#facc15', strokeDasharray: '5,5', strokeWidth: 2 }
        };

        const allNodes = [...nodes, newNode];
        const allEdges = [...get().edges, newEdge];

        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(allNodes, allEdges);

        set({
            nodes: layoutedNodes,
            edges: layoutedEdges,
            shouldFitView: true
        });

        // Generate image asynchronously if imagePrompt provided
        if (imagePrompt) {
            fetch('/api/generate-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: imagePrompt })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.imageUrl) {
                        // Update the node with the generated image
                        set({
                            nodes: get().nodes.map(n =>
                                n.id === newId
                                    ? { ...n, data: { ...n.data, imageUrl: data.imageUrl, imageLoading: false } }
                                    : n
                            )
                        });
                    }
                })
                .catch(err => {
                    console.error('Image generation failed:', err);
                    // Remove loading state on error
                    set({
                        nodes: get().nodes.map(n =>
                            n.id === newId
                                ? { ...n, data: { ...n.data, imageLoading: false } }
                                : n
                        )
                    });
                });
        }
    },

    setNodes: (nodes) => set({ nodes }),
    setEdges: (edges: Edge[]) => set({ edges }),
    setChatHistory: (history) => set({ chatHistory: history }),

    createNewSession: () => {
        set({
            nodes: [],
            edges: [],
            currentSessionId: null,
            chatHistory: [{ role: 'model', text: 'Hi! Select a node or ask me anything to deepen your understanding.' }]
        });
    },

    loadSessions: async () => {
        try {
            const res = await fetch('/api/sessions');
            const data = await res.json();
            if (Array.isArray(data)) {
                set({ recentSessions: data });
            }
        } catch (e) {
            console.error("Failed to load sessions list", e);
        }
    },

    loadSession: async (id: string) => {
        set({ isLoading: true });
        try {
            const res = await fetch(`/api/sessions/${id}`);
            const session = await res.json();
            if (session.id) {
                // Layout again just in case, or trust saved positions? 
                // Let's trust saved for now, but if we wanted to auto-fix legacy sessions we could run layout here.
                set({
                    currentSessionId: session.id,
                    nodes: session.nodes || [],
                    edges: session.edges || [],
                    chatHistory: session.chatHistory || [],
                    isLoading: false
                });
            }
        } catch (e) {
            console.error("Failed to load session", e);
            set({ isLoading: false });
        }
    },

    saveSession: async (title: string) => {
        const { nodes, edges, currentSessionId, chatHistory } = get();
        // Use existing ID or generate new one
        const id = currentSessionId || crypto.randomUUID();

        const sessionData = {
            id,
            title,
            nodes,
            edges,
            chatHistory
        };

        try {
            await fetch('/api/sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sessionData)
            });

            // Update local state
            set({ currentSessionId: id });
            // Refresh list
            get().loadSessions();

        } catch (e) {
            console.error("Failed to save session", e);
        }
    },

    deleteSession: async (id: string) => {
        try {
            await fetch(`/api/sessions?id=${id}`, { method: 'DELETE' });
            // If we deleted the current session, clear it
            if (get().currentSessionId === id) {
                get().createNewSession();
            }
            // Refresh list
            get().loadSessions();
        } catch (e) {
            console.error("Failed to delete session", e);
        }
    },

    sidebarOpen: true,
    chatOpen: true,
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    toggleChat: () => set((state) => ({ chatOpen: !state.chatOpen })),

    // Document context for PDFs
    documentContext: null,
    setDocumentContext: (context) => set({ documentContext: context }),
}));

export default useFlowStore;
