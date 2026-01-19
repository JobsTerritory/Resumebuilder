import React from 'react';
import { Resume } from '../types';
import { Phone, Mail, MapPin, Linkedin, Globe, Calendar, Award, Heart } from 'lucide-react';
import { getTemplate } from '../lib/templates';
import { getDesign } from '../lib/designs';

interface ResumePreviewProps {
    resume: Resume;
}

export default function ResumePreview({ resume }: ResumePreviewProps) {
    if (!resume) {
        return <div className="p-8 text-center text-gray-500">Loading resume...</div>;
    }

    const template = getTemplate(resume.template);
    const design = getDesign(resume.design || 'professional-clean');
    const showProfilePic = resume.showProfilePicture && resume.personal_info?.profilePicture;


    const splitByBullets = (desc: string) => {
        if (!desc) return '';
        // Add newlines before bullet characters if they are missing
        return desc
            .replace(/([^\n])\s*([•●■▪]\s*|[-*]\s+)/g, '$1\n$2') // Standard bullets (allow space before)
            .replace(/([^\n])\s*(\b\d+[\.\)](\s+|$|(?=[A-Z])))/g, '$1\n$2') // Numbered lists (allow no space if followed by Capital or end)
            .replace(/([^\n])\s*(\b[a-z][\.\)](\s+|$|(?=[A-Z])))/gi, '$1\n$2') // Lettered lists
            // Add newline between sentences that look like separate points (lowercase char + dot + space + Capital char)
            .replace(/([a-z0-9][.!?])\s+([A-Z])/g, '$1\n$2')
            .trim();
    };

    const parseMarkdown = (text: string) => {
        if (!text) return null;
        // Split by bold (**), italic (* or _), and normal text
        const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i}>{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('*') && part.endsWith('*')) {
                return <em key={i}>{part.slice(1, -1)}</em>;
            }
            return part;
        });
    };

    const isLikelyList = (text: string): boolean => {
        if (!text) return false;
        // Check for common bullet characters or numbered lists at the start of lines
        // Allow numbered lists without spaces if followed by alphanumeric content
        const listPattern = /^[•●■▪\-\*]\s|^\d+[\.\)][\s\w]/m;
        return listPattern.test(text);
    };

    const renderSummary = (summary: string, colorClass: string = "text-gray-600", textSize: string = "text-base", center: boolean = false) => {
        if (!summary) return null;

        if (isLikelyList(summary)) {
            return renderBulletedList(summary, colorClass, textSize);
        }

        // If it's a paragraph, we should still handle basic cleanup but render as text
        // Replace single newlines with spaces to fix PDF wrapping, but keep double newlines for paragraphs
        const paragraphs = summary.split(/\n\s*\n/);

        return (
            <div className={`space-y-2 mt-2 ${center ? 'text-center' : 'text-justify'}`}>
                {paragraphs.map((para, i) => (
                    <p key={i} className={`${textSize} leading-relaxed ${colorClass} break-inside-avoid`}>
                        {parseMarkdown(para.replace(/\n/g, ' '))}
                    </p>
                ))}
            </div>
        );
    };

    const renderBulletedList = (description: string, colorClass: string = "text-gray-600", textSize: string = "text-base") => {
        if (!description) return null;

        // Ensure bullets have newlines
        const formatted = splitByBullets(description);

        // Split by newlines and filter out empty strings
        const rawLines = formatted.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);

        // Intelligent merging of continuation lines
        const processedPoints: string[] = [];
        let currentPoint = "";

        for (const line of rawLines) {
            // Sanitize: strip unwanted bold marker artifacts (*) if they are floating
            let cleanLine = line.replace(/(^|[^\w])\*([^\w]|$)/g, '$1 $2').replace(/\s+/g, ' ').trim();
            if (!cleanLine || cleanLine === '*') continue;

            // Updated pattern: require space after hyphen/asterisk to be a bullet
            const hasBulletPrefix = /^[•●■▪]/.test(cleanLine) || /^[-*]\s+/.test(cleanLine);
            const hasNumberPrefix = /^\d+[\.\)]/.test(cleanLine);

            // [FIX] Restore sentence splitting heuristic
            // If the line starts with a Capital letter and follows a previous completed point (ending in dot), treat as new bullet
            const startsWithCapital = /^[A-Z]/.test(cleanLine);
            const prevPointEndsWithDot = currentPoint.trim().match(/[.!?]$/);
            const isLikelySentenceStart = startsWithCapital && prevPointEndsWithDot && !hasBulletPrefix;

            let shouldTreatAsNewBullet = hasBulletPrefix || hasNumberPrefix || isLikelySentenceStart;

            // [FIX] Override: If the new "bullet" starts with lowercase and the previous point didn't look like it ended,
            // it's probably a broken sentence that got a bullet artifact or valid bullet that should be merged.
            const contentStripped = cleanLine.replace(/^[•●■▪\*]\s*/, '').replace(/^-+\s*/, '').replace(/^\d+[\.\)]\s*/, '').trim();
            const startsWithLower = /^[a-z]/.test(contentStripped);
            const prevEndsWithPunctuation = /[.:;!?]$/.test(currentPoint.trim());

            // Heuristic: If content is very short (single word or < 10 chars) and previous line didn't end with punctuation,
            // it's likely a wrapped word that got interpreted as a bullet (maybe due to artifacts).
            const isSingleWordOrShort = contentStripped.length < 15 && !contentStripped.includes(' ');
            const isLikelyContinuation = (startsWithLower || isSingleWordOrShort) && currentPoint.trim() && !prevEndsWithPunctuation;

            if (shouldTreatAsNewBullet && isLikelyContinuation) {
                shouldTreatAsNewBullet = false;
            }

            if (shouldTreatAsNewBullet || !currentPoint.trim()) {
                if (currentPoint.trim()) processedPoints.push(currentPoint.trim());
                currentPoint = contentStripped;
            } else if (cleanLine.length > 0) {
                const textToAppend = contentStripped;
                if (currentPoint) {
                    const separator = /^[.,;:!?)\]]/.test(textToAppend) ? '' : ' ';
                    currentPoint += separator + textToAppend;
                } else {
                    currentPoint = textToAppend;
                }
            }
        }
        if (currentPoint.trim()) processedPoints.push(currentPoint.trim());

        if (processedPoints.length === 0) return null;

        return (
            <div className="space-y-1 mt-1">
                {processedPoints.map((point, i) => (
                    <div key={i} className="flex gap-2 text-justify break-inside-avoid">
                        <span className={`block w-1 h-1 rounded-full mt-2 flex-shrink-0 ${colorClass.includes('white') ? 'bg-white/60' : 'bg-gray-400'}`}></span>
                        <p className={`${textSize} leading-relaxed ${colorClass}`}>
                            {parseMarkdown(point)}
                        </p>
                    </div>
                ))}
            </div>
        );
    };

    const renderAdditionalInfo = (colorClass: string = "text-gray-900", titleClass: string = "text-lg font-bold uppercase mb-1", styleObj: any = {}) => {
        if (!resume.additional_info) return null;
        return (
            <div className="mb-3 break-inside-avoid">
                <h3 className={`${titleClass} ${colorClass}`} style={styleObj || {}}>Additional Information</h3>
                <div className="border-t pt-1">
                    {renderBulletedList(resume.additional_info, "text-gray-800")}
                </div>
            </div>
        );
    };

    const expandStringItems = (items: string[] | undefined) => {
        if (!items) return [];
        return items.flatMap(item => item.split(/[•●]/).map(s => s.trim()).filter(s => s));
    };

    const expandLanguageItems = (items: { id: string; name: string; proficiency?: string }[] | undefined) => {
        if (!items) return [];
        return items.flatMap(item =>
            item.name.split(/[•●]/).map(s => s.trim()).filter(s => s).map(name => ({ ...item, name }))
        );
    };

    const formatDate = (date: string | undefined | null) => {
        if (!date || date === 'undefined' || date.trim() === '') return '';
        const trimmed = date.trim();

        // If it's just a 4-digit year, preserve it exactly as is
        if (/^\d{4}$/.test(trimmed)) return trimmed;

        try {
            // Using a more robust date parsing for consistency
            const d = new Date(trimmed);
            if (isNaN(d.getTime())) return trimmed;

            // Format to "MMM YYYY" for a professional look
            return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        } catch (_) {
            return trimmed;
        }
    };

    const getTemplateStyles = () => {
        let color = template?.color || 'from-blue-600 to-blue-800';
        let fontFamily = 'sans-serif';

        // Custom Theme Overrides
        if (resume.custom_theme) {
            if (resume.custom_theme.primaryColor) {
                // If we have a hex color, we'll need to use inline styles or a dynamic class
                // For now, let's try to map it to a tailwind color if possible, or use a default and handle hex in render
                color = `from-[${resume.custom_theme.primaryColor}] to-[${resume.custom_theme.primaryColor}]`;
            }
            if (resume.custom_theme.fontFamily) {
                fontFamily = resume.custom_theme.fontFamily;
            }
        }

        const colors = color.split(' ');
        const fromColor = colors[0].replace('from-', '');

        return {
            sidebarBg: color.startsWith('from-[') ? { background: resume.custom_theme?.primaryColor } : null,
            sidebarClass: color.startsWith('from-[') ? '' : `bg-gradient-to-br ${color}`,
            sectionTitle: color.startsWith('from-[') ? { color: resume.custom_theme?.primaryColor } : null,
            sectionTitleClass: color.startsWith('from-[') ? 'font-bold uppercase' : `font-bold uppercase text-${fromColor}`,
            headerColor: color.startsWith('from-[') ? { color: resume.custom_theme?.primaryColor } : null,
            headerClass: color.startsWith('from-[') ? '' : `text-${fromColor}`,
            accentBg: color.startsWith('from-[') ? { backgroundColor: resume.custom_theme?.primaryColor } : null,
            borderColor: color.startsWith('from-[') ? { borderColor: resume.custom_theme?.primaryColor } : null,
            borderColorClass: color.startsWith('from-[') ? 'border-t' : `border-t border-${fromColor}`,
            fontFamily: fontFamily === 'serif' ? 'font-serif' : fontFamily === 'mono' ? 'font-mono' : 'font-sans',
            fromColor
        };
    };

    // Styles fallback
    const styles = getTemplateStyles();

    // Design 1: Sidebar Left (Lorreyne style)
    const renderSidebarLeft = () => (
        <div className={`flex bg-white shadow-lg w-[1025px] mx-auto ${styles.fontFamily}`}>
            <div className={`w-1/3 ${styles.sidebarClass} p-5 text-white`} style={styles.sidebarBg || {}}>
                {showProfilePic && (
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full overflow-hidden border-4 border-white/20">
                        <img
                            src={resume.personal_info.profilePicture}
                            alt={resume.personal_info.fullName}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                <div className="mb-8 break-inside-avoid">
                    <h3 className="text-xl font-bold border-b border-white/20 pb-2 mb-4 uppercase tracking-wider">Contact</h3>
                    <div className="space-y-3 text-lg opacity-90">
                        {resume.personal_info.phone && (
                            <div className="flex items-center gap-3">
                                <Phone size={20} />
                                <span>{resume.personal_info.phone}</span>
                            </div>
                        )}
                        {resume.personal_info.email && (
                            <div className="flex items-center gap-3">
                                <Mail size={20} />
                                <span className="break-all">{resume.personal_info.email}</span>
                            </div>
                        )}
                        {resume.personal_info.location && (
                            <div className="flex items-center gap-3">
                                <MapPin size={20} />
                                <span>{resume.personal_info.location}</span>
                            </div>
                        )}
                        {resume.personal_info.linkedin && (
                            <div className="flex items-center gap-3">
                                <Linkedin size={20} />
                                <span className="break-all">{resume.personal_info.linkedin}</span>
                            </div>
                        )}
                        {resume.personal_info.portfolio && (
                            <div className="flex items-center gap-3">
                                <Globe size={20} />
                                <span className="break-all">{resume.personal_info.portfolio}</span>
                            </div>
                        )}
                        {resume.personal_info.dateOfBirth && (
                            <div className="flex items-center gap-3">
                                <Calendar size={20} />
                                <span>DOB: {resume.personal_info.dateOfBirth}</span>
                            </div>
                        )}
                        {resume.personal_info.customFields && resume.personal_info.customFields.map((field, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-5 h-5 flex items-center justify-center opacity-70">
                                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                </div>
                                <span className="break-all"><span className="font-bold">{field.label}:</span> {field.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {resume.education && resume.education.length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-xl font-bold border-b border-white/20 pb-2 mb-4 uppercase tracking-wider">Education</h3>
                        <div className="space-y-4">
                            {resume.education.map((edu) => (
                                <div key={edu.id}>
                                    <div className="break-inside-avoid">
                                        <p className="font-semibold text-base">{formatDate(edu.startDate)} - {edu.current ? 'Present' : formatDate(edu.endDate)}</p>
                                        <p className="font-medium opacity-90 text-lg">{edu.institution}</p>
                                        <p className="text-base opacity-75">{edu.degree}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {resume.certifications && resume.certifications.length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-xl font-bold border-b border-white/20 pb-2 mb-4 uppercase tracking-wider">Certifications & Achievements</h3>
                        <div className="space-y-3">
                            {resume.certifications.map((cert) => (
                                <div key={cert.id}>
                                    <div className="break-inside-avoid">
                                        <p className="font-semibold text-base">{cert.date}</p>
                                        <p className="font-medium opacity-90 text-lg">{cert.name}</p>
                                        <p className="text-base opacity-75">{cert.issuer}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {resume.skills && resume.skills.length > 0 && (
                    <div className="mb-8 break-inside-avoid">
                        <h3 className="text-xl font-bold border-b border-white/20 pb-2 mb-4 uppercase tracking-wider">Expertise</h3>
                        <ul className="space-y-2.5">
                            {expandStringItems(resume.skills).map((skill, index) => (
                                <li key={index} className="flex items-start gap-2.5 text-lg leading-relaxed">
                                    <span className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></span>
                                    <span className="break-words">{skill}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {resume.interests && resume.interests.length > 0 && (
                    <div className="mb-8 break-inside-avoid">
                        <h3 className="text-xl font-bold border-b border-white/20 pb-2 mb-4 uppercase tracking-wider">Interests</h3>
                        <ul className="space-y-2.5">
                            {expandStringItems(resume.interests).map((interest, index) => (
                                <li key={index} className="flex items-start gap-2.5 text-lg leading-relaxed">
                                    <span className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></span>
                                    <span className="break-words">{interest}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            <div className="w-2/3 p-8 bg-white">
                <div className="mb-10 break-inside-avoid">
                    <h1 className={`text-4xl font-bold ${styles.headerClass} mb-2 uppercase tracking-wide`} style={styles.headerColor || {}}>
                        {resume.personal_info.fullName}
                    </h1>
                    {resume.personal_info.title && (
                        <p className="text-xl text-gray-600 tracking-widest uppercase">{resume.personal_info.title}</p>
                    )}
                </div>

                {resume.summary && (
                    <div className="mb-8 break-inside-avoid">
                        <h3 className={`text-lg font-bold uppercase tracking-wider mb-4 ${styles.headerClass}`} style={styles.headerColor || {}}>Profile</h3>
                        {renderSummary(resume.summary, "text-gray-700")}

                    </div>
                )}

                {resume.experience && resume.experience.length > 0 && (
                    <div className="mb-8">
                        <h3 className={`text-lg font-bold uppercase tracking-wider mb-6 ${styles.headerClass}`} style={styles.headerColor || {}}>Work Experience</h3>
                        <div className="space-y-6">
                            {resume.experience.map((exp) => (
                                <div key={exp.id} className="relative pl-6 border-l-2 border-gray-200">
                                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-gray-200"></div>
                                    <div className="break-inside-avoid mb-1">
                                        <div className="flex justify-between items-baseline">
                                            <h4 className="font-bold text-gray-900">{parseMarkdown(exp.company)}</h4>
                                            <span className="text-base text-gray-500">
                                                {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                                            </span>
                                        </div>
                                        <p className="font-medium text-gray-700">{parseMarkdown(exp.position)}</p>
                                    </div>
                                    {renderBulletedList(exp.description)}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {resume.internships && resume.internships.length > 0 && (
                    <div className="mb-8">
                        <h3 className={`text-lg font-bold uppercase tracking-wider mb-6 ${styles.headerClass}`} style={styles.headerColor || {}}>Internships</h3>
                        <div className="space-y-6">
                            {resume.internships.map((intern) => (
                                <div key={intern.id} className="relative pl-6 border-l-2 border-gray-200 break-inside-avoid">
                                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-gray-200"></div>
                                    <div className="mb-1">
                                        <div className="flex justify-between items-baseline">
                                            <h4 className="font-bold text-gray-900">{parseMarkdown(intern.company)}</h4>
                                            <span className="text-base text-gray-500">
                                                {formatDate(intern.startDate)} - {intern.current ? 'Present' : formatDate(intern.endDate)}
                                            </span>
                                        </div>
                                        <p className="font-medium text-gray-700">{parseMarkdown(intern.position)}</p>
                                    </div>
                                    {renderBulletedList(intern.description)}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {resume.projects && resume.projects.length > 0 && (
                    <div className="mb-8">
                        <h3 className={`text-lg font-bold uppercase tracking-wider mb-6 ${styles.headerClass}`} style={styles.headerColor || {}}>Projects</h3>
                        <div className="space-y-6">
                            {resume.projects.map((project) => (
                                <div key={project.id} className="relative pl-6 border-l-2 border-gray-200 break-inside-avoid">
                                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-gray-200"></div>
                                    <div className="mb-1">
                                        <div className="flex justify-between items-baseline">
                                            <h4 className="font-bold text-gray-900">{project.name}</h4>
                                            <span className="text-base text-gray-500">
                                                {project.startDate && project.endDate ? `${formatDate(project.startDate)} - ${formatDate(project.endDate)} ` : ''}
                                            </span>
                                        </div>
                                        {project.url && <a href={project.url} className="font-medium text-blue-600 underline text-base block">{project.url}</a>}
                                    </div>
                                    {renderBulletedList(project.description)}
                                    {project.technologies && project.technologies.length > 0 && (
                                        <p className="text-sm text-gray-500 mt-2">Stack: {project.technologies.join(', ')}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                <div className="break-inside-avoid">
                    {renderAdditionalInfo(styles.headerClass, "text-lg font-bold uppercase tracking-wider mb-6", styles.headerColor)}
                </div>
            </div>
        </div>
    );

    // Design 2: Professional Clean (Benjamin style)
    const renderProfessionalClean = () => (
        <div className={`px-5 py-5 bg-white shadow-lg w-[1025px] mx-auto ${styles.fontFamily}`}>
            <div className={`flex items-start gap-8 mb-4 border-b pb-2`} style={styles.borderColor || {}}>
                {showProfilePic && (
                    <div className="w-32 h-32 bg-gray-200 overflow-hidden">
                        <img
                            src={resume.personal_info.profilePicture}
                            alt={resume.personal_info.fullName}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}
                <div className="flex-1">
                    <h1 className={`text-4xl font-bold ${styles.headerClass} mb-2 uppercase`} style={styles.headerColor || {}}>
                        {resume.personal_info.fullName}
                    </h1>
                    {resume.personal_info.title && (
                        <p className="text-lg text-gray-600 font-semibold mb-2">{resume.personal_info.title}</p>
                    )}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-base text-gray-700 mt-2">
                        {resume.personal_info.location && (
                            <div className="flex gap-2"><span className="font-bold text-gray-900">Address:</span> {resume.personal_info.location}</div>
                        )}
                        {resume.personal_info.phone && (
                            <div className="flex gap-2"><span className="font-bold text-gray-900">Phone:</span> {resume.personal_info.phone}</div>
                        )}
                        {resume.personal_info.email && (
                            <div className="flex gap-2"><span className="font-bold text-gray-900">Email:</span> {resume.personal_info.email}</div>
                        )}
                        {resume.personal_info.linkedin && (
                            <div className="flex gap-2"><span className="font-bold text-gray-900">LinkedIn:</span> {resume.personal_info.linkedin}</div>
                        )}
                        {resume.personal_info.portfolio && (
                            <div className="flex gap-2"><span className="font-bold text-gray-900">Portfolio:</span> {resume.personal_info.portfolio}</div>
                        )}
                        {resume.personal_info.dateOfBirth && (
                            <div className="flex gap-2"><span className="font-bold text-gray-900">DOB:</span> {resume.personal_info.dateOfBirth}</div>
                        )}
                        {resume.personal_info.customFields && resume.personal_info.customFields.map((field, i) => (
                            <div key={i} className="flex gap-2"><span className="font-bold text-gray-900">{field.label}:</span> {field.value}</div>
                        ))}
                    </div>
                </div>
            </div>

            {resume.summary && (
                <div className="mb-3">
                    <h3 className={`text-lg font-bold uppercase mb-2 ${styles.headerClass}`} style={styles.headerColor || {}}>Summary</h3>
                    <div className="border-t pt-1">
                        {renderSummary(resume.summary, "text-gray-800", "text-base")}

                    </div>
                </div>
            )}

            {resume.experience && resume.experience.length > 0 && (
                <div className="mb-3">
                    <h3 className={`text-lg font-bold uppercase mb-2 ${styles.headerClass}`} style={styles.headerColor || {}}>Work Experience</h3>
                    <div className="border-t pt-1">
                        {resume.experience.map((exp, index) => (
                            <div key={exp.id} className={`${index > 0 ? "mt-1.5" : ""} break-inside-avoid`}>
                                <div className="mb-1">
                                    <div className="flex justify-between font-bold text-gray-900">
                                        <h4>{parseMarkdown(exp.position)}, {parseMarkdown(exp.company)}</h4>
                                        <span>{formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}</span>
                                    </div>
                                </div>
                                {renderBulletedList(exp.description, "text-gray-800")}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {resume.internships && resume.internships.length > 0 && (
                <div className="mb-3">
                    <h3 className={`text-lg font-bold uppercase mb-2 ${styles.headerClass}`} style={styles.headerColor || {}}>Internships</h3>
                    <div className="border-t pt-1">
                        {resume.internships.map((intern, index) => (
                            <div key={intern.id} className={`${index > 0 ? "mt-2" : ""} break-inside-avoid`}>
                                <div className="mb-1">
                                    <div className="flex justify-between font-bold text-gray-900">
                                        <h4>{parseMarkdown(intern.position)}, {parseMarkdown(intern.company)}</h4>
                                        <span>{formatDate(intern.startDate)} - {intern.current ? 'Present' : formatDate(intern.endDate)}</span>
                                    </div>
                                </div>
                                {renderBulletedList(intern.description, "text-gray-800")}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {resume.projects && resume.projects.length > 0 && (
                <div className="mb-3">
                    <h3 className={`text-lg font-bold uppercase mb-2 ${styles.headerClass}`} style={styles.headerColor || {}}>Projects</h3>
                    <div className="border-t pt-1">
                        {resume.projects.map((project, index) => (
                            <div key={project.id} className="text-base break-inside-avoid">
                                <div>
                                    <div className="flex justify-between font-bold text-gray-900 mb-1">
                                        <h4>{project.name}</h4>
                                        <span>{project.startDate && project.endDate ? `${formatDate(project.startDate)} - ${formatDate(project.endDate)}` : ''}</span>
                                    </div>
                                    {project.url && <a href={project.url} className="text-blue-600 text-base mb-1 block hover:underline">{project.url}</a>}
                                </div>
                                {renderBulletedList(project.description, "text-gray-800")}
                                {project.technologies && project.technologies.length > 0 && (
                                    <p className="text-sm text-gray-500 mt-1 italic">Technologies: {project.technologies.join(', ')}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {resume.education && resume.education.length > 0 && (
                <div className="mb-3">
                    <h3 className={`text-lg font-bold uppercase mb-2 ${styles.headerClass}`} style={styles.headerColor || {}}>Education</h3>
                    <div className="border-t pt-1 space-y-1">
                        {resume.education.map((edu) => (
                            <div key={edu.id} className="flex justify-between break-inside-avoid">
                                <div>
                                    <h4 className="font-semibold text-gray-900 text-base">{edu.degree}</h4>
                                    <p className="text-gray-800 text-base">{edu.institution}</p>
                                    {edu.gpa && <p className="text-base text-gray-600 mt-0">{edu.gpa}</p>}
                                </div>
                                <span className="font-bold text-gray-900">
                                    {formatDate(edu.startDate)} - {edu.current ? 'Present' : formatDate(edu.endDate)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )
            }

            {
                resume.certifications && resume.certifications.length > 0 && (
                    <div className="mb-3">
                        <h3 className={`text-lg font-bold uppercase mb-2 ${styles.headerClass}`} style={styles.headerColor || {}}>Certifications & Achievements</h3>
                        <div className="border-t pt-1 space-y-1">
                            {resume.certifications.map((cert) => (
                                <div key={cert.id} className="flex justify-between break-inside-avoid">
                                    <div>
                                        <h4 className="font-semibold text-gray-900 text-base">{cert.name}</h4>
                                        <p className="text-gray-800 text-base">{cert.issuer}</p>
                                    </div>
                                    <span className="font-bold text-gray-900">
                                        {cert.date}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            }

            {
                resume.skills && resume.skills.length > 0 && (
                    <div className="mb-3 break-inside-avoid">
                        <h3 className={`text-lg font-bold uppercase mb-2 ${styles.headerClass}`} style={styles.headerColor || {}}>Technical Skills</h3>
                        <div className="border-t pt-1 grid grid-cols-2 gap-x-4 gap-y-1">
                            {expandStringItems(resume.skills).map((skill, i) => (
                                <div key={i} className="flex items-start gap-2">
                                    <div className="w-2 h-2 bg-gray-600 rounded-full mt-1.5 flex-shrink-0"></div>
                                    <span className="text-gray-800 text-base break-words">{skill}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            }

            {
                (resume.languages?.length > 0 || resume.interests?.length > 0) && (
                    <div className="mb-3 break-inside-avoid">
                        <h3 className={`text-lg font-bold uppercase mb-2 ${styles.headerClass}`} style={styles.headerColor || {}}>Additional Information</h3>
                        <div className="border-t pt-1 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5">
                            {resume.languages && resume.languages.length > 0 && (
                                <>
                                    <span className="font-bold text-gray-900 whitespace-nowrap">Languages:</span>
                                    <span className="text-gray-700">{expandLanguageItems(resume.languages).map(l => l.name).join(', ')}</span>
                                </>
                            )}

                            {resume.interests && resume.interests.length > 0 && (
                                <>
                                    <span className="font-bold text-gray-900 whitespace-nowrap">Interests:</span>
                                    <span className="text-gray-700">{expandStringItems(resume.interests).join(', ')}</span>
                                </>
                            )}

                            {resume.additional_info && (
                                <>
                                    <span className="font-bold text-gray-900 whitespace-nowrap text-base">More:</span>
                                    <div className="text-gray-700 text-base whitespace-pre-wrap">{resume.additional_info}</div>
                                </>
                            )}
                        </div>
                    </div>
                )
            }
        </div >
    );

    // Design 3: Sidebar Contact (Angelica style)
    const renderSidebarContact = () => (
        <div className={`flex bg-gray-100 shadow-lg w-[1025px] mx-auto ${styles.fontFamily}`}>
            <div className={`w-1/3 bg-gray-200 p-4 flex flex-col items-center text-center`} style={styles.sidebarBg || {}}>
                {showProfilePic && (
                    <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-md mb-6">
                        <img
                            src={resume.personal_info.profilePicture}
                            alt={resume.personal_info.fullName}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                <div className="w-full mb-4 break-inside-avoid">
                    <h3 className="font-bold uppercase border-b-2 border-gray-800 mb-2 pb-2 text-base">Contact</h3>
                    <div className="flex flex-col gap-1.5 text-base text-gray-700">
                        {resume.personal_info.phone && (
                            <div className="flex items-center gap-2 justify-center">
                                <Phone size={18} /> {resume.personal_info.phone}
                            </div>
                        )}
                        {resume.personal_info.email && (
                            <div className="flex items-center gap-2 justify-center">
                                <Mail size={18} /> <span className="break-all">{resume.personal_info.email}</span>
                            </div>
                        )}
                        {resume.personal_info.location && (
                            <div className="flex items-center gap-2 justify-center">
                                <MapPin size={18} /> {resume.personal_info.location}
                            </div>
                        )}
                        {resume.personal_info.linkedin && (
                            <div className="flex items-center gap-2 justify-center">
                                <Linkedin size={18} /> <span className="break-all">{resume.personal_info.linkedin}</span>
                            </div>
                        )}
                        {resume.personal_info.portfolio && (
                            <div className="flex items-center gap-2 justify-center">
                                <Globe size={18} /> <span className="break-all">{resume.personal_info.portfolio}</span>
                            </div>
                        )}
                        {resume.personal_info.customFields && resume.personal_info.customFields.map(f => (
                            <div key={f.label} className="flex flex-col items-center">
                                <span className="text-gray-600 text-sm font-bold uppercase tracking-tighter">{f.label}</span>
                                <span className="font-medium">{f.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {resume.skills && resume.skills.length > 0 && (
                    <div className="w-full text-left break-inside-avoid">
                        <h3 className="font-bold uppercase border-b-2 border-gray-800 mb-2 pb-2 text-base">Technical Skills</h3>
                        <ul className="space-y-1 text-base">
                            {expandStringItems(resume.skills).map((skill, index) => (
                                <li key={index} className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-gray-800 rounded-full"></span>
                                    {skill}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {resume.languages && resume.languages.length > 0 && (
                    <div className="w-full text-left mt-4 break-inside-avoid">
                        <h3 className="font-bold uppercase border-b-2 border-gray-800 mb-2 pb-2 text-base">Languages</h3>
                        <ul className="space-y-1 text-base">
                            {expandLanguageItems(resume.languages).map((lang, index) => (
                                <li key={index} className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-gray-800 rounded-full"></span>
                                    {lang.proficiency ? `${lang.name} (${lang.proficiency})` : lang.name}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {resume.interests && resume.interests.length > 0 && (
                    <div className="w-full text-left mt-4 break-inside-avoid">
                        <h3 className="font-bold uppercase border-b-2 border-gray-800 mb-2 pb-2 text-base">Interests</h3>
                        <ul className="space-y-1 text-base">
                            {expandStringItems(resume.interests).map((interest, index) => (
                                <li key={index} className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-gray-800 rounded-full"></span>
                                    {interest}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

            </div>

            <div className="w-2/3 p-5 bg-white">
                <div className="mb-4 text-center break-inside-avoid">
                    <h1 className={`text-3xl font-bold uppercase tracking-wider mb-1 ${styles.headerClass}`} style={styles.headerColor || {}}>{resume.personal_info.fullName}</h1>
                    {resume.personal_info.title && (
                        <p className="text-lg text-gray-600 font-semibold mb-2">{resume.personal_info.title}</p>
                    )}
                    {resume.summary && (
                        <div className="max-w-lg mx-auto text-left">
                            {renderSummary(resume.summary, "text-gray-600", "text-base")}
                        </div>
                    )}
                </div>

                {resume.education && resume.education.length > 0 && (
                    <div className="mb-4">
                        <h3 className={`font-bold uppercase border-b-2 ${styles.borderColorClass} mb-2 text-base ${styles.headerClass}`} style={styles.headerColor || {}}>Education</h3>
                        <div className="space-y-2">
                            {resume.education.map((edu) => (
                                <div key={edu.id} className="text-base break-inside-avoid">
                                    <h4 className="font-semibold">{edu.institution}, {edu.startDate.split('-')[0]}-Present</h4>
                                    <p className="text-gray-700">{edu.degree} in {edu.field}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {resume.experience && resume.experience.length > 0 && (
                    <div className="mb-4">
                        <h3 className={`font-bold uppercase border-b-2 ${styles.borderColorClass} mb-2 text-base ${styles.headerClass}`} style={styles.headerColor || {}}>Work Experience</h3>
                        <div className="space-y-3">
                            {resume.experience.map((exp) => (
                                <div key={exp.id} className="text-base">
                                    <div className="break-inside-avoid mb-2">
                                        <h4 className="font-semibold">{parseMarkdown(exp.position)}, {parseMarkdown(exp.company)}</h4>
                                        <p className="text-base text-gray-600">
                                            {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                                        </p>
                                    </div>
                                    {renderBulletedList(exp.description, "text-gray-700", "text-base")}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {resume.internships && resume.internships.length > 0 && (
                    <div className="mb-4">
                        <h3 className={`font-bold uppercase border-b-2 ${styles.borderColorClass} mb-2 text-base ${styles.headerClass}`} style={styles.headerColor || {}}>Internships</h3>
                        <div className="space-y-3">
                            {resume.internships.map((intern) => (
                                <div key={intern.id} className="text-base">
                                    <div className="break-inside-avoid mb-2">
                                        <h4 className="font-semibold">{parseMarkdown(intern.position)}, {parseMarkdown(intern.company)}</h4>
                                        <p className="text-base text-gray-600">
                                            {formatDate(intern.startDate)} - {intern.current ? 'Present' : formatDate(intern.endDate)}
                                        </p>
                                    </div>
                                    {renderBulletedList(intern.description, "text-gray-700", "text-base")}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {resume.projects && resume.projects.length > 0 && (
                    <div className="mb-4">
                        <h3 className="font-bold uppercase border-b-2 border-gray-900 mb-2 text-base">Projects</h3>
                        <div className="space-y-3">
                            {resume.projects.map((project) => (
                                <div key={project.id} className="break-inside-avoid text-base">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h4 className="font-semibold">{project.name}</h4>
                                        <span className="text-base text-gray-600 font-bold">
                                            {project.startDate && project.endDate ? `${project.startDate} - ${project.endDate} ` : ''}
                                        </span>
                                    </div>
                                    {project.url && <a href={project.url} className="text-blue-600 text-base mb-2 block">{project.url}</a>}
                                    {renderBulletedList(project.description, "text-gray-700", "text-base")}
                                    {project.technologies && project.technologies.length > 0 && (
                                        <p className="text-sm text-gray-500 mt-1 italic">Stack: {project.technologies.join(', ')}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {resume.certifications && resume.certifications.length > 0 && (
                    <div>
                        <h3 className="font-bold uppercase border-b-2 border-gray-900 mb-2 text-base">Certifications & Achievements</h3>
                        <div className="space-y-2">
                            {resume.certifications.map((cert) => (
                                <div key={cert.id}>
                                    <h4 className="font-semibold text-base uppercase">{cert.name}</h4>
                                    <p className="text-base text-gray-600">{cert.issuer}, {cert.date}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {renderAdditionalInfo(styles.headerClass, "font-bold uppercase border-b-2 border-gray-900 mb-2 text-base", styles.headerColor)}
            </div>
        </div >
    );

    // Design 4: Geometric Modern (Harry style)
    const renderGeometricModern = () => (
        <div className={`bg-white shadow-lg w-[1025px] mx-auto relative min-h-[800px] ${styles.fontFamily}`}>
            {/* Geometric Background Shapes */}
            <div className={`absolute top-0 left-0 w-full h-48 ${styles.sidebarClass} transform -skew-y-6 origin-top-left z-0`} style={styles.sidebarBg || {}}></div>
            <div className={`absolute top-0 right-0 w-2/3 h-48 ${styles.sidebarClass} transform -skew-y-6 origin-top-right z-0 opacity-60`} style={styles.sidebarBg || {}}></div>

            <div className="relative z-10 flex min-h-[800px]">
                <div className="w-1/3 bg-gray-100/90 pt-6 pb-6 px-4 flex flex-col items-center">
                    {showProfilePic && (
                        <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden z-20 mb-6">
                            <img
                                src={resume.personal_info.profilePicture}
                                alt={resume.personal_info.fullName}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    <div className="w-full space-y-4">
                        <div>
                            <h3 className="text-[#003366] font-bold text-base uppercase mb-1 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-[#0099cc] flex items-center justify-center text-white">
                                    <Phone size={16} />
                                </span>
                                Contact
                            </h3>
                            <div className="space-y-1 text-base text-gray-600 pl-2">
                                <p className="break-all">{resume.personal_info.email}</p>
                                <p>{resume.personal_info.phone}</p>
                                <p>{resume.personal_info.location}</p>
                                <p className="break-all">{resume.personal_info.portfolio}</p>
                                {resume.personal_info.dateOfBirth && <p>DOB: {resume.personal_info.dateOfBirth}</p>}
                                {resume.personal_info.customFields && resume.personal_info.customFields.map(f => (
                                    <p key={f.label} className="break-words">{f.label}: {f.value}</p>
                                ))}
                            </div>
                        </div>

                        {resume.skills && resume.skills.length > 0 && (
                            <div>
                                <h3 className="text-[#003366] font-bold text-base uppercase mb-1 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-[#0099cc] flex items-center justify-center text-white">
                                        <Award size={16} />
                                    </span>
                                    Skills
                                </h3>
                                <div className="space-y-1.5 pl-2">
                                    {expandStringItems(resume.skills).map((skill, index) => (
                                        <div key={index}>
                                            <div className="flex justify-between text-base mb-1.5">
                                                <span className="font-medium">{skill}</span>
                                            </div>
                                            <div className="h-1.5 bg-gray-300 rounded-full overflow-hidden">
                                                <div className="h-full bg-[#003366] w-4/5"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {resume.languages && resume.languages.length > 0 && (
                            <div>
                                <h3 className="text-[#003366] font-bold text-base uppercase mb-1 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-[#0099cc] flex items-center justify-center text-white">
                                        <Globe size={16} />
                                    </span>
                                    Languages
                                </h3>
                                <div className="space-y-1 pl-2 text-base">
                                    {expandLanguageItems(resume.languages).map((lang, i) => (
                                        <div key={i} className="flex justify-between">
                                            <span className="font-medium">{lang.name}</span>
                                            <span className="text-gray-500 text-sm">{lang.proficiency}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {resume.interests && resume.interests.length > 0 && (
                            <div>
                                <h3 className="text-[#003366] font-bold text-base uppercase mb-1 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-[#0099cc] flex items-center justify-center text-white">
                                        <Heart size={16} />
                                    </span>
                                    Interests
                                </h3>
                                <div className="space-y-1 pl-2 text-base">
                                    {expandStringItems(resume.interests).map((interest, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-[#003366] rounded-full"></span>
                                            <span className="break-words">{interest}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="w-2/3 pt-16 px-5 pb-5">
                    <div className="text-right mb-6 text-white">
                        <h1 className={`text-2xl font-bold uppercase mb-0.5 ${styles.headerClass}`} style={styles.headerColor || {}}>{resume.personal_info.fullName}</h1>
                        <p className="text-base opacity-90 tracking-widest uppercase">{resume.personal_info.title}</p>
                    </div>

                    {resume.summary && (
                        <div className="mb-3">
                            <h3 className={`text-white py-1.5 px-3 rounded-r-full inline-block font-bold uppercase mb-1.5 -ml-5 shadow-md text-base bg-${styles.fromColor}`} style={styles.sidebarBg || {}}>
                                About Me
                            </h3>
                            {renderSummary(resume.summary, "text-gray-600", "text-base")}

                        </div>
                    )}

                    {resume.education && resume.education.length > 0 && (
                        <div className="mb-3">
                            <h3 className={`text-white py-1.5 px-3 rounded-r-full inline-block font-bold uppercase mb-1.5 -ml-5 shadow-md text-base bg-${styles.fromColor}`} style={styles.sidebarBg || {}}>
                                Education
                            </h3>
                            <div className={`space-y-2 border-l-2 ml-1 pl-3 border-${styles.fromColor}`} style={styles.borderColor || {}}>
                                {resume.education.map((edu) => (
                                    <div key={edu.id} className="relative break-inside-avoid">
                                        <div className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-white bg-${styles.fromColor}`} style={styles.sidebarBg || {}}></div>
                                        <span className={`font-bold text-base ${styles.headerClass}`} style={styles.headerColor || {}}>
                                            {edu.startDate.split('-')[0]} - {edu.endDate.split('-')[0]}
                                        </span>
                                        <h4 className={`font-semibold uppercase mt-1 text-base ${styles.headerClass}`} style={styles.headerColor || {}}>{edu.institution}</h4>
                                        <p className="text-gray-600 text-base">{edu.degree} in {edu.field}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {resume.certifications && resume.certifications.length > 0 && (
                        <div className="mb-3">
                            <h3 className="bg-[#0099cc] text-white py-1.5 px-3 rounded-r-full inline-block font-bold uppercase mb-1.5 -ml-5 shadow-md text-base">
                                Certifications
                            </h3>
                            <div className="space-y-2 border-l-2 border-[#003366] ml-1 pl-3">
                                {resume.certifications.map((cert) => (
                                    <div key={cert.id} className="relative break-inside-avoid">
                                        <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-[#003366] border-2 border-white"></div>
                                        <span className="text-[#0099cc] font-bold text-base">
                                            {cert.date}
                                        </span>
                                        <h4 className="font-semibold text-[#003366] uppercase mt-1 text-base">{cert.name}</h4>
                                        <p className="text-gray-600 text-base">{cert.issuer}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {resume.experience && resume.experience.length > 0 && (
                        <div className="mb-3">
                            <h3 className={`text-white py-1.5 px-3 rounded-r-full inline-block font-bold uppercase mb-1.5 -ml-5 shadow-md text-base bg-${styles.fromColor}`} style={styles.sidebarBg || {}}>
                                Experience
                            </h3>
                            <div className={`space-y-3 border-l-2 ml-1 pl-3 border-${styles.fromColor}`} style={styles.borderColor || {}}>
                                {resume.experience.map((exp) => (
                                    <div key={exp.id} className="relative break-inside-avoid">
                                        <div className={`absolute -left-[23px] top-1 w-3 h-3 rounded-full border-2 border-white bg-${styles.fromColor}`} style={styles.sidebarBg || {}}></div>
                                        <span className={`font-bold text-base ${styles.headerClass}`} style={styles.headerColor || {}}>
                                            {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                                        </span>
                                        <h4 className={`font-semibold uppercase mt-1 ${styles.headerClass}`} style={styles.headerColor || {}}>{parseMarkdown(exp.company)}</h4>
                                        <p className="font-medium text-gray-700 mb-2 text-base">{parseMarkdown(exp.position)}</p>
                                        {renderBulletedList(exp.description, "text-gray-600", "text-base")}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {resume.internships && resume.internships.length > 0 && (
                        <div className="mb-3">
                            <h3 className={`text-white py-1.5 px-3 rounded-r-full inline-block font-bold uppercase mb-1.5 -ml-5 shadow-md text-base bg-${styles.fromColor}`} style={styles.sidebarBg || {}}>
                                Internships
                            </h3>
                            <div className={`space-y-3 border-l-2 ml-1 pl-3 border-${styles.fromColor}`} style={styles.borderColor || {}}>
                                {resume.internships.map((intern) => (
                                    <div key={intern.id} className="relative break-inside-avoid">
                                        <div className={`absolute -left-[23px] top-1 w-3 h-3 rounded-full border-2 border-white bg-${styles.fromColor}`} style={styles.sidebarBg || {}}></div>
                                        <span className={`font-bold text-base ${styles.headerClass}`} style={styles.headerColor || {}}>
                                            {formatDate(intern.startDate)} - {intern.current ? 'Present' : formatDate(intern.endDate)}
                                        </span>
                                        <h4 className={`font-semibold uppercase mt-1 ${styles.headerClass}`} style={styles.headerColor || {}}>{parseMarkdown(intern.company)}</h4>
                                        <p className="font-medium text-gray-700 mb-2 text-base">{parseMarkdown(intern.position)}</p>
                                        {renderBulletedList(intern.description, "text-gray-600", "text-base")}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {resume.projects && resume.projects.length > 0 && (
                        <div className="mb-3">
                            <h3 className={`text-white py-1.5 px-3 rounded-r-full inline-block font-bold uppercase mb-1.5 -ml-5 shadow-md text-sm bg-${styles.fromColor}`} style={styles.sidebarBg || {}}>
                                Projects
                            </h3>
                            <div className={`space-y-3 border-l-2 ml-1 pl-3 border-${styles.fromColor}`} style={styles.borderColor || {}}>
                                {resume.projects.map((project) => (
                                    <div key={project.id} className="relative break-inside-avoid">
                                        <div className={`absolute -left-[23px] top-1 w-3 h-3 rounded-full border-2 border-white bg-${styles.fromColor}`} style={styles.sidebarBg || {}}></div>
                                        <span className={`font-bold text-base ${styles.headerClass}`} style={styles.headerColor || {}}>
                                            {project.startDate && project.endDate ? `${formatDate(project.startDate)} - ${formatDate(project.endDate)} ` : ''}
                                        </span>
                                        <h4 className={`font-semibold uppercase mt-1 text-base ${styles.headerClass}`} style={styles.headerColor || {}}>{project.name}</h4>
                                        {project.url && <a href={project.url} className="text-blue-600 text-base hover:underline block mb-1">{project.url}</a>}
                                        {renderBulletedList(project.description, "text-gray-600", "text-base")}
                                        {project.technologies && project.technologies.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {project.technologies.map(t => <span key={t} className="text-sm bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 border border-gray-200">{t}</span>)}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {renderAdditionalInfo(styles.headerClass, "text-white py-1 px-3 rounded-r-full inline-block font-bold uppercase mb-1.5 -ml-5 shadow-md text-base", styles.sidebarBg)}
                </div>
            </div>
        </div>
    );

    // STUB: renderHarvardClassic
    // Design 5: Harvard Classic (John style)
    const renderHarvardClassic = () => (
        <div className={`w-[1025px] mx-auto bg-white shadow-lg p-6 text-gray-900 ${styles.fontFamily}`}>
            <div className={`text-center border-b-2 pb-3 mb-4`} style={styles.borderColor || {}}>
                <h1 className={`text-4xl font-bold uppercase tracking-wide mb-2 ${styles.headerClass}`} style={styles.headerColor || {}}>{resume.personal_info.fullName}</h1>
                <div className="flex justify-center gap-4 text-base">
                    {resume.personal_info.phone && <span>{resume.personal_info.phone}</span>}
                    {resume.personal_info.email && <span>{resume.personal_info.email}</span>}
                    {resume.personal_info.location && <span>{resume.personal_info.location}</span>}
                    {resume.personal_info.linkedin && <span>{resume.personal_info.linkedin}</span>}
                    {resume.personal_info.portfolio && <span>{resume.personal_info.portfolio}</span>}
                    {resume.personal_info.dateOfBirth && <span>DOB: {resume.personal_info.dateOfBirth}</span>}
                    {resume.personal_info.customFields?.map((f, i) => (
                        <span key={i}>{f.label}: {f.value}</span>
                    ))}
                </div>
            </div>

            {resume.summary && (
                <div className="mb-6">
                    <h3 className={`text-base font-bold uppercase border-b mb-2 pb-1 ${styles.headerClass} ${styles.borderColorClass}`} style={{ ...styles.headerColor, ...styles.borderColor }}>Professional Summary</h3>
                    {renderSummary(resume.summary, "text-gray-900", "text-base")}

                </div>
            )}

            {resume.education && resume.education.length > 0 && (
                <div className="mb-6">
                    <h3 className={`text-base font-bold uppercase border-b mb-2 pb-1 ${styles.headerClass} ${styles.borderColorClass}`} style={{ ...styles.headerColor, ...styles.borderColor }}>Education</h3>
                    <div className="space-y-4">
                        {resume.education.map((edu) => (
                            <div key={edu.id} className="break-inside-avoid">
                                <div className="flex justify-between items-baseline">
                                    <h4 className="font-semibold text-base">{edu.institution}</h4>
                                    <span className="text-base">{edu.location}</span>
                                </div>
                                <div className="flex justify-between items-baseline italic text-base">
                                    <span>{edu.degree} in {edu.field}</span>
                                    <span>{formatDate(edu.startDate)} - {edu.current ? 'Present' : formatDate(edu.endDate)}</span>
                                </div>
                                {edu.gpa && <div className="text-base">GPA: {edu.gpa}</div>}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {resume.experience && resume.experience.length > 0 && (
                <div className="mb-6">
                    <h3 className={`text-base font-bold uppercase border-b mb-2 pb-1 ${styles.headerClass} ${styles.borderColorClass}`} style={{ ...styles.headerColor, ...styles.borderColor }}>Experience</h3>
                    <div className="space-y-4">
                        {resume.experience.map((exp) => (
                            <div key={exp.id} className="break-inside-avoid">
                                <div className="flex justify-between items-baseline">
                                    <h4 className="font-bold text-base">{parseMarkdown(exp.company)}</h4>
                                    <span className="text-base">{exp.location}</span>
                                </div>
                                <div className="flex justify-between items-baseline italic text-base mb-1">
                                    <span>{parseMarkdown(exp.position)}</span>
                                    <span>{formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}</span>
                                </div>
                                {renderBulletedList(exp.description, "text-gray-700", "text-base")}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {resume.internships && resume.internships.length > 0 && (
                <div className="mb-6">
                    <h3 className={`text-base font-bold uppercase border-b mb-2 pb-1 ${styles.headerClass} ${styles.borderColorClass}`} style={{ ...styles.headerColor, ...styles.borderColor }}>Internships</h3>
                    <div className="space-y-4">
                        {resume.internships.map((intern) => (
                            <div key={intern.id}>
                                <div className="flex justify-between items-baseline">
                                    <h4 className="font-bold text-base">{parseMarkdown(intern.company)}</h4>
                                    <span className="text-base">{intern.location}</span>
                                </div>
                                <div className="flex justify-between items-baseline italic text-base mb-1">
                                    <span>{parseMarkdown(intern.position)}</span>
                                    <span>{formatDate(intern.startDate)} - {intern.current ? 'Present' : formatDate(intern.endDate)}</span>
                                </div>
                                {renderBulletedList(intern.description, "text-gray-700", "text-base")}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {resume.projects && resume.projects.length > 0 && (
                <div className="mb-6">
                    <h3 className={`text-base font-bold uppercase border-b mb-2 pb-1 ${styles.headerClass} ${styles.borderColorClass}`} style={{ ...styles.headerColor, ...styles.borderColor }}>Projects</h3>
                    <div className="space-y-4">
                        {resume.projects.map((project) => (
                            <div key={project.id}>
                                <div className="flex justify-between items-baseline">
                                    <h4 className="font-bold text-base">{project.name}</h4>
                                    <span className="text-base italic">
                                        {project.startDate && project.endDate ? `${formatDate(project.startDate)} - ${formatDate(project.endDate)} ` : ''}
                                    </span>
                                </div>
                                {project.url && <a href={project.url} className="text-blue-800 text-base mb-1 block hover:underline">{project.url}</a>}
                                {renderBulletedList(project.description, "text-gray-700", "text-base")}
                                {project.technologies && project.technologies.length > 0 && (
                                    <p className="text-base text-gray-600 mt-1 italic">Technologies: {project.technologies.join(', ')}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {resume.skills && resume.skills.length > 0 && (
                <div className="mb-6">
                    <h3 className={`text-base font-bold uppercase border-b mb-2 pb-1 ${styles.headerClass} ${styles.borderColorClass}`} style={{ ...styles.headerColor, ...styles.borderColor }}>Skills</h3>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-base">
                        {expandStringItems(resume.skills).map((skill, i) => (
                            <div key={i} className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 bg-black rounded-full mt-1.5 flex-shrink-0"></span>
                                <span>{skill}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {resume.languages && resume.languages.length > 0 && (
                <div className="mb-6">
                    <h3 className={`text-base font-bold uppercase border-b mb-2 pb-1 ${styles.headerClass} ${styles.borderColorClass}`} style={{ ...styles.headerColor, ...styles.borderColor }}>Languages</h3>
                    <div className="text-base">
                        <span>{expandLanguageItems(resume.languages).map(l => l.name + (l.proficiency ? ` (${l.proficiency})` : '')).join(', ')}</span>
                    </div>
                </div>
            )}
            {renderAdditionalInfo(styles.headerClass, `text-base font-bold uppercase border-b mb-2 pb-1 ${styles.borderColorClass}`, { ...styles.headerColor, ...styles.borderColor })}
        </div>
    );



    // Design 6: Timeline Sidebar (Timeline view with sidebar)
    const renderTimelineSidebar = () => (
        <div className={`flex min-h-[800px] bg-white shadow-lg mx-auto max-w-4xl ${styles.fontFamily}`}>
            <div className={`w-1/3 ${styles.sidebarClass} text-white p-6 pt-10`} style={styles.sidebarBg || { background: '#2c3e50' }}>
                <div className="mb-10 text-center">
                    {showProfilePic && (
                        <div className="w-32 h-32 rounded-full border-4 border-white/30 mx-auto mb-6 overflow-hidden">
                            <img
                                src={resume.personal_info.profilePicture}
                                alt={resume.personal_info.fullName}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}
                    <h1 className="text-2xl font-bold uppercase mb-2">{resume.personal_info.fullName}</h1>
                    <p className="text-base tracking-wider opacity-80 uppercase">{resume.personal_info.title}</p>
                </div>

                <div className="space-y-8">
                    <div>
                        <h3 className="text-base font-bold uppercase tracking-widest border-b border-white/20 pb-2 mb-4 opacity-80">Contact</h3>
                        <div className="space-y-3 text-base font-light opacity-90">
                            {resume.personal_info.phone && <div className="flex items-center gap-3"><Phone size={18} /> {resume.personal_info.phone}</div>}
                            {resume.personal_info.email && <div className="flex items-center gap-3"><Mail size={18} /> <span className="break-all">{resume.personal_info.email}</span></div>}
                            {resume.personal_info.location && <div className="flex items-center gap-3"><MapPin size={18} /> {resume.personal_info.location}</div>}
                            {resume.personal_info.linkedin && <div className="flex items-center gap-3"><Linkedin size={18} /> <span className="break-all">{resume.personal_info.linkedin}</span></div>}
                            {resume.personal_info.portfolio && <div className="flex items-center gap-3"><Globe size={18} /> <span className="break-all">{resume.personal_info.portfolio}</span></div>}
                            {resume.personal_info.dateOfBirth && <div className="flex items-center gap-3"><Calendar size={18} /> DOB: {resume.personal_info.dateOfBirth}</div>}
                            {resume.personal_info.customFields?.map((f, i) => (
                                <div key={i} className="flex items-center gap-3"><div className="w-3.5 h-3.5" /> <span className="break-all"><span className="font-bold">{f.label}:</span> {f.value}</span></div>
                            ))}
                        </div>
                    </div>

                    {resume.skills && resume.skills.length > 0 && (
                        <div>
                            <h3 className="text-base font-bold uppercase tracking-widest border-b border-white/20 pb-2 mb-4 opacity-80">Skills</h3>
                            <div className="flex flex-wrap gap-2 text-base font-light">
                                {expandStringItems(resume.skills).map((skill, i) => (
                                    <span key={i} className="bg-white/10 px-2 py-1 rounded">{skill}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {resume.languages && resume.languages.length > 0 && (
                        <div>
                            <h3 className="text-base font-bold uppercase tracking-widest border-b border-white/20 pb-2 mb-4 opacity-80">Languages</h3>
                            <ul className="space-y-2 text-base font-light">
                                {expandLanguageItems(resume.languages).map((l, i) => (
                                    <li key={i}>{l.name} {l.proficiency && <span className="opacity-70">({l.proficiency})</span>}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {resume.interests && resume.interests.length > 0 && (
                        <div>
                            <h3 className="text-base font-bold uppercase tracking-widest border-b border-white/20 pb-2 mb-4 opacity-80">Interests</h3>
                            <div className="flex flex-wrap gap-2 text-base font-light">
                                {expandStringItems(resume.interests).map((interest, i) => (
                                    <span key={i} className="bg-white/10 px-2 py-1 rounded">{interest}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="w-2/3 p-10 bg-gray-50">
                {resume.summary && (
                    <div className="mb-10">
                        <h3 className={`text-xl font-bold uppercase mb-4 flex items-center gap-3 ${styles.headerClass}`} style={styles.headerColor || {}}>
                            <span className={`w-2 h-8 bg-${styles.fromColor}`} style={styles.accentBg || {}}></span> Summary
                        </h3>
                        <div className={`bg-white p-6 rounded shadow-sm border-l-4 border-${styles.fromColor}`} style={styles.borderColor || {}}>
                            {renderSummary(resume.summary, "text-gray-600")}

                        </div>
                    </div>
                )}

                {resume.experience && resume.experience.length > 0 && (
                    <div className="mb-10">
                        <h3 className={`text-xl font-bold uppercase mb-6 flex items-center gap-3 ${styles.headerClass}`} style={styles.headerColor || {}}>
                            <span className={`w-2 h-8 bg-${styles.fromColor}`} style={styles.accentBg || {}}></span> Experience
                        </h3>
                        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-gray-300 before:to-transparent">
                            {resume.experience.map((exp) => (
                                <div key={exp.id} className="relative pl-10 group break-inside-avoid">
                                    <div className={`absolute left-0 top-1 w-5 h-5 rounded-full border-4 border-white shadow-md group-hover:scale-110 transition-transform bg-${styles.fromColor}`} style={styles.accentBg || {}}></div>
                                    <div className="bg-white p-5 rounded shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                        <span className="text-base font-bold text-gray-400 block mb-1">{formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}</span>
                                        <h4 className={`font-bold text-lg leading-none mb-1 ${styles.headerClass}`} style={styles.headerColor || {}}>{parseMarkdown(exp.company)}</h4>
                                        <div className={`text-base font-bold uppercase mb-2 ${styles.headerClass}`} style={styles.headerColor || {}}>{parseMarkdown(exp.position)}</div>
                                        {renderBulletedList(exp.description, "text-gray-600", "text-base")}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {resume.internships && resume.internships.length > 0 && (
                    <div className="mb-10">
                        <h3 className={`text-xl font-bold uppercase mb-6 flex items-center gap-3 ${styles.headerClass}`} style={styles.headerColor || {}}>
                            <span className={`w-2 h-8 bg-${styles.fromColor}`} style={styles.accentBg || {}}></span> Internships
                        </h3>
                        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-gray-300 before:to-transparent">
                            {resume.internships.map((intern) => (
                                <div key={intern.id} className="relative pl-10 group break-inside-avoid">
                                    <div className={`absolute left-0 top-1 w-5 h-5 rounded-full border-4 border-white shadow-md group-hover:scale-110 transition-transform bg-${styles.fromColor}`} style={styles.accentBg || {}}></div>
                                    <div className="bg-white p-5 rounded shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                        <span className="text-base font-bold text-gray-400 block mb-1">{formatDate(intern.startDate)} - {intern.current ? 'Present' : formatDate(intern.endDate)}</span>
                                        <h4 className={`font-bold text-lg leading-none mb-1 ${styles.headerClass}`} style={styles.headerColor || {}}>{parseMarkdown(intern.company)}</h4>
                                        <div className={`text-base font-bold uppercase mb-2 ${styles.headerClass}`} style={styles.headerColor || {}}>{parseMarkdown(intern.position)}</div>
                                        {renderBulletedList(intern.description, "text-gray-600", "text-base")}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {resume.projects && resume.projects.length > 0 && (
                    <div className="mb-10">
                        <h3 className={`text-xl font-bold uppercase ${styles.headerColor} mb-6 flex items-center gap-3`}>
                            <span className={`w-2 h-8 ${styles.accentBg}`}></span> Projects
                        </h3>
                        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-gray-300 before:to-transparent">
                            {resume.projects.map((project) => (
                                <div key={project.id} className="relative pl-10 group">
                                    <div className={`absolute left-0 top-1 w-5 h-5 rounded-full border-4 border-white ${styles.accentBg} shadow-md group-hover:scale-110 transition-transform`}></div>
                                    <div className="bg-white p-5 rounded shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h4 className="font-bold text-lg leading-none text-[#2c3e50]">{project.name}</h4>
                                            <span className="text-base font-bold text-gray-400">
                                                {project.startDate && project.endDate ? `${formatDate(project.startDate)} - ${formatDate(project.endDate)} ` : ''}
                                            </span>
                                        </div>
                                        {project.url && <a href={project.url} className="text-[#f1c40f] font-bold text-base mb-2 block hover:underline">{project.url}</a>}
                                        {renderBulletedList(project.description, "text-gray-600", "text-base")}
                                        {project.technologies && project.technologies.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-1">
                                                {project.technologies.map(t => <span key={t} className="text-sm bg-yellow-50 text-yellow-700 px-2 py-1 rounded">{t}</span>)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}



                {resume.education && resume.education.length > 0 && (
                    <div>
                        <h3 className={`text-xl font-bold uppercase mb-6 flex items-center gap-3 ${styles.headerClass}`} style={styles.headerColor || {}}>
                            <span className={`w-2 h-8 bg-${styles.fromColor}`} style={styles.accentBg || {}}></span> Education
                        </h3>
                        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-gray-300 before:to-transparent">
                            {resume.education.map((edu) => (
                                <div key={edu.id} className="relative pl-10">
                                    <div className={`absolute left-0 top-1 w-5 h-5 rounded-full border-4 border-white shadow-md bg-${styles.fromColor}`} style={styles.accentBg || {}}></div>
                                    <div className="bg-white p-5 rounded shadow-sm border border-gray-100">
                                        <span className="text-base font-bold text-gray-400 block mb-1">{formatDate(edu.startDate)} - {edu.current ? 'Present' : formatDate(edu.endDate)}</span>
                                        <h4 className={`font-bold text-lg leading-none mb-1 ${styles.headerClass}`} style={styles.headerColor || {}}>{edu.institution}</h4>
                                        <p className={`text-base font-bold mb-1 ${styles.headerClass}`} style={styles.headerColor || {}}>{edu.degree} in {edu.field}</p>
                                        {edu.gpa && <p className="text-base text-gray-500">GPA: {edu.gpa}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {resume.certifications && resume.certifications.length > 0 && (
                    <div className="mt-10">
                        <h3 className={`text-xl font-bold uppercase mb-6 flex items-center gap-3 ${styles.headerClass}`} style={styles.headerColor || {}}>
                            <span className={`w-2 h-8 bg-${styles.fromColor}`} style={styles.accentBg || {}}></span> Certifications
                        </h3>
                        <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-gray-300 before:to-transparent">
                            {resume.certifications.map((cert) => (
                                <div key={cert.id} className="relative pl-10">
                                    <div className={`absolute left-0 top-1 w-5 h-5 rounded-full border-4 border-white shadow-md bg-${styles.fromColor}`} style={styles.accentBg || {}}></div>
                                    <div className="bg-white p-4 rounded shadow-sm border border-gray-100">
                                        <span className="text-base font-bold text-gray-400 block mb-1">{cert.date}</span>
                                        <h4 className={`font-bold text-base leading-none mb-1 ${styles.headerClass}`} style={styles.headerColor || {}}>{cert.name}</h4>
                                        <p className="text-base text-gray-600">{cert.issuer}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {renderAdditionalInfo(styles.headerColor, `text-xl font-bold uppercase mb-6 flex items-center gap-3 ${styles.headerClass}`)}
            </div>
        </div>
    );

    // Design 7: Corporate Bold (Bold headers, clean layout)
    const renderCorporateBold = () => (
        <div className={`bg-white shadow-lg max-w-4xl mx-auto min-h-[800px] flex ${styles.fontFamily}`}>
            <div className={`w-1/3 ${styles.sidebarClass || 'bg-slate-900'} text-white p-8`} style={styles.sidebarBg || {}}>
                <div className="mb-10 text-center">
                    {showProfilePic && (
                        <div className="w-32 h-32 mx-auto mb-6 rounded-lg border-4 border-white/10 overflow-hidden">
                            <img
                                src={resume.personal_info.profilePicture}
                                alt={resume.personal_info.fullName}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}
                </div>

                <div className="space-y-10">
                    <div>
                        <h3 className="text-base font-bold uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-700 pb-2">Connect</h3>
                        <div className="space-y-4 text-base font-light text-slate-300">
                            {resume.personal_info.phone && <div className="flex items-center gap-3"><Phone size={18} /> {resume.personal_info.phone}</div>}
                            {resume.personal_info.email && <div className="flex items-center gap-3"><Mail size={18} /> <span className="break-all">{resume.personal_info.email}</span></div>}
                            {resume.personal_info.location && <div className="flex items-center gap-3"><MapPin size={18} /> {resume.personal_info.location}</div>}
                            {resume.personal_info.linkedin && <div className="flex items-center gap-3"><Linkedin size={18} /> <span className="break-all">{resume.personal_info.linkedin}</span></div>}
                            {resume.personal_info.portfolio && <div className="flex items-center gap-3"><Globe size={18} /> <span className="break-all">{resume.personal_info.portfolio}</span></div>}
                            {resume.personal_info.dateOfBirth && <div className="flex items-center gap-3"><Calendar size={18} /> {resume.personal_info.dateOfBirth}</div>}
                            {resume.personal_info.customFields?.map((f, i) => (
                                <div key={i} className="flex items-center gap-3"><div className="w-4 h-4" /> <span className="break-all"><span className="font-bold">{f.label}:</span> {f.value}</span></div>
                            ))}
                        </div>
                    </div>

                    {(resume.skills && resume.skills.length > 0) && (
                        <div>
                            <h3 className="text-base font-bold uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-700 pb-2">Skills</h3>
                            <div className="space-y-2 text-base text-slate-300">
                                {expandStringItems(resume.skills).map((skill, i) => (
                                    <div key={i} className="flex items-start gap-2">
                                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></span>
                                        <span className="break-words">{skill}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {(resume.languages && resume.languages.length > 0) && (
                        <div>
                            <h3 className="text-base font-bold uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-700 pb-2">Languages</h3>
                            <div className="space-y-2 text-base text-slate-300">
                                {expandLanguageItems(resume.languages).map((l, i) => (
                                    <div key={i} className="flex justify-between">
                                        <span>{l.name}</span>
                                        <span className="text-slate-500 text-base">{l.proficiency}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {(resume.interests && resume.interests.length > 0) && (
                        <div>
                            <h3 className="text-base font-bold uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-700 pb-2">Interests</h3>
                            <div className="space-y-2 text-base text-slate-300">
                                {expandStringItems(resume.interests).map((interest, i) => (
                                    <div key={i} className="flex items-start gap-2">
                                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></span>
                                        <span className="break-words">{interest}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="w-2/3 p-10 bg-white">
                <div className="mb-10 text-right">
                    <h1 className={`text-5xl font-bold uppercase ${styles.headerColor} tracking-tighter mb-2`}>{resume.personal_info.fullName}</h1>
                    <p className={`text-xl ${styles.headerColor} uppercase tracking-widest font-bold`}>{resume.personal_info.title}</p>
                </div>

                {resume.summary && (
                    <div className={`mb-10 bg-slate-50 p-6 rounded-lg border-l-4 ${styles.borderColorClass}`} style={styles.borderColor || {}}>
                        <h3 className={`font-bold ${styles.headerClass} uppercase tracking-wider mb-2 text-lg`} style={styles.headerColor || {}}>Profile</h3>
                        {renderSummary(resume.summary, "text-slate-600", "text-base")}

                    </div>
                )}

                {resume.experience && resume.experience.length > 0 && (
                    <div className="mb-10">
                        <h3 className={`text-2xl font-bold uppercase tracking-tighter mb-6 border-b-4 pb-2 inline-block ${styles.headerClass} ${styles.borderColorClass}`} style={{ ...styles.headerColor, ...styles.borderColor }}>Experience</h3>
                        <div className="space-y-8">
                            {resume.experience.map((exp) => (
                                <div key={exp.id}>
                                    <div className="flex justify-between items-baseline mb-2">
                                        <h4 className="font-semibold text-lg text-slate-800">{parseMarkdown(exp.position)} <span className="font-normal text-slate-500">|</span> {parseMarkdown(exp.company)}</h4>
                                        <span className="text-lg font-bold bg-slate-100 px-2 py-1 rounded">{formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}</span>
                                    </div>
                                    {renderBulletedList(exp.description, "text-slate-600", "text-base")}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {resume.internships && resume.internships.length > 0 && (
                    <div className="mb-10">
                        <h3 className={`text-2xl font-bold uppercase tracking-tighter mb-6 border-b-4 pb-2 inline-block ${styles.headerClass} ${styles.borderColorClass}`} style={{ ...styles.headerColor, ...styles.borderColor }}>Internships</h3>
                        <div className="space-y-8">
                            {resume.internships.map((intern) => (
                                <div key={intern.id}>
                                    <div className="flex justify-between items-baseline mb-2">
                                        <h4 className="font-semibold text-lg text-slate-800">{parseMarkdown(intern.position)} <span className="font-normal text-slate-500">|</span> {parseMarkdown(intern.company)}</h4>
                                        <span className="text-lg font-bold bg-slate-100 px-2 py-1 rounded">{formatDate(intern.startDate)} - {intern.current ? 'Present' : formatDate(intern.endDate)}</span>
                                    </div>
                                    {renderBulletedList(intern.description, "text-slate-600", "text-base")}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {resume.projects && resume.projects.length > 0 && (
                    <div className="mb-10">
                        <h3 className={`text-2xl font-bold uppercase tracking-tighter mb-6 border-b-4 pb-2 inline-block ${styles.headerClass} ${styles.borderColorClass}`} style={{ ...styles.headerColor, ...styles.borderColor }}>Projects</h3>
                        <div className="space-y-8">
                            {resume.projects.map((project) => (
                                <div key={project.id}>
                                    <div className="flex justify-between items-baseline mb-2">
                                        <h4 className="font-semibold text-lg text-slate-800">{project.name}</h4>
                                        <span className="text-lg font-bold text-slate-400">
                                            {project.startDate && project.endDate ? `${formatDate(project.startDate)} - ${formatDate(project.endDate)} ` : ''}
                                        </span>
                                    </div>
                                    {project.url && <a href={project.url} className="text-blue-600 font-bold text-base mb-2 block hover:underline">{project.url}</a>}
                                    {renderBulletedList(project.description, "text-slate-600", "text-base")}
                                    {project.technologies && project.technologies.length > 0 && (
                                        <div className="mt-2 pl-4">
                                            {project.technologies.map(t => <span key={t} className="inline-block bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-base mr-2 mb-1 border border-slate-200">{t}</span>)}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {resume.education && resume.education.length > 0 && (
                    <div className="mb-10 break-inside-avoid">
                        <h3 className={`text-2xl font-bold uppercase tracking-tighter mb-6 border-b-4 pb-2 inline-block ${styles.headerClass} ${styles.borderColorClass}`} style={{ ...styles.headerColor, ...styles.borderColor }}>Education</h3>
                        <div className="space-y-6">
                            {resume.education.map((edu) => (
                                <div key={edu.id} className="flex justify-between break-inside-avoid">
                                    <div>
                                        <h4 className="font-semibold text-lg text-slate-800">{edu.institution}</h4>
                                        <p className="text-blue-600 font-medium text-base">{edu.degree} in {edu.field}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-semibold text-slate-400 text-lg block">{formatDate(edu.startDate)} - {edu.current ? 'Present' : formatDate(edu.endDate)}</span>
                                        {edu.gpa && <span className="text-slate-500 text-base mt-1 block">GPA: {edu.gpa}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {resume.certifications && resume.certifications.length > 0 && (
                    <div className="mb-10 break-inside-avoid">
                        <h3 className={`text-2xl font-bold uppercase tracking-tighter mb-6 border-b-4 pb-2 inline-block ${styles.headerClass} ${styles.borderColorClass}`} style={{ ...styles.headerColor, ...styles.borderColor }}>Certifications</h3>
                        <div className="space-y-6">
                            {resume.certifications.map((cert) => (
                                <div key={cert.id} className="flex justify-between break-inside-avoid">
                                    <div>
                                        <h4 className="font-semibold text-lg text-slate-800">{cert.name}</h4>
                                        <p className="text-slate-600 font-medium text-base">{cert.issuer}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-semibold text-slate-400 text-lg block">{cert.date}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {renderAdditionalInfo(styles.headerColor, `text-2xl font-bold uppercase tracking-tighter mb-6 border-b-4 pb-2 inline-block ${styles.headerClass} ${styles.borderColorClass}`)}
            </div>
        </div>
    );

    // Design 8: Modern Compact (Based on Image 1)
    const renderModernCompact = () => (
        <div className={`bg-white max-w-4xl mx-auto min-h-[800px] p-8 ${styles.fontFamily} text-gray-800 shadow-lg`}>
            <div className={`flex justify-between items-start border-b-2 ${styles.borderColorClass} pb-4 mb-6`} style={styles.borderColor || {}}>
                <div>
                    <h1 className={`text-3xl font-bold uppercase ${styles.headerClass}`} style={styles.headerColor || {}}>{resume.personal_info.fullName}</h1>
                    <div className="flex gap-4 text-lg mt-1 text-gray-600 font-medium">
                        {resume.personal_info.email && <span>{resume.personal_info.email}</span>}
                        {resume.personal_info.phone && <span>{resume.personal_info.phone}</span>}
                    </div>
                </div>
                <div className="text-right text-lg">
                    {resume.personal_info.location && <div>{resume.personal_info.location}</div>}
                    {resume.personal_info.linkedin && <div>{resume.personal_info.linkedin}</div>}
                    {resume.personal_info.portfolio && <div>{resume.personal_info.portfolio}</div>}
                    {resume.personal_info.dateOfBirth && <div>DOB: {resume.personal_info.dateOfBirth}</div>}
                    {resume.personal_info.customFields && resume.personal_info.customFields.map(f => (
                        <div key={f.label}>{f.label}: {f.value}</div>
                    ))}
                </div>
            </div>

            {resume.summary && (
                <div className="mb-6">
                    <h3 className={`text-base font-bold uppercase tracking-wider mb-2 ${styles.headerClass}`} style={styles.headerColor || {}}>Professional Summary</h3>
                    <div className="border-b-2 border-gray-100 pb-4">
                        {renderSummary(resume.summary, "text-gray-700", "text-base")}
                    </div>
                </div>
            )}

            {resume.education && resume.education.length > 0 && (
                <div className="mb-6 break-inside-avoid">
                    <h3 className={`text-base font-bold uppercase tracking-wider mb-2 ${styles.headerClass}`} style={styles.headerColor || {}}>Education</h3>
                    <div className="space-y-2">
                        {resume.education.map(edu => (
                            <div key={edu.id} className="flex justify-between text-base break-inside-avoid">
                                <div>
                                    <span className="font-semibold">{edu.institution}</span>
                                    <div className="text-gray-600">{edu.degree} in {edu.field} {edu.gpa && `; GPA: ${edu.gpa} `}</div>
                                </div>
                                <div className="text-right font-medium">
                                    {edu.location}<br />
                                    {formatDate(edu.startDate)} - {edu.current ? 'Present' : formatDate(edu.endDate)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {resume.certifications && resume.certifications.length > 0 && (
                <div className="mb-6 break-inside-avoid">
                    <h3 className={`text-base font-bold uppercase tracking-wider mb-2 ${styles.headerClass}`} style={styles.headerColor || {}}>Certifications</h3>
                    <div className="space-y-2">
                        {resume.certifications.map(cert => (
                            <div key={cert.id} className="flex justify-between text-base break-inside-avoid">
                                <div>
                                    <span className="font-semibold">{cert.name}</span>
                                    <div className="text-gray-600">{cert.issuer}</div>
                                </div>
                                <div className="text-right font-medium">
                                    {cert.date}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {resume.skills && resume.skills.length > 0 && (
                <div className={`mb-6 border-y ${styles.borderColorClass} py-3`} style={styles.borderColor || {}}>
                    <h3 className={`text-base font-bold uppercase tracking-wider mb-2 center ${styles.headerClass}`} style={styles.headerColor || {}}>Skills Summary</h3>
                    <div className="grid grid-cols-2 text-base gap-x-8 gap-y-1">
                        {expandStringItems(resume.skills).map((skill, i) => (
                            <div key={i} className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 bg-gray-800 rounded-full mt-1.5 flex-shrink-0"></div>
                                <span className="break-words">{skill}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {resume.languages && resume.languages.length > 0 && (
                <div className={`mb-6 border-y ${styles.borderColorClass} py-3`} style={styles.borderColor || {}}>
                    <h3 className={`text-base font-bold uppercase tracking-wider mb-2 center ${styles.headerClass}`} style={styles.headerColor || {}}>Languages</h3>
                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-base">
                        {expandLanguageItems(resume.languages).map((lang, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-gray-800 rounded-full"></div>
                                {lang.name} {lang.proficiency && <span className="text-gray-500">({lang.proficiency})</span>}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {resume.interests && resume.interests.length > 0 && (
                <div className={`mb-6 border-y ${styles.borderColorClass} py-3`} style={styles.borderColor || {}}>
                    <h3 className={`text-base font-bold uppercase tracking-wider mb-2 center ${styles.headerClass}`} style={styles.headerColor || {}}>Interests</h3>
                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-base">
                        {expandStringItems(resume.interests).map((interest, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-gray-800 rounded-full"></div>
                                {interest}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {resume.experience && resume.experience.length > 0 && (
                <div className="mb-6 break-inside-avoid">
                    <h3 className={`text-base font-bold uppercase tracking-wider mb-3 text-center border-b pb-1 ${styles.borderColorClass} ${styles.headerClass}`} style={{ ...styles.borderColor, ...styles.headerColor }}>Work Experience</h3>
                    <div className="space-y-4">
                        {resume.experience.map((exp) => (
                            <div key={exp.id} className="break-inside-avoid">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h4 className="font-bold uppercase text-base">{parseMarkdown(exp.position)} | {parseMarkdown(exp.company)}</h4>
                                    <span className="text-base font-bold">{formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}</span>
                                </div>
                                {renderBulletedList(exp.description, "text-gray-700", "text-base")}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {resume.internships && resume.internships.length > 0 && (
                <div className="mb-6 break-inside-avoid">
                    <h3 className={`text-base font-bold uppercase tracking-wider mb-3 text-center border-b pb-1 ${styles.borderColorClass} ${styles.headerClass}`} style={{ ...styles.borderColor, ...styles.headerColor }}>Internships</h3>
                    <div className="space-y-5">
                        {resume.internships.map((intern) => (
                            <div key={intern.id} className="break-inside-avoid">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h4 className="font-bold uppercase text-base">{parseMarkdown(intern.position)} | {parseMarkdown(intern.company)}</h4>
                                    <span className="text-base font-bold">{formatDate(intern.startDate)} - {intern.current ? 'Present' : formatDate(intern.endDate)}</span>
                                </div>
                                {renderBulletedList(intern.description, "text-gray-700", "text-base")}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {resume.projects && resume.projects.length > 0 && (
                <div className="mb-6 break-inside-avoid">
                    <h3 className={`text-base font-bold uppercase tracking-wider mb-3 text-center border-b pb-1 ${styles.borderColorClass} ${styles.headerClass}`} style={{ ...styles.borderColor, ...styles.headerColor }}>Projects</h3>
                    <div className="space-y-5">
                        {resume.projects.map((project) => (
                            <div key={project.id} className="text-base break-inside-avoid">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h4 className="font-bold uppercase">{project.name}</h4>
                                    {project.startDate && project.endDate && <span className="text-base font-bold">{project.startDate} - {project.endDate}</span>}
                                </div>
                                {project.url && <a href={project.url} className="text-base text-blue-600 block mb-1">{project.url}</a>}
                                {renderBulletedList(project.description, "text-gray-700", "text-base")}
                                {project.technologies && project.technologies.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {project.technologies.map(t => <span key={t} className="text-sm bg-gray-100 px-1 rounded">{t}</span>)}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )
            }
            {renderAdditionalInfo(styles.headerColor, "text-base font-bold uppercase tracking-wider mb-3 text-center border-b " + styles.borderColor + " pb-1")}
        </div>
    );

    // Design 9: Elegant Maroon
    const renderElegantMaroon = () => (
        <div className={`flex min-h-[800px] bg-white shadow-lg mx-auto max-w-4xl ${styles.fontFamily}`}>
            <div className={`w-1/3 text-white flex flex-col bg-${styles.fromColor}`} style={styles.sidebarBg || { background: '#5a1313' }}>
                <div className={`p-8 text-center brightness-90 bg-${styles.fromColor}`} style={styles.sidebarBg || { background: '#5a1313' }}>
                    {showProfilePic && (
                        <div className="w-32 h-32 mx-auto mb-6 rounded-full border-4 border-white/20 overflow-hidden">
                            <img
                                src={resume.personal_info.profilePicture}
                                alt={resume.personal_info.fullName}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}
                    <h1 className="text-2xl font-bold uppercase mb-2 leading-tight">{resume.personal_info.fullName}</h1>
                    <p className="text-base tracking-widest uppercase opacity-80">{resume.personal_info.title}</p>
                </div>

                <div className="p-8 space-y-8 flex-1">
                    <div>
                        <h3 className="text-lg font-bold border-b border-white/30 pb-2 mb-4 uppercase">Contact</h3>
                        <div className="space-y-3 text-base opacity-90">
                            {resume.personal_info.phone && <div className="flex items-center gap-3"><Phone size={18} /> {resume.personal_info.phone}</div>}
                            {resume.personal_info.email && <div className="flex items-center gap-3"><Mail size={18} /> <span className="break-all">{resume.personal_info.email}</span></div>}
                            {resume.personal_info.location && <div className="flex items-center gap-3"><MapPin size={18} /> {resume.personal_info.location}</div>}
                            {resume.personal_info.linkedin && <div className="flex items-center gap-3"><Linkedin size={18} /> <span className="break-all">{resume.personal_info.linkedin}</span></div>}
                            {resume.personal_info.portfolio && <div className="flex items-center gap-3"><Globe size={18} /> <span className="break-all">{resume.personal_info.portfolio}</span></div>}
                            {resume.personal_info.dateOfBirth && <div className="flex items-center gap-3"><Calendar size={18} /> {resume.personal_info.dateOfBirth}</div>}
                            {resume.personal_info.customFields?.map((f, i) => (
                                <div key={i} className="flex items-center gap-3"><div className="w-3.5 h-3.5" /> <span className="break-all"><span className="font-bold">{f.label}:</span> {f.value}</span></div>
                            ))}
                        </div>
                    </div>

                    {resume.skills && resume.skills.length > 0 && (
                        <div>
                            <h3 className="text-lg font-bold border-b border-white/30 pb-2 mb-4 uppercase">Skills</h3>
                            <ul className="space-y-2 text-base">
                                {expandStringItems(resume.skills).map((s, i) => <li key={i} className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-white rounded-full mt-2 flex-shrink-0"></span><span className="break-words">{s}</span></li>)}
                            </ul>
                        </div>
                    )}

                    {resume.languages && resume.languages.length > 0 && (
                        <div>
                            <h3 className="text-lg font-bold border-b border-white/30 pb-2 mb-4 uppercase">Languages</h3>
                            <ul className="space-y-2 text-base">
                                {expandLanguageItems(resume.languages).map((l, i) => <li key={i} className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-white rounded-full"></span>{l.name}</li>)}
                            </ul>
                        </div>
                    )}

                    {resume.interests && resume.interests.length > 0 && (
                        <div>
                            <h3 className="text-lg font-bold border-b border-white/30 pb-2 mb-4 uppercase">Interests</h3>
                            <ul className="space-y-2 text-base">
                                {expandStringItems(resume.interests).map((interest, i) => <li key={i} className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-white rounded-full mt-2 flex-shrink-0"></span><span className="break-words">{interest}</span></li>)}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            <div className="w-2/3 p-10">
                {resume.summary && (
                    <div className="mb-10 text-center">
                        <div className={`inline-block border-b-2 pb-1 mb-4 ${styles.borderColorClass}`} style={styles.borderColor || {}}>
                            <h3 className={`text-xl font-bold uppercase tracking-widest ${styles.headerClass}`} style={styles.headerColor || {}}>Profile</h3>
                        </div>
                        <p className="text-gray-700 leading-loose italic text-base">{resume.summary}</p>
                    </div>
                )}

                {resume.experience && resume.experience.length > 0 && (
                    <div className="mb-10 break-inside-avoid">
                        <h3 className={`text-xl font-bold uppercase tracking-widest mb-6 border-b border-gray-200 pb-2 ${styles.headerClass}`} style={styles.headerColor || {}}>Experience</h3>
                        <div className="space-y-8">
                            {resume.experience.map((exp) => (
                                <div key={exp.id} className="flex gap-4 break-inside-avoid">
                                    <div className="w-24 text-right flex-shrink-0 pt-1">
                                        <span className="text-base font-bold text-gray-500 block">{formatDate(exp.startDate)}</span>
                                        <span className="text-base text-gray-400 block">{exp.current ? 'Present' : formatDate(exp.endDate)}</span>
                                    </div>
                                    <div className="flex-1 pb-4 border-b border-gray-100 last:border-0">
                                        <h4 className="font-bold text-lg text-gray-900">{parseMarkdown(exp.company)}</h4>
                                        <p className={`text-base font-bold uppercase mb-2 ${styles.headerClass}`} style={styles.headerColor || {}}>{parseMarkdown(exp.position)}</p>
                                        {renderBulletedList(exp.description, "text-gray-700", "text-base")}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {resume.internships && resume.internships.length > 0 && (
                    <div className="mb-10 break-inside-avoid">
                        <h3 className={`text-xl font-bold uppercase tracking-widest mb-6 border-b border-gray-200 pb-2 ${styles.headerClass}`} style={styles.headerColor || {}}>Internships</h3>
                        <div className="space-y-8">
                            {resume.internships.map((intern) => (
                                <div key={intern.id} className="flex gap-4 break-inside-avoid">
                                    <div className="w-24 text-right flex-shrink-0 pt-1">
                                        <span className="text-base font-bold text-gray-500 block">{formatDate(intern.startDate)}</span>
                                        <span className="text-base text-gray-400 block">{intern.current ? 'Present' : formatDate(intern.endDate)}</span>
                                    </div>
                                    <div className="flex-1 pb-4 border-b border-gray-100 last:border-0">
                                        <h4 className="font-bold text-lg text-gray-900">{parseMarkdown(intern.company)}</h4>
                                        <p className={`text-base font-bold uppercase mb-2 ${styles.headerClass}`} style={styles.headerColor || {}}>{parseMarkdown(intern.position)}</p>
                                        {renderBulletedList(intern.description, "text-gray-700", "text-base")}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {resume.projects && resume.projects.length > 0 && (
                    <div className="mb-10 break-inside-avoid">
                        <h3 className={`text-xl font-bold uppercase tracking-widest mb-6 border-b border-gray-200 pb-2 ${styles.headerClass}`} style={styles.headerColor || {}}>Projects</h3>
                        <div className="space-y-6">
                            {resume.projects.map((project) => (
                                <div key={project.id} className="break-inside-avoid">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h4 className="font-bold text-lg text-gray-900">{project.name}</h4>
                                        <span className="text-base text-gray-500 italic">
                                            {project.startDate && project.endDate ? `${formatDate(project.startDate)} - ${formatDate(project.endDate)} ` : ''}
                                        </span>
                                    </div>
                                    {project.url && <a href={project.url} className={`text-base mb-1 block underline ${styles.headerClass}`} style={styles.headerColor || {}}>{project.url}</a>}
                                    {renderBulletedList(project.description, "text-gray-700", "text-base")}
                                    {project.technologies && project.technologies.length > 0 && (
                                        <p className="text-base text-gray-500 mt-1 italic">Stack: {project.technologies.join(', ')}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {resume.education && resume.education.length > 0 && (
                    <div className="mb-10">
                        <h3 className={`text-xl font-bold uppercase tracking-widest mb-6 border-b border-gray-200 pb-2 ${styles.headerClass}`} style={styles.headerColor || {}}>Education</h3>
                        <div className="space-y-6">
                            {resume.education.map((edu) => (
                                <div key={edu.id}>
                                    <h4 className="font-bold text-lg text-gray-900">{edu.institution}</h4>
                                    <div className="flex justify-between">
                                        <span className={`font-bold text-base ${styles.headerClass}`} style={styles.headerColor || {}}>{edu.degree} in {edu.field}</span>
                                        <span className="text-base text-gray-500">{formatDate(edu.startDate)} - {edu.current ? 'Present' : formatDate(edu.endDate)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {resume.certifications && resume.certifications.length > 0 && (
                    <div className="mb-10">
                        <h3 className={`text-xl font-bold uppercase tracking-widest mb-6 border-b border-gray-200 pb-2 ${styles.headerClass}`} style={styles.headerColor || {}}>Certifications</h3>
                        <div className="space-y-6">
                            {resume.certifications.map((cert) => (
                                <div key={cert.id}>
                                    <h4 className="font-bold text-lg text-gray-900">{cert.name}</h4>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 font-medium text-base">{cert.issuer}</span>
                                        <span className="text-base text-gray-500">{cert.date}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {renderAdditionalInfo(styles.headerColor, `text-xl font-bold uppercase tracking-widest mb-6 border-b border-gray-200 pb-2 ${styles.headerClass}`)}
            </div>
        </div >
    );

    const renderContent = () => {
        switch (resume.design) {
            case 'sidebar-left': return renderSidebarLeft();
            case 'professional-clean': return renderProfessionalClean();
            case 'sidebar-contact': return renderSidebarContact();
            case 'geometric-modern': return renderGeometricModern();
            case 'harvard-classic': return renderHarvardClassic();
            case 'modern-compact': return renderModernCompact();
            case 'corporate-bold': return renderCorporateBold();
            case 'timeline-sidebar': return renderTimelineSidebar();
            case 'elegant-maroon': return renderElegantMaroon();
            default: return renderProfessionalClean();
        }
    };

    return (
        <div id="resume-preview" className="mx-auto w-fit">
            {renderContent()}
        </div>
    );
}
