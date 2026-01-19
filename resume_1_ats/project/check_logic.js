
// Logic extracted from jobMatcher.ts
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function calculateScore(effectiveTotalYears, requiredYears, maxYearsReq, resume, jobDescription, aiReqs, workDomains, jdContextDetail, domainMismatch, partialMatchDomain) {
    let durationScore = 100;
    const EXPERIENCE_CAP_YEARS = 25;

    // Pillar 1: Duration
    if (effectiveTotalYears < requiredYears) {
        durationScore = Math.round((effectiveTotalYears / requiredYears) * 100);
    } else if ((maxYearsReq !== null && (effectiveTotalYears > maxYearsReq * 3 || effectiveTotalYears > 10)) || effectiveTotalYears > EXPERIENCE_CAP_YEARS) {
        durationScore = 20;
    } else if (maxYearsReq !== null && effectiveTotalYears > maxYearsReq) {
        durationScore = Math.max(30, 100 - (effectiveTotalYears - maxYearsReq) * 15);
    }

    // Pillar 2: Role
    let roleScore = 0;
    const jobTitleLower = (aiReqs?.roleTitle || "Sales Executive").toLowerCase();
    const fluffWords = ['manager', 'senior', 'junior', 'lead', 'head', 'chief', 'executive', 'specialist', 'associate', 'representative', 'assistant', 'coordinator', 'officer'];
    const jobTitleWords = jobTitleLower.split(/[\s-]+/).filter(w => w.length > 2 && !fluffWords.includes(w));

    const currentTitle = (resume.experience[0]?.position || '').toLowerCase();
    const allTitles = resume.experience.map(e => e.position.toLowerCase()).join(' ');

    const titleMatches = jobTitleWords.filter(word => {
        const wordRegex = new RegExp(`\\b${escapeRegExp(word)}\\b`, 'i');
        return wordRegex.test(allTitles);
    });

    const baseRoleScore = jobTitleWords.length > 0 ? Math.round((titleMatches.length / jobTitleWords.length) * 100) : 50;
    const matchesCurrent = jobTitleWords.some(word => new RegExp(`\\b${escapeRegExp(word)}\\b`, 'i').test(currentTitle));

    if (matchesCurrent) {
        roleScore = baseRoleScore;
    } else {
        roleScore = Math.round(baseRoleScore * 0.4);
    }

    // Pillar 3: Industry
    let industryScore = 0;
    const relevantResumeYears = 0.5; // Hypothetical small relevance
    const relevanceRatio = effectiveTotalYears > 0 ? (relevantResumeYears / effectiveTotalYears) : 0;
    industryScore = Math.min(100, Math.round(relevanceRatio * 150));

    if (domainMismatch) {
        industryScore = Math.min(industryScore, 30);
    } else if (partialMatchDomain) {
        industryScore = Math.min(industryScore, 70);
    }

    // Final Calc
    let experienceScore = Math.round(
        (durationScore * 0.4) +
        (roleScore * 0.3) +
        (industryScore * 0.3)
    );

    const totalRelevance = (roleScore * 0.6) + (industryScore * 0.4);
    const isCarrerPivot = totalRelevance < 50 || (roleScore < 30 && industryScore < 30);

    if (isCarrerPivot) {
        experienceScore = Math.round(experienceScore * 0.3);
    }

    return { durationScore, roleScore, industryScore, experienceScore, isCarrerPivot };
}

const mockResume = {
    experience: [{ position: "Senior Recruiter" }]
};

const result = calculateScore(8.3, 1, 3, mockResume, "", {}, [], {}, true, false);
console.log(result);
