import OpenAI from 'openai';
import { Resume } from "../types";

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

let openai: OpenAI | null = null;

if (apiKey) {
    openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
    });
    console.log("OpenAI Service Initialized for resume parsing");
} else {
    console.log("OpenAI API Key missing - AI features disabled");
}

export async function parseResumeWithAI(text: string): Promise<Partial<Resume> | null> {
    console.log('[AI] parseResumeWithAI called, client status:', !!openai);

    if (!openai) {
        console.warn("[AI] OpenAI client not initialized - API key missing");
        return null;
    }

    console.log('[AI] Sending request to OpenAI API...');

    const systemPrompt = `You are an expert Resume Parser. Extract structured data from resume text and return ONLY a valid JSON object matching this schema:

{
  "industry": "string",
  "personal_info": {
    "fullName": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "title": "string",
    "linkedin": "string",
    "portfolio": "string",
    "dateOfBirth": "string",
    "customFields": [{"label": "label", "value": "value"}]
  },
  "summary": "string (preserve original formatting)",
  "experience": [{
    "company": "string",
    "position": "string",
    "startDate": "string",
    "endDate": "string",
    "current": "boolean",
    "location": "string",
    "description": "string"
  }],
  "internships": [{
    "company": "string",
    "position": "string",
    "startDate": "string",
    "endDate": "string",
    "current": "boolean",
    "location": "string",
    "description": "string"
  }],
  "education": [{
    "institution": "string",
    "degree": "string",
    "field": "string",
    "startDate": "string",
    "endDate": "string",
    "gpa": "string"
  }],
  "skills": ["string"],
  "languages": [{"name": "string", "proficiency": "string"}],
  "certifications": [{"name": "string", "issuer": "string", "date": "string"}],
  "interests": ["string"],
  "projects": [{
    "name": "string",
    "description": "string",
    "technologies": ["string"],
    "startDate": "string",
    "endDate": "string"
  }],
  "additional_info": "string"
}

CRITICAL INSTRUCTIONS:
1. Extract ALL fields from the ENTIRE resume text (may be multi-column layout)
2. Carefully distinguish Education (colleges, degrees) from Work Experience (companies, jobs)
3. Format dates as MMM YYYY or YYYY
4. Set current: true for "Present", "Current", or "TILL DATE" roles
5. Extract ALL skills from anywhere in the resume
6. Return ONLY the JSON object, NO BOLDING or markdown. Use '•' for bullets.
7. ZERO DATA LOSS: Absolute priority is matching the input text content perfectly.
8. MISCELLANEOUS DATA: If you find sections like "Volunteer Work", "Achievements", "Awards", "Publications", or "Hobbies", put them into 'additional_info'. DO NOT SKIP ANY CONTENT.
9. GROUPING: Ensure each Education entry is a single, complete record. (e.g., Degree, Board, and Score MUST be in the same record).
10. BULLET POINTS: Preserve every single achievement in Experience/Projects as a separate bullet point. Use '•' for each point.
11. SUMMARY FORMATTING: Preserve the original structure of the content. If it is a paragraph, keep it as a paragraph. If it is a list, keep it as a list. DO NOT force bullet points on a summary paragraph.
12. NO MARKDOWN: If you see bolding in the source text, IGNORE it. Return plain text only.`;

    try {
        console.log('[AI] Calling OpenAI API...');
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Parse this resume:\n\n${text.slice(0, 12000)}` }
            ],
            temperature: 0,
            response_format: { type: "json_object" }
        });

        const textOutput = completion.choices[0].message.content || '{}';
        console.log('[AI] Raw API response length:', textOutput.length);
        console.log('[AI] Raw API response (first 500 chars):', textOutput.substring(0, 500));

        const parsedData = JSON.parse(textOutput);
        console.log('[AI] Successfully parsed response. Keys:', Object.keys(parsedData));
        return parsedData;

    } catch (error: any) {
        console.error("[AI] ERROR occurred!");
        console.error("[AI] Error message:", error?.message);
        console.error("[AI] Full error:", error);

        if (error?.message?.includes('API key')) {
            alert('❌ OpenAI API Key is invalid or expired');
        } else if (error?.message?.includes('quota')) {
            alert('❌ OpenAI API quota exceeded');
        } else {
            alert('❌ AI Error: ' + error?.message);
        }

        return null;
    }
}
