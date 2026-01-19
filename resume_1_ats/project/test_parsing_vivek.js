
const text = `Calicut, Kerala India.
Phone:
9047968165
Email:
vivek.ashwin1996@gmail.com
Summary
·A skilled HR Professional with 6 years of rich and hands on experience in the areas of, General Administration and Recruitment at Factory level and Corporate Level with reputed organizations. ·Extensive experience in Recruitment, human resource management & development. Proven track record of achieving high motivation levels amongst employees, ensuring strict compliance with Labour Laws.

Education
Master of Business Administration - HR Financial Fraud Monitoring: Played a key role in identifying and
- Hindusthan College of Arts & Science - investigating employee-level financial frauds (e.g., misappropriation of

Jan 2016 - Jan 2018
disbursements, forged documentation). Coordinated with internal audit
Unknown Institution

-
Batchelor of computer Application- and legal departments for disciplinary action and fraud prevention
Kongunadu college of arts and science - training.

Jan 2013 - Jan 2016
HR Policy Implementation: Contributed to drafting and updating HR
Unknown Institution

-
MFIs. Trained field HR staff on HR best practices and compliance.
Unknown Institution

-
Malayalam
Unknown Institution

-
SENIOR EXECUTIVE -HR AT “MAHINDRA FINANCE”
Unknown Institution

-
Unknown Degree
Unknown Institution

Jan 2024 - Oct 2024
·Oversee end-to-end recruitment processes, including sourcing, screening, interviewing, and onboarding
Unknown Institution

-
candidates for various roles across the organization.·Collaborate with hiring managers to understand staffing
Unknown Institution

-
needs, develop job descriptions, and implement effective recruitment strategies.
Unknown Institution

-
Utilize job portals, social media, and networking events to attract Employee Relations and Engagement: Act as
Unknown Institution

-
a trusted advisor to employees and management on HR policies, procedures, and employment-related
Unknown Institution

-
matters.
Unknown Institution

-
·Proactively adder employee concerns, grievances, and conflicts) to maintain a positive work environment.
Unknown Institution

-
· Plan and organize employee engagement initiatives, such as team- building activities, cultural events, and
Unknown Institution

-
wellness programs. Performance management: Administer performance appraisal processes, including goal
Unknown Institution

-
·Provide guidance to managers on conducting performance discussions, setting objectives, and delivering
Unknown Institution

-
feedback.
Unknown Institution

-
·Identify training and development needs based on performance assessments to support employee growth
Unknown Institution

-
and career advancement.
Unknown Institution

-
Training and Development:
Unknown Institution

-
·Coordinate training programs on topics such as leadership development, communication skills, and
Unknown Institution

-
HR Policy Development and Compliance:
Unknown Institution

-
·Implement and communicate HR policies and procedures in compliance with Indian labor laws and
Unknown Institution

-
regulations. Ensure adherence to statutory requirements related to employment contracts, leave entitlements,
Unknown Institution

-
Employee Performance and Career Development: Facilitate career development discussions and support
Unknown Institution

-
feedback to identify trends and areas for improvement in employee retention.
Unknown Institution

-
and analyze HR metrics, such as turnover rates, absenteeism, and employee demographics.
Unknown Institution

-
Prepare management reports and presentations to communicate key HR insights and trends to senior
Unknown Institution

-
Unknown Degree
HR Recruiter Activities:

Nov 2022 - Jan 2024
·Partnering with hiringmanagers to determinestaffing needs.
Unknown Institution

-
·Coordinating interviews with the hiring managers
Unknown Institution

-
·Maintaining relationships with both internal and external clientsto ensure staffinggoals are achieved.
Unknown Institution

-
regarding employment practices
Unknown Institution

-
·Serving as a liaison with area employment agencies, colleges, and industry associations
Unknown Institution

-
·Conduct regular follow-up with managers to determine the effectiveness of recruiting plans and
Unknown Institution

-
implementation.
Unknown Institution

-
Enlist job postings on forums which can source new candidates at the time of hiring such as newspapers,
Unknown Institution

-
social media, advertisements, etc.
·Supervising the onboarding and induction of the new joiner in the organization.

-
·Plan daily routes of market visit for the employees visiting Bangalore office from other zonal offices. Check all
Unknown Institution

-
the safety equipment’s are present in the vehicles allotted.
Unknown Institution

-
·Selecting pool of hotels and lodgesfor the employees visiting Bangalore office on Business purpose. Getting in
Unknown Institution

-
·Promote safe work activities by conducting safetyaudits, attending companysafety meetings, and meeting
Unknown Institution

-
with individual staff members.
Unknown Institution

-
distributors have to be planned.
Unknown Institution

-
·Planning of the travel of the new joiners from their home location to the office location and spoc to approve
Unknown Institution

-
their reimbursement.
Unknown Institution

- Jan 2020
·Handling End to End recruitment cycle
Unknown Institution

- Jan 2022
·Plan & implement company talent acquisition strategy alongside designing the job analysis
Unknown Institution

-
·Handling statutory compliance in relation to PF, ESIC, & legal compliance, attendance management & CSR
Unknown Institution

-
·Maintaining employee records& monitoring attendance on daily basis
Unknown Institution

-
·Supporting the payrollprocess by preparingthe employee databasewhich includes
Unknown Institution

-
·new hires, transfers, terminations, retainers, promotion, retirement etc.,
Unknown Institution

-
·Maintaining a primary backup for payrollprocessing by updatingthe bank account tracking, tracking earned /
Unknown Institution

-
included on monthly basis,
Unknown Institution

-
·Performance reviews & promotions of employees
Unknown Institution

-
·Vouching of employeereimbursement bills such as medical,official travel, incentives etc.
Unknown Institution

-
Technical Skills
Leadership, Communication, Data Analysis, Recruitment, Talent Acquisition, Sourcing, Screening, Employee Relations, Onboarding, Performance Management, Success factor, Spark, Darwin, Box, Panagro, Naukri, Linkedin, Indeed., branches, compliance, Managing off boarding, employee engagement., employees, Data analysis, credit managers, and support, Statutory Compliance, EXPERTIZE, bonus, Time management, 000+ employees, Conflict resolution, including processing salary, deductions, TDS, and variable pay, Adaptability, Decision Making, accuracy., compliance with PF, ESI, PT, LWF, Bonus Act, Payment of Gratuity Act
`;

