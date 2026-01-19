
// Mock Resume based on user's case
const resume = {
    summary: "Junior Engineer with 0.08 years of experience in Software Engineering.",
    experience: [
        {
            position: "Junior Developer",
            startDate: "2025-05-01",
            current: true,
            description: "Working on web applications."
        }
    ],
    skills: ["JavaScript", "React", "Node.js"],
    education: [],
    projects: [],
    certifications: []
};

const jobDescription = "Sales Executive role. Looking for 0-2 years of experience in Sales and Business Development.";

// Simulating the scoring logic from jobMatcher.ts
function detectResumeContext(r) {
    const text = (r.summary + " " + r.experience.map(e => e.position).join(" ")).toLowerCase();
    if (text.includes('software') || text.includes('developer')) return 'Engineering';
    if (text.includes('sales')) return 'Sales';
    return 'Unknown';
}

function detectJDContext(jd) {
    const text = jd.toLowerCase();
    if (text.includes('sales')) return 'Sales';
    if (text.includes('software')) return 'Engineering';
    return 'Unknown';
}

function calculateScore(r, jd) {
    const resumeContext = detectResumeContext(r);
    const jdContext = detectJDContext(jd);
    const domainMismatch = resumeContext !== jdContext;

    const effectiveTotalYears = 0.08;
    const yearsText = "0–2 years";
    const startYear = "2025";

    let experienceScore = 100; // meeting 0-2 range

    // Logic from Case E update:
    const baseScore = effectiveTotalYears < 0.2 ? 70 : 75;
    experienceScore = baseScore + (0.9 * (100 - baseScore)); // simulating 90% relevance ratio

    let feedback = `The JD requires ${yearsText}. The CV has ${effectiveTotalYears} years starting from ${startYear}.`;

    if (domainMismatch) {
        // Penalty logic
        experienceScore = Math.round(25 + (0.1 * 20)); // low relevance in target domain
        feedback += ` However, the background focuses on ${resumeContext}, differing from the ${jdContext} domain.`;
    }

    console.log("--- TEST RESULTS ---");
    console.log("Resume Industry:", resumeContext);
    console.log("JD Industry:", jdContext);
    console.log("Domain Mismatch:", domainMismatch);
    console.log("Final Experience Score:", experienceScore);
    console.log("Feedback:", feedback);
}

calculateScore(resume, jobDescription);
