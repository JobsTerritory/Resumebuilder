
function extractEducationLevel(text: string): number {
    const lowerText = text.toLowerCase();

    // PhD / Doctorate
    if (/\b(ph\.?\s*d|doctorate|doctoral|dr\.)\b/.test(lowerText)) return 3;

    // Masters: MBA, M.S., M.A., Master's, MTech, MCA, M.Com, M.Sc, PGDM etc.
    if (/\b(master|mba|m\.?\s*s\.?|m\.?\s*a\.?|m\.?\s*tech|mca|m\.?\s*com|m\.?\s*sc|m\.?\s*e\.?|post\s*grad|pg\s*diploma|pgdm|pgd)\b/.test(lowerText)) return 2;

    // Bachelors: B.S., B.A., B.Tech, BCA, BBA, B.Com, B.Sc, B.E., Bachelor
    if (/\b(bachelor|b\.?\s*s\.?|b\.?\s*a\.?|b\.?\s*tech|bca|bba|b\.?\s*com|b\.?\s*sc|b\.?\s*e\.?|b\.?arch|b\.?pharma|undergrad|graduate)\b/.test(lowerText)) return 1;

    return 0; // No specific degree found
}

const tests = [
    "B.Com",
    "B Com",
    "BCom",
    "Bachelor of Commerce",
    "MBA",
    "M.Sc",
    "M Sc",
    "MSc",
    "Master of Science",
    "B.Tech",
    "B Tech",
    "B.E.",
    "B. E.",
    "BCA",
    "MCA",
    "PGDM",
    "PhD",
    "Ph.D",
    "Ph. D"
];

tests.forEach(t => {
    console.log(`"${t}" -> Level ${extractEducationLevel(t)}`);
});
