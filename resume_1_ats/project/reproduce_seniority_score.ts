
import { matchJobPosting } from './src/lib/jobMatcher';
import { Resume } from './src/types';

// Mock Resume (8.25 years, Senior Recruiter)
// 8.25 years = approx Jan 2016 to Present (March 2024 is 8.2 years)
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
    console.log("Running Seniority Mismatch Test...");
    try {
        const result = await matchJobPosting(mockResume, mockJD);
        console.log("\n--- MATCH RESULTS ---");
        console.log(`Overall Match Score: ${result.matchScore}%`);
        console.log(`Comprehensive Score: ${result.comprehensiveScore}%`);

        console.log("\n--- EXPERIENCE CATEOGORY ---");
        console.log("Score:", result.categoryScores.experienceMatch.score);
        console.log("Status:", result.categoryScores.experienceMatch.status);
        console.log("Feedback:", result.categoryScores.experienceMatch.feedback);

        console.log("\n--- KEYWORD CATEOGORY ---");
        console.log("Score:", result.categoryScores.keywordRelevance.score);
        console.log("Feedback:", result.categoryScores.keywordRelevance.feedback);

    } catch (error) {
        console.error("Error running test:", error);
    }
}

runTest();
