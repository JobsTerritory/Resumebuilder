
import { matchJobPosting } from './src/lib/jobMatcher';
import { Resume } from './types';

const mockResume: Resume = {
    id: '1',
    personalInfo: { fullName: 'Test User', email: 'test@test.com', phone: '1234567890' },
    education: [], // Intentionally empty initially
    experience: [],
    skills: [],
    projects: [],
    certifications: [],
    languages: [],
    summary: 'Experienced professional'
};

const mockResumeWithArts: Resume = {
    ...mockResume,
    education: [{
        degree: 'BA',
        institution: 'University of Arts',
        fieldOfStudy: 'Fine Arts',
        startDate: '2015',
        endDate: '2019'
    }]
};

const mockResumeWithCS: Resume = {
    ...mockResume,
    education: [{
        degree: 'B.Tech',
        institution: 'Tech University',
        fieldOfStudy: 'Computer Science',
        startDate: '2015',
        endDate: '2019'
    }]
};

async function test(name: string, resume: Resume, jdText: string, expectedScoreRange: [number, number], expectedFeedbackSnippet: string) {
    console.log(`\n--- Test: ${name} ---`);
    try {
        const result = await matchJobPosting(resume, jdText);
        const eduScore = result.breakdown.educationScore;
        const feedback = result.categoryScores.educationMatch.feedback.join(' ');

        console.log(`Score: ${eduScore}`);
        console.log(`Feedback: ${feedback}`);

        if (eduScore >= expectedScoreRange[0] && eduScore <= expectedScoreRange[1]) {
            if (feedback.toLowerCase().includes(expectedFeedbackSnippet.toLowerCase())) {
                console.log("✅ PASS");
            } else {
                console.log(`❌ FAIL Feedback. Expected snippet: "${expectedFeedbackSnippet}"`);
            }
        } else {
            console.log(`❌ FAIL Score. Expected [${expectedScoreRange[0]}, ${expectedScoreRange[1]}], got ${eduScore}`);
        }

    } catch (e) {
        console.error("Error:", e);
    }
}

async function runTests() {
    // Test 1: Mandatory Degree, Missing
    await test(
        "Mandatory Degree - Missing",
        mockResume,
        "Bachelor's Degree Mandatory. Required skills: Java.",
        [0, 25],
        "degree is MANDATORY"
    );

    // Test 2: Optional Degree, Missing
    await test(
        "Optional Degree - Missing",
        mockResume,
        "Bachelor's Degree Optional. Nice to have.",
        [85, 95],
        "degree is optional but preferred"
    );

    // Test 3: Preferred Degree, Missing
    await test(
        "Preferred Degree - Missing",
        mockResume,
        "Bachelor's Degree Preferred.",
        [45, 55],
        "degree required" // Default message for preferred/standard
    );

    // Test 4: Field Mismatch (Mandatory CS, has Arts)
    await test(
        "Field Mismatch - Mandatory CS",
        mockResumeWithArts,
        "Bachelor's degree in Computer Science is Mandatory.",
        [0, 35],
        "Strict Requirement: JD mandates degree in"
    );

    // Test 5: Field Mismatch (Optional CS, has Arts)
    await test(
        "Field Mismatch - Optional CS",
        mockResumeWithArts,
        "Bachelor's degree in Computer Science is Optional.",
        [80, 90],
        "JD prefers degree in Computer Science"
    );

    // Test 6: Full Degree Expansion Check
    await test(
        "Full Expansion Check",
        mockResumeWithCS,
        "Bachelor's Degree Mandatory.",
        [95, 100],
        "Bachelor of Technology in Computer Science"
    );
}

runTests();
