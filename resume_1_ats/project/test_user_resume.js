
// FIXED REGEX
const dateRegex = /(?:(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*(?:(?:20|19)?\d{2}))|(?:\b(?:20|19)\d{2}\b))\s*(?:[-–—]|\bto\b|\bsince\b)\s*(?:present|now|current|(?:\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?|(?:\d{1,2}[\/\.]))?\s*(?:(?:20|19)?\d{2}))|(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*(?:(?:20|19)?\d{2}))|(?:\bsince\s+|\bfrom\s+|\bjoined\s+)(?:\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?|(?:\d{1,2}[\/\.]))?\s*(?:(?:20|19)?\d{2})|\b(?:20|19)\d{2}\b/i;

// FIXED PARSING
function parseResumeDate(dateStr) {
    if (!dateStr) return null;
    const clean = dateStr.replace(/undefined\s*/gi, '').replace(/[()]/g, '').trim();
    if (!clean) return null;

    if (clean.toLowerCase() === 'present' || clean.toLowerCase() === 'now') return new Date();

    const monthRegex = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\b/i;
    const yearRegex = /\b(')?(\d{2,4})\b/;

    const mMatch = clean.match(monthRegex);
    const yMatch = clean.match(yearRegex);

    if (yMatch) {
        let year = parseInt(yMatch[2]);
        if (year < 100) year = (year < 50 ? 2000 + year : 1900 + year);

        let month = 0;
        if (mMatch) {
            const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
            month = months.indexOf(mMatch[1].toLowerCase().substring(0, 3));
        }
        return new Date(year, month, 1);
    }

    const d = new Date(clean);
    return isNaN(d.getTime()) ? null : d;
}

console.log("\n--- Date Parsing Verification ---");
const d1 = parseResumeDate("May 23");
console.log("Parse 'May 23':", d1 ? d1.getFullYear() : "FAILED");

const d2 = parseResumeDate("Apr 24");
console.log("Parse 'Apr 24':", d2 ? d2.getFullYear() : "FAILED");

const d3 = parseResumeDate("January 25");
console.log("Parse 'January 25':", d3 ? d3.getFullYear() : "FAILED");

console.log("\n--- Regex Butchering Verification ---");
const dateLine = "Work from November 2021 to May 2022";
const cleanLine = dateLine.replace(dateRegex, '').trim();
console.log(`Original: "${dateLine}"`);
console.log(`Cleaned:  "${cleanLine}"`);
if (cleanLine.includes("Work from")) {
    console.log("✅ No butchering detected!");
} else {
    console.log("❌ BUTCHERING DETECTED!");
}
