
const dateRegex = /(?:(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*(?:(?:'|20|19)?\d{2,4}))|(?:\b(?:20|19)\d{2,4}\b))\s*(?:[-–—]|\bto\b|\bsince\b|\s+(?=\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|present|now|current|'|20|19)\b))\s*(?:present|now|current|(?:\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?|(?:\d{1,2}[\/\.]))?\s*(?:(?:'|20|19)?\d{2,4}))|(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*(?:(?:'|20|19)?\d{2,4}))|(?:\bsince\s+|\bfrom\s+|\bjoined\s+)(?:\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?|(?:\d{1,2}[\/\.]))?\s*(?:(?:'|20|19)?\d{2,4})|\b(?:20|19)\d{2,4}\b/i;

const text = `➢ Executive HRBP Pierian Services Pvt. Ltd till date
Mar 2025 - Mar 2025
▪ Lead engagement initiatives such as wellness programs, festival events, birthday
Projects
Synthesis”, writing detailed and summarizes project progress report.
Certifications
▪ Administer employee surveys (ESAT, engagement, NPS), analyze results, and
2025
▪ D evelop and maintain strong relationships with employees and management.
2020
▪ Managed end - to - end recruitment and selection processes
➢ Team Member - 3, IPM Department at Aurigene Pharmaceutical Services Limited, Bangalore 
2016
`;

const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

function test(lines) {
    let currentBlock = [];
    let blocks = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lowerLine = line.toLowerCase();

        const hasDate = dateRegex.test(line);
        const blockHasDate = currentBlock.some(l => dateRegex.test(l));

        // Stop keyword logic
        const isBullet = /^[\s\t]*[•●➢▪\-\d\.]/.test(line);
        const prevWasBullet = i > 0 && /^[\s\t]*[•●➢▪\-\d\.]/.test(lines[i - 1]);
        const stopKeywords = ['projects', 'certifications', 'skills'];

        let isStop = false;
        if (!isBullet && stopKeywords.some(k => lowerLine === k)) {
            const nextIsBullet = i + 1 < lines.length && /^[\s\t]*[•●➢▪\-]/.test(lines[i + 1]);
            if (!prevWasBullet && !nextIsBullet) {
                isStop = true;
            }
        }

        if (isStop) {
            console.log("!!! STOPPED AT", line);
            break;
        }

        if (hasDate && blockHasDate) {
            // Split with peek back
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
    blocks.push(currentBlock);

    console.log("Found", blocks.length, "blocks.");
    blocks.forEach((b, i) => {
        console.log(`Block ${i + 1}:`, b.join(' | ').substring(0, 150));
    });
}

test(lines);
