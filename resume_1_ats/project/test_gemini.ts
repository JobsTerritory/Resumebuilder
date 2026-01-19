import { parseResumeWithGemini } from './src/lib/gemini';

const testText = `
VIVEK M
Calicut, Kerala India
Phone: 9047968165
Email: vivek.ashwin1996@gmail.com

EDUCATION
Master of Business Administration - HR
Hindusthan College of Arts & Science
Jan 2016 - Jan 2018

Batchelor of computer Application
Kongunadu college of arts and science
Jan 2013 - Jan 2016

WORK EXPERIENCE
ASSISTANT MANAGER -HR - BHARATH FINANCIAL INCLUSION LTD
Jan 2024 - TILL DATE
`;

async function test() {
    console.log('Testing Gemini API...');
    const result = await parseResumeWithGemini(testText);
    console.log('Result:', JSON.stringify(result, null, 2));
}

test().catch(console.error);
