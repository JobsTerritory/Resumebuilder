
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

// Simple simulation of the experience parser
function simulateExperienceParser(text) {
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    let experienceStartIndex = -1;
    const experienceKeywords = ['work experience', 'experience', 'employment'];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim().toLowerCase();
        if (experienceKeywords.some(k => line === k || line.startsWith(k + ':'))) {
            experienceStartIndex = i;
            break;
        }
    }

    if (experienceStartIndex === -1) {
        console.log("No experience section found");
        return;
    }

    const stopKeywords = ['projects', 'education', 'certifications', 'skills'];
    const positionKeywords = /manager|engineer|developer|hrbp|executive|analyst|associate|lead|director|head|recruiter|specialist|intern|member|coordinator|consultant|assistant|officer|trainee/i;
    const dateRegex = /(?:(?:\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?|(?:\d{1,2}[\/\.]))?\s*(?:20|19)\d{2}\s*(?:[-–—]|\bto\b)\s*(?:present|now|current|(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?|(?:\d{1,2}[\/\.]))?\s*(?:20|19)\d{2})|\b(?:20|19)\d{2}\b)/i;

    let blocks = [];
    let currentBlock = [];

    for (let i = experienceStartIndex + 1; i < lines.length; i++) {
        const line = lines[i].trim();
        const lowerLine = line.toLowerCase();

        if (stopKeywords.some(k => lowerLine.startsWith(k))) {
            break;
        }

        const hasDate = dateRegex.test(line);
        const isPos = positionKeywords.test(lowerLine);

        if ((hasDate || isPos) && currentBlock.length > 0) {
            blocks.push(currentBlock);
            currentBlock = [line];
        } else {
            currentBlock.push(line);
        }
    }
    if (currentBlock.length > 0) blocks.push(currentBlock);

    console.log(`Found ${blocks.length} blocks`);
    blocks.forEach((b, idx) => {
        console.log(`Block ${idx + 1}:`, b.join(' | ').substring(0, 150));
    });
}

simulateExperienceParser(text);
