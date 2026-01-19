import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Resume } from '../types';

export const exportToPDF = async (elementId: string, fileName: string = 'resume', resumeData?: Resume) => {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error('Element not found:', elementId);
        return false;
    }

    try {
        document.body.style.cursor = 'wait';

        // Wait a bit for any images to load completely if needed
        await new Promise(resolve => setTimeout(resolve, 500));

        // Create a clone of the element to capture cleanly
        const clone = element.cloneNode(true) as HTMLElement;
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.top = '-9999px';
        container.style.left = '0';
        container.style.width = '1025px'; // Standard resume width
        container.style.zIndex = '-1000';
        container.className = 'resume-export-container';

        container.appendChild(clone);
        document.body.appendChild(container);

        // Reset clone styles to ensure standard display
        clone.style.transform = 'none';
        clone.style.margin = '0 auto';
        clone.style.width = '100%';
        clone.style.height = 'auto';
        clone.style.height = 'auto';
        clone.style.boxShadow = 'none';
        clone.style.position = 'relative'; // Ensure watermark positioning context

        // Add Watermark
        const watermark = document.createElement('div');
        watermark.innerText = 'Created with BuildMyResume';
        watermark.style.position = 'absolute';
        watermark.style.bottom = '10px';
        watermark.style.right = '20px';
        watermark.style.fontSize = '12px';
        watermark.style.color = '#6b7280'; // gray-500
        watermark.style.opacity = '0.7';
        watermark.style.fontFamily = 'sans-serif';
        watermark.style.pointerEvents = 'none';
        watermark.style.zIndex = '1000';
        clone.appendChild(watermark);



        // Quality improvements for text rendering
        // Force text to be pure black for maximum contrast on PDF
        // Remove text shadows and ensure opacity
        const allElements = clone.querySelectorAll('*');
        allElements.forEach((el) => {
            const hEl = el as HTMLElement;
            // Force color to black
            hEl.style.color = '#000000';
            hEl.style.textShadow = 'none';
            hEl.style.opacity = '1';
            hEl.style.filter = 'none';
            hEl.style.filter = 'none';
        });

        // --- SMART PAGINATION LOGIC ---
        // Dynamically insert margins to push content that would be cut across pages
        const adjustLayoutForPagination = () => {
            // Note: 1025px width / 210mm = 4.88 px/mm. 297mm * 4.88 = 1449.
            // Let's use 1440 to be safe and leave a small bottom margin
            const PAGE_HEIGHT = 1440;

            const elements = clone.querySelectorAll('.break-inside-avoid');
            const containerRect = clone.getBoundingClientRect();

            elements.forEach((el) => {
                const element = el as HTMLElement;
                // Get current position relative to the top of the resume container
                // We must use offsetTop + accumulated shift because getBoundingClientRect is static on the clone until reflow
                // Actually, since we are modifying styles, we should traverse carefully.
                // Simpler approach: Check if (top % pageHeight) + height > pageHeight

                // Force a reflow to get accurate positions after previous shifts
                const rect = element.getBoundingClientRect();
                const absoluteTop = rect.top - containerRect.top;
                const height = rect.height;

                const startPage = Math.floor(absoluteTop / PAGE_HEIGHT);
                const endPage = Math.floor((absoluteTop + height) / PAGE_HEIGHT);

                if (startPage !== endPage) {
                    // This element crosses a page boundary!
                    // Calculate how much space is left on the current page
                    const remainder = absoluteTop % PAGE_HEIGHT;

                    // Push it to the next page
                    // We add marginTop equal to the remaining space plus a tiny buffer
                    // But we must apply it to the element itself
                    const pushDown = (PAGE_HEIGHT - remainder) + 20; // 20px top padding for next page

                    element.style.marginTop = `${pushDown}px`;

                    // Adding margin changes the positions of subsequent elements, 
                    // loop continues to handle them correctly because getBoundingClientRect() calculates live layout
                    // provided the browser performs layout (which it does when querying rects).
                    console.log(`Paginator: Moved element at ${Math.round(absoluteTop)}px to next page (Shift: ${Math.round(pushDown)}px)`);
                }
            });
        };

        // Run the pagination logic
        adjustLayoutForPagination();

        const canvas = await html2canvas(clone, {
            scale: 3, // Safer high resolution
            useCORS: true,
            logging: false,
            windowWidth: 1025,
            windowHeight: clone.scrollHeight + 100
        });

        // Immediate cleanup
        document.body.removeChild(container);

        // Initialize PDF
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = 210;
        const pdfHeight = 297;

        // ATS HIDDEN TEXT LAYER (Write FIRST so it's behind the image)
        // This ensures the text is present for parsers but visually covered by the resume image.
        if (resumeData) {
            pdf.setFontSize(1); // Tiny font to fit everything on one page without overflow
            pdf.setTextColor(255, 255, 255); // White text

            let currentY = 5;
            const lineHeight = 4; // Increased to 4mm (approx 11pt) to ensure parser detects separate lines

            // Helper to get text lines
            let lines: string[] = [];

            const getYear = (d?: string) => {
                if (!d) return '';
                const match = d.match(/\d{4}/);
                return match ? match[0] : d;
            };

            lines.push(`Name: ${resumeData.personal_info.fullName}`);
            lines.push(`Email: ${resumeData.personal_info.email}`);
            lines.push(`Phone: ${resumeData.personal_info.phone}`);

            if (resumeData.summary) {
                lines.push("SUMMARY");
                lines.push(resumeData.summary);
            }
            if (resumeData.skills && resumeData.skills.length > 0) {
                lines.push("SKILLS");
                lines.push(resumeData.skills.join(', '));
            }
            if (resumeData.experience && resumeData.experience.length > 0) {
                lines.push("EXPERIENCE");
                resumeData.experience.forEach(exp => {
                    lines.push(`${exp.position} at ${exp.company}`);
                    const startYear = getYear(exp.startDate);
                    const endYear = exp.current ? 'Present' : getYear(exp.endDate);
                    lines.push(`${startYear} - ${endYear}`);
                    lines.push(exp.description);
                });
            }
            if (resumeData.education && resumeData.education.length > 0) {
                lines.push("EDUCATION");
                resumeData.education.forEach(edu => {
                    let inst = edu.institution || "University";
                    const hasKeyword = ['university', 'college', 'school', 'institute', 'academy'].some(k => inst.toLowerCase().includes(k));
                    if (!hasKeyword && inst !== "University") inst += " School";

                    lines.push(`${edu.degree} in ${edu.field} at ${inst}`);
                    const startYear = getYear(edu.startDate);
                    const endYear = edu.current ? 'Present' : getYear(edu.endDate);
                    lines.push(`${startYear} - ${endYear}`);
                });
            }

            // Write all text on the first page background
            lines.forEach((line) => {
                if (line && line.trim()) {
                    // Normalize text to prevent garbled chars
                    // Normalize text but preserve common bullet points and special characters
                    const cleanLine = line.trim().replace(/[^\x00-\xff\u2013\u2014\u2022]/g, " ");
                    pdf.text(cleanLine, 5, currentY, { maxWidth: pdfWidth - 10 });
                    currentY += lineHeight;
                }
            });
        }

        // IMAGE EXPORT
        const imgData = canvas.toDataURL('image/png');

        // Calculate the height in mm based on the canvas aspect ratio and PDF width
        const imgHeightMM = (canvas.height * pdfWidth) / canvas.width;

        // User requirement: Support dynamic page counts (1, 2, 3+) without squashing.
        // We do NOT scale the height to fit unless it's genuinely ridiculous (e.g. > 10 pages)
        let finalWidth = pdfWidth;
        let finalHeight = imgHeightMM;

        if (imgHeightMM > pdfHeight * 10) {
            const fitRatio = (pdfHeight * 10) / imgHeightMM;
            finalWidth = pdfWidth * fitRatio;
            finalHeight = pdfHeight * 10;
        }

        const xOffset = (pdfWidth - finalWidth) / 2;

        // Slicing logic: We split at exactly pdfHeight to avoid squashing gaps.
        // No overlap to ensure "ditto same" visual continuity.
        const pageHeight = pdfHeight;
        const totalPages = Math.ceil(finalHeight / pageHeight);

        for (let i = 0; i < totalPages; i++) {
            if (i > 0) pdf.addPage();

            // Add the image snippet for the current page
            // We use the negative y-offset to "slide" the long image across pages
            pdf.addImage(
                imgData,
                'PNG',
                xOffset,
                -(i * pageHeight),
                finalWidth,
                finalHeight,
                undefined,
                'FAST'
            );
        }

        pdf.save(`${fileName}.pdf`);
        return true;
    } catch (error: any) {
        console.error('Error exporting to PDF:', error);
        alert(`Export failed: ${error.message}`);
        return false;
    } finally {
        document.body.style.cursor = 'default';
    }
};

