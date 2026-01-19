
// Simplified test for Word HTML to Text conversion
// We don't import CleanText to avoid module resolution issues in this simple script

function improvedExtractTextFromWordSimple(html: string): string {
    let text = html
        .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
        .replace(/<b>(.*?)<\/b>/gi, '**$1**')
        // THE FIX:
        .replace(/<li>/gi, '• ')
        .replace(/<\/li>/gi, '\n')
        .replace(/<\/p>|<\/div>|<br\s*\/?>/gi, '\n')
        // Remove other HTML tags
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .trim();

    return text;
}

const mockHtml = `
<p><strong>Associate HR</strong></p>
<ul>
    <li>Facilitated 1:1s, skip-level meetings, and stay interviews</li>
    <li>Drove employee engagement and retention initiatives</li>
</ul>
<p><strong>Skills</strong></p>
<p>Recruitment, Talent Acquisition, Sourcing</p>
`;

console.log('--- MOCK HTML ---');
console.log(mockHtml);

const extracted = improvedExtractTextFromWordSimple(mockHtml);
console.log('\n--- EXTRACTED TEXT ---');
console.log(extracted);

if (extracted.includes('• Facilitated') && extracted.includes('\n• Drove')) {
    console.log('\n✅ SUCCESS: Bullet points and line breaks preserved!');
} else {
    console.log('\n❌ FAILURE: Bullet points or line breaks missing!');
}

if (extracted.includes('**Associate HR**')) {
    console.log('✅ SUCCESS: Bolding preserved!');
}
