
import { matchJobPosting } from './src/lib/jobMatcher';
import { Resume } from './src/types';

const mockResume: Resume = {
    id: '1',
    fileName: 'software_engineer_resume.pdf',
    text: '', // Usually extracting text fills this, but let's see if it relies on struct
    personal_info: {
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        location: 'New York, NY',
    },
    summary: 'Senior Software Engineer with 5 years of experience building SaaS platforms.',
    experience: [
        {
            id: '1',
            position: 'Senior Software Engineer',
            company: 'Tech Solutions Inc.',
            startDate: 'Jan 2020',
            current: true,
            description: 'Leading a team of 5 developers to build a next-generation SaaS platform. Improved system performance by 40% through code optimization and caching strategies.',
            technologies: ['React', 'Node.js', 'AWS'],
            location: 'New York'
        },
        {
            id: '2',
            position: 'Full Stack Developer',
            company: 'Creative Digital Agency',
            startDate: 'Jun 2017',
            endDate: 'Dec 2019',
            description: 'Developed and maintained multiple client websites using modern web technologies. Collaborated with designers to implement pixel-perfect user interfaces.',
            technologies: ['JavaScript', 'HTML', 'CSS', 'PHP'],
            location: 'New York'
        }
    ],
    education: [
        {
            id: '1',
            institution: 'Tech University',
            degree: 'Bachelor of Science',
            fieldOfStudy: 'Computer Science',
            startDate: '2013',
            endDate: '2017'
        }
    ],
    skills: [
        'JavaScript', 'TypeScript', 'React', 'Node.js', 'AWS', 'Docker', 'Python', 'SQL',
        'Git', 'System Design', 'Agile', 'HTML', 'CSS'
    ],
    internships: [
        {
            id: 'i1',
            position: 'Software Intern',
            company: 'Startup Inc',
            startDate: 'Jan 2016',
            endDate: 'Dec 2016',
            description: 'Assisted in building the MVP.',
            technologies: ['React'],
            location: 'Remote',
            current: false
        }
    ],
    sectionOrder: ['summary', 'experience', 'education', 'skills', 'projects', 'internships']
};

const jobDescription = `
Job Title: Sales Executive
Job Summary

We are looking for a motivated and results-driven Sales Executive to grow our customer base and increase company revenue. The role involves identifying potential clients, presenting products or services, and closing sales while maintaining strong customer relationships.

Key Responsibilities

Identify and contact potential customers through calls, emails, and meetings

Present and explain products/services clearly to clients

Understand customer needs and offer suitable solutions

Achieve monthly and quarterly sales targets

Maintain records of leads, follow-ups, and sales activities

Coordinate with internal teams for smooth order execution

Handle customer queries and resolve basic issues

Prepare basic sales reports and updates

Required Skills & Qualifications

Bachelor’s degree (preferred but not mandatory)

1 year of experience in sales or business development

Good communication and negotiation skills

Ability to convince and build customer trust

Basic knowledge of MS Excel / CRM tools

Self-motivated and target-oriented attitude

Preferred Skills

Experience in B2B or B2C sales

Knowledge of digital tools, email, and online meetings

Ability to work independently and in a team

Benefits

Fixed salary + performance-based incentives

Learning and growth opportunities

Friendly and supportive work environment
`;

(async () => {
    console.log('--- Running Match Job Posting ---');
    try {
        const result = await matchJobPosting(mockResume, jobDescription);

        console.log('Match Score:', result.matchScore);
        console.log('Comprehensive Score:', result.comprehensiveScore);
        console.log('Breakdown:', JSON.stringify(result.breakdown, null, 2));
        console.log('Category Scores:', JSON.stringify(result.categoryScores, null, 2));
        console.log('Matched Skills:', result.matchedSkills);
        console.log('Missing Skills:', result.missingSkills);
        console.log('Missing Keywords:', result.missingKeywords);
    } catch (error) {
        console.error('Error running matching:', error);
    }
})();


