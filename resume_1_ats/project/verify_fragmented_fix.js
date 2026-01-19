
import { parseResume } from './src/lib/resumeParser.ts';

const resumeText = `
Muskan Agarwal
Summary
Seeking Java skills.

Work Experience
CODSOFT INTERN || J AVA P ROGRAMME R
Sep 2023 - 30
Sundown Studio Website Clone ( H TML, C SS , J AVA S CRIPT )
Recreated the Sundown Studio website using HTML, CSS, and JavaScript.
Bank - Application ( F ULL S TACK P ROJECT USING MY SQL, T HYMELEAF , S PRING B OOT )
Designed and developed a bank Application.

Projects
Food Delivery App ( Full Stack Project using MERN Stack )
Developed a full stack food delivery Application.

Education
Bachelor of Technology - Computer Science and Engineering 2 0 2 1 - 2 0 2 5
Siliguri Institute of Technology ( A vg CGPA: 8. 3 )
Coursework: OS, CN, DB.
`;

async function test() {
    try {
        const result = await parseResume(resumeText);

        console.log('--- EXPERIENCE ---');
        result.experience.forEach(e => {
            console.log(`Company: ${e.company}`);
            console.log(`Position: ${e.position}`);
            console.log(`Date: ${e.startDate} - ${e.endDate}`);
            console.log('---');
        });

        console.log('--- EDUCATION ---');
        result.education.forEach(edu => {
            console.log(`Institution: ${edu.institution}`);
            console.log(`Degree: ${edu.degree}`);
            console.log(`Date: ${edu.startDate} - ${edu.endDate}`);
            console.log('---');
        });
    } catch (e) {
        console.error(e);
    }
}

test();
