// Direct test of the cleanText regex logic
const testInput = `Implemented team building activities to enhance positive working environments. Developed HR strategy. Created succession plans and promotion paths for staff, promoting retention and benefits structures according to market conditions and budget demands. Represented organisation term and seasonal positions.`;

console.log('=== INPUT ===');
console.log(testInput);

// Apply the splitting regex
const afterSplit = testInput.replace(/([a-z0-9]{2,}[\.!?])\s*([A-Z][a-zA-Z]*)/g, '$1\n$2');

console.log('\n=== AFTER PERIOD-CAPITAL SPLIT ===');
console.log(afterSplit);

console.log('\n=== LINE COUNT ===');
const lines = afterSplit.split('\n').filter(l => l.trim());
console.log(`Total lines: ${lines.length}`);
lines.forEach((line, i) => {
    console.log(`Line ${i + 1}: ${line}`);
});
