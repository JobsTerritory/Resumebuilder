
const educationLevels = {
    PHD: 3,
    MASTERS: 2,
    BACHELORS: 1,
    NONE: 0
};

function extractEducationLevel(text) {
    const lowerText = text.toLowerCase();

    // PhD / Doctorate
    if (/\b(ph\.?\s*d|doctorate|doctoral|dr\.)\b/.test(lowerText)) return 3;

    // Masters: MBA, M.S., M.A., Master's, MTech, MCA, M.Com, M.Sc, PGDM, PGP etc.
    if (/\b(master|mba|m\.?\s*s\.?|m\.?\s*a\.?|m\.?\s*tech|mca|m\.?\s*com|m\.?\s*sc|m\.?\s*e\.?|post\s*grad|pg\s*diploma|pgdm|pgd|pgp|pgpm)\b/i.test(lowerText) ||
        /\bpost\s*graduate\b/i.test(lowerText)) return 2;

    // Bachelors: B.S., B.A., B.Tech, BCA, BBA, B.Com, B.Sc, B.E., Bachelor, BMS
    if (/\b(bachelor|b\.?\s*s\.?|b\.?\s*a\.?|b\.?\s*tech|bca|bba|b\.?\s*com|b\.?\s*sc|b\.?\s*e\.?|b\.?arch|b\.?pharma|bms|b\.?m\.?s\.?|undergrad|graduate)\b/i.test(lowerText)) return 1;

    return 0; // No specific degree found
}

const testText = "Post Graduate Program in Management (Human Resources), Bachelor of Management Studies (Human Resources), Higher Secondary Certificate (12th), Secondary School Certificate (10th)";
console.log("Input:", testText);
console.log("Extracted Level:", extractEducationLevel(testText));
console.log("Expected: 2 (Masters for PGP) or at least 1 (Bachelors for BMS)");

if (extractEducationLevel(testText) < 2) {
    console.log("❌ FAILED: Level too low");
} else {
    console.log("✅ PASSED");
}
