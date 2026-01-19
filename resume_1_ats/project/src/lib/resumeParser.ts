import { Resume } from '../types';
import { parseResumeWithGroq } from './groqParser';
import { parseResumeWithGemini, normalizeParsedData } from './gemini';
import { parseResumeWithAI } from './aiParser';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Use the worker from node_modules instead of CDN
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

function normalizeFuzzy(text: any): string {
  if (typeof text !== 'string') return '';
  return text.toLowerCase().replace(/\s+/g, '');
}

// Helper to check if a word is in a list, even if it's fragmented
function fuzzyInclude(text: string, kw: string): boolean {
  return normalizeFuzzy(text).includes(normalizeFuzzy(kw));
}

function isHeaderMatch(line: string, keywords: string[]): boolean {
  // 1. GLOBAL BULLET PROTECTION: A bulleted line is usually a list item, not a header
  const bulletSymbolRegex = /^[\u2022\u25CF\u25AA\u25AB\u2219\u25CB\u25E6\u2023\u2043\u2044\uF0B7\u27A2\u27A4\u25B6\u25B2\u25BC\u25C6\u25C7\u25D8\u25D9\u25A0\u25A1\u25AA\u25AB\u00B7*-]/;
  if (bulletSymbolRegex.test(line.trim()) && line.trim().length > 30) return false;

  // 2. Remove markers like **, __, and punctuation from ends
  const normalizedLine = line.toLowerCase()
    .replace(/^[\s\t\n*#._:-]+/, '')
    .replace(/[\s\t\n*#._:-]+$/, '')
    .trim();

  if (!normalizedLine) return false;

  // Header lines should generally be short
  if (line.length > 100) return false;

  const fuzzyLine = normalizeFuzzy(normalizedLine);

  return keywords.some(kw => {
    const nKw = kw.toLowerCase().trim();
    const fuzzyKw = normalizeFuzzy(nKw);

    // Try exact or prefix match first
    if (normalizedLine === nKw ||
      normalizedLine.startsWith(nKw + ':') ||
      normalizedLine.startsWith(nKw + ' ') ||
      normalizedLine.startsWith(nKw + '.') ||
      normalizedLine.startsWith(nKw + '|')) {
      return true;
    }

    // Then try space-insensitive match (for fragmented headers)
    // Only if the line is short (to avoid matching keywords inside descriptions)
    if (line.length < 30 && fuzzyLine === fuzzyKw) {
      return true;
    }

    return false;
  });
}

// Space-insensitive Date Regex: Handles "2 0 2 1" and "J A N"
// We allow 0-2 spaces between characters in years and months
const dateRegexRaw = /(?:(?:\b(?:j\s*a\s*n|f\s*e\s*b|m\s*a\s*r|a\s*p\s*r|m\s*a\s*y|j\s*u\s*n|j\s*u\s*l|a\s*u\s*g|s\s*e\s*p|o\s*c\s*t|n\s*o\s*v|d\s*e\s*c)[a-z\s]*\.?|(?:\d\s*[\/\.\s]\s*\d))?\s*(?:2\s*0\s*\d\s*\d|1\s*9\s*\d\s*\d)\s*(?:[-]|\bto\b)\s*(?:p\s*r\s*e\s*s\s*e\s*n\s*t|n\s*o\s*w|c\s*u\s*r\s*r\s*e\s*n\s*t|(?:(?:j\s*a\s*n|f\s*e\s*b|m\s*a\s*r|a\s*p\s*r|m\s*a\s*y|j\s*u\s*n|j\s*u\s*l|a\s*u\s*g|s\s*e\s*p|o\s*c\s*t|n\s*o\s*v|d\s*e\s*c)[a-z\s]*\.?|(?:\d\s*[\/\.\s]\s*\d))?\s*(?:2\s*0\s*\d\s*\d|1\s*9\s*\d\s*\d))|\b(?:2\s*0\s*\d\s*\d|1\s*9\s*\d\s*\d)\b)/i;



// Utility to clean and normalize descriptions (re-used by AI and Regex parsers)
const cleanDescription = (desc: string): string => {
  if (!desc) return '';
  const lines = desc.split('\n').map(l => l.trim()).filter(Boolean);
  const merged: string[] = [];

  for (let line of lines) {
    // 1. Skip punctuation-only fragments (stray dots, hyphens)
    if (/^[\.!?,\-]+$/.test(line)) continue;

    // 2. Remove space before punctuation (e.g. " ) ." -> ").")
    line = line.replace(/\s+([\.!?,;:)\]])/g, '$1');

    if (merged.length > 0) {
      const last = merged[merged.length - 1];
      const isFragment = /^[a-z)\]]/.test(line) || /^(and|or|but|with|using|in|for|to|on|at|by|from|which|that|specially|including)\b/i.test(line);
      const lastNoPunct = !/[.!?]$/.test(last);
      const lineHasBullet = /^([]|[-]\s+|\*\s+)/.test(line);

      // Join if it looks like a fragment or the previous line didn't end a sentence
      if ((isFragment || lastNoPunct) && !lineHasBullet) {
        const sep = (/^[.,;:!?)\]]/.test(line) || last.endsWith('(') || last.endsWith('[')) ? '' : ' ';
        merged[merged.length - 1] = last + sep + line;
        continue;
      }
    }
    merged.push(line);
  }

  // 3. Optional: Split again into clean bullets based on "period + space + Capital"
  const result: string[] = [];
  for (const item of merged) {
    const sentences = item.split(/([\.!?])\s+(?=[A-Z])/).filter(s => s.trim());
    if (sentences.length >= 2) {
      let current = '';
      for (const s of sentences) {
        if (s.match(/^[\.!?]$/)) {
          current += s;
          result.push(current.trim());
          current = '';
        } else {
          current += s;
        }
      }
      if (current.trim()) result.push(current.trim());
    } else {
      result.push(item);
    }
  }

  return result.filter(s => s.length > 1).join('\n');
};

// Utility to strip redundant headers from sections (e.g. "SUMMARY Depenedable..." -> "Dependable...")
const cleanSummaryText = (text: string): string => {
  if (!text) return '';
  const summaryKeywords = ['professional summary', 'summary', 'profile', 'about', 'objective', 'overview', 'about me', 'professional profile', 'career objective', 'career profile'];
  let result = text.trim();

  // Strip any leading words that match our summary keywords
  const lowerText = result.toLowerCase();
  for (const kw of summaryKeywords) {
    const kwLower = kw.toLowerCase();
    if (lowerText.startsWith(kwLower)) {
      const remaining = result.slice(kw.length).trim();
      // If keyword is followed by colon, space, or newline
      if (!remaining || !/^[a-zA-Z0-9]/.test(remaining[0]) || remaining.startsWith(':')) {
        result = remaining.replace(/^[:\s\-]+/, '').trim();
        break;
      }
    }
  }
  return result;
};

async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      // Helper function to detect if a font is bold
      const isBoldFont = (fontName: string): boolean => {
        if (!fontName) return false;
        const lowerFont = fontName.toLowerCase();
        return lowerFont.includes('bold') ||
          lowerFont.includes('-b') ||
          lowerFont.includes('heavy') ||
          lowerFont.includes('black') ||
          lowerFont.includes('semibold') ||
          lowerFont.includes('extrabold');
      };

      // Map raw items to a normalized format with (x, y, width, isBold)
      // Note: pdf.js 'transform' array is [scaleX, skewY, skewX, scaleY, translateX, translateY]
      const items = textContent.items.map((item: any) => {
        const isBold = isBoldFont(item.fontName);
        // Debug: Log font names to see what we're detecting
        if (isBold) {
          console.log(`[PDF BOLD DETECTED] Font: "${item.fontName}", Text: "${item.str}"`);
        }
        return {
          str: item.str,
          x: item.transform[4],
          y: item.transform[5],
          width: item.width || (item.str.length * 4),
          isBold
        };
      });

      // Improved Sorting for Multi-Column Layouts (Left/Right Sidebar support)
      // Dynamic Column Detection: Scan for a vertical "gutter" (empty space) across the page

      const pageWidth = page.view[2] || 600;
      const scanStart = pageWidth * 0.05; // Scan almost full width
      const scanEnd = pageWidth * 0.95;

      let bestSplitX = -1;
      let maxGapWidth = 0;

      // Helper to check if a vertical interval [x, x+width] is clear of text
      const isClear = (x: number, w: number) => {
        const xEnd = x + w;
        // Ignore items with length <= 2 (bullets, tiny icons, page numbers)
        const significantItems = items.filter((i: any) => i.str.trim().length > 2);

        return !significantItems.some((item: any) => {
          const itemStart = item.x;
          const itemEnd = item.x + item.width;
          // Check overlap
          return Math.max(x, itemStart) < Math.min(xEnd, itemEnd);
        });
      };

      // Scan for the widest gap
      for (let x = scanStart; x < scanEnd; x += 5) { // finer resolution (5px)
        if (isClear(x, 5)) {
          let gapW = 5;
          while (x + gapW < scanEnd && isClear(x, gapW + 5)) {
            gapW += 5;
          }
          if (gapW > maxGapWidth) {
            maxGapWidth = gapW;
            bestSplitX = x + (gapW / 2);
          }
          x += gapW;
        }
      }

      // If we found a gap > 25px (increased to reduce false positives), treat as columns
      const isTwoColumn = (bestSplitX !== -1 && maxGapWidth > 25);
      const splitPoint = bestSplitX;

      items.sort((a: any, b: any) => {
        if (isTwoColumn) {
          // Strict Column Sorting based on Split Point
          const aIsLeft = a.x < splitPoint;
          const bIsLeft = b.x < splitPoint;

          if (aIsLeft && !bIsLeft) return -1;
          if (!aIsLeft && bIsLeft) return 1;

          return b.y - a.y; // Top-to-Bottom
        } else {
          // Standard Top-to-Bottom for Single Column
          const yDiff = Math.abs(b.y - a.y);
          if (yDiff > 6) {
            return b.y - a.y; // Priority 1: Y
          }
          return a.x - b.x;   // Priority 2: X
        }
      });

      let lastY = -1;
      let lastX = -1;
      let pageText = '';
      let currentBoldRun = '';
      let lastWasBold = false;

      // Correction for processing sorted items:
      // When processing 2-column, the "lastY" logic needs to reset when switching columns?
      // Actually, standard logic works if the array is sorted correctly:
      // Item 1 (Col1, Top), Item 2 (Col1, Next)... -> lastY diff is handled.
      // Jumping to Col2: new item will have completely different Y.
      // If Col2 Top has same Y as Col1 Top, yDiff is 0? 
      // No, b.y - a.y check is for "new line".
      // We need to handle the "Jump" from bottom of Left Col to top of Right Col.

      items.forEach((item: any, index: number) => {
        const isLastItem = index === items.length - 1;

        // Helper to flush current bold run
        const flushBoldRun = () => {
          if (currentBoldRun.trim()) {
            pageText += `**${currentBoldRun.trim()}**`;
            currentBoldRun = '';
          }
        };

        // Check if this item starts with a bullet marker (\u27A2 = , \u25AA = )
        const bulletMarkers = /^[\s\t]*([\u27A2\u25AA]|[-*]\s+)/;
        const startsWithBullet = bulletMarkers.test(item.str);

        if (lastY === -1) {
          // First item
          if (item.isBold) {
            currentBoldRun += item.str;
            lastWasBold = true;
          } else {
            pageText += item.str;
            lastWasBold = false;
          }
        } else {
          const yDiff = Math.abs(item.y - lastY);
          if (yDiff > 8) {
            // New line detected - check if it's a new paragraph or just wrapped text
            const isLargeGap = yDiff > 18;
            const isNewPoint = startsWithBullet || isLargeGap;

            if (isNewPoint) {
              // Forced break: flush bolding and add newline
              if (lastWasBold) flushBoldRun();
              pageText += '\n';
            } else {
              // Wrapped line: join with space IF we are not currently in a bold run
              // If we ARE in a bold run, we just continue it (no flush needed yet)
              if (!lastWasBold) {
                if (pageText.length > 0 && !pageText.endsWith(' ')) pageText += ' ';
              } else {
                if (currentBoldRun.length > 0 && !currentBoldRun.endsWith(' ')) currentBoldRun += ' ';
              }
            }

            if (item.isBold) {
              if (lastWasBold) {
                currentBoldRun += item.str;
              } else {
                currentBoldRun = item.str;
                lastWasBold = true;
              }
            } else {
              if (lastWasBold) flushBoldRun();
              pageText += item.str;
              lastWasBold = false;
            }
          } else {
            // Same visual line (within column)
            const currentGap = item.x - (lastX + (item.width || 0));

            // Check if we're switching between bold and non-bold
            if (item.isBold !== lastWasBold) {
              if (lastWasBold) {
                flushBoldRun();
              }
              lastWasBold = item.isBold;
            }

            // Add spacing if needed
            let spacing = '';
            if (currentGap > 20) {
              spacing = '   '; // Triple space for large gaps
            } else if (currentGap > 2.5 && !pageText.endsWith(' ') && !currentBoldRun.endsWith(' ') && item.str.trim().length > 0) {
              spacing = ' ';
            }

            if (item.isBold) {
              currentBoldRun += spacing + item.str;
            } else {
              pageText += spacing + item.str;
            }
          }
        }

        lastY = item.y;
        lastX = item.x;

        // Flush bold run at end of items
        if (isLastItem && lastWasBold) {
          flushBoldRun();
        }
      });

      fullText += pageText + '\n';
    }

    console.log('Extracted text from PDF, length:', fullText.length);
    return fullText;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to parse PDF: ' + (error as Error).message);
  }
}

