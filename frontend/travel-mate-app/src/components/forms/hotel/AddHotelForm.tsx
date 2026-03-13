import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { hotelService } from '../../../services/hotel.service';
import { GlassCard } from '../../ui/GlassCard';

export const AddHotelForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // We use FormData to remain compatible with your backend Multer setup
        const data = new FormData();
        data.append('name', formData.name);
        data.append('email', formData.email);
        data.append('password', formData.password);
        
        // Add the required numeric hotelId
        data.append('hotelId', Math.floor(Math.random() * 1000000).toString());

        try {
            await hotelService.createHotel(data);
            navigate('/login', { state: { message: 'Property registered! Please log in to complete your profile.' } });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to list property. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <GlassCard className="p-8 shadow-2xl border-gray-100 relative overflow-hidden max-w-md w-full mx-auto">
            {/* Ambient Background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--tm-ethereal-purple)]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            
            <div className="mb-8 relative z-10 text-center">
                <h2 className="text-3xl font-black text-gray-900 font-serif tracking-tight mb-2">List Property</h2>
                <p className="text-sm font-medium text-gray-500">Quick start. You can add photos and pricing later.</p>
            </div>

            {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} 
                    className="bg-red-50 text-red-600 text-sm font-bold p-4 rounded-xl border border-red-100 mb-6 text-center">
                    {error}
                </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">Property Name</label>
                    <div className="relative group">
                        <Building className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--tm-ethereal-purple)] transition-colors" />
                        <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. The Grand Oasis"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-11 pr-4 text-gray-900 focus:outline-none focus:ring-4 focus:ring-[var(--tm-ethereal-purple)]/10 focus:border-[var(--tm-ethereal-purple)] transition-all font-medium" />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">Property Login Email</label>
                    <div className="relative group">
                        <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--tm-ethereal-purple)] transition-colors" />
                        <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="property@example.com"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-11 pr-4 text-gray-900 focus:outline-none focus:ring-4 focus:ring-[var(--tm-ethereal-purple)]/10 focus:border-[var(--tm-ethereal-purple)] transition-all font-medium" />
                    </div>
                </div>
                
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">Property Password</label>
                    <div className="relative group">
                        <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--tm-ethereal-purple)] transition-colors" />
                        <input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="••••••••"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-11 pr-4 text-gray-900 focus:outline-none focus:ring-4 focus:ring-[var(--tm-ethereal-purple)]/10 focus:border-[var(--tm-ethereal-purple)] transition-all font-medium" />
                    </div>
                </div>

                <button type="submit" disabled={loading} className="w-full mt-6 py-4 rounded-xl font-bold text-white text-base shadow-xl transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 group" style={{ background: 'linear-gradient(135deg, var(--tm-deep-indigo), var(--tm-ethereal-purple))' }}>
                    {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Creating Account...</> : <>Create Host Account <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>}
                </button>
            </form>
        </GlassCard>
    );
};