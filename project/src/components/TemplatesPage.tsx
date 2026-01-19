import { useState } from 'react';
import { Palette, X, Check, Layout } from 'lucide-react';
import { industries, getTemplatesByIndustry } from '../lib/templates';

interface TemplatesPageProps {
    currentTemplate: string;
    onSelect: (templateId: string, industry: string) => void;
    onClose: () => void;
    isInline?: boolean;
}

export default function TemplatesPage({ currentTemplate, onSelect, onClose, isInline = false }: TemplatesPageProps) {
    const [selectedIndustry, setSelectedIndustry] = useState('all');
    const filteredTemplates = getTemplatesByIndustry(selectedIndustry);

    const Content = (
        <div className={`w-full ${isInline ? 'p-2' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}`}>
            {/* Industry Filter */}
            <div className={`mb-8 overflow-x-auto pb-2 ${isInline ? '-mx-2 px-2' : '-mx-4 px-4 sm:mx-0 sm:px-0'}`}>
                <div className="flex gap-2 min-w-max">
                    {industries.map((industry) => (
                        <button
                            key={industry.id}
                            onClick={() => setSelectedIndustry(industry.id)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all shadow-sm ${selectedIndustry === industry.id
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white scale-105'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                                }`}
                        >
                            <span className="text-sm">{industry.icon}</span>
                            {industry.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Templates Grid */}
            <div className={`grid gap-4 ${isInline ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
                {filteredTemplates.map((template) => (
                    <button
                        key={template.id}
                        onClick={() => onSelect(template.id, template.industry)}
                        className={`group relative p-3 rounded-xl border-2 transition-all text-left shadow-sm hover:shadow-md hover:scale-[1.01] transform bg-white ${currentTemplate === template.id
                            ? 'border-purple-600 ring-2 ring-purple-100'
                            : 'border-gray-200 hover:border-purple-300'
                            }`}
                    >
                        <div className={`h-24 rounded-lg bg-gradient-to-br ${template.color} mb-3 flex items-center justify-center text-white text-2xl shadow-inner relative overflow-hidden group-hover:shadow-md transition-all`}>
                            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            {template.supportsProfilePic ? '📷' : '📄'}

                            {/* Active Indicator */}
                            {currentTemplate === template.id && (
                                <div className="absolute top-2 right-2 bg-white text-purple-600 p-1 rounded-full shadow-sm">
                                    <Check size={12} strokeWidth={3} />
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between items-start mb-1">
                            <h4 className="font-bold text-gray-900 text-sm group-hover:text-purple-700 transition-colors">{template.name}</h4>
                        </div>

                        {!isInline && <p className="text-xs text-gray-600 leading-relaxed mb-2 min-h-[32px] line-clamp-2">{template.description}</p>}

                        <div className="flex items-center gap-1 text-[10px] font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-md w-fit">
                            <Layout size={10} />
                            {template.supportsProfilePic ? 'Photo' : 'Text'}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );

    if (isInline) {
        return Content;
    }

    return (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-gray-50 flex flex-col animate-fade-in-up">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-xl p-2 shadow-lg">
                                <Palette size={20} />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Choose Your Color Theme</h1>
                                <p className="text-xs text-gray-500">Select a color palette for your resume</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 w-full">
                {Content}
            </main>
        </div>
    );
}
