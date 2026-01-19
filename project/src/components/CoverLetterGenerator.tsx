import { useState } from 'react';
import { FileText, Sparkles, Copy, Download, RefreshCw, X, FileDown } from 'lucide-react';
import { Resume } from '../types';
import { generateCoverLetter } from '../lib/gemini';
import { exportCoverLetterToPDF } from '../lib/exportService';

interface CoverLetterGeneratorProps {
    resume: Resume;
    initialJD?: string;
    onJDChange?: (jd: string) => void;
    onClose?: () => void;
}

export default function CoverLetterGenerator({ resume, initialJD = '', onJDChange, onClose }: CoverLetterGeneratorProps) {
    const [jobDescription, setJobDescription] = useState(initialJD);
    const [generating, setGenerating] = useState(false);
    const [coverLetter, setCoverLetter] = useState('');

    const handleGenerate = async () => {
        if (!jobDescription.trim()) {
            alert('Please enter a job description first.');
            return;
        }

        console.log('[CoverLetterGenerator] Starting generation...');
        setGenerating(true);
        try {
            const content = await generateCoverLetter(resume, jobDescription);
            console.log('[CoverLetterGenerator] Generation finished. Length:', content.length);

            if (!content || content.startsWith('Error') || content.startsWith('API key missing')) {
                alert(content || 'Failed to generate cover letter. Please try again.');
            }

            setCoverLetter(content);
            if (onJDChange) onJDChange(jobDescription);
        } catch (error) {
            console.error('[CoverLetterGenerator] Error generating cover letter:', error);
            alert('An unexpected error occurred. Please try again.');
        } finally {
            setGenerating(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(coverLetter);
        alert('Cover letter copied to clipboard!');
    };

    const handleDownloadPDF = () => {
        const fileName = `Cover_Letter_${resume.personal_info.fullName.replace(/\s+/g, '_')}`;
        exportCoverLetterToPDF(coverLetter, fileName);
    };

    const handleDownloadTXT = () => {
        const element = document.createElement("a");
        const file = new Blob([coverLetter], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `Cover_Letter_${resume.personal_info.fullName.replace(/\s+/g, '_')}.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText className="text-blue-600" size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Cover Letter Generator</h3>
                        <p className="text-sm text-gray-600">Create a tailored cover letter in seconds</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Job Description
                        </label>
                        <textarea
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            placeholder="Paste the job description here to tailor your cover letter..."
                            className="w-full h-48 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                        />
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={!jobDescription.trim() || generating}
                        className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {generating ? (
                            <>
                                <RefreshCw size={20} className="animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles size={20} />
                                Generate Cover Letter
                            </>
                        )}
                    </button>
                </div>
            </div>

            {coverLetter && (
                <div className="animate-fade-in-up">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                            <h4 className="font-bold text-gray-800">Generated Cover Letter</h4>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleCopy}
                                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Copy to clipboard"
                                >
                                    <Copy size={18} />
                                </button>
                                <button
                                    onClick={handleDownloadTXT}
                                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Download as TXT"
                                >
                                    <Download size={18} />
                                </button>
                            </div>
                        </div>
                        <div className="p-6">
                            <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 leading-relaxed max-h-[500px] overflow-y-auto custom-scrollbar">
                                {coverLetter}
                            </pre>

                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <button
                                    onClick={handleDownloadPDF}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-black text-white rounded-xl hover:bg-gray-900 transition-all font-bold shadow-lg"
                                >
                                    <FileDown size={20} />
                                    Download Professional PDF
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
