
import { parseResume } from './src/lib/resumeParser';

// Mock the file reading part since we are focusing on logic
// We will manually call the extractCertifications function in the test context
// But since the function is not exported, we might need to modify the file to export it or copy it here.
// For now, I'll copy the logic I want to test into a standalone test function or try to use the existing test pattern.

// Let's create a mock text that simulates the user's resume structure
const mockResumeText = `
Certifications & Awards
Internship Certificate CODSOFT Sep 2023

Interests
Reading, Chess and Dancing.

Language: Fluent in English, Hindi and Nepali.

Computer: Excel, Powerpoint , MsWord.
`;

// Copying the extractCertifications function logic here for quick local verification 
// because we cannot import non-exported functions easily without modifying the source.
function testExtractCertifications(text: string): any[] {
    const certifications: any[] = [];
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    const certKeywords = ['certification', 'certificate', 'licenses', 'licences', 'courses', 'awards', 'honors', 'achievement'];
    let certStartIndex = -1;
    let certEndIndex = lines.length;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].toLowerCase();
        if (certKeywords.some(keyword => line === keyword || line === keyword + ':' || (line.includes(keyword) && line.length < 40 && !line.includes('summary')))) {
            certStartIndex = i + 1;
            break;
        }
    }

    if (certStartIndex === -1) return [];

    for (let i = certStartIndex; i < lines.length; i++) {
        const line = lines[i].toLowerCase();
        // Fixed list including previously missing keywords
        const sectionKeywords = ['experience', 'work experience', 'education', 'skills', 'technical skills', 'key skills', 'projects', 'languages', 'language', 'references', 'summary', 'profile', 'personal details', 'additional information', 'interests', 'hobbies', 'computer'];

        if (sectionKeywords.some(k => line === k || line.startsWith(k + ':') || (line.includes(k) && line.length < 20))) {
            certEndIndex = i;
            break;
        }
    }

    let currentCert: any = null;

    for (let i = certStartIndex; i < certEndIndex; i++) {
        const line = lines[i];
        if (line.match(/^[-•]$/)) continue;
        const cleanLine = line.replace(/^[-•*]\s*/, '').trim();
        if (cleanLine.length < 2) continue;

        const dateRegex = /\b(20\d{2}|19\d{2})\b/;
        const hasDate = dateRegex.test(cleanLine);

        if (currentCert && (hasDate || cleanLine.toLowerCase().includes('issued') || cleanLine.toLowerCase().includes('by'))) {
            // metadata update
        } else {
            console.log("Found Cert:", cleanLine);
            certifications.push({ name: cleanLine });
        }
    }

    return certifications;
}

console.log("Running Extraction Test...");
const results = testExtractCertifications(mockResumeText);
console.log("Results:", JSON.stringify(results, null, 2));

if (results.some(c => c.name.toLowerCase().includes('interests'))) {
    console.error("FAIL: 'Interests' was incorrectly parsed as a certification.");
} else {
    console.log("PASS: 'Interests' was properly excluded.");
}

if (results.some(c => c.name.toLowerCase().includes('language'))) {
    console.error("FAIL: 'Language' was incorrectly parsed as a certification.");
}
