import React, { useState } from 'react';
import {
    UserCircle,
    FileText,
    Briefcase,
    GraduationCap,
    Sparkles,
    Plus,
    GripVertical,
    Languages,
    Award,
    Code,
    Trash2,
    Heart
} from 'lucide-react';

interface SectionListProps {
    sections: string[];
    onSectionClick: (section: string) => void;
    onAddSection: (section: string) => void;
    onRemoveSection: (section: string) => void;
    onReorder: (newOrder: string[]) => void;
}

const SECTION_CONFIG: Record<string, { icon: any, label: string }> = {
    personal: { icon: UserCircle, label: 'Personal Details' },
    summary: { icon: FileText, label: 'Summary' },
    experience: { icon: Briefcase, label: 'Experience' },
    education: { icon: GraduationCap, label: 'Education' },
    skills: { icon: Sparkles, label: 'Skills' },
    projects: { icon: Code, label: 'Projects' },
    certifications: { icon: Award, label: 'Certifications & Achievements' },
    languages: { icon: Languages, label: 'Languages' },
    interests: { icon: Heart, label: 'Interests' },
    additional: { icon: FileText, label: 'Additional Info' },
};

const SectionList: React.FC<SectionListProps> = ({
    sections,
    onSectionClick,
    onAddSection,
    onRemoveSection,
    onReorder
}) => {
    const [isAdding, setIsAdding] = useState(false);

    // Filter out sections that are already added
    const availableSections = Object.keys(SECTION_CONFIG).filter(key =>
        key !== 'personal' && !sections.includes(key)
    );

    const handleDragStart = (e: React.DragEvent, index: number) => {
        e.dataTransfer.setData('text/plain', index.toString());
    };

    const handleDrop = (e: React.DragEvent, targetIndex: number) => {
        e.preventDefault();
        const startIndex = parseInt(e.dataTransfer.getData('text/plain'));
        if (startIndex === targetIndex) return;

        const newSections = [...sections];
        const [moved] = newSections.splice(startIndex, 1);
        newSections.splice(targetIndex, 0, moved);
        onReorder(newSections);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault(); // Necessary to allow dropping
    };

    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2">Your Content</p>

                {/* Personal Info is always fixed at top */}
                <button
                    onClick={() => onSectionClick('personal')}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-xl hover:border-brand-500 hover:shadow-md transition-all group text-left"
                >
                    <div className="p-2 bg-brand-50 text-brand-600 rounded-lg group-hover:bg-brand-100 transition-colors">
                        <UserCircle size={18} />
                    </div>
                    <span className="font-semibold text-gray-700 group-hover:text-brand-700">Personal Details</span>
                </button>

                {/* Draggable List */}
                {sections.map((sectionId, index) => {
                    if (sectionId === 'personal') return null; // Skip personal info in draggable list
                    const config = SECTION_CONFIG[sectionId] || { icon: FileText, label: sectionId };
                    const Icon = config.icon;

                    return (
                        <div
                            key={sectionId}
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDrop={(e) => handleDrop(e, index)}
                            onDragOver={handleDragOver}
                            className="group relative flex items-center gap-2"
                        >
                            <div className="cursor-grab text-gray-300 hover:text-gray-500 p-1">
                                <GripVertical size={14} />
                            </div>
                            <button
                                onClick={() => onSectionClick(sectionId)}
                                className="flex-1 flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl hover:border-brand-500 hover:shadow-md transition-all text-left group-hover/btn:border-brand-500"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-50 text-gray-600 rounded-lg group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                                        <Icon size={18} />
                                    </div>
                                    <span className="font-semibold text-gray-700 group-hover:text-brand-700">{config.label}</span>
                                </div>
                            </button>
                            <button
                                onClick={() => onRemoveSection(sectionId)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                title="Remove section"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Add Section Button */}
            {availableSections.length > 0 && (
                <div className="pt-4 border-t border-gray-100">
                    {!isAdding ? (
                        <button
                            onClick={() => setIsAdding(true)}
                            className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 font-medium hover:border-brand-400 hover:text-brand-600 hover:bg-brand-50 transition-all flex items-center justify-center gap-2"
                        >
                            <Plus size={18} /> Add Section
                        </button>
                    ) : (
                        <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-2 animate-fade-in-up">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 py-2">Add to Resume</p>
                            <div className="grid grid-cols-2 gap-2">
                                {availableSections.map(key => {
                                    const config = SECTION_CONFIG[key];
                                    const Icon = config.icon;
                                    return (
                                        <button
                                            key={key}
                                            onClick={() => {
                                                onAddSection(key);
                                                setIsAdding(false);
                                            }}
                                            className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors text-center"
                                        >
                                            <div className="p-2 bg-gray-100 text-gray-600 rounded-lg">
                                                <Icon size={20} />
                                            </div>
                                            <span className="text-xs font-medium text-gray-700">{config.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                            <button
                                onClick={() => setIsAdding(false)}
                                className="w-full mt-2 py-2 text-xs text-gray-400 hover:text-gray-600 font-medium"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SectionList;
