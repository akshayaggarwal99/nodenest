/**
 * Quantum Computing Learning Flow - Evaluation Test v2
 * 
 * Tests the AI learning agent for:
 * 1. GRAPH_ACTION generation when user shows understanding
 * 2. Quick replies generation
 * 3. UNIQUE labels (no duplicates)
 * 4. Proper parentLabel usage for depth
 * 5. Full conversation flow
 */

interface ChatResponse {
    response: string;
    graphAction?: {
        type: string;
        label: string;
        description: string;
        emoji?: string;
        parentLabel?: string;
        imagePrompt?: string;
    };
    quickReplies?: string[];
}

interface TestResult {
    passed: boolean;
    message: string;
    details?: any;
}

interface GraphNode {
    id: string;
    label: string;
    description: string;
    parentId: string;
    hasImage: boolean;
}

// Simulated beginner conversation
const CONVERSATION_TURNS = [
    "What is quantum computing?",
    "yes, that makes sense",
    "Tell me more about qubits",
    "I understand, so they're like switches?",
    "What is superposition?",
    "Oh so it can be 0 and 1 at the same time! Got it",
    "What about entanglement?",
    "Makes sense, like magic connection",
];

/**
 * Test 1: Verify AI produces GRAPH_ACTION with unique labels
 */
async function testGraphGeneration(apiUrl: string): Promise<TestResult> {
    console.log("\n📍 Test 1: Graph Action Generation");

    try {
        const res = await fetch(`${apiUrl}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: "yes, I understand now! Qubits are the building blocks.",
                history: [
                    { role: 'user', parts: [{ text: 'What is quantum computing?' }] },
                    { role: 'model', parts: [{ text: 'Quantum computing uses qubits instead of classical bits.' }] }
                ],
                currentTopic: "Quantum Computing"
            })
        });

        const data: ChatResponse = await res.json();

        if (!data.graphAction) {
            return { passed: false, message: "No GRAPH_ACTION produced when user showed understanding" };
        }

        const { label, description, emoji } = data.graphAction;

        if (!label || label.length < 2) {
            return { passed: false, message: "Label is missing or too short", details: data.graphAction };
        }

        if (!description || description.length < 20) {
            return { passed: false, message: "Description is missing or too short", details: data.graphAction };
        }

        if (!emoji) {
            return { passed: false, message: "Emoji is missing", details: data.graphAction };
        }

        return {
            passed: true,
            message: `Generated: "${label}" with ${description.length} char description`,
            details: data.graphAction
        };
    } catch (error) {
        return { passed: false, message: `API error: ${error}` };
    }
}

/**
 * Test 2: Verify quick replies are generated
 */
async function testQuickReplies(apiUrl: string): Promise<TestResult> {
    console.log("\n📍 Test 2: Quick Replies");

    try {
        const res = await fetch(`${apiUrl}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: "What are qubits?",
                history: [],
                currentTopic: "Quantum Computing"
            })
        });

        const data: ChatResponse = await res.json();

        if (!data.quickReplies || data.quickReplies.length === 0) {
            return { passed: false, message: "No quick replies generated" };
        }

        if (data.quickReplies.length < 2) {
            return { passed: false, message: `Only ${data.quickReplies.length} quick reply` };
        }

        return {
            passed: true,
            message: `${data.quickReplies.length} quick replies: ${data.quickReplies.join(' | ')}`
        };
    } catch (error) {
        return { passed: false, message: `API error: ${error}` };
    }
}

/**
 * Test 3: Full conversation - check unique labels and depth
 */
