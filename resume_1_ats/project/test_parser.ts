
const text = `
Education
Bachelor of Technology - Computer Science and Engineering 202 1 - 202 5
Coursework : Operating Systems, Computer Networks, Databases, Data Structures and Algorithms , SQL
8. 3 )
-
Certificates and ACHIEVEMENTS
Internship Certificate CODSOFT Sep 2023
SQL (Basic) HackerRank ,2022
C ollege Cultural Fest Management 2024
Computer Course Completion 2019
Runner - U p i n Science Exhibition 2020
Interests Language: Fluent in English, Hindi and Nepali.
Computer: Excel, Powerpoint , MsWord.
Interests: Reading, Chess and Dancing.
Additional Information
Technical Skills:
JavaScript, Java
`;

function extractCertifications(text: string): any[] {
    console.log("Analyzing text...");
    const certifications: any[] = [];
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    const certKeywords = ['certification', 'certificates', 'licenses', 'licences', 'courses', 'awards', 'honors', 'achievements'];
    let certStartIndex = -1;
    let certEndIndex = lines.length;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].toLowerCase();
        console.log(`Checking line ${i}: "${line}"`);
        // Relaxed header check
        if (certKeywords.some(keyword => line === keyword || line === keyword + ':' || (line.includes(keyword) && line.length < 40 && !line.includes('summary')))) {
            console.log(`Found start at index ${i} with keyword match`);
            certStartIndex = i + 1;
            break;
        }
    }

    if (certStartIndex === -1) {
        console.log("No start index found");
        return [];
    }

    for (let i = certStartIndex; i < lines.length; i++) {
        const line = lines[i].toLowerCase();
        // detailed stop condition
        const sectionKeywords = ['experience', 'work experience', 'education', 'skills', 'technical skills', 'key skills', 'projects', 'languages', 'references', 'summary', 'profile', 'personal details'];

        if (sectionKeywords.some(k => line === k || line.startsWith(k + ':') || (line.includes(k) && line.length < 20))) {
            console.log(`Found end at index ${i} with keyword "${line}"`);
            certEndIndex = i;
            break;
        }
    }

    let currentCert: any = null;

    for (let i = certStartIndex; i < certEndIndex; i++) {
        const line = lines[i];
        console.log(`Processing line ${i}: "${line}"`);

        if (line.match(/^[-•]$/)) continue;

        const cleanLine = line.replace(/^[-•*]\s*/, '').trim();
        if (cleanLine.length < 2) continue;

        const dateRegex = /\b(20\d{2}|19\d{2})\b/;
        const hasDate = dateRegex.test(cleanLine);

        if (currentCert && (hasDate || cleanLine.toLowerCase().includes('issued') || cleanLine.toLowerCase().includes('by'))) {
            if (hasDate) {
                currentCert.date = cleanLine.match(dateRegex)?.[0] || '';
            }
            if (cleanLine.toLowerCase().includes('issued') || cleanLine.toLowerCase().includes('by')) {
                currentCert.issuer = cleanLine;
            }
        } else {
            currentCert = {
                id: Date.now().toString() + Math.random(),
                name: cleanLine,
                issuer: '',
                date: '',
                url: ''
            };
            certifications.push(currentCert);
        }
    }

    return certifications;
}

try {
    const certs = extractCertifications(text);
    console.log("Extracted Certs:", JSON.stringify(certs, null, 2));
} catch (e) { console.error(e) }
