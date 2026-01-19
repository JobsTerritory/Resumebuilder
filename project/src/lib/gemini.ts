import { GoogleGenerativeAI } from "@google/generative-ai";
import { Resume } from "../types";

// Helper to get env vars reliably in both Vite and Node
const getEnv = (key: string) => {
  try {
    return import.meta.env[key] || (process?.env ? process.env[key] : undefined);
  } catch {
    return (process?.env ? process.env[key] : undefined);
  }
};

const apiKey = getEnv('VITE_GEMINI_API_KEY');
const modelName = getEnv('VITE_GEMINI_MODEL') || 'gemini-2.0-flash';

/**
 * Robustly extracts JSON from an AI response string, handling markdown blocks
 * and potential conversational noise.
 */
function cleanJsonOutput(text: string): string {
  let cleaned = text.trim();

  // Remove markdown code blocks if present
  if (cleaned.includes('```')) {
    const match = cleaned.match(/```json\s?([\s\S]*?)\s?```/) || cleaned.match(/```\s?([\s\S]*?)\s?```/);
    if (match && match[1]) {
      cleaned = match[1].trim();
    } else {
      cleaned = cleaned.replace(/```json/g, '').replace(/```/g, '').trim();
    }
  }

  // If there's still noise before/after the JSON object
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  return cleaned;
}

export function normalizeParsedData(data: any): Partial<Resume> {
  const normalized: any = { ...data };

  // Handle common AI key hallucinations for Experience
  const expKeys = ['experience', 'workHistory', 'work_experience', 'employment', 'jobs', 'career', 'professionalExperience', 'professional_experience'];
  let experiences = [];
  for (const key of expKeys) {
    if (Array.isArray(normalized[key]) && normalized[key].length > 0) {
      experiences = normalized[key];
      break;
    }
  }

  // Handle common AI key hallucinations for Internships
  const internKeys = ['internships', 'intern_history', 'training', 'internships_array', 'internship_experience'];
  let internships = [];
  for (const key of internKeys) {
    if (Array.isArray(normalized[key]) && normalized[key].length > 0) {
      internships = normalized[key];
      break;
    }
  }

  // Re-categorize: If an experience entry looks like an internship, move it
  const internKeywords = /\bintern\b|\btrainee\b|\btraining\b|summer analyst|winter analyst/i;

  const actualExperience = experiences.filter((exp: any) => {
    const isIntern = internKeywords.test(String(exp.position || '')) || internKeywords.test(String(exp.company || ''));
    if (isIntern) {
      internships.push(exp);
      return false;
    }
    return true;
  });

  normalized.experience = actualExperience;
  normalized.internships = internships;
  normalized.industry = normalized.industry || '';

  // Summary mapping - fix nesting bug (AI often puts it in personal_info)
  const pi = normalized.personal_info || {};
  normalized.summary = normalized.summary || pi.summary || normalized.professional_summary || normalized.about_me || '';

  // Personal Info normalization - Ensuring no nulls/undefined
  normalized.personal_info = {
    fullName: pi.fullName || '',
    email: pi.email || '',
    phone: pi.phone || '',
    location: pi.location || '',
    title: pi.title || normalized.title || '',
    linkedin: pi.linkedin || normalized.linkedin || '',
    portfolio: pi.portfolio || normalized.portfolio || '',
    profilePicture: pi.profilePicture || '',
    dateOfBirth: pi.dateOfBirth || '',
    customFields: Array.isArray(pi.customFields) ? pi.customFields : []
  };
  normalized.detected_design = normalized.detected_design || normalized.original_design || normalized.layout_description || '';

  // Custom Theme Normalization
  const ct = normalized.custom_theme || {};
  normalized.custom_theme = {
    primaryColor: ct.primaryColor || '',
    secondaryColor: ct.secondaryColor || '',
    fontFamily: (['serif', 'sans-serif', 'mono'].includes(ct.fontFamily) ? ct.fontFamily : 'sans-serif'),
    layout: (['single-column', 'two-column-sidebar', 'timeline', 'modern', 'two-column'].includes(ct.layout) ? ct.layout : 'single-column'),
    spacing: (['compact', 'comfortable', 'airy'].includes(ct.spacing) ? ct.spacing : 'comfortable')
  };

  normalized.additional_info = normalized.additional_info || '';

  // Handle common AI key hallucinations for Education
  const eduKeys = ['education', 'academic', 'academicHistory', 'educational_background', 'qualifications', 'credentials', 'training_and_education', 'academic_background', 'studies', 'schooling', 'degree_info'];
  if (!Array.isArray(normalized.education) || normalized.education.length === 0) {
    for (const key of eduKeys) {
      if (Array.isArray(normalized[key]) && normalized[key].length > 0) {
        normalized.education = normalized[key];
        break;
      }
    }
  }

  // Handle specific cases where AI might return a single string for list sections
  ['experience', 'internships', 'education', 'projects'].forEach(key => {
    if (typeof normalized[key] === 'string' && normalized[key].trim().length > 0) {
      normalized[key] = [{
        description: normalized[key],
        // Set fallback values for required fields to avoid 'Unknown' everywhere if possible
        ...(key === 'projects' ? { name: 'Project' } : { company: 'Experience Entry', position: 'Professional Role' })
      }];
    }
  });

  const arrays = ['experience', 'education', 'skills', 'projects', 'certifications', 'languages', 'interests'];
  arrays.forEach(key => {
    // If it's a single object instead of an array, wrap it
    if (normalized[key] && !Array.isArray(normalized[key]) && typeof normalized[key] === 'object') {
      normalized[key] = [normalized[key]];
    }

    if (!Array.isArray(normalized[key])) {
      if (typeof normalized[key] === 'string' && normalized[key].trim().length > 0) {
        // Convert comma/bullet/newline separated string to array
        const rawItems = normalized[key]
          .split(/[,•●\n]/)
          .map((s: string) => s.trim())
          .filter(Boolean);

        // EXTRA FIDELITY: If a section that expects objects (like education/experience) gets strings,
        // convert those strings to basic objects so they are not lost in the next mapping step.
        if (['education', 'experience', 'internships', 'projects'].includes(key)) {
          normalized[key] = rawItems.map((item: string) => {
            if (key === 'education') return { degree: item };
            if (key === 'projects') return { name: item };
            return { description: item };
          });
        } else {
          normalized[key] = rawItems;
        }
      } else {
        normalized[key] = [];
      }
    } else {
      // If it IS an array, check if elements are strings and convert if needed for object-expecting keys
      if (['education', 'experience', 'internships', 'projects'].includes(key)) {
        normalized[key] = normalized[key].map((item: any) => {
          if (typeof item === 'string') {
            if (key === 'education') return { degree: item };
            if (key === 'projects') return { name: item };
            return { description: item };
          }
          return item;
        });
      }
    }
  });

  // Add IDs and ensure structure for list items
  normalized.experience = normalized.experience.map((exp: any) => ({
    id: exp.id || Math.random().toString(36).substr(2, 9),
    company: exp.company || '',
    position: exp.position || '',
    location: exp.location || '',
    startDate: exp.startDate || '',
    endDate: exp.endDate || '',
    current: !!exp.current,
    description: Array.isArray(exp.description)
      ? exp.description.filter(Boolean).map((s: any) => String(s).trim()).join('\n')
      : String(exp.description || '').split('\n').map(s => s.trim()).filter(Boolean).join('\n'),
    technologies: Array.isArray(exp.technologies) ? exp.technologies : []
  }));

  normalized.internships = normalized.internships.map((exp: any) => ({
    id: exp.id || Math.random().toString(36).substr(2, 9),
    company: exp.company || '',
    position: exp.position || '',
    location: exp.location || '',
    startDate: exp.startDate || '',
    endDate: exp.endDate || '',
    current: !!exp.current,
    description: Array.isArray(exp.description)
      ? exp.description.filter(Boolean).map((s: any) => String(s).trim()).join('\n')
      : String(exp.description || '').split('\n').map(s => s.trim()).filter(Boolean).join('\n'),
    technologies: Array.isArray(exp.technologies) ? exp.technologies : []
  }));

  normalized.education = normalized.education.map((edu: any) => ({
    id: edu.id || Math.random().toString(36).substr(2, 9),
    institution: edu.institution || '',
    degree: edu.degree || '',
    field: edu.field || edu.fieldOfStudy || '',
    location: edu.location || '',
    startDate: edu.startDate || '',
    endDate: edu.endDate || '',
    current: !!edu.current,
    gpa: edu.gpa || '',
    description: Array.isArray(edu.description)
      ? edu.description.filter(Boolean).map((s: any) => String(s).trim()).join('\n')
      : String(edu.description || '').split('\n').map(s => s.trim()).filter(Boolean).join('\n')
  }));

  normalized.projects = normalized.projects.map((proj: any) => ({
    id: proj.id || Math.random().toString(36).substr(2, 9),
    name: proj.name || '',
    description: Array.isArray(proj.description)
      ? proj.description.filter(Boolean).map((s: any) => String(s).trim()).join('\n')
      : String(proj.description || '').split('\n').map(s => s.trim()).filter(Boolean).join('\n'),
    technologies: Array.isArray(proj.technologies) ? proj.technologies : [],
    startDate: proj.startDate || '',
    endDate: proj.endDate || ''
  }));

  normalized.languages = normalized.languages.map((lang: any) => {
    if (typeof lang === 'string') {
      return { id: Math.random().toString(36).substr(2, 9), name: lang, proficiency: 'Full Professional' };
    }
    return {
      id: lang.id || Math.random().toString(36).substr(2, 9),
      name: lang.name || '',
      proficiency: lang.proficiency || lang.level || 'Full Professional'
    };
  });

  normalized.certifications = normalized.certifications.map((cert: any) => ({
    id: cert.id || Math.random().toString(36).substr(2, 9),
    name: cert.name || '',
    issuer: cert.issuer || '',
    date: cert.date || ''
  }));

  // Ensure skills and interests are flat arrays of strings
  normalized.skills = normalized.skills.flatMap((s: any) => {
    const val = typeof s === 'string' ? s : String(s.name || s.label || s);
    return val.split(/[,|/•●]/).map(t => t.trim()).filter(Boolean);
  });
  normalized.interests = normalized.interests.flatMap((i: any) => {
    const val = typeof i === 'string' ? i : String(i.name || i.label || i);
    return val.split(/[,|/•●]/).map(t => t.trim()).filter(Boolean);
  });

  // Ensure section_order is valid and contains all required sections
  const defaultOrder = ['summary', 'experience', 'internships', 'education', 'skills', 'projects', 'certifications', 'languages', 'additional'];
  if (!Array.isArray(normalized.section_order)) {
    normalized.section_order = defaultOrder;
  } else {
    // Merge provided order with missing required sections
    const provided = normalized.section_order.filter((s: any) => defaultOrder.includes(s));
    const missing = defaultOrder.filter(s => !provided.includes(s));
    normalized.section_order = [...provided, ...missing];
  }

  // Preserve AI Analysis if present
  if (normalized.ai_analysis) {
    normalized.ai_analysis = {
      overall_score: Number(normalized.ai_analysis.overall_score || normalized.ai_analysis.score || 0),
      detailed_feedback: Array.isArray(normalized.ai_analysis.detailed_feedback) ? normalized.ai_analysis.detailed_feedback :
        (Array.isArray(normalized.ai_analysis.feedback) ? normalized.ai_analysis.feedback :
          (typeof normalized.ai_analysis.feedback === 'string' ? [normalized.ai_analysis.feedback] : []))
    };
  }

  normalized.additional_info = normalized.additional_info || '';

  // Final check: Remove any null/undefined fields and replace with empty strings
  const recursiveClean = (obj: any) => {
    for (const key in obj) {
      if (obj[key] === null || obj[key] === undefined) {
        obj[key] = '';
      } else if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
        recursiveClean(obj[key]);
      }
    }
  };
  recursiveClean(normalized);

  console.log('[NORMALIZER] AI Extraction Counts:', {
    exp: normalized.experience?.length || 0,
    intern: normalized.internships?.length || 0,
    edu: normalized.education?.length || 0,
    skills: normalized.skills?.length || 0
  });

  return normalized;
}

