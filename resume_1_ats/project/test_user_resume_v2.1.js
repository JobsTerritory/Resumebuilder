
const dateRegex = /(?:(?:\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?|(?:\d{1,2}[\/\.]))?\s*(?:20|19)\d{2}\s*(?:[-–—]|\bto\b)\s*(?:present|now|current|(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?|(?:\d{1,2}[\/\.]))?\s*(?:20|19)\d{2})|\b(?:20|19)\d{2}\b)/i;

const text = `Educational Details:
Examination Name of the Institute/Board Marks obtained in Year of
passed
2014
Chemistry)
2012
Udupi
2007
`;

const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

function test(lines) {
    let currentBlock = [];
    let blocks = [];

    // Header check
    let startIdx = 0;
    if (lines[0].toLowerCase().includes('educational')) startIdx = 1;

    for (let i = startIdx; i < lines.length; i++) {
        const line = lines[i];
        const hasDate = dateRegex.test(line);
        const blockHasDate = currentBlock.some(l => dateRegex.test(l));

        if (hasDate && blockHasDate) {
            const lastLine = currentBlock[currentBlock.length - 1];
            const looksLikeHeader = lastLine && lastLine.length < 80 && !dateRegex.test(lastLine) && !/^[\s\t]*[•●➢▪\-\d\.]/.test(lastLine);
            if (looksLikeHeader) {
                const header = currentBlock.pop();
                blocks.push(currentBlock);
                currentBlock = [header, line];
            } else {
                blocks.push(currentBlock);
                currentBlock = [line];
            }
        } else {
            currentBlock.push(line);
        }
    }
    if (currentBlock.length > 0) blocks.push(currentBlock);

    console.log("Found", blocks.length, "education blocks.");
    blocks.forEach((b, i) => {
        const textContent = b.join(' ').toLowerCase();
        let degree = '';
        let inst = '';

        // Simulating the degree/inst detection
        if (textContent.includes('chemistry')) degree = 'Chemistry';
        if (textContent.includes('udupi')) inst = 'Udupi';

        const dateMatch = b.find(l => dateRegex.test(l));

        console.log(`Block ${i + 1}:`);
        console.log(`  Lines: ${b.join(' | ')}`);
        console.log(`  Extracted: ${degree || 'Unknown'} at ${inst || 'Unknown'} (${dateMatch || 'No Date'})`);
    });
}

test(lines);
