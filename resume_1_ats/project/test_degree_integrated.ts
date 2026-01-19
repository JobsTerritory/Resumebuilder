
import { matchJobPosting } from './src/lib/jobMatcher';
import { Resume } from './src/types';

const mockResume: Resume = {
    title: 'Test Resume',
    personal_info: {
        fullName: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        location: 'Mumbai',
        portfolio: 'test.com'
    },
    summary: 'Experienced HR professional.',
    experience: [],
    education: [
        {
            id: '1',
            institution: 'Test College',
            degree: 'PGPM(HR)',
            field: 'HR',
            location: 'Mumbai',
            startDate: '2020',
            endDate: '2022',
            current: false
        },
        {
            id: '2',
            institution: 'Test Unit',
            degree: 'BMS(HR)',
            field: 'HR',
            location: 'Mumbai',
            startDate: '2017',
            endDate: '2020',
            current: false
        }
    ],
    skills: ['HR'],
    projects: [],
    certifications: [],
    languages: [],
    interests: [],
    internships: [],
    template: 'modern',
    section_order: ['summary', 'experience', 'education', 'skills']
};

const jd = "Master's degree required in Human Resources.";

async function runTest() {
    try {
        const result = await matchJobPosting(mockResume, jd);
        console.log("=== COMPREHENSIVE SCORE ===");
        console.log("Score:", result.comprehensiveScore);
        console.log("\n=== EDUCATION FEEDBACK ===");
        console.log(result.jdMatching.feedback.join('\n'));
        console.log("\n=== MISSING EDUCATION FIELD ===");
        console.log(result.missingEducation);
    } catch (e) {
        console.error(e);
    }
}

runTest();