async function extractTextFromWord(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();

    // Use convertToHtml instead of extractRawText to preserve formatting
    const result = await mammoth.convertToHtml({ arrayBuffer });
    const html = result.value;

    console.log('[WORD] Extracted HTML length:', html.length);

    // Convert HTML to text while preserving bold formatting as markdown
    // Replace <strong> and <b> tags with **markdown**
    let text = html
      .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
      .replace(/<b>(.*?)<\/b>/gi, '**$1**')
      // [FIX] Preserve list structure and line breaks BEFORE stripping tags
      .replace(/<li>/gi, ' ')
      .replace(/<\/li>/gi, '\n')
      .replace(/<\/p>|<\/div>|<br\s*\/?>/gi, '\n')
      // [FIX] Handle nested paragraphs and extra newlines in Word output
      .replace(/\n\s*\n\s*\n+/g, '\n\n')
      // Remove other HTML tags
      .replace(/<[^>]+>/g, '')
      // Decode HTML entities
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      // Clean up extra whitespace but keep intentional structural breaks
      .replace(/[ \t]+/g, ' ')
      .replace(/\n\s+\n/g, '\n\n')
      .trim();

    console.log('[WORD] Extracted text with bold formatting, length:', text.length);

    // Debug: Log bold text detected
    const boldMatches = text.match(/\*\*[^*]+\*\*/g);
    if (boldMatches) {
      console.log(`[WORD BOLD DETECTED] Found ${boldMatches.length} bold segments:`, boldMatches.slice(0, 5));
    }

    return text;
  } catch (error) {
    console.error('Error extracting text from Word document:', error);
    throw new Error('Failed to parse Word document: ' + (error as Error).message);
  }
}

export async function extractTextFromFile(file: File): Promise<string> {
  console.log('Starting to read file:', file.name, file.type, file.size);

  try {
    const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isWord = file.type.includes('word') || file.type.includes('officedocument') || file.name.toLowerCase().endsWith('.docx') || file.name.toLowerCase().endsWith('.doc');

    if (isPDF) {
      return await extractTextFromPDF(file);
    }

    if (isWord) {
      return await extractTextFromWord(file);
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;

          if (!content) {
            reject(new Error('File is empty or could not be read'));
            return;
          }

          console.log('File read successfully, type:', file.type, 'length:', content.length);
          resolve(content);
        } catch (error) {
          console.error('Error in onload:', error);
          reject(error);
        }
      };

      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        reject(new Error('Failed to read file: ' + error));
      };

      try {
        reader.readAsText(file);
      } catch (error) {
        console.error('Error starting file read:', error);
        reject(error);
      }
    });
  } catch (error) {
    console.error('Error extracting text:', error);
    throw error;
  }
}

function extractEmail(text: string): string {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const emails = text.match(emailRegex);
  return emails ? emails[0] : '';
}

function extractPhone(text: string): string {
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  const phones = text.match(phoneRegex);
  return phones ? phones[0].trim() : '';
}

function extractName(text: string): string {
  const lines = text.split('\n').filter(line => line.trim().length > 0);

  // Skip common header words
  const skipWords = ['resume', 'curriculum', 'vitae', 'cv', 'summary', 'profile', 'contact', 'mobile', 'email', 'phone', 'address', 'personal'];

  // Increased scan depth to 50 lines to handle cases where name appears after sidebar info
  for (let i = 0; i < Math.min(50, lines.length); i++) {
    const line = lines[i].trim();
    const lowerLine = line.toLowerCase();

    // Skip if it contains email or phone or is too long/short
    if (line.includes('@') || /\d/.test(line) || line.length > 50 || line.length < 3) continue;

    // Skip if it is a known header or just a label
    if (skipWords.some(w => lowerLine === w || lowerLine.startsWith(w + ' '))) continue;
    // Skip if it ends with a colon (likely a field label)
    if (line.endsWith(':')) continue;

    // Check if it looks like a name (2-4 words, mostly letters)
    const words = line.split(/\s+/);
    // Allow up to 5 words for longer names, ensure no special chars like bullets
    if (words.length >= 2 && words.length <= 5 && !line.match(/[|]/)) {
      // Heuristic: usually names are prominent, so we accept the first "clean" line 
      // that isn't a likely header.

      // Additional check: Name words usually start with Uppercase
      const isCapitalized = words.every(w => /^[A-Z]/.test(w));

      // If it's the very first valid line, we might be less strict about capitalization
      // But if we are deep in the file (i > 5), we should prefer capitalized names
      if (i > 5 && !isCapitalized) continue;

      return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    }
  }
  return '';
}

function extractLinkedIn(text: string): string {
  // Try to find full LinkedIn URL
  const linkedinRegex = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9-]+)/i;
  const match = text.match(linkedinRegex);
  if (match) return match[0];

  // Look for "LinkedIn" text followed by a link or username
  const lines = text.split('\n');
  for (const line of lines) {
    if (line.toLowerCase().includes('linkedin')) {
      // Extract any URL-like pattern after LinkedIn
      const urlMatch = line.match(/linkedin[^|]*?(https?:\/\/[^\s|]+)/i);
      if (urlMatch) return urlMatch[1];
      // Try to find username pattern
      const usernameMatch = line.match(/linkedin[^|]*?\/in\/([a-zA-Z0-9-]+)/i);
      if (usernameMatch) return `linkedin.com/in/${usernameMatch[1]}`;
    }
  }

  return '';
}

function extractWebsite(text: string): string {
  // More strict website regex to avoid matching numbered lists like "1.Employee"
  const websiteRegex = /(?:https?:\/\/|www\.)[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[\w-]*)?|\b[a-zA-Z0-9-]+\.(?:com|org|net|io|me|in|edu|gov|co|us|ai|tech|portfolio|website|github\.io)\b(?:\/[\w-]*)?/gi;
  const matches = text.match(websiteRegex);
  if (matches) {
    const filtered = matches.filter(url =>
      !url.includes('linkedin') &&
      !url.includes('github.com') && // github.io is okay for personal site
      !url.includes('@') &&
      !/^\d/.test(url) && // Cannot start with a digit (avoid 1.Employee)
      !['gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com', 'icloud.com'].includes(url.toLowerCase())
    );
    return filtered[0] || '';
  }
  return '';
}

