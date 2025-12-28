"use client";

import React, { useEffect } from 'react';
import ReactFlow, {
    Background,
    Controls,
    useReactFlow,
    ReactFlowProvider,
    Panel,
    getRectOfNodes,
    getTransformForBounds,
} from 'reactflow';
import { toPng } from 'html-to-image';
import { Download } from 'lucide-react';
import 'reactflow/dist/style.css';
import useFlowStore from '@/store/useFlowStore';
import MindNode from './MindNode';

const nodeTypes = {
    mindNode: MindNode,
};

function FlowCanvasInternal() {
    const {
        nodes,
        edges,
        onNodesChange,
        onEdgesChange,
        onConnect,
        shouldFitView,
        clearFitView,
    } = useFlowStore();

    const { fitView, getNodes } = useReactFlow();

    // Download graph as PNG
    const handleDownload = () => {
        const allNodes = getNodes();
        if (allNodes.length === 0) return;

        const nodesBounds = getRectOfNodes(allNodes);
        const imageWidth = nodesBounds.width + 100;
        const imageHeight = nodesBounds.height + 100;
        const transform = getTransformForBounds(
            nodesBounds,
            imageWidth,
            imageHeight,
            0.5,
            2
        );

        const viewport = document.querySelector('.react-flow__viewport') as HTMLElement;
        if (!viewport) return;

        toPng(viewport, {
            backgroundColor: '#09090b',
            width: imageWidth,
            height: imageHeight,
            skipFonts: true, // Skip external fonts to avoid CORS errors
            style: {
                width: `${imageWidth}px`,
                height: `${imageHeight}px`,
                transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`,
            },
        }).then((dataUrl) => {
            // Get topic name from root node for filename
            const rootNode = allNodes.find(n => n.data?.isRoot);
            const topicName = rootNode?.data?.label || 'mindmap';
            const safeName = topicName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

            const link = document.createElement('a');
            link.download = `${safeName}.png`;
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }).catch((error) => {
            console.error('Export failed:', error);
        });
    };

    // Auto fitView when nodes change and shouldFitView is true
    useEffect(() => {
        if (shouldFitView && nodes.length > 0) {
            setTimeout(() => {
                fitView({ padding: 0.3, duration: 500 });
                clearFitView();
            }, 100);
        }
    }, [shouldFitView, nodes.length, fitView, clearFitView]);

    // Also fitView on initial load with nodes
    useEffect(() => {
        if (nodes.length > 0) {
            setTimeout(() => {
                fitView({ padding: 0.3, duration: 300 });
            }, 200);
        }
    }, []);

    return (
        <div className="w-full h-full bg-zinc-950">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                className="bg-zinc-950"
                minZoom={0.2}
                maxZoom={2}
                defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
            >
                <Background gap={24} size={1} color="#27272a" />
                <Controls
                    className="bg-zinc-800 border-zinc-700 rounded-lg overflow-hidden"
                    showInteractive={false}
                />

                {/* Download Button - Top Right */}
                <Panel position="top-right" className="!mt-4 !mr-4">
                    <button
                        onClick={handleDownload}
                        disabled={nodes.length === 0}
                        className="group flex items-center gap-2 p-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-300 hover:bg-green-500 hover:text-black hover:border-green-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                        title="Download as PNG"
                    >
                        <Download size={18} />
                        <span className="max-w-0 overflow-hidden group-hover:max-w-[80px] transition-all duration-300 text-sm font-medium whitespace-nowrap">
                            Download
                        </span>
                    </button>
                </Panel>
            </ReactFlow>
        </div>
    );
}

export function FlowCanvas() {
    return (
        <ReactFlowProvider>
            <FlowCanvasInternal />
        </ReactFlowProvider>
    );
}
