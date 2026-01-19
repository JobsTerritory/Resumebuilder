import { Resume } from '../types';

export const initialResumeState: Resume = {
    title: 'My Resume',
    personal_info: {
        fullName: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1 (555) 123-4567',
        location: 'New York, NY',
        linkedin: 'linkedin.com/in/johndoe',
        portfolio: 'johndoe.com',
    },
    summary: 'Passionate and results-driven software engineer with 5+ years of experience in building scalable web applications. specific focus on React and Node.js ecosystems. Proven track record of delivering high-quality code and leading development teams.',
    experience: [
        {
            id: '1',
            company: 'Tech Solutions Inc.',
            position: 'Senior Software Engineer',
            location: 'New York, NY',
            startDate: '2020-01',
            endDate: 'Present',
            current: true,
            description: 'Leading a team of 5 developers to build a next-generation SaaS platform. Improved system performance by 40% through code optimization and caching strategies.'
        },
        {
            id: '2',
            company: 'Creative Digital Agency',
            position: 'Full Stack Developer',
            location: 'San Francisco, CA',
            startDate: '2017-06',
            endDate: '2019-12',
            current: false,
            description: 'Developed and maintained multiple client websites using modern web technologies. Collaborated with designers to implement pixel-perfect user interfaces.'
        }
    ],
    education: [
        {
            id: '1',
            institution: 'University of Technology',
            degree: 'Bachelor of Science in Computer Science',
            field: 'Computer Science',
            location: 'Boston, MA',
            startDate: '2013-09',
            endDate: '2017-05',
            current: false,
            description: 'Graduated with Honors. Member of the Computer Science Society.'
        }
    ],
    skills: [
        'JavaScript',
        'React',
        'Node.js',
        'TypeScript',
        'Python',
    ],
    projects: [
        {
            id: '1',
            name: 'E-commerce Platform',
            description: 'Built a full-featured e-commerce platform with real-time inventory management and payment gateway integration.',
            technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
            url: 'github.com/johndoe/ecommerce',
            startDate: '2021-03',
            endDate: '2021-08'
        }
    ],
    certifications: [
        {
            id: '1',
            name: 'AWS Certified Solutions Architect',
            issuer: 'Amazon Web Services',
            date: '2022-08'
        }
    ],
    languages: [
        { id: '1', name: 'English', proficiency: 'Native' },
        { id: '2', name: 'Spanish', proficiency: 'Intermediate' }
    ],
    interests: [
        'Reading',
        'Chess',
        'Dancing'
    ],
    template: 'tech-modern',
    design: 'professional-clean',
    industry: 'technology',
    internships: [],
    additional_info: '',
    showProfilePicture: true,
    section_order: ['summary', 'experience', 'internships', 'education', 'skills', 'projects', 'certifications', 'languages', 'interests', 'additional'],
};

export const blankResumeState: Resume = {
    title: 'New Resume',
    personal_info: {
        fullName: '',
        email: '',
        phone: '',
        location: '',
        linkedin: '',
        portfolio: '',
    },
    summary: '',
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    languages: [],
    interests: [],
    template: 'tech-modern',
    design: 'professional-clean',
    industry: 'other',
    internships: [],
    additional_info: '',
    showProfilePicture: true,
    section_order: ['summary', 'experience', 'internships', 'education', 'skills', 'projects', 'certifications', 'languages', 'interests', 'additional'],
};