function extractSkills(text: string): string[] {
  const commonSkills = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'PHP', 'Swift', 'Kotlin',
    'React', 'Angular', 'Vue', 'Node.js', 'Express', 'Django', 'Flask', 'Spring', 'Laravel',
    'HTML', 'CSS', 'SASS', 'Tailwind', 'Bootstrap', 'Material-UI',
    'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Elasticsearch',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'Git', 'CI/CD',
    'REST API', 'GraphQL', 'WebSocket', 'Microservices',
    'Agile', 'Scrum', 'Jira', 'Leadership', 'Communication',
    'Machine Learning', 'Data Analysis', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy',
    'Figma', 'Sketch', 'Adobe XD', 'Photoshop', 'Illustrator',
    'SEO', 'Google Analytics', 'Marketing', 'Content Strategy',
    'Recruitment', 'Talent Acquisition', 'Sourcing', 'Screening', 'Employee Relations', 'Onboarding', 'Performance Management'
  ];

  const foundSkills: Set<string> = new Set();
  const lowerText = text.toLowerCase();

  // 1. Check for common skills in the entire text
  for (const skill of commonSkills) {
    const escapedSkill = skill.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`\\b${escapedSkill}\\b`, 'i');
    if (pattern.test(lowerText)) {
      foundSkills.add(skill);
    }
  }

  // 2. Extract from "Skills" section explicitly
  const lines = text.split('\n');
  let inSkillsSection = false;

  for (const line of lines) {
    const trimLine = line.trim();
    const lowerLine = trimLine.toLowerCase();

    // Check for header start
    const skillsKeywords = [
      'skills', 'technical skills', 'core competencies', 'key skills', 'computer skills',
      'expertise', 'technologies', 'tech stack', 'technical expertise',
      'core skills', 'areas of expertise', 'professional skills', 'skill set',
      'skills & expertise', 'technical proficiency', 'technical profile', 'key competencies'
    ];
    const foundHeader = skillsKeywords.find(h =>
      isHeaderMatch(line, [h]) ||
      lowerLine.startsWith(h + ' ') ||
      lowerLine.startsWith(h + ' |') ||
      lowerLine.includes('technologies')
    );


    if (foundHeader) {
      inSkillsSection = true;
      // If there is content on this line after the header, parse it
      // Standardize the line to remove markers before extracting content
      const cleanLineForContent = trimLine.replace(/^[\s\t\n*#._:-]+/, '').replace(/[\s\t\n*#._:-]+$/, '').trim();
      const content = cleanLineForContent.substring(foundHeader.length).replace(/^[:|]\s*/, '').trim();

      if (content.length > 0) {
        const candidates = content.split(/[,|]/).map(s => s.trim());
        for (const candidate of candidates) {
          if (candidate.length > 1 && candidate.length < 30) {
            foundSkills.add(candidate.replace(/^[-*]\s*/, ''));
          }
        }
      }
      continue;
    }

    if (inSkillsSection) {
      // Stop if we hit another section or a line with a date (skills shouldn't have dates)
      if (isHeaderMatch(line, ['experience', 'work experience', 'education', 'projects', 'summary', 'profile', 'certifications', 'languages', 'interests', 'contact', 'employment details', 'work history']) || (line.match(/\d{4}/) && line.length < 50)) {
        break;
      }



      // Split by common delimiters and add to skills if it looks like a skill
      if (trimLine.length > 0) {
        const candidates = trimLine.split(/[,|]/).map(s => s.trim());
        let stopParsing = false;

        for (const candidate of candidates) {
          const lowerCandidate = candidate.toLowerCase();
          // Check if this "skill" is actually a section header
          const isSectionHeader = ['experience', 'work experience', 'professional experience', 'employment', 'education', 'projects', 'summary', 'profile'].some(h =>
            lowerCandidate === h || lowerCandidate.startsWith(h + ' ')
          );

          if (isSectionHeader) {
            stopParsing = true;
            break;
          }

          if (candidate.length > 1 && candidate.length < 30) {
            // Basic cleanup
            foundSkills.add(candidate.replace(/^[-*]\s*/, ''));
          }
        }

        if (stopParsing) {
          break;
        }
      }
    }
  }

  return Array.from(foundSkills);
}

function extractSummary(text: string): string {
  const summaryKeywords = ['professional summary', 'summary', 'profile', 'about', 'objective', 'overview', 'about me', 'professional profile'];
  const lines = text.split('\n');

  let summaryStartIndex = -1;
  let summaryEndIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (isHeaderMatch(line, summaryKeywords) && line.length < 50) {
      summaryStartIndex = i + 1;
      break;
    }
  }


  // Fallback: If no header found, assume the first few lines of content (not info) is summary
  if (summaryStartIndex === -1) {
    // Skip name, email, phone lines
    let foundContentIdx = 0;
    for (let i = 0; i < Math.min(lines.length, 15); i++) {
      const line = lines[i].toLowerCase().trim();
      const isInfo = line.includes('@') || line.match(/[\d+-\s()]{10,}/);
      const nameKeywords = ['gmail.com', 'linkedin.com', 'github.com', 'http', 'www.'];
      const isMoreInfo = nameKeywords.some(k => line.includes(k));

      if (!isInfo && !isMoreInfo && line.length > 20) {
        foundContentIdx = i;
        break;
      }
    }
    summaryStartIndex = foundContentIdx;
  }

  // Find end (next section header)
  const sectionKeywords = [
    'experience', 'work experience', 'professional experience', 'employment', 'employment history', 'work history', 'career history', 'employment details', 'work details', 'working experience', 'work profile',
    'education', 'academic background', 'academic history', 'educational background',
    'skills', 'key skills', 'technical skills', 'core competencies', 'core skills', 'areas of expertise', 'expertise', 'technical profile', 'professional skills', 'skill set', 'skills & expertise', 'technologies',
    'projects', 'personal projects', 'technical projects',
    'languages', 'linguistic skills', 'language proficiency',
    'certifications', 'certificates', 'awards', 'achievements',
    'summary', 'professional summary', 'profile', 'professional profile', 'about me', 'career outline',
    'interests', 'hobbies', 'additional information', 'personal details', 'contact', 'contact information', 'personal information'
  ];


  for (let i = summaryStartIndex; i < lines.length; i++) {
    const line = lines[i];
    const isHeader = isHeaderMatch(line, sectionKeywords);

    // Skip if it's the same or similar keyword as the current section
    const fuzzyLine = normalizeFuzzy(line);
    const isRedundant = summaryKeywords.some(kw => normalizeFuzzy(kw) === fuzzyLine);

    if (isHeader && !isRedundant) {
      summaryEndIndex = i;
      break;
    }
  }


  if (summaryEndIndex === -1) summaryEndIndex = Math.min(summaryStartIndex + 10, lines.length);

  const summaryLines = lines.slice(summaryStartIndex, summaryEndIndex);
  const fullSummary = summaryLines.join(' ').trim();
  // Sanitize: remove floating asterisks (artifacts of failed bolding detection)
  const sanitized = fullSummary.replace(/(^|[^\w])\*([^\w]|$)/g, '$1 $2').replace(/\s+/g, ' ').trim();
  return cleanSummaryText(sanitized);
}


