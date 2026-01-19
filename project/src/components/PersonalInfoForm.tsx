import { PersonalInfo } from '../types';
import { Plus, Trash2, Upload, User, X } from 'lucide-react';
import { useState } from 'react';

interface PersonalInfoFormProps {
  data: PersonalInfo;
  onChange: (data: PersonalInfo) => void;
  targetJD?: string;
  showProfilePicture?: boolean;
  toggleProfilePicture?: (show: boolean) => void;
}

export default function PersonalInfoForm({ data, onChange, showProfilePicture, toggleProfilePicture }: PersonalInfoFormProps) {
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleChange = (field: keyof PersonalInfo, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingImage(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange('profilePicture', reader.result as string);
        if (toggleProfilePicture) {
          toggleProfilePicture(true);
        }
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    handleChange('profilePicture', '');
    if (toggleProfilePicture) {
      toggleProfilePicture(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-xl p-2 shadow-lg">
            <User size={24} />
          </div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Personal Information</h3>
        </div>

        {data.profilePicture && (
          <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl">
            <span className="text-sm font-medium text-gray-700">Show Photo</span>
            <button
              onClick={() => toggleProfilePicture?.(!showProfilePicture)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ring-2 ring-offset-2 ring-transparent ${showProfilePicture ? 'bg-blue-600' : 'bg-gray-300'}`}
            >
              <span
                className={`${showProfilePicture ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
              />
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-6 p-6 bg-gradient-to-br from-blue-100 via-cyan-50 to-teal-50 rounded-2xl border-2 border-blue-300 shadow-lg">
        <div className="relative">
          {data.profilePicture ? (
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
              <img
                src={data.profilePicture}
                alt="Profile"
                className="w-full h-full object-cover"
              />
              <button
                onClick={removeImage}
                className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 flex items-center justify-center shadow-xl animate-gradient">
              <User size={40} className="text-white" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-900 mb-1">Profile Picture</p>
          <p className="text-xs text-gray-700 mb-3">
            Upload a professional photo (optional)
          </p>
          <label className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all cursor-pointer shadow-md hover:shadow-xl hover:scale-105 transform w-fit font-semibold">
            <Upload size={16} />
            <span className="text-sm font-medium">
              {uploadingImage ? 'Uploading...' : 'Upload Photo'}
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={uploadingImage}
            />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            value={data.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
            className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all text-sm font-medium bg-white shadow-sm hover:shadow-md"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-800 mb-2">
            Professional Title
          </label>
          <input
            type="text"
            value={data.title || ''}
            onChange={(e) => handleChange('title', e.target.value)}
            className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition-all text-sm font-medium bg-white shadow-sm hover:shadow-md"
            placeholder="Senior Software Engineer"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-800 mb-2">
            Email *
          </label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:ring-4 focus:ring-green-300 focus:border-green-500 transition-all text-sm font-medium bg-white shadow-sm hover:shadow-md"
            placeholder="john@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-800 mb-2">
            Phone *
          </label>
          <input
            type="tel"
            value={data.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl focus:ring-4 focus:ring-pink-300 focus:border-pink-500 transition-all text-sm font-medium bg-white shadow-sm hover:shadow-md"
            placeholder="+1 (555) 123-4567"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-800 mb-2">
            Location *
          </label>
          <input
            type="text"
            value={data.location}
            onChange={(e) => handleChange('location', e.target.value)}
            className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-4 focus:ring-orange-300 focus:border-orange-500 transition-all text-sm font-medium bg-white shadow-sm hover:shadow-md"
            placeholder="San Francisco, CA"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-800 mb-2">
            LinkedIn
          </label>
          <input
            type="url"
            value={data.linkedin || ''}
            onChange={(e) => handleChange('linkedin', e.target.value)}
            className="w-full px-4 py-3 border-2 border-cyan-200 rounded-xl focus:ring-4 focus:ring-cyan-300 focus:border-cyan-500 transition-all text-sm font-medium bg-white shadow-sm hover:shadow-md"
            placeholder="linkedin.com/in/johndoe"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-800 mb-2">
            Portfolio
          </label>
          <input
            type="url"
            value={data.portfolio || ''}
            onChange={(e) => handleChange('portfolio', e.target.value)}
            className="w-full px-4 py-3 border-2 border-teal-200 rounded-xl focus:ring-4 focus:ring-teal-300 focus:border-teal-500 transition-all text-sm font-medium bg-white shadow-sm hover:shadow-md"
            placeholder="portfolio.com"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-800 mb-2">
            Date of Birth
          </label>
          <input
            type="text"
            value={data.dateOfBirth || ''}
            onChange={(e) => handleChange('dateOfBirth', e.target.value)}
            className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl focus:ring-4 focus:ring-indigo-300 focus:border-indigo-500 transition-all text-sm font-medium bg-white shadow-sm hover:shadow-md"
            placeholder="e.g. 1st January 1990"
          />
        </div>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-bold text-gray-800">
          Additional Fields
        </label>
        {data.customFields?.map((field, index) => (
          <div key={index} className="flex gap-3 items-start animate-in slide-in-from-left-2 duration-200">
            <div className="flex-1">
              <input
                type="text"
                value={field.label}
                onChange={(e) => {
                  const newFields = [...(data.customFields || [])];
                  newFields[index] = { ...field, label: e.target.value };
                  onChange({ ...data, customFields: newFields });
                }}
                className="w-full px-3 py-2 border-2 border-gray-100 rounded-lg focus:border-blue-400 transition-all text-sm"
                placeholder="Field Label (e.g. Nationality)"
              />
            </div>
            <div className="flex-[2]">
              <input
                type="text"
                value={field.value}
                onChange={(e) => {
                  const newFields = [...(data.customFields || [])];
                  newFields[index] = { ...field, value: e.target.value };
                  onChange({ ...data, customFields: newFields });
                }}
                className="w-full px-3 py-2 border-2 border-gray-100 rounded-lg focus:border-blue-400 transition-all text-sm"
                placeholder="Value"
              />
            </div>
            <button
              onClick={() => {
                const newFields = data.customFields?.filter((_, i) => i !== index);
                onChange({ ...data, customFields: newFields });
              }}
              className="mt-1 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
        <button
          onClick={() => {
            const newFields = [...(data.customFields || []), { label: '', value: '' }];
            onChange({ ...data, customFields: newFields });
          }}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
        >
          <Plus size={16} />
          Add Custom Field
        </button>
      </div>
    </div>
  );
}