export async function parseResumeWithGemini(text: string): Promise<Partial<Resume> | null> {
  if (!apiKey) {
    console.warn("[GEMINI] API key not configured");
    return null;
  }

  console.log(`[GEMINI] Calling Gemini AI (${modelName})...`);

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: 0,
        topP: 0.95,
        maxOutputTokens: 8192,
      }
    });

    const systemPrompt = `Extract resume data into a structured JSON format. 
Return ONLY the JSON object, NO markdown.

CRITICAL: ZERO DATA LOSS. Your absolute priority is 100% extraction fidelity.
  - **ABSOLUTE STRUCTURAL FIDELITY**: You MUST maintain the exact line-by-line structure provided in the input.
    - **ONE INPUT LINE = ONE OUTPUT BULLET**. Never merge separate lines from the source text into a single string or paragraph.
    - **NUCLEAR RULE: PERIOD + CAPITAL = NEW BULLET**: If you see a sentence ending with a period (.) followed by a word starting with a Capital letter, you MUST treat them as TWO SEPARATE bullet points. Example: "Created plans. Developed strategy." MUST become TWO bullets: ["Created plans.", "Developed strategy."]
    - The source text has been pre-processed to ensure each accomplishment is on its own line. YOUR JOB is to preserve this 1:1 mapping.
    - If there are 5 lines of bullet points in a section of the input, there MUST be 5 separate strings in the corresponding 'description' array in the JSON.
    - **ZERO SUMMARIZATION**: Never combine lines or "summarize" for brevity. Each line is legally mandatory.
    - **NO ACROYNM SPLITTING**: Do NOT split a bullet point just because it contains capitalized acronyms or internal periods (e.g., "MFIs. Trained..."). If the line was delivered as one unit, keep it as one unit.
  - Fidelity: Results must mirror the original resume's content with 100% precision. Total line count in 'description' arrays MUST match the pre-processed input segment line count.


IMPORTANT:
1. Capture EVERY experience, internship, project, education, and certification entry with 100% detail.
2. INTERNSHIPS: Extract internships into their OWN 'internships' array. DO NOT mix them with 'experience'.
   - If a section is titled "Internship" or "Training", put those entries in 'internships'.
3. UNIFORM BULLETS: In 'summary', 'experience', 'internships', and 'projects', represent list item markers using the '•' character ONLY for items that were originally bullets.
4. ZERO DATA LOSS: Absolute priority is 100% extraction fidelity. Long resumes (2-3 pages) are perfectly acceptable. DO NOT summarize or truncate.
5. EDUCATION EXTRACTION:
   - **DEGREE vs INSTITUTION**: Never merge the Degree title and the College/University name into one field.
   - **TYPO CORRECTION**: If the text says "Batchelor", "Bachelour", or similar, extract it correctly as "Bachelor".
   - **COMPLETENESS**: If you see degree-like text (e.g. Master's, MBA, B.Tech, DCA, BCA), capture it as the 'degree' even if the field of study is vague.
6. EXTRACT EVERYTHING: Even one-line achievements and minor roles.
7. Technical Skills: Extract EVERY keyword.
8. GPA/Percentage: Capture it in the 'gpa' field of the corresponding education entry. DO NOT create new entries for percentages.
9. DATES: Extract EXACT years as shown in the text. DO NOT hallucinate, change, or truncate years. If text says 2024, return 2024. NEVER return "2001" unless it specifically appears in the source text.
   - The current date is Tuesday, December 23, 2025. Use this only for "Present" calculations, but prioritize extraction.
9. IGNORE META-TEXT: Do not include user complaints, instructions, or questions in the extraction.
10. MISCELLANEOUS DATA: If you find sections like "Volunteer Work", "Achievements", "Awards", "Publications", "Hobbies", "Scholarships", "Activities", "Memberships", or any other text that doesn't fit the standard fields below, DO NOT DISCARD IT. Put it into 'additional_info'.
11. AI ANALYSIS:
    - Provide an "overall_score" (0-100) based on resume completeness, professional tone, and structural quality.
    - In "detailed_feedback", list exactly what is missing or can be improved (e.g., "Summary is missing", "No quantifiable metrics found", "Skills section is too brief").
    - Be critical. A good resume should have a summary, detailed experience with dates, and a clear skills list.

Required JSON Structure:
{
  "industry": "General domain (e.g. Engineering, Sales, Recruitment, Marketing, Finance)",
  "personal_info": {
    "fullName": "", "email": "", "phone": "", "location": "", "title": "",
    "linkedin": "", "portfolio": "", "dateOfBirth": "",
    "customFields": [{"label": "Marital Status", "value": "Single"}]
  },
  "summary": "Full professional summary (preserve paragraph vs bullets)",
  "experience": [
    {
      "company": "", "position": "", "location": "", "startDate": "", "endDate": "", 
      "current": false, "description": "Preserve all bullet points here", "technologies": []
    }
  ],
  "internships": [
    {
      "company": "", "position": "", "location": "", "startDate": "", "endDate": "", 
      "current": false, "description": "Preserve all bullet points here", "technologies": []
    }
  ],
  "education": [
    {
      "institution": "", "degree": "", "field": "", "location": "", 
      "startDate": "", "endDate": "", "current": false, "gpa": "Extract GPA here"
    }
  ],
  "skills": ["Skill1", "Skill2", "..."],
  "projects": [
    {
      "name": "", "description": "Preserve all bullet points here", "technologies": [], "startDate": "", "endDate": ""
    }
  ],
  "certifications": [{"name": "Extracted Title", "issuer": "Extracted Issuer", "date": "Date"}],
  "languages": [{"name": "Language", "proficiency": "Full Professional"}],
  "interests": ["Interest 1", "..."],
  "additional_info": "Capture any sections NOT covered above here (e.g. Volunteer Work, Achievements, Publications, Scholarships, References, etc.). DO NOT SKIP ANY DATA.",
  "ai_analysis": {
    "overall_score": 0-100,
    "detailed_feedback": ["Point 1", "Point 2"]
  },
  "custom_theme": {
    "primaryColor": "Hex color if detected (e.g. #2563eb), else empty",
    "secondaryColor": "Hex color if detected, else empty",
    "fontFamily": "serif | sans-serif | mono",
    "layout": "single-column | two-column-sidebar | timeline | modern | two-column",
    "spacing": "compact | comfortable | airy"
  },
  "detected_design": "A brief description of the original resume's layout and style (e.g., 'Modern two-column with sidebar', 'Classic single-column serif', 'Minimalist sans-serif', etc.)"
}
12. DESIGN DETECTION: Characterize the original resume's visual layout and font style in the 'detected_design' field. This helps us replicate the original feeling.`;

    const prompt = `${systemPrompt}\n\nResume Text:\n${text}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textOutput = response.text();

    if (!textOutput) {
      console.error('[GEMINI] Empty response');
      return null;
    }

    // Clean JSON if it accidentally contains markdown
    let jsonStr = textOutput.trim();
    if (jsonStr.includes('```')) {
      jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
    }

    const parsedData = JSON.parse(jsonStr);
    const normalizedData = normalizeParsedData(parsedData);

    console.log('[GEMINI] ✅ Successfully parsed and normalized with AI Analysis');
    return normalizedData;

  } catch (error: any) {
    console.error("[GEMINI] Error:", error);
    return null;
  }
}