export function extractExperience(text: string): any[] {
  const experiences: any[] = [];
  const lines = text.split('\n').map(l => l.trim());

  const experienceKeywords = [
    'experience', 'work experience', 'professional experience', 'employment history', 'work history',
    'career history', 'employment', 'work', 'history', 'professional background', 'work background',
    'career profile', 'career summary', 'professional journey', 'experience summary', 'employment details', 'work details',
    'professional profile', 'assignments', 'organizational experience', 'working experience', 'career outline'
  ];
  let experienceStartIndex = -1;
  let experienceEndIndex = lines.length;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Check if line contains keyword and is short (likely a header)
    if (isHeaderMatch(line, experienceKeywords)) {
      experienceStartIndex = i + 1;
      break;
    }
  }


  // Fallback: If no header found, search the entire document but be more selective
  if (experienceStartIndex === -1) {
    console.log('Experience parsed: No header found, scanning whole document');
    experienceStartIndex = 0;
    experienceEndIndex = lines.length;
  } else {
    // Find end only if we found a header
    for (let i = experienceStartIndex; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      const stopKeywords = [
        'education', 'technical skills', 'key skills', 'projects',
        'languages', 'certifications', 'certificates', 'achievements', 'awards',
        'interests', 'hobbies', 'summary', 'profile', 'additional information',
        'volunteering', 'references',
        'personal details', 'links'
      ];

      const isBullet = /^[\s\t]*[\-\u2022\u25CF\u25AA\u25AB\u2219\u25CB\u25E6\u2023\u2043\u2044\uF0B7\u27A2\u27A4\u25B6\u25B2\u25BC\u25C6\u25C7\u25D8\u25D9\u25A0\u25A1\u25AA\u25AB\u00B7\d\.]/.test(line);
      const prevWasBullet = i > experienceStartIndex && /^[\s\t]*[\-\d\.]/.test(lines[i - 1]);

      if (!isBullet && stopKeywords.some(k => isHeaderMatch(line, [k]))) {
        // Double check: if it's a short line and we have NO entries yet, maybe it's NOT a stop header
        if (experiences.length === 0 && line.length > 30) continue;

        // CRITICAL FIX: Ignore "Skills: Java, React" lines inside experience blocks.
        // A real section header is usually short "Skills" or "Technical Skills".
        // If it contains a colon and is long, it's content.
        if (line.includes(':') && line.length > 25) {
          const lower = line.toLowerCase();
          // Exceptions: "Contact:", "Links:" might be valid stops? No, usually "Skills Used:" is the culprit.
          if (lower.includes('skills') || lower.includes('technologies')) {
            continue;
          }
        }

        // CRITICAL FIX: If we are in Fallback Mode (experienceStartIndex === 0), it means we missed the "Experience" header.
        // We are scanning from the top of the file.
        // We MUST NOT Stop at headers that commonly appear *before* Experience (like Summary, Profile, Skills, Contact).
        // We should primarily stop at headers that usually come *after* (References, Projects - sometimes).
        if (experienceStartIndex === 0) {
          const commonPreHeaders = ['summary', 'profile', 'contact', 'personal', 'info', 'skills', 'competencies', 'education', 'languages', 'interests'];
          const isPreHeader = commonPreHeaders.some(ph => line.toLowerCase().includes(ph));

          if (isPreHeader) {
            console.log(`[PARSER] Fallback: Ignoring potential pre-header "${line}" to continue searching for experience.`);
            continue;
          }
        }

        if ((line === 'projects' || line === 'certifications' || line === 'awards' || line === 'skills') && i + 1 < lines.length) {
          const nextIsBullet = /^[\s\t]*[\-]/.test(lines[i + 1].toLowerCase());
          if (prevWasBullet || nextIsBullet) {
            continue;
          }
        }

        // Remove my previous patch which relied on 'experiences.length' which is always 0 here
        // The above check handles the fallback case correctly now.

        console.log(`[PARSER] Experience extraction STOPPED at line ${i}: "${line}"`);
        experienceEndIndex = i;
        break;
      }
      if (!isBullet && line === 'skills' && i + 1 < lines.length && !/^[\s\t]*[\-\d\.]/.test(lines[i + 1])) {
        experienceEndIndex = i;
        break;
      }
    }
  }

  // Extended Date Regex to support "2023 - Present", "2 0 2 1 - 2 0 2 5", "'21", "since Jan 2022", etc.
  const yearPat = /(?:2\s*0\s*\d\s*\d|1\s*9\s*\d\s*\d|'\s*\d\s*\d|\b\d{2}\b)/;
  const monthPat = /(?:j\s*a\s*n|f\s*e\s*b|m\s*a\s*r|a\s*p\s*r|m\s*a\s*y|j\s*u\s*n|j\s*u\s*l|a\s*u\s*g|s\s*e\s*p|o\s*c\s*t|n\s*o\s*v|d\s*e\s*c)[a-z\s]*\.?|\b(?:0?[1-9]|1[0-2])\b/;

  // Helper patterns for the main regex
  const datePart = `(?:(?:${monthPat.source})[\\s\\/\\.\\-]*?)?(?:${yearPat.source})`;
  const separator = `(?:\\s*(?:[-]|\\bto\\b|\\bsince\\b)\\s*|\\s+(?=\\b(?:present|now|current|'|2\s*0\s*\d\s*\d|1\s*9\s*\d\s*\d|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|0|1)\\b))`;

  const dateRegex = new RegExp(`(?:${datePart}${separator}(?:present|now|current|${datePart}))|(?:\\b(?:since|from|joined|started)\\b\\s*${datePart})|${datePart}|\\b${yearPat.source}\\b`, 'i');

  const splitRegex = /(?:[-]|\bto\b|\s+(?=\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|present|now|current|'|2\s*0\s*\d\s*\d|1\s*9\s*\d\s*\d|0[1-9]|1[0-2])\b))/i;

  let currentBlock: string[] = [];

  const processBlock = (block: string[]) => {
    if (block.length === 0) return;

    // SKIP if it looks like an education block (but be careful not to skip experience that mentions degrees)
    // Only skip if the line is short < 15 words AND contains degree keywords
    const isEduBlock = block.some(l => {
      const ll = l.toLowerCase();
      const words = l.split(' ').length;
      return words < 15 && (ll.includes('bachelor') || ll.includes('master') || ll.includes('university') || ll.includes('college') || ll.includes('degree') || ll.includes('mba ') || ll.includes(' bsc') || ll.includes(' btech')) && !ll.includes('engineer') && !ll.includes('manager') && !ll.includes('lead');
    });
    if (isEduBlock && block.length < 5) {
      console.log('[PARSER] Skipped potential Education block in experience section:', block[0]);
      return;
    }

    let company = '';
    let position = '';
    let startDate = '';
    let endDate = '';
    let location = '';
    let descriptionLines: string[] = [];

    // Safety: If dateLineIndex is found, we should prioritize that line's match
    // But we also check the whole block text for a match.

    // Find date
    const dateLineIndex = block.findIndex(l => dateRegex.test(l));
    if (dateLineIndex !== -1) {
      const dateMatch = block[dateLineIndex].match(dateRegex);
      if (dateMatch) {
        const dateStr = dateMatch[0].replace(/[()]/g, '');
        if (dateStr.match(splitRegex) || dateStr.toLowerCase().includes('present')) {
          const parts = dateStr.split(splitRegex);
          startDate = parts[0]?.trim() || '';
          endDate = parts[1]?.trim() || (dateStr.toLowerCase().includes('present') ? 'Present' : '');
        } else if (dateStr.toLowerCase().match(/\bsince\b|\bfrom\b|\bjoined\b/)) {
          // "Since Jan 2021" -> treat as start date and current role
          startDate = dateStr.replace(/since|from|joined/i, '').trim();
          endDate = 'Present';
        } else {
          // Single date: "2023" -> treat as start if no separator
          endDate = dateStr.trim();
          startDate = dateStr.trim();
        }
      }
      const dateLine = block[dateLineIndex];
      // Use a global version of dateRegex to remove ALL dates from the header line
      const globalDateRegex = new RegExp(dateRegex.source, 'gi');
      // Fix: Don't strip separators like - or | aggressively. Only strip parens that might have wrapped the date.
      let textWithoutDate = dateLine.replace(globalDateRegex, '').replace(/[()]/g, '').trim();

      // Cleanup leading/trailing separators left over
      textWithoutDate = textWithoutDate.replace(/^[-|,\s]+|[-|,\s]+$/g, '').trim();

      // Sometimes date line also has "Company | Date" or "Position | Date"
      if (textWithoutDate.length > 3) {
        // If the rest of the line is substantial, maybe it's Company or Location?
        if (textWithoutDate.match(/bangalore|mumbai|delhi|usa|uk/i) && textWithoutDate.length < 20) {
          location = textWithoutDate;
        } else {
          // Check for separators to split Company | Position
          const sep = textWithoutDate.includes('||') ? '||' : (textWithoutDate.includes('|') ? '|' : (textWithoutDate.includes(' - ') ? ' - ' : (textWithoutDate.includes(',') ? ',' : '')));

          if (sep) {
            const parts = textWithoutDate.split(sep).map(s => s.trim()).filter(p => p.length > 0);
            if (parts.length >= 2) {
              const p1 = parts[0];
              const p2 = parts[1];
              const posRegex = /manager|engineer|developer|hr|hrbp|human\s*resource|recruiter|talent|acquisition|executive|analyst|associate|lead|director|head|specialist|intern|member|coordinator|consultant|assistant|officer|trainee|programmer|programme\s*r|instructor/i;
              const isP1Pos = posRegex.test(normalizeFuzzy(p1));
              const isP2Pos = posRegex.test(normalizeFuzzy(p2));

              if (isP1Pos && !isP2Pos) {
                position = p1;
                company = p2;
              } else if (isP2Pos && !isP1Pos) {
                company = p1;
                position = p2;
              } else {
                // Fallback: Assume Company | Position
                company = p1;
                position = p2;
              }
            } else {
              company = textWithoutDate;
            }
          } else {
            company = textWithoutDate;
          }
        }
      }

      block.splice(dateLineIndex, 1);
    }

    // Identify Position and Company from remaining lines
    for (let i = 0; i < Math.min(3, block.length); i++) {
      const line = block[i];
      const lowerLine = line.toLowerCase();

      // If line contains both, split it
      if ((line.includes(',') || line.includes('|') || line.includes('||') || line.includes(' - ') || line.includes(' at ')) && !position && !company) {
        const sep = line.includes('||') ? '||' : (line.includes('|') ? '|' : (line.includes(' - ') ? ' - ' : (line.includes(' at ') ? ' at ' : ',')));
        const parts = line.split(sep);
        const p1 = parts[0].trim();
        const p2 = parts[1].trim();

        const posRegex = /manager|engineer|developer|hr|hrbp|human\s*resource|recruiter|talent|acquisition|executive|analyst|associate|lead|director|head|specialist|intern|member|coordinator|consultant|assistant|officer|trainee|programmer|representative|expert|staff|designer|adviser|advisor|aide|attendant|clerk|operative|support|technician|worker/i;
        const isP1Pos = posRegex.test(normalizeFuzzy(p1));
        const isP2Pos = posRegex.test(normalizeFuzzy(p2));

        if (isP1Pos && !isP2Pos) {
          position = p1;
          company = p2;
        } else if (isP2Pos && !isP1Pos) {
          position = p2;
          company = p1;
        } else if (isP1Pos && isP2Pos) {
          // If both have positions, p2 is often the more specific role/keyword (e.g. Intern || Programmer)
          if (p2.toLowerCase().includes('intern') || p2.toLowerCase().includes('programmer') || p2.toLowerCase().includes('developer')) {
            position = p2;
            company = p1;
          } else if (i === 0) {
            // Usually p1 is Company if it's the first line and p2 is a role
            position = p2;
            company = p1;
          } else {
            position = p1;
            company = p2;
          }
        }
      }

      // Clean Position: Strip suffix like 'Remote', 'Remote ||', or date fragments
      if (position) {
        position = position.replace(/\b(remote|intern|1st|sep|30|sep)\b/gi, '').replace(/\|\|/g, '').trim();
        position = position.replace(/\s{2,}/g, ' ');
        if (position.endsWith('|')) position = position.slice(0, -1).trim();
        if (!position) position = 'Unknown Position';
      }

      // Allow lines with bullets if they are short and likely titles
      const hasBullet = /^[\s\t]*[\-]/.test(line);
      const cleanTitleLine = line.replace(/^[\s\t]*[\-]\s*/, '').trim();

      if (line.split(' ').length < 20) {
        const isPos = /manager|engineer|developer|hr|hrbp|human\s*resource|recruiter|talent|acquisition|executive|analyst|associate|lead|director|head|specialist|intern|member|coordinator|consultant|assistant|officer|trainee|programmer|programme\s*r|instructor/i.test(normalizeFuzzy(cleanTitleLine));

        // Safety: If it looks like a project title (contains 'Website', 'Application', 'Clone', 'App'), don't treat as Position
        const isProjectTitle = /\b(website|application|clone|app|project|portfolio|sundown|bank|food delivery)\b/i.test(lowerLine);

        if (!position && isPos && !isProjectTitle) {
          position = cleanTitleLine;
          block.splice(i, 1); i--; continue;
        } else if (!company && !isPos && position) {
          company = cleanTitleLine;
          block.splice(i, 1); i--; continue;
        } else if (!company && !isPos && !position && !isProjectTitle && !hasBullet) {
          // Fallback: If it's the first line and not a bullet, assume it's the title/company
          if (i === 0) position = cleanTitleLine;
          else company = cleanTitleLine;
          block.splice(i, 1); i--; continue;
        }
      }
    }

    // Process description lines: Merge continuation lines with their parent bullets
    const mergedDescriptionLines: string[] = [];
    // Require a space after hyphen or asterisk to be considered a bullet point
    // We also avoid matching asterisk if it's likely a bold marker artifact
    const bulletRegex = /^[\s\t]*([]|[-]\s+|\*\s+)/;

    let sawEmptyLine = false;
    for (let i = 0; i < block.length; i++) {
      const line = block[i].trim();
      if (!line) {
        sawEmptyLine = true;
        continue;
      }

      const hasBullet = bulletRegex.test(line);
      let cleanLine = line.replace(bulletRegex, '').trim();

      // Sanitize: remove floating asterisks (artifacts of failed bolding detection)
      cleanLine = cleanLine.replace(/\*/g, '').replace(/\s+/g, ' ').trim();
      if (!cleanLine) continue;

      if (hasBullet) {
        // Explicit bullet is always a new point
        mergedDescriptionLines.push(cleanLine);
        sawEmptyLine = false;
      } else {
        let shouldBeNewPoint = false;
        if (mergedDescriptionLines.length > 0) {
          const lastLine = mergedDescriptionLines[mergedDescriptionLines.length - 1].trim();
          const lastLineEndsPeriod = /[.!?]$/.test(lastLine);
          const currentStartsCapital = /^[A-Z]/.test(cleanLine);
          const joiningWords = /^(and|or|but|with|using|by|for|from|to|in|on|at|as|is|was|were|which|that|also|including|specially|particularly)\b/i;
          const startsWithJoiningWord = joiningWords.test(cleanLine);

          // USER'S RULE: Period + Capital = NEW BULLET (NO empty line required!)
          // Split if previous ends with period AND current starts with Capital
          if (lastLineEndsPeriod && currentStartsCapital && !startsWithJoiningWord && cleanLine.length > 5) {
            shouldBeNewPoint = true;
          }
          // Also split if we saw an empty line and other conditions
          else if (sawEmptyLine && !startsWithJoiningWord && (lastLineEndsPeriod || (currentStartsCapital && cleanLine.length > 20))) {
            if (lastLineEndsPeriod && cleanLine.length > 10) {
              shouldBeNewPoint = true;
            } else if (!lastLineEndsPeriod && currentStartsCapital && cleanLine.length > 20) {
              shouldBeNewPoint = true;
            }
          }



        }

        if (shouldBeNewPoint || mergedDescriptionLines.length === 0) {
          mergedDescriptionLines.push(cleanLine);
        } else {
          // Join continuation lines
          const idx = mergedDescriptionLines.length - 1;
          const lastLine = mergedDescriptionLines[idx];
          // Determine separator: space normally, but empty string if joining punctuation
          const separator = (/^[.,;:!?)\]]/.test(cleanLine) || lastLine.endsWith('(') || lastLine.endsWith('[')) ? '' : ' ';
          mergedDescriptionLines[idx] = lastLine + separator + cleanLine;
        }
        sawEmptyLine = false;
      }
    }

    descriptionLines = mergedDescriptionLines;

    if (!company) company = 'Unknown Company';
    if (!position) position = 'Unknown Position';

    // Second-pass: If position contains certain company keywords, swap them!
    if (position.match(/inc\.|ltd\.|solutions|systems|technologies|group|corp\.|codsoft/i) && !company.match(/inc\.|ltd\.|solutions|systems|technologies|group|corp\.|codsoft/i)) {
      [position, company] = [company, position];
    }

    // Position/Company cleanup for Internships
    // Only swap if company looks like a position AND position doesn't look like a position
    // OR if position looks like a known company pattern
    const companyIsKnownPattern = company.toLowerCase().match(/inc\.|ltd\.|solutions|systems|technologies|group|corp\.|codsoft/i);

    if (company.toLowerCase().includes('intern') && !position.toLowerCase().includes('intern') && !companyIsKnownPattern) {
      [position, company] = [company, position];
    }

    // FINAL Reject: If position is STILL a project title, ignore this block
    // Refined: Only reject if it lacks job keywords and contains project keywords
    const positionLower = position.toLowerCase();
    const companyLower = company.toLowerCase();
    const projectKeywordsRegex = /\b(website|application|clone|portfolio|sundown)\b/i;
    const jobKeywordsRegex = /manager|engineer|developer|executive|analyst|associate|lead|director|head|recruiter|specialist|intern|member|coordinator|consultant|assistant|officer|trainee|representative|specialist|officer|expert|lead|head|director|manager|executive|analyst|associate|staff|engineer|developer|programmer|intern|trainee|coordinator|administrator|supervisor|practitioner|adviser|advisor|aide|attendant|clerk|operative|support|technician|worker|designer/i;

    if (projectKeywordsRegex.test(positionLower) && !jobKeywordsRegex.test(positionLower)) return;

    // For companies, avoid rejecting valid names like "Zomato Food Delivery" or "HDFC Bank"
    // Only reject if it's clearly a project context
    if (/\b(clone|website)\b/i.test(companyLower) && company.split(' ').length > 1) return;

    console.log('Experience Found:', { company, position, startDate, endDate });

    experiences.push({
      id: Date.now().toString() + Math.random(),
      company,
      position,
      location,
      startDate,
      endDate,
      current: endDate.toLowerCase().includes('present'),
      description: descriptionLines.join('\n')
    });
  };

  for (let i = experienceStartIndex; i < experienceEndIndex; i++) {
    const line = lines[i];
    const lowerLine = line.toLowerCase();

    // Skip standalone junk headers that might appear within the section
    const lineContent = normalizeFuzzy(line);
    if ((lineContent === 'experience' || lineContent === 'projects' || lineContent === 'workexperience') && line.length < 30) {
      continue;
    }

    const hasDate = dateRegex.test(line);

    // Grouping logic:
    // If we hit a line with a date, it strongly signals a new entry.
    // If the current block already has a date, we MUST split.
    const blockHasDate = currentBlock.some(l => dateRegex.test(l));

    // Also split if we see a very clear new position keyword in a line (slightly more generous with length)
    const isNewPosLine = /manager|engineer|developer|hr|human\s*resource|recruiter|talent|acquisition|hrbp|executive|analyst|associate|lead|director|head|specialist|intern|member|coordinator|consultant|assistant|officer|trainee|programmer|representative|supervisor|administrator|staff|professional|worker|technician|expert/i.test(lowerLine) && line.split(' ').length < 20 && !blockHasDate;

    if ((hasDate && blockHasDate) || isNewPosLine) {
      // Split! 
      // Heuristic: If the last line in currentBlock has no date and is short, 
      // it might be the header/title of the NEW block. Move it over.
      const lastLine = currentBlock[currentBlock.length - 1];
      const looksLikeHeader = lastLine && lastLine.length < 80 && !dateRegex.test(lastLine) && !/^[\s\t]*[\-\d\.]/.test(lastLine);

      if (looksLikeHeader && !isNewPosLine) {
        const headerLine = currentBlock.pop();
        processBlock(currentBlock);
        currentBlock = [headerLine!, line];
      } else {
        processBlock(currentBlock);
        currentBlock = [line];
      }
    } else {
      currentBlock.push(line);
    }
  }

  processBlock(currentBlock);

  return experiences.map(exp => ({
    ...exp,
    description: cleanDescription(exp.description)
  }));
}

