
import React from 'react';
import { Plus, Trash2, Calendar, Award, Link as LinkIcon, Building } from 'lucide-react';
import { Certification } from '../types';

interface CertificationsFormProps {
    data: Certification[];
    onChange: (data: Certification[]) => void;
}

export default function CertificationsForm({ data, onChange }: CertificationsFormProps) {
    const handleChange = (id: string, field: keyof Certification, value: string) => {
        onChange(data.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const handleAdd = () => {
        onChange([
            ...data,
            {
                id: Date.now().toString(),
                name: '',
                issuer: '',
                date: '',
                url: ''
            }
        ]);
    };

    const handleRemove = (id: string) => {
        onChange(data.filter(item => item.id !== id));
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Certifications & Achievements</h3>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                    <Plus size={16} /> Add Item
                </button>
            </div>

            <div className="space-y-4">
                {data.map((cert, index) => (
                    <div key={cert.id} className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-gray-300 transition-colors group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-2">
                                <span className="flex items-center justify-center w-6 h-6 text-xs font-bold text-gray-500 bg-gray-100 rounded-full">
                                    {index + 1}
                                </span>
                                <span className="font-medium text-gray-900">{cert.name || '(Untitled Certification)'}</span>
                            </div>
                            <button
                                onClick={() => handleRemove(cert.id)}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                title="Remove certification"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-xs font-medium text-gray-700 mb-1">Certification Name</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-gray-400">
                                        <Award size={14} />
                                    </span>
                                    <input
                                        type="text"
                                        value={cert.name}
                                        onChange={(e) => handleChange(cert.id, 'name', e.target.value)}
                                        placeholder="e.g. AWS Certified Solutions Architect"
                                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Issuing Organization</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-gray-400">
                                        <Building size={14} />
                                    </span>
                                    <input
                                        type="text"
                                        value={cert.issuer}
                                        onChange={(e) => handleChange(cert.id, 'issuer', e.target.value)}
                                        placeholder="e.g. Amazon Web Services"
                                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-gray-400">
                                        <Calendar size={14} />
                                    </span>
                                    <input
                                        type="text"
                                        value={cert.date}
                                        onChange={(e) => handleChange(cert.id, 'date', e.target.value)}
                                        placeholder="e.g. 2023 or Jan 2023"
                                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="col-span-2">
                                <label className="block text-xs font-medium text-gray-700 mb-1">Credential URL (Optional)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-gray-400">
                                        <LinkIcon size={14} />
                                    </span>
                                    <input
                                        type="text"
                                        value={cert.url || ''}
                                        onChange={(e) => handleChange(cert.id, 'url', e.target.value)}
                                        placeholder="e.g. https://aws.amazon.com/verify/..."
                                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {data.length === 0 && (
                    <div className="text-center py-8 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
                        <Award className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                        <p className="text-sm text-gray-500 mb-4">No certifications or achievements added yet</p>
                        <button
                            onClick={handleAdd}
                            className="text-sm font-medium text-blue-600 hover:text-blue-700"
                        >
                            Add your first item
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