export async function generateAIContent(prompt: string, context?: string): Promise<{ content: string; tips: string[] }> {
  if (!apiKey) return { content: '', tips: [] };

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

    const fullPrompt = `You are a professional resume writer.
Generate professional, impactful resume content based on this request: "${prompt}".
Context of the resume so far: "${context || 'None'}"

Rules:
1. Use strong action verbs.
2. Keep it professional and results-oriented.
3. If it's a summary, keep it concise (2-4 sentences).
4. Provide exactly 4 professional tips for this specific content.

Return ONLY a JSON object:
{
  "content": "the generated text",
  "tips": ["Tip 1", "Tip 2", "Tip 3", "Tip 4"]
}`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    let text = response.text().trim();
    if (text.includes('```')) {
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    }

    return JSON.parse(text);
  } catch (error) {
    console.error("[GEMINI GENERATE] Error:", error);
    return { content: 'Error generating content. Please try again.', tips: [] };
  }
}

export async function improveText(text: string): Promise<{ content: string; tips: string[] }> {
  if (!apiKey || !text) return { content: text, tips: [] };

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: { temperature: 0.1 }
    });

    const fullPrompt = `You are a professional resume writer.
Improve and professionalize the following resume text: "${text}".

Rules:
1. Fix grammar and phrasing.
2. Use strong action verbs.
3. Make it more impactful and ATS-friendly.
4. Provide 4 tips on why these changes were made.
5. NO BOLDING: Return plain text only, no markdown stars or bolding.

Return ONLY a JSON object:
{
  "content": "the improved text",
  "tips": ["Tip 1", "Tip 2", "Tip 3", "Tip 4"]
}`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    let output = response.text().trim();
    if (output.includes('```')) {
      output = output.replace(/```json/g, '').replace(/```/g, '').trim();
    }

    return JSON.parse(output);
  } catch (error) {
    console.error("[GEMINI IMPROVE] Error:", error);
    return { content: text, tips: ['Error improving text.'] };
  }
}

export async function rewriteForJob(text: string, jobDescription: string, sectionName: string, mustInclude: string[] = []): Promise<string> {
  if (!apiKey || !text || !jobDescription) return text;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: { temperature: 0.1 }
    });

    const keywordsInstruction = mustInclude.length > 0
      ? `8. CRITICAL: You MUST naturally and professionally include the following keywords/skills in the rewritten text: "${mustInclude.join('", "')}". Do not just list them; integrate them into sentences.`
      : '';

    const fullPrompt = `You are a world-class resume optimizer.
Your goal is to rewrite the ${sectionName} of a candidate's resume to better align with the following Job Description and maximize the ATS match score.

Job Description:
"""
${jobDescription.slice(0, 5000)}
"""

Candidate's Current ${sectionName}:
"""
${text}
"""

SCORE PROTECTION RULES:
1. **NEVER remove metrics**: You must preserve every percentage (%), dollar amount ($), and numerical value found in the original content.
2. **NEVER remove core technical keywords**: All technologies and tools mentioned in the original must be kept.
3. **Enhance Alignment**: Aggressively weave in skills and achievements relevant to the JD while maintaining 100% truthfulness.

Instructions:
1. Rewrite the content to highlight relevant skills and experiences mentioned in the JD.
2. Maintain professional tone and use strong action verbs.
3. Keep the length similar to the original.
4. DO NOT lie or hallucinate new titles or companies. ONLY rephrase existing experience.
5. If it's a summary, ensure it's punchy and tailored.
6. If it's work experience, focus on results and impact relevant to the target role.
7. NO BOLDING: Return plain text only, no markdown stars or bolding. Use '•' for bullets.
${keywordsInstruction}

Return ONLY the rewritten text, no markdown, no quotes.`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text().trim().replace(/^["']|["']$/g, '');
  } catch (error) {
    console.error("[GEMINI REWRITE] Error:", error);
    return text;
  }
}

