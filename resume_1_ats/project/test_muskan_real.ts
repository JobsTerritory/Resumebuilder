
import { parseResume } from './src/lib/resumeParser';

const text = `Muskan Agarwal
Phone:
8944015010
Email:
mahekagarwal1216@gmail.com
Summary
Aspiring Software Developer with a solid foundation in Java, web development, and MySQL. Seeking to leverage coding skills and passion for problem - solvi ng to contribute to innovative software projects.

Work Experience
Unknown Position, CODSOFT INTERN || JAVA PROGRAMME R Remote || 1 st
Sep 2023 - 30
Sundown Studio Website Clone ( HTML, CSS , J AVA S CRIPT )

Recreated the Sundown Studio website using HTML, CSS, and JavaScript to strengthen front - end skills.

Focused on responsive design and user interface, enhancing understanding of CSS layouts and JavaScript

interactivity.

Bank - Application ( F ULL S TACK P ROJECT USING MY SQL, T HYMELEAF , S PRING B OOT )

Designed and developed a bank Application that allows users to transfer money, check current balances, and

perform withdrawals and deposits .

Utilized Spring Boot and Thymeleaf for building dynamic, server - rendered user interfaces, enhancing user

experience and reliability.

Implemented MySQL for secure data storage, ensuring efficient data retrieval and management.

EXPERIENCE

Developed four Java projects as part of the internship program.

Gained hands - on experience in Java programming and enhanced coding skills.

Projects
Food Delivery App ( Full Stack Project using MERN Stack )
Developed a full stack food delivery Application using the MERN stack (MongoDB, Express, React, Node.js).

Built responsive and dynamic UI using React, providing users with a smooth browsing and ordering experience

Designed and implemented backend APIs with Node.js and Express, integrating MongoDB to manage user data,

Sundown Studio Website Clone ( HTML, CSS , J AVA S CRIPT )
Recreated the Sundown Studio website using HTML, CSS, and JavaScript to strengthen front - end skills.

Focused on responsive design and user interface, enhancing understanding of CSS layouts and JavaScript

Bank - Application ( F ULL S TACK P ROJECT USING MY SQL, T HYMELEAF , S PRING B OOT )
Designed and developed a bank Application that allows users to transfer money, check current balances, and

perform withdrawals and deposits .
Utilized Spring Boot and Thymeleaf for building dynamic, server - rendered user interfaces, enhancing user

Education
Bachelor of Technology - Computer Science and Engineering 202 1 - 202 5
Unknown Institution

8. 3 )

-
Coursework : Operating Systems, Computer Networks, Databases, Data Structures and Algorithms , SQL
Unknown Institution

-
Certifications
Internship Certificate CODSOFT Sep 2023
2020
Technical Skills
JavaScript, Java, React, Node.js, Express, Spring, HTML, CSS, SQL, MongoDB, MySQL, Git, Leadership, Communication, Languages: JAVA, ReactJS, Tools : Arduino, VS Code, IntelliJ, Networking, TCP/IP, Operating System : Windows, Linux., Databases : MySQL, Version Control : Git, GitHub
Additional Information
Languages:
Tools, Operating System, Soft Skills, Databases, Version Control
Interests:
Language: Fluent in English, Hindi and Nepali, Computer: Excel, Powerpoint, MsWord, Interests: Reading, Chess and Dancing
`;

async function test() {
    const result = await parseResume(text);
    console.log("--- EXPERIENCE ---");
    result.experience?.forEach((e: any, idx: number) => {
        console.log(`${idx + 1}. ${e.position} at ${e.company} (${e.startDate} - ${e.endDate})`);
        console.log(`Description length: ${e.description.length}`);
    });

    console.log("\n--- PROJECTS ---");
    result.projects?.forEach((p: any, idx: number) => {
        console.log(`${idx + 1}. ${p.title}`);
    });
}

test();
