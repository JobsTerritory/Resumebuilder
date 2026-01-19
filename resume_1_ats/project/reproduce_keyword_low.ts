
import { matchJobPosting } from './src/lib/jobMatcher';
import { Resume } from './src/types';

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
    summary: 'Experienced recruiter with 8 years in HR Operations and Sales. Expert in Negotiating and Closing deals.',
    education: [],
    experience: [
        {
            id: 'e1',
            company: 'ABC Corp',
            position: 'Senior Recruiter',
            startDate: 'Jan 2016',
            endDate: 'Present',
            current: true,
            description: 'Managed full cycle recruitment, HR operations. Negotiated salaries and closed deals with 20% revenue growth.',
            technologies: ['HRIS', 'Excel'],
            location: 'New York'
        }
    ],
    skills: ['Recruitment', 'Negotiation', 'Hiring', 'HR Operations', 'Communication', 'Sales', 'B2B'],
    projects: [],
    certifications: [],
    industry: 'Recruitment',
    languages: [],
    interests: [],
    internships: [],
    template: 'modern',
    section_order: ['summary', 'experience', 'education', 'skills']
};

const mockJD = `
Job Title: Sales Executive
Description:
We need a Sales Executive to handle Cold Calling, B2B Sales, and Revenue Growth.
Key Skills: Negotiation, Closing, Sales Pipeline, CRM, B2B, Recruitment, Communication.
Required Experience: 3-5 years.
`;

async function test() {
    console.log("TEST START");
    const result = await matchJobPosting(mockResume, mockJD);
    console.log(`KEYWORD_SCORE:${result.categoryScores.keywordRelevance.score}`);
    console.log("DETAILS:");
    result.categoryScores.keywordRelevance.feedback.forEach(f => console.log("-", f));
    console.log("TEST END");
}

test();