export async function generateCoverLetter(resume: Resume, jobDescription: string): Promise<string> {
  if (!resume || !jobDescription) {
    console.warn("[GEMINI COVER LETTER] Incomplete input: resume or JD missing");
    return '';
  }

  if (!apiKey) {
    console.warn("[GEMINI COVER LETTER] API key not configured");
    return "API key missing. Please check your .env file.";
  }

  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  console.log(`[GEMINI COVER LETTER] Calling Gemini AI (${modelName})...`);

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

    const resumeTxt = JSON.stringify({
      personal_info: resume.personal_info,
      summary: resume.summary,
      experience: resume.experience,
      internships: resume.internships,
      education: resume.education,
      skills: resume.skills,
      projects: resume.projects
    }, null, 2);

    const fullPrompt = `You are a professional career coach and expert cover letter writer.
Your task is to write a highly tailored, persuasive, and professional cover letter for the candidate based on their resume and the target job description.

JOB DESCRIPTION:
"""
${jobDescription.slice(0, 4000)}
"""

CANDIDATE RESUME DATA:
"""
${resumeTxt.slice(0, 8000)}
"""

INSTRUCTIONS:
1. Write a SHORT, PUNCHY cover letter (Under 150 words).
2. Structure:
   - Header: Candidate Name, Email, Phone, Date: ${today}.
   - Salutation: Dear Hiring Manager.
   - Body: ONE single, powerful paragraph. Immediately state the role. Focus ONLY on the candidate's LATEST experience or most impressive recent achievement. Connect it directly to why they are the perfect fit.
   - Closing: "I look forward to discussing how I can contribute to your team." and sign-off.
3. Tone: Confident, direct, and "sweet". Avoid fluff.
4. DO NOT include placeholders like "[Company Name]" unless the JD explicitly names the company.
5. SPACING: Single spacing. Ensure it fits easily on one page.
6. Format as plain text.

Return ONLY the cover letter text.`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("[GEMINI COVER LETTER] Error:", error);
    return "Error generating cover letter. Please try again.";
  }
}

export interface InterviewQuestion {
  id: string;
  question: string;
  answerKey: string;
  tips: string[];
}

export async function generateInterviewQuestions(industry: string, role: string, resumeContext: string): Promise<InterviewQuestion[]> {
  if (!apiKey) {
    console.warn("[GEMINI INTERVIEW] API key not configured");
    return [];
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

    const prompt = `You are an expert technical interviewer and career coach in the ${industry} industry.
    Your goal is to prepare a candidate for a ${role} role.
    
    Candidate's Background (Resume Context):
    "${resumeContext.slice(0, 3000)}"

    Generate 5 HIGH-QUALITY, specific interview questions tailored to this candidate and the role.
    Include a mix of behavioral and technical questions.

    For each question provide:
    1. The Question.
    2. A "Key Answer Points" summary (what the interviewer is looking for).
    3. 2-3 short Tips for answering.

    Return ONLY a JSON array of objects:
    [
      {
        "question": "...",
        "answerKey": "...",
        "tips": ["tip1", "tip2"]
      }
    ]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();
    if (text.includes('```')) {
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    }

    const parsed = JSON.parse(text);
    return parsed.map((q: any, idx: number) => ({
      ...q,
      id: `q-${Date.now()}-${idx}`
    }));

  } catch (error) {
    console.error("[GEMINI INTERVIEW] Error:", error);
    return [];
  }
}

export async function getSectionExamples(section: string, query: string): Promise<string[]> {
  if (!apiKey || !query) return [];

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

    const prompt = `You are a professional resume writer.
    Generate 3 distinct, high-quality, professional examples for a resume's "${section}" section, specifically tailored for a "${query}" role.
    
    Rules:
    1. Result must be an array of 3 strings.
    2. Each string should be a complete, ready-to-use example (e.g., a full paragraph for Summary, or a set of bullet points for Experience).
    3. Use strong action verbs and metrics.
    4. Do not include headers or labels like "Example 1". Just the content.
    
    Return ONLY a JSON array of strings:
    ["Example 1 text...", "Example 2 text...", "Example 3 text..."]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();
    if (text.includes('```')) {
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    }

    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("[GEMINI EXAMPLES] Error:", error);
    return [];
  }
}

export interface ATSAnalysisResult {
  score: number;
  matchStatus: 'High' | 'Medium' | 'Low';
  summary: string;




  experienceMatch: {
    matchPercentage: number;
    candidateYears: number;
    targetYears: number;
    seniorityAlignment?: 'Perfect' | 'High' | 'Medium' | 'Low';
    domainAlignment?: 'Perfect' | 'High' | 'Medium' | 'Low';
    reasoning: string;
  };
  educationMatch: {
    matchPercentage: number;
    degreeMatch: 'Match' | 'Partial' | 'Mismatch' | 'Not Specified';
    cgpaMatch: 'Match' | 'Low' | 'Not Specified';
    reasoning: string;
  };
  skillsMatch: {
    matchPercentage: number;
    matchedSkills: string[];
    missingSkills: string[];
    reasoning: string;
  };
  suggestedKeywords: {
    niceToHave: string[];
  };
  formattingMatch: {
    matchPercentage: number;
    reasoning: string;
  };
  formattingIssues: string[];
  contentSuggestions: string[]; // Keeping for backward compatibility if needed, but preferred is improvementPlan
  improvementPlan?: {
    section: 'summary' | 'experience' | 'projects' | 'skills' | 'education' | 'formatting';
    suggestion: string;
    priority: 'High' | 'Medium';
  }[];
  contentToRemove?: {
    section: string;
    item: string;
    reason: string;
    priority: 'High' | 'Medium' | 'Low';
  }[];
  contentToAdd?: {
    section: string;
    suggestion: string;
    reason: string;
    priority: 'High' | 'Medium' | 'Low';
    examples?: string[];
  }[];
}

export interface ResumeAuditSection {
  sectionId: string;
  title: string;
  score: number;
  status: 'Excellent' | 'Good' | 'Needs Work' | 'Missing';
  currentContent: string;
  suggestedContent: string;
  tips: string[];
  importance: string;
}

export interface ResumeAuditResult {
  overallScore: number;
  sections: ResumeAuditSection[];
  summary: string;
}

