
import { matchJobPosting } from './src/lib/jobMatcher';
import { Resume } from './src/types';

async function testEducationFeedback() {
    console.log("🧪 Testing Education Feedback Improvements...");

    const mockResume: Resume = {
        education: [
            { degree: "B.Com", institution: "Delhi University", fieldOfStudy: "Commerce" }
        ],
        experience: [],
        skills: [],
        summary: "Accountant with 2 years experience.",
        personal_info: { fullName: "Test User", email: "", phone: "", location: "" },
        projects: [],
        certifications: [],
        languages: [],
        interests: [],
        internships: [],
        template: "modern",
        section_order: []
    } as any;

    const jdMasterRequired = "Job Title: Finance Manager\nRequirements: Master's degree in Finance required.";

    console.log("\n--- Scenario 1: Master's Required, B.Com Found ---");
    const result1 = await matchJobPosting(mockResume, jdMasterRequired);
    console.log("Score:", result1.comprehensiveScore);
    console.log("Education Feedback:", result1.categoryScores.educationMatch.feedback);

    if (result1.categoryScores.educationMatch.feedback.some(f => f.includes("(found B.Com)"))) {
        console.log("✅ SUCCESS: Feedback correctly mentioned B.Com.");
    } else {
        console.log("❌ FAILURE: Feedback did not mention B.Com.");
    }

    const jdMasterPreferred = "Job Title: Finance Manager\nRequirements: Master's degree in Finance preferred.";
    console.log("\n--- Scenario 2: Master's Preferred, B.Com Found ---");
    const result2 = await matchJobPosting(mockResume, jdMasterPreferred);
    console.log("Score:", result2.comprehensiveScore);
    console.log("Education Feedback:", result2.categoryScores.educationMatch.feedback);

    if (result2.categoryScores.educationMatch.feedback.some(f => f.includes("(found B.Com)"))) {
        console.log("✅ SUCCESS: Feedback correctly mentioned B.Com for optional requirement.");
    } else {
        console.log("❌ FAILURE: Feedback did not mention B.Com for optional requirement.");
    }
}

testEducationFeedback().catch(console.error);
