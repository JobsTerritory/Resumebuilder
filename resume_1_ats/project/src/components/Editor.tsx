import React, { useState } from 'react';
import { Sparkles, Upload, FileText, ChevronLeft, Undo2, Wand2, UserCheck, Info, ShieldCheck } from 'lucide-react';
import { Resume } from '../types';
import EditorSidebar from './EditorSidebar';
import SectionList from './SectionList';
import PersonalInfoForm from './PersonalInfoForm';
import SummaryForm from './SummaryForm';
import ExperienceForm from './ExperienceForm';
import EducationForm from './EducationForm';
import SkillsForm from './SkillsForm';
import InterviewPrep from './InterviewPrep';
import LanguagesForm from './LanguagesForm';
import CertificationsForm from './CertificationsForm';
import InterestsForm from './InterestsForm';
import ProjectsForm from './ProjectsForm';
import InternshipsForm from './InternshipsForm';
import AdditionalInfoForm from './AdditionalInfoForm';
import ResumePreview from './ResumePreview';
import ResumeUpload from './ResumeUpload';
import DesignsPage from './DesignsPage';
import TemplatesPage from './TemplatesPage';
import CoverLetterGenerator from './CoverLetterGenerator';
import ATSScanner from './ATSScanner';
// import ResumeAudit from './ResumeAudit'; // Removed as it is now a separate page
import { industries } from '../lib/industries';
import { initialResumeState } from '../lib/initialState';

import { exportToPDF, exportToWord } from '../lib/exportService';

interface EditorProps {
    resume: Resume;
    setResume: React.Dispatch<React.SetStateAction<Resume>>;
    onSave: () => Promise<void>;
    onBack: () => void;
    saveStatus?: string;
}

type PanelMode = 'nav' | 'edit-section' | 'design' | 'templates' | 'improve' | 'cover-letter' | 'interview-prep' | 'ats-check';

