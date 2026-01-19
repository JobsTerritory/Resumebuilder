// Test the full reduction loop logic
const testInput = `environments. Developed HR strategy. Created succession`;

console.log('=== INPUT ===');
console.log(testInput);

// Apply splitting
const afterSplit = testInput.replace(/([a-z0-9]{2,}[\.!?])\s*([A-Z][a-zA-Z]*)/g, '$1\n$2');
console.log('\n=== AFTER SPLIT ===');
console.log(afterSplit);

// Simulate the reduction loop
const lines = afterSplit.split('\n').map(l => l.trim());
const result = lines.reduce((acc, line) => {
    if (!line) return acc;

    const prevLine = acc.length > 0 ? acc[acc.length - 1] : null;
    if (!prevLine) {
        acc.push(line);
        return acc;
    }

    const bulletSymbolRegex = /^[•●■▪◦∙○\u2022\u25CF\u25AA\u25AB\u2219\u25CB\u25E6\u2023\u2043\u2044\uF0B7➢\u27A2➤\u27A4\u25B6\u25B2\u25BC\u25C6\u25C7\u25D8\u25D9\u25A0\u25A1\u25AA\u25AB\u00B7*•-]/;
    const isBullet = bulletSymbolRegex.test(line);
    const isHeader = false;
    const isDateRange = false;

    const lineTextPart = line.replace(bulletSymbolRegex, '').trim();
    const nextStartsLowercase = /^[a-z]/.test(lineTextPart);
    const isFakeBullet = isBullet && nextStartsLowercase && line.length > 2;

    const isJunkPunctuation = line.length <= 2 && /^[.,;:)\]}*•●■▪\-]+$/.test(line);

    const prevTrimmed = prevLine.trim();
    const prevEndsWithTerminal = /[.!?:]\**$/.test(prevTrimmed);

    const isBoldOpen = (prevTrimmed.match(/\*\*/g) || []).length % 2 !== 0;
    const isParenthesisOpen = (prevTrimmed.match(/\(/g) || []).length > (prevTrimmed.match(/\)/g) || []).length;

    const shouldJoin = !isHeader && !isDateRange && (
        isFakeBullet ||
        !prevEndsWithTerminal ||
        (prevEndsWithTerminal && nextStartsLowercase) ||
        isJunkPunctuation ||
        ((isBoldOpen || isParenthesisOpen) && !prevEndsWithTerminal && nextStartsLowercase)
    );

    console.log(`\nProcessing: "${line}"`);
    console.log(`  prevLine: "${prevLine}"`);
    console.log(`  prevEndsWithTerminal: ${prevEndsWithTerminal}`);
    console.log(`  nextStartsLowercase: ${nextStartsLowercase}`);
    console.log(`  shouldJoin: ${shouldJoin}`);

    if (shouldJoin) {
        acc[acc.length - 1] = prevLine + ' ' + line;
    } else {
        acc.push(line);
    }
    return acc;
}, []);

console.log('\n=== FINAL RESULT ===');
result.forEach((line, i) => {
    console.log(`Line ${i + 1}: ${line}`);
});
