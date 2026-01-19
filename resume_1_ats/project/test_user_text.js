// Test the exact user text with our regex
const userText = "Implemented team building activities to enhance positive working environments. Developed HR strategies and initiatives, aligning with overall business strategy. Created succession plans and promotion paths for staff, promoting retention and leadership continuity. Set up compensation and benefits structures according to market conditions and budget demands. Represented organisation at job fairs to bring in local talent for long - term and seaso nal positions. Organised staff development training based on team gaps and requirements. Established HR management system applicable across different types of employees, departments and seniority levels.";

console.log('=== ORIGINAL TEXT ===');
console.log(userText);

// Apply the period-capital splitting regex
const afterSplit = userText.replace(/([a-z0-9]{2,}[\.!?])\s*([A-Z][a-zA-Z]*)/g, '$1\n$2');

console.log('\n=== AFTER PERIOD-CAPITAL SPLIT ===');
console.log(afterSplit);

console.log('\n=== LINE COUNT ===');
const lines = afterSplit.split('\n').filter(l => l.trim());
console.log(`Total lines: ${lines.length}`);
lines.forEach((line, i) => {
    console.log(`\nLine ${i + 1}:`);
    console.log(line);
});
