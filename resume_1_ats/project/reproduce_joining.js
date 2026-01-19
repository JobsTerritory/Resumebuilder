const cleanText = (text) => {
    if (!text) return '';

    return text
        .replace(/[•●\u27A2\u25AA]\s*/g, '\n• ')
        .split('\n').map(l => l.trim()).reduce((acc, line) => {
            if (!line) return acc;

            const prevLine = acc.length > 0 ? acc[acc.length - 1] : null;
            if (!prevLine) {
                acc.push(line);
                return acc;
            }

            const isBullet = /^[•●■▪\-*]\s|^\d+[\.\)]\s/.test(line);
            const sectionKeywords = ['experience', 'education', 'skills', 'projects', 'summary'];
            const isHeader = sectionKeywords.some(k => line.toLowerCase().startsWith(k) && line.length < 50);

            if (!isBullet && !isHeader && line.length > 0) {
                acc[acc.length - 1] = (prevLine + ' ' + line).replace(/\s{2,}/g, ' ');
            } else {
                acc.push(line);
            }
            return acc;
        }, []).join('\n');
};

const test1 = "• Oversee end-to-end recruitment processes... Relations a\nemployees and management on HR policies";
console.log("TEST 1 (Relations a):");
console.log(cleanText(test1));

const test2 = "• HR Policy Implementation: Contributed to drafting... organizational\nMFIs. Trained field HR staff";
console.log("\nTEST 2 (MFIs.):");
console.log(cleanText(test2));
