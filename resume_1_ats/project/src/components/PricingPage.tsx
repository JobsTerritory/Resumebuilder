import React from 'react';
import { Check, X } from 'lucide-react';

interface PricingProps {
    onBack: () => void;
}

const PricingPage: React.FC<PricingProps> = ({ onBack }) => {
    return (
        <div className="min-h-screen bg-gray-50 py-20 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <a href="#dashboard" className="text-gray-500 hover:text-gray-900 mb-8 inline-block">&larr; Back to Dashboard</a>
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
                    <p className="text-xl text-gray-500">Choose the plan that fits your career goals.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Free Plan */}
                    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-8 border border-gray-100 relative overflow-hidden">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Free Plan</h3>
                        <p className="text-gray-500 mb-6">Perfect for getting started</p>
                        <div className="flex items-baseline mb-8">
                            <span className="text-5xl font-extrabold text-gray-900">₹0</span>
                            <span className="text-gray-500 ml-2">/month</span>
                        </div>
                        <ul className="space-y-4 mb-8">
                            <li className="flex items-center gap-3 text-gray-700">
                                <Check className="text-brand-600" size={20} /> 1 Resume Download (Watermarked)
                            </li>
                            <li className="flex items-center gap-3 text-gray-700">
                                <Check className="text-brand-600" size={20} /> Basic AI Suggestions
                            </li>
                            <li className="flex items-center gap-3 text-gray-700">
                                <Check className="text-brand-600" size={20} /> Access to Free Templates
                            </li>
                        </ul>
                        <a href="#signup" className="w-full py-4 bg-gray-100 text-gray-900 font-bold rounded-xl hover:bg-gray-200 transition-colors block text-center">
                            Get Started Free
                        </a>
                    </div>

                    {/* Pro Plan */}
                    <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all p-8 border-2 border-brand-500 relative overflow-hidden transform md:-translate-y-4">
                        <div className="absolute top-0 right-0 bg-brand-500 text-white px-4 py-1 rounded-bl-xl text-sm font-bold">
                            RECOMMENDED
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Pro Plan</h3>
                        <p className="text-brand-600 mb-6 font-medium">Unlock full potential</p>
                        <div className="flex items-baseline mb-8">
                            <span className="text-5xl font-extrabold text-gray-900">₹499</span>
                            <span className="text-gray-500 ml-2">/month</span>
                        </div>
                        <ul className="space-y-4 mb-8">
                            <li className="flex items-center gap-3 text-gray-700">
                                <Check className="text-brand-600" size={20} /> <strong>Unlimited</strong> Resume Creations
                            </li>
                            <li className="flex items-center gap-3 text-gray-700">
                                <Check className="text-brand-600" size={20} /> All Premium Templates Unlocked
                            </li>
                            <li className="flex items-center gap-3 text-gray-700">
                                <Check className="text-brand-600" size={20} /> Advanced AI Rewrite & Scoring
                            </li>
                            <li className="flex items-center gap-3 text-gray-700">
                                <Check className="text-brand-600" size={20} /> No Watermark & Secure PDF
                            </li>
                        </ul>
                        <button className="w-full py-4 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/30">
                            Upgrade to Pro
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PricingPage;