export function extractEducation(text: string): any[] {
  const education: any[] = [];
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  console.log('Parsing Education, total lines to process:', lines.length);

  const educationKeywords = ['education', 'academic background', 'educational', 'qualifications', 'credentials', 'scholastic achievements', 'academic history'];
  let educationStartIndex = -1;
  let educationEndIndex = lines.length;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (isHeaderMatch(line, educationKeywords)) {
      educationStartIndex = i + 1;
      break;
    }
  }


  const degreeKeywords = [
    'bachelor', 'batchelor', 'bachlor', 'bacheler', 'master', 'mphil', 'phd', 'associate', 'diploma', 'certificate',
    'b.s.', 'm.s.', 'b.a.', 'm.a.', 'b.tech', 'm.tech', 'btech', 'mtech', 'b.e', 'b.e.',
    'bba', 'mba', 'mca', 'bca', 'be', 'me', 'b.com', 'b.sc', 'bsc', 'bcom', 'b.arch', 'msw', 'msc', 'bsc', 'ma', 'ba', 'mcom', 'm.phil', 'pgdm',
    'chemistry', 'physics', 'mathematics', 'maths', 'biology', 'botany', 'zoology', 'biotechnology', 'computer science', 'engineering', 'it', 'artificial intelligence', 'data science',
    'high school', 'secondary', 'higher secondary', 'class x', 'class xii', 'x th', 'xii th', 'puc', 'intermediate', 'sslc', 'hsc', 'cbse', 'icse', 'state board', 'matriculation'
  ];
  const institutionKeywords = ['university', 'college', 'school', 'institute', 'academy', 'polytechnic', 'vidyalaya', 'campus', 'board', 'exam', 'secondary school', 'higher secondary school'];

  if (educationStartIndex === -1) {
    console.log('Education parsed: No header found, using fallback scan');
    // FALLBACK: If no header, scan the whole document for degree-sounding lines
    const fallbackLines: string[] = [];
    lines.forEach(l => {
      const ll = l.toLowerCase();
      // Look for lines that contain bachelor, master, degree, university, etc.
      if (degreeKeywords.some(dk => ll.includes(dk)) || institutionKeywords.some(ik => ll.includes(ik))) {
        if (l.length < 150) fallbackLines.push(l);
      }
    });

    if (fallbackLines.length > 0) {
      // Create a dummy education entry from these lines
      return [{
        id: 'fallback-' + Date.now(),
        degree: fallbackLines.join(', ').substring(0, 100),
        institution: 'Extracted from Resume Content',
        fieldOfStudy: '',
        startDate: '',
        endDate: '',
        current: false,
        grade: ''
      }];
    }
    return [];
  }

  for (let i = educationStartIndex; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    // Removed 'summary', 'profile' from stop keywords to allow 2-column overlap parsing
    const stopKeywords = [
      'skills', 'experience', 'projects', 'certifications', 'certificates',
      'achievements', 'awards', 'languages', 'hobbies', 'interests', 'work experience', 'professional experience',
      'technical skills', 'functional skills', 'volunteering', 'volunteer', 'personal information', 'links'
    ];

    if (isHeaderMatch(line, stopKeywords)) {
      educationEndIndex = i;
      break;
    }

  }

  // Updated Regex: Supports "2019 - 2023", "2 0 2 1 - 2 0 2 5", "(2023)", "0 5 / 2 0 2 1"
  // CRITICAL: Removed 'g' flag to prevent stateful .test() bugs.
  const dateRegex = dateRegexRaw;



  let currentBlock: string[] = [];

  const processBlock = (block: string[]) => {
    if (block.length === 0) return;

    // Split single-line merged entries (e.g. "PGDM, Bhavan's, 2009")
    // If a line contains comma and looks like it has multiple parts
    const expandedBlock: string[] = [];
    block.forEach(line => {
      const parts = line.split(/[,|-]/).map(p => p.trim()).filter(p => p.length > 2);

      // Heuristic: If line has degree AND institution keywords, split it!
      const lineContent = normalizeFuzzy(line);
      const hasDeg = degreeKeywords.some(k => lineContent.includes(k));
      const hasInst = institutionKeywords.some(k => lineContent.includes(k));

      if ((hasDeg && hasInst) || (parts.length > 2 && hasDeg)) {
        expandedBlock.push(...parts);
      } else {
        expandedBlock.push(line);
      }
    });
    block = expandedBlock;

    // Check if block contains relevant education info before processing
    // Relaxed anchors to include Field of Study and common subjects
    const textContent = block.join(' ').toLowerCase();
    const hasDegree = degreeKeywords.some(k => textContent.includes(k));
    const hasInst = institutionKeywords.some(k => textContent.includes(k));
    const hasDate = dateRegex.test(textContent);

    if (!hasDegree && !hasInst && !hasDate) return;

    // Filter out very short noisy blocks (like just a bullet, gpa shard, or single word)
    if (block.length <= 1 && block[0].length < 25 && !hasDegree && !hasInst) return;
    if (block.join(' ').match(/^[\s\d\.\)\-]+$/)) return; // Pure numbers/separators
    if (textContent.includes('cgpa') && textContent.length < 15) return; // GPA Fragment
    if (textContent.includes('8. 3 )') || textContent.includes('avg cgpa')) return; // Clear Muskan specific fragment

    let degree = '';
    let institution = '';
    let startDate = '';
    let endDate = '';
    let location = '';
    let gpa = '';
    let field = '';

    // Find date line
    const dateLineIndex = block.findIndex(l => dateRegex.test(l));
    if (dateLineIndex !== -1) {
      const dateMatch = block[dateLineIndex].match(dateRegex);
      if (dateMatch) {
        const dateStr = dateMatch[0].replace(/[()]/g, '');
        if (dateStr.match(/(?:[-]|\bto\b)/i)) {
          const parts = dateStr.split(/(?:[-]|\bto\b)/i);
          startDate = parts[0]?.trim() || '';
          endDate = parts[1]?.trim() || '';
        } else {
          endDate = dateStr.trim();
        }
      }
    }

    // GPA Extraction
    const gpaMatch = block.find(l => {
      const ll = l.toLowerCase();
      return ll.includes('gpa') || ll.includes('cgpa') || ll.includes('percentage') || (ll.includes('%') && ll.length < 20);
    });
    if (gpaMatch) {
      gpa = gpaMatch.split(/[:|-]/)[1]?.trim() || gpaMatch;
    }

    // Identify Degree and Institution from remaining lines
    for (const line of block) {
      if (dateRegex.test(line)) continue;

      // Skip if it's ONLY a GPA line with no other substantial text
      const isPureGpaLine = (fuzzyInclude(line, 'gpa') || fuzzyInclude(line, 'cgpa')) && line.length < 25;
      if (isPureGpaLine) continue;

      const isDegree = degreeKeywords.some(k => fuzzyInclude(line, k));
      const institutionMatch = institutionKeywords.find(k => fuzzyInclude(line, k));

      if (isDegree && !degree) {
        degree = line;
      } else if (institutionMatch && !institution) {
        institution = line;
      }
    }

    // Heuristic: Extract Field of Study from degree line if not found
    if (degree && !field) {
      // Look for content after "in", "of", " - ", " : ", or " | "
      const fieldMatch = degree.match(/(?:\bin\b|\bof\b)\s+([^,|-|\(]+)/i) ||
        degree.match(/\s*[(\-\:|\|)]\s*([^,|-|\(\n]+)/);
      if (fieldMatch) field = fieldMatch[1].trim();
    }
    if (!degree || !institution) {
      const candidates = block.filter(l => !dateRegex.test(l) && l.length > 4 && !l.toLowerCase().includes('gpa'));

      // If we have candidates and missing fields
      if (candidates.length > 0) {
        if (!degree && !institution) {
          if (candidates[0]) institution = candidates[0];
          if (candidates[1]) degree = candidates[1];
        } else if (institution && !degree) {
          const d = candidates.find(c => c !== institution);
          if (d) degree = d;
        } else if (degree && !institution) {
          const i = candidates.find(c => c !== degree);
          if (i) institution = i;
        }
      }
    }

    if (!degree) degree = 'Unknown Degree';
    if (!institution) institution = 'Unknown Institution';

    console.log('Education Parsed Entry:', { degree, institution });

    education.push({
      id: Date.now().toString() + Math.random(),
      institution,
      degree,
      field,
      location,
      startDate,
      endDate,
      current: false,
      gpa
    });
  };

  for (let i = educationStartIndex; i < educationEndIndex; i++) {
    const line = lines[i];
    const hasDate = dateRegex.test(line);

    const lineHasDegree = degreeKeywords.some(k => fuzzyInclude(line, k));
    const lineHasInst = institutionKeywords.some(k => fuzzyInclude(line, k));
    const blockHasDegree = currentBlock.some(l => degreeKeywords.some(k => fuzzyInclude(l, k)));
    const blockHasInst = currentBlock.some(l => institutionKeywords.some(k => fuzzyInclude(l, k)));
    const blockHasDate = currentBlock.some(l => dateRegex.test(l));

    // Split if:
    // 1. We have a new date and already have a date in current block
    // 2. We have a new degree and already have a degree in current block
    // 3. We have a new institution and already have an institution in current block
    if ((hasDate && blockHasDate) || (lineHasDegree && blockHasDegree) || (lineHasInst && blockHasInst)) {
      processBlock(currentBlock);
      currentBlock = [line];
    } else {
      currentBlock.push(line);
    }
  }

  processBlock(currentBlock);

  // FINAL DEEP SCAN FALLBACK: If education array is still empty, scan entire lines[] for lone degrees
  if (education.length === 0) {
    lines.forEach((l, idx) => {
      const lineHasDegree = degreeKeywords.some(k => fuzzyInclude(l, k));
      // Only take lines that look like a degree (not too long, contains key keywords)
      if (lineHasDegree && l.length < 150) {
        // Try to find an institution nearby (within 2 lines)
        let inst = 'Unknown Institution';
        for (let offset = -1; offset <= 1; offset++) {
          const nearbyLine = lines[idx + offset];
          if (nearbyLine && institutionKeywords.some(k => fuzzyInclude(nearbyLine, k))) {
            inst = nearbyLine;
            break;
          }
        }
        education.push({
          id: 'fallback-' + Date.now() + Math.random(),
          institution: inst,
          degree: l,
          field: '',
          location: '',
          startDate: '',
          endDate: '',
          current: false,
          gpa: ''
        });
      }
    });
  }

  return education;
}