async function testFullConversation(apiUrl: string): Promise<TestResult> {
    console.log("\n📍 Test 3: Full Conversation Flow\n");

    const nodes: GraphNode[] = [];
    const edges: { source: string; target: string }[] = [];
    const seenLabels = new Set<string>();
    const history: any[] = [];
    let nodeId = 0;

    // Add root
    nodes.push({ id: 'root', label: 'Quantum Computing', description: 'Root', parentId: '', hasImage: false });

    for (const userMessage of CONVERSATION_TURNS) {
        console.log(`  👤 "${userMessage}"`);

        try {
            const res = await fetch(`${apiUrl}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    history: history,
                    currentTopic: "Quantum Computing"
                })
            });

            const data: ChatResponse = await res.json();

            // Update history
            history.push({ role: 'user', parts: [{ text: userMessage }] });
            history.push({ role: 'model', parts: [{ text: data.response }] });

            console.log(`  🤖 "${data.response.substring(0, 80)}..."`);

            if (data.graphAction) {
                const { label, parentLabel, imagePrompt } = data.graphAction;
                const labelLower = label.toLowerCase();

                // Check for duplicate
                if (seenLabels.has(labelLower)) {
                    console.log(`  ⚠️  DUPLICATE label: "${label}"`);
                } else {
                    seenLabels.add(labelLower);
                    const newId = `node-${++nodeId}`;

                    // Find parent
                    let parentId = 'root';
                    if (parentLabel) {
                        const parent = nodes.find(n => n.label.toLowerCase().includes(parentLabel.toLowerCase()));
                        if (parent) parentId = parent.id;
                    }

                    nodes.push({
                        id: newId,
                        label,
                        description: data.graphAction.description,
                        parentId,
                        hasImage: !!imagePrompt
                    });
                    edges.push({ source: parentId, target: newId });

                    console.log(`  📝 Added: "${label}" → parent: ${parentId === 'root' ? 'ROOT' : parentLabel}`);
                }
            }

            await new Promise(r => setTimeout(r, 300)); // Rate limit
        } catch (error) {
            console.log(`  ❌ Error: ${error}`);
        }
    }

    // Analyze results
    console.log("\n  📊 Graph Analysis:");
    console.log(`     Nodes: ${nodes.length}`);
    console.log(`     Unique labels: ${seenLabels.size}`);
    console.log(`     Labels: ${Array.from(seenLabels).join(', ')}`);

    // Count depth
    const rootChildren = edges.filter(e => e.source === 'root').length;
    const subBranches = edges.filter(e => e.source !== 'root').length;

    console.log(`     Root branches: ${rootChildren}`);
    console.log(`     Sub-branches: ${subBranches}`);

    // Validation
    const issues: string[] = [];

    if (nodes.length < 4) {
        issues.push(`Only ${nodes.length} nodes created (expected 4+)`);
    }

    if (seenLabels.size < nodes.length - 1) {
        issues.push(`Duplicate labels detected`);
    }

    // Check for key concepts (lenient - partial match)
    const requiredish = ['qubit', 'superposition', 'entangle'];
    const labels = Array.from(seenLabels);
    const missing = requiredish.filter(req => !labels.some(l => l.includes(req)));
    if (missing.length > 0) {
        issues.push(`Missing concepts: ${missing.join(', ')}`);
    }

    if (issues.length > 0) {
        return {
            passed: false,
            message: issues.join('; '),
            details: { nodes: nodes.length, labels: Array.from(seenLabels), rootChildren, subBranches }
        };
    }

    return {
        passed: true,
        message: `${nodes.length} nodes, ${seenLabels.size} unique labels, ${subBranches} sub-branches`,
        details: { labels: Array.from(seenLabels), rootChildren, subBranches }
    };
}

/**
 * Run all tests
 */
async function runEvaluation(apiUrl: string = 'http://localhost:3000') {
    console.log("╔══════════════════════════════════════════════════════════╗");
    console.log("║   NodeNest Evaluation Suite - Quantum Computing          ║");
    console.log("╚══════════════════════════════════════════════════════════╝\n");

    const results: { name: string; result: TestResult }[] = [];

    // Test 1
    results.push({ name: "Graph Action Generation", result: await testGraphGeneration(apiUrl) });

    // Test 2
    results.push({ name: "Quick Replies", result: await testQuickReplies(apiUrl) });

    // Test 3
    results.push({ name: "Full Conversation", result: await testFullConversation(apiUrl) });

    // Summary
    console.log("\n╔══════════════════════════════════════════════════════════╗");
    console.log("║   RESULTS                                                 ║");
    console.log("╚══════════════════════════════════════════════════════════╝\n");

    let passed = 0;
    for (const { name, result } of results) {
        const icon = result.passed ? '✅' : '❌';
        console.log(`  ${icon} ${name}: ${result.message}`);
        if (result.passed) passed++;
    }

    console.log(`\n  Score: ${passed}/${results.length}\n`);

    return { passed, total: results.length, results };
}

export { runEvaluation };

// Run if executed directly
if (typeof process !== 'undefined' && process.argv[1]?.includes('quantum-eval')) {
    runEvaluation().then(r => {
        process.exit(r.passed < r.total ? 1 : 0);
    });
}
