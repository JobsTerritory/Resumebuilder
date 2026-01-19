
import { matchJobPosting } from './src/lib/jobMatcher';
import { Resume } from './src/types';

const mockResume: Resume = {
    id: '1',
    fileName: 'resume.pdf',
    text: '',
    personal_info: {
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        location: 'New York, NY',
    },
    summary: 'Experienced professional looking for a new challenge.',
    experience: [],
    education: [],
    skills: ['Sales', 'CRM', 'B2B', 'Negotiation'],
    projects: [],
    certifications: [],
    sectionOrder: ['summary', 'experience', 'education', 'skills']
};

const jobDescription = `
Role: Sales Executive
Requirements:
- Experience in Sales and B2B
- CRM tools knowledge
- Negotiation skills
`;

(async () => {
    console.log('--- Running Match Job Posting Verbose ---');
    try {
        const result = await matchJobPosting(mockResume, jobDescription);

        console.log('Keywords extracted:', result.missingKeywords.concat(result.matchedSkills).filter(s => s.length > 0));
        // Note: missingKeywords in result is actually constructed from keywords + missingSkills? No, check MatchResult

        console.log('JD Matching Category Score:', result.categoryScores.jdMatching.score);
        console.log('JD Matching Feedback:', JSON.stringify(result.categoryScores.jdMatching.feedback, null, 2));

        const hasSevereGap = result.categoryScores.jdMatching.feedback.some(f => f.includes('Severe Keyword Gap'));
        console.log('Has "Severe Keyword Gap":', hasSevereGap);

    } catch (error) {
        console.error('Error running matching:', error);
    }
})();
