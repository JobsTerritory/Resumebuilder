
import { calculateTotalResumeExperience } from './src/lib/jobMatcher';
import { Resume } from './src/types';

async function verifyFinalFix() {
    console.log("🧪 Verifying Final Consistency and Internship Fix...");

    const mockResume: Resume = {
        summary: "I have 10 years of experience in sales.",
        experience: [
            { startDate: "Jan 2023", endDate: "Present", current: true, description: "" } // ~1 year
        ],
        internships: [
            { startDate: "Jan 2022", endDate: "Dec 2022", description: "" } // 1 year
        ],
        education: [],
        skills: [],
        personal_info: { fullName: "Test", email: "", phone: "", location: "" },
        projects: [],
        certifications: [],
        languages: [],
        interests: [],
        template: "modern",
        section_order: []
    } as any;

    const totalYears = calculateTotalResumeExperience(mockResume);
    console.log(`Total Years: ${totalYears}`);

    // Should be at least 10 because of summary max
    if (totalYears >= 10) {
        console.log("✅ SUCCESS: Consistently used summary years.");
    } else {
        console.log("❌ FAILURE: Summary fallback did not work consistently.");
    }

    const mockResumeNoSummary: Resume = {
        ...mockResume,
        summary: "No years mentioned here."
    };
    const totalYearsNoSummary = calculateTotalResumeExperience(mockResumeNoSummary);
    console.log(`Total Years (No Summary): ${totalYearsNoSummary}`);

    // Should be ~2 years (1 year exp + 1 year internship)
    if (totalYearsNoSummary >= 1.8) {
        console.log("✅ SUCCESS: Included internships in total.");
    } else {
        console.log("❌ FAILURE: Internships were not counted correctly.");
    }
}

verifyFinalFix().catch(console.error);
