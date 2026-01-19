
import { cleanText } from './src/lib/resumeParser';

const testCases = [
    {
        name: "Bold wrap at end of line",
        input: "Supported **promotion and\ntalent review cycles** by validating...",
        expected: "Supported **promotion and talent review cycles** by validating..."
    },
    {
        name: "Bold wrap at start of line",
        input: "Supported **\npromotion and talent review cycles** by validating...",
        expected: "Supported **promotion and talent review cycles** by validating..."
    },
    {
        name: "Bullet with bold wrap",
        input: "• Supported **promotion and\ntalent review cycles** by validating...",
        expected: "• Supported **promotion and talent review cycles** by validating..."
    }
];

console.log("--- Testing cleanText Joining Heuristic ---");
testCases.forEach(tc => {
    const result = cleanText(tc.input);
    const success = result.includes(tc.expected.replace(/\n/g, ' ')); // Simplified check
    console.log(`[${tc.name}] ${success ? 'PASSED' : 'FAILED'}`);
    if (!success) {
        console.log(`  Input length: ${tc.input.length}`);
        console.log(`  Expected substring: ${tc.expected}`);
        console.log(`  Actual result: ${result}`);
    }
});