export function normalizeATSResult(data: any): ATSAnalysisResult {
  // Helper to map levels to fixed scores
  const getScoreFromLevel = (level: string): number => {
    switch (level?.toLowerCase()) {
      case 'perfect': return 100;
      case 'high': return 96;
      case 'medium': return 75;
      case 'low': return 40;
      case 'none': return 0;
      default: return 0;
    }
  };

  // Calculate scores based on levels
  let expScore = getScoreFromLevel(data.experienceMatch?.matchLevel);
  let skillsScore = getScoreFromLevel(data.skillsMatch?.matchLevel);
  let eduScore = getScoreFromLevel(data.educationMatch?.matchLevel);
  let fmtScore = getScoreFromLevel(data.formattingMatch?.matchLevel);

  // DETERMINISTIC OVERRIDES (The "Final 100%" Rule)
  // Ensure that if AI detects zero missing requirements, the score is forced to 100

  // 1. Skills Override
  const matchedSkills = Array.isArray(data.skillsMatch?.matchedSkills) ? data.skillsMatch.matchedSkills : [];
  const missingSkills = Array.isArray(data.skillsMatch?.missingSkills) ? data.skillsMatch.missingSkills : [];

  // FRINGE SKILL ALLOWANCE: If missing skills are 2 or fewer, and matched skills are significant, force 100.
  // This accounts for AI hallucinations of missing "fringe" keywords.
  if (missingSkills.length <= 2 && matchedSkills.length >= 8) {
    skillsScore = 100;
  } else if (missingSkills.length === 0 && matchedSkills.length > 0) {
    skillsScore = 100;
  }

  // 2. Education Override
  if (data.educationMatch?.degreeMatch === 'Match' || data.educationMatch?.matchLevel === 'Perfect') {
    eduScore = 100;
  }

  // 3. Post-Optimization Score Boost
  // If skills are perfect (100) and experience/formatting are "High" (96), boost them to Perfect (100)
  // This handles cases where auto-optimize adds all skills and rewrites content, but AI is conservative with "Perfect" ratings
  if (skillsScore === 100 && expScore === 96) {
    expScore = 100; // Boost experience to perfect if skills are perfect
  }
  if (skillsScore === 100 && fmtScore === 96) {
    fmtScore = 100; // Boost formatting to perfect if skills are perfect
  }
  // If education is at least "Medium" (75) and skills are perfect, be generous
  if (skillsScore === 100 && eduScore >= 75 && expScore >= 96) {
    eduScore = 100; // Boost education when other aspects are strong
  }

  // Calculate weighted average
  let calculatedScore = Math.round(
    (expScore * 0.4) +
    (skillsScore * 0.3) +
    (eduScore * 0.2) +
    (fmtScore * 0.1)
  );

  // FINAL "PERFECT SCORE" PUSH: If we are very close (95+), force 100.
  // This removes frustration for highly optimized resumes that are mathematically "near perfect".
  // Lowered from 98 to 95 to account for optimization scenarios where AI is conservative
  if (calculatedScore >= 95) {
    calculatedScore = 100;
  }

  const result: ATSAnalysisResult = {
    score: calculatedScore,
    matchStatus: calculatedScore >= 80 ? 'High' : calculatedScore >= 45 ? 'Medium' : 'Low',
    summary: data.summary || 'Analysis currently unavailable.',
    experienceMatch: {
      matchPercentage: expScore,
      candidateYears: typeof data.experienceMatch?.candidateYears === 'number' ? data.experienceMatch.candidateYears : 0,
      targetYears: typeof data.experienceMatch?.targetYears === 'number' ? data.experienceMatch.targetYears : 0,
      seniorityAlignment: data.experienceMatch?.seniorityAlignment || 'Medium',
      domainAlignment: data.experienceMatch?.domainAlignment || 'Medium',
      reasoning: data.experienceMatch?.reasoning || 'No experience analysis available.'
    },
    educationMatch: {
      matchPercentage: eduScore,
      degreeMatch: ['Match', 'Partial', 'Mismatch', 'Not Specified'].includes(data.educationMatch?.degreeMatch) ? data.educationMatch.degreeMatch : 'Not Specified',
      cgpaMatch: ['Match', 'Low', 'Not Specified'].includes(data.educationMatch?.cgpaMatch) ? data.educationMatch.cgpaMatch : 'Not Specified',
      reasoning: data.educationMatch?.reasoning || 'No education analysis available.'
    },
    skillsMatch: {
      matchPercentage: skillsScore,
      matchedSkills: Array.isArray(data.skillsMatch?.matchedSkills) ? data.skillsMatch.matchedSkills : [],
      missingSkills: Array.isArray(data.skillsMatch?.missingSkills) ? data.skillsMatch.missingSkills : [],
      reasoning: data.skillsMatch?.reasoning || 'No skills analysis available.'
    },
    suggestedKeywords: {
      niceToHave: Array.isArray(data.suggestedKeywords?.niceToHave) ? data.suggestedKeywords.niceToHave : []
    },
    formattingMatch: {
      matchPercentage: fmtScore,
      reasoning: data.formattingMatch?.reasoning || 'No formatting analysis available.'
    },
    formattingIssues: Array.isArray(data.formattingIssues) ? data.formattingIssues : [],
    contentSuggestions: Array.isArray(data.contentSuggestions) ? data.contentSuggestions : [],
    improvementPlan: Array.isArray(data.improvementPlan) ? data.improvementPlan.map((p: any) => ({
      section: p.section || 'General',
      suggestion: p.suggestion || '',
      priority: p.priority || 'Medium'
    })) : [],
    contentToRemove: Array.isArray(data.contentToRemove)
      ? data.contentToRemove.map((item: any) => ({
        section: item.section || 'unknown',
        item: item.item || '',
        reason: item.reason || '',
        priority: ['High', 'Medium', 'Low'].includes(item.priority) ? item.priority : 'Medium'
      }))
      : [],
    contentToAdd: Array.isArray(data.contentToAdd)
      ? data.contentToAdd.map((item: any) => ({
        section: item.section || 'unknown',
        suggestion: item.suggestion || '',
        reason: item.reason || '',
        priority: ['High', 'Medium', 'Low'].includes(item.priority) ? item.priority : 'Medium',
        examples: Array.isArray(item.examples) ? item.examples : []
      }))
      : []
  };

  // POST-PROCESSING: Ensure critical missing skills are in the improvement plan
  if (missingSkills && missingSkills.length > 0) {
    if (!result.improvementPlan) result.improvementPlan = [];
    const hasSkillsFix = result.improvementPlan.some(p => p.section.toLowerCase() === 'skills');
    if (!hasSkillsFix) {
      result.improvementPlan.unshift({
        section: 'skills',
        suggestion: `Add the following missing critical skills: ${missingSkills.join(', ')}`,
        priority: 'High'
      });
    }
  }
  return result;
}

