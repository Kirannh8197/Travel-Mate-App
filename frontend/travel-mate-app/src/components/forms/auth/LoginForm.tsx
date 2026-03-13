import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { authService } from '../../../services/auth.service';
import { useUserStore } from '../../../store/useUserStore';
import { GlassCard } from '../../ui/GlassCard';

export const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();
    const { login } = useUserStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Using the new centralized authService!
            const response = await authService.login({ email, password });
            
            // Save to Zustand global store
            login(response.data, response.role as 'USER' | 'HOTEL_HOST' | 'ADMIN');
            
            // Route based on role
            if (response.role === 'HOTEL_HOST') {
                navigate('/host-dashboard');
            } else if (response.role === 'ADMIN') {
                navigate('/admin-dashboard');
            } else {
                navigate('/dashboard'); // Standard user
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <GlassCard className="p-8 md:p-10 shadow-2xl border-gray-100 max-w-md w-full mx-auto relative overflow-hidden">
                {/* Decorative background blur inside card */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--tm-ethereal-purple)]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                
                <div className="text-center mb-8 relative z-10">
                    <h2 className="text-3xl font-black text-gray-900 font-serif tracking-tight mb-2">Welcome Back</h2>
                    <p className="text-sm font-medium text-gray-500">Sign in to manage your sanctuary journeys.</p>
                </div>

                {error && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} 
                        className="bg-red-50 text-red-600 text-sm font-bold p-4 rounded-xl border border-red-100 mb-6 text-center">
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">Email Address</label>
                        <div className="relative group">
                            <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--tm-ethereal-purple)] transition-colors" />
                            <input 
                                type="email" 
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-11 pr-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-[var(--tm-ethereal-purple)]/10 focus:border-[var(--tm-ethereal-purple)] transition-all font-medium shadow-inner"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">Password</label>
                        <div className="relative group">
                            <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--tm-ethereal-purple)] transition-colors" />
                            <input 
                                type="password" 
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-11 pr-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-[var(--tm-ethereal-purple)]/10 focus:border-[var(--tm-ethereal-purple)] transition-all font-medium shadow-inner"
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full mt-4 py-3.5 rounded-xl font-bold text-white text-base shadow-xl shadow-[var(--tm-ethereal-purple)]/25 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 group"
                        style={{ background: 'linear-gradient(135deg, var(--tm-deep-indigo), var(--tm-ethereal-purple))' }}
                    >
                        {loading ? (
                            <><Loader2 className="w-5 h-5 animate-spin" /> Authenticating...</>
                        ) : (
                            <>Sign In <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm font-medium text-gray-500 relative z-10">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-[var(--tm-ethereal-purple)] font-bold hover:underline">
                        Create one now
                    </Link>
                </div>
            </GlassCard>
        </motion.div>
    );
};