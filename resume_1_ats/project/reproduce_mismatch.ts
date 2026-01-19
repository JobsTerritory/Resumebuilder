
import { matchJobPosting } from './src/lib/jobMatcher';
import { Resume } from './src/types';

// Mock Resume with "Sales" experience but maybe some "HR" triggers?
// User said: "experience i ssaying salwes" (Experience says sales)
// "The candidate background focused in HR" (System sees HR)
const mockResume: Resume = {
    id: '1',
    fileName: 'sales_rep_possibly_hr.pdf',
    text: '',
    personal_info: { fullName: 'Jane Doe', email: 'jane@example.com', phone: '123', location: 'NY' },
    summary: 'Experienced Sales Representative with a background in hiring and recruitment of new team members.',
    // ^ "hiring" and "recruitment" might trigger HR context
    experience: [
        {
            id: '1', position: 'Sales Representative', company: 'Tech Corp', startDate: 'Jan 2020', current: true,
            description: 'Responsible for B2B sales, revenue growth, and team hiring/recruitment.',
            technologies: ['Salesforce'], location: 'NY'
        }
    ],
    education: [],
    skills: ['Sales', 'Cold Calling', 'Recruitment', 'Hiring'], // Mixed skills
    projects: [], certifications: [], languages: [], sectionOrder: []
};

// Mock JD for "Customer Care Executive"
// User said: "jd customer ccare"
// System saw: "Target Sales domain" (maybe?)
const jobDescription = `
Job Title: Customer Care Executive
Job Summary: Handle customer inquiries and support.
Required Skills:
- Customer Service
- Communication
- Account Management
- Problem Solving
`;

async function run() {
    console.log("--- RUNNING REPRODUCTION ---");
    const result = await matchJobPosting(mockResume, jobDescription);
    console.log("--- RESULT ---");
    // We want to see logs about "Resume Context" and "JD Context"
    // I need to check the 'missingExperience' or console output from jobMatcher

    // Since jobMatcher logs to console, we should see it in output.
}

run();