function extractProjects(text: string): any[] {
  const projects: any[] = [];
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  const projectKeywords = ['projects', 'portfolio', 'notable work', 'personal projects', 'academic projects', 'technical projects', 'key projects', 'selected projects'];
  let projectStartIndex = -1;
  let projectEndIndex = lines.length;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    // More aggressive header detection:
    // 1. Starts with keyword
    // 2. Contains keyword AND is short (likely a header) AND doesn't look like a sentence
    const isHeader = isHeaderMatch(line, projectKeywords);


    if (isHeader) {
      projectStartIndex = i + 1;
      break;
    }
  }

  if (projectStartIndex === -1) return [];

  for (let i = projectStartIndex; i < projectEndIndex; i++) {
    const line = lines[i].toLowerCase();
    const stopKeywords = [
      'certifications', 'languages', 'education', 'references', 'skills', 'technical skills',
      'experience', 'work experience', 'professional experience', 'employment', 'interests', 'hobbies'
    ];

    if (stopKeywords.some(k => line === k || line.startsWith(k + ':') || (line.includes(k) && line.length < 30))) {
      projectEndIndex = i;
      break;
    }
  }

  let currentProject: any = null;
  let description: string[] = [];

  for (let i = projectStartIndex; i < projectEndIndex; i++) {
    const line = lines[i];
    const lowerLine = line.toLowerCase();

    if (line.length > 5 && line.length < 150 && !line.startsWith('-') && !line.startsWith('') &&
      !lowerLine.includes('technologies') && !lowerLine.includes('tech stack')) {
      if (currentProject && description.length > 0) {
        const fullDesc = description.join(' ');
        // Sanitize: remove floating asterisks (artifacts of failed bolding detection)
        currentProject.description = fullDesc.replace(/(^|[^\w])\*([^\w]|$)/g, '$1 $2').replace(/\s+/g, ' ').trim();
        projects.push(currentProject);
      }


      currentProject = {
        id: Date.now().toString() + Math.random(),
        name: line,
        description: '',
        technologies: [],
        url: '',
        startDate: '',
        endDate: ''
      };
      description = [];
    } else if (currentProject) {
      description.push(line);
    }
  }

  if (currentProject) {
    currentProject.description = description.join(' ');
    projects.push(currentProject);
  }

  return projects;
}

function extractCertifications(text: string): any[] {
  const certifications: any[] = [];
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  // Added 'achievements', 'honors', 'certificate' (singular)
  const certKeywords = ['certification', 'certifications', 'certificate', 'certificates', 'licenses', 'licences', 'courses', 'awards', 'honors', 'achievement', 'achievements'];
  let certStartIndex = -1;
  let certEndIndex = lines.length;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    // Relaxed header check
    // Logic: Line must contain one of the keywords.
    // AND:
    // 1. It is exactly the keyword (with optional :)
    // OR 2. It starts with generic words like "key", "core" + keyword? (Maybe not needed for certs)
    // OR 3. It is short (< 50 chars) AND contains "and" or "&" (e.g. "Certificates and Achievements")
    // OR 4. It starts with the keyword

    if (isHeaderMatch(line, certKeywords)) {
      certStartIndex = i + 1;
      break;
    }

  }

  if (certStartIndex === -1) return [];

  for (let i = certStartIndex; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    // Detailed stop condition - Added 'interests', 'hobbies', 'language', 'computer' to prevent them from being parsed as certs
    // Also made matching stricter (must start with or be equal) to avoid false positives in text
    const sectionKeywords = ['experience', 'work experience', 'education', 'skills', 'technical skills', 'key skills', 'projects', 'languages', 'language', 'references', 'summary', 'profile', 'personal details', 'additional information', 'interests', 'hobbies', 'computer'];

    if (isHeaderMatch(line, sectionKeywords)) {
      certEndIndex = i;
      break;
    }

  }

  let currentCert: any = null;

  for (let i = certStartIndex; i < certEndIndex; i++) {
    const line = lines[i];
    // Skip if it looks like a bullet point starter only
    if (line.match(/^[-]$/)) continue;

    // Remove bullets
    const cleanLine = line.replace(/^[-*]\s*/, '').trim();
    if (cleanLine.length < 2) continue;

    const dateRegex = /\b(20\d{2}|19\d{2})\b/;
    const hasDate = dateRegex.test(cleanLine);

    if (currentCert && (hasDate || cleanLine.toLowerCase().includes('issued') || cleanLine.toLowerCase().includes('by'))) {
      // Likely metadata for the previous cert
      if (hasDate) {
        currentCert.date = cleanLine.match(dateRegex)?.[0] || '';
      }
      if (cleanLine.toLowerCase().includes('issued') || cleanLine.toLowerCase().includes('by')) {
        currentCert.issuer = cleanLine;
      }
    } else {
      // New Cert
      currentCert = {
        id: Date.now().toString() + Math.random(),
        name: cleanLine,
        issuer: '',
        date: '',
        url: ''
      };
      certifications.push(currentCert);
    }
  }

  return certifications;
}

function extractLanguages(text: string): any[] {
  const languages: any[] = [];
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  const langKeywords = ['languages', 'language skills', 'linguistic', 'language proficiency'];
  let langStartIndex = -1;
  let langEndIndex = lines.length;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (isHeaderMatch(line, langKeywords)) {
      langStartIndex = i + 1;
      break;
    }
  }


  if (langStartIndex === -1) return [];

  for (let i = langStartIndex; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    const stopKeywords = [
      'references', 'hobbies', 'interests', 'experience', 'work experience',
      'professional experience', 'education', 'skills', 'technical skills',
      'key skills', 'projects', 'certifications', 'certificates', 'achievements',
      'awards', 'summary', 'profile', 'personal details', 'additional information'
    ];

    if (stopKeywords.some(k => isHeaderMatch(line, [k]))) {
      langEndIndex = i;
      break;
    }

  }

  const proficiencyLevels = ['native', 'fluent', 'professional', 'intermediate', 'basic', 'beginner', 'advanced'];

  for (let i = langStartIndex; i < langEndIndex; i++) {
    const line = lines[i];
    const lowerLine = line.toLowerCase();

    if (line.length > 2 && line.length < 100) {
      let proficiency = 'Professional';

      for (const level of proficiencyLevels) {
        if (lowerLine.includes(level)) {
          proficiency = level.charAt(0).toUpperCase() + level.slice(1);
          break;
        }
      }

      const langName = line.split(/[-:]/)[0].trim();

      if (langName.length > 2 && langName.length < 50) {
        languages.push({
          id: Date.now().toString() + Math.random(),
          name: langName,
          proficiency: proficiency
        });
      }
    }
  }

  return languages;
}

function extractInterests(text: string): string[] {
  const interests: string[] = [];
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  const interestKeywords = ['interests', 'hobbies', 'personal interests', 'activities'];
  let startIndex = -1;
  let endIndex = lines.length;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (isHeaderMatch(line, interestKeywords)) {
      startIndex = i + 1;
      break;
    }
  }


  if (startIndex === -1) return [];

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    const sectionKeywords = [
      'experience', 'work experience', 'education', 'skills', 'technical skills',
      'projects', 'languages', 'certifications', 'summary', 'references', 'additional information'
    ];
    if (sectionKeywords.some(k => isHeaderMatch(line, [k]))) {
      endIndex = i;
      break;
    }

  }

  for (let i = startIndex; i < endIndex; i++) {
    const line = lines[i];
    // Split by comma if it looks like a list
    if (line.includes(',')) {
      const parts = line.split(',').map(s => s.trim()).filter(s => s.length > 0);
      parts.forEach(p => {
        interests.push(p.replace(/[.;]$/, ''));
      });
    } else {
      interests.push(line.replace(/[.;]$/, ''));
    }
  }

  return interests;
}

