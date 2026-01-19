import React, { useState } from 'react';
import { Upload, CheckCircle, AlertCircle, FileText, Loader2 } from 'lucide-react';
import axios from 'axios';

const ResumeScoringWidget: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [score, setScore] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setScore(null);
            setResult(null);
        }
    };

    const handleScore = async () => {
        if (!file) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('resume', file);

        try {
            // Point to the backend API we created (assuming proxy or direct URL)
            // For now specific localhost 5000
            const response = await axios.post('http://localhost:5000/api/score', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setScore(response.data.score);
            setResult(response.data);
        } catch (error) {
            console.error('Error scoring resume:', error);
            alert('Failed to get score. Ensure backend is running.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-brand-100 max-w-lg mx-auto transform hover:scale-[1.02] transition-transform duration-300">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Get Your Resume Score</h3>
            <p className="text-gray-500 mb-6">Upload your resume to check its ATS compatibility instantly.</p>

            {!score && !result ? (
                <div className="space-y-4">
                    <div className="border-2 border-dashed border-brand-200 rounded-xl p-8 text-center bg-brand-50/50 hover:bg-brand-50 transition-colors cursor-pointer relative">
                        <input
                            type="file"
                            accept=".pdf,.docx"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center gap-3">
                            <div className="p-3 bg-brand-100 rounded-full text-brand-600">
                                <Upload size={24} />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-700">
                                    {file ? file.name : "Click to upload or drag & drop"}
                                </p>
                                <p className="text-sm text-gray-400 mt-1">PDF or DOCX (Max 5MB)</p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleScore}
                        disabled={!file || loading}
                        className={`w-full py-3 px-6 rounded-xl font-bold text-white shadow-lg transition-all ${file && !loading
                                ? 'bg-brand-600 hover:bg-brand-700 hover:shadow-xl'
                                : 'bg-gray-300 cursor-not-allowed'
                            }`}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <Loader2 className="animate-spin" /> Analyzing...
                            </span>
                        ) : (
                            "Check My Score"
                        )}
                    </button>
                </div>
            ) : (
                <div className="animate-fade-in">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">ATS Score</p>
                            <div className={`text-5xl font-extrabold ${score! >= 80 ? 'text-green-500' : score! >= 60 ? 'text-yellow-500' : 'text-red-500'
                                }`}>
                                {score}/100
                            </div>
                        </div>
                        <div className={`w-20 h-20 rounded-full border-8 flex items-center justify-center ${score! >= 80 ? 'border-green-100 text-green-500' : score! >= 60 ? 'border-yellow-100 text-yellow-500' : 'border-red-100 text-red-500'
                            }`}>
                            <FileText size={32} />
                        </div>
                    </div>

                    <div className="mb-6 bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <p className="text-gray-700 italic">"{result?.summary}"</p>
                    </div>

                    <div className="space-y-3">
                        {result?.suggestions?.slice(0, 3).map((suggestion: string, idx: number) => (
                            <div key={idx} className="flex gap-3 items-start p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                                <AlertCircle size={18} className="text-brand-500 mt-0.5 shrink-0" />
                                <span className="text-sm text-gray-600">{suggestion}</span>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => { setFile(null); setScore(null); setResult(null); }}
                        className="mt-6 w-full py-3 bg-brand-50 text-brand-700 font-semibold rounded-xl hover:bg-brand-100 transition-colors"
                    >
                        Analyze Another
                    </button>

                    <div className="mt-4 text-center">
                        <button className="text-brand-600 font-medium hover:underline text-sm">
                            Login to fix these issues &rarr;
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResumeScoringWidget;
