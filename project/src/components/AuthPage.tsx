import React, { useState } from 'react';
import { Sparkles, Mail, Lock, User, ArrowRight, Loader2, Smartphone } from 'lucide-react';
import { apiCall } from '../lib/api';

interface AuthPageProps {
    type: 'login' | 'signup';
    onSuccess: () => void;
    onSwitch: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ type, onSuccess, onSwitch }) => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [error, setError] = useState('');
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [forgotPasswordStep, setForgotPasswordStep] = useState<'email' | 'token'>('email');
    const [resetToken, setResetToken] = useState('');
    const [resetTokenInput, setResetTokenInput] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [resetEmail, setResetEmail] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const endpoint = type === 'signup' ? '/auth/signup' : '/auth/login';
            const body = type === 'signup'
                ? { fullName, email, password, phoneNumber }
                : { email, password };

            const data = await apiCall(endpoint, {
                method: 'POST',
                body: JSON.stringify(body),
            });

            // Store user and token
            localStorage.setItem('token', data.token);
            localStorage.setItem('currentUser', JSON.stringify({
                email: data.email || email,
                fullName: data.fullName || fullName,
                phoneNumber: data.phoneNumber || phoneNumber,
                id: data._id
            }));

            setLoading(false);
            onSuccess();
        } catch (err: any) {
            setError(err.message || 'Authentication failed');
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            const data = await apiCall('/auth/forgot-password', {
                method: 'POST',
                body: JSON.stringify({ email: resetEmail }),
            });

            setResetToken(data.resetToken);
            setForgotPasswordStep('token');
            setSuccessMessage(data.message);
            setLoading(false);
        } catch (err: any) {
            setError(err.message || 'Failed to request password reset');
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            const data = await apiCall('/auth/reset-password', {
                method: 'POST',
                body: JSON.stringify({ token: resetTokenInput, newPassword }),
            });

            setSuccessMessage(data.message);
            setLoading(false);

            // Close modal and reset state after 2 seconds
            setTimeout(() => {
                setShowForgotPassword(false);
                setForgotPasswordStep('email');
                setResetEmail('');
                setResetToken('');
                setResetTokenInput('');
                setNewPassword('');
                setSuccessMessage('');
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'Failed to reset password');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <a href="#landing" className="flex justify-center items-center gap-2 mb-6 cursor-pointer hover:opacity-80 transition-opacity">
                    <div className="p-2 bg-brand-600 rounded-xl shadow-lg shadow-brand-500/20">
                        <Sparkles className="text-white" size={24} />
                    </div>
                    <span className="text-2xl font-bold tracking-tight text-gray-900">
                        BuildMy<span className="text-brand-600">Resume</span>
                    </span>
                </a>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    {type === 'login' ? 'Welcome back' : 'Create your account'}
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    {type === 'login' ? 'New to BuildMyResume? ' : 'Already have an account? '}
                    <a href={type === 'login' ? '#signup' : '#login'} className="font-medium text-brand-600 hover:text-brand-500">
                        {type === 'login' ? 'Start for free' : 'Sign in'}
                    </a>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl border border-gray-100 sm:rounded-2xl sm:px-10">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleAuth}>
                        {type === 'signup' && (
                            <>
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                        Full Name
                                    </label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="name"
                                            name="name"
                                            type="text"
                                            required
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className="pl-10 block w-full border-gray-300 rounded-xl focus:ring-brand-500 focus:border-brand-500 sm:text-sm py-3"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                        Phone Number
                                    </label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Smartphone className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            required
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            className="pl-10 block w-full border-gray-300 rounded-xl focus:ring-brand-500 focus:border-brand-500 sm:text-sm py-3"
                                            placeholder="+1 (555) 000-0000"
                                        />
                                    </div>
                                </div>
                            </>
                        )}



                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email address
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10 block w-full border-gray-300 rounded-xl focus:ring-brand-500 focus:border-brand-500 sm:text-sm py-3"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10 block w-full border-gray-300 rounded-xl focus:ring-brand-500 focus:border-brand-500 sm:text-sm py-3"
                                    placeholder="••••••••"
                                />
                            </div>
                            {type === 'login' && (
                                <div className="text-right mt-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowForgotPassword(true);
                                            setError('');
                                            setSuccessMessage('');
                                        }}
                                        className="text-sm font-medium text-brand-600 hover:text-brand-500"
                                    >
                                        Forgot Password?
                                    </button>
                                </div>
                            )}
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all shadow-brand-500/30"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : (
                                    <span className="flex items-center gap-2">
                                        {type === 'login' ? 'Sign In' : 'Create Account'} <ArrowRight size={16} />
                                    </span>
                                )}
                            </button>
                        </div>

                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                                </div>
                            </div>

                            <div className="mt-6 flex flex-col gap-3">
                                <button
                                    type="button"
                                    onClick={() => alert("Google Sign-In integration requires Google Cloud Console credentials. This is a placeholder for the requested feature.")}
                                    className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all"
                                >
                                    <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                    Sign in with Google
                                </button>
                                <button
                                    type="button"
                                    onClick={() => alert("Microsoft Sign-In integration requires Azure AD credentials. This is a placeholder for the requested feature.")}
                                    className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all"
                                >
                                    <svg className="h-5 w-5 mr-2" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M10 0H0V10H10V0Z" fill="#F25022" />
                                        <path d="M21 0H11V10H21V0Z" fill="#7FBA00" />
                                        <path d="M10 11H0V21H10V11Z" fill="#00A4EF" />
                                        <path d="M21 11H11V21H21V11Z" fill="#FFB900" />
                                    </svg>
                                    Sign in with Microsoft
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* Forgot Password Modal */}
            {showForgotPassword && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
                        <button
                            onClick={() => {
                                setShowForgotPassword(false);
                                setForgotPasswordStep('email');
                                setResetEmail('');
                                setResetToken('');
                                setResetTokenInput('');
                                setNewPassword('');
                                setError('');
                                setSuccessMessage('');
                            }}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h3>
                        <p className="text-sm text-gray-600 mb-6">
                            {forgotPasswordStep === 'email'
                                ? 'Enter your email address and we\'ll send you a reset code'
                                : 'Enter the reset code and your new password'}
                        </p>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                {error}
                            </div>
                        )}

                        {successMessage && (
                            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                                {successMessage}
                            </div>
                        )}

                        {forgotPasswordStep === 'email' ? (
                            <form onSubmit={handleForgotPassword} className="space-y-4">
                                <div>
                                    <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="reset-email"
                                            type="email"
                                            required
                                            value={resetEmail}
                                            onChange={(e) => setResetEmail(e.target.value)}
                                            className="pl-10 block w-full border-gray-300 rounded-xl focus:ring-brand-500 focus:border-brand-500 sm:text-sm py-3"
                                            placeholder="you@example.com"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all"
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : 'Send Reset Code'}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleResetPassword} className="space-y-4">
                                {resetToken && (
                                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                        <p className="text-sm font-medium text-blue-900 mb-1">Your Reset Code:</p>
                                        <p className="text-2xl font-bold text-blue-600 tracking-wider">{resetToken}</p>
                                        <p className="text-xs text-blue-700 mt-2">Copy this code and enter it below</p>
                                    </div>
                                )}

                                <div>
                                    <label htmlFor="reset-token" className="block text-sm font-medium text-gray-700 mb-2">
                                        Reset Code
                                    </label>
                                    <input
                                        id="reset-token"
                                        type="text"
                                        required
                                        value={resetTokenInput}
                                        onChange={(e) => setResetTokenInput(e.target.value.toUpperCase())}
                                        className="block w-full border-gray-300 rounded-xl focus:ring-brand-500 focus:border-brand-500 sm:text-sm py-3 uppercase tracking-wider"
                                        placeholder="XXXXXX"
                                        maxLength={6}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-2">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="new-password"
                                            type="password"
                                            required
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="pl-10 block w-full border-gray-300 rounded-xl focus:ring-brand-500 focus:border-brand-500 sm:text-sm py-3"
                                            placeholder="••••••••"
                                            minLength={6}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setForgotPasswordStep('email');
                                            setResetToken('');
                                            setResetTokenInput('');
                                            setNewPassword('');
                                            setError('');
                                        }}
                                        className="flex-1 py-3 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all"
                                    >
                                        {loading ? <Loader2 className="animate-spin" /> : 'Reset Password'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuthPage;
