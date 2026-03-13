import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Loader2, CreditCard } from 'lucide-react';
import { bookingService } from '../../../services/booking.service';
import { useUserStore } from '../../../store/useUserStore';
import { GlassCard } from '../../ui/GlassCard';

export const BookingReservationForm = ({ hotel }: { hotel: any }) => {
    const { user, isAuthenticated } = useUserStore();
    const navigate = useNavigate();
    
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [totalNights, setTotalNights] = useState(0);

    // Calculate nights whenever dates change
    useEffect(() => {
        if (checkIn && checkOut) {
            const inDate = new Date(checkIn);
            const outDate = new Date(checkOut);
            const diffTime = outDate.getTime() - inDate.getTime();
            const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            setTotalNights(nights > 0 ? nights : 0);
        } else {
            setTotalNights(0);
        }
    }, [checkIn, checkOut]);

    const handleBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!isAuthenticated || !user) {
            navigate('/login', { state: { message: 'Please log in to book this property.' } });
            return;
        }

        if (totalNights <= 0) {
            setError('Check-out date must be after check-in date.');
            return;
        }

        setLoading(true);
        try {
            await bookingService.createBooking({
                userId: user.userId || user._id, 
                hotelId: hotel._id,
                checkInDate: checkIn,
                checkOutDate: checkOut
            });
            
            // Redirect to dashboard on success
            navigate('/dashboard', { state: { success: 'Booking confirmed!' } });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to complete booking.');
        } finally {
            setLoading(false);
        }
    };

    const totalAmount = totalNights * (hotel.pricePerNight || 0);

    return (
        <GlassCard className="p-6 md:p-8 sticky top-28 shadow-2xl border-gray-100">
            <h3 className="text-2xl font-black text-gray-900 mb-2 font-serif">
                ₹{hotel.pricePerNight?.toLocaleString('en-IN')} <span className="text-base font-medium text-gray-500 font-sans">/ night</span>
            </h3>

            {error && (
                <div className="bg-red-50 text-red-600 text-sm font-bold p-3 rounded-lg border border-red-100 mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleBooking} className="mt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Check-in</label>
                        <input 
                            type="date" 
                            required 
                            min={new Date().toISOString().split('T')[0]}
                            value={checkIn} 
                            onChange={(e) => setCheckIn(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-3 text-sm text-gray-900 focus:ring-4 focus:ring-[var(--tm-liquid-blue)]/10 focus:border-[var(--tm-liquid-blue)] outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Check-out</label>
                        <input 
                            type="date" 
                            required 
                            min={checkIn || new Date().toISOString().split('T')[0]}
                            value={checkOut} 
                            onChange={(e) => setCheckOut(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-3 text-sm text-gray-900 focus:ring-4 focus:ring-[var(--tm-liquid-blue)]/10 focus:border-[var(--tm-liquid-blue)] outline-none transition-all"
                        />
                    </div>
                </div>

                {totalNights > 0 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-4 border-t border-gray-100 space-y-3">
                        <div className="flex justify-between text-sm text-gray-600 font-medium">
                            <span>₹{hotel.pricePerNight} × {totalNights} {totalNights === 1 ? 'night' : 'nights'}</span>
                            <span>₹{totalAmount.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600 font-medium">
                            <span>Taxes & Fees</span>
                            <span className="text-green-600 font-bold">Included</span>
                        </div>
                        <div className="flex justify-between text-lg font-black text-gray-900 pt-3 border-t border-gray-100">
                            <span>Total</span>
                            <span className="text-[var(--tm-ethereal-purple)]">₹{totalAmount.toLocaleString('en-IN')}</span>
                        </div>
                    </motion.div>
                )}

                <button 
                    type="submit" 
                    disabled={loading || !checkIn || !checkOut} 
                    className="w-full mt-6 py-4 rounded-xl font-bold text-white text-base shadow-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg, var(--tm-liquid-blue), var(--tm-ethereal-purple))' }}
                >
                    {loading ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                    ) : isAuthenticated ? (
                        <><CreditCard className="w-5 h-5" /> Reserve Now</>
                    ) : (
                        'Log in to Reserve'
                    )}
                </button>
                <p className="text-center text-xs text-gray-400 font-medium mt-3">You won't be charged yet</p>
            </form>
        </GlassCard>
    );
};