export async function analyzeATS(resume: Resume, jobDescription: string): Promise<ATSAnalysisResult | null> {
  if (!apiKey) {
    console.warn("[GEMINI ATS] API key not configured");
    return null;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: { temperature: 0.1 }
    });

    // Construct a highly structured, human-readable version of the resume
    // This is more reliable for the LLM than raw JSON which can be finicky with field names
    const experienceList = [...(resume.experience || []), ...(resume.internships || [])];

    let resumeText = `RESUME OF: ${resume.personal_info?.fullName || 'Candidate'}\n`;
    if (resume.personal_info?.title) resumeText += `TARGET/CURRENT ROLE: ${resume.personal_info.title}\n`;

    resumeText += `\nSUMMARY:\n${resume.summary || 'None provided'}\n`;

    resumeText += `\nWORK EXPERIENCE & INTERNSHIPS:\n`;
    if (experienceList.length > 0) {
      experienceList.forEach((exp: any, i) => {
        resumeText += `${i + 1}. ${exp.position || exp.title || 'Role'} at ${exp.company || exp.organization || 'Organization'}\n`;
        resumeText += `   Period: ${exp.startDate || ''} to ${exp.endDate || (exp.current ? 'Present' : '')}\n`;
        if (exp.location) resumeText += `   Location: ${exp.location}\n`;
        if (exp.description) resumeText += `   Description: ${exp.description}\n`;
        resumeText += '\n';
      });
    } else {
      resumeText += "None listed.\n";
    }

    resumeText += `\nSKILLS & EXPERTISE:\n${(resume.skills || []).join(', ') || 'None listed.'}\n`;

    resumeText += `\nEDUCATION:\n`;
    if (resume.education && resume.education.length > 0) {
      resume.education.forEach((edu, i) => {
        const degree = edu.degree || 'Degree';
        const field = edu.field || edu.fieldOfStudy || '';
        const degreeFull = field ? `${degree} in ${field}` : degree;

        resumeText += `${i + 1}. ${degreeFull}\n`;
        resumeText += `   Institution: ${edu.institution || 'University'}\n`;
        if (edu.location) resumeText += `   Location: ${edu.location}\n`;
        if (edu.gpa) resumeText += `   GPA/Grade: ${edu.gpa}\n`;
        if (edu.description) resumeText += `   Notes: ${edu.description}\n`;
        resumeText += '\n';
      });
    } else {
      resumeText += "None listed.\n";
    }

    if (resume.projects && resume.projects.length > 0) {
      resumeText += `\nPROJECTS:\n`;
      resume.projects.forEach((proj, i) => {
        resumeText += `${i + 1}. ${proj.name || 'Project'}\n`;
        if (proj.description) resumeText += `   Description: ${proj.description}\n`;
        if (proj.technologies && proj.technologies.length > 0) resumeText += `   Stack: ${proj.technologies.join(', ')}\n`;
        resumeText += '\n';
      });
    }

    const prompt = `You are an advanced Application Tracking System (ATS) and expert Recruiter.
    Analyze the following Resume against the Job Description.

    RESUME CONTENT:
    """
    ${resumeText.slice(0, 10000)}
    """

    JOB DESCRIPTION:
    """
    ${jobDescription.slice(0, 5000)}
    """

    TASK:
    Perform a strict, DETERMINISTIC ATS analysis.
    To ensure consistency (same input = exact same score), you must NOT output arbitrary percentages. 
    Instead, assign a "Match Level" (Perfect, High, Medium, Low, None) for each category based on strict criteria.
    
    CRITICAL RULE: ANALYTICAL BUT FAIR
    - Precision is key, but do not be overly punitive.
    - Award "Match Levels" based on the spirit of the requirement.
    - **GENEROUS PERFECT**: If a candidate meets 90%+ of a level's requirements and the alignment is professional, award the higher level (e.g. award "Perfect" if the core technical requirements are met and the context is strong).
    - Aim to differentiate between "Excellent" (Perfect/High) and "Average" (Medium) candidates.
    
    SCORING RUBRIC:
    1. EXPERIENCE MATCH:
       - Perfect: Candidate years >= Target years AND Job Titles/Industry match exactly (e.g. "Senior React Dev" for a Senior Frontend role).
       - High: Candidate years >= Target years AND Industry matches, but seniority level is slightly off (e.g. Junior applying for Mid-level).
       - Medium: Candidate years match BUT unrelated industry (e.g. HR professional applying for Sales) OR Seniority is a major mismatch.
       - Low: Major mismatch in both years and industry/seniority.
       - None: No experience listed.

    2. SENIORITY & DOMAIN ALIGNMENT (New Criteria):
       - Perfect: Candidate's current/recent role matches the target JD's seniority and industry domain.
       - High: Match in Domain but Seniority is one level off (e.g. Mid-level to Senior).
       - Medium: Match in Seniority but different industry.
       - Low: Mismatch in both.

    3. SKILLS MATCH:
       **CONSISTENCY RULE**: 
       - If the list for \`missingSkills\` is empty, you MUST award the \`matchLevel: "Perfect"\`. 
       - If the candidate has 95%+ of the required skills, award \`matchLevel: "Perfect"\`.
       - The goal is 100% match after optimization. Do not be pedantic about minor soft skills if all technical ones match.

    3. EDUCATION MATCH:
       - Perfect: Degree title (e.g. BS, MS, PhD) AND Field (e.g. Computer Science, MBA) match the JD's requirements exactly.
       - High: Degree level matches (e.g. JD requires a Bachelor's and candidate has a Bachelor's) but in a closely related field.
       - Medium: Degree level matches but in an unrelated field.
       - Low: Degree level is lower than required (e.g. JD requires MS, candidate has BS) OR no degree listed but required.
       - None: Truly no education section found or explicitly empty.
       
       **HALLUCINATION SHIELD**: If the \`RESUME CONTENT\` has an \`EDUCATION\` section that is NOT "None listed", you MUST award a Match Level of at least "Low" (if unrelated) or "Medium/High" (if related). 
       **DO NOT** return "Not Specified" for \`degreeMatch\` if there is ANY text in the education section. Look for degree-like words (BCA, MBA, Bachelor, Master, etc.) and map them.

    4. FORMATTING MATCH:
       - Perfect: Contains: Summary, Experience, Skills, Education AND Experience uses bullets with metrics (%, $).
       - High: Contains all sections BUT Experience is missing metrics.
       - Medium: Missing one major section (like Summary) OR Experience is completely paragraph-based (no bullets).
       - Low: Missing multiple sections or very poor formatting.

    Return a JSON object:
    {
      "matchStatus": "High" | "Medium" | "Low",
      "summary": "<2 sentence summary>",
      "experienceMatch": {
        "matchLevel": "Perfect" | "High" | "Medium" | "Low" | "None",
        "candidateYears": <number>,
        "targetYears": <number>,
        "seniorityAlignment": "Perfect" | "High" | "Medium" | "Low",
        "domainAlignment": "Perfect" | "High" | "Medium" | "Low",
        "reasoning": "<Concise explanation including domain/seniority feedback>"
      },
      "educationMatch": {
        "matchLevel": "Perfect" | "High" | "Medium" | "Low" | "None",
        "degreeMatch": "Match" | "Partial" | "Mismatch" | "Not Specified",
        "cgpaMatch": "Match" | "Low" | "Not Specified",
        "reasoning": "<Explanation>"
      },
      "skillsMatch": {
        "matchLevel": "Perfect" | "High" | "Medium" | "Low" | "None",
        "matchedSkills": ["<skill1>", "<skill2>"],
        "missingSkills": ["<missing1>"],
        "reasoning": "<Explanation>"
      },
      "formattingMatch": {
        "matchLevel": "Perfect" | "High" | "Medium" | "Low" | "None",
        "reasoning": "<Explanation>"
      },
      "suggestedKeywords": { "niceToHave": [] },
      "formattingIssues": [],
      "improvementPlan": [
        { "section": "experience", "suggestion": "...", "priority": "High" }
      ],
      "contentToRemove": [
        {
          "section": "projects" | "experience" | "skills" | "certifications" | "education",
          "item": "<brief identifier of the specific item>",
          "reason": "<why this should be removed - irrelevant, outdated, or less impressive>",
          "priority": "High" | "Medium" | "Low"
        }
      ],
      "contentToAdd": [
        {
          "section": "skills" | "experience" | "summary" | "projects" | "certifications",
          "suggestion": "<what to add>",
          "reason": "<why it's important for this JD>",
          "priority": "High" | "Medium" | "Low",
          "examples": ["<optional example 1>", "<optional example 2>"]
        }
      ]
    }

    ADDITIONAL ANALYSIS REQUIRED:
    
    1. **contentToRemove**: Identify specific resume items that should be removed because they:
       - Are irrelevant to the target role in the JD
       - Are outdated or less impressive compared to other content
       - Take up valuable space that could be better used
       - Don't align with the job requirements
       
       For each item, specify the section, a brief identifier, the reason for removal, and priority.
    
    2. **contentToAdd**: Suggest specific content additions that would improve the match:
       - Missing critical skills from the JD
       - Experience descriptions that should be added
       - Keywords or certifications mentioned in the JD
       - Sections that are missing but expected
       
       For each suggestion, specify the section, what to add, why it matters, priority, and optionally 1-2 brief examples.

    RULES:
    - Be strict but fair.
    - **CRITICAL**: Return ONLY clean, plain text skill names in all arrays (e.g., "React.js", not "• React.js"). No bullets, numbering, or formatting.
    - **TYPO RESILIENCE**: Recognize common degree titles even with typos (e.g., "Batchelor" = Bachelor, "Master of Business Administration" = MBA/Master's).
    - Map synonyms/abbreviations (BS, Bachelor, B.Tech, BCA, MCA, MBA) etc. to the required degree level.
    - If the user lists a specific degree title (like BCA or MBA), it counts as a Degree Match even if the exact string differs from the JD's requirement (as long as it's the same level or higher).
    - Return ONLY valid JSON.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const cleanedJson = cleanJsonOutput(response.text());

    const data = JSON.parse(cleanedJson);
    return normalizeATSResult(data);

  } catch (error) {
    console.error("[GEMINI ATS] Error:", error);
    return null;
  }
}

export async function applyImprovement(originalContent: string, instruction: string, jobDescription: string): Promise<string> {
  if (!apiKey) return originalContent;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: { temperature: 0.1 }
    });

    const prompt = `You are a professional resume editor.
    Your task is to REWRITE the following resume content to apply a specific improvement instruction, while aligning it with the Job Description and maximizing the match score.

    INSTRUCTION: "${instruction}"
    
    JOB DESCRIPTION CONTEXT:
    """${jobDescription.slice(0, 1000)}..."""

    ORIGINAL CONTENT:
    """${originalContent}"""

    SCORE PROTECTION RULES:
    1. **NEVER remove metrics**: You must preserve every percentage (%), dollar amount ($), and numerical value found in the original content. These are critical for the ATS score.
    2. **NEVER remove core technical keywords**: If the original content has a specific technology or tool name, it MUST remain in the rewritten version.
    3. **Professional Impact**: Use strong action verbs and ensure the content is visibly improved from the original.

    RULES:
    1. Rewrite the content to DIRECTLY address the instruction.
    2. Maintain the same format (if it's a paragraph, keep it a paragraph; if bullets, keep bullets).
    3. Do not add header/footer or markdown formatting like **bold**.
    4. Keep it professional and concise.
    5. Return ONLY the rewritten content.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("[GEMINI APPLY FIX] Error:", error);
    return originalContent;
  }
}

export interface OptimizedContent {
  summary?: string;
  experience?: {
    id: string;
    description: string;
  }[];
  skills?: string[];
}


export async function optimizeResume(resume: Resume, jobDescription: string, missingSkills: string[] = []): Promise<OptimizedContent | null> {
  if (!apiKey) return null;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: { temperature: 0.1 }
    });

    // Simplify resume for token limit
    const resumeContext = JSON.stringify({
      summary: resume.summary,
      skills: resume.skills,
      experience: resume.experience.map(e => ({
        id: e.id,
        position: e.position,
        company: e.company,
        description: e.description
      }))
    }, null, 2);

    const prompt = `You are a Resume Optimization Expert.
    Your goal is to rewrite the candidate's resume to maximize their match score for the provided Job Description (JD).

    JOB DESCRIPTION:
    """${jobDescription.slice(0, 4000)}"""

    RESUME CONTENT:
    """${resumeContext}"""

    CRITICAL MISSING SKILLS IDENTIFIED:
    [${missingSkills.join(', ')}]

    INSTRUCTIONS:
    0. **CORE REQUIREMENT**: Ensure the optimized content is **distinctly improved** and specifically targets the **"Perfect" match criteria** (100% score).
    1. **SCORE PROTECTION RULES**:
       - **NEVER remove metrics**: You must preserve every percentage (%), dollar amount ($), and numerical value found in the original bullets. These drive the ATS score.
       - **NEVER remove core technical keywords**: If the original bullet has a specific technology or tool, it MUST remain in the optimized version.
       - **Preserve Seniority**: Maintain the exact level of responsibility and seniority described in the original job titles and descriptions.
    2. **Skills**: 
       - **EXTRACT EVERY KEYWORD**: You MUST extract EVERY technical term, tool, framework, library, and hard skill mentioned in the job description.
       - **ADD TO LIST**: You MUST add ALL the "CRITICAL MISSING SKILLS" listed above AND all other extracted JD keywords to the skills list. 
       - The goal is for the user to have a 100% Skills Match score after optimization.
       - Keep existing valid skills.
       - **CRITICAL**: Return ONLY clean, plain text skill names (e.g., "React.js", not "• React.js"). No bullets or formatting.
    3. **Summary**: Completely REWRITE the summary to be punchy, metric-driven, and perfectly tailored to the JD. Do not just tweak it; rewrite it for maximum impact. Naturally integrate as many missing skills as possible.
    4. **Experience**: Aggressively REWRITE bullet points for relevant roles to highly align with the JD. Focus on quantifiable achievements and weave in JD keywords elegantly. Ensure every bullet is punchy, distinct from the original, and demonstrates value.
       - You MUST weave the "CRITICAL MISSING SKILLS" into the experience descriptions where they fit naturally.
       - **CRITICAL**: Use bullet points (•) for every achievement.
       - **CRITICAL**: Include or preserve ALL quantifiable metrics (%, $, numbers, timelines) to demonstrate impact.
       - Return updates for specific experience entries using their "id".
       - Do NOT hallucinate new jobs or companies.
       - DO NOT remove existing keywords that are clearly relevant to the JD.
    
    OUTPUT FORMAT:
    Return a JSON object with the following structure:
    {
      "summary": "New optimized summary...",
      "skills": ["Skill 1", "Skill 2", ...all optimized list including new ones...],
      "experience": [
        {
          "id": "original_id_from_input",
          "description": "New optimized description..."
        }
      ]
    }
    
    Return ONLY valid JSON.
    
    IMPORTANT: The goal is to INCREASE the ATS match score. If the rewritten content is less aligned or missing keywords from the JD than the original, you have failed.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const cleanedJson = cleanJsonOutput(response.text());

    return JSON.parse(cleanedJson);
  } catch (error) {
    console.error("[GEMINI OPTIMIZE] Error:", error);
    // Return empty but valid structure to avoid downstream crashes
    return { summary: '', skills: [], experience: [] };
  }
}

export async function generateFullResume(userInfo: { name: string, role: string, industry: string, seniority: string }): Promise<Resume | null> {

  if (!apiKey) return null;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: { temperature: 0.7 } // Higher temperature for creativity in generation
    });

    const prompt = `You are a Professional Resume Writer.
    Your goal is to create a high-quality, comprehensive resume for the following person:
    NAME: ${userInfo.name}
    DESIRED ROLE: ${userInfo.role}
    INDUSTRY: ${userInfo.industry}
    SENIORITY LEVEL: ${userInfo.seniority}

    INSTRUCTIONS:
    1. **Personal Info**: Use the provided name. Use realistic but placeholder email/phone/location if not obvious.
    2. **Summary**: Write a powerful 3-4 sentence professional summary tailored to the role and seniority.
    3. **Experience**: Generate 2-3 realistic industry examples of previous roles the person might have held.
       - Use placeholders like "[Company Name]" and "[Location]".
       - Write 3-4 high-impact, metric-driven bullet points for each role using action verbs.
       - Ensure the experience matches the ${userInfo.seniority} seniority level.
    4. **Education**: Generate 1-2 realistic education examples (e.g., Computer Science degree for tech).
       - Use placeholders like "[University Name]" and "[Location]".
    5. **Skills**: Generate a list of 8-12 most relevant hard and soft skills for this specific role.
    6. **Projects/Certifications**: Add 1-2 relevant examples.

    OUTPUT FORMAT:
    Return a JSON object exactly matching the Resume interface:
    {
      "title": "Desired Role Resume",
      "personal_info": { "fullName": "${userInfo.name}", "email": "...", "phone": "...", "location": "...", "linkedin": "...", "portfolio": "...", "title": "${userInfo.role}" },
      "summary": "...",
      "experience": [ { "id": "1", "company": "[Company Name]", "position": "...", "location": "[Location]", "startDate": "2020-01", "endDate": "Present", "current": true, "description": "• Built...\\n• Led..." } ],
      "education": [ { "id": "1", "institution": "[University Name]", "degree": "...", "field": "...", "location": "[Location]", "startDate": "2016-09", "endDate": "2020-05", "current": false } ],
      "skills": ["Skill 1", "Skill 2", ...],
      "projects": [ { "id": "1", "name": "...", "description": "...", "technologies": ["...", "..."], "url": "...", "startDate": "2021-01", "endDate": "2021-06" } ],
      "certifications": [ { "id": "1", "name": "...", "issuer": "...", "date": "2022-01" } ],
      "languages": [ { "id": "1", "name": "English", "proficiency": "Native" } ],
      "interests": ["...", "..."],
      "template": "tech-modern",
      "design": "professional-clean",
      "industry": "${userInfo.industry.toLowerCase()}",
      "internships": [],
      "additional_info": "",
      "showProfilePicture": true,
      "section_order": ["summary", "experience", "education", "skills", "projects", "certifications", "languages", "interests"]
    }

    Return ONLY valid JSON.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();
    if (text.includes('```')) {
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    }

    const data = JSON.parse(text);

    // Ensure IDs are strings and unique
    if (data.experience) data.experience = data.experience.map((e: any, i: number) => ({ ...e, id: String(i + 1) }));
    if (data.education) data.education = data.education.map((e: any, i: number) => ({ ...e, id: String(i + 1) }));
    if (data.projects) data.projects = data.projects.map((p: any, i: number) => ({ ...p, id: String(i + 1) }));
    if (data.certifications) data.certifications = data.certifications.map((c: any, i: number) => ({ ...c, id: String(i + 1) }));
    if (data.languages) data.languages = data.languages.map((l: any, i: number) => ({ ...l, id: String(i + 1) }));

    return data;
  } catch (error) {
    console.error("[GEMINI GENERATE] Error:", error);
    return null;
  }
}

