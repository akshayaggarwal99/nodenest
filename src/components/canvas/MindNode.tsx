"use client";

import React, { memo, useState, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp, ImageIcon, X } from 'lucide-react';

// Simple Image Modal using Portal
function ImageModal({ imageUrl, label, onClose }: { imageUrl: string; label: string; onClose: () => void }) {
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return createPortal(
        <div
            className="fixed inset-0 z-[99999] bg-black/90 flex items-center justify-center p-4 cursor-pointer"
            onClick={onClose}
        >
            <button
                className="absolute top-4 right-4 p-3 text-white bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                onClick={onClose}
            >
                <X size={20} />
            </button>
            <img
                src={imageUrl}
                alt={label}
                className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl cursor-default"
                onClick={(e) => e.stopPropagation()}
            />
        </div>,
        document.body
    );
}

const MindNode = ({ data }: NodeProps) => {
    const { isRoot, emoji, diagram, imageUrl } = data;
    const [expanded, setExpanded] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const hasLongDescription = data.description && data.description.length > 100;

    const handleImageClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (imageUrl && imageLoaded) {
            setShowModal(true);
        }
    };

    return (
        <>
            <div className={cn(
                "group relative flex flex-col rounded-xl transition-all duration-300 cursor-pointer",
                "hover:-translate-y-1 hover:shadow-2xl",
                isRoot
                    ? "min-w-[300px] max-w-[400px] bg-zinc-900 border-2 border-green-500 p-5 shadow-xl shadow-green-500/10 hover:shadow-green-500/30"
                    : "min-w-[280px] max-w-[360px] bg-zinc-900/80 border border-zinc-700 p-4 shadow-xl backdrop-blur-sm hover:border-zinc-500 hover:bg-zinc-900"
            )}>
                <Handle
                    type="target"
                    position={Position.Top}
                    className={cn(
                        "!w-3 !h-3 !-top-[7px] !border-4 !border-black",
                        isRoot ? "!bg-green-500" : "!bg-zinc-600 !ring-4 !ring-black"
                    )}
                />

                {/* Header Row */}
                <div className="flex items-start gap-3">
                    <div className={cn(
                        "shrink-0 rounded-full flex items-center justify-center border shadow-inner",
                        isRoot
                            ? "w-11 h-11 bg-zinc-800 border-zinc-700 text-green-500"
                            : "w-9 h-9 bg-zinc-800 border-zinc-700 text-zinc-400"
                    )}>
                        <span className={cn("text-lg", isRoot && "group-hover:scale-110 transition-transform")}>
                            {emoji || (isRoot ? "🎯" : "📝")}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className={cn(
                            "font-bold leading-tight text-white",
                            isRoot ? "text-base" : "text-sm"
                        )}>
                            {data.label}
                        </h3>
                        {data.description && (
                            <div>
                                <p className={cn(
                                    "text-zinc-400 mt-1.5 leading-relaxed",
                                    isRoot ? "text-xs" : "text-[11px]",
                                    !expanded && hasLongDescription && "line-clamp-3"
                                )}>
                                    {data.description}
                                </p>
                                {hasLongDescription && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
                                        className="mt-1 text-[10px] text-green-500 hover:text-green-400 transition-colors font-medium"
                                    >
                                        {expanded ? "↑ Show less" : "↓ Show more"}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* AI Generated Image */}
                {(data.imageLoading || (imageUrl && !imageError)) && (
                    <div
                        className="mt-3 relative rounded-lg overflow-hidden bg-zinc-800 border border-zinc-700 min-h-[120px] cursor-pointer hover:border-green-500/50 transition-colors"
                        onClick={handleImageClick}
                    >
                        {(data.imageLoading || !imageLoaded) && (
                            <div className="absolute inset-0 flex items-center justify-center bg-zinc-800">
                                <div className="flex items-center gap-2 text-zinc-500 text-xs">
                                    <ImageIcon size={14} className="animate-pulse" />
                                    <span>{data.imageLoading ? "Generating..." : "Loading..."}</span>
                                </div>
                            </div>
                        )}
                        {imageUrl && (
                            <img
                                src={imageUrl}
                                alt={data.label}
                                className={cn(
                                    "w-full h-auto max-h-40 object-cover transition-opacity duration-300",
                                    imageLoaded && !data.imageLoading ? "opacity-100" : "opacity-0"
                                )}
                                onLoad={() => setImageLoaded(true)}
                                onError={() => setImageError(true)}
                            />
                        )}
                    </div>
                )}

                {/* Diagram */}
                {diagram && (
                    <div className="mt-3 p-2 bg-zinc-800 rounded-lg border border-zinc-700">
                        <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">
                            {diagram}
                        </pre>
                    </div>
                )}

                <Handle
                    type="source"
                    position={Position.Bottom}
                    className="!w-3 !h-3 !-bottom-[7px] !border-4 !border-black !bg-green-500 !ring-4 !ring-black"
                />
            </div>

            {/* Modal rendered via Portal */}
            {showModal && imageUrl && (
                <ImageModal
                    imageUrl={imageUrl}
                    label={data.label}
                    onClose={() => setShowModal(false)}
                />
            )}
        </>
    );
};

export default memo(MindNode);
