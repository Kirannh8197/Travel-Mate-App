import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Building, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { apiClient } from '../api/client';

// We import the Host form you already built!
import { HotelRegisterForm } from '../components/forms/auth/HotelRegisterForm'; 

export const SignupPage = () => {
    const [accountType, setAccountType] = useState<'USER' | 'HOST'>('USER');

    // User Form State
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleUserSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await apiClient.post('/users', {
                ...formData,
                userId: Math.floor(Math.random() * 1000000), // Match your backend requirement
                role: 'USER'
            });
            navigate('/login', { state: { message: 'Account created! Please log in.' } });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="elite-container min-h-screen flex items-center justify-center pt-24 pb-12">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
                
                {/* Account Type Toggle */}
                <div className="flex bg-gray-100 p-1.5 rounded-2xl mb-6 shadow-inner relative z-10">
                    <button onClick={() => setAccountType('USER')}
                        className={`flex-1 py-3 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 ${accountType === 'USER' ? 'bg-white shadow-md text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
                        <User className="w-4 h-4" /> Guest
                    </button>
                    <button onClick={() => setAccountType('HOST')}
                        className={`flex-1 py-3 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 ${accountType === 'HOST' ? 'bg-white shadow-md text-amber-600' : 'text-gray-500 hover:text-gray-700'}`}>
                        <Building className="w-4 h-4" /> Hotel Host
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    {accountType === 'USER' ? (
                        <motion.div key="user-form" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                            <GlassCard className="p-8 md:p-10 shadow-2xl border-gray-100 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--tm-ethereal-purple)]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                                
                                <div className="text-center mb-8 relative z-10">
                                    <h2 className="text-3xl font-black text-gray-900 font-serif tracking-tight mb-2">Join TravelMate</h2>
                                    <p className="text-sm font-medium text-gray-500">Unlock premium stays and elite experiences.</p>
                                </div>

                                {error && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-red-50 text-red-600 text-sm font-bold p-4 rounded-xl border border-red-100 mb-6 text-center">
                                        {error}
                                    </motion.div>
                                )}

                                <form onSubmit={handleUserSubmit} className="space-y-5 relative z-10">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">Full Name</label>
                                        <div className="relative group">
                                            <User className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--tm-ethereal-purple)] transition-colors" />
                                            <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="John Doe"
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-11 pr-4 text-gray-900 focus:outline-none focus:ring-4 focus:ring-[var(--tm-ethereal-purple)]/10 focus:border-[var(--tm-ethereal-purple)] transition-all font-medium" />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">Email Address</label>
                                        <div className="relative group">
                                            <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--tm-ethereal-purple)] transition-colors" />
                                            <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="you@example.com"
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-11 pr-4 text-gray-900 focus:outline-none focus:ring-4 focus:ring-[var(--tm-ethereal-purple)]/10 focus:border-[var(--tm-ethereal-purple)] transition-all font-medium" />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">Password</label>
                                        <div className="relative group">
                                            <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--tm-ethereal-purple)] transition-colors" />
                                            <input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="••••••••"
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-11 pr-4 text-gray-900 focus:outline-none focus:ring-4 focus:ring-[var(--tm-ethereal-purple)]/10 focus:border-[var(--tm-ethereal-purple)] transition-all font-medium" />
                                        </div>
                                    </div>

                                    <button type="submit" disabled={isLoading} className="w-full mt-6 py-4 rounded-xl font-black text-white text-base shadow-xl transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 group" style={{ background: 'linear-gradient(135deg, var(--tm-deep-indigo), var(--tm-ethereal-purple))' }}>
                                        {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Creating Account...</> : <>Create Account <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>}
                                    </button>
                                </form>

                                <p className="mt-8 text-center text-sm font-medium text-gray-500 relative z-10">
                                    Already have an account? <Link to="/login" className="text-[var(--tm-ethereal-purple)] font-bold hover:underline ml-1">Sign In</Link>
                                </p>
                            </GlassCard>
                        </motion.div>
                    ) : (
                        <motion.div key="host-form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            {/* Seamlessly injects the Hotel Register Form we built! */}
                            <HotelRegisterForm />
                            
                            <p className="mt-6 text-center text-sm font-medium text-gray-500">
                                Already a host? <Link to="/login" className="text-amber-600 font-bold hover:underline ml-1">Sign In</Link>
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};