export const exportCoverLetterToPDF = (text: string, fileName: string = 'cover_letter') => {
    try {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const margin = 20;
        const pageHeight = 297;
        const pageWidth = 210;
        const innerWidth = pageWidth - (margin * 2);
        const lineHeight = 5.5;

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(11);

        // Split text into lines that fit the page width
        const lines = pdf.splitTextToSize(text, innerWidth);

        let cursorY = margin;

        lines.forEach((line: string) => {
            if (cursorY + lineHeight > pageHeight - margin) {
                pdf.addPage();
                cursorY = margin;
            }
            pdf.text(line, margin, cursorY);
            cursorY += lineHeight;
        });

        pdf.save(`${fileName}.pdf`);
        return true;
    } catch (error) {
        console.error('Error exporting cover letter to PDF:', error);
        return false;
    }
};

export const exportToWord = (elementId: string, fileName: string = 'resume') => {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error('Element not found:', elementId);
        return false;
    }

    try {
        const preHtml = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Resume</title><style>body{font-family: Arial, sans-serif;}</style></head><body>`;
        const postHtml = "</body></html>";

        // Clone element to modify for export without affecting display
        const clone = element.cloneNode(true) as HTMLElement;

        // Clean up clone for Word
        // Remove functionality buttons if any
        const buttons = clone.querySelectorAll('button');
        buttons.forEach(btn => btn.remove());

        const html = preHtml + clone.innerHTML + postHtml;

        const blob = new Blob(['\ufeff', html], {
            type: 'application/msword'
        });

        const url = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(html);

        // Create download link
        const downloadLink = document.createElement("a");
        document.body.appendChild(downloadLink);

        if ((navigator as any).msSaveOrOpenBlob) {
            (navigator as any).msSaveOrOpenBlob(blob, `${fileName}.doc`);
        } else {
            downloadLink.href = url;
            downloadLink.download = `${fileName}.doc`;
            downloadLink.click();
        }

        document.body.removeChild(downloadLink);
        return true;
    } catch (error) {
        console.error('Error exporting to Word:', error);
        return false;
    }
};
