import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { useUserStore } from '../store/useUserStore';
import { GlassCard } from '../components/ui/GlassCard';
import { apiClient } from '../api/client';
import { ForgotPasswordForm } from '../components/forms/auth/ForgotPasswordForm';

export const LoginPage = () => {
    const [view, setView] = useState<'login' | 'forgot'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const login = useUserStore(state => state.login);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const res = await apiClient.post('/auth/login', { email, password });
            login(res.data.data, res.data.role);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid credentials');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="elite-container min-h-screen flex items-center justify-center pt-20 pb-12">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
                <GlassCard className="p-8 md:p-10 shadow-2xl border-gray-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    
                    <AnimatePresence mode="wait">
                        {view === 'login' ? (
                            <motion.div key="login-view" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                <div className="text-center mb-8 relative z-10">
                                    <h2 className="text-3xl font-black text-gray-900 font-serif tracking-tight mb-2">Welcome Back</h2>
                                    <p className="text-sm font-medium text-gray-500">Sign in to access your elite sanctuaries.</p>
                                </div>

                                {error && (
                                    <div className="bg-red-50 text-red-600 text-sm font-bold p-4 rounded-xl border border-red-100 mb-6 text-center">{error}</div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                                    {/* Email Field */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">Email</label>
                                        <div className="relative group">
                                            <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--tm-ethereal-purple)] transition-colors" />
                                            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3.5 pl-11 pr-4 text-gray-900 focus:outline-none focus:ring-4 focus:ring-[var(--tm-ethereal-purple)]/10 focus:border-[var(--tm-ethereal-purple)] transition-all font-medium" />
                                        </div>
                                    </div>

                                    {/* Password Field */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">Password</label>
                                        <div className="relative group">
                                            <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--tm-ethereal-purple)] transition-colors" />
                                            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3.5 pl-11 pr-4 text-gray-900 focus:outline-none focus:ring-4 focus:ring-[var(--tm-ethereal-purple)]/10 focus:border-[var(--tm-ethereal-purple)] transition-all font-medium" />
                                        </div>
                                        
                                        {/* ── FORGOT PASSWORD BUTTON BELOW INPUT ── */}
                                        <div className="flex justify-end pt-1">
                                            <button 
                                                type="button" 
                                                onClick={() => setView('forgot')} 
                                                className="text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-[var(--tm-ethereal-purple)] transition-colors"
                                            >
                                                Forgot Password?
                                            </button>
                                        </div>
                                    </div>

                                    <button type="submit" disabled={isLoading} className="w-full mt-4 py-4 rounded-xl font-black text-white text-base shadow-xl transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 group" style={{ background: 'linear-gradient(135deg, var(--tm-deep-indigo), var(--tm-ethereal-purple))' }}>
                                        {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Authenticating...</> : <>Secure Sign In <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>}
                                    </button>
                                </form>

                                <p className="mt-8 text-center text-sm font-medium text-gray-500 relative z-10">
                                    Don't have an account? <Link to="/register" className="text-[var(--tm-ethereal-purple)] font-bold hover:underline ml-1">Create one</Link>
                                </p>
                            </motion.div>
                        ) : (
                            <ForgotPasswordForm onBack={() => setView('login')} />
                        )}
                    </AnimatePresence>
                </GlassCard>
            </motion.div>
        </div>
    );
};