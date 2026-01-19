import { FileText } from 'lucide-react';

interface AdditionalInfoFormProps {
    data: string;
    onChange: (data: string) => void;
}

export default function AdditionalInfoForm({ data, onChange }: AdditionalInfoFormProps) {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-gray-500 to-slate-500 text-white rounded-xl p-2 shadow-lg">
                    <FileText size={24} />
                </div>
                <div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-700 to-slate-700 bg-clip-text text-transparent">Additional Information</h3>
                    <p className="text-sm text-gray-500">Volunteer Work, Publications, & Other Activities</p>
                </div>
            </div>

            <div className="bg-white p-6 border-2 border-gray-100 rounded-2xl shadow-sm space-y-4">
                <p className="text-sm text-gray-600">
                    This section captures any details from your resume that don't fit into the standard sections.
                </p>
                <textarea
                    value={data}
                    onChange={(e) => onChange(e.target.value)}
                    rows={12}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-gray-300 focus:border-gray-500 transition-all font-medium bg-white shadow-sm hover:shadow-md"
                    placeholder="e.g. 
• Volunteer at Red Cross (2020-2022)
• Published 'Modern Web Patterns' in Tech Journal
• Member of Local Tech Community"
                />
            </div>
        </div>
    );
}
