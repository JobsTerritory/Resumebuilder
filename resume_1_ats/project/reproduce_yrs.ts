
import { matchJobPosting } from './src/lib/jobMatcher';
import { Resume } from './src/types';

// Resume with 3 years
const mockResume: Resume = {
    id: '1', fileName: 'resume.pdf', text: '',
    personal_info: { fullName: 'Dev', email: 'e@mail.com', phone: '123', location: 'NY' },
    summary: 'Dev with 3 years.',
    experience: [
        {
            id: '1', position: 'Dev', company: 'A',
            startDate: 'Jan 2020', endDate: 'Jan 2023', // 3 years
            description: 'Dev', technologies: [], location: 'NY'
        }
    ],
    education: [], skills: ['React'], projects: [], certifications: [], languages: [], sectionOrder: []
};

const jdYrs = `
Req:
5 yrs experience.
`;

const jdYoe = `
Req:
5 YOE required.
`;

console.log('--- Testing "5 yrs" ---');
const res1 = matchJobPosting(mockResume, jdYrs, 'resume.pdf');
console.log('Score 1 (Expect < 100):', res1.categoryScores.experienceMatch.score);

console.log('--- Testing "5 YOE" ---');
const res2 = matchJobPosting(mockResume, jdYoe, 'resume.pdf');
console.log('Score 2 (Expect < 100):', res2.categoryScores.experienceMatch.score);
