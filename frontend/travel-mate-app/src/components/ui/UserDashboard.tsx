import { useEffect, useState } from 'react';
import { useUserStore } from '../../store/useUserStore';
import {
    Calendar, User, MapPin, Star, TrendingUp,
    Clock, CheckSquare, LogOut, MessageSquare
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { bookingService } from '../../services/booking.service';

const STATUS_COLOR: Record<string, string> = {
    CONFIRMED: 'bg-green-50  text-green-700  border-green-200',
    PENDING: 'bg-amber-50  text-amber-700  border-amber-200',
    CANCELLED: 'bg-red-50    text-red-600    border-red-200',
    COMPLETED: 'bg-blue-50   text-blue-700   border-blue-200',
};

export const UserDashboard = () => {
    const { user } = useUserStore();
    const navigate = useNavigate();
    const [bookings, setBookings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            const targetId = user?.userId || user?._id;
            if (!targetId) return;

            try {
                // ── CLEAN AXIOS SERVICE CALL ──
                const data = await bookingService.getUserBookings(targetId);
                setBookings(data);
            } catch (error) {
                console.error('Failed to fetch bookings:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchBookings();
    }, [user]);

    const handleCheckIn = async (bookingId: string) => {
        try {
            await bookingService.checkIn(bookingId);
            setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, isCheckedIn: true } : b));
        } catch (err) { console.error("Check-in failed", err); }
    };

    const handleCheckOut = async (bookingId: string) => {
        try {
            await bookingService.checkOut(bookingId);
            setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, isCheckedOut: true, status: 'COMPLETED' } : b));
        } catch (err) { console.error("Check-out failed", err); }
    };

    if (!user) return <div className="p-8 text-center text-red-400">Please sign in.</div>;

    const confirmed = bookings.filter(b => b.status === 'CONFIRMED').length;
    const totalSpent = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    return (
        <div className="elite-container min-h-screen pt-20">

            {/* ── Page Header ── */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
                <p className="text-xs font-black uppercase tracking-[0.25em] text-[var(--tm-ethereal-purple)] mb-2">Welcome back</p>
                <h1 className="elite-section-title text-5xl md:text-6xl text-gray-900 mb-2">
                    {user.name?.split(' ')[0]}'s Portal
                </h1>
                <p className="text-gray-500 font-medium text-lg">Manage your stays and share your experiences.</p>
            </motion.div>

            {/* ── Stat Bar ── */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                {[
                    { icon: Calendar, label: 'Total Stays', value: bookings.length, color: 'text-[var(--tm-ethereal-purple)]' },
                    { icon: Star, label: 'Active Now', value: confirmed, color: 'text-green-600' },
                    { icon: TrendingUp, label: 'Total Invested', value: `₹${totalSpent.toLocaleString('en-IN')}`, color: 'text-[var(--tm-deep-indigo)]' },
                    { icon: Clock, label: 'Member Since', value: new Date(user.createdAt || Date.now()).getFullYear(), color: 'text-amber-600' },
                ].map((stat, i) => (
                    <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }} className="elite-stat-card">
                        <stat.icon className={`w-5 h-5 mb-3 ${stat.color}`} />
                        <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">{stat.label}</p>
                    </motion.div>
                ))}
            </motion.div>

            {/* ── Main Layout Grid ── */}
            <div className="grid lg:grid-cols-4 gap-8">

                {/* Left: Profile Card */}
                <div className="lg:col-span-1">
                    <div className="elite-card p-6 sticky top-28">
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--tm-deep-indigo)] to-[var(--tm-ethereal-purple)] flex items-center justify-center shadow-lg mb-4">
                                <User className="w-9 h-9 text-white" />
                            </div>
                            <h2 className="text-xl font-black text-gray-900">{user.name}</h2>
                            <span className="text-xs font-black uppercase tracking-widest text-[var(--tm-ethereal-purple)] bg-purple-50 px-3 py-1 rounded-full mt-2 border border-purple-100">Premium Member</span>
                        </div>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center gap-2 p-3 bg-gray-50/80 rounded-xl border border-gray-100">
                                <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                                <span className="text-gray-600 font-medium truncate">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-2 p-3 bg-gray-50/80 rounded-xl border border-gray-100">
                                <User className="w-4 h-4 text-gray-400 shrink-0" />
                                <span className="text-gray-400 font-mono text-xs truncate">ID: {user.userId || user._id?.slice(-6)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Reservation Management */}
                <div className="lg:col-span-3">
                    <div className="elite-card p-6 md:p-8">
                        <h2 className="elite-section-title text-2xl flex items-center gap-3 mb-6">
                            <Calendar className="w-6 h-6 text-[var(--tm-liquid-blue)]" /> Your Sanctuary Journey
                        </h2>

                        {isLoading ? (
                            <div className="flex justify-center p-12"><div className="w-8 h-8 border-[3px] border-t-[var(--tm-ethereal-purple)] rounded-full animate-spin" /></div>
                        ) : bookings.length === 0 ? (
                            <div className="text-center py-16 border-2 border-dashed border-gray-100 rounded-3xl">
                                <Calendar className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                <p className="text-gray-400 font-bold">No reservations found. Your adventure begins at the Search page.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {bookings.map((b, i) => (
                                    <motion.div key={b._id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="elite-booking-card flex flex-col h-full">

                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex-1 min-w-0 mr-2">
                                                <h3 className="font-black text-gray-900 text-sm truncate leading-tight">{b.hotel?.name || 'Luxury Suite'}</h3>
                                                <p className="text-[10px] text-gray-400 font-mono mt-0.5">REF: {b._id?.slice(-8).toUpperCase()}</p>
                                            </div>
                                            <span className="text-[var(--tm-ethereal-purple)] font-black text-sm flex-shrink-0">₹{b.totalAmount?.toLocaleString('en-IN')}</span>
                                        </div>

                                        <span className={`inline-block text-[10px] font-black px-2 py-0.5 rounded-lg border mb-4 self-start tracking-wide ${STATUS_COLOR[b.status] || STATUS_COLOR.CONFIRMED}`}>
                                            {b.status}
                                        </span>

                                        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium bg-white/70 rounded-lg px-2.5 py-2 border border-white/60 mb-4 shadow-sm">
                                            <Calendar className="w-3 h-3 text-gray-400" />
                                            <span className="truncate">{new Date(b.checkInDate).toLocaleDateString()} → {new Date(b.checkOutDate).toLocaleDateString()}</span>
                                        </div>

                                        {/* Dynamic Action Buttons */}
                                        <div className="flex gap-2 mt-auto pt-4 border-t border-gray-50">
                                            {b.status === 'CONFIRMED' && !b.isCheckedIn && (
                                                <button onClick={() => handleCheckIn(b._id)} className="flex-1 py-2 bg-[var(--tm-liquid-blue)] text-white rounded-xl text-xs font-bold hover:opacity-90 shadow-md flex items-center justify-center gap-1 transition-all active:scale-95">
                                                    <CheckSquare className="w-3.5 h-3.5" /> Check In
                                                </button>
                                            )}
                                            {b.isCheckedIn && !b.isCheckedOut && (
                                                <button onClick={() => handleCheckOut(b._id)} className="flex-1 py-2 bg-[var(--tm-ethereal-purple)] text-white rounded-xl text-xs font-bold hover:opacity-90 shadow-md flex items-center justify-center gap-1 transition-all active:scale-95">
                                                    <LogOut className="w-3.5 h-3.5" /> Check Out
                                                </button>
                                            )}

                                            {/* Review Trigger: Passed hotelId and hotelName in navigation state */}
                                            {(b.status === 'CONFIRMED' || b.status === 'COMPLETED') && (
                                                <button
                                                    onClick={() => navigate('/review', {
                                                        state: {
                                                            hotelId: b.hotel?.hotelId,
                                                            hotelName: b.hotel?.name
                                                        }
                                                    })}
                                                    className="flex-1 py-2 bg-white border-2 border-purple-100 text-[var(--tm-ethereal-purple)] rounded-xl text-xs font-bold hover:bg-purple-50 transition-all flex items-center justify-center gap-1"
                                                >
                                                    <MessageSquare className="w-3.5 h-3.5" /> Review
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};