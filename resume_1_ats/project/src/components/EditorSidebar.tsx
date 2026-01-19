import React from 'react';
import {
    Layout,
    FileText,
    Download,
    MessageSquare,
    Palette,
    ArrowLeft,
    MessageCircle,
    Save,
    ScrollText
} from 'lucide-react';

interface EditorSidebarProps {
    activeSection: string;
    setActiveSection: (section: string) => void;
    onShowDesigns: () => void;
    onShowTemplates: () => void;
    onShowCoverLetter?: () => void;
    onShowInterviewPrep?: () => void;
    onShowATS?: () => void;
    // onShowAudit?: () => void; // Removed
    onExport: () => void;
    onBack: () => void;
    onSave: () => void;
    saveStatus?: string;
}

const EditorSidebar: React.FC<EditorSidebarProps> = ({
    activeSection,
    setActiveSection,
    onShowDesigns,
    onShowTemplates,
    onShowCoverLetter,
    onShowInterviewPrep,
    onShowATS,
    // onShowAudit,
    onExport,
    onBack,
    onSave,
    saveStatus
}) => {
    const navItems = [
        { id: 'personal', icon: FileText, label: 'Content' },
        { id: 'templates', icon: Layout, label: 'Templates', action: onShowTemplates },
        { id: 'design', icon: Palette, label: 'Design', action: onShowDesigns },
        { id: 'ats-check', icon: ScrollText, label: 'ATS Scan', action: onShowATS },
        // { id: 'audit', icon: ShieldCheck, label: 'Audit', action: onShowAudit }, // Removed
        { id: 'cover-letter', icon: MessageSquare, label: 'Cover Letter', action: onShowCoverLetter },
        { id: 'improve', icon: MessageSquare, label: 'Improve' },
    ];

    const bottomItems = [
        { id: 'download', icon: Download, label: 'Download', action: onExport },
        { id: 'save', icon: Save, label: 'Save', action: onSave },
        { id: 'interview-prep', icon: MessageCircle, label: 'Interview Prep', action: onShowInterviewPrep },
    ];

    const handleClick = (item: any) => {
        if (item.action) {
            item.action();
        } else if (item.id === 'personal' || item.id === 'improve') {
            setActiveSection(item.id);
        }
    };

    return (
        <aside className="w-20 bg-white border-r border-gray-200 flex flex-col items-center py-6 h-full z-20">
            {/* Back Button */}
            <button
                onClick={onBack}
                className="p-3 mb-6 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
                title="Back to Dashboard"
            >
                <ArrowLeft size={20} />
            </button>

            {/* Main Nav */}
            <div className="flex-1 w-full overflow-y-auto custom-scrollbar flex flex-col items-center gap-4 py-2">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => handleClick(item)}
                        className={`group flex flex-col items-center justify-center w-full py-2 px-1 gap-1 transition-colors relative
                            ${(activeSection === item.id)
                                ? 'text-brand-600'
                                : 'text-gray-500 hover:text-gray-900'
                            }`}
                    >
                        <div className={`p-2 rounded-xl transition-all
                            ${(activeSection === item.id) ? 'bg-brand-50' : 'group-hover:bg-gray-100'}
                        `}>
                            <item.icon size={20} />
                        </div>
                        <span className="text-[10px] font-medium">{item.label}</span>

                        {(activeSection === item.id) && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-brand-600 rounded-r-full" />
                        )}
                    </button>
                ))}
            </div>

            {/* Bottom Actions */}
            <div className="w-full flex flex-col items-center gap-4 pt-4 border-t border-gray-100">
                {bottomItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => handleClick(item)}
                        className="group flex flex-col items-center justify-center w-full py-1 px-1 gap-1 text-gray-500 hover:text-gray-900 transition-colors"
                    >
                        <div className="p-2 rounded-xl group-hover:bg-gray-100 transition-all">
                            <item.icon size={20} />
                        </div>
                        <span className="text-[10px] font-medium">{item.label}</span>
                    </button>
                ))}
            </div>
        </aside>
    );
};

export default EditorSidebar;
