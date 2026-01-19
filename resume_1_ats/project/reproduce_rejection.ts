
import { parseResume } from './src/lib/resumeParser';

// Mock a File-like object for parseResume
async function test() {
    console.log("Starting reproduction test...");

    // Simulating text that would be extracted from a PDF
    const mockText = `
John Doe
Sales Executive
john@example.com

Summary
Motivated sales professional.

Work Experience
Sales Executive
Zomato Food Delivery
Jan 2020 - Present
- Increased sales by 20%
- Managed client relationships

Education
Bachelor of Commerce
Delhi University
2016-2019
`;

    // We need to bypass the file reading part and call extractExperience directly or mock the file
    // Since parseResume is the exported function, let's see if we can trick it or just copy the function for local test.

    const testText = `
Work Experience (5+ years)
➢ Sales Executive
▪ Zomato Food Delivery
Jan 2020 - Present
`;

    // Mocking the extraction logic (mimicking the problematic part of resumeParser.ts)
    function mockExtractExperience(text: string) {
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        let experienceStartIndex = 1;
        let block = lines.slice(experienceStartIndex);

        let position = '';
        let company = '';

        for (let i = 0; i < Math.min(3, block.length); i++) {
            const line = block[i];
            const lowerLine = line.toLowerCase();

            // THE PROBLEMATIC CHECK: !/^[\s\t]*[•●➢▪\-]/.test(line)
            if (line.split(' ').length < 12 && !/^[\s\t]*[•●➢▪\-]/.test(line)) {
                const isPos = /manager|engineer|developer|hr|hrbp|executive|analyst|associate|lead|director|head|recruiter|specialist|intern|member|coordinator|consultant|assistant|officer|trainee/i.test(lowerLine);
                if (!position && isPos) {
                    position = line;
                } else if (!company && !isPos && position) {
                    company = line;
                }
            }
        }

        console.log("Extracted Position:", position || "EMPTY");
        console.log("Extracted Company:", company || "EMPTY");

        if (!position || !company) {
            console.log("FAILURE: Could not extract position/company because of bullet points!");
            return [];
        }
        return [{ position, company }];
    }

    const result = mockExtractExperience(testText);
    if (result.length === 0) {
        console.log("FAILURE: Experience was REJECTED incorrectly!");
    } else {
        console.log("SUCCESS: Experience was parsed.");
    }

    // 3. Test Education Premature Stop
    function mockExtractEducation(text: string) {
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        const educationStartIndex = 1;
        const stopKeywords = ['executive', 'manager']; // Simplified
        const degreeKeywords = ['mba', 'bachelor'];

        let stopIndex = lines.length;
        for (let i = educationStartIndex; i < lines.length; i++) {
            const line = lines[i].toLowerCase();
            const hasDegree = degreeKeywords.some(dk => line.includes(dk));
            if (stopKeywords.some(sk => line.includes(sk)) && !hasDegree) {
                stopIndex = i;
                break;
            }
        }

        console.log("Education Stop Index:", stopIndex, "(Expected: 3)");
        if (stopIndex <= 2) {
            console.log("FAILURE: Education stopped prematurely on degree line!");
            return [];
        }
        console.log("SUCCESS: Education did not stop on 'Executive MBA'.");
        return lines.slice(educationStartIndex, stopIndex);
    }

    const eduText = `
Education
Executive MBA
IIM Bangalore
Work Experience
`;

    const eduResult = mockExtractEducation(eduText);
    if (eduResult.length === 0) {
        console.log("FAILURE: Education was NOT parsed correctly!");
    } else {
        console.log("SUCCESS: Education was parsed.");
    }
}

test();
