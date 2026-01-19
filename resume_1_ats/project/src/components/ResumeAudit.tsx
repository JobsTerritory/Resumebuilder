import React, { useState, useEffect } from 'react';
import {
    Activity,
    ShieldCheck,
    ChevronRight,
    Loader2,
    Wand2,
    Sparkles,
    ArrowLeft,
    ArrowRight,
    Info,
    Edit2,
    Trash2,
    Plus,
    X,
    Check,
    Save,
    Search,
    Copy,
    BookOpen,
    Eye,
    XCircle,
    Zap,
    CheckCircle
} from 'lucide-react';
import { Resume } from '../types';
import { auditResume, ResumeAuditResult, ResumeAuditSection, applyImprovement, getSectionExamples } from '../lib/gemini';
import ResumePreview from './ResumePreview';

interface ResumeAuditProps {
    resume: Resume;
    setResume: (resume: Resume) => void;
    onBack?: () => void;
}

const ResumeAudit: React.FC<ResumeAuditProps> = ({ resume, setResume, onBack }) => {
    const [auditResult, setAuditResult] = useState<ResumeAuditResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [improvingItem, setImprovingItem] = useState<string | null>(null);
    const [activeSectionIdx, setActiveSectionIdx] = useState(0);
    const [editingItem, setEditingItem] = useState<{ section: string, index: number, field: string } | null>(null);
    const [improvementPreview, setImprovementPreview] = useState<{ section: string, index: number, field: string, original: string, improved: string } | null>(null);
    const [comparisonModal, setComparisonModal] = useState<{
        isOpen: boolean;
        oldResume: Resume | null;
        newResume: Resume | null;
    }>({
        isOpen: false,
        oldResume: null,
        newResume: null
    });

    // Example Search State
    const [showExampleSearch, setShowExampleSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [exampleResults, setExampleResults] = useState<string[]>([]);
    const [isSearchingExamples, setIsSearchingExamples] = useState(false);

    const runAudit = async () => {
        setIsLoading(true);
        try {
            const result = await auditResume(resume);
            if (result) {
                setAuditResult(result);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!auditResult && !isLoading) {
            runAudit();
        }
    }, [resume.id]);



    const handleDeleteItem = (section: string, index: number) => {
        const updatedResume = { ...resume };
        if (Array.isArray((updatedResume as any)[section])) {
            (updatedResume as any)[section] = (updatedResume as any)[section].filter((_: any, i: number) => i !== index);
            setResume(updatedResume);
        }
    };

    const handleSaveItem = (section: string, index: number, field: string, value: string) => {
        const updatedResume = { ...resume };
        if (Array.isArray((updatedResume as any)[section])) {
            const currentItem = (updatedResume as any)[section][index];
            if (typeof currentItem === 'string') {
                (updatedResume as any)[section][index] = value;
            } else {
                (updatedResume as any)[section][index] = {
                    ...currentItem,
                    [field]: value
                };
            }
            setResume(updatedResume);
            setEditingItem(null);
        } else {
            // Handle single string properties like 'summary'
            (updatedResume as any)[section] = value;
            setResume(updatedResume);
        }
    };

    const handleImproveItem = async (section: string, index: number, currentText: string) => {
        if (!currentText) return;

        // Find existing tip or use generic one
        const instruction = "Rewrite this to be more professional, action-oriented, and include metrics if implied. Remove passive language.";
        const itemKey = `${section}-${index}`;

        // Show loading state for specific item
        setImprovingItem(itemKey);
        try {
            const improved = await applyImprovement(currentText, instruction, "");
            if (improved) {
                setImprovementPreview({
                    section,
                    index,
                    field: 'description',
                    original: currentText,
                    improved
                });
            }
        } catch (error) {
            console.error("Improvement failed", error);
        } finally {
            setImprovingItem(null);
        }
    };

    const confirmImprovement = () => {
        if (improvementPreview) {
            const { section, index, field, improved } = improvementPreview;
            const updatedResume = { ...resume };

            if (Array.isArray((updatedResume as any)[section])) {
                const currentItem = (updatedResume as any)[section][index];
                if (typeof currentItem === 'string') {
                    (updatedResume as any)[section][index] = improved;
                } else {
                    (updatedResume as any)[section][index] = {
                        ...currentItem,
                        [field]: improved
                    };
                }
            } else {
                (updatedResume as any)[section] = improved;
            }

            setComparisonModal({
                isOpen: true,
                oldResume: { ...resume },
                newResume: updatedResume
            });
            setImprovementPreview(null);
        }
    };

    const handleConfirmComparison = () => {
        if (comparisonModal.newResume) {
            setResume(comparisonModal.newResume);
            setComparisonModal({ isOpen: false, oldResume: null, newResume: null });
        }
    };

    const handleAddItem = () => {
        if (!currentSection) return;
        const updatedResume = { ...resume };

        if (currentSection.sectionId === 'skills' || currentSection.sectionId === 'interests') {
            if (!Array.isArray((updatedResume as any)[currentSection.sectionId])) {
                (updatedResume as any)[currentSection.sectionId] = [];
            }
            (updatedResume as any)[currentSection.sectionId].push("New Item");
        } else if (Array.isArray((updatedResume as any)[currentSection.sectionId])) {
            const newItem = currentSection.sectionId === 'experience' ? {
                id: Math.random().toString(36).substr(2, 9),
                company: 'Company Name',
                position: 'Position Title',
                startDate: '',
                endDate: '',
                current: false,
                description: 'Description of your role and achievements.',
                location: '',
                technologies: []
            } : {
                id: Math.random().toString(36).substr(2, 9),
                name: 'Project or Degree Name',
                description: 'Description...',
                startDate: '',
                endDate: ''
            };
            (updatedResume as any)[currentSection.sectionId].push(newItem);
        }
        setResume(updatedResume);
    };

    const handleSearchExamples = async () => {
        if (!searchQuery.trim() || !currentSection) return;

        setIsSearchingExamples(true);
        try {
            const examples = await getSectionExamples(currentSection.title, searchQuery);
            setExampleResults(examples);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSearchingExamples(false);
        }
    };

    const handleUseExample = (text: string) => {
        // If editing, append or replace? Let's just copy to clipboard or prompt. 
        // Better: Append to the current editing field if open, or add new item if not.

        if (editingItem && currentSection) {
            // If editing, replace/append to the textarea
            const textarea = document.getElementById(`edit-item-${editingItem.section}-${editingItem.index}`) as HTMLTextAreaElement;
            if (textarea) {
                textarea.value = text;
                // Trigger visual update if needed, but value is uncontrolled-ish
            }
        } else if (currentSection) {
            // Add as new item
            const updatedResume = { ...resume };
            const newItem = currentSection.sectionId === 'experience' ? {
                id: Math.random().toString(36).substr(2, 9),
                company: 'Example Company',
                position: searchQuery || 'Position',
                startDate: '2023',
                endDate: 'Present',
                current: true,
                description: text,
                location: 'Remote',
                technologies: []
            } : currentSection.sectionId === 'summary' ? text : {
                // Generic fallback for list items
                id: Math.random().toString(36).substr(2, 9),
                name: searchQuery || 'Project',
                description: text,
                startDate: '2023',
                endDate: '2024'
            };

            if (currentSection.sectionId === 'summary') {
                (updatedResume as any).summary = text;
            } else if (currentSection.sectionId === 'skills' || currentSection.sectionId === 'interests') {
                if (!Array.isArray((updatedResume as any)[currentSection.sectionId])) {
                    (updatedResume as any)[currentSection.sectionId] = [];
                }
                (updatedResume as any)[currentSection.sectionId].push(text);
            } else if (Array.isArray((updatedResume as any)[currentSection.sectionId])) {
                (updatedResume as any)[currentSection.sectionId].push(newItem);
            }
            setResume(updatedResume);
        }
        setShowExampleSearch(false);
    };

    if (isLoading && !auditResult) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-fade-in text-center">
                <div className="relative">
                    <Loader2 className="animate-spin text-indigo-600 mb-6" size={64} strokeWidth={1.5} />
                    <Activity className="absolute inset-0 m-auto text-indigo-400 opacity-50" size={24} />
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Preparing Walkthrough</h2>
                <p className="text-gray-500 max-w-sm mx-auto leading-relaxed">
                    We're getting things ready for your step-by-step resume review.
                </p>
            </div>
        );
    }

    if (!auditResult) {
        return (
            <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                <ShieldCheck size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Walkthrough Unavailable</h3>
                <p className="text-gray-500 mb-6">We couldn't start the walkthrough. Try refreshing.</p>
                <button onClick={runAudit} className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all">
                    Retry
                </button>
            </div>
        );
    }

    const steps = auditResult ? auditResult.sections.map(s => s.title) : [];

    // Direct section access since we removed Overview
    const currentSection = auditResult?.sections[activeSectionIdx] || null;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Excellent': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
            case 'Good': return 'text-blue-600 bg-blue-50 border-blue-100';
            case 'Needs Work': return 'text-amber-600 bg-amber-50 border-amber-100';
            case 'Missing': return 'text-red-600 bg-red-50 border-red-100';
            default: return 'text-gray-600 bg-gray-50 border-gray-100';
        }
    };

    const handleNext = () => {
        if (activeSectionIdx < steps.length - 1) {
            setActiveSectionIdx(prev => prev + 1);
        }
    };

    const handleBack = () => {
        if (activeSectionIdx > 0) {
            setActiveSectionIdx(prev => prev - 1);
        }
    };

    const renderSectionItems = (section: ResumeAuditSection) => {
        const items = (resume as any)[section.sectionId];

        // Handle non-list sections like Summary or Skills (if treated as single block)
        if (!Array.isArray(items)) {
            return (
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow group">
                    <div className="flex justify-between items-start mb-4">
                        <h4 className="font-bold text-gray-900">Current Content</h4>
                        <div className="flex gap-2 items-center">
                            <button
                                type="button"
                                onClick={() => handleImproveItem(section.sectionId, 0, typeof items === 'string' ? items : '')}
                                disabled={!!improvingItem}
                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center justify-center"
                                title="Improve with AI"
                            >
                                {improvingItem === `${section.sectionId}-0` ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                            </button>
                        </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{typeof items === 'string' ? items : JSON.stringify(items)}</p>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                {items.map((item: any, index: number) => {
                    const isStringItem = typeof item === 'string';
                    return (
                        <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow group relative">
                            {/* Item Header */}
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="font-bold text-gray-900 text-lg">
                                        {isStringItem ? item : (item.position || item.degree || item.name || item.title || 'Untitled Item')}
                                    </h4>
                                    {!isStringItem && (
                                        <p className="text-sm text-gray-500 font-medium">
                                            {item.company || item.institution || item.issuer || ''}
                                            {(item.startDate || item.date) && ` • ${item.startDate || item.date} - ${item.endDate || (item.current ? 'Present' : '')}`}
                                        </p>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity bg-white shadow-sm border border-gray-100 rounded-lg p-1 absolute top-4 right-4 sm:static sm:shadow-none sm:border-none">
                                    <button
                                        type="button"
                                        onClick={() => setEditingItem({ section: section.sectionId, index, field: isStringItem ? 'value' : 'description' })}
                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Edit"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleImproveItem(section.sectionId, index, isStringItem ? item : (item.description || ''))}
                                        disabled={!!improvingItem}
                                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center justify-center min-w-[32px]"
                                        title="Improve with AI"
                                    >
                                        {improvingItem === `${section.sectionId}-${index}` ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteItem(section.sectionId, index)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            {editingItem?.section === section.sectionId && editingItem?.index === index ? (
                                <div className="mt-2">
                                    <textarea
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[120px] text-sm"
                                        defaultValue={isStringItem ? item : (item.description || '')}
                                        autoFocus
                                        onBlur={(e) => {
                                            // Optional: Auto-save on blur or require explicit save? 
                                            // Let's rely on buttons for now to be safe
                                        }}
                                        id={`edit-item-${section.sectionId}-${index}`}
                                    />
                                    <div className="flex justify-end gap-2 mt-2">
                                        <button
                                            onClick={() => setEditingItem(null)}
                                            className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-lg"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => {
                                                const val = (document.getElementById(`edit-item-${section.sectionId}-${index}`) as HTMLTextAreaElement).value;
                                                handleSaveItem(section.sectionId, index, isStringItem ? 'value' : 'description', val);
                                            }}
                                            className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1"
                                        >
                                            <Save size={14} /> Save Changes
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                !isStringItem && (
                                    <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap border-l-2 border-transparent pl-0 hover:border-gray-200 hover:pl-3 transition-all">
                                        {item.description || item.summary || 'No description provided.'}
                                    </p>
                                )
                            )}
                        </div>
                    );
                })}

                {/* Add New Button */}
                {/* Add New Button & Search Examples */}
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={handleAddItem}
                        className="py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 font-bold hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
                    >
                        <Plus size={18} />
                        Add New Item
                    </button>
                    <button
                        onClick={() => setShowExampleSearch(true)}
                        className="py-3 border-2 border-dashed border-indigo-100 rounded-xl text-indigo-600 font-bold hover:border-indigo-500 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
                    >
                        <Search size={18} />
                        Search Examples
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Page Header */}
            <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2 text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft size={20} />
                            <span className="font-semibold">Back to Editor</span>
                        </button>
                    )}
                    <div className="h-6 w-px bg-gray-200" />
                    <div>
                        <h1 className="text-xl font-black text-gray-900 tracking-tight">Resume Walkthrough</h1>
                        <p className="text-xs text-gray-500">Step-by-step content review and improvement</p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex h-[calc(100vh-73px)] overflow-hidden bg-gray-50">
                {/* Left Panel: Wizard */}
                <div className="w-5/12 flex flex-col border-r border-gray-200 bg-white h-full shadow-xl z-20">
                    {/* Header */}
                    <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white">
                        <div>
                            <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                                <ShieldCheck className="text-indigo-600" />
                                Reviewing
                            </h2>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">
                                Step {activeSectionIdx + 1} of {steps.length}: {steps[activeSectionIdx]}
                            </p>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="text-xs font-bold text-gray-400 mr-2">
                                {Math.round(((activeSectionIdx + 1) / steps.length) * 100)}% Complete
                            </div>
                            <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-indigo-600 transition-all duration-500 ease-out"
                                    style={{ width: `${((activeSectionIdx + 1) / steps.length) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">

                        {/* SECTION STEPS */}
                        {currentSection && (
                            <div className="space-y-8 animate-fade-in-up">
                                <div className="flex items-center justify-between">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusColor(currentSection.status)}`}>
                                        {currentSection.status}
                                    </span>
                                    <div className="flex items-center gap-1 text-gray-400">
                                        <Activity size={14} />
                                        <span className="text-xs font-bold">Impact: {currentSection.importance === 'Critical' ? 'High' : 'Medium'}</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-2xl font-black text-gray-900 leading-tight">
                                        {currentSection.title} Analysis
                                    </h3>
                                    <div className="space-y-4">
                                        {currentSection.tips.map((tip, i) => (
                                            <div key={i} className="flex gap-3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                                <div className="w-6 h-6 rounded-full bg-red-50 text-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <Info size={14} />
                                                </div>
                                                <p className="text-sm text-gray-600 leading-relaxed font-medium">{tip}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {renderSectionItems(currentSection)}
                            </div>
                        )}

                        {/* Example Search Drawer / Panel */}
                        {showExampleSearch && (
                            <div className="fixed inset-y-0 left-0 w-[500px] bg-white shadow-2xl z-50 transform transition-transform animate-slide-in-left border-r border-gray-200 flex flex-col">
                                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">Search Examples</h3>
                                        <p className="text-sm text-gray-500">Find professional content for {currentSection?.title}</p>
                                    </div>
                                    <button onClick={() => setShowExampleSearch(false)} className="p-2 hover:bg-gray-200 rounded-lg text-gray-500">
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="p-6 border-b border-gray-100">
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="text"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSearchExamples()}
                                                placeholder="Job Title (e.g. Sales Manager)..."
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                                autoFocus
                                            />
                                        </div>
                                        <button
                                            onClick={handleSearchExamples}
                                            disabled={isSearchingExamples || !searchQuery.trim()}
                                            className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                                        >
                                            {isSearchingExamples ? <Loader2 className="animate-spin" /> : 'Search'}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 bg-gray-50 space-y-4 custom-scrollbar">
                                    {exampleResults.length > 0 ? (
                                        exampleResults.map((example, i) => (
                                            <div key={i} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all group">
                                                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap mb-4">{example}</p>
                                                <button
                                                    onClick={() => handleUseExample(example)}
                                                    className="w-full py-2 bg-gray-50 text-indigo-600 font-bold rounded-lg hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <Copy size={16} />
                                                    Use This Example
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-10 text-gray-400">
                                            <BookOpen size={48} className="mx-auto mb-4 opacity-20" />
                                            <p>Search for a job title to see professional examples.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Controls */}
                    <div className="p-6 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                        <button
                            onClick={handleBack}
                            disabled={activeSectionIdx === 0}
                            className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-200 hover:text-gray-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors flex items-center gap-2"
                        >
                            <ArrowLeft size={18} />
                            Previous
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={activeSectionIdx === steps.length - 1}
                            className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                        >
                            Next Step
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </div>

                {/* Right Panel: Sticky Preview */}
                <div className="w-7/12 bg-slate-100 h-full overflow-hidden relative flex items-center justify-center p-8">
                    <div className="absolute inset-0 opacity-10 pointer-events-none"
                        style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '24px 24px' }}
                    />

                    {/* Live Preview Badge - Top Center */}
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 bg-white/90 backdrop-blur-sm px-5 py-2.5 rounded-full shadow-lg flex items-center gap-2 border border-gray-200">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-xs font-bold text-gray-700 uppercase tracking-widest">Live Preview</span>
                    </div>

                    <div className="h-full w-full max-w-[800px] flex flex-col pt-16">
                        <div className="flex-1 bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-200/50 relative transform transition-all duration-300">
                            <div className="absolute inset-0 overflow-y-auto custom-scrollbar">
                                <div className="origin-top transform scale-[0.65] origin-top-left w-[150%] h-[150%]">
                                    <ResumePreview resume={resume} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Improvement Preview Modal */}
            {
                improvementPreview && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh]">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="text-indigo-600" size={20} />
                                    <h3 className="text-xl font-bold text-gray-900">Review AI Improvements</h3>
                                </div>
                                <button
                                    onClick={() => setImprovementPreview(null)}
                                    className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Original</span>
                                        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-sm leading-relaxed text-gray-600 whitespace-pre-wrap">
                                            {improvementPreview.original}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest pl-1">Improved</span>
                                        <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 text-sm leading-relaxed text-indigo-900 whitespace-pre-wrap relative">
                                            <div className="absolute top-2 right-2">
                                                <Wand2 size={12} className="text-indigo-400" />
                                            </div>
                                            {improvementPreview.improved}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
                                <button
                                    onClick={() => setImprovementPreview(null)}
                                    className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-200 hover:text-gray-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmImprovement}
                                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2"
                                >
                                    <Check size={18} />
                                    Apply Changes
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
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
                                        <p className="text-xs text-gray-500">Applying these changes will update your resume in real-time.</p>
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

export default ResumeAudit;
