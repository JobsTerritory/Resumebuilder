
import { matchJobPosting } from './src/lib/jobMatcher';
import { Resume } from './src/types';

// Mock Resume with OVERLAPPING experience
// Real world time: Jan 2020 to Jan 2022 = 2 years.
// Job 1: Jan 2020 - Jan 2022 (2 years)
// Job 2: Jan 2020 - Jan 2021 (1 year, overlapping)
// Current naive logic: 2 + 1 = 3 years.
// Correct logic: 2 years.

const mockResume: Resume = {
    id: '1', fileName: 'resume.pdf', text: '',
    personal_info: { fullName: 'Dev', email: 'e@mail.com', phone: '123', location: 'NY' },
    summary: 'Dev',
    experience: [
        {
            id: '1', position: 'Full Time Dev', company: 'A',
            startDate: 'Jan 2020', endDate: 'Jan 2022',
            description: 'Full time', technologies: [], location: 'NY'
        },
        {
            id: '2', position: 'Freelance Dev', company: 'B',
            startDate: 'Jan 2020', endDate: 'Jan 2021',
            description: 'Freelance', technologies: [], location: 'NY'
        }
    ],
    education: [], skills: [], projects: [], certifications: [], languages: [], sectionOrder: []
};

const jobDescription = `
Job Title: Dev
Requirements:
- 3 years of experience.
`;

const result = matchJobPosting(mockResume, jobDescription, 'resume.pdf');
console.log('Match Score:', result.matchScore);
// We can't easily inspect the internal extractedYears from the result object directly unless we log it or infer from score.
// If extracted is 3 years, match score for experience will be 100%.
// If extracted is 2 years, it will be < 100%.

// I will assume the user has access to console logs or I will add a log in the code temporarily if needed.
// But based on reading the code, I know it sums.

// Let's print the experience score breakdown if possible, or just the main score.
console.log('Experience Breakdown:', JSON.stringify(result.categoryScores.experienceMatch, null, 2));

// Quick check if I can modify jobMatcher to export the calculator for testing,
// but for now I'll trust the integration test.
