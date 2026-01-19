
import React, { useState } from 'react';
import { Plus, X, Heart } from 'lucide-react';

interface InterestsFormProps {
    data: string[];
    onChange: (data: string[]) => void;
    targetJD?: string;
}

export default function InterestsForm({ data, onChange, targetJD }: InterestsFormProps) {
    const [newInterest, setNewInterest] = useState('');

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (newInterest.trim()) {
            onChange([...data, newInterest.trim()]);
            setNewInterest('');
        }
    };

    const handleRemove = (index: number) => {
        onChange(data.filter((_, i) => i !== index));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (newInterest.trim()) {
                onChange([...data, newInterest.trim()]);
                setNewInterest('');
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Heart size={20} className="text-rose-500" />
                    Interests & Hobbies
                </h3>
            </div>

            <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="flex gap-2 mb-4">
                    <input
                        type="text"
                        value={newInterest}
                        onChange={(e) => setNewInterest(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="e.g. Photography, Chess, Traveling"
                        className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                    <button
                        onClick={handleAdd}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
                    >
                        <Plus size={18} /> Add
                    </button>
                </div>

                {data.length === 0 ? (
                    <p className="text-gray-500 text-center py-4 text-sm italic">
                        Add your hobbies and interests to show your personality.
                    </p>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {data.map((interest, index) => (
                            <div
                                key={index}
                                className="group flex items-center gap-2 px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-100 rounded-full text-sm font-medium hover:bg-rose-100 transition-colors"
                            >
                                <span>{interest}</span>
                                <button
                                    onClick={() => handleRemove(index)}
                                    className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-rose-200 transition-colors"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