// Simple simulation of the education parser to see why it creates so many blocks
function simulateEducationParser(text) {
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    let educationStartIndex = -1;
    const educationKeywords = ['education', 'academic', 'educational'];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim().toLowerCase();
        if (educationKeywords.some(k => line.startsWith(k))) {
            educationStartIndex = i;
            break;
        }
    }

    if (educationStartIndex === -1) {
        console.log("No education section found");
        return;
    }

    const stopKeywords = [
        'experience', 'work experience', 'professional experience', 'employment',
        'skills', 'technical skills', 'projects', 'languages', 'certifications', 'personal information'
    ];

    let blocks = [];
    let currentBlock = [];

    for (let i = educationStartIndex + 1; i < lines.length; i++) {
        const line = lines[i].trim();
        const lowerLine = line.toLowerCase();

        if (stopKeywords.some(k => lowerLine.startsWith(k))) {
            break;
        }

        // Heuristic: If we see a line that looks like a job title but we are in education section,
        // and there was no "Experience" header, we might should stop.
        if (lowerLine.includes('executive') || lowerLine.includes('manager') || lowerLine.includes('officer')) {
            // If it's single word or short line, it's likely a job
            if (line.split(' ').length < 10 && !line.includes('Education')) {
                console.log("Stopping Education due to suspected Job Title:", line);
                // break; // This is what we might need
            }
        }

        const dateRegex = /(?:(?:\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?|(?:\d{1,2}[\/\.]))?\s*(?:20|19)\d{2}\s*(?:[-–—]|\bto\b)\s*(?:present|now|current|(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?|(?:\d{1,2}[\/\.]))?\s*(?:20|19)\d{2})|\b(?:20|19)\d{2}\b)/i;
        const hasDate = dateRegex.test(line);

        if (hasDate && currentBlock.length > 0) {
            blocks.push(currentBlock);
            currentBlock = [line];
        } else {
            currentBlock.push(line);
        }
    }
    if (currentBlock.length > 0) blocks.push(currentBlock);

    console.log(`Found ${blocks.length} blocks`);
    blocks.forEach((b, idx) => {
        console.log(`Block ${idx + 1}:`, b.join(' | ').substring(0, 100));
    });
}

simulateEducationParser(text);
