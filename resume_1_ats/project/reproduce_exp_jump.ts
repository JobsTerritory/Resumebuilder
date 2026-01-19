
import { calculateTotalResumeExperience } from './src/lib/jobMatcher';
import { Resume } from './src/types';

function mockCalculateTotalResumeExperience(resume: any): number {
    const intervals: { start: number; end: number }[] = [];

    resume.experience.forEach((exp: any) => {
        if (exp.startDate && exp.endDate) {
            // Very simplified parse for test
            const start = new Date(exp.startDate).getTime();
            const end = exp.endDate === 'Present' ? Date.now() : new Date(exp.endDate).getTime();
            if (!isNaN(start) && !isNaN(end)) {
                intervals.push({ start, end });
            }
        }
    });

    if (intervals.length > 0) {
        let totalMs = 0;
        intervals.forEach(i => totalMs += (i.end - i.start));
        const years = totalMs / (1000 * 60 * 60 * 24 * 365.25);
        return parseFloat(years.toFixed(2));
    }

    // Fallback to summary
    const summaryMatch = (resume.summary || '').match(/(\d+)\s+years/i);
    return summaryMatch ? parseFloat(summaryMatch[1]) : 0;
}

function mockMatchLogic(totalYears: number, summary: string) {
    let effective = totalYears;
    const summaryMatch = summary.match(/(\d+)\s+years/i);
    const summaryYears = summaryMatch ? parseFloat(summaryMatch[1]) : 0;

    console.log(`Calculated: ${totalYears}, Summary Says: ${summaryYears}`);

    // THE BUGGY CONDITION
    if (totalYears < 1.0 && summaryYears > 0) {
        effective = Math.max(totalYears, summaryYears);
        console.log(`Fallback triggered! Effective: ${effective}`);
    } else {
        console.log(`Fallback NOT triggered. Effective: ${effective}`);
    }
    return effective;
}

const resume = {
    summary: "I have 10 years of experience in sales.",
    experience: [
        { startDate: "2023-01-01", endDate: "Present" } // ~1.1 years if today is late 2024
    ]
};

console.log("--- Run 1: Parser finds the role correctly (1.1 years) ---");
const run1Years = 1.1; // Simulated
mockMatchLogic(run1Years, resume.summary);

console.log("\n--- Run 2: Parser slightly misses (e.g. finds 0.9 years due to month parsing) ---");
const run2Years = 0.9; // Simulated
mockMatchLogic(run2Years, resume.summary);

console.log("\nCONCLUSION: The same resume jumps from 1.1 to 10 years because of the 1.0 threshold!");
