import { Plus, Trash2, Globe } from 'lucide-react';
import { Language } from '../types';

interface LanguagesFormProps {
    data: Language[];
    onChange: (data: Language[]) => void;
    targetJD?: string;
}

export default function LanguagesForm({ data, onChange, targetJD }: LanguagesFormProps) {
    const addLanguage = () => {
        const newLang: Language = {
            id: Date.now().toString(),
            name: '',
            proficiency: 'Fluent',
        };
        onChange([...data, newLang]);
    };

    const updateLanguage = (id: string, field: keyof Language, value: string) => {
        onChange(data.map(lang => lang.id === id ? { ...lang, [field]: value } : lang));
    };

    const removeLanguage = (id: string) => {
        onChange(data.filter(lang => lang.id !== id));
    };

    const proficiencyOptions = [
        'Native',
        'Fluent',
        'Advanced',
        'Intermediate',
        'Beginner',
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-indigo-500 to-violet-500 text-white rounded-xl p-2 shadow-lg">
                        <Globe size={24} />
                    </div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Languages</h3>
                </div>
                <button
                    onClick={addLanguage}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-xl hover:from-indigo-600 hover:to-violet-600 transition-all text-sm font-semibold shadow-lg hover:shadow-xl hover:scale-105 transform"
                >
                    <Plus size={18} />
                    Add Language
                </button>
            </div>

            <div className="space-y-4">
                {data.map((lang) => (
                    <div key={lang.id} className="p-4 border-2 border-indigo-100 rounded-2xl bg-white hover:border-indigo-200 transition-all shadow-sm hover:shadow-md">
                        <div className="flex gap-4 items-start">
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">
                                    Language
                                </label>
                                <input
                                    type="text"
                                    value={lang.name}
                                    onChange={(e) => updateLanguage(lang.id, 'name', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
                                    placeholder="e.g. English, Spanish"
                                />
                            </div>

                            <div className="flex-1">
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">
                                    Proficiency
                                </label>
                                <select
                                    value={lang.proficiency}
                                    onChange={(e) => updateLanguage(lang.id, 'proficiency', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white"
                                >
                                    {proficiencyOptions.map(option => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={() => removeLanguage(lang.id)}
                                className="mt-6 text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-all"
                                title="Remove language"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}

                {data.length === 0 && (
                    <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <Globe size={40} className="mx-auto mb-3 opacity-20" />
                        <p>No languages added yet</p>
                    </div>
                )}
            </div>
        </div>
    );
}
