
// Mock Resume based on user's case (7.97 years)
const resume = {
    summary: "Senior Software Engineer with 8 years of experience in Engineering.",
    experience: [
        {
            position: "Senior Developer",
            startDate: "2017-05-01",
            endDate: "2025-01-01",
            description: "Managing large scale systems."
        }
    ],
    skills: ["Java", "System Design"],
    education: [],
    projects: [],
    certifications: []
};

const jobDescription = "Sales Executive role. Looking for 0-2 years of experience in Sales and Business Development.";

// Simulating the logic from jobMatcher.ts
function detectResumeContext(r) {
    const text = (r.summary + " " + r.experience.map(e => e.position).join(" ")).toLowerCase();
    if (text.includes('software') || text.includes('developer') || text.includes('engineering')) return 'Engineering';
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

    const effectiveTotalYears = 7.97;
    const expReqs = { min: 0, max: 2 };
    const yearsText = "0–2 years";
    const startYear = "2021"; // simulating user's reported feedback start year

    let experienceScore = 15; // Hit Case B: Severe Overqualification
    let missingExperience = `Critical Mismatch. The JD requires ${expReqs.min}–${expReqs.max} years. The CV lists ${effectiveTotalYears}+ years of experience starting from ${startYear}.`;

    // Logic from the update:
    if (domainMismatch) {
        const domainAdjustedRelevance = 0.1; // low crossover
        const targetScore = Math.round(25 + (domainAdjustedRelevance * 20));

        experienceScore = Math.min(experienceScore, targetScore);

        const domainMsg = `the background focuses on ${resumeContext || 'another field'}, which differs from the ${jdContext || 'target'} domain.`;
        if (missingExperience) {
            if (!missingExperience.toLowerCase().includes('domain') && !missingExperience.toLowerCase().includes('background')) {
                missingExperience = `${missingExperience.endsWith('.') ? missingExperience.slice(0, -1) : missingExperience}. Additionally, ${domainMsg}`;
            }
        } else {
            missingExperience = `Domain Mismatch. ${domainMsg.charAt(0).toUpperCase() + domainMsg.slice(1)}`;
        }
    }

    console.log("--- TEST RESULTS (Case B + Domain Mismatch) ---");
    console.log("Resume Industry:", resumeContext);
    console.log("JD Industry:", jdContext);
    console.log("Final Experience Score:", experienceScore);
    console.log("Missing Experience Message:", missingExperience);
}

calculateScore(resume, jobDescription);
