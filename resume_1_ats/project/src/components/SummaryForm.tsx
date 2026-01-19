import { useState } from 'react';
import { Sparkles, Loader2, Lightbulb, X, Check, Wand2 } from 'lucide-react';
import { generateAIContent, improveText, rewriteForJob } from '../lib/gemini';

interface SummaryFormProps {
  data: string;
  onChange: (data: string) => void;
  targetJD?: string;
}

export default function SummaryForm({ data, onChange, targetJD }: SummaryFormProps) {
  const [activeAction, setActiveAction] = useState<'generate' | 'improve' | null>(null);
  const [tips, setTips] = useState<string[]>([]);
  const [previewData, setPreviewData] = useState<{
    original: string;
    improved: string;
    tips: string[];
    type: 'generate' | 'improve';
  } | null>(null);

  const handleImprove = async () => {
    if (!data.trim()) return;
    setActiveAction('improve');
    try {
      if (targetJD) {
        const result = await rewriteForJob(data, targetJD, "Professional Summary");
        setPreviewData({
          original: data,
          improved: result,
          tips: ["Tailored your summary to highlight relevance to the target job description."],
          type: 'improve'
        });
      } else {
        const result = await improveText(data);
        setPreviewData({
          original: data,
          improved: result.content,
          tips: result.tips,
          type: 'improve'
        });
      }
    } catch (error) {
      console.error("AI Improve Error:", error);
    } finally {
      setActiveAction(null);
    }
  };

  const handleGenerate = async () => {
    setActiveAction('generate');
    try {
      const result = await generateAIContent("Write a professional resume summary", data);

      // If data is empty, just apply directly because there is nothing to compare
      if (!data.trim()) {
        onChange(result.content);
        setTips(result.tips);
      } else {
        setPreviewData({
          original: data,
          improved: result.content,
          tips: result.tips,
          type: 'generate'
        });
      }
    } catch (error) {
      console.error("AI Generate Error:", error);
    } finally {
      setActiveAction(null);
    }
  };

  const applyPreview = () => {
    if (previewData) {
      onChange(previewData.improved);
      setTips(previewData.tips);
      setPreviewData(null);
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-xl p-2 shadow-lg">
          <Sparkles size={24} />
        </div>
        <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Professional Summary</h3>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-800 mb-3">
          Write a brief summary about yourself and your career goals
        </label>

        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!!activeAction}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all text-xs font-bold disabled:opacity-50 shadow-sm"
          >
            {activeAction === 'generate' ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            AI Generate
          </button>
          {data.trim() && (
            <button
              type="button"
              onClick={handleImprove}
              disabled={!!activeAction}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all text-xs font-bold disabled:opacity-50 shadow-sm"
            >
              {activeAction === 'improve' ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              AI Improve {targetJD ? '(Targeted)' : ''}
            </button>
          )}
        </div>

        <textarea
          value={data}
          onChange={(e) => onChange(e.target.value)}
          rows={8}
          className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition-all text-sm font-medium bg-white shadow-sm hover:shadow-md"
          placeholder="Experienced software engineer with 5+ years of expertise in full-stack development..."
        />

        {tips.length > 0 && (
          <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200 shadow-sm animate-fade-in">
            <div className="flex items-start gap-2">
              <Lightbulb className="text-amber-500 flex-shrink-0" size={18} />
              <div>
                <p className="text-sm font-bold text-amber-900 mb-1">AI Tips:</p>
                <ul className="text-xs text-amber-800 space-y-1 font-medium">
                  {tips.map((tip, i) => <li key={i}>• {tip}</li>)}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="text-purple-600" size={20} />
                <h3 className="text-xl font-bold text-gray-900">Review AI Suggestions</h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewData(null)}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              {/* Tips Section */}
              {previewData.tips.length > 0 && (
                <div className="mb-6 bg-amber-50 p-4 rounded-xl border border-amber-100">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="text-amber-600 mt-0.5" size={18} />
                    <div>
                      <p className="text-sm font-bold text-amber-900 mb-2">Improvements Made:</p>
                      <ul className="list-disc pl-4 space-y-1">
                        {previewData.tips.map((tip, i) => (
                          <li key={i} className="text-sm text-amber-800">{tip}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Original</span>
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-sm leading-relaxed text-gray-600 whitespace-pre-wrap h-full min-h-[200px]">
                    {previewData.original}
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-bold text-purple-600 uppercase tracking-widest pl-1">Improved Version</span>
                  <div className="p-4 rounded-xl bg-purple-50 border border-purple-100 text-sm leading-relaxed text-purple-900 whitespace-pre-wrap h-full min-h-[200px] relative">
                    <div className="absolute top-2 right-2">
                      <Wand2 size={12} className="text-purple-400" />
                    </div>
                    {previewData.improved}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setPreviewData(null)}
                className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-200 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={applyPreview}
                className="px-6 py-2.5 bg-purple-600 text-white rounded-xl font-bold shadow-lg hover:bg-purple-700 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2"
              >
                <Check size={18} />
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
