import React, { useState } from 'react';
import { FileText, Settings, CreditCard, Layout, Plus, Edit2, Download, Trash2, LogOut, Check, MessageCircle } from 'lucide-react';
import { designs } from '../lib/designs';
import { industries } from '../lib/industries';

import { loadAllResumes, deleteResume } from '../lib/resumeService';
import { Resume } from '../types';
import ResumePreview from './ResumePreview';
import { exportToPDF, exportToWord } from '../lib/exportService';
import ResumeCreationWizard from './ResumeCreationWizard';
import InterviewPrep from './InterviewPrep';
import { blankResumeState } from '../lib/initialState';

interface DashboardProps {
    onLogout: () => void;
    onCreateNew: (initialData?: Resume) => void;
    onEdit: (resume: Resume) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout, onCreateNew, onEdit }) => {
    const [activeTab, setActiveTab] = useState<'resumes' | 'templates' | 'subscription' | 'settings' | 'interview-prep'>('resumes');
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [loading, setLoading] = useState(true);
    const [downloadMenuId, setDownloadMenuId] = useState<string | null>(null);
    const [exportingResume, setExportingResume] = useState<Resume | null>(null);
    const [showCreationWizard, setShowCreationWizard] = useState(false);
    const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);

    // Password Update State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordMessage, setPasswordMessage] = useState({ text: '', type: '' });

    React.useEffect(() => {
        loadResumes();
    }, []);

    const loadResumes = async () => {
        try {
            const data = await loadAllResumes();
            setResumes(data);
        } catch (error) {
            console.error('Failed to load resumes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this resume?')) {
            const success = await deleteResume(id);
            if (success) {
                loadResumes();
            }
        }
    };

    const handleDownloadClick = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();
        setDownloadMenuId(downloadMenuId === id ? null : id);
    };

    const handleExport = async (resume: Resume, format: 'pdf' | 'word') => {
        setDownloadMenuId(null);
        setExportingResume(resume);

        // Allow time for render
        setTimeout(async () => {
            if (format === 'pdf') {
                await exportToPDF('hidden-export-preview', resume.title || 'resume');
            } else {
                exportToWord('hidden-export-preview', resume.title || 'resume');
            }
            // Keep it rendered for a moment or clear it
            setExportingResume(null);
        }, 500);
    };

    const handleCreateClick = (e: React.MouseEvent) => {
        e.preventDefault();
        setShowCreationWizard(true);
    };

    const handleUpdatePassword = async () => {
        setPasswordMessage({ text: '', type: '' });

        if (newPassword !== confirmPassword) {
            setPasswordMessage({ text: 'New passwords do not match', type: 'error' });
            return;
        }

        if (newPassword.length < 6) {
            setPasswordMessage({ text: 'Password must be at least 6 characters', type: 'error' });
            return;
        }

        try {
            const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
            const token = user.token;

            const response = await fetch('http://localhost:5000/api/auth/update-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update password');
            }

            setPasswordMessage({ text: 'Password updated successfully', type: 'success' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            setPasswordMessage({ text: error.message, type: 'error' });
        }
    };

    const handleDeleteAccount = async () => {
        if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            try {
                const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
                const token = user.token;

                const response = await fetch('http://localhost:5000/api/auth/delete', {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    localStorage.removeItem('currentUser');
                    localStorage.removeItem('currentResume');
                    onLogout();
                } else {
                    alert('Failed to delete account');
                }
            } catch (error) {
                console.error('Error deleting account:', error);
                alert('An error occurred while deleting account');
            }
        }
    };

    const handleTemplateSelect = (designId: string) => {
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const newState: Resume = {
            ...blankResumeState,
            personal_info: {
                ...blankResumeState.personal_info,
                fullName: user.fullName || '',
                email: user.email || '',
            },
            design: designId as any,
            template: designId as any, // Most designs currently share the same ID for simplicity in this codebase
        };
        onCreateNew(newState);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
                <div className="p-6 border-b border-gray-100">
                    <span className="text-xl font-bold text-gray-900">BuildMy<span className="text-brand-600">Resume</span></span>
                </div>
                <nav className="flex-1 p-4 space-y-1">
                    {[
                        { id: 'resumes', label: 'My Resumes', icon: FileText },
                        { id: 'templates', label: 'Templates', icon: Layout },
                        { id: 'interview-prep', label: 'Interview Prep', icon: MessageCircle },
                        { id: 'subscription', label: 'Subscription', icon: CreditCard },
                        { id: 'settings', label: 'Settings', icon: Settings },
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id as any)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === item.id ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <item.icon size={20} />
                            {item.label}
                        </button>
                    ))}
                </nav>
                <div className="p-4 border-t border-gray-100">
                    <a href="#landing" onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl text-sm font-medium transition-colors">
                        <LogOut size={20} />
                        Logout
                    </a>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto relative">
                {/* Hidden Export Container */}
                <div style={{ position: 'absolute', top: -9999, left: -9999, width: '210mm' }}>
                    {exportingResume && (
                        <div id="hidden-export-preview">
                            <ResumePreview resume={exportingResume} />
                        </div>
                    )}
                </div>

                <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
                    <h1 className="text-2xl font-bold text-gray-800 capitalize">{activeTab.replace('-', ' ')}</h1>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold">
                            {(() => {
                                const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
                                const name = user.fullName || 'User';
                                return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
                            })()}
                        </div>
                    </div>
                </header>

                <div className="p-8">
                    {activeTab === 'resumes' && (
                        <div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Create New Card */}
                                <a
                                    href="#editor"
                                    onClick={handleCreateClick}
                                    className="border-2 border-dashed border-gray-300 rounded-2xl h-64 flex flex-col items-center justify-center text-gray-500 hover:border-brand-500 hover:text-brand-600 hover:bg-brand-50 transition-all cursor-pointer group"
                                >
                                    <div className="p-4 bg-gray-100 rounded-full mb-4 group-hover:bg-white group-hover:shadow-md transition-all">
                                        <Plus size={32} />
                                    </div>
                                    <span className="font-semibold text-lg">Create New Resume</span>
                                </a>

                                {/* Existing Resumes */}
                                {loading ? (
                                    <div className="col-span-full py-12 text-center text-gray-500">Loading resumes...</div>
                                ) : resumes.length === 0 ? (
                                    <div className="col-span-full py-12 text-center text-gray-500">
                                        <p>No resumes found. Create your first resume to get started!</p>
                                    </div>
                                ) : (
                                    resumes.map(resume => (
                                        <div key={resume.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative group">
                                            <div className="flex justify-between items-start mb-4 relative">
                                                <div className="p-3 bg-brand-50 text-brand-600 rounded-lg">
                                                    <FileText size={24} />
                                                </div>
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                                                        title="Edit"
                                                        onClick={() => onEdit(resume)}
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>

                                                    <div className="relative">
                                                        <button
                                                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                                                            title="Download"
                                                            onClick={(e) => resume.id && handleDownloadClick(e, resume.id)}
                                                        >
                                                            <Download size={16} />
                                                        </button>

                                                        {downloadMenuId === resume.id && (
                                                            <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-[50]" onClick={(e) => e.stopPropagation()}>
                                                                <button
                                                                    className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm text-gray-700 flex items-center gap-2"
                                                                    onClick={() => handleExport(resume, 'pdf')}
                                                                >
                                                                    <span className="text-red-500 font-bold">PDF</span> Document
                                                                </button>
                                                                <button
                                                                    className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm text-gray-700 flex items-center gap-2"
                                                                    onClick={() => handleExport(resume, 'word')}
                                                                >
                                                                    <span className="text-blue-600 font-bold">Word</span> Document
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <button
                                                        className="p-2 hover:bg-red-50 rounded-lg text-red-500"
                                                        title="Delete"
                                                        onClick={(e) => resume.id && handleDelete(resume.id, e)}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                            <h3 className="font-bold text-gray-900 text-lg mb-1">{resume.title || 'Untitled Resume'}</h3>
                                            <p className="text-sm text-gray-500 mb-4">
                                                Edited {resume.updated_at ? new Date(resume.updated_at).toLocaleDateString() : 'Just now'}
                                            </p>

                                            <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                                                <div
                                                    className={`h-2 rounded-full bg-green-500`}
                                                    style={{ width: `70%` }}
                                                ></div>
                                            </div>
                                            <div className="flex justify-between text-xs font-medium">
                                                <span className="text-gray-500">Resume Strength</span>
                                                <span className="text-green-600">Good</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'subscription' && (
                        <div className="max-w-5xl mx-auto">
                            {/* ... existing subscription content ... */}
                            <div className="text-center mb-12">
                                <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Plan</h2>
                                <p className="text-gray-600">Select the perfect plan for your resume building needs</p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                {/* Free Plan */}
                                <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 p-8">
                                    <div className="text-center mb-6">
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
                                        <div className="flex items-baseline justify-center gap-2">
                                            <span className="text-4xl font-bold text-gray-900">₹0</span>
                                            <span className="text-gray-500">/month</span>
                                        </div>
                                    </div>
                                    <ul className="space-y-4 mb-8">
                                        <li className="flex items-start gap-3">
                                            <Check className="text-green-500 mt-1 flex-shrink-0" size={20} />
                                            <span className="text-gray-700">1 Resume</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <Check className="text-green-500 mt-1 flex-shrink-0" size={20} />
                                            <span className="text-gray-700">Basic Templates</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <Check className="text-green-500 mt-1 flex-shrink-0" size={20} />
                                            <span className="text-gray-700">PDF Export</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <Check className="text-green-500 mt-1 flex-shrink-0" size={20} />
                                            <span className="text-gray-700">Basic Support</span>
                                        </li>
                                    </ul>
                                    <button className="w-full py-3 px-6 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">
                                        Current Plan
                                    </button>
                                </div>

                                {/* Pro Plan */}
                                <div className="bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl shadow-xl border-2 border-brand-400 p-8 relative">
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-bold">
                                        POPULAR
                                    </div>
                                    <div className="text-center mb-6">
                                        <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
                                        <div className="flex items-baseline justify-center gap-2">
                                            <span className="text-4xl font-bold text-white">₹999</span>
                                            <span className="text-brand-100">/month</span>
                                        </div>
                                    </div>
                                    <ul className="space-y-4 mb-8">
                                        <li className="flex items-start gap-3">
                                            <Check className="text-white mt-1 flex-shrink-0" size={20} />
                                            <span className="text-white">Unlimited Resumes</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <Check className="text-white mt-1 flex-shrink-0" size={20} />
                                            <span className="text-white">All Premium Templates</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <Check className="text-white mt-1 flex-shrink-0" size={20} />
                                            <span className="text-white">Advanced Customization</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <Check className="text-white mt-1 flex-shrink-0" size={20} />
                                            <span className="text-white">AI-Powered Suggestions</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <Check className="text-white mt-1 flex-shrink-0" size={20} />
                                            <span className="text-white">Priority Support</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <Check className="text-white mt-1 flex-shrink-0" size={20} />
                                            <span className="text-white">Cover Letter Builder</span>
                                        </li>
                                    </ul>
                                    <button className="w-full py-3 px-6 bg-white text-brand-600 font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-lg">
                                        Upgrade to Pro
                                    </button>
                                </div>
                            </div>

                            {/* Features Comparison */}
                            <div className="mt-12 bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-6">Feature Comparison</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-200">
                                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Feature</th>
                                                <th className="text-center py-3 px-4 font-semibold text-gray-700">Free</th>
                                                <th className="text-center py-3 px-4 font-semibold text-gray-700">Pro</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            <tr>
                                                <td className="py-3 px-4 text-gray-700">Number of Resumes</td>
                                                <td className="py-3 px-4 text-center text-gray-600">1</td>
                                                <td className="py-3 px-4 text-center text-brand-600 font-semibold">Unlimited</td>
                                            </tr>
                                            <tr>
                                                <td className="py-3 px-4 text-gray-700">Templates</td>
                                                <td className="py-3 px-4 text-center text-gray-600">Basic</td>
                                                <td className="py-3 px-4 text-center text-brand-600 font-semibold">All Premium</td>
                                            </tr>
                                            <tr>
                                                <td className="py-3 px-4 text-gray-700">PDF Export</td>
                                                <td className="py-3 px-4 text-center"><Check className="text-green-500 mx-auto" size={20} /></td>
                                                <td className="py-3 px-4 text-center"><Check className="text-green-500 mx-auto" size={20} /></td>
                                            </tr>
                                            <tr>
                                                <td className="py-3 px-4 text-gray-700">AI Suggestions</td>
                                                <td className="py-3 px-4 text-center text-gray-400">-</td>
                                                <td className="py-3 px-4 text-center"><Check className="text-green-500 mx-auto" size={20} /></td>
                                            </tr>
                                            <tr>
                                                <td className="py-3 px-4 text-gray-700">Cover Letters</td>
                                                <td className="py-3 px-4 text-center text-gray-400">-</td>
                                                <td className="py-3 px-4 text-center"><Check className="text-green-500 mx-auto" size={20} /></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'interview-prep' && (
                        <InterviewPrep resumes={resumes} />
                    )}

                    {activeTab === 'templates' && (
                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* Industry Sidebar */}
                            <div className="w-full lg:w-64 flex-shrink-0 space-y-2">
                                <h3 className="font-bold text-gray-900 mb-4 px-2">Categories</h3>
                                <button
                                    onClick={() => setSelectedIndustry(null)}
                                    className={`w-full text-left px-4 py-3 rounded-xl transition-colors flex items-center justify-between group ${selectedIndustry === null
                                        ? 'bg-brand-50 text-brand-700 font-medium'
                                        : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    <span>All Categories</span>
                                    {selectedIndustry === null && <Check size={16} />}
                                </button>
                                {industries.map((industry) => (
                                    <button
                                        key={industry.id}
                                        onClick={() => setSelectedIndustry(industry.id)}
                                        className={`w-full text-left px-4 py-3 rounded-xl transition-colors flex items-center gap-3 group ${selectedIndustry === industry.id
                                            ? 'bg-brand-50 text-brand-700 font-medium'
                                            : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        <industry.icon size={18} className={selectedIndustry === industry.id ? 'text-brand-600' : 'text-gray-400 group-hover:text-gray-600'} />
                                        <span className="flex-1">{industry.name}</span>
                                        {selectedIndustry === industry.id && <Check size={16} />}
                                    </button>
                                ))}
                            </div>

                            {/* Templates Grid */}
                            <div className="flex-1">
                                <div className="mb-6">
                                    <h2 className="text-xl font-bold text-gray-900">
                                        {selectedIndustry
                                            ? `${industries.find(i => i.id === selectedIndustry)?.name} Templates`
                                            : 'All Templates'}
                                    </h2>
                                    <p className="text-gray-500 text-sm mt-1">
                                        {selectedIndustry
                                            ? industries.find(i => i.id === selectedIndustry)?.description
                                            : 'Choose a design that fits your style and industry'}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {designs
                                        .filter(design => {
                                            if (!selectedIndustry) return true;
                                            const industry = industries.find(i => i.id === selectedIndustry);
                                            return industry?.recommendedDesigns.includes(design.id);
                                        })
                                        .map((design) => (
                                            <div key={design.id} className="group relative rounded-2xl overflow-hidden border border-gray-200 hover:border-brand-500 hover:shadow-xl transition-all bg-white flex flex-col">
                                                <div className="aspect-[3/4] w-full bg-gray-100 relative overflow-hidden">
                                                    {design.thumbnail ? (
                                                        <img
                                                            src={design.thumbnail}
                                                            alt={design.name}
                                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                            <Layout size={48} />
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                                                        <button
                                                            onClick={() => handleTemplateSelect(design.id)}
                                                            className="px-6 py-2 bg-white text-gray-900 rounded-full font-bold hover:scale-105 transition-transform"
                                                        >
                                                            Use This Design
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="p-5">
                                                    <h4 className="font-bold text-gray-900 text-lg mb-2">{design.name}</h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {design.features.slice(0, 3).map((feature, i) => (
                                                            <span key={i} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                                                                {feature}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="max-w-3xl space-y-6">
                            {/* Profile Section */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-6">Profile Information</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                        <input
                                            type="text"
                                            defaultValue={JSON.parse(localStorage.getItem('currentUser') || '{}').fullName || 'John Doe'}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                                            placeholder="Your full name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                        <input
                                            type="email"
                                            defaultValue={JSON.parse(localStorage.getItem('currentUser') || '{}').email || 'john@example.com'}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                                            placeholder="your.email@example.com"
                                        />
                                    </div>
                                    <button className="px-6 py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors">
                                        Save Changes
                                    </button>
                                </div>
                            </div>

                            {/* Account Settings */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-6">Account Settings</h3>
                                <div className="space-y-4">

                                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                        <div>
                                            <h4 className="font-medium text-gray-900">Auto-save</h4>
                                            <p className="text-sm text-gray-500">Automatically save your work</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" defaultChecked />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Security Settings */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-6">Security</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                                        <input
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                                            placeholder="Enter current password"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                                            <input
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                                                placeholder="Enter new password"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                                            <input
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                                                placeholder="Confirm new password"
                                            />
                                        </div>
                                    </div>

                                    {passwordMessage.text && (
                                        <div className={`p-3 rounded-lg text-sm ${passwordMessage.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                            {passwordMessage.text}
                                        </div>
                                    )}

                                    <button
                                        onClick={handleUpdatePassword}
                                        className="px-6 py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors"
                                    >
                                        Update Password
                                    </button>
                                </div>
                            </div>

                            {/* Danger Zone */}
                            <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-8">
                                <h3 className="text-xl font-bold text-red-600 mb-6">Danger Zone</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between py-3">
                                        <div>
                                            <h4 className="font-medium text-gray-900">Delete Account</h4>
                                            <p className="text-sm text-gray-500">Permanently delete your account and all data</p>
                                        </div>
                                        <button
                                            onClick={handleDeleteAccount}
                                            className="px-4 py-2 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors"
                                        >
                                            Delete Account
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <ResumeCreationWizard
                isOpen={showCreationWizard}
                onClose={() => setShowCreationWizard(false)}
                onComplete={(data) => {
                    onCreateNew(data);
                    setShowCreationWizard(false);
                }}
            />
        </div>
    );
};

export default Dashboard;
