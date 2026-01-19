
import path from 'path';
import fs from 'fs';

// Load env vars manually
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
            if (key && value) {
                process.env[key] = value;
            }
        }
    });
}

import { optimizeResumeForJob, matchJobPosting } from './src/lib/jobMatcher';
import { Resume } from './src/types';

const mockResume: Resume = {
    id: '1',
    title: 'Test Resume',
    personal_info: { fullName: 'John Doe', email: 'john@example.com', phone: '1234567890', location: 'New York, NY' },
    summary: 'Experienced software developer.',
    experience: [],
    education: [],
    skills: ['TypeScript', 'React', 'Node.js', 'AWS', 'Docker'], // Have all HARD skills
    projects: [],
    certifications: [],
    languages: [],
    interests: [],
    section_order: ['summary', 'experience', 'education', 'skills'],
    showProfilePicture: false
};

const mockJD = `
Job Title: Senior Software Engineer
Requirements:
- Must have experience with SaaS, CI/CD, and Agile.
- Knowledge of Microservices and REST APIs.
`;

async function runTest() {
    console.log('--- Initial Match ---');
    // Force specific domain keywords to generate "missing keywords" suggestion
    const initialResult = await matchJobPosting(mockResume, mockJD);
    console.log('Initial Suggestions:', initialResult.suggestions.map(s => s.suggestion));

    // Look for the specific summary keyword suggestion
    const keywordSuggestion = initialResult.suggestions.find(s => s.section === 'Summary' && s.suggestion.includes('keywords'));
    if (!keywordSuggestion) {
        console.error('SETUP ERROR: No keyword suggestion found initially. Missing: ' + initialResult.missingKeywords.join(', '));
        return;
    }

    console.log('\n--- Optimizing Resume ---');
    const optimized = await optimizeResumeForJob(mockResume, mockJD);
    console.log('Optimized Summary:', optimized.summary);

    console.log('\n--- Second Match (After Optimization) ---');
    const finalResult = await matchJobPosting(optimized, mockJD);
    console.log('Final Suggestions:', finalResult.suggestions.map(s => s.suggestion));

    const finalKeywordSuggestion = finalResult.suggestions.find(s => s.section === 'Summary' && s.suggestion.includes('keywords'));

    if (finalKeywordSuggestion) {
        console.error('FAIL: Keyword suggestion persisted: ', finalKeywordSuggestion.suggestion);
    } else {
        console.log('PASS: Keyword suggestion cleared!');
    }
}

runTest();
