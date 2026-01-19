import React, { useState } from 'react';
import { X, Briefcase, FileText, ArrowRight, ChevronRight, Search, Sparkles, Loader2, User } from 'lucide-react';
import { industries } from '../lib/industries';
import { Resume } from '../types';
import { initialResumeState, blankResumeState } from '../lib/initialState';
import ResumeUpload from './ResumeUpload';
import { generateFullResume } from '../lib/gemini';

interface ResumeCreationWizardProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: (initialData?: Resume) => void;
}

type Step = 'method' | 'industry' | 'upload' | 'ai-form' | 'ai-loading';

const ResumeCreationWizard: React.FC<ResumeCreationWizardProps> = ({ isOpen, onClose, onComplete }) => {
    const [step, setStep] = useState<Step>('method');
    const [searchQuery, setSearchQuery] = useState('');
    const [aiForm, setAiForm] = useState({
        name: '',
        role: '',
        industry: 'Technology',
        seniority: 'Mid-Level'
    });
    const [isGenerating, setIsGenerating] = useState(false);

    const filteredIndustries = industries.filter(industry =>
        industry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        industry.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!isOpen) return null;

    const handleBack = () => {
        if (step === 'industry' || step === 'ai-form' || step === 'upload') setStep('method');
    };

    const handleStartFromScratch = () => {
        onComplete(blankResumeState);
        onClose();
    };

    const handleAIGenerate = async () => {
        setIsGenerating(true);
        setStep('ai-loading');

        try {
            const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
            const name = aiForm.name || user.fullName || 'User';

            const generated = await generateFullResume({
                name,
                role: aiForm.role,
                industry: aiForm.industry,
                seniority: aiForm.seniority
            });

            if (generated) {
                onComplete(generated);
                onClose();
            } else {
                alert("Failed to generate resume. Please try again.");
                setStep('ai-form');
            }
        } catch (err) {
            console.error(err);
            alert("An error occurred during generation.");
            setStep('ai-form');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleIndustrySelect = (industryId: string) => {
        const industry = industries.find(ind => ind.id === industryId);
        if (industry) {
            onComplete(industry.initialState);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                    <div>
                        {(step !== 'method' && step !== 'ai-loading') && (
                            <button
                                onClick={handleBack}
                                className="text-gray-500 hover:text-gray-700 text-sm font-medium mb-1 flex items-center gap-1"
                            >
                                ← Back
                            </button>
                        )}
                        <h2 className="text-2xl font-bold text-gray-900">
                            {step === 'method' ? 'How would you like to start?' :
                                step === 'industry' ? 'Select your Industry' :
                                    step === 'ai-form' ? 'AI Resume Generator' :
                                        step === 'ai-loading' ? 'Generating your Resume' :
                                            'Resume Setup'}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto">
                    {step === 'method' ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <button
                                onClick={() => setStep('ai-form')}
                                className="flex flex-col items-center text-center p-8 rounded-2xl border-2 border-brand-200 bg-brand-50/30 hover:border-brand-500 hover:bg-brand-50 transition-all group"
                            >
                                <div className="w-16 h-16 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
                                    <Sparkles size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Generate with AI</h3>
                                <p className="text-gray-500 mb-6 text-sm">
                                    Describe your target role and let our AI write a tailored, professional resume for you in seconds.
                                </p>
                                <span className="text-brand-600 font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
                                    Start Generating <ArrowRight size={20} />
                                </span>
                            </button>

                            <button
                                onClick={() => setStep('industry')}
                                className="flex flex-col items-center text-center p-8 rounded-2xl border-2 border-gray-200 hover:border-brand-500 hover:bg-brand-50 transition-all group"
                            >
                                <div className="w-16 h-16 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Briefcase size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Industry Example</h3>
                                <p className="text-gray-500 mb-6 text-sm">
                                    Choose from pre-filled templates tailored to your specific role and industry. Best for a quick start.
                                </p>
                                <span className="text-brand-600 font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
                                    Browse Industries <ArrowRight size={20} />
                                </span>
                            </button>

                            <button
                                onClick={() => { onComplete(initialResumeState); onClose(); }}
                                className="flex flex-col items-center text-center p-8 rounded-2xl border-2 border-brand-200 bg-brand-50/10 hover:border-brand-500 hover:bg-brand-50 transition-all group"
                            >
                                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
                                    <User size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Sample Resume</h3>
                                <p className="text-gray-500 mb-6 text-sm">
                                    Start with a pre-filled professional example (John Doe). Perfect for exploring all features quickly.
                                </p>
                                <span className="text-blue-600 font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
                                    Load Sample <ArrowRight size={20} />
                                </span>
                            </button>

                            <button
                                onClick={handleStartFromScratch}
                                className="flex flex-col items-center text-center p-8 rounded-2xl border-2 border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-all group"
                            >
                                <div className="w-16 h-16 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <FileText size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">From Scratch</h3>
                                <p className="text-gray-500 mb-6 text-sm">
                                    Begin with a blank canvas and build your resume section by section. You have full control.
                                </p>
                                <span className="text-gray-600 font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
                                    Create Blank Resume <ChevronRight size={20} />
                                </span>
                            </button>

                            <button
                                onClick={() => setStep('upload')}
                                className="flex flex-col items-center text-center p-8 rounded-2xl border-2 border-gray-200 hover:border-brand-500 hover:bg-brand-50 transition-all group md:col-span-1"
                            >
                                <div className="w-16 h-16 bg-violet-100 text-violet-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Search size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Import Resume</h3>
                                <p className="text-gray-500 mb-6 text-sm">
                                    Upload your current PDF or Word resume. Our AI will automatically extract your information.
                                </p>
                                <span className="text-violet-600 font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
                                    Upload & Analyze <ArrowRight size={20} />
                                </span>
                            </button>
                        </div>
                    ) : step === 'industry' ? (
                        <div className="flex flex-col h-full">
                            <div className="mb-6 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search for your industry (e.g. Technology, Nurse, Sales)"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    autoFocus
                                />
                            </div>

                            {filteredIndustries.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
                                    {filteredIndustries.map((industry) => (
                                        <button
                                            key={industry.id}
                                            onClick={() => handleIndustrySelect(industry.id)}
                                            className="flex items-start gap-4 p-6 rounded-xl border border-gray-200 hover:border-brand-500 hover:shadow-lg transition-all text-left bg-white group hover:-translate-y-1"
                                        >
                                            <div className="p-3 bg-brand-50 text-brand-600 rounded-lg group-hover:bg-brand-600 group-hover:text-white transition-colors">
                                                <industry.icon size={24} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 mb-1">{industry.name}</h3>
                                                <p className="text-sm text-gray-500 line-clamp-2">{industry.description}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Search size={24} className="text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-1">No industries found</h3>
                                    <p>Try searching for a different keyword or role.</p>
                                </div>
                            )}
                        </div>
                    ) : step === 'ai-form' ? (
                        <div className="max-w-xl mx-auto space-y-6 py-4">
                            <div className="bg-brand-50 border border-brand-100 p-4 rounded-xl flex gap-3">
                                <Sparkles className="text-brand-600 shrink-0" size={20} />
                                <p className="text-sm text-brand-800">
                                    Our AI will use your profile name and generate realistic examples for your experience and education based on the role you provide.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter your full name"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all"
                                        value={aiForm.name}
                                        onChange={(e) => setAiForm({ ...aiForm, name: e.target.value })}
                                        autoFocus
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        What role are you targeting?
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Senior Software Engineer, Marketing Manager"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all"
                                        value={aiForm.role}
                                        onChange={(e) => setAiForm({ ...aiForm, role: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            Industry
                                        </label>
                                        <select
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all"
                                            value={aiForm.industry}
                                            onChange={(e) => setAiForm({ ...aiForm, industry: e.target.value })}
                                        >
                                            <option>Technology</option>
                                            <option>Healthcare</option>
                                            <option>Business/Finance</option>
                                            <option>Education</option>
                                            <option>Legal</option>
                                            <option>Creative/Art</option>
                                            <option>Manufacturing</option>
                                            <option>Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            Experience Level
                                        </label>
                                        <select
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all"
                                            value={aiForm.seniority}
                                            onChange={(e) => setAiForm({ ...aiForm, seniority: e.target.value })}
                                        >
                                            <option>Entry-Level</option>
                                            <option>Mid-Level</option>
                                            <option>Senior-Level</option>
                                            <option>Executive</option>
                                        </select>
                                    </div>
                                </div>

                                <button
                                    onClick={handleAIGenerate}
                                    disabled={!aiForm.role}
                                    className="w-full py-4 bg-brand-600 text-white rounded-xl font-bold shadow-lg hover:bg-brand-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <Sparkles size={20} />
                                    Generate My Resume
                                </button>
                                <button
                                    onClick={() => setStep('method')}
                                    className="w-full py-3 text-gray-500 font-medium hover:text-gray-700 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : step === 'ai-loading' ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-6">
                            <div className="relative">
                                <div className="w-24 h-24 border-4 border-brand-100 border-t-brand-600 rounded-full animate-spin"></div>
                                <Sparkles className="absolute inset-0 m-auto text-brand-600 animate-pulse" size={40} />
                            </div>
                            <div className="text-center">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Crafting your professional story...</h3>
                                <p className="text-gray-500">Our AI is generating tailored bullet points and summaries.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full">
                            <ResumeUpload
                                onUpload={(data) => {
                                    onComplete(data as Resume);
                                    onClose();
                                }}
                                onClose={() => setStep('method')}
                            />
                        </div>
                    )}
                </div>

                {/* Footer */}
                {step === 'method' && (
                    <div className="p-6 bg-gray-50 border-t border-gray-100 text-center">
                        <p className="text-gray-500 text-sm">
                            Not sure? <button onClick={handleStartFromScratch} className="text-brand-600 font-semibold hover:underline">Start with a blank document</button>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResumeCreationWizard;
