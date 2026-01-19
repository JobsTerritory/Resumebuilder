
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
john@test.com

Education
Bachelor of Science in Computer Science
Massachusetts Institute of Technology
2016-2020

Master of Business Administration
Harvard Business School
2020-2022
`;

async function test() {
    const file = new MockFile('resume.txt', dummyResume);
    // @ts-ignore
    const result = await parseResume(file);
    console.log("Education extracted:", JSON.stringify(result.education, null, 2));
}

test();
