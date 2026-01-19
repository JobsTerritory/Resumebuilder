
import { parseResume } from './src/lib/resumeParser';

const resumeText = `
Muskan Agarwal
Summary
Seeking to leverage coding skills.

Work Experience
CODSOFT INTERN || JAVA PROGRAMME R Remote || 1 st
Sep 2023 - 30
Sundown Studio Website Clone ( HTML, CSS , J AVA S CRIPT )
Recreated the Sundown Studio website using HTML, CSS, and JavaScript.
Bank - Application ( F ULL S TACK P ROJECT USING MY SQL, T HYMELEAF , S PRING B OOT )
Designed and developed a bank Application.

Projects
Food Delivery App ( Full Stack Project using MERN Stack )
Developed a full stack food delivery Application.

Education
Bachelor of Technology - Computer Science and Engineering 202 1 - 202 5
Siliguri Institute of Technology ( A vg CGPA: 8. 3 )
Coursework: OS, CN, DB.
`;

async function test() {
    const result = await parseResume(resumeText);

    console.log('--- EXPERIENCE ---');
    result.experience.forEach(e => {
        console.log(`Company: ${e.company}`);
        console.log(`Position: ${e.position}`);
        console.log(`Date: ${e.startDate} - ${e.endDate}`);
        console.log(`Desc Length: ${e.description.length}`);
        console.log('---');
    });

    console.log('--- EDUCATION ---');
    result.education.forEach(edu => {
        console.log(`Institution: ${edu.institution}`);
        console.log(`Degree: ${edu.degree}`);
        console.log(`Date: ${edu.startDate} - ${edu.endDate}`);
        console.log('---');
    });

    console.log('--- PROJECTS ---');
    result.projects.forEach(p => {
        console.log(`Title: ${p.title}`);
    });
}

test();
