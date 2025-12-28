#!/usr/bin/env npx tsx

/**
 * Run the Quantum Computing Evaluation Test
 * 
 * Usage: npx tsx src/tests/run-eval.ts
 */

const API_URL = process.env.API_URL || 'http://localhost:3000';

async function main() {
    console.log('\n🚀 Starting NodeNest Evaluation Test...\n');
    console.log(`   API URL: ${API_URL}`);
    console.log(`   Make sure the dev server is running!\n`);

    // Dynamic import to avoid module issues
    const { runEvaluation } = await import('./quantum-eval');

    try {
        const results = await runEvaluation(API_URL);

        // Exit with error code if tests failed
        if (results.passed < results.total) {
            process.exit(1);
        }
    } catch (error) {
        console.error('❌ Evaluation failed with error:', error);
        process.exit(1);
    }
}

main();
