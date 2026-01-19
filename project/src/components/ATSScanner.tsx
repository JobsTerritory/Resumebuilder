import React, { useState } from 'react';
import { Resume } from '../types';
import { analyzeATS, ATSAnalysisResult, applyImprovement, optimizeResume, OptimizedContent } from '../lib/gemini';
import ResumePreview from './ResumePreview';
import {
    Sparkles,
    Loader2,
    Briefcase,
    GraduationCap,
    CheckCircle,
    AlertTriangle,
    Wand2,
    Search,
    FileText,
    XCircle,
    Zap,
    Plus,
    CheckSquare,
    Square,
    Eye,
    ArrowRight
} from 'lucide-react';

interface ATSScannerProps {
    resume: Resume;
    onUpdate: (updated: Resume) => void;
}

const cleanSkill = (skill: string) => {
    return skill
        .replace(/^[•●■*-]\s?/, '') // Bullets
        .replace(/^\d+[.)]\s?/, '') // Numbering like 1. or 1)
        .replace(/["']/g, '') // Quotes
        .trim();
};

const ATSScanner: React.FC<ATSScannerProps> = ({ resume, onUpdate }) => {
    const [jobDescription, setJobDescription] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<ATSAnalysisResult | null>(null);
    const [fixModal, setFixModal] = useState<{
        isOpen: boolean;
        suggestion: any | null;
        isLoading: boolean;
        originalText: string;
        improvedText: string;
        targetId?: string; // For things like experience or projects
    }>({
        isOpen: false,
        suggestion: null,
        isLoading: false,
        originalText: '',
        improvedText: ''
    });

    const [comparisonModal, setComparisonModal] = useState<{
        isOpen: boolean;
        oldResume: Resume | null;
        newResume: Resume | null;
    }>({
        isOpen: false,
        oldResume: null,
        newResume: null
    });


    const handleInitiateFix = async (suggestion: any) => {
        let originalText = '';
        let targetId = undefined;

        // Determine content based on section
        let sectionToFix = suggestion.section?.toLowerCase();

        if (sectionToFix === 'summary') {
            originalText = resume.summary;
        } else if (sectionToFix === 'experience') {
            if (resume.experience.length > 0) {
                originalText = resume.experience[0].description;
                targetId = resume.experience[0].id;
            }
        } else if (sectionToFix === 'formatting') {
            // Smart target selection for formatting issues
            const text = suggestion.suggestion.toLowerCase();
            if (text.includes('summary') || text.includes('profile')) {
                originalText = resume.summary;
                sectionToFix = 'summary';
            } else {
                if (resume.experience.length > 0) {
                    originalText = resume.experience[0].description;
                    targetId = resume.experience[0].id;
                    sectionToFix = 'experience';
                }
            }
        }

        if (!originalText) {
            alert("Could not find relevant content to fix.");
            return;
        }

        setFixModal({
            isOpen: true,
            suggestion: { ...suggestion, section: sectionToFix }, // Use the re-mapped section
            isLoading: true,
            originalText,
            improvedText: '',
            targetId
        });

        // Trigger AI Generation
        try {
            const improved = await applyImprovement(originalText, suggestion.suggestion, jobDescription);
            setFixModal(prev => ({ ...prev, isLoading: false, improvedText: improved }));
        } catch (err) {
            console.error(err);
            setFixModal(prev => ({ ...prev, isLoading: false, improvedText: 'Error generating fix. Try again.' }));
        }
    };

    const handleApplyFix = () => {
        if (!fixModal.suggestion || !fixModal.improvedText) return;

        let updatedResume = { ...resume };

        if (fixModal.suggestion.section?.toLowerCase() === 'summary') {
            updatedResume.summary = fixModal.improvedText;
        } else if (fixModal.suggestion.section?.toLowerCase() === 'experience' && fixModal.targetId) {
            updatedResume.experience = updatedResume.experience.map(exp =>
                exp.id === fixModal.targetId ? { ...exp, description: fixModal.improvedText } : exp
            );
        }

        // Show comparison instead of direct update
        setComparisonModal({
            isOpen: true,
            oldResume: { ...resume },
            newResume: updatedResume
        });
        handleCloseModal();
    };

    const handleCloseModal = () => {
        setFixModal({ isOpen: false, suggestion: null, isLoading: false, originalText: '', improvedText: '' });
    };

    const handleAddSkill = (skill: string) => {
        const cleanedSkill = cleanSkill(skill);
        if (resume.skills.includes(cleanedSkill)) return;
        const newSkills = [...resume.skills, cleanedSkill];
        onUpdate({
            ...resume,
            skills: newSkills
        });

        // Optimistically update local result to remove the added skill from missing list
        if (result && result.skillsMatch) {
            setResult({
                ...result,
                skillsMatch: {
                    ...result.skillsMatch,
                    missingSkills: result.skillsMatch.missingSkills.filter(s => s !== skill),
                    matchedSkills: [...result.skillsMatch.matchedSkills, skill]
                }
            });
        }
    };

    const handleAddAllSkills = () => {
        if (!result || !result.skillsMatch || !result.skillsMatch.missingSkills.length) return;

        const missing = result.skillsMatch.missingSkills.map(cleanSkill);
        const mergedSkills = Array.from(new Set([...resume.skills, ...missing]));

        onUpdate({
            ...resume,
            skills: mergedSkills
        });

        // Optimistically update local result
        setResult({
            ...result,
            skillsMatch: {
                ...result.skillsMatch,
                missingSkills: [],
                matchedSkills: [...result.skillsMatch.matchedSkills, ...missing]
            }
        });
    };

    const handleAnalyze = async (resumeToAnalyze: Resume = resume) => {
        if (!jobDescription.trim()) return;

        // Defensive check: Ensure resume has at least some content
        const hasContent = resumeToAnalyze.summary ||
            (resumeToAnalyze.experience || []).length > 0 ||
            (resumeToAnalyze.education || []).length > 0 ||
            (resumeToAnalyze.skills || []).length > 0;

        if (!hasContent) {
            alert('Your resume appears to be empty. Please add some details (Summary, Experience, or Skills) before scanning.');
            return;
        }

        setIsAnalyzing(true);
        try {
            const data = await analyzeATS(resumeToAnalyze, jobDescription);
            setResult(data);
        } catch (error) {
            console.error(error);
            alert('Failed to analyze. Please check your API key and try again.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600 border-green-200 bg-green-50';
        if (score >= 60) return 'text-yellow-600 border-yellow-200 bg-yellow-50';
        return 'text-red-600 border-red-200 bg-red-50';
    };


    const [optimizationModal, setOptimizationModal] = useState<{
        isOpen: boolean;
        isLoading: boolean;
        data: OptimizedContent | null;
        targetSkills: string[]; // Skills we explicitly want to ensure are added
        selected: {
            summary: boolean;
            skills: boolean;
            experience: boolean;
        };
    }>({
        isOpen: false,
        isLoading: false,
        data: null,
        targetSkills: [],
        selected: { summary: true, skills: true, experience: true }
    });

    const handleAutoOptimize = async () => {
        const missingSkills = result?.skillsMatch?.missingSkills || [];
        const recommendedSkills = result?.suggestedKeywords?.niceToHave || [];
        const allTargetSkills = Array.from(new Set([...missingSkills, ...recommendedSkills]));

        setOptimizationModal(prev => ({
            ...prev,
            isOpen: true,
            isLoading: true,
            targetSkills: allTargetSkills // Store these for the robust merge later
        }));

        try {
            // Pass all target skills to the optimizer
            const optimized = await optimizeResume(resume, jobDescription, allTargetSkills);
            setOptimizationModal(prev => ({
                ...prev,
                isLoading: false,
                data: optimized
            }));
        } catch (error) {
            console.error(error);
            setOptimizationModal(prev => ({ ...prev, isLoading: false, isOpen: false }));
            alert("Failed to generate optimization. Please try again.");
        }
    };

    const applyOptimization = () => {
        if (!optimizationModal.data) return;

        let updatedResume = { ...resume };
        const { data, selected, targetSkills } = optimizationModal;

        if (selected.summary && data.summary) {
            updatedResume.summary = data.summary;
        }

        if (selected.skills && data.skills) {
            // ROBUST MERGE: Combine Existing + AI Suggested + Explicit Targets
            const mergedSkills = new Set([
                ...resume.skills,
                ...(data.skills || []).map(cleanSkill),
                ...(targetSkills || []).map(cleanSkill)
            ]);
            updatedResume.skills = Array.from(mergedSkills);
        }

        if (selected.experience && data.experience) {
            updatedResume.experience = updatedResume.experience.map(exp => {
                const update = data.experience?.find(e => e.id === exp.id);
                return update ? { ...exp, description: update.description } : exp;
            });
        }

        // Show comparison instead of direct update
        setComparisonModal({
            isOpen: true,
            oldResume: { ...resume },
            newResume: updatedResume
        });
        setOptimizationModal({ isOpen: false, isLoading: false, data: null, targetSkills: [], selected: { summary: true, skills: true, experience: true } });
    };

    const handleConfirmComparison = () => {
        if (!comparisonModal.newResume) return;
        onUpdate(comparisonModal.newResume);
        handleAnalyze(comparisonModal.newResume); // Automatic re-scan
        setComparisonModal({ isOpen: false, oldResume: null, newResume: null });
    };

    return (
        <div className="h-full flex flex-col">
            {/* ... code ... */}

            {/* Optimization Preview Modal */}
            {optimizationModal.isOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-violet-50 to-indigo-50">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <Sparkles className="text-violet-600" />
                                    Review Optimized Resume
                                </h3>
                                <p className="text-sm text-gray-500">Select the changes you want to apply</p>
                            </div>
                            <button onClick={() => setOptimizationModal(prev => ({ ...prev, isOpen: false }))} className="text-gray-400 hover:text-gray-600">
                                <XCircle size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto bg-gray-50/50 p-6 custom-scrollbar">
                            {optimizationModal.isLoading ? (
                                <div className="flex flex-col items-center justify-center h-64 gap-4">
                                    <Loader2 className="animate-spin text-violet-600" size={48} />
                                    <div className="text-center">
                                        <p className="text-lg font-bold text-gray-900">Optimizing your resume...</p>
                                        <p className="text-sm text-gray-500">Aligning keywords, rewriting summary, and enhancing experience.</p>
                                    </div>
                                </div>
                            ) : optimizationModal.data ? (
                                <div className="space-y-6">
                                    {/* Summary Section */}
                                    <div className={`bg-white rounded-xl border-2 transition-all overflow-hidden ${optimizationModal.selected.summary ? 'border-violet-500 shadow-md' : 'border-gray-200 opacity-70'} `}>
                                        <div
                                            className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between cursor-pointer"
                                            onClick={() => setOptimizationModal(prev => ({
                                                ...prev,
                                                selected: { ...prev.selected, summary: !prev.selected.summary }
                                            }))}
                                        >
                                            <div className="flex items-center gap-3">
                                                {optimizationModal.selected.summary ?
                                                    <CheckSquare className="text-violet-600" /> :
                                                    <Square className="text-gray-400" />
                                                }
                                                <span className="font-bold text-gray-800">Professional Summary</span>
                                            </div>
                                            <span className="text-xs text-gray-500 font-mono">REWRITE</span>
                                        </div>
                                        {optimizationModal.selected.summary && (
                                            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                <div className="p-3 bg-red-50 text-gray-600 rounded-lg border border-red-100">
                                                    <p className="text-xs font-bold text-red-500 mb-2 uppercase">Original</p>
                                                    {resume.summary}
                                                </div>
                                                <div className="p-3 bg-green-50 text-gray-800 rounded-lg border border-green-100">
                                                    <p className="text-xs font-bold text-green-600 mb-2 uppercase">Optimized</p>
                                                    {optimizationModal.data.summary}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Skills Section */}
                                    <div className={`bg-white rounded-xl border-2 transition-all overflow-hidden ${optimizationModal.selected.skills ? 'border-violet-500 shadow-md' : 'border-gray-200 opacity-70'} `}>
                                        <div
                                            className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between cursor-pointer"
                                            onClick={() => setOptimizationModal(prev => ({
                                                ...prev,
                                                selected: { ...prev.selected, skills: !prev.selected.skills }
                                            }))}
                                        >
                                            <div className="flex items-center gap-3">
                                                {optimizationModal.selected.skills ?
                                                    <CheckSquare className="text-violet-600" /> :
                                                    <Square className="text-gray-400" />
                                                }
                                                <span className="font-bold text-gray-800">Skills</span>
                                            </div>
                                            <span className="text-xs text-green-600 font-bold bg-green-100 px-2 py-0.5 rounded-full">
                                                +{(optimizationModal.data.skills || []).filter(s => !resume.skills.includes(s)).length} New
                                            </span>
                                        </div>
                                        {optimizationModal.selected.skills && (
                                            <div className="p-4">
                                                <div className="flex flex-wrap gap-2">
                                                    {(optimizationModal.data.skills || []).map((skill, i) => {
                                                        const isNew = !resume.skills.includes(skill);
                                                        return (
                                                            <span key={i} className={`px-2 py-1 rounded text-xs font-bold border ${isNew
                                                                ? 'bg-green-100 text-green-700 border-green-200 ring-2 ring-green-100'
                                                                : 'bg-gray-100 text-gray-500 border-gray-200'
                                                                } `}>
                                                                {skill} {isNew && '(New)'}
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Experience Section */}
                                    <div className={`bg-white rounded-xl border-2 transition-all overflow-hidden ${optimizationModal.selected.experience ? 'border-violet-500 shadow-md' : 'border-gray-200 opacity-70'} `}>
                                        <div
                                            className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between cursor-pointer"
                                            onClick={() => setOptimizationModal(prev => ({
                                                ...prev,
                                                selected: { ...prev.selected, experience: !prev.selected.experience }
                                            }))}
                                        >
                                            <div className="flex items-center gap-3">
                                                {optimizationModal.selected.experience ?
                                                    <CheckSquare className="text-violet-600" /> :
                                                    <Square className="text-gray-400" />
                                                }
                                                <span className="font-bold text-gray-800">Work Experience</span>
                                            </div>
                                            <span className="text-xs text-gray-500 font-mono">ENHANCED</span>
                                        </div>
                                        {optimizationModal.selected.experience && (
                                            <div className="p-4 space-y-4">
                                                {(optimizationModal.data.experience || []).map((exp, i) => {
                                                    const original = resume.experience.find(e => e.id === exp.id);
                                                    if (!original) return null;
                                                    return (
                                                        <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm border-b border-gray-100 pb-4 last:border-0">
                                                            <div>
                                                                <p className="font-bold text-gray-700 mb-1">{original.position} at {original.company}</p>
                                                                <div className="p-3 bg-red-50 text-gray-600 rounded-lg border border-red-100 text-xs">
                                                                    {original.description}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-gray-700 mb-1">Optimized Version</p>
                                                                <div className="p-3 bg-green-50 text-gray-800 rounded-lg border border-green-100 text-xs">
                                                                    {exp.description}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : null}
                        </div>

                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                            <button
                                onClick={() => setOptimizationModal(prev => ({ ...prev, isOpen: false }))}
                                className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={applyOptimization}
                                disabled={optimizationModal.isLoading || !optimizationModal.data}
                                className="px-8 py-3 bg-violet-600 text-white font-bold rounded-xl shadow-lg hover:bg-violet-700 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                            >
                                <CheckCircle size={20} />
                                Apply Selected Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-2">AI ATS Scanner</h2>
                <p className="text-sm text-gray-500">
                    Paste a job description below to see how well your resume matches.
                    Our AI will analyze keywords, skills, and formatting.
                </p>
            </div>

            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                {!result ? (
                    <div className="space-y-6">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Paste Custom Job Description
                                </label>
                                {jobDescription && (
                                    <button
                                        onClick={() => setJobDescription('')}
                                        className="text-xs text-red-500 font-bold hover:text-red-600"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                            <textarea
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                placeholder="Paste the full job description here..."
                                className="w-full h-64 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm"
                            />
                        </div>

                        <button
                            onClick={() => handleAnalyze()}
                            disabled={isAnalyzing || !jobDescription.trim()}
                            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${jobDescription.trim() && !isAnalyzing
                                ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 hover:shadow-xl'
                                : 'bg-gray-300 cursor-not-allowed'
                                } `}
                        >
                            {isAnalyzing ? (
                                <>
                                    <Loader2 className="animate-spin" /> Analyzing...
                                </>
                            ) : (
                                <>
                                    <Search size={20} /> Scan Resume
                                </>
                            )}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-8 animate-fade-in-up">
                        {/* Score Section */}
                        <div className="flex items-center justify-between bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
                            <div className="relative z-10">
                                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Overall Match</p>
                                <p className={`inline - flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold ${result.matchStatus === 'High' ? 'bg-green-100 text-green-700' :
                                    result.matchStatus === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-red-100 text-red-700'
                                    } `}>
                                    {result.matchStatus === 'High' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                                    {result.matchStatus} Match
                                </p>
                            </div>

                            <div className="flex flex-col items-center">
                                {/* Radial Progress Visual */}
                                <div className="relative w-32 h-32 flex items-center justify-center mb-6">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle
                                            cx="64"
                                            cy="64"
                                            r="56"
                                            stroke="currentColor"
                                            strokeWidth="12"
                                            fill="transparent"
                                            className="text-gray-100"
                                        />
                                        <circle
                                            cx="64"
                                            cy="64"
                                            r="56"
                                            stroke="currentColor"
                                            strokeWidth="12"
                                            fill="transparent"
                                            strokeDasharray={351.86}
                                            strokeDashoffset={351.86 - (351.86 * result.score) / 100}
                                            className={`${result.score >= 80 ? 'text-green-500' : result.score >= 60 ? 'text-yellow-500' : 'text-red-500'} transition-all duration-1000 ease - out`}
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                                        <span className={`text-3xl font-black ${getScoreColor(result.score).split(' ')[0]} `}>
                                            {result.score}
                                        </span>
                                        <span className="text-xs text-gray-400 font-bold uppercase">Score</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions Row */}
                        <div className="flex gap-4">
                            <button
                                onClick={handleAutoOptimize}
                                className="flex-1 py-4 bg-white border-2 border-indigo-600 text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
                            >
                                <Wand2 size={20} />
                                Auto-Optimize
                            </button>
                        </div>

                        {/* Breakdown Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-indigo-50 rounded-xl p-3 flex flex-col items-center justify-center text-center">
                                <Briefcase size={20} className="text-indigo-600 mb-2" />
                                <span className={`text-xl font-bold ${getScoreColor(result.experienceMatch.matchPercentage).split(' ')[0]} `}>
                                    {result.experienceMatch.matchPercentage}%
                                </span>
                                <span className="text-[10px] font-bold text-indigo-900 uppercase tracking-wide mt-1">Experience</span>
                            </div>
                            <div className="bg-emerald-50 rounded-xl p-3 flex flex-col items-center justify-center text-center">
                                <GraduationCap size={20} className="text-emerald-600 mb-2" />
                                <span className={`text-xl font-bold ${getScoreColor(result.educationMatch.matchPercentage).split(' ')[0]} `}>
                                    {result.educationMatch.matchPercentage}%
                                </span>
                                <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wide mt-1">Education</span>
                            </div>
                            <div className="bg-purple-50 rounded-xl p-3 flex flex-col items-center justify-center text-center">
                                <Zap size={20} className="text-purple-600 mb-2" />
                                <span className={`text-xl font-bold ${getScoreColor(result.skillsMatch.matchPercentage).split(' ')[0]} `}>
                                    {result.skillsMatch.matchPercentage}%
                                </span>
                                <span className="text-[10px] font-bold text-purple-900 uppercase tracking-wide mt-1">Skills</span>
                            </div>
                            <div className="bg-blue-50 rounded-xl p-3 flex flex-col items-center justify-center text-center">
                                <FileText size={20} className="text-blue-600 mb-2" />
                                <span className={`text-xl font-bold ${getScoreColor(result.formattingMatch?.matchPercentage || 0).split(' ')[0]} `}>
                                    {result.formattingMatch?.matchPercentage || 0}%
                                </span>
                                <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wide mt-1">Formatting</span>
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
                            <h3 className="text-blue-900 font-bold mb-2 flex items-center gap-2">
                                <Sparkles size={18} className="text-blue-600" /> AI Analysis
                            </h3>
                            <p className="text-blue-800 text-sm leading-relaxed">
                                {result.summary}
                            </p>
                        </div>

                        {/* Experience Analysis */}
                        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl p-6">
                            <h3 className="text-indigo-900 font-bold mb-4 flex items-center gap-2">
                                <Briefcase size={20} className="text-indigo-600" /> Experience Analysis
                            </h3>
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between bg-white/60 p-4 rounded-xl">
                                    <div>
                                        <p className="text-xs text-indigo-600 font-semibold uppercase tracking-wider">Experience Match</p>
                                        <div className="flex items-baseline gap-2 mt-1">
                                            <span className={`text-3xl font-black ${getScoreColor(result.experienceMatch.matchPercentage)} `}>
                                                {result.experienceMatch.matchPercentage}%
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex gap-4 text-sm">
                                            <div>
                                                <p className="text-gray-500 text-xs">You Have</p>
                                                <p className="font-bold text-gray-900">{result.experienceMatch.candidateYears} Years</p>
                                            </div>
                                            <div className="w-px bg-gray-300"></div>
                                            <div>
                                                <p className="text-gray-500 text-xs">JD Requires</p>
                                                <p className="font-bold text-gray-900">{result.experienceMatch.targetYears}+ Years</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white/60 p-4 rounded-xl space-y-4">
                                    <div className="flex flex-wrap gap-3">
                                        <div className="flex items-center gap-2 bg-white/40 px-3 py-2 rounded-lg border border-indigo-100">
                                            <span className="text-[10px] font-bold text-indigo-500 uppercase">Seniority</span>
                                            <span className={`text-xs font-black ${result.experienceMatch.seniorityAlignment === 'Perfect' ? 'text-green-600' :
                                                result.experienceMatch.seniorityAlignment === 'High' ? 'text-emerald-600' :
                                                    result.experienceMatch.seniorityAlignment === 'Medium' ? 'text-yellow-600' : 'text-red-600'
                                                } `}>
                                                {result.experienceMatch.seniorityAlignment}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 bg-white/40 px-3 py-2 rounded-lg border border-indigo-100">
                                            <span className="text-[10px] font-bold text-indigo-500 uppercase">Domain</span>
                                            <span className={`text-xs font-black ${result.experienceMatch.domainAlignment === 'Perfect' ? 'text-green-600' :
                                                result.experienceMatch.domainAlignment === 'High' ? 'text-emerald-600' :
                                                    result.experienceMatch.domainAlignment === 'Medium' ? 'text-yellow-600' : 'text-red-600'
                                                } `}>
                                                {result.experienceMatch.domainAlignment}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-indigo-900 leading-relaxed">
                                        <span className="font-bold">Analysis: </span>
                                        {result.experienceMatch.reasoning}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Education Analysis */}
                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-6">
                            <h3 className="text-emerald-900 font-bold mb-4 flex items-center gap-2">
                                <GraduationCap size={20} className="text-emerald-600" /> Education Analysis
                            </h3>
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between bg-white/60 p-4 rounded-xl">
                                    <div>
                                        <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wider">Education Match</p>
                                        <div className="flex items-baseline gap-2 mt-1">
                                            <span className={`text-3xl font-black ${getScoreColor(result.educationMatch.matchPercentage)} `}>
                                                {result.educationMatch.matchPercentage}%
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end gap-1">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${result.educationMatch.degreeMatch === 'Match' ? 'bg-green-100 text-green-700 border-green-200' :
                                            result.educationMatch.degreeMatch === 'Partial' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                                                'bg-red-100 text-red-700 border-red-200'
                                            } `}>
                                            Degree: {result.educationMatch.degreeMatch}
                                        </span>
                                        {result.educationMatch.cgpaMatch !== 'Not Specified' && (
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${result.educationMatch.cgpaMatch === 'Match' ? 'bg-green-100 text-green-700 border-green-200' :
                                                'bg-red-100 text-red-700 border-red-200'
                                                } `}>
                                                CGPA: {result.educationMatch.cgpaMatch}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="bg-white/60 p-4 rounded-xl">
                                    <p className="text-sm text-emerald-900 leading-relaxed">
                                        <span className="font-bold">Analysis: </span>
                                        {result.educationMatch.reasoning}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Skills Analysis */}
                        <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 border border-purple-100 rounded-2xl p-6">
                            <h3 className="text-purple-900 font-bold mb-4 flex items-center gap-2">
                                <Zap size={20} className="text-purple-600" /> Skills Analysis
                            </h3>
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between bg-white/60 p-4 rounded-xl">
                                    <div>
                                        <p className="text-xs text-purple-600 font-semibold uppercase tracking-wider">Skills Match</p>
                                        <div className="flex items-baseline gap-2 mt-1">
                                            <span className={`text-3xl font-black ${getScoreColor(result.skillsMatch.matchPercentage)} `}>
                                                {result.skillsMatch.matchPercentage}%
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {result.skillsMatch.matchedSkills.length > 0 && (
                                    <div className="bg-white/60 p-4 rounded-xl">
                                        <p className="text-xs text-purple-600 font-bold uppercase tracking-wider mb-2">Matched Key Skills</p>
                                        <div className="flex flex-wrap gap-2">
                                            {result.skillsMatch.matchedSkills.map((skill, i) => (
                                                <span key={i} className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium flex items-center gap-1.5">
                                                    <CheckCircle size={12} className="text-purple-500" />
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {result.skillsMatch.missingSkills && result.skillsMatch.missingSkills.length > 0 && (
                                    <div className="bg-red-50/50 p-4 rounded-xl border border-red-100">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-xs text-red-600 font-bold uppercase tracking-wider">Missing Critical Skills</p>
                                            <button
                                                onClick={handleAddAllSkills}
                                                className="text-[10px] font-bold text-red-600 bg-white px-2 py-1 rounded-full border border-red-200 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all shadow-sm"
                                            >
                                                ADD ALL TO RESUME
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {result.skillsMatch.missingSkills.map((skill, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => handleAddSkill(skill)}
                                                    className="group pl-2.5 pr-1.5 py-1.5 bg-white border border-red-200 text-red-700 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm hover:bg-red-50 hover:border-red-300 hover:shadow-md transition-all cursor-pointer"
                                                >
                                                    <XCircle size={14} className="text-red-400 group-hover:text-red-500" />
                                                    <span>{skill}</span>
                                                    <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors">
                                                        <Plus size={10} className="text-red-600" />
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="bg-white/60 p-4 rounded-xl">
                                    <p className="text-sm text-purple-900 leading-relaxed">
                                        <span className="font-bold">Analysis: </span>
                                        {result.skillsMatch.reasoning}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Content to Remove Section */}
                        {result.contentToRemove && result.contentToRemove.length > 0 && (
                            <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-2xl p-6">
                                <h3 className="text-red-900 font-bold mb-4 flex items-center gap-2">
                                    <XCircle size={20} className="text-red-600" />
                                    Consider Removing
                                </h3>
                                <div className="space-y-3">
                                    {result.contentToRemove.map((item, idx) => (
                                        <div key={idx} className="bg-white p-4 rounded-xl border border-red-100 shadow-sm">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-xs font-bold text-red-600 uppercase bg-red-100 px-2 py-0.5 rounded">{item.section}</span>
                                                        <span className={`text-xs px-2 py-0.5 rounded font-semibold ${item.priority === 'High' ? 'bg-red-100 text-red-700' :
                                                            item.priority === 'Medium' ? 'bg-orange-100 text-orange-700' :
                                                                'bg-yellow-100 text-yellow-700'
                                                            } `}>{item.priority} Priority</span>
                                                    </div>
                                                    <p className="text-sm font-semibold text-gray-900 mb-1">{item.item}</p>
                                                    <p className="text-sm text-gray-600">{item.reason}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Content to Add Section */}
                        {result.contentToAdd && result.contentToAdd.length > 0 && (
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
                                <h3 className="text-green-900 font-bold mb-4 flex items-center gap-2">
                                    <Plus size={20} className="text-green-600" />
                                    Recommended Additions
                                </h3>
                                <div className="space-y-3">
                                    {result.contentToAdd.map((item, idx) => (
                                        <div key={idx} className="bg-white p-4 rounded-xl border border-green-100 shadow-sm">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-xs font-bold text-green-600 uppercase bg-green-100 px-2 py-0.5 rounded">{item.section}</span>
                                                        <span className={`text-xs px-2 py-0.5 rounded font-semibold ${item.priority === 'High' ? 'bg-green-100 text-green-700' :
                                                            item.priority === 'Medium' ? 'bg-blue-100 text-blue-700' :
                                                                'bg-gray-100 text-gray-700'
                                                            } `}>{item.priority} Priority</span>
                                                    </div>
                                                    <p className="text-sm font-semibold text-gray-900 mb-1">{item.suggestion}</p>
                                                    <p className="text-sm text-gray-600 mb-2">{item.reason}</p>
                                                    {item.examples && item.examples.length > 0 && (
                                                        <div className="mt-3 pl-3 border-l-2 border-green-200 bg-green-50/50 py-2 rounded-r">
                                                            <p className="text-xs font-semibold text-green-700 mb-1.5">Examples:</p>
                                                            {item.examples.map((ex, i) => (
                                                                <p key={i} className="text-xs text-gray-700 italic mb-1">• {ex}</p>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Formatting Analysis */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6">
                            <h3 className="text-blue-900 font-bold mb-4 flex items-center gap-2">
                                <FileText size={20} className="text-blue-600" /> Formatting & Structural Analysis
                            </h3>
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between bg-white/60 p-4 rounded-xl">
                                    <div>
                                        <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider">Formatting Match</p>
                                        <div className="flex items-baseline gap-2 mt-1">
                                            <span className={`text-3xl font-black ${getScoreColor(result.formattingMatch?.matchPercentage || 0)} `}>
                                                {result.formattingMatch?.matchPercentage || 0}%
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {result.formattingIssues && result.formattingIssues.length > 0 ? (
                                    <div className="bg-white/60 p-4 rounded-xl space-y-3">
                                        <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-2">Structural Issues</p>
                                        {result.formattingIssues.map((issue, i) => (
                                            <div key={i} className="flex items-start justify-between gap-3 text-sm text-gray-700 bg-white/40 p-2 rounded-lg border border-transparent hover:border-blue-100 transition-colors group">
                                                <div className="flex gap-3">
                                                    <div className="mt-2 flex-shrink-0">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                                    </div>
                                                    <p className="leading-relaxed">{issue}</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleInitiateFix({
                                                        section: 'formatting',
                                                        suggestion: issue,
                                                        priority: 'Medium'
                                                    })}
                                                    className="opacity-0 group-hover:opacity-100 p-1.5 text-blue-600 hover:bg-blue-100 rounded-md transition-all flex items-center gap-1 text-[10px] font-bold whitespace-nowrap"
                                                >
                                                    <Wand2 size={12} />
                                                    FIX
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3 text-green-600 bg-green-50/50 p-4 rounded-xl border border-green-100">
                                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                            <CheckCircle size={18} />
                                        </div>
                                        <div className="text-sm font-medium">
                                            No formatting issues detected. Your resume structure is professional.
                                        </div>
                                    </div>
                                )}

                                <div className="bg-white/60 p-4 rounded-xl">
                                    <p className="text-sm text-blue-900 leading-relaxed">
                                        <span className="font-bold">Analysis: </span>
                                        {result.formattingMatch?.reasoning || "Formatting scan complete."}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Extra Suggestions */}
                        {result?.suggestedKeywords?.niceToHave && result.suggestedKeywords.niceToHave.length > 0 && (
                            <div>
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Sparkles size={20} className="text-yellow-500" />
                                    Recommended Additions
                                </h3>
                                <div className="bg-white border border-gray-200 rounded-xl p-4">
                                    <p className="text-xs text-gray-500 mb-3">Consider adding these related keywords to boost your match:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {result.suggestedKeywords.niceToHave.map((kw, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleAddSkill(kw)}
                                                className="group pl-3 pr-1.5 py-1.5 bg-gray-50 text-gray-700 rounded-lg text-sm border border-gray-200 hover:bg-gray-100 hover:text-gray-900 hover:border-gray-300 transition-all flex items-center gap-2"
                                            >
                                                <span>{kw}</span>
                                                <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center group-hover:bg-gray-300 transition-colors">
                                                    <Plus size={10} className="text-gray-600" />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Suggestions */}
                        <div>
                            <h3 className="font-bold text-gray-900 mb-4">Improvement Plan</h3>
                            <div className="space-y-3">
                                {(result.improvementPlan || []).map((suggestion, idx) => (
                                    <div key={idx} className="flex gap-4 p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-violet-200 transition-colors">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink - 0 ${suggestion.priority === 'High' ? 'bg-red-50 text-red-600' : 'bg-violet-50 text-violet-600'
                                            } `}>
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{suggestion.section || 'General'}</span>
                                                {suggestion.priority === 'High' && (
                                                    <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">HIGH PRIORITY</span>
                                                )}
                                            </div>
                                            <p className="text-gray-800 text-sm mb-3">{suggestion.suggestion}</p>

                                            {['summary', 'experience'].includes(suggestion.section?.toLowerCase()) && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleInitiateFix(suggestion)}
                                                    className="text-sm font-semibold text-violet-600 hover:text-violet-700 flex items-center gap-1.5 transition-colors group"
                                                >
                                                    <Wand2 size={14} className="group-hover:animate-pulse" />
                                                    Preview & Apply Fix
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {/* Fallback for old style if needed */}
                                {(!result.improvementPlan || result.improvementPlan.length === 0) && result.contentSuggestions?.map((suggestion, idx) => (
                                    <div key={idx} className="flex gap-4 p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-bold flex-shrink-0">
                                            {idx + 1}
                                        </div>
                                        <p className="text-gray-700 text-sm mt-1">{suggestion}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => setResult(null)}
                            className="w-full py-3 bg-gray-50 text-gray-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
                        >
                            Scan Another Job Description
                        </button>
                    </div>
                )}
            </div>

            {/* Fix Preview Modal */}
            {
                fixModal.isOpen && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <Wand2 className="text-violet-600" />
                                    Apply AI Fix
                                </h3>
                                <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                                    <XCircle size={24} />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                                <div className="mb-6 bg-violet-50 p-4 rounded-lg">
                                    <p className="text-sm font-medium text-violet-900 mb-1">Improvement Goal:</p>
                                    <p className="text-sm text-violet-700">{fixModal.suggestion?.suggestion}</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Original Content</h4>
                                        <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-sm text-gray-600 h-64 overflow-y-auto">
                                            {fixModal.originalText}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Improved Version</h4>
                                            {fixModal.isLoading && <span className="text-xs text-violet-600 animate-pulse">Generating...</span>}
                                        </div>
                                        <div className="bg-green-50 p-4 rounded-xl border border-green-100 text-sm text-gray-800 h-64 overflow-y-auto relative">
                                            {fixModal.isLoading ? (
                                                <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm">
                                                    <Loader2 className="animate-spin text-violet-600" size={32} />
                                                </div>
                                            ) : (
                                                fixModal.improvedText
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
                                <button
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleApplyFix}
                                    disabled={fixModal.isLoading || !fixModal.improvedText}
                                    className="px-6 py-2 bg-violet-600 text-white font-bold rounded-lg shadow-md hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
                                >
                                    {fixModal.isLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                                    Apply Fix
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
            {/* Fix Preview Modal logic ... */}

            {/* Live Comparison Modal */}
            {
                comparisonModal.isOpen && comparisonModal.oldResume && comparisonModal.newResume && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[60] flex items-center justify-center p-4 lg:p-10 animate-fade-in">
                        <div className="bg-gray-100 rounded-3xl w-full max-w-7xl h-full flex flex-col shadow-2xl overflow-hidden border border-white/20">
                            <div className="p-6 bg-white border-b border-gray-200 flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                                        <div className="p-2 bg-indigo-100 rounded-xl">
                                            <Eye className="text-indigo-600" size={24} />
                                        </div>
                                        Live Optimization Preview
                                    </h3>
                                    <p className="text-sm text-gray-500 font-medium ml-12">Review how the AI-driven changes look in your actual resume layout.</p>
                                </div>
                                <button
                                    onClick={() => setComparisonModal({ isOpen: false, oldResume: null, newResume: null })}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors transition-transform hover:scale-110"
                                >
                                    <XCircle size={32} className="text-gray-400" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-2 bg-gray-200">
                                {/* Left Side: Before */}
                                <div className="h-full flex flex-col items-center p-6 lg:p-8 overflow-y-auto custom-scrollbar bg-gray-50/50 border-r border-gray-200">
                                    <div className="mb-8 flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200 sticky top-0 z-20">
                                        <div className="w-2 h-2 rounded-full bg-gray-400" />
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Original Resume</span>
                                    </div>
                                    <div className="w-[850px] shrink-0 bg-white shadow-2xl origin-top transition-transform duration-500 hover:scale-[0.55] lg:scale-[0.5] xl:scale-[0.6] mb-20 aspect-[1/1.414]">
                                        <ResumePreview resume={comparisonModal.oldResume} />
                                    </div>
                                </div>

                                {/* Right Side: After */}
                                <div className="h-full flex flex-col items-center p-6 lg:p-8 overflow-y-auto custom-scrollbar bg-white">
                                    <div className="mb-8 flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full shadow-sm border border-emerald-100 sticky top-0 z-20">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest leading-none">Optimized Version</span>
                                    </div>
                                    <div className="w-[850px] shrink-0 bg-white shadow-2xl origin-top transition-transform duration-500 hover:scale-[0.55] lg:scale-[0.5] xl:scale-[0.6] mb-20 relative ring-8 ring-emerald-50/50 rounded-sm aspect-[1/1.414]">
                                        <div className="absolute -top-4 -right-4 bg-emerald-500 text-white p-3 rounded-full shadow-lg z-30 animate-bounce">
                                            <Sparkles size={24} />
                                        </div>
                                        <ResumePreview resume={comparisonModal.newResume} />
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 bg-white border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="flex -space-x-2">
                                        <div className="w-10 h-10 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-indigo-600 shadow-sm">
                                            <Zap size={18} />
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center text-emerald-600 shadow-sm">
                                            <CheckCircle size={18} />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 leading-tight">Ready to upgrade?</p>
                                        <p className="text-xs text-gray-500">Applying these changes will automatically re-scan your ATS score.</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <button
                                        onClick={() => setComparisonModal({ isOpen: false, oldResume: null, newResume: null })}
                                        className="px-8 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-2xl transition-all flex-1 sm:flex-none"
                                    >
                                        Go Back
                                    </button>
                                    <button
                                        onClick={handleConfirmComparison}
                                        className="px-12 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-200 hover:from-indigo-700 hover:to-violet-700 hover:-translate-y-1 transition-all flex items-center gap-3 uppercase tracking-tight flex-1 sm:flex-none"
                                    >
                                        Accept All Changes <ArrowRight size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default ATSScanner;
