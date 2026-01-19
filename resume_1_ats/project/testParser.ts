
import { parseResume } from './src/lib/resumeParser';
import fs from 'fs';

// Mock File object
class MockFile {
    name: string;
    type: string;
    size: number;
    content: string;

    constructor(name: string, content: string) {
        this.name = name;
        this.type = 'text/plain';
        this.content = content;
        this.size = content.length;
    }

    async text() {
        return this.content;
    }

    arrayBuffer() {
        return Promise.resolve(new TextEncoder().encode(this.content));
    }
}

// Override FileReader in Node environment for testing
global.FileReader = class {
    onload: (e: any) => void = () => { };
    onerror: (e: any) => void = () => { };
    readAsText(file: any) {
        setTimeout(() => {
            this.onload({ target: { result: file.content } });
        }, 10);
    }
} as any;

const dummyResume = `
John Doe
john.doe@email.com
(123) 456-7890

Summary
Experienced software engineer with a passion for building scalable web applications.

Experience
Senior Software Engineer
Tech Corp | New York, NY
Jan 2022 - Present
- Led a team of 5 developers
- Improved system performance by 20%

Software Developer
Startup Inc
2019 - 2021
- Built the initial MVP using React and Node.js

Education
Bachelor of Science in Computer Science
University of Technology
2015 - 2019

Skills
JavaScript, TypeScript, React, Node.js, AWS, Docker
`;

async function test() {
    const file = new MockFile('resume.txt', dummyResume);
    // @ts-ignore
    const result = await parseResume(file);
    console.log(JSON.stringify(result, null, 2));
}

test();
