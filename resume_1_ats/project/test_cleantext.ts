// Test script to debug cleanText output
import { cleanText } from './src/lib/resumeParser';

const testInput = `Implemented team building activities to enhance positive working environments. Developed HR strategy. Created succession plans and promotion paths for staff, promoting retention and benefits structures according to market conditions and budget demands. Represented organisation term and seasonal positions.`;

console.log('=== INPUT ===');
console.log(testInput);
console.log('\n=== CLEANED OUTPUT ===');
const cleaned = cleanText(testInput);
console.log(cleaned);
console.log('\n=== LINE COUNT ===');
const lines = cleaned.split('\n').filter(l => l.trim());
console.log(`Total lines: ${lines.length}`);
lines.forEach((line, i) => {
    console.log(`Line ${i + 1}: ${line}`);
});
