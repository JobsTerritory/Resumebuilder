import { Upload, FileText, X, AlertCircle, TrendingUp, CheckCircle, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Resume } from '../types';
import { parseResume } from '../lib/resumeParser';


interface ResumeUploadProps {
  onUpload: (resume: Partial<Resume>) => void;
  onClose: () => void;
}

export default function ResumeUpload({ onUpload, onClose }: ResumeUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string>('');
  const [parsedResume, setParsedResume] = useState<Partial<Resume> | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];

    if (validTypes.includes(file.type)) {
      setFile(file);
      setError('');
      setParsedResume(null);
    } else {
      alert('Please upload a PDF, Word document, or text file');
    }
  };

  const handleParseResume = async () => {
    if (!file) return;

    setError('');
    setParsing(true);

    try {
      console.log('Starting to parse file:', file.name, file.type, file.size);
      const parsedData = await parseResume(file);

      const hasData =
        parsedData.personal_info?.fullName ||
        parsedData.personal_info?.email ||
        (parsedData.skills && parsedData.skills.length > 0) ||
        (parsedData.experience && parsedData.experience.length > 0);

      if (!hasData) {
        setError('Could not extract information from the resume. Please ensure your resume contains readable text and try again.');
        setParsing(false);
        return;
      }

      setParsedResume(parsedData);
      setParsing(false);
    } catch (err: any) {
      console.error('Parsing error:', err);
      const errorMessage = err?.message || 'Unknown error';
      setError(`Failed to parse resume: ${errorMessage}`);
      setParsing(false);
    }
  };

  const handleAccept = () => {
    if (parsedResume) {
      onUpload(parsedResume);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 animate-fade-in-up">
      <header className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-500 sticky top-0 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all border border-white/30"
            >
              <X size={24} className="text-white" />
            </button>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white drop-shadow-lg">Upload Resume Document</h2>
              <p className="text-sm text-white/90 font-medium mt-1">Import your existing resume content</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-2xl border-2 border-purple-100 overflow-hidden">
          <div className="p-8 space-y-6">
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${dragActive
                ? 'border-violet-600 bg-violet-50'
                : 'border-gray-300 hover:border-violet-400'
                }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-gradient-to-br from-violet-100 to-fuchsia-100 rounded-full">
                  <Upload size={40} className="text-violet-600" />
                </div>

                {file ? (
                  <div className="flex items-center gap-3 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                    <FileText size={20} className="text-green-600" />
                    <span className="text-sm font-medium text-green-800">{file.name}</span>
                    <button
                      onClick={() => {
                        setFile(null);
                        setParsedResume(null);
                      }}
                      className="ml-2 text-green-600 hover:text-green-800"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div>
                      <p className="text-lg font-semibold text-gray-700 mb-1">
                        Drag and drop your resume document here
                      </p>
                      <p className="text-sm text-gray-500">
                        or click to browse files
                      </p>
                    </div>
                    <label className="px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-lg hover:from-violet-700 hover:to-fuchsia-700 transition-all cursor-pointer shadow-md hover:shadow-lg font-medium">
                      Choose Resume File
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.txt"
                        onChange={handleChange}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-gray-400">
                      Supported: PDF, Word (.doc, .docx), and Text files
                    </p>
                  </>
                )}
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <h4 className="font-semibold text-red-900 mb-1">Parsing Error</h4>
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            )}

            {file && !parsedResume && !parsing && (
              <button
                onClick={handleParseResume}
                className="w-full px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl hover:from-violet-700 hover:to-fuchsia-700 transition-all font-medium shadow-md flex items-center justify-center gap-2"
              >
                <TrendingUp size={20} />
                Analyze & Import Resume
              </button>
            )}

            {parsing && (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Analyzing your resume...</p>
              </div>
            )}

            {parsedResume && (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                    <div className="flex-1">
                      <h4 className="font-semibold text-green-900 mb-2">Successfully Extracted</h4>
                      <ul className="text-sm text-green-800 space-y-1 mb-4">
                        {parsedResume?.personal_info?.fullName && <li>✓ Personal: {parsedResume.personal_info.fullName}</li>}
                        {parsedResume?.personal_info?.email && <li>✓ Email: {parsedResume.personal_info.email}</li>}
                        {parsedResume?.experience && parsedResume.experience.length > 0 && (
                          <li>✓ Experience: {parsedResume.experience.length} positions</li>
                        )}
                        {parsedResume?.education && parsedResume.education.length > 0 && (
                          <li>✓ Education: {parsedResume.education.length} entries</li>
                        )}
                        {parsedResume?.skills && parsedResume.skills.length > 0 && (
                          <li>✓ Skills: {parsedResume.skills.length} detected</li>
                        )}
                      </ul>

                      {parsedResume?.ai_analysis && (
                        <div className="bg-white/60 rounded-xl p-4 border border-green-200">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="text-sm font-bold text-green-900 flex items-center gap-2">
                              <Sparkles size={16} className="text-green-600" /> Initial AI Analysis
                            </h5>
                            <div className="px-3 py-1 bg-green-100 rounded-full text-xs font-bold text-green-700">
                              Score: {parsedResume.ai_analysis.overall_score}/100
                            </div>
                          </div>

                          {parsedResume.ai_analysis.detailed_feedback.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-xs font-semibold text-green-800 uppercase tracking-wider">What's Missing:</p>
                              {parsedResume.ai_analysis.detailed_feedback.map((item, idx) => (
                                <div key={idx} className="flex gap-2 text-xs text-green-700">
                                  <div className="w-1 h-1 rounded-full bg-green-400 mt-1.5 shrink-0" />
                                  <p>{item}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAccept}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all font-medium shadow-md"
                  >
                    Import Resume
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
