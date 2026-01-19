
import { extractExperience, extractEducation, cleanText } from './src/lib/resumeParser';

const vivekText = `Calicut, Kerala India.
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

-
Jan 2024 - Oct 2024
·Oversee end-to-end recruitment processes, including sourcing, screening, interviewing, and onboarding
candidates for various roles across the organization.·Collaborate with hiring managers to understand staffing
needs, develop job descriptions, and implement effective recruitment strategies.
`;

async function test() {
    console.log("Testing Vivek Resume Parsing...");
    const text = cleanText(vivekText);

    console.log("--- Testing Experience ---");
    const exp = extractExperience(text);
    console.log("Found", exp.length, "experience entries.");
    exp.forEach((e, i) => console.log(`Entry ${i + 1}:`, e.position, "at", e.company, `(${e.startDate} - ${e.endDate})`));

    console.log("--- Testing Education ---");
    const edu = extractEducation(text);
    console.log("Found", edu.length, "education entries.");
    edu.forEach((e, i) => console.log(`Entry ${i + 1}:`, e.degree, "at", e.institution));
}

test();
