import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { userService } from '../../../services/user.service';
import { GlassCard } from '../../ui/GlassCard';

export const UserRegisterForm = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // FIX: Generate the required numeric userId here!
            const finalPayload = {
                ...formData,
                userId: Math.floor(Math.random() * 1000000)
            };

            await userService.register(finalPayload);
            navigate('/login', { state: { message: 'Registration successful! Please log in.' } });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to register. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <GlassCard className="p-8 md:p-10 shadow-2xl border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--tm-liquid-blue)]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <div className="text-center mb-8 relative z-10">
                <h2 className="text-2xl font-black text-gray-900 font-serif tracking-tight mb-2">Join TravelMate</h2>
                <p className="text-sm font-medium text-gray-500">Start booking your sanctuary journeys today.</p>
            </div>

            {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} 
                    className="bg-red-50 text-red-600 text-sm font-bold p-4 rounded-xl border border-red-100 mb-6 text-center">
                    {error}
                </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">Full Name</label>
                    <div className="relative group">
                        <User className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--tm-liquid-blue)] transition-colors" />
                        <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="John Doe"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-11 pr-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-[var(--tm-liquid-blue)]/10 focus:border-[var(--tm-liquid-blue)] transition-all font-medium" />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">Email Address</label>
                    <div className="relative group">
                        <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--tm-liquid-blue)] transition-colors" />
                        <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="name@example.com"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-11 pr-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-[var(--tm-liquid-blue)]/10 focus:border-[var(--tm-liquid-blue)] transition-all font-medium" />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">Password</label>
                    <div className="relative group">
                        <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--tm-liquid-blue)] transition-colors" />
                        <input type="password" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder="••••••••"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-11 pr-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-[var(--tm-liquid-blue)]/10 focus:border-[var(--tm-liquid-blue)] transition-all font-medium" />
                    </div>
                </div>

                <button type="submit" disabled={loading} className="w-full mt-4 py-3.5 rounded-xl font-bold text-white text-base shadow-xl bg-[var(--tm-liquid-blue)] hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 group">
                    {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Creating Account...</> : <>Register <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>}
                </button>
            </form>
        </GlassCard>
    );
};