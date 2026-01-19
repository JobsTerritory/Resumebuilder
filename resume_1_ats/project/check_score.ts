
import { matchJobPosting } from './src/lib/jobMatcher';
import { Resume } from './src/types';

// ... (Mock Resume identical to reproduce_scoring.ts but omitted for brevity if I could, but I need to include it)
// I will just import from reproduce_scoring... wait I can't easily import from a script file that runs code.
// I'll copy-paste the minimal setup.

const mockResume: Resume = {
    id: '1',
    fileName: 'software_engineer_resume.pdf',
    text: '',
    personal_info: { fullName: 'John Doe', email: 'john@example.com', phone: '123', location: 'NY' },
    summary: 'Senior Software Engineer with 5 years of experience building SaaS platforms.',
    experience: [
        {
            id: '1', position: 'Senior Software Engineer', company: 'Tech', startDate: 'Jan 2020', current: true,
            description: 'Coding', technologies: ['React'], location: 'NY'
        }
    ],
    education: [],
    skills: ['JavaScript', 'TypeScript', 'React'],
    projects: [], certifications: [], languages: [], sectionOrder: []
};

const jobDescription = `
Job Title: Sales Executive
Job Summary: Sales role.
Required Skills:
- Sales
- B2B
- Cold Calling
`;

// Simple test
const result = matchJobPosting(mockResume, jobDescription, 'software_engineer_resume.pdf');
console.log('FINAL_MATCH_SCORE:' + result.matchScore);