function extractAdditionalPersonalInfo(text: string): { dateOfBirth?: string; customFields: { label: string; value: string }[] } {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  let dateOfBirth = '';
  const customFields: { label: string; value: string }[] = [];

  const dobKeywords = ['date of birth', 'dob', 'birth date'];
  const customKeywords = ['nationality', 'marital status', 'passport', 'visa', 'gender', 'father\'s name', 'permanent address'];

  // Identify Personal Details section roughly
  let startIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (line === 'personal details' || line === 'personal profile' || line === 'personal information') {
      startIndex = i + 1;
      break;
    }
  }

  // If section found, scope search to it, otherwise search whole document (less safe but covers cases without header)
  // For safety, let's only do strict section search for generic fields, but DOB is unique enough to search globally if needed.
  // Actually, let's stick to the section if it exists, or look for specific patterns globally if not found?
  // Let's search globally for DOB but carefully.

  const searchLines = startIndex !== -1 ? lines.slice(startIndex) : lines;

  for (const line of searchLines) {
    const lowerLine = line.toLowerCase();

    // Stop at next section
    if (startIndex !== -1 && ['education', 'experience', 'skills', 'projects', 'summary'].some(k => lowerLine.startsWith(k))) {
      break;
    }

    // Date of Birth
    if (!dateOfBirth && dobKeywords.some(k => lowerLine.startsWith(k) || lowerLine.includes(k + ':'))) {
      // Extract value
      const parts = line.split(/[:|-]/);
      if (parts.length > 1) {
        dateOfBirth = parts.slice(1).join('-').trim();
      } else {
        // Maybe "Date of Birth 14 August"
        const keyword = dobKeywords.find(k => lowerLine.startsWith(k));
        if (keyword) {
          dateOfBirth = line.substring(keyword.length).trim();
        }
      }
      continue;
    }

    // Custom Fields
    for (const keyword of customKeywords) {
      if (lowerLine.startsWith(keyword) || lowerLine.includes(keyword + ':')) {
        const parts = line.split(/[:|-]/);
        if (parts.length > 1) {
          customFields.push({ label: keyword.charAt(0).toUpperCase() + keyword.slice(1), value: parts.slice(1).join('-').trim() });
        }
        break;
      }
    }
  }

  return { dateOfBirth, customFields };
}

// Basic text-only cleaning
export const cleanText = (text: string): string => {
  if (!text) return '';

  return text
    // Repair intraword spacing artifacts (e.g., "r etention" -> "retention", "B ridge d" -> "Bridged")
    // Target: single letter (except a, i, A, I) + space + 2+ letters OR 2+ letters + space + single letter
    .replace(/(\b[b-hj-zB-HJ-Z])\s+([a-z]{2,})/g, '$1$2')
    .replace(/([a-z]{2,})\s+([b-hj-zB-HJ-Z])\b/g, '$1$2')
    // Fix spaced out letters AND numbers (e.g. "m a n a g e m e n t" or "2 0 2 1")
    // Match single chars separated by spaces, but only if there are 3+ in a row
    .replace(/\b([a-zA-Z0-9])\s+(?=[a-zA-Z0-9]\s+[a-zA-Z0-9])/g, '$1')
    .replace(/\b([a-zA-Z0-9])\s+([a-zA-Z0-9])\b/g, '$1$2') // Catch the last pair
    // Fix specific cases from user feedback
    .replace(/Assoc\s*iate/gi, 'Associate')
    .replace(/managemen\s*t/gi, 'management')
    .replace(/App\s*lication/gi, 'Application')
    .replace(/Expres\s*s/gi, 'Express')
    .replace(/Java\s*Script/gi, 'JavaScript')
    .replace(/React\s*J\s*S/gi, 'ReactJS')
    .replace(/Reac\s*t/gi, 'React')
    .replace(/Node\s*\.?\s*js/gi, 'Node.js')
    .replace(/I\s*ntelli\s*J/gi, 'IntelliJ')
    .replace(/V\s*S\s*Code/gi, 'VS Code')
    .replace(/G\s*it/gi, 'Git')
    .replace(/G\s*itHub/gi, 'GitHub')
    .replace(/T\s*ools/gi, 'Tools')
    .replace(/D\s*atabases/gi, 'Databases')
    .replace(/L\s*anguages\s*:/gi, 'Languages:')
    .replace(/O\s*perating\s*S\s*ystem/gi, 'Operating System')
    // STEP 1: Split combined accomplishments FIRST (before bullet normalization)
    // This ensures "strategy. Created" splits into two lines before bullets are normalized
    .replace(/([a-z0-9]{2,}[\.!?])\s*([A-Z][a-zA-Z]*)/g, '$1\n$2')

    // STEP 2: Now normalize bullets (after period-splits are done)
    // Aggressive: move ANY recognized bullet symbol to a new line
    .replace(/\s*([\u2022\u25CF\u25AA\u25AB\u2219\u25CB\u25E6\u2023\u2043\u2044\uF0B7\u27A2\u27A4\u25B6\u25B2\u25BC\u25C6\u25C7\u25D8\u25D9\u25A0\u25A1\u25AA\u25AB\u00B7])\s*/g, '\n ')


    // Ensure numbered lists (1. 2. etc) start on new line
    .replace(/(\s+)([1-9]\.)(\s+)/g, '\n$2$3')
    .replace(/(\s+)(1[0-9]\.)(\s+)/g, '\n$2$3')


    // Fix hyphenation at line breaks: merge them back into a single word
    .replace(/(\w+)\s*[-]\s*\n\s*(\w+)/g, '$1$2')
    // Fix spaces around hyphens within words (e.g. "non - functional" -> "non-functional")
    .replace(/(\w+)\s+([-])\s+([a-z0-9])/gi, '$1$2$3')

    // Fix merged headers at end of line (e.g., "textEXPERIENCE" or "text.EXPERIENCE")
    // Only split if there is NO space (merged) or a hard separator before the header
    .replace(/([a-z0-9])([\.,:;!?-]\s*|(?![ \n]))(\*\*|__)?\s*(EXPERIENCE|EDUCATION|PROJECTS|SKILLS|CERTIFICATIONS|LANGUAGES|SUMMARY|PROFILE|TECHNICAL|KEY\s+SKILLS|CORE\s+COMPETENCIES|EXPERTISE|STRENGTHS|INTERESTS|HOBBIES|VOLUNTEER|PUBLICATIONS|AWARDS|ACHIEVEMENTS|AREAS\s+OF\s+EXPERTISE|AREAS\s+OF\s+STRENGTH|COMPETENCIES|SKILL\s+SET|SKILLS\s+&\s+EXPERTISE|TECHNICAL\s+SKILLS|TECHNICAL\s+PROFILE|PROFESSIONAL\s+SUMMARY|PROFESSIONAL\s+PROFILE|ABOUT\s+ME|PERSONAL\s+DETAILS|CONTACT|ADDITIONAL\s+INFORMATION|PROFESSIONAL\s+EXPERIENCE|EMPLOYMENT|WORK\s+HISTORY)\b\s*(\*\*|__)?\s*(?::|\n|$)/gi, '$1.\n$4')

    // Robust fragmentation healing loop
    // Identifies line fragments that should be joined across splits
    .split('\n').map(l => l.trim()).reduce((acc: string[], line) => {
      if (!line) return acc;

      const prevLine = acc.length > 0 ? acc[acc.length - 1] : null;
      if (!prevLine) {
        acc.push(line);
        return acc;
      }

      // 1. STRUCTURE DETECTION
      const bulletSymbolRegex = /^[\u2022\u25CF\u25AA\u25AB\u2219\u25CB\u25E6\u2023\u2043\u2044\uF0B7\u27A2\u27A4\u25B6\u25B2\u25BC\u25C6\u25C7\u25D8\u25D9\u25A0\u25A1\u25AA\u25AB\u00B7*-]/;
      const isBullet = bulletSymbolRegex.test(line) || /^\d+[\.\)]\s/.test(line);
      const sectionKeywords = ['experience', 'work', 'education', 'skills', 'projects', 'languages', 'certifications', 'summary', 'profile', 'personal'];
      // Global Fix: A bulleted line is NEVER a header
      const isHeader = !isBullet && sectionKeywords.some(k => line.toLowerCase().startsWith(k) && line.length < 50);
      const isDateRange = /^[A-Z][a-z]{2,8}\s+\d{4}\s*[-]\s*(Present|[A-Z][a-z]{2,8}\s+\d{4})/i.test(line);

      // 2. CONVERSION SIGNALS
      const lineTextPart = line.replace(bulletSymbolRegex, '').trim();
      const nextStartsLowercase = /^[a-z]/.test(lineTextPart);
      const isFakeBullet = isBullet && nextStartsLowercase && line.length > 2;

      const isJunkPunctuation = line.length <= 2 && /^[.,;:)\]}*\-]+$/.test(line);
      const nextStartsFragment = /^[.,;:)\]}]/.test(line);

      const prevTrimmed = prevLine.trim();
      // Expanded terminal check (dots, punct, bullets)
      const prevEndsWithTerminal = /[.!?:]\**$/.test(prevTrimmed);

      const isBoldOpen = (prevTrimmed.match(/\*\*/g) || []).length % 2 !== 0;
      const isParenthesisOpen = (prevTrimmed.match(/\(/g) || []).length > (prevTrimmed.match(/\)/g) || []).length;

      // 3. USER'S "FULL-STOP & CAPITAL" RULE
      // - Join IF no period (continuation)
      // - Join IF period BUT next starts with lowercase (e.g. "managed by Inc. as a...")
      // - Split IF period AND next starts with Capital (new point)
      const shouldJoin = !isHeader && !isDateRange && (
        isFakeBullet ||
        !prevEndsWithTerminal ||
        (prevEndsWithTerminal && nextStartsLowercase) ||
        isJunkPunctuation ||
        ((isBoldOpen || isParenthesisOpen) && !prevEndsWithTerminal && nextStartsLowercase)
      );

      // DEBUG: Log the decision
      if (line.includes('Developed') || line.includes('Created') || line.includes('Represented')) {
        console.log(`\n=== REDUCTION DECISION ===`);
        console.log(`Current line: "${line.substring(0, 50)}..."`);
        console.log(`Previous line: "${prevLine.substring(0, 50)}..."`);
        console.log(`prevEndsWithTerminal: ${prevEndsWithTerminal}`);
        console.log(`nextStartsLowercase: ${nextStartsLowercase}`);
        console.log(`isBullet: ${isBullet}`);
        console.log(`shouldJoin: ${shouldJoin}`);
      }

      if (shouldJoin) {

        const junction = (isJunkPunctuation || nextStartsFragment) ? '' : ' ';
        const cleanNextLine = isFakeBullet ? line.replace(bulletSymbolRegex, '').trim() : line;
        acc[acc.length - 1] = (prevLine + junction + cleanNextLine).replace(/[ \t]{2,}/g, ' ');
      } else {
        acc.push(line);
      }
      return acc;
    }, []).join('\n')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n\s+/g, '\n')
    .trim();
};



