
const input = "• Led the development of customer-facing features that increased user engagement by 45% • Collaborated with cross-functional teams to deliver projects 20% ahead of schedule • Implemented automated testing procedures, reducing bugs by 60% • Mentored junior developers and conducted code reviews to maintain high code quality • Optimized application performance, resulting in 30% faster load times";

function formatAIContent(content: string): string {
    if (!content) return content;

    if (content.includes('•')) {
        const parts = content.split('•');
        const hasIntro = parts[0].trim().length > 0;

        const processedParts = parts.map((part, index) => {
            if (index === 0 && !hasIntro) return '';
            if (index === 0 && hasIntro) return part.trim();
            return '• ' + part.trim();
        }).filter(p => p.length > 0);

        return processedParts.join('\n');
    }

    return content;
}

const output = formatAIContent(input);
console.log('--- Input ---');
console.log(input);
console.log('--- Output ---');
console.log(output);
console.log('--- Visible Newlines? ---');
console.log(JSON.stringify(output));
