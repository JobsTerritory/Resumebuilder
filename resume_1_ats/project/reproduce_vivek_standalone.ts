
// Self-contained reproduction script
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

function simulateParsing(text: string) {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    const experienceKeywords = [
        'experience', 'work experience', 'professional experience', 'employment history', 'work history',
        'career history', 'employment', 'work', 'history', 'professional background', 'work background',
        'career profile', 'career summary', 'professional journey', 'experience summary'
    ];
    let experienceStartIndex = -1;
    let experienceEndIndex = lines.length;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].toLowerCase();
        if (experienceKeywords.some(k => line === k || line === k + ':' || (line.includes(k) && line.length < 50 && !line.includes('summary')))) {
            const isHeaderWithYears = line.match(/\d/) && (line.includes('years') || line.includes('yrs')) && line.length < 40;
            if (line.match(/\d/) && !isHeaderWithYears) continue;
            experienceStartIndex = i + 1;
            break;
        }
    }

    if (experienceStartIndex === -1) {
        console.log("No Experience Header found. Scanning whole document...");
        experienceStartIndex = 0;
        experienceEndIndex = lines.length;
    } else {
        const stopKeywords = ['education', 'technical skills', 'key skills', 'projects', 'languages', 'certifications'];
        for (let i = experienceStartIndex; i < lines.length; i++) {
            const line = lines[i].toLowerCase();
            const isBullet = /^[\s\t]*[•●➢▪\-\d\.]/.test(line);
            if (!isBullet && stopKeywords.some(k => line === k || line.startsWith(k + ':'))) {
                experienceEndIndex = i;
                break;
            }
        }
    }

    console.log(`Experience Range: [${experienceStartIndex}, ${experienceEndIndex}]`);
    const expLines = lines.slice(experienceStartIndex, experienceEndIndex);

    // Process Blocks
    let currentBlock: string[] = [];
    const degreeKeywords = ['bachelor', 'master', 'university', 'college', 'mba ', ' bsc'];

    expLines.forEach((line) => {
        const hasDate = /(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?|\d{1,2}[\/\.]|20\d{2})/i.test(line);
        if (hasDate && currentBlock.length > 0) {
            processBlock(currentBlock);
            currentBlock = [line];
        } else {
            currentBlock.push(line);
        }
    });
    processBlock(currentBlock);

    function processBlock(block: string[]) {
        if (block.length === 0) return;

        // Safety: skip edu blocks
        const isEduBlock = block.some(l => degreeKeywords.some(dk => l.toLowerCase().includes(dk)));
        if (isEduBlock && block.length < 5) return;

        let position = '';
        let company = '';

        for (let i = 0; i < Math.min(3, block.length); i++) {
            const line = block[i];
            const cleanTitleLine = line.replace(/^[\s\t]*[•●➢▪\-]\s*/, '').trim();
            if (line.split(' ').length < 12) {
                const isPos = /manager|engineer|developer|executive|analyst|associate|lead|director|head|recruiter|specialist|intern|member|coordinator|consultant|assistant|officer|trainee/i.test(cleanTitleLine);
                if (!position && isPos) position = cleanTitleLine;
                else if (!company && !isPos && position) company = cleanTitleLine;
            }
        }

        if (position && company) {
            console.log("Found Job Block:", position, "at", company);
        }
    }

    // Education Test
    console.log("--- Testing Education Stop Logic ---");
    const eduKeywords = ['education'];
    let eduStartIndex = lines.findIndex(l => eduKeywords.some(k => l.toLowerCase().startsWith(k))) + 1;
    let eduEndIndex = lines.length;

    for (let i = eduStartIndex; i < lines.length; i++) {
        const line = lines[i].toLowerCase();
        // Refined stop logic
        const isJobTitle = /executive|manager|recruiter|specialist|engineer|developer/i.test(line);
        const hasDegree = degreeKeywords.some(dk => line.includes(dk));
        if (isJobTitle && (line.split(' ').length < 12 || line.includes(' at ')) && !hasDegree) {
            eduEndIndex = i;
            console.log("Stopped Education at line", i, ":", lines[i]);
            break;
        }
    }
    console.log(`Education Range: [${eduStartIndex}, ${eduEndIndex}]`);
}

simulateParsing(vivekText);
