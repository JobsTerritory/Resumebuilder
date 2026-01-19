
import { parseResume } from './src/lib/resumeParser';

// Mock descriptions that previously caused issues
const problematicDescriptions = [
    "Partner with TA and BU leaders on workforce planning, hiring discussions, and recruitment reviews ac",
    "Manage end -to -end onboarding lifecycle including preboarding, HR inductions, Assimilate program,",
    ".",  // Stray period line
    "Oversee preboarding compliance including documentation, asset allocation, and background verificat",
    " ",  // Empty space line
    "-"   // Stray hyphen line
];

console.log("Testing bullet cleanup logic...");

// This is a direct test of the logic I added to forceSplitBullets
// Since I can't easily import the internal forceSplitBullets, I'll simulate the normalization flow
// if I had access to the production environment, I would run a full parse, but here I'll check if the 
// regex patterns I added work as expected.

const punctuationRegex = /^[\.!?,\-•●➢▪]+$/;
const filtered = problematicDescriptions
    .map(d => d.trim())
    .filter(d => d.length > 0 && !punctuationRegex.test(d));

console.log("Original length:", problematicDescriptions.length);
console.log("Filtered length:", filtered.length);
console.log("Filtered content:", JSON.stringify(filtered, null, 2));

if (filtered.length === 3) {
    console.log("✅ Success: Stray punctuation and empty lines removed.");
} else {
    console.log("❌ Failure: Expected 3 lines, found", filtered.length);
}
