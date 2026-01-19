
// Mock of the improved cleanText logic
function cleanTextMock(text) {
    if (!text) return '';

    return text
        // Repair intraword spacing (simplified for test)
        .replace(/(\b[b-hj-zB-HJ-Z])\s+([a-z]{2,})/g, '$1$2')
        // Ensure bullets start on new line
        .replace(/[•●\u27A2\u25AA]\s*/g, '\n• ')
        // Join mid-sentence line breaks (The core logic being tested)
        .split('\n').map((line, i, arr) => {
            const nextLine = (arr[i + 1] || '').trim();
            const trimLine = line.trim();

            const endsWithSentenceIncomplete = trimLine.match(/[a-z0-9,* ]\**$| (?:and|or|with|using|for|in|at|to|by|on|of|the)$/i);
            const nextStartsFragment = nextLine.match(/^[a-z0-9,.;:)\u27A2\s]/) || nextLine.match(/^\*\*/);

            const isBoldOpen = (line.match(/\*\*/g) || []).length % 2 !== 0;

            if ((endsWithSentenceIncomplete && nextStartsFragment) || (trimLine && nextLine.match(/^[.,;:)\]}]/)) || isBoldOpen) {
                return trimLine + ' ';
            }
            return line + '\n';
        }).join('')
        .replace(/\s{2,}/g, ' ')
        .replace(/\n\s+/g, '\n')
        .trim();
}

const fragmentedInput = `Facilitated *

1:1s

,

skip-level meetings

, and

stay interviews

* to understand employee sentiment, identify early retention risks, and strengthen leadership–employee connect for more 2 BUs

Drove *

employee engagement

and

retention initiatives

by conducting

exit interviews

,

managing grievance

cases, running

pulse feedback

* sessions, and supporting action planning with managers.`;

// We simulate what mammoth might produce if it was extremely fragmented text
const simulatedTextFromMammoth = fragmentedInput;

console.log('--- FRAGMENTED INPUT ---');
console.log(simulatedTextFromMammoth);

const cleaned = cleanTextMock(simulatedTextFromMammoth);
console.log('\n--- CLEANED OUTPUT ---');
console.log(cleaned);

if (cleaned.includes('Facilitated * 1:1s , skip-level meetings , and stay interviews *')) {
    console.log('\n✅ SUCCESS: Fragmented bullet parts joined!');
} else {
    console.log('\n❌ FAILURE: Fragmentation remains!');
}
