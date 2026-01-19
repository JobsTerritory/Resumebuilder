
import React, { useState } from 'react';
import { Wand2, ChevronDown, ChevronUp, Loader2, HelpCircle, Briefcase } from 'lucide-react';
import { Resume } from '../types';
import { generateInterviewQuestions, InterviewQuestion } from '../lib/gemini';
import { saveInterviewPrep, getInterviewPrep } from '../lib/prepService';

interface InterviewPrepProps {
    resumes: Resume[];
}

const InterviewPrep: React.FC<InterviewPrepProps> = ({ resumes }) => {
    const [selectedResumeId, setSelectedResumeId] = useState<string>(resumes[0]?.id || '');
    const [loading, setLoading] = useState(false);
    const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
    const [openQuestionId, setOpenQuestionId] = useState<string | null>(null);

    const selectedResume = resumes.find(r => r.id === selectedResumeId);

    // Auto-detect role/industry
    const industry = selectedResume?.industry || 'General';
    // Use resume title or most recent job title as role
    const role = selectedResume?.experience?.[0]?.position || selectedResume?.title || 'Professional';

    // Update selected resume when resumes are loaded and none is selected
    React.useEffect(() => {
        if (!selectedResumeId && resumes.length > 0) {
            setSelectedResumeId(resumes[0].id || '');
        }
    }, [resumes, selectedResumeId]);

    React.useEffect(() => {
        const loadPrep = async () => {
            if (!selectedResumeId) return;
            // Clear previous questions while loading new ones to avoid confusion
            setQuestions([]);
            const prepData = await getInterviewPrep(selectedResumeId);
            if (prepData && prepData.questions) {
                setQuestions(prepData.questions);
            }
        };
        loadPrep();
    }, [selectedResumeId]);

    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!selectedResume) return;
        setLoading(true);
        setSaved(false);
        setError(null);
        setQuestions([]);

        // Prepare minimal context to save tokens/avoid noise
        const context = JSON.stringify({
            summary: selectedResume.summary,
            skills: selectedResume.skills,
            experience: selectedResume.experience?.slice(0, 3).map(e => ({
                role: e.position, company: e.company, desc: e.description
            })) || []
        });

        try {
            console.log('Generating questions for:', industry, role);
            const generated = await generateInterviewQuestions(industry, role, context);

            if (!generated || generated.length === 0) {
                throw new Error("AI generated no questions. Please try again.");
            }

            setQuestions(generated);

            // Save to backend
            console.log('Saving to backend for resume:', selectedResume.id);
            if (!selectedResume.id) throw new Error("Resume ID is missing");

            const saveResult = await saveInterviewPrep(
                selectedResume.id,
                industry,
                role,
                generated
            );

            if (!saveResult) {
                throw new Error("Failed to save to dashboard (Server Error)");
            }

            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error: any) {
            console.error("Failed to generate or save questions:", error);
            setError(error.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    if (resumes.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                <p>You need to create a resume first to generate interview questions.</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-brand-100 text-brand-600 rounded-xl">
                        <Briefcase size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Interview Preparation</h2>
                        <p className="text-gray-500">Generate AI-powered interview questions tailored to your profile.</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Resume</label>
                        <div className="relative">
                            <select
                                value={selectedResumeId}
                                onChange={(e) => setSelectedResumeId(e.target.value)}
                                className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 appearance-none bg-white"
                            >
                                {resumes.map(r => (
                                    <option key={r.id} value={r.id}>{r.title || 'Untitled Resume'}</option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                <ChevronDown size={16} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <h4 className="text-sm font-bold text-gray-900 mb-2">Target Profile</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="font-medium">Industry:</span> {industry}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="font-medium">Role:</span> {role}
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={loading || !selectedResume}
                    className="w-full py-4 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 className="animate-spin" />
                            Generating Questions...
                        </>
                    ) : (
                        <>
                            <Wand2 size={20} />
                            Generate Questions
                        </>
                    )}
                </button>
                {saved && (
                    <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-lg text-center font-medium border border-green-200 animate-fade-in">
                        Questions saved to dashboard!
                    </div>
                )}
                {error && (
                    <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-center font-medium border border-red-200 animate-fade-in">
                        Error: {error}
                    </div>
                )}
            </div>

            {questions.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 px-2">Recommended Questions</h3>
                    {questions.map((q, i) => (
                        <div key={q.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <button
                                onClick={() => setOpenQuestionId(openQuestionId === q.id ? null : q.id)}
                                className="w-full text-left p-6 flex items-start gap-4 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex-shrink-0 w-8 h-8 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center font-bold text-sm">
                                    {i + 1}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-medium text-gray-900 text-lg">{q.question}</h4>
                                </div>
                                <div className="text-gray-400 mt-1">
                                    {openQuestionId === q.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </div>
                            </button>

                            {openQuestionId === q.id && (
                                <div className="px-6 pb-6 pt-2 border-t border-gray-100 bg-gray-50/50">
                                    <div className="space-y-4">
                                        <div>
                                            <h5 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                                                <HelpCircle size={14} className="text-green-600" />
                                                Key Answer Points:
                                            </h5>
                                            <p className="text-gray-700 text-sm leading-relaxed">{q.answerKey}</p>
                                        </div>

                                        <div>
                                            <h5 className="text-sm font-bold text-gray-900 mb-2">Pro Tips:</h5>
                                            <ul className="space-y-1">
                                                {q.tips.map((tip, idx) => (
                                                    <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                                                        <span className="w-1.5 h-1.5 bg-brand-400 rounded-full mt-1.5 flex-shrink-0"></span>
                                                        {tip}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default InterviewPrep;
