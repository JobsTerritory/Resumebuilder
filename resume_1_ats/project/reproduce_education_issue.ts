
import { extractEducation } from './src/lib/resumeParser';

const hardResumeText = `
EDUCATION

2008 - 2012
Bachelor of Science
University of Nowhere

2005 - 2007
High School Diploma
City High School

2000 - 2004
Random Course
Some Place
`;

console.log('Testing extraction...');
const results = extractEducation(hardResumeText);
console.log(JSON.stringify(results, null, 2));