const Editor: React.FC<EditorProps> = ({ resume, setResume, onSave, onBack, saveStatus }) => {
    const [panelMode, setPanelMode] = useState<PanelMode>('nav');
    const [activeSection, setActiveSection] = useState<string>('personal');
    const [showUpload, setShowUpload] = useState(false);
    const [history, setHistory] = useState<Resume[]>([]);
    const [lastHistoryPush, setLastHistoryPush] = useState<number>(0);
    const [targetJD, setTargetJD] = useState<string>('');
    const [showExportMenu, setShowExportMenu] = useState(false);

    const pushToHistory = (state: Resume) => {
        setHistory(prev => {
            // Only keep last 20 items to prevent memory issues
            const newHistory = [state, ...prev].slice(0, 20);
            return newHistory;
        });
        setLastHistoryPush(Date.now());
    };

    const handleUndo = () => {
        if (history.length === 0) return;

        const [previousState, ...remainingHistory] = history;
        setResume(previousState);
        setHistory(remainingHistory);
    };

    // Map section IDs to Title and Icon
    const sections = {
        personal: { title: 'Personal Information', component: PersonalInfoForm },
        summary: { title: 'Professional Summary', component: SummaryForm },
        experience: { title: 'Experience', component: ExperienceForm },
        education: { title: 'Education', component: EducationForm },
        skills: { title: 'Skills', component: SkillsForm },
        certifications: { title: 'Certifications', component: CertificationsForm },
        languages: { title: 'Languages', component: LanguagesForm },
        interests: { title: 'Interests', component: InterestsForm },
        projects: { title: 'Projects', component: ProjectsForm },
        internships: { title: 'Internships', component: InternshipsForm },
        additional: { title: 'Additional Info', component: AdditionalInfoForm },
    };

    const ActiveComponent = sections[activeSection as keyof typeof sections]?.component;

    const handleUploadResume = (parsedData: Partial<Resume>) => {
        console.log('[EDITOR] handleUploadResume received:', {
            hasSummary: !!parsedData.summary,
            expCount: (parsedData.experience || []).length,
            eduCount: (parsedData.education || []).length,
            template: parsedData.template,
            design: parsedData.design,
            custom_theme: parsedData.custom_theme,
            detected_design: parsedData.detected_design
        });
        pushToHistory(resume);
        setResume(prev => {
            const newResume = {
                ...prev,
                ...parsedData,
                title: parsedData.personal_info?.fullName || prev.title,
                // Preserve AI-detected design choices
                template: parsedData.template || prev.template || 'business-professional',
                design: parsedData.design || prev.design || 'harvard-classic',
                industry: parsedData.industry || prev.industry,
                section_order: parsedData.section_order || prev.section_order,
                detected_design: parsedData.detected_design || prev.detected_design,
                custom_theme: parsedData.custom_theme || prev.custom_theme,
                // Ensure personal info is merged correctly, being careful about names
                personal_info: {
                    ...prev.personal_info,
                    ...(parsedData.personal_info || {}),
                },
            };
            console.log('[EDITOR] New resume state:', {
                template: newResume.template,
                design: newResume.design,
                custom_theme: newResume.custom_theme,
                detected_design: newResume.detected_design
            });
            return newResume;
        });
        setPanelMode('nav');
        setShowUpload(false);
    };



    // Section Management
    const handleSectionClick = (sectionId: string) => {
        setActiveSection(sectionId);
        setPanelMode('edit-section');
    };

    const handleAddSection = (sectionId: string) => {
        pushToHistory(resume);
        setResume(prev => ({
            ...prev,
            section_order: [...(prev.section_order || []), sectionId]
        }));
        handleSectionClick(sectionId);
    };

    const handleRemoveSection = (sectionId: string) => {
        if (confirm('Are you sure you want to remove this section?')) {
            pushToHistory(resume);
            setResume(prev => ({
                ...prev,
                section_order: (prev.section_order || []).filter(id => id !== sectionId)
            }));
        }
    };

    const handleReorder = (newOrder: string[]) => {
        pushToHistory(resume);
        setResume(prev => ({
            ...prev,
            section_order: newOrder
        }));
    };

    // Calculate completion 
    const calculateProgress = () => {
        let filled = 0;
        if (resume.personal_info.fullName) filled++;
        if (resume.summary) filled++;
        if (resume.experience.length > 0) filled++;
        if (resume.education.length > 0) filled++;
        if (resume.skills.length > 0) filled++;
        if (resume.additional_info) filled++;
        return (filled / 6) * 100;
    };

    return (
        <div className="flex h-screen overflow-hidden bg-gray-100 font-sans">
            {/* 1. Left Sidebar Navigation */}
            <EditorSidebar
                activeSection={panelMode === 'design' ? 'design' : panelMode === 'templates' ? 'templates' : panelMode === 'ats-check' ? 'ats' : panelMode === 'cover-letter' ? 'cover-letter' : panelMode === 'improve' ? 'improve' : 'personal'}
                setActiveSection={(section) => {
                    if (section === 'improve') {
                        setPanelMode('improve');
                    } else {
                        setPanelMode('nav');
                    }
                }}
                onShowDesigns={() => setPanelMode('design')}
                onShowTemplates={() => setPanelMode('templates')}
                onShowCoverLetter={() => setPanelMode('cover-letter')}
                onShowInterviewPrep={() => setPanelMode('interview-prep')}
                onShowATS={() => setPanelMode('ats-check')}
                // onShowAudit={() => setPanelMode('audit')} // Removed
                onExport={() => setShowExportMenu(!showExportMenu)}
                onBack={onBack}
                onSave={onSave}
                saveStatus={saveStatus || ''}
            />

            {/* 2. Middle Panel: Dynamic Content */}
            <div className="w-[450px] bg-white border-r border-gray-200 flex flex-col h-full z-10 shadow-xl transition-all duration-300">
                {/* Panel Header */}
                <div className="px-6 py-5 border-b border-gray-100 flex items-center bg-white sticky top-0 min-h-[80px]">
                    {panelMode !== 'nav' ? (
                        <div className="flex items-center gap-3 w-full">
                            <button
                                onClick={() => setPanelMode('nav')}
                                className="p-2 -ml-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    {panelMode === 'edit-section' ? (sections[activeSection as keyof typeof sections]?.title || 'Edit Section') :
                                        panelMode === 'design' ? 'Choose Design' :
                                            panelMode === 'cover-letter' ? 'Cover Letter' :
                                                panelMode === 'interview-prep' ? 'Interview Prep' :
                                                    panelMode === 'ats-check' ? 'ATS Scanner' :
                                                        panelMode === 'improve' ? 'AI Improve' : 'Select Template'}
                                </h2>
                                {panelMode === 'edit-section' && <p className="text-xs text-gray-500">Edit details below</p>}
                            </div>
                        </div>
                    ) : (
                        <div className="w-full">
                            <h2 className="text-xl font-bold text-gray-900">Content</h2>
                            <div className="flex items-center justify-between mt-1">
                                <p className="text-xs text-gray-500">Manage resume sections</p>
                                <div className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                    {Math.round(calculateProgress())}% Complete
                                </div>
                            </div>
                            <div className="w-full mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${calculateProgress()}%` }} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Panel Content (Scrollable) */}
                <div className="flex-1 overflow-y-auto bg-gray-50/30 custom-scrollbar">
                    {panelMode === 'nav' && (
                        <div className="p-6">
                            <SectionList
                                sections={resume.section_order || []}
                                onSectionClick={handleSectionClick}
                                onAddSection={handleAddSection}
                                onRemoveSection={handleRemoveSection}
                                onReorder={handleReorder}
                            />
                        </div>
                    )}

                    {panelMode === 'edit-section' && (
                        <div className="p-6 animate-fade-in-up">
                            {ActiveComponent ? (
                                <ActiveComponent
                                    data={
                                        (activeSection === 'personal' ? resume.personal_info :
                                            activeSection === 'summary' ? resume.summary :
                                                activeSection === 'experience' ? resume.experience :
                                                    activeSection === 'education' ? resume.education :
                                                        activeSection === 'skills' ? resume.skills :
                                                            activeSection === 'certifications' ? resume.certifications :
                                                                activeSection === 'languages' ? resume.languages :
                                                                    activeSection === 'interests' ? resume.interests :
                                                                        activeSection === 'projects' ? resume.projects :
                                                                            activeSection === 'internships' ? resume.internships :
                                                                                activeSection === 'additional' ? resume.additional_info : {}) as any
                                    }
                                    showProfilePicture={resume.showProfilePicture}
                                    toggleProfilePicture={(show: boolean) => {
                                        setResume(prev => ({ ...prev, showProfilePicture: show }));
                                    }}
                                    targetJD={targetJD}
                                    onChange={(data: any) => {
                                        // Debounce history push for typing (only push if > 3 seconds since last push)
                                        if (Date.now() - lastHistoryPush > 3000) {
                                            pushToHistory(resume);
                                        }
                                        setResume(prev => ({
                                            ...prev,
                                            [activeSection === 'personal' ? 'personal_info' : (activeSection === 'additional' ? 'additional_info' : activeSection)]: data
                                        }));
                                    }}
                                />
                            ) : (
                                <div className="text-center py-10 text-gray-400">
                                    <p>Editor component for {activeSection} not found.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {panelMode === 'design' && (
                        <div className="block p-4">
                            {resume.detected_design && (
                                <div className="mb-4 p-3 bg-amber-50 border border-amber-100 rounded-lg flex items-center gap-2 text-xs text-amber-800 animate-fade-in">
                                    <Info size={14} className="shrink-0" />
                                    <span>AI detected original layout: <strong className="font-bold">{resume.detected_design}</strong>. Choose a matching design below.</span>
                                </div>
                            )}
                            <DesignsPage
                                currentDesign={resume.design || 'professional-clean'}
                                recommendedDesignIds={industries.find(i => i.id === resume.industry)?.recommendedDesigns}
                                onSelect={(id) => {
                                    pushToHistory(resume);
                                    setResume(prev => ({ ...prev, design: id }));
                                }}
                                onClose={() => setPanelMode('nav')}
                                isInline={true}
                            />
                        </div>
                    )}

                    {panelMode === 'templates' && (
                        <div className="block p-4">
                            {resume.detected_design && (
                                <div className="mb-4 p-3 bg-amber-50 border border-amber-100 rounded-lg flex items-center gap-2 text-xs text-amber-800 animate-fade-in">
                                    <Info size={14} className="shrink-0" />
                                    <span>AI detected original style: <strong className="font-bold">{resume.detected_design}</strong>. We've preserved your current selection.</span>
                                </div>
                            )}
                            <TemplatesPage
                                currentTemplate={resume.template}
                                onSelect={(id, ind) => {
                                    pushToHistory(resume);
                                    setResume(prev => ({
                                        ...prev,
                                        template: id,
                                        industry: ind
                                    }));
                                }}
                                onClose={() => setPanelMode('nav')}
                                isInline={true}
                            />
                        </div>
                    )}



                    {panelMode === 'cover-letter' && (
                        <div className="p-6">
                            <CoverLetterGenerator
                                resume={resume}
                                initialJD={targetJD}
                                onJDChange={setTargetJD}
                                onClose={() => setPanelMode('nav')}
                            />
                        </div>
                    )}
                    {panelMode === 'ats-check' && (
                        <ATSScanner
                            resume={resume}
                            onUpdate={(updated) => {
                                pushToHistory(resume);
                                setResume(updated);
                            }}
                        />
                    )}



                    {panelMode === 'improve' && (
                        <div className="p-6">
                            <div className="space-y-4">
                                {resume.ai_analysis ? (
                                    <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100 shadow-sm">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-purple-100 rounded-xl">
                                                    <Sparkles className="text-purple-600" size={24} />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900">Resume Health</h3>
                                                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Initial Extraction Analysis</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className={`text-3xl font-black ${resume.ai_analysis.overall_score >= 80 ? 'text-green-600' : resume.ai_analysis.overall_score >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                                                    {resume.ai_analysis.overall_score}%
                                                </div>
                                                <div className="text-[10px] font-bold text-gray-400 uppercase">Score</div>
                                            </div>
                                        </div>

                                        {resume.ai_analysis.detailed_feedback.length > 0 && (
                                            <div className="space-y-3 bg-white/50 rounded-xl p-4 border border-purple-50">
                                                <p className="text-xs font-bold text-purple-900 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                    <Wand2 size={14} className="text-purple-500" /> Improvement Tips
                                                </p>
                                                {resume.ai_analysis.detailed_feedback.map((tip, idx) => (
                                                    <div key={idx} className="flex gap-3 text-sm text-gray-700 items-start">
                                                        <div className="mt-1.5 flex-shrink-0">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                                                        </div>
                                                        <p className="leading-relaxed">{tip}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-100">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 bg-purple-100 rounded-lg">
                                                <Sparkles className="text-purple-600" size={24} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900">AI-Powered Improvements</h3>
                                                <p className="text-sm text-gray-600">Enhance your resume with AI suggestions</p>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-700 mb-4">
                                            Get AI-powered suggestions to improve your resume content, make it more professional, and increase your chances of getting hired.
                                        </p>
                                    </div>
                                )}

                                <div className="bg-white rounded-xl p-6 border border-gray-200">
                                    <h4 className="font-semibold text-gray-900 mb-3">Fix Missing Areas</h4>
                                    <div className="space-y-2">
                                        <button
                                            onClick={() => { setActiveSection('summary'); setPanelMode('edit-section'); }}
                                            className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
                                        >
                                            <div className="flex items-center gap-3">
                                                <FileText size={16} className="text-blue-500" />
                                                <span className="text-sm font-medium text-gray-900">Optimize Summary</span>
                                            </div>
                                            <Sparkles size={16} className="text-purple-400" />
                                        </button>
                                        <button
                                            onClick={() => { setActiveSection('experience'); setPanelMode('edit-section'); }}
                                            className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
                                        >
                                            <div className="flex items-center gap-3">
                                                <FileText size={16} className="text-indigo-500" />
                                                <span className="text-sm font-medium text-gray-900">Enhance Experience</span>
                                            </div>
                                            <Sparkles size={16} className="text-purple-400" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {panelMode === 'interview-prep' && (
                        <InterviewPrep resumes={[resume]} />
                    )}
                </div>
            </div>

            {/* 3. Right Panel: Preview Area */}
            <div className="flex-1 bg-gray-100 flex flex-col h-full relative overflow-hidden">
                {/* Toolbar */}
                <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-10">
                    <div className="flex items-center gap-4">
                        {saveStatus ? (
                            <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-2 ${saveStatus.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                <Sparkles size={14} className={saveStatus.includes('...') ? 'animate-pulse' : ''} />
                                {saveStatus}
                            </span>
                        ) : (
                            <span className="text-xs text-gray-400">All changes following...</span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => window.location.hash = 'audit'}
                            className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                        >
                            <ShieldCheck size={16} /> Resume Walkthrough
                        </button>
                        <button
                            onClick={handleUndo}
                            disabled={history.length === 0}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${history.length > 0
                                ? 'text-gray-600 hover:bg-gray-50'
                                : 'text-gray-300 cursor-not-allowed'
                                }`}
                        >
                            <Undo2 size={16} /> Undo
                        </button>
                        <button onClick={() => setShowUpload(true)} className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors">
                            <Upload size={16} /> Import
                        </button>
                        <button
                            onClick={() => {
                                if (confirm('This will overwrite your current progress with sample data. Continue?')) {
                                    pushToHistory(resume);
                                    setResume(initialResumeState);
                                }
                            }}
                            className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium transition-colors"
                        >
                            <UserCheck size={16} /> Load Sample
                        </button>
                    </div>
                </div>

                {/* Preview Canvas */}
                <div className="flex-1 overflow-auto p-8 relative">
                    <div className="bg-white shadow-2xl origin-top transform scale-[1] lg:scale-[1] transition-transform duration-300 mx-auto w-fit">
                        {/* Scale needs to be responsive or usually 100% width - ResumePreview has internal sizing */}
                        <ResumePreview key={`${resume.template}-${resume.design}`} resume={resume} />
                    </div>
                </div>

                {/* Floating Export Menu if active */}
                {showExportMenu && (
                    <div className="absolute bottom-20 left-6 bg-white rounded-xl shadow-2xl border border-gray-200 p-2 z-50 w-64 animate-fade-in-up">
                        <div className="px-4 py-3 border-b border-gray-100">
                            <h3 className="font-bold text-gray-900">Download Resume</h3>
                            <p className="text-xs text-gray-500">Choose your preferred format</p>
                        </div>
                        <div className="p-2 space-y-1">
                            <button
                                onClick={() => { exportToPDF('resume-preview', resume.title || 'resume', resume); setShowExportMenu(false); }}
                                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-red-50 text-gray-700 rounded-lg transition-colors group"
                            >
                                <div className="p-2 bg-red-100 text-red-600 rounded-lg group-hover:bg-red-200">
                                    <FileText size={18} />
                                </div>
                                <div className="text-left">
                                    <span className="block text-sm font-bold text-gray-900">PDF Document</span>
                                    <span className="block text-xs text-gray-500">Best for sharing</span>
                                </div>
                            </button>
                            <button
                                onClick={() => { exportToWord('resume-preview', resume.title || 'resume'); setShowExportMenu(false); }}
                                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-blue-50 text-gray-700 rounded-lg transition-colors group"
                            >
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-200">
                                    <FileText size={18} />
                                </div>
                                <div className="text-left">
                                    <span className="block text-sm font-bold text-gray-900">Word Document</span>
                                    <span className="block text-xs text-gray-500">Editable format</span>
                                </div>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            {showUpload && <ResumeUpload onUpload={handleUploadResume} onClose={() => setShowUpload(false)} />}
        </div>
    );
};

export default Editor;
