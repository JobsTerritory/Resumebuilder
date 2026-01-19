import { Resume } from '../types';
import { Briefcase, Code, PenTool, Stethoscope, Megaphone, GraduationCap, Construction, Gavel, TrendingUp, User, FlaskConical, Users, Headphones, HardHat } from 'lucide-react';

export interface Industry {
    id: string;
    name: string;
    icon: any;
    description: string;
    initialState: Resume;
    recommendedDesigns: string[];
}

export const industries: Industry[] = [
    {
        id: 'technology',
        name: 'Technology',
        icon: Code,
        description: 'Software Engineering, Data Science, IT',
        recommendedDesigns: ['modern-compact', 'tech-modern', 'geometric-modern'],
        initialState: {
            title: 'Software Engineer Resume',
            personal_info: {
                fullName: 'Alex Chen',
                email: 'alex.chen@example.com',
                phone: '(555) 123-4567',
                location: 'San Francisco, CA',
                linkedin: 'linkedin.com/in/alexc',
                portfolio: 'alexchen.dev',
                title: 'Senior Software Engineer'
            },
            summary: 'Innovative Senior Software Engineer with 6+ years of experience in full-stack development. Expert in React, Node.js, and cloud architecture. Proven track record of improving system performance and leading agile teams to deliver scalable solutions.',
            experience: [
                {
                    id: '1',
                    company: 'TechFlow Solutions',
                    position: 'Senior Full Stack Engineer',
                    location: 'San Francisco, CA',
                    startDate: '2021-03',
                    endDate: 'Present',
                    current: true,
                    description: '• Architected and led the migration of a legacy monolith to a microservices architecture, reducing deployment time by 60%.\n• Mentored a team of 4 junior developers, conducting code reviews and technical workshops.\n• Implemented a real-time analytics dashboard using React and WebSocket, handling over 100k daily events.'
                },
                {
                    id: '2',
                    company: 'Innovate Corp',
                    position: 'Software Developer',
                    location: 'Austin, TX',
                    startDate: '2018-06',
                    endDate: '2021-02',
                    current: false,
                    description: '• Developed and maintained customer-facing web applications using Vue.js and Python/Django.\n• Optimized database queries, resulting in a 30% reduction in page load times.\n• Collaborated with product managers to define requirements and deliver features on schedule.'
                }
            ],
            education: [
                {
                    id: '1',
                    institution: 'University of Texas at Austin',
                    degree: 'Bachelor of Science in Computer Science',
                    field: 'Computer Science',
                    location: 'Austin, TX',
                    startDate: '2014-09',
                    endDate: '2018-05',
                    current: false,
                    gpa: '3.8'
                }
            ],
            skills: [
                'JavaScript/TypeScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker', 'GraphQL', 'PostgreSQL'
            ],
            projects: [
                {
                    id: '1',
                    name: 'CloudScale Monitor',
                    description: 'Open-source monitoring tool for containerized applications. Featured on GitHub Trending.',
                    technologies: ['Go', 'React', 'Prometheus'],
                    startDate: '2022-01',
                    endDate: '2022-06',
                    url: 'github.com/alexc/cloudscale'
                }
            ],
            certifications: [
                {
                    id: '1',
                    name: 'AWS Certified Solutions Architect - Associate',
                    issuer: 'Amazon Web Services',
                    date: '2023-01'
                }
            ],
            languages: [
                { id: '1', name: 'English', proficiency: 'Native' },
                { id: '2', name: 'Mandarin', proficiency: 'Conversational' }
            ],
            template: 'tech-modern',
            design: 'modern-compact',
            industry: 'technology',
            section_order: ['summary', 'experience', 'projects', 'skills', 'education', 'certifications', 'languages'],
            showProfilePicture: true
        }
    },
    {
        id: 'business',
        name: 'Business',
        icon: Briefcase,
        description: 'Management, Finance, Operations',
        recommendedDesigns: ['corporate-bold', 'harvard-classic', 'sidebar-left'],
        initialState: {
            title: 'Project Manager Resume',
            personal_info: {
                fullName: 'Sarah Johnson',
                email: 'sarah.j@example.com',
                phone: '(555) 987-6543',
                location: 'New York, NY',
                linkedin: 'linkedin.com/in/sarahjohnson',
                title: 'Senior Project Manager'
            },
            summary: 'Results-oriented Project Manager with 8+ years of experience in leading cross-functional teams and delivering multimillion-dollar projects. Certified PMP with strong expertise in Agile methodologies, stakeholder management, and strategic planning.',
            experience: [
                {
                    id: '1',
                    company: 'Global Fintech Partners',
                    position: 'Senior Project Manager',
                    location: 'New York, NY',
                    startDate: '2019-08',
                    endDate: 'Present',
                    current: true,
                    description: '• Managed a portfolio of digital transformation projects valued at $5M+, delivering all on time and under budget.\n• Facilitated communication between technical and non-technical stakeholders to ensure alignment on project goals.\n• Implemented Agile practices across 3 teams, increasing velocity by 25% within the first year.'
                },
                {
                    id: '2',
                    company: 'Summit Consulting',
                    position: 'Business Analyst',
                    location: 'Chicago, IL',
                    startDate: '2015-06',
                    endDate: '2019-07',
                    current: false,
                    description: '• Conducted market research and data analysis to identify growth opportunities for Fortune 500 clients.\n• Prepared detailed business requirement documents (BRDs) and functional specifications.\n• Assisted in the successful launch of a new CRM system for a major retail client.'
                }
            ],
            education: [
                {
                    id: '1',
                    institution: 'University of Chicago',
                    degree: 'Master of Business Administration (MBA)',
                    field: 'Strategic Management',
                    location: 'Chicago, IL',
                    startDate: '2018-09',
                    endDate: '2020-06',
                    current: false
                },
                {
                    id: '2',
                    institution: 'Northwestern University',
                    degree: 'Bachelor of Arts in Economics',
                    field: 'Economics',
                    location: 'Evanston, IL',
                    startDate: '2011-09',
                    endDate: '2015-05',
                    current: false
                }
            ],
            skills: [
                'Project Management (PMP)', 'Agile & Scrum', 'Strategic Planning', 'Risk Management', 'Stakeholder Management', 'Data Analysis', 'JIRA/Confluence', 'Financial Modeling'
            ],
            projects: [],
            certifications: [
                {
                    id: '1',
                    name: 'Project Management Professional (PMP)',
                    issuer: 'Project Management Institute (PMI)',
                    date: '2020-08'
                },
                {
                    id: '2',
                    name: 'Certified ScrumMaster (CSM)',
                    issuer: 'Scrum Alliance',
                    date: '2019-05'
                }
            ],
            languages: [
                { id: '1', name: 'English', proficiency: 'Native' },
                { id: '2', name: 'Spanish', proficiency: 'Professional Working' }
            ],
            template: 'executive-class',
            design: 'corporate-bold',
            industry: 'business',
            section_order: ['summary', 'experience', 'education', 'skills', 'certifications', 'languages'],
            showProfilePicture: true
        }
    },
    {
        id: 'marketing',
        name: 'Marketing',
        icon: Megaphone,
        description: 'Digital Marketing, Content, SEO',
        recommendedDesigns: ['elegant-maroon', 'sidebar-contact', 'professional-clean'],
        initialState: {
            title: 'Marketing Specialist Resume',
            personal_info: {
                fullName: 'Emily Davis',
                email: 'emily.davis@example.com',
                phone: '(555) 555-0199',
                location: 'Los Angeles, CA',
                linkedin: 'linkedin.com/in/emilydavis',
                portfolio: 'emilycreatives.com',
                title: 'Digital Marketing Specialist'
            },
            summary: 'Creative Digital Marketing Specialist with a passion for building brand awareness and driving engagement. 5 years of experience in social media management, SEO, and content creation. Proven ability to increase organic traffic and ROI through data-driven strategies.',
            experience: [
                {
                    id: '1',
                    company: 'Creative Pulse Agency',
                    position: 'Digital Marketing Manager',
                    location: 'Los Angeles, CA',
                    startDate: '2020-02',
                    endDate: 'Present',
                    current: true,
                    description: '• Developed and executed comprehensive social media strategies for 10+ clients, increasing follower growth by 150%.\n• Managed Google Ads and Facebook Ads campaigns with a monthly budget of $20k, achieving a 4x ROAS.\n• Collaborated with design teams to create visually appealing content for email marketing campaigns.'
                },
                {
                    id: '2',
                    company: 'BrightStar Media',
                    position: 'Content Writer',
                    location: 'San Diego, CA',
                    startDate: '2017-06',
                    endDate: '2020-01',
                    current: false,
                    description: '• Wrote and optimized blog posts, whitepapers, and case studies to improve SEO rankings.\n• Conducted keyword research to identify trending topics and opportunities for content growth.\n• Assisted in the management of the company editorial calendar.'
                }
            ],
            education: [
                {
                    id: '1',
                    institution: 'University of California, Los Angeles (UCLA)',
                    degree: 'Bachelor of Arts in Communications',
                    field: 'Communications',
                    location: 'Los Angeles, CA',
                    startDate: '2013-09',
                    endDate: '2017-06',
                    current: false
                }
            ],
            skills: [
                'SEO/SEM', 'Social Media Marketing', 'Google Analytics', 'Content Strategy', 'Copywriting', 'Email Marketing (Mailchimp)', 'Adobe Creative Suite', 'Public Relations'
            ],
            projects: [
                {
                    id: '1',
                    name: 'Brand Rebranding Campaign',
                    description: 'Led the digital rebranding of a local retail chain, updated website copy and social media voice.',
                    technologies: ['Branding', 'Copywriting', 'Social Media'],
                    startDate: '2021-05',
                    endDate: '2021-09'
                }
            ],
            certifications: [
                {
                    id: '1',
                    name: 'Google Analytics Individual Qualification',
                    issuer: 'Google',
                    date: '2022-03'
                },
                {
                    id: '2',
                    name: 'HubSpot Content Marketing Certification',
                    issuer: 'HubSpot',
                    date: '2021-11'
                }
            ],
            languages: [
                { id: '1', name: 'English', proficiency: 'Native' },
                { id: '2', name: 'French', proficiency: 'Basic' }
            ],
            template: 'creative-flow',
            design: 'elegant-maroon',
            industry: 'marketing',
            section_order: ['summary', 'skills', 'experience', 'projects', 'education', 'certifications'],
            showProfilePicture: true
        }
    },
    {
        id: 'creative',
        name: 'Creative',
        icon: PenTool,
        description: 'Design, Art, Photography',
        recommendedDesigns: ['timeline-sidebar', 'elegant-maroon', 'sidebar-contact'],
        initialState: {
            title: 'Graphic Designer Resume',
            personal_info: {
                fullName: 'Michael Lee',
                email: 'michael.lee@example.com',
                phone: '(555) 222-3333',
                location: 'Seattle, WA',
                linkedin: 'linkedin.com/in/michael-lee-design',
                portfolio: 'michaellee.design',
                title: 'Senior Graphic Designer'
            },
            summary: 'Visionary Graphic Designer with over 7 years of experience in branding, print design, and digital media. Adept at translating complex ideas into visually compelling stories. Proficient in Adobe Creative Cloud and passionate about user-centric design.',
            experience: [
                {
                    id: '1',
                    company: 'Visionary Studios',
                    position: 'Senior Graphic Designer',
                    location: 'Seattle, WA',
                    startDate: '2019-04',
                    endDate: 'Present',
                    current: true,
                    description: '• Lead designer for major branding projects, overseeing concepts from ideation to final execution.\n• Collaborated with marketing teams to produce high-impact visual assets for web and social channels.\n• Mentored junior designers on typography, color theory, and layout best practices.'
                },
                {
                    id: '2',
                    company: 'Pixel Perfect Design',
                    position: 'Graphic Designer',
                    location: 'Portland, OR',
                    startDate: '2016-06',
                    endDate: '2019-03',
                    current: false,
                    description: '• Designed marketing collateral including brochures, flyers, and event signage for diverse clients.\n• Assisted in the redesign of the company website, creating custom icons and graphics.\n• Managed multiple projects simultaneously while meeting tight deadlines.'
                }
            ],
            education: [
                {
                    id: '1',
                    institution: 'Rhode Island School of Design (RISD)',
                    degree: 'Bachelor of Fine Arts using Graphic Design',
                    field: 'Graphic Design',
                    location: 'Providence, RI',
                    startDate: '2012-09',
                    endDate: '2016-05',
                    current: false
                }
            ],
            skills: [
                'Adobe Photoshop', 'Adobe Illustrator', 'Adobe InDesign', 'Figma', 'Typography', 'Branding & Identity', 'Print Design', 'UI/UX Basics'
            ],
            projects: [
                {
                    id: '1',
                    name: 'Eco-Friendly Packaging Redesign',
                    description: 'Award-winning packaging design for a sustainable skincare brand.',
                    technologies: ['Illustrator', 'Packaging Design'],
                    startDate: '2020-08',
                    endDate: '2020-12'
                }
            ],
            certifications: [],
            languages: [
                { id: '1', name: 'English', proficiency: 'Native' }
            ],
            template: 'artistic-pro',
            design: 'timeline-sidebar',
            industry: 'creative',
            section_order: ['summary', 'skills', 'experience', 'projects', 'education'],
            showProfilePicture: true
        }
    },
    {
        id: 'healthcare',
        name: 'Healthcare',
        icon: Stethoscope,
        description: 'Nursing, Medical, Administration',
        recommendedDesigns: ['professional-clean', 'sidebar-left', 'harvard-classic'],
        initialState: {
            title: 'Registered Nurse Resume',
            personal_info: {
                fullName: 'Jessica Williams',
                email: 'jessica.williams@example.com',
                phone: '(555) 777-8888',
                location: 'Houston, TX',
                linkedin: 'linkedin.com/in/jessicawilliamsrn',
                title: 'Registered Nurse (RN)'
            },
            summary: 'Compassionate and dedicated Registered Nurse with 4 years of experience in critical care and emergency room settings. Committed to providing top-quality patient care and advocating for patient needs. Strong ability to remain calm and effective in high-stress situations.',
            experience: [
                {
                    id: '1',
                    company: 'City General Hospital',
                    position: 'Registered Nurse - ER',
                    location: 'Houston, TX',
                    startDate: '2020-03',
                    endDate: 'Present',
                    current: true,
                    description: '• Triage and assess incoming patients in a high-volume emergency department.\n• Administer medications and perform medical procedures as ordered by physicians.\n• Coordinate with multidisciplinary teams to ensure comprehensive patient care plans.'
                },
                {
                    id: '2',
                    company: 'Community Health Clinic',
                    position: 'Staff Nurse',
                    location: 'Dallas, TX',
                    startDate: '2018-06',
                    endDate: '2020-02',
                    current: false,
                    description: '• Provided primary care services to a diverse patient population.\n• Educated patients on disease management and preventive health measures.\n• Maintained accurate electronic medical records (EMR) in compliance with HIPAA regulations.'
                }
            ],
            education: [
                {
                    id: '1',
                    institution: 'University of Texas Health Science Center',
                    degree: 'Bachelor of Science in Nursing (BSN)',
                    field: 'Nursing',
                    location: 'Houston, TX',
                    startDate: '2014-09',
                    endDate: '2018-05',
                    current: false
                }
            ],
            skills: [
                'Emergency Care', 'Patient Advocacy', 'Triage', 'IV Administration', 'Electronic Medical Records (Epic, Cerner)', 'BLS/ACLS Certified', 'Compassionate Care', 'Time Management'
            ],
            projects: [],
            certifications: [
                {
                    id: '1',
                    name: 'Registered Nurse (RN) License',
                    issuer: 'Texas Board of Nursing',
                    date: '2018-06'
                },
                {
                    id: '2',
                    name: 'Advanced Cardiovascular Life Support (ACLS)',
                    issuer: 'American Heart Association',
                    date: '2020-04'
                },
                {
                    id: '3',
                    name: 'Basic Life Support (BLS)',
                    issuer: 'American Heart Association',
                    date: '2018-05'
                }
            ],
            languages: [
                { id: '1', name: 'English', proficiency: 'Native' },
                { id: '2', name: 'Spanish', proficiency: 'Medical Proficiency' }
            ],
            template: 'care-professional',
            design: 'professional-clean',
            industry: 'healthcare',
            section_order: ['summary', 'certifications', 'experience', 'education', 'skills', 'languages'],
            showProfilePicture: false
        }
    },
    {
        id: 'education',
        name: 'Education',
        icon: GraduationCap,
        description: 'Teaching, Administration, Academic',
        recommendedDesigns: ['harvard-classic', 'corporate-bold', 'sidebar-left'],
        initialState: {
            title: 'Teacher Resume',
            personal_info: {
                fullName: 'David Brown',
                email: 'david.brown@example.com',
                phone: '(555) 444-5555',
                location: 'Boston, MA',
                linkedin: 'linkedin.com/in/davidbrownedu',
                title: 'High School History Teacher'
            },
            summary: 'Dedicated Educator with 10 years of experience in teaching history and social studies at the secondary level. Passionate about fostering critical thinking and creating an inclusive classroom environment. Proven ability to improve student engagement and test scores.',
            experience: [
                {
                    id: '1',
                    company: 'Lincoln High School',
                    position: 'History Teacher',
                    location: 'Boston, MA',
                    startDate: '2017-08',
                    endDate: 'Present',
                    current: true,
                    description: '• Design and deliver engaging history curriculum for grades 9-12, aligned with state standards.\n• Incorporate technology and primary source analysis to enhance student learning.\n• Serve as faculty advisor for the Debate Club and Model UN.'
                },
                {
                    id: '2',
                    company: 'Westside Middle School',
                    position: 'Social Studies Teacher',
                    location: 'Worcester, MA',
                    startDate: '2013-08',
                    endDate: '2017-06',
                    current: false,
                    description: '• Taught world geography and civics to 7th and 8th-grade students.\n• Implemented differentiated instruction strategies to support diverse learning needs.\n• Collaborated with colleagues to develop interdisciplinary units.'
                }
            ],
            education: [
                {
                    id: '1',
                    institution: 'Boston College',
                    degree: 'Master of Education (M.Ed.)',
                    field: 'Curriculum and Instruction',
                    location: 'Chestnut Hill, MA',
                    startDate: '2012-09',
                    endDate: '2013-05',
                    current: false
                },
                {
                    id: '2',
                    institution: 'University of Massachusetts Amherst',
                    degree: 'Bachelor of Arts in History',
                    field: 'History',
                    location: 'Amherst, MA',
                    startDate: '2008-09',
                    endDate: '2012-05',
                    current: false
                }
            ],
            skills: [
                'Curriculum Design', 'Classroom Management', 'Differentiated Instruction', 'Educational Technology', 'Student Assessment', 'Public Speaking', 'Mentoring', 'Parent-Teacher Communication'
            ],
            projects: [],
            certifications: [
                {
                    id: '1',
                    name: 'Massachusetts Professional Teacher License',
                    issuer: 'MA Department of Elementary and Secondary Education',
                    date: '2013-06'
                }
            ],
            languages: [
                { id: '1', name: 'English', proficiency: 'Native' }
            ],
            template: 'academic-pro',
            design: 'harvard-classic',
            industry: 'education',
            section_order: ['summary', 'education', 'experience', 'certifications', 'skills'],
            showProfilePicture: false
        }
    },
    {
        id: 'engineering',
        name: 'Engineering',
        icon: Construction,
        description: 'Civil, Mechanical, Electrical, Construction',
        recommendedDesigns: ['modern-compact', 'geometric-modern', 'sidebar-contact'],
        initialState: {
            title: 'Mechanical Engineer Resume',
            personal_info: {
                fullName: 'Robert Taylor',
                email: 'robert.taylor@example.com',
                phone: '(555) 321-7654',
                location: 'Detroit, MI',
                linkedin: 'linkedin.com/in/roberttaylor',
                title: 'Senior Mechanical Engineer'
            },
            summary: 'Detail-oriented Mechanical Engineer with 6+ years of experience in product design and manufacturing. Proficient in CAD software (SolidWorks, AutoCAD) and finite element analysis. specialized in automotive systems and lean manufacturing processes.',
            experience: [
                {
                    id: '1',
                    company: 'AutoMotive Systems Inc.',
                    position: 'Mechanical Engineer',
                    location: 'Detroit, MI',
                    startDate: '2019-05',
                    endDate: 'Present',
                    current: true,
                    description: '• Design and simulate automotive components using SolidWorks, reducing prototyping costs by 25%.\n• Collaborate with cross-functional teams to ensure product quality and manufacturability.\n• Lead root cause analysis for production issues and implement corrective actions.'
                },
                {
                    id: '2',
                    company: 'Industrial Gear Co.',
                    position: 'Junior Engineer',
                    location: 'Detroit, MI',
                    startDate: '2017-06',
                    endDate: '2019-04',
                    current: false,
                    description: '• Assisted in the design of industrial gearboxes and transmission systems.\n• Created detailed engineering drawings and documentation for manufacturing.\n• Conducted testing and validation of prototype units.'
                }
            ],
            education: [
                {
                    id: '1',
                    institution: 'University of Michigan',
                    degree: 'Bachelor of Science in Mechanical Engineering',
                    field: 'Mechanical Engineering',
                    location: 'Ann Arbor, MI',
                    startDate: '2013-09',
                    endDate: '2017-05',
                    current: false
                }
            ],
            skills: [
                'SolidWorks', 'AutoCAD', 'Finite Element Analysis (FEA)', 'MATLAB', 'Lean Manufacturing', 'GD&T', 'Project Management', 'Technical Writing'
            ],
            projects: [],
            certifications: [
                {
                    id: '1',
                    name: 'Certified SolidWorks Professional (CSWP)',
                    issuer: 'Dassault Systèmes',
                    date: '2018-11'
                },
                {
                    id: '2',
                    name: 'Fundamentals of Engineering (FE)',
                    issuer: 'NCEES',
                    date: '2017-06'
                }
            ],
            languages: [
                { id: '1', name: 'English', proficiency: 'Native' }
            ],
            template: 'tech-modern',
            design: 'geometric-modern',
            industry: 'engineering',
            section_order: ['summary', 'experience', 'skills', 'education', 'certifications', 'projects'],
            showProfilePicture: true
        }
    },
    {
        id: 'legal',
        name: 'Legal',
        icon: Gavel,
        description: 'Law, Compliance, Paralegal',
        recommendedDesigns: ['harvard-classic', 'corporate-bold', 'executive-class'],
        initialState: {
            title: 'Attorney Resume',
            personal_info: {
                fullName: 'Jennifer Wu',
                email: 'jennifer.wu@example.com',
                phone: '(555) 999-0000',
                location: 'Washington, DC',
                linkedin: 'linkedin.com/in/jenniferwu-law',
                title: 'Associate Attorney'
            },
            summary: 'Diligent Associate Attorney with a strong background in corporate law and regulatory compliance. Proven ability to draft complex legal documents, conduct thorough legal research, and represent clients in negotiations. Admitted to the DC Bar.',
            experience: [
                {
                    id: '1',
                    company: 'Smith, Jones & Partners',
                    position: 'Associate Attorney',
                    location: 'Washington, DC',
                    startDate: '2021-09',
                    endDate: 'Present',
                    current: true,
                    description: '• Advise corporate clients on mergers and acquisitions, contract negotiation, and intellectual property matters.\n• Draft and review service agreements, NDAs, and employment contracts.\n• Conduct legal research on emerging regulatory issues affecting the tech industry.'
                },
                {
                    id: '2',
                    company: 'Department of Justice',
                    position: 'Legal Intern',
                    location: 'Washington, DC',
                    startDate: '2020-05',
                    endDate: '2020-08',
                    current: false,
                    description: '• Assisted federal prosecutors in case preparation and trial strategy.\n• Drafted motions and legal memoranda for ongoing litigation.\n• Analyzed evidence and conducted document review.'
                }
            ],
            education: [
                {
                    id: '1',
                    institution: 'Georgetown University Law Center',
                    degree: 'Juris Doctor (J.D.)',
                    field: 'Law',
                    location: 'Washington, DC',
                    startDate: '2018-09',
                    endDate: '2021-05',
                    current: false
                },
                {
                    id: '2',
                    institution: 'Duke University',
                    degree: 'Bachelor of Arts in Political Science',
                    field: 'Political Science',
                    location: 'Durham, NC',
                    startDate: '2014-09',
                    endDate: '2018-05',
                    current: false
                }
            ],
            skills: [
                'Legal Research (Westlaw, LexisNexis)', 'Contract Drafting', 'Corporate Law', 'Litigation Support', 'Negotiation', 'Compliance', 'Client Counseling', 'Brief Writing'
            ],
            projects: [],
            certifications: [
                {
                    id: '1',
                    name: 'Bar Admission',
                    issuer: 'District of Columbia Bar',
                    date: '2021-11'
                }
            ],
            languages: [
                { id: '1', name: 'English', proficiency: 'Native' }
            ],
            template: 'executive-class',
            design: 'harvard-classic',
            industry: 'legal',
            section_order: ['summary', 'experience', 'education', 'admissions', 'skills'],
            showProfilePicture: false
        }
    },
    {
        id: 'sales',
        name: 'Sales',
        icon: TrendingUp,
        description: 'Account Management, Retail, B2B',
        recommendedDesigns: ['modern-compact', 'corporate-bold', 'sidebar-contact'],
        initialState: {
            title: 'Sales Representative Resume',
            personal_info: {
                fullName: 'Mark Thompson',
                email: 'mark.thompson@example.com',
                phone: '(555) 456-7890',
                location: 'Chicago, IL',
                linkedin: 'linkedin.com/in/marktsales',
                title: 'Senior Account Executive'
            },
            summary: 'Dynamic Sales Professional with a track record of exceeding revenue targets in B2B SaaS markets. Skilled in relationship building, consultative selling, and pipeline management. Passionate about driving business growth through strategic partnerships.',
            experience: [
                {
                    id: '1',
                    company: 'Cloud Software Solutions',
                    position: 'Senior Account Executive',
                    location: 'Chicago, IL',
                    startDate: '2020-01',
                    endDate: 'Present',
                    current: true,
                    description: '• Generated $1.2M in annual recurring revenue (ARR) in 2022, achieving 115% of quota.\n• Managed the full sales cycle from prospecting to closing for mid-market accounts.\n• Developed and maintained strong relationships with C-level executives.'
                },
                {
                    id: '2',
                    company: 'Business Tech Inc.',
                    position: 'Sales Development Representative',
                    location: 'Chicago, IL',
                    startDate: '2018-06',
                    endDate: '2019-12',
                    current: false,
                    description: '• Qualified inbound leads and conducted cold outreach to prospective clients.\n• Scheduled 20+ product demos per month for the account executive team.\n• Consistently achieved top performer status among SDR team.'
                }
            ],
            education: [
                {
                    id: '1',
                    institution: 'University of Illinois at Urbana-Champaign',
                    degree: 'Bachelor of Science in Marketing',
                    field: 'Marketing',
                    location: 'Champaign, IL',
                    startDate: '2014-09',
                    endDate: '2018-05',
                    current: false
                }
            ],
            skills: [
                'B2B Sales', 'Account Management', 'CRM (Salesforce, HubSpot)', 'Prospecting', 'Negotiation', 'Presentation Skills', 'Cold Calling', 'Solution Selling'
            ],
            projects: [],
            certifications: [
                {
                    id: '1',
                    name: 'Inbound Sales Certification',
                    issuer: 'HubSpot Academy',
                    date: '2019-02'
                }
            ],
            languages: [
                { id: '1', name: 'English', proficiency: 'Native' }
            ],
            template: 'modern-compact',
            design: 'corporate-bold',
            industry: 'sales',
            section_order: ['summary', 'experience', 'skills', 'education', 'certifications'],
            showProfilePicture: true
        }
    },
    {
        id: 'hospitality',
        name: 'Hospitality',
        icon: User,
        description: 'Hotel, Restaurant, Travel, Event',
        recommendedDesigns: ['elegant-maroon', 'professional-clean', 'sidebar-left'],
        initialState: {
            title: 'Hospitality Manager Resume',
            personal_info: {
                fullName: 'Lisa Martinez',
                email: 'lisa.martinez@example.com',
                phone: '(555) 234-5678',
                location: 'Orlando, FL',
                linkedin: 'linkedin.com/in/lisamhospitality',
                title: 'Hotel Operations Manager'
            },
            summary: 'Customer-focused Hospitality Manager with over 8 years of experience in luxury hotel operations. Dedicated to delivering exceptional guest experiences and optimizing operational efficiency. Strong leader with expertise in staff training and inventory management.',
            experience: [
                {
                    id: '1',
                    company: 'Grand Resort & Spa',
                    position: 'Operations Manager',
                    location: 'Orlando, FL',
                    startDate: '2019-03',
                    endDate: 'Present',
                    current: true,
                    description: '• Oversee daily operations of front desk, housekeeping, and food & beverage departments.\n• Improved guest satisfaction scores by 15% through staff training initiatives.\n• Manage improved departmental budgets and inventory to reduce waste.'
                },
                {
                    id: '2',
                    company: 'Seaside Boutique Hotel',
                    position: 'Front Desk Supervisor',
                    location: 'Miami, FL',
                    startDate: '2016-05',
                    endDate: '2019-02',
                    current: false,
                    description: '• Supervised a team of 10 front desk agents, ensuring adherence to service standards.\n• Resolved guest complaints and issues promptly to ensure positive outcomes.\n• Managed room reservations and coordinate with housekeeping for turnover.'
                }
            ],
            education: [
                {
                    id: '1',
                    institution: 'Florida International University',
                    degree: 'Bachelor of Science in Hospitality Management',
                    field: 'Hospitality Management',
                    location: 'Miami, FL',
                    startDate: '2012-09',
                    endDate: '2016-05',
                    current: false
                }
            ],
            skills: [
                'Guest Relations', 'Hotel Operations', 'Staff Training', 'Budget Management', 'Event Planning', 'PMS (Opera, Micros)', 'Conflict Resolution', 'Inventory Control'
            ],
            projects: [],
            certifications: [
                {
                    id: '1',
                    name: 'Certified Hotel Administrator (CHA)',
                    issuer: 'American Hotel & Lodging Educational Institute',
                    date: '2021-06'
                }
            ],
            languages: [
                { id: '1', name: 'English', proficiency: 'Native' },
                { id: '2', name: 'Spanish', proficiency: 'Fluent' }
            ],
            template: 'creative-flow',
            design: 'elegant-maroon',
            industry: 'hospitality',
            section_order: ['summary', 'experience', 'skills', 'education', 'certifications', 'languages'],
            showProfilePicture: true
        }
    },
    {
        id: 'science',
        name: 'Science',
        icon: FlaskConical,
        description: 'Biology, Chemistry, Research, Lab',
        recommendedDesigns: ['harvard-classic', 'academic-pro', 'minimalist-clean'],
        initialState: {
            title: 'Research Scientist Resume',
            personal_info: {
                fullName: 'Dr. James Wilson',
                email: 'james.wilson@example.com',
                phone: '(555) 876-5432',
                location: 'Cambridge, MA',
                linkedin: 'linkedin.com/in/jpwilsonsco',
                title: 'Research Scientist'
            },
            summary: 'Analytical Research Scientist with a Ph.D. in Molecular Biology and expertise in genetic engineering and assay development. Published author in peer-reviewed journals with strong data analysis skills. Committed to advancing medical research through innovation.',
            experience: [
                {
                    id: '1',
                    company: 'BioGenetics Labs',
                    position: 'Senior Research Associate',
                    location: 'Cambridge, MA',
                    startDate: '2020-07',
                    endDate: 'Present',
                    current: true,
                    description: '• Lead a research project focused on CRISPR-Cas9 genome editing applications.\n• Design and execute complex experiments, analyzing data using statistical software.\n• Present research findings at internal meetings and international conferences.'
                },
                {
                    id: '2',
                    company: 'University Research Center',
                    position: 'Postdoctoral Fellow',
                    location: 'Boston, MA',
                    startDate: '2017-06',
                    endDate: '2020-06',
                    current: false,
                    description: '• Investigated molecular pathways involved in cellular aging.\n• Mentored graduate students and managed laboratory equipment and supplies.\n• Published 3 first-author papers in high-impact scientific journals.'
                }
            ],
            education: [
                {
                    id: '1',
                    institution: 'Massachusetts Institute of Technology (MIT)',
                    degree: 'Ph.D. in Biology',
                    field: 'Biology',
                    location: 'Cambridge, MA',
                    startDate: '2012-09',
                    endDate: '2017-05',
                    current: false
                },
                {
                    id: '2',
                    institution: 'University of California, Berkeley',
                    degree: 'Bachelor of Science in Biochemistry',
                    field: 'Biochemistry',
                    location: 'Berkeley, CA',
                    startDate: '2008-09',
                    endDate: '2012-05',
                    current: false
                }
            ],
            skills: [
                'Molecular Biology', 'PCR & qPCR', 'Cell Culture', 'Flow Cytometry', 'Data Analysis (R, Python)', 'Lab Management', 'Technical Writing', 'Grant Writing'
            ],
            projects: [],
            certifications: [],
            languages: [
                { id: '1', name: 'English', proficiency: 'Native' }
            ],
            template: 'academic-pro',
            design: 'harvard-classic',
            industry: 'science',
            section_order: ['summary', 'education', 'experience', 'publications', 'skills'],
            showProfilePicture: false
        }
    },
    {
        id: 'hr',
        name: 'Human Resources',
        icon: Users,
        description: 'Recruiting, Employee Relations, L&D',
        recommendedDesigns: ['professional-clean', 'corporate-bold', 'sidebar-left'],
        initialState: {
            title: 'HR Generalist Resume',
            personal_info: {
                fullName: 'Amanda Clark',
                email: 'amanda.clark@example.com',
                phone: '(555) 345-6789',
                location: 'Atlanta, GA',
                linkedin: 'linkedin.com/in/amandaclarkhr',
                title: 'Human Resources Generalist'
            },
            summary: 'Compassionate HR Professional with experience in full-cycle recruiting, employee onboarding, and benefits administration. Dedicated to fostering a positive workplace culture and ensuring compliance with labor laws. efficient in HRIS management.',
            experience: [
                {
                    id: '1',
                    company: 'Global Retail Solutions',
                    position: 'HR Generalist',
                    location: 'Atlanta, GA',
                    startDate: '2019-04',
                    endDate: 'Present',
                    current: true,
                    description: '• Manage recruitment processes for 20+ open positions, reducing time-to-fill by 20%.\n• Coordinate new hire orientation and onboarding programs to ensure smooth transitions.\n• Advise managers on employee relations issues and performance management.'
                },
                {
                    id: '2',
                    company: 'Logistics Plus',
                    position: 'HR Assistant',
                    location: 'Atlanta, GA',
                    startDate: '2017-05',
                    endDate: '2019-03',
                    current: false,
                    description: '• Assisted with payroll processing and benefits enrollment for 500+ employees.\n• Maintained employee records and ensured data accuracy in the HRIS system.\n• Organized company engagement events and wellness initiatives.'
                }
            ],
            education: [
                {
                    id: '1',
                    institution: 'University of Georgia',
                    degree: 'Bachelor of Business Administration in Human Resources',
                    field: 'Human Resource Management',
                    location: 'Athens, GA',
                    startDate: '2013-09',
                    endDate: '2017-05',
                    current: false
                }
            ],
            skills: [
                'Recruiting (ATS)', 'Onboarding', 'Employee Relations', 'Benefits Administration', 'HRIS (Workday, ADP)', 'Labor Law Compliance', 'Performance Management', 'Conflict Resolution'
            ],
            projects: [],
            certifications: [
                {
                    id: '1',
                    name: 'PHR (Professional in Human Resources)',
                    issuer: 'HRCI',
                    date: '2020-08'
                }
            ],
            languages: [
                { id: '1', name: 'English', proficiency: 'Native' }
            ],
            template: 'professional-clean',
            design: 'corporate-bold',
            industry: 'hr',
            section_order: ['summary', 'experience', 'skills', 'education', 'certifications'],
            showProfilePicture: true
        }
    },
    {
        id: 'customer_service',
        name: 'Customer Service',
        icon: Headphones,
        description: 'Support, Success, Call Center',
        recommendedDesigns: ['modern-compact', 'sidebar-contact', 'professional-clean'],
        initialState: {
            title: 'Customer Success Manager Resume',
            personal_info: {
                fullName: 'Kevin White',
                email: 'kevin.white@example.com',
                phone: '(555) 654-3210',
                location: 'Phoenix, AZ',
                linkedin: 'linkedin.com/in/kevinwhitecs',
                title: 'Customer Success Manager'
            },
            summary: 'Dedicated Customer Success Manager with a focus on client retention and satisfaction. Proven ability to troubleshoot complex issues, provide product training, and drive upselling opportunities. Excellent communicator with a patient and empathetic approach.',
            experience: [
                {
                    id: '1',
                    company: 'SaaS Connect',
                    position: 'Customer Success Manager',
                    location: 'Phoenix, AZ',
                    startDate: '2020-02',
                    endDate: 'Present',
                    current: true,
                    description: '• Manage a portfolio of 50+ enterprise accounts, ensuring successful product adoption.\n• Conduct quarterly business reviews (QBRs) and identify opportunities for account growth.\n• Achieve a 95% client retention rate through proactive relationship management.'
                },
                {
                    id: '2',
                    company: 'TechSupport Pro',
                    position: 'Technical Support Specialist',
                    location: 'Phoenix, AZ',
                    startDate: '2017-08',
                    endDate: '2020-01',
                    current: false,
                    description: '• Resolved technical issues for customers via phone, email, and chat support.\n• Created knowledge base articles to assist customers with self-service troubleshooting.\n• Mentored new support agents during their training period.'
                }
            ],
            education: [
                {
                    id: '1',
                    institution: 'Arizona State University',
                    degree: 'Bachelor of Arts in Communication',
                    field: 'Communication',
                    location: 'Tempe, AZ',
                    startDate: '2013-09',
                    endDate: '2017-05',
                    current: false
                }
            ],
            skills: [
                'Account Management', 'Technical Support', 'CRM (Zendesk, Salesforce)', 'Communication', 'Problem Solving', 'Client Retention', 'Training & Onboarding', 'Upselling'
            ],
            projects: [],
            certifications: [],
            languages: [
                { id: '1', name: 'English', proficiency: 'Native' }
            ],
            template: 'modern-compact',
            design: 'modern-compact',
            industry: 'customer_service',
            section_order: ['summary', 'experience', 'skills', 'education', 'certifications'],
            showProfilePicture: true
        }
    },
    {
        id: 'construction',
        name: 'Construction',
        icon: HardHat,
        description: 'General Contractor, Trades, Labor',
        recommendedDesigns: ['sidebar-left', 'bold-modern', 'professional-clean'],
        initialState: {
            title: 'Construction Manager Resume',
            personal_info: {
                fullName: 'Thomas Miller',
                email: 'thomas.miller@example.com',
                phone: '(555) 789-0123',
                location: 'Denver, CO',
                linkedin: 'linkedin.com/in/thomasmillercon',
                title: 'Construction Project Manager'
            },
            summary: 'Safety-conscious Construction Manager with 12+ years of experience in residential and commercial building projects. Skilled in scheduling, budget management, and subcontractor supervision. Committed to delivering high-quality projects on time and within scope.',
            experience: [
                {
                    id: '1',
                    company: 'Miller & Sons Construction',
                    position: 'Project Manager',
                    location: 'Denver, CO',
                    startDate: '2018-03',
                    endDate: 'Present',
                    current: true,
                    description: '• Oversee multiple construction projects simultaneously, ensuring compliance with safety regulations.\n• Manage project budgets of up to $2M, tracking expenses and approving invoices.\n• Coordinate with architects, engineers, and city inspectors effectively.'
                },
                {
                    id: '2',
                    company: 'Denver Builders',
                    position: 'Site Supervisor',
                    location: 'Denver, CO',
                    startDate: '2012-05',
                    endDate: '2018-02',
                    current: false,
                    description: '• Supervised daily on-site activities and managed crew schedules.\n• Ensured quality control of workmanship and materials.\n• Enforced strict safety protocols, resulting in a zero-accident record for 3 years.'
                }
            ],
            education: [
                {
                    id: '1',
                    institution: 'Colorado State University',
                    degree: 'Bachelor of Science in Construction Management',
                    field: 'Construction Management',
                    location: 'Fort Collins, CO',
                    startDate: '2008-09',
                    endDate: '2012-05',
                    current: false
                }
            ],
            skills: [
                'Project Planning', 'Budgeting & Cost Control', 'Safety Management (OSHA)', 'Blueprint Reading', 'Subcontractor Management', 'Scheduling (Primavera, MS Project)', 'Quality Control', 'Estimation'
            ],
            projects: [],
            certifications: [
                {
                    id: '1',
                    name: 'OSHA 30-Hour Construction Certification',
                    issuer: 'OSHA',
                    date: '2015-09'
                }
            ],
            languages: [
                { id: '1', name: 'English', proficiency: 'Native' }
            ],
            template: 'bold-modern',
            design: 'sidebar-left',
            industry: 'construction',
            section_order: ['summary', 'experience', 'skills', 'education', 'certifications'],
            showProfilePicture: true
        }
    }
];