export async function auditResume(resume: Resume): Promise<ResumeAuditResult | null> {
  if (!apiKey) return null;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: { temperature: 0.1 }
    });

    // 1. Identify present sections dynamically
    // We always include 'summary' and 'experience' as core sections to check (even if empty, to prompt user)
    // For others, we only include them if they exist.
    const presentSections: string[] = ['summary', 'experience', 'education', 'skills']; // Core sections

    if (resume.projects && resume.projects.length > 0) presentSections.push('projects');
    if (resume.certifications && resume.certifications.length > 0) presentSections.push('certifications');
    if (resume.languages && resume.languages.length > 0) presentSections.push('languages');
    if (resume.internships && resume.internships.length > 0) presentSections.push('internships');
    if (resume.interests && resume.interests.length > 0) presentSections.push('interests');

    // Deduplicate just in case
    const sectionsToAudit = Array.from(new Set(presentSections));

    const resumeTxt = JSON.stringify({
      summary: resume.summary,
      experience: resume.experience.map(e => ({
        position: e.position,
        company: e.company,
        description: e.description
      })),
      skills: resume.skills,
      education: resume.education.map(e => ({
        degree: e.degree,
        field: e.field || e.fieldOfStudy,
        institution: e.institution
      })),
      projects: resume.projects.map(p => ({
        name: p.name,
        description: p.description
      })),
      certifications: resume.certifications,
      languages: resume.languages,
      internships: resume.internships
    }, null, 2);

    const prompt = `You are a Senior Executive Talent Auditor. 
    Review the following Resume section by section. Be critical and professional.
    
    RESUME:
    """
    ${resumeTxt}
    """

    TASK:
    Break down the resume into its core sections and provide a detailed audit for the following sections ONLY: ${sectionsToAudit.join(', ')}.
    
    For each section, provide:
    1. A score (0-100).
    2. A status (Excellent, Good, Needs Work, or Missing).
    3. 3-4 specific, actionable tips to improve it.
    4. A "Suggested Content" which is a polished, professional version of that section's content.
    5. A brief "Importance" statement (why this section matters for ATS and recruiters).

    Return a JSON object:
    {
      "overallScore": <number 0-100>,
      "summary": "<2 sentence overview of the resume health>",
      "sections": [
        {
          "sectionId": "matches the exact key from the list: ${sectionsToAudit.join(', ')}",
          "title": "Display Title (e.g. Work Experience)",
          "score": <number>,
          "status": "Excellent" | "Good" | "Needs Work" | "Missing",
          "currentContent": "<The current content of the section>",
          "suggestedContent": "<Your polished, high-impact version>",
          "tips": ["Tip 1", "Tip 2", "Tip 3"],
          "importance": "<Why this section is critical>"
        }
      ]
    }

    RULES:
    - If a section is missing, set status to "Missing" and provide "Suggested Content" as a template/example they should add.
    - Be strictly objective. High scores (90+) are reserved for sections with metrics ($ ,%, numbers) and clear impact.
    - Return ONLY valid JSON.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();
    if (text.includes('```')) {
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    }

    const auditData = JSON.parse(text);

    // FAILSAFE: Override AI hallucinations where it says "Missing" but data exists
    if (auditData.sections && Array.isArray(auditData.sections)) {
      auditData.sections.forEach((section: any) => {
        const sectionId = section.sectionId.toLowerCase();
        let hasData = false;

        // Check actual resume data
        if (sectionId === 'summary') {
          hasData = !!resume.summary && resume.summary.length > 10;
        } else if (Array.isArray((resume as any)[sectionId])) {
          hasData = (resume as any)[sectionId].length > 0;
        }

        if (hasData && section.status === 'Missing') {
          console.log(`[AUDIT FIX] Overriding false 'Missing' for ${sectionId}`);
          section.status = 'Good'; // Default to Good to be safe, or 'Needs Work' if we want to be strict but not missing
          section.score = Math.max(section.score, 70);
          if (!section.tips || section.tips.length === 0) {
            section.tips = [`Review your ${section.title} to ensure it aligns with your target role.`];
          }
        }
      });

      // Sort sections according to resume section_order if possible, or standard list
      const sortOrder = sectionsToAudit;
      auditData.sections.sort((a: any, b: any) => {
        return sortOrder.indexOf(a.sectionId) - sortOrder.indexOf(b.sectionId);
      });
    }

    return auditData;
  } catch (error) {
    console.error("[GEMINI AUDIT] Error:", error);
    return null;
  }
}
