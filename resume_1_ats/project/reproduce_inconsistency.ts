
import { matchJobPosting } from './src/lib/jobMatcher';
import { Resume } from './src/types';
import { parseJDWithAI } from './src/lib/jdParser';

const mockResume: Resume = {
    id: '1',
    personal_info: {
        fullName: 'RENI M CHERIAN',
        email: 'renicherian2795@gmail.com',
        phone: '9611616745',
        location: 'Bengaluru',
        title: 'Assistant Manager-HR/HRBP'
    },
    title: 'Assistant Manager-HR/HRBP',
    summary: 'To pursue a successful, challenging and exciting career while being able to dispense my maximum potential at the same time acquiring knowledge on the road to success.',
    experience: [
        {
            id: 'e1',
            company: 'Sahayog multistate credit co-operative society',
            position: 'Assistant Manager-HR/HRBP',
            location: '',
            startDate: 'Jan 2020',
            endDate: 'Present',
            current: true,
            description: 'Employee end to end life cycle from onboarding till Exit closure\nHandling Attrition and retention cases\nReport preparation EWS\nConducting interviews\nHandling PIP and termination case'
        }
    ],
    internships: [],
    education: [],
    skills: ['HRBP', 'Onboarding', 'Interests', 'Attrition', 'Retention', 'Interviews', 'PIP', 'Employee Lifecycle'],
    projects: [],
    certifications: [],
    languages: [],
    interests: [],
    template: 'tech-modern',
    design: 'professional-clean',
    industry: 'Recruitment',
    section_order: ['summary', 'experience', 'education', 'skills']
};

const jdText = `1. HR Business Partner (HRBP) - Mid-Market / Tech
This role leverages your experience at Flipkart and Moder Solution, focusing on the end-to-end employee lifecycle and data sanity.

Key Responsibilities:
Strategic Partnership: Act as a consultant to business leads on human resource-related issues, ensuring HR strategies are aligned with business goal.
Employee Lifecycle Management: Manage end-to-end employee lifecycle...`;

async function testStability() {
    console.log('--- Testing JD Parsing Stability ---');
    for (let i = 1; i <= 5; i++) {
        const aiReqs = await parseJDWithAI(jdText);
        console.log(`Run ${i}: Domain: ${aiReqs?.domain}, Title: ${aiReqs?.roleTitle}`);
    }

    console.log('\n--- Testing Overall Match Stability ---');
    for (let i = 1; i <= 3; i++) {
        const results = await matchJobPosting(mockResume, jdText);
        console.log(`Run ${i}: Score: ${results.comprehensiveScore}%, JD Match: ${results.categoryScores.jdMatching.score}%`);
        console.log(`Feedback snippet: ${results.categoryScores.jdMatching.feedback[0]}`);
    }
}

testStability();
