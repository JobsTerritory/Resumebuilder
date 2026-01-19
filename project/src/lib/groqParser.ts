// FREE AI PARSING USING GROQ (Fast & Free Tier Available)
// Get your free API key at: https://console.groq.com/keys

import { Resume } from "../types";

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

export async function parseResumeWithGroq(text: string): Promise<Partial<Resume> | null> {
    if (!GROQ_API_KEY) {
        console.warn("[GROQ] API key not configured");
        return null;
    }

    console.log('[GROQ] Sending request to Groq API (FREE)...');

    const systemPrompt = `Extract resume data and return ONLY valid JSON matching this schema:
{
  "industry": "",
  "personal_info": {
    "fullName": "", "email": "", "phone": "", "location": "", "linkedin": "", "portfolio": "", "title": "",
    "dateOfBirth": "", "customFields": [{"label": "Status", "value": "Married"}]
  },
  "summary": "",
  "experience": [{"company": "", "position": "", "startDate": "", "endDate": "", "current": false, "location": "", "description": ""}],
  "internships": [{"company": "", "position": "", "startDate": "", "endDate": "", "current": false, "location": "", "description": ""}],
  "education": [{"institution": "", "degree": "", "field": "", "startDate": "", "endDate": "", "score": ""}],
  "skills": [], "languages": [{"name": "", "proficiency": ""}], "certifications": [{"name": "", "issuer": "", "date": ""}], "interests": [], "projects": [{"name": "", "description": "", "technologies": [], "startDate": "", "endDate": ""}],
  "additional_info": "Capture any sections NOT covered above (e.g. Volunteer Work, Achievements, Publications, References, etc.)"
}
CRITICAL: Extract ALL data from multi-column layouts. Distinguish Education from Work Experience. 
INTERNSHIPS: Extract internships into their OWN 'internships' array. DO NOT mix them with 'experience'.
BOLD FORMATTING: You MUST PRESERVE bold formatting in the source text. If you see text wrapped in double asterisks like **this**, keep the asterisks in the extracted strings.
BULLETS vs BOLD: Use '•' EXCLUSIVELY for bullet points. NEVER use '*' for bullets. Do NOT split lines just because bolding starts.
ZERO DATA LOSS: Ensure 100% extraction fidelity. Do not summarize or skip details. Long resumes are acceptable.
GROUPING: Ensure each Education entry is a single, complete record. (e.g., Degree, Board, and Score MUST be in the same record).
BULLET POINTS: Preserve every single achievement as a separate bullet point. NEVER merge or summarize points into paragraphs. Use '•' for each point. (Recognize •, ●, ➢, ▪ as bullet markers).
LINE MERGING: PDF copy-paste often introduces artificial line breaks inside sentences (e.g., "managing\n\na team"). You MUST join these continuation lines into a single coherent sentence or bullet point. ONLY treat a line breach as a new point if it starts with a bullet character (•, ●, etc.) or if there is a clear semantic shift.
NUMBERED LISTS: PDF extraction often merges numbered lists into a single line (e.g., "1. Task A 2. Task B"). You MUST split these into individual lines or bullets.
HYPHENS: If a line ends with a hyphen (e.g., "Manage-") or starts with one followed by a word (e.g., "-ment"), merge them correctly (e.g., "Management").
MISCELLANEOUS DATA: If you find sections like "Volunteer Work", "Achievements", "Awards", "Publications", or "Hobbies", put them into 'additional_info'. DO NOT SKIP ANY CONTENT.`;

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile", // Fast & accurate
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: `Parse this resume:\n\n${text.slice(0, 15000)}` }
                ],
                temperature: 0.1,
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            throw new Error(`Groq API error: ${response.status}`);
        }

        const data = await response.json();
        const textOutput = data.choices[0].message.content;
        const parsedData = JSON.parse(textOutput);

        console.log('[GROQ] ✅ Successfully parsed with FREE AI');
        return parsedData;

    } catch (error: any) {
        console.error("[GROQ] Error:", error.message);
        return null;
    }
}
