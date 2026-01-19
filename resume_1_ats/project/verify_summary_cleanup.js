
const cleanSummaryText = (text) => {
    if (!text) return '';
    const summaryKeywords = ['professional summary', 'summary', 'profile', 'about', 'objective', 'overview', 'about me', 'professional profile', 'career objective', 'career profile'];
    let result = text.trim();

    // Strip any leading words that match our summary keywords
    const lowerText = result.toLowerCase();
    for (const kw of summaryKeywords) {
        const kwLower = kw.toLowerCase();
        if (lowerText.startsWith(kwLower)) {
            const remaining = result.slice(kw.length).trim();
            // If keyword is followed by colon, space, or newline
            if (!remaining || !/^[a-zA-Z0-9]/.test(remaining[0]) || remaining.startsWith(':')) {
                result = remaining.replace(/^[:\s\-]+/, '').trim();
                break;
            }
        }
    }
    return result;
};

const testCases = [
    { input: "SUMMARY Dependable HR professional...", expected: "Dependable HR professional..." },
    { input: "SUMMARY: Dependable HR professional...", expected: "Dependable HR professional..." },
    { input: "Professional Summary - Dependable HR professional...", expected: "Dependable HR professional..." },
    { input: "Objective: To find a job...", expected: "To find a job..." },
    { input: "Summaryof everything...", expected: "Summaryof everything..." },
    { input: "Dependable summary...", expected: "Dependable summary..." }
];

console.log("Testing Summary Cleanup Logic...");
testCases.forEach((tc, i) => {
    const output = cleanSummaryText(tc.input);
    if (output === tc.expected) {
        console.log(`✅ Test ${i + 1} passed`);
    } else {
        console.log(`❌ Test ${i + 1} failed: Expected "${tc.expected}", got "${output}"`);
    }
});
