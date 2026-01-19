
const dateRegex = /(?:(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*(?:(?:20|19)?\d{2}))|(?:\b(?:20|19)\d{2}\b))\s*(?:[-–—to]|\bsince\b)\s*(?:present|now|current|(?:\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?|(?:\d{1,2}[\/\.]))?\s*(?:(?:20|19)?\d{2}))|(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*(?:(?:20|19)?\d{2}))|(?:\bsince\s+|\bfrom\s+|\bjoined\s+)(?:\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?|(?:\d{1,2}[\/\.]))?\s*(?:(?:20|19)?\d{2})|\b(?:20|19)\d{2}\b/i;

const testLines = [
    "WORK EXPERIENCE",
    "January 25 to Present, Associate: HRBP- Cashfree Payments, Bengaluru",
    "KEY RESPONSIBILITIES",
    "➢ Point 1",
    "May 23 to Apr 24, Management Trainee - HR, RMC Division, Mumbai"
];

function testGrouping(lines) {
    let currentBlock = [];
    let blocks = [];

    for (let line of lines) {
        const hasDate = dateRegex.test(line);
        const blockHasDate = currentBlock.some(l => dateRegex.test(l));

        console.log(`Line: "${line.substring(0, 30)}" | hasDate: ${hasDate} | blockHasDate: ${blockHasDate}`);

        if (hasDate && blockHasDate) {
            const lastLine = currentBlock[currentBlock.length - 1];
            const looksLikeHeader = lastLine && lastLine.length < 80 && !dateRegex.test(lastLine);
            if (looksLikeHeader) {
                const headerLine = currentBlock.pop();
                blocks.push(currentBlock);
                currentBlock = [headerLine, line];
            } else {
                blocks.push(currentBlock);
                currentBlock = [line];
            }
        } else {
            currentBlock.push(line);
        }
    }
    blocks.push(currentBlock);
    return blocks;
}

const result = testGrouping(testLines);
console.log("\nBlocks Count:", result.length);
result.forEach((b, i) => {
    console.log(`Block ${i + 1}:`, b);
});
