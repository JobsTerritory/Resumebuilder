import { Plus, X, Sparkles, Loader2 } from 'lucide-react';
import { generateAIContent } from '../lib/gemini';
import { useState } from 'react';

interface SkillsFormProps {
  data: string[];
  onChange: (data: string[]) => void;
  targetJD?: string;
}

export default function SkillsForm({ data, onChange, targetJD }: SkillsFormProps) {
  const [inputValue, setInputValue] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);

  const addSkill = () => {
    if (inputValue.trim() && !data.includes(inputValue.trim())) {
      onChange([...data, inputValue.trim()]);
      setInputValue('');
    }
  };

  const removeSkill = (skill: string) => {
    onChange(data.filter(s => s !== skill));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  const suggestSkills = async () => {
    if (!targetJD) return;
    setIsSuggesting(true);
    try {
      const prompt = `Based on this Job Description, suggest 8-10 key technical skills the candidate should add to their resume.
      Job Description: ${targetJD.slice(0, 3000)}
      Return ONLY a JSON array of strings: ["React", "TypeScript", ...]`;

      const result = await generateAIContent(prompt);
      const suggested: string[] = JSON.parse(result.content.replace(/```json|```/g, '').trim());

      // Filter out already added skills
      const newSkills = suggested.filter(s => !data.some(existing => existing.toLowerCase() === s.toLowerCase()));
      if (newSkills.length > 0) {
        onChange([...data, ...newSkills]);
      }
    } catch (error) {
      console.error('Skill suggestion error:', error);
    } finally {
      setIsSuggesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-br from-pink-500 to-rose-500 text-white rounded-xl p-2 shadow-lg">
          <Plus size={24} />
        </div>
        <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">Skills</h3>
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 px-4 py-3 border-2 border-pink-200 rounded-xl focus:ring-4 focus:ring-pink-300 focus:border-pink-500 transition-all font-medium bg-white shadow-sm hover:shadow-md"
          placeholder="Add a skill (e.g., JavaScript, React, etc.)"
        />
        <button
          onClick={addSkill}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all font-semibold shadow-lg hover:shadow-xl hover:scale-105 transform"
        >
          <Plus size={20} />
          Add
        </button>
      </div>

      {targetJD && (
        <button
          onClick={suggestSkills}
          disabled={isSuggesting}
          className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all text-sm font-bold disabled:opacity-50"
        >
          {isSuggesting ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Sparkles size={16} />
          )}
          Suggest Skills from Job Description
        </button>
      )}

      {data.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {data.map((skill, index) => {
            const colors = [
              'from-blue-500 to-cyan-500 text-white',
              'from-purple-500 to-pink-500 text-white',
              'from-emerald-500 to-teal-500 text-white',
              'from-orange-500 to-red-500 text-white',
              'from-pink-500 to-rose-500 text-white',
              'from-indigo-500 to-purple-500 text-white',
            ];
            const color = colors[index % colors.length];
            return (
              <div
                key={skill}
                className={`flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r ${color} rounded-xl shadow-md hover:shadow-lg transition-all`}
              >
                <span className="text-sm font-bold">{skill}</span>
                <button
                  onClick={() => removeSkill(skill)}
                  className="hover:bg-white/20 rounded-full p-0.5 transition-all"
                >
                  <X size={16} />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500 bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl border-2 border-dashed border-pink-200">
          <Plus size={48} className="mx-auto mb-3 text-pink-300" />
          <p className="font-semibold">No skills added yet</p>
          <p className="text-sm mt-1">Add your skills above to get started</p>
        </div>
      )}
    </div>
  );
}
