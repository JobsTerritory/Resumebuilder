
import { matchJobPosting } from './src/lib/jobMatcher';
import { Resume } from './src/types';

// Mock Resume (8.25 years, Senior Recruiter)
const mockResume: Resume = {
    id: '1',
    fileName: 'test.pdf',
    originalText: '',
    title: 'Test Resume',
    personal_info: {
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        phone: '1234567890',
        location: 'New York, NY'
    },
    summary: 'Senior Recruiter with over 8 years of experience in HR Operations and Talent Acquisition. Expert in negotiation and hiring.',
    education: [],
    experience: [
        {
            id: 'e1',
            company: 'ABC Corp',
            position: 'Senior Recruiter',
            startDate: 'Jan 2016',
            endDate: 'Present',
            current: true,
            description: 'Managed full cycle recruitment, HR operations, and talent acquisition. Negotiated salaries and closed deals.',
            technologies: ['HRIS', 'Excel'],
            location: 'New York'
        }
    ],
    skills: ['Recruitment', 'Negotiation', 'Hiring', 'HR Operations', 'Communication'],
    projects: [],
    certifications: [],
    industry: 'Recruitment',
    languages: [],
    interests: [],
    internships: [],
    template: 'modern',
    section_order: ['summary', 'experience', 'education', 'skills']
};

// Mock JD (1-3 years, Junior Sales)
// This should trigger:
// 1. Moderate Overqualification (8 vs 3 years) -> Base score ~60
// 2. Sales keyword overlap -> Keyword Mismatch Fallback
const mockJD = `
Job Title: Junior Sales Associate
Description:
We are looking for a Junior Sales Associate to join our team.
Required Experience: 1-3 years.
Field: Sales.
Responsibilities:
- Cold calling
- Business Development
- Closing sales
- Negotiation
`;

async function runTest() {
    console.log("TEST START");
    try {
        const result = await matchJobPosting(mockResume, mockJD);
        console.log(`EXP_SCORE:${result.categoryScores.experienceMatch.score}`);
        console.log("EXP_FEEDBACK_START");
        result.categoryScores.experienceMatch.feedback.forEach(f => console.log(f));
        console.log("EXP_FEEDBACK_END");
    } catch (error) {
        console.error("ERROR:", error);
    }
    console.log("TEST END");
}

runTest();