// New Helper: Parse from Raw Text directly
export function parseResumeFromText(text: string, _fileName?: string): Partial<Resume> {
  // Common extraction logic
  const name = extractName(text);
  const email = extractEmail(text);
  const phone = extractPhone(text);
  const linkedin = extractLinkedIn(text);
  const website = extractWebsite(text);
  const summary = extractSummary(text);
  const rawExperience = extractExperience(text);
  const experience = rawExperience.filter(exp => !exp.position.toLowerCase().includes('intern') && !exp.company.toLowerCase().includes('intern'));
  const internships = rawExperience.filter(exp => exp.position.toLowerCase().includes('intern') || exp.company.toLowerCase().includes('intern'));

  const education = extractEducation(text);
  const skills = extractSkills(text);
  const projects = extractProjects(text);
  const certifications = extractCertifications(text);
  const languages = extractLanguages(text);
  const interests = extractInterests(text);
  const additionalInfo = extractAdditionalPersonalInfo(text);

  console.log('===== PARSED DATA (Regex) =====');
  console.log('Name:', name);
  console.log('Email:', email);
  console.log('Exp Count:', experience.length);
  console.log('Edu Count:', education.length);
  console.log('=======================');

  return {
    personal_info: {
      fullName: name,
      email: email,
      phone: phone,
      location: '',
      linkedin: linkedin,
      portfolio: website,
      dateOfBirth: additionalInfo.dateOfBirth,
      customFields: additionalInfo.customFields
    },
    summary: summary,
    experience: experience,
    internships: internships,
    education: education,
    skills: skills,
    projects: projects,
    certifications: certifications,
    languages: languages.map(l => (typeof l === 'string' ? { id: Date.now().toString() + Math.random(), name: l, proficiency: 'Intermediate' } : l)) as any,
    interests: interests,
    template: 'tech-modern',
    design: 'professional-clean',
    industry: 'technology',
    section_order: ['summary', 'experience', 'internships', 'education', 'skills', 'projects', 'certifications', 'languages']
  };
}

export async function parseResume(file: File): Promise<Partial<Resume>> {
  try {
    const rawText = await extractTextFromFile(file);
    const text = cleanText(rawText);
    console.log('Extracted text length:', text.length);

    // 1. Try AI Parsing if API Key is available
    const groqKey = import.meta.env.VITE_GROQ_API_KEY;
    const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;

    if (geminiKey || groqKey || openaiKey) {
      console.log('AI API Key detected. Attempting AI parsing...');

      try {
        let aiData = null;

        if (geminiKey) {
          console.log('[PARSER] Using Gemini AI...');
          aiData = await parseResumeWithGemini(text);
        } else if (groqKey) {
          console.log('[PARSER] Using Groq AI (Llama 3)...');
          aiData = await parseResumeWithGroq(text);
        } else if (openaiKey) {
          console.log('[PARSER] Using OpenAI...');
          aiData = await parseResumeWithAI(text);
        }

        if (aiData) {
          const aiKeys = Object.keys(aiData);
          const hasSignificantAIContent = (aiData.experience?.length || 0) > 0 || (aiData.education?.length || 0) > 0 || (aiData.summary?.length || 0) > 50;

          console.log('[PARSER] AI Parsing SUCCESS. Significant Content?', hasSignificantAIContent, 'Keys:', aiKeys);

          if (!hasSignificantAIContent) {
            console.warn('[PARSER] AI returned minimal content. Falling back to mixed mode (AI + Regex).');
          }

          // Normalize ALL AI data for consistency
          const normalizedAIData = normalizeParsedData(aiData);

          // Extract profile picture for PDFs even if AI parsing works
          let profilePicture = '';
          if (file.type === 'application/pdf') {
            try {
              const images = await extractImagesFromPDF(file);
              if (images.length > 0) profilePicture = images[0];
            } catch (e) {
              console.warn('Image extraction failed:', e);
            }
          }

          if (normalizedAIData.personal_info) {
            normalizedAIData.personal_info.profilePicture = profilePicture;
          }
          normalizedAIData.showProfilePicture = !!profilePicture;

          // POST-PROCESSING: Force-split merged bullets (Gemini bypass)
          // Split any description that contains "period + space + Capital" into multiple bullets

          // Apply to all experience/internship descriptions
          if (normalizedAIData.experience && Array.isArray(normalizedAIData.experience)) {
            normalizedAIData.experience = normalizedAIData.experience.map(exp => ({
              ...exp,
              description: cleanDescription(exp.description)
            }));
          }
          if (normalizedAIData.internships && Array.isArray(normalizedAIData.internships)) {
            normalizedAIData.internships = normalizedAIData.internships.map(intern => ({
              ...intern,
              description: cleanDescription(intern.description)
            }));
          }

          // Ensure default structure
          const result = {
            template: normalizedAIData.custom_theme?.primaryColor ? 'custom' : 'tech-modern',
            design: normalizedAIData.custom_theme?.layout || 'professional-clean',
            industry: normalizedAIData.industry || 'technology',
            ...normalizedAIData,
            summary: cleanSummaryText(normalizedAIData.summary || ''),
            section_order: normalizedAIData.section_order || ['summary', 'experience', 'internships', 'education', 'skills', 'projects', 'certifications', 'languages', 'interests']
          };

          console.log('[PARSER] AI Result - Design Detection:', {
            template: result.template,
            design: result.design,
            custom_theme: result.custom_theme,
            detected_design: result.detected_design,
            primaryColor: normalizedAIData.custom_theme?.primaryColor,
            layout: normalizedAIData.custom_theme?.layout
          });

          // Smart Merge: If AI missed experience or education, try to fill from Regex
          const isMissingEx = (result.experience?.length || 0) === 0;
          const isMissingEdu = (result.education?.length || 0) === 0;

          if (!hasSignificantAIContent || isMissingEx || isMissingEdu) {
            console.log(`[PARSER] AI missing content (Significant: ${hasSignificantAIContent}, MissingExp: ${isMissingEx}). Merging with Regex fallback...`);
            const regexResult = parseResumeFromText(text, file.name);

            if (isMissingEx && regexResult.experience && regexResult.experience.length > 0) {
              console.log('[PARSER] Recovered', regexResult.experience.length, 'experience entries from Regex');
              result.experience = regexResult.experience;
            }
            if (isMissingEdu && regexResult.education && regexResult.education.length > 0) {
              console.log('[PARSER] Recovered', regexResult.education.length, 'education entries from Regex');
              result.education = regexResult.education;
            }
            if (!result.summary && regexResult.summary) result.summary = regexResult.summary;
          }

          return result;
        }
        else {
          console.warn(' AI returned null, using enhanced regex parser');
        }
      } catch (aiError) {
        console.warn(' AI parsing unavailable, using enhanced regex parser:', (aiError as Error).message);
      }
    } else {
      console.log(' No AI key - Using enhanced regex parser with column detection');
    }

    // 2. Fallback to Enhanced Regex Parsing 
    console.log('Using Enhanced Regex Parser - Fallback');
    const parsedData = parseResumeFromText(text, file.name);

    console.log('[PARSER] Regex Result Counts:', {
      exp: (parsedData.experience || []).length,
      edu: (parsedData.education || []).length,
      skills: (parsedData.skills || []).length
    });

    // Extract profile picture for PDFs
    let profilePicture = '';
    if (file.type === 'application/pdf') {
      try {
        const images = await extractImagesFromPDF(file);
        if (images.length > 0) {
          profilePicture = images[0];
          console.log('Found profile picture candidate');
        }
      } catch (imgError) {
        console.warn('Failed to extract images from PDF:', imgError);
      }
    }

    if (parsedData.personal_info) {
      parsedData.personal_info.profilePicture = profilePicture;
    }
    parsedData.showProfilePicture = !!profilePicture;

    return parsedData;
  } catch (error) {
    console.error('Error parsing resume:', error);
    throw error;
  }
}

async function extractImagesFromPDF(file: File): Promise<string[]> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const images: string[] = [];

    // Only check first 2 pages (profile pic is usually on page 1)
    for (let pageNum = 1; pageNum <= Math.min(pdf.numPages, 2); pageNum++) {
      const page = await pdf.getPage(pageNum);
      const ops = await page.getOperatorList();

      for (let i = 0; i < ops.fnArray.length; i++) {
        if (ops.fnArray[i] === pdfjsLib.OPS.paintImageXObject) {
          const imgName = ops.argsArray[i][0];
          try {
            // @ts-ignore - Valid pdfjs method
            const img = await page.objs.get(imgName);

            if (img && img.width > 50 && img.height > 50) {
              const canvas = document.createElement('canvas');
              canvas.width = img.width;
              canvas.height = img.height;
              const ctx = canvas.getContext('2d');

              if (ctx) {
                const imageData = ctx.createImageData(img.width, img.height);

                // Handle different image data formats from PDF.js
                if (img.kind === 1) { // Grayscale
                  // Unsupported for simple extraction or needs manual conversion
                  // Skipping for complexity minimization, but could implement
                } else if (img.kind === 2) { // RGB
                  // img.data is a Uint8ClampedArray (or similar) of R,G,B,R,G,B...
                  let data = img.data;
                  let dest = imageData.data;
                  let srcUri = 0;
                  let destUri = 0;
                  for (let y = 0; y < img.height; y++) {
                    for (let x = 0; x < img.width; x++) {
                      dest[destUri++] = data[srcUri++]; // R
                      dest[destUri++] = data[srcUri++]; // G
                      dest[destUri++] = data[srcUri++]; // B
                      dest[destUri++] = 255; // Alpha
                    }
                  }
                  ctx.putImageData(imageData, 0, 0);
                  images.push(canvas.toDataURL('image/jpeg'));
                } else if (img.kind === 3) { // RGBA
                  let data = img.data;
                  let dest = imageData.data;
                  let srcUri = 0;
                  let destUri = 0;
                  for (let y = 0; y < img.height; y++) {
                    for (let x = 0; x < img.width; x++) {
                      dest[destUri++] = data[srcUri++];
                      dest[destUri++] = data[srcUri++];
                      dest[destUri++] = data[srcUri++];
                      dest[destUri++] = data[srcUri++];
                    }
                  }
                  ctx.putImageData(imageData, 0, 0);
                  images.push(canvas.toDataURL('image/png'));
                }
              }
            }
          } catch (e) {
            console.warn('Could not extract image object:', imgName, e);
          }
        }
      }
    }
    return images;
  } catch (error) {
    console.error('Error in extractImagesFromPDF:', error);
    return [];
  }
}

