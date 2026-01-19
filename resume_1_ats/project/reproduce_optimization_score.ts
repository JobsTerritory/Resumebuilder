
import { optimizeResumeForJob, matchJobPosting } from './src/lib/jobMatcher';
import { Resume } from './src/types';

// Mock Resume
const mockResume: Resume = {
    id: '123',
    title: 'Test Resume',
    personalInfo: {
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        location: 'New York, NY',
    },
    summary: 'Experienced software engineer with a focus on frontend development.',
    experience: [
        {
            id: '1',
            company: 'Tech Corp',
            position: 'Frontend Developer',
            startDate: '2020-01-01',
            endDate: 'Present',
            current: true,
            description: 'Worked on React applications.',
            technologies: ['React', 'TypeScript']
        }
    ],
    education: [],
    skills: ['JavaScript', 'React', 'HTML', 'CSS'],
    projects: [],
    certifications: [],
    languages: [],
    hobbies: [],
    socialLinks: [],
    // @ts-ignore
    template: 'modern',
    design: {
        font: 'Inter',
        colors: { primary: '#000000', accent: '#000000', text: '#000000', background: '#ffffff' },
        spacing: 'medium'
    }
};

// Mock JD with missing skills
const mockJD = `
Job Title: Senior Software Engineer
Requirements:
- Strong proficiency in JavaScript and React
- Experience with Node.js and Express (Missing)
- Knowledge of GraphQL (Missing)
- Familiarity with Docker and Kubernetes (Missing)
- Understanding of AWS (Missing)
`;

async function runTest() {
    console.log('--- Initial Match ---');
    const initialMatch = await matchJobPosting(mockResume, mockJD);
    console.log('Initial Skills Score:', initialMatch.breakdown.skillsScore);
    console.log('Initial Missing Skills:', initialMatch.missingSkills);

    console.log('\n--- Optimizing Resume ---');
    // Mocking the AI rewrite part if needed, but optimizeResumeForJob calls it.
    // We might need to mock rewriteForJob if it fails without API key, 
    // but for now let's see if it runs or if we need to stub it.
    // Actually, optimizeResumeForJob uses rewriteForJob which calls Gemini.
    // If we don't have API key it might fail. 
    // Let's assume the environment has it or we accept the failure/mock it.

    // To avoid API dependency in this reproduction, we can mock the behavior if strict
    // but let's try running it first. If it fails, I'll mock the import.

    try {
        const optimizedResume = await optimizeResumeForJob(mockResume, mockJD);

        console.log('\n--- Match After Optimization ---');
        const finalMatch = await matchJobPosting(optimizedResume, mockJD);
        console.log('Final Skills Score:', finalMatch.breakdown.skillsScore);
        console.log('Final Missing Skills:', finalMatch.missingSkills);
        console.log('Added Skills:', optimizedResume.skills.filter(s => !mockResume.skills.includes(s)));

    } catch (error) {
        console.error('Error during optimization:', error);
    }
}

runTest();
