import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
    startOnLoad: false,
    theme: 'base',
    securityLevel: 'loose',
    themeVariables: {
        primaryColor: '#dcfce7', // green-100
        primaryTextColor: '#166534', // green-800
        primaryBorderColor: '#22c55e', // green-500
        lineColor: '#22c55e',
        secondaryColor: '#f4f4f5', // zinc-100
        tertiaryColor: '#fff',
    }
});

interface MermaidDiagramProps {
    chart: string;
}

export const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ chart }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [svg, setSvg] = useState('');

    useEffect(() => {
        if (!chart) return;

        let isMounted = true;
        const id = `mermaid-${crypto.randomUUID()}`;

        const renderChart = async () => {
            try {
                const { svg } = await mermaid.render(id, chart);
                if (isMounted) setSvg(svg);
            } catch (error) {
                console.error("Mermaid failed to render:", error);
                if (isMounted) setSvg('<p class="text-xs text-red-500">Failed to render diagram</p>');
            }
        };

        renderChart();
        return () => { isMounted = false; };
    }, [chart]);

    return (
        <div
            ref={ref}
            className="mermaid-container w-full flex justify-center py-2 bg-white dark:bg-zinc-800 rounded-md border border-zinc-100 dark:border-zinc-700 overflow-hidden"
            dangerouslySetInnerHTML={{ __html: svg }}
        />
    );
};
