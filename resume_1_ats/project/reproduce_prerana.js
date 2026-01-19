
const text = `Work Experience
Associate HR, Tejas Networks Ltd, Bangalore
Nov 2022 - Present
Human Resource Business Partner (HRBP)


Facilitated *

1:1s

,

skip-level meetings

, and

stay interviews

* to understand employee sentiment, identify early retention risks, and strengthen leadership–employee connect for more 2 BUs

Drove *

employee engagement

and

retention initiatives

by conducting

exit interviews

,

managing grievance

cases, running

pulse feedback

* sessions, and supporting action planning with managers.

Managed *

employee relations and conflict resolution * cases, ensuring fairness, timely closure, and adherence to company policies.

Supported *

workforce rationalization initiatives *, including handling employee separations due to cost optimization in a compliant, transparent, and empathetic manner.

Collaborated closely with the Compensation & Benefits (C&

B) team to prepare comprehensive compensation data to support *

counter-offer evaluations

* and salary discussions with employees and managers.

Analysed *

HR data and dashboards * to highlight trends in engagement, attrition, and performance, and provide insights for business decisions.

Led the *

Rewards & Recognition * process end-to-end, including budget planning, nomination management, documentation, timely rollout of awards, and reconciliation.

Supported *

promotion and talent review cycles * by validating eligibility, coordinating approvals, and ensuring accurate documentation.


Partnered with business leaders

on

capability development

,

identifying skill gaps

and coordinating

targeted learning interventions

* with theL&Dteam.

Talent Acquisition (Recruitment)


Managed *

end-to-end recruitment across niche tech roles * (Java, Node.js, Python, Automation, UI, NMS, Wireless/RAN Testing, FPGA, Firmware) and critical non-R&Droles.

Partnered with business leaders to * define workforce needs, create accurate JDs, and align hiring plans * with project and organizational priorities.

Built strong * sourcing pipelines * and improved quality of hire using Naukri, LinkedIn, referrals, and proactive market mapping.

Conducted 100+ screenings and interviews, ensuring strong * assessment of technical capability , behavioural fit , and long-term potential *.

Improved * candidate experience * by ensuring timely communication, smooth interview coordination, and seamless onboarding; released offers through DarwinBox.


Negotiated offers and collaborated withC&B * to provide comprehensive compensation data, enabling competitive offers and effective counter-offer decisions.

Delivered * recruitment dashboards and insights *, enhancing hiring visibility and supporting data-driven decision-making for leadership.`;

function extractExperienceStandalone(text) {
    const experiences = [];
    const lines = text.split('\n').map(l => l.trim());

    const yearPat = /(?:2\s*0\s*\d\s*\d|1\s*9\s*\d\s*\d|'\s*\d\s*\d|\b\d{2}\b)/;
    const monthPat = /(?:j\s*a\s*n|f\s*e\s*b|m\s*a\s*r|a\s*p\s*r|m\s*a\s*y|j\s*u\s*n|j\s*u\s*l|a\s*u\s*g|s\s*e\s*p|o\s*c\s*t|n\s*o\s*v|d\s*e\s*c)[a-z\s]*\.?|(?:\d\s*[\/\.\s]\s*\d)/;
    const dateRegex = new RegExp(`(?:(?:${monthPat.source})\\s*(?:${yearPat.source}))|${yearPat.source}\\s*(?:[-–—]|\\bto\\b|\\bsince\\b|\\s+(?=\\b(?:present|now|current|'|20|19)\\b))\\s*(?:present|now|current|(?:(?:${monthPat.source})\\s*)?(?:${yearPat.source}))|(?:${monthPat.source})\\s*(?:${yearPat.source})|(?:\\bsince\\s+|\\bfrom\\s+|\\bjoined\\s+)(?:(?:${monthPat.source})\\s*)?(?:${yearPat.source})|\\b(?:2\\s*0\\s*\\d\\s*\\d|1\\s*9\\s*\\d\\s*\\d)\\b`, 'i');

    let currentBlock = [];

    const processBlock = (block) => {
        if (block.length === 0) return;

        const bulletRegex = /^[\s\t]*([•●➢▪]|[-*]\s+)/;
        const mergedDescriptionLines = [];

        // Find date and remove it from block for simplicity in this repro
        const dateLineIndex = block.findIndex(l => dateRegex.test(l));
        if (dateLineIndex !== -1) {
            block.splice(dateLineIndex, 1);
        }

        let sawEmptyLine = false;
        for (let i = 0; i < block.length; i++) {
            const line = block[i].trim();
            if (!line) {
                sawEmptyLine = true;
                continue;
            }

            const hasBullet = bulletRegex.test(line);
            const cleanLine = line.replace(bulletRegex, '').trim();

            if (hasBullet) {
                mergedDescriptionLines.push(cleanLine);
                sawEmptyLine = false;
            } else {
                let shouldBeNewPoint = false;
                if (mergedDescriptionLines.length > 0) {
                    const lastLine = mergedDescriptionLines[mergedDescriptionLines.length - 1].trim();
                    const lastLineEndsPeriod = /[.!?]$/.test(lastLine);
                    const currentStartsCapital = /^[A-Z]/.test(cleanLine);

                    if (sawEmptyLine && (lastLineEndsPeriod || (currentStartsCapital && cleanLine.length > 15))) {
                        shouldBeNewPoint = true;
                    }
                }

                if (shouldBeNewPoint || mergedDescriptionLines.length === 0) {
                    mergedDescriptionLines.push(cleanLine);
                } else {
                    const idx = mergedDescriptionLines.length - 1;
                    const lastLine = mergedDescriptionLines[idx];
                    const separator = (/^[.,;:!?)\]]/.test(cleanLine) || lastLine.endsWith('(') || lastLine.endsWith('[')) ? '' : ' ';
                    mergedDescriptionLines[idx] = lastLine + separator + cleanLine;
                }
                sawEmptyLine = false;
            }
        }

        console.log("Found Entry with " + mergedDescriptionLines.length + " bullet points.");
        mergedDescriptionLines.forEach((l, idx) => console.log(`  ${idx + 1}: ${l}`));
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const hasDate = dateRegex.test(line);
        const blockHasDate = currentBlock.some(l => dateRegex.test(l));

        if (hasDate && blockHasDate) {
            processBlock(currentBlock);
            currentBlock = [line];
        } else {
            currentBlock.push(line);
        }
    }
    processBlock(currentBlock);
}

extractExperienceStandalone(text);
