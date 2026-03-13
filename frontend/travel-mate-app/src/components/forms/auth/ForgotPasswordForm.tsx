import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { apiClient } from '../../../api/client';

export const ForgotPasswordForm = ({ onBack }: { onBack: () => void }) => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // This hits your unified auth reset route
            await apiClient.post('/auth/forgot-password', { email });
            setIsSent(true);
        } catch (err: any) {
            // If backend isn't ready yet, we simulate success for UI testing
            // Remove the timeout and setIsSent(true) once your route is live
            setTimeout(() => {
                setIsSent(true);
                setIsLoading(false);
            }, 1500);
            // setError(err.response?.data?.message || 'Email not found.');
        }
    };

    if (isSent) {
        return (
            <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-100 shadow-inner">
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">Check your inbox</h2>
                <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                    If an account exists for <span className="font-bold text-gray-900">{email}</span>, 
                    you will receive a link to reset your password shortly.
                </p>
                <button onClick={onBack} className="w-full py-4 rounded-xl font-black bg-gray-900 text-white text-sm shadow-xl hover:bg-black transition-all">
                    Return to Sign In
                </button>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-gray-900 font-serif tracking-tight mb-2">Reset Password</h2>
                <p className="text-sm font-medium text-gray-500">Enter your registered email to receive a secure reset link.</p>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 text-sm font-bold p-4 rounded-xl border border-red-100 mb-6 text-center">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">Registered Email</label>
                    <div className="relative group">
                        <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--tm-ethereal-purple)] transition-colors" />
                        <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-11 pr-4 text-gray-900 focus:outline-none focus:ring-4 focus:ring-[var(--tm-ethereal-purple)]/10 focus:border-[var(--tm-ethereal-purple)] transition-all font-medium" />
                    </div>
                </div>

                <button type="submit" disabled={isLoading || !email} className="w-full mt-2 py-4 rounded-xl font-black text-white text-base shadow-xl transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, var(--tm-deep-indigo), var(--tm-ethereal-purple))' }}>
                    {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Sending Link...</> : 'Send Reset Instructions'}
                </button>

                <button type="button" onClick={onBack} className="w-full py-3 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back to Sign In
                </button>
            </form>
        </motion.div>
    );
};