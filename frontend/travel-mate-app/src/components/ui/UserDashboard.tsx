//V's_new_start — Visual Identity Audit: Elite Traveler Portal
// Changes: .elite-container centering, tracked header, avatar ring gradient,
// reservation cards switched from 1-col stack → responsive 1/2/3 col grid.
import { useEffect, useState } from 'react';
import { useUserStore } from '../../store/useUserStore';
import { Calendar, User, MapPin, Star, TrendingUp, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const STATUS_COLOR: Record<string, string> = {
    CONFIRMED:  'bg-green-50  text-green-700  border-green-200',
    PENDING:    'bg-amber-50  text-amber-700  border-amber-200',
    CANCELLED:  'bg-red-50    text-red-600    border-red-200',
    COMPLETED:  'bg-blue-50   text-blue-700   border-blue-200',
};

export const UserDashboard = () => {
    const { user } = useUserStore();
    const [bookings, setBookings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            if (!user?._id) return;
            try {
                const response = await fetch(`http://localhost:5000/api/bookings/user/${user._id}`);
                if (response.ok) {
                    const data = await response.json();
                    setBookings(data);
                }
            } catch (error) {
                console.error('Failed to fetch bookings:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchBookings();
    }, [user]);

    if (!user) return <div className="p-8 text-center text-red-400">Please sign in.</div>;

    const confirmed = bookings.filter(b => b.status === 'CONFIRMED').length;
    const totalSpent = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    return (
        // Old: <div className="pt-24 min-h-screen px-4 pb-12">
        <div className="elite-container min-h-screen">

            {/* ── Page Header ─────────────────────────────────────── */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
                <p className="text-xs font-black uppercase tracking-[0.25em] text-[var(--tm-ethereal-purple)] mb-2">
                    Welcome back
                </p>
                <h1 className="elite-section-title text-5xl md:text-6xl text-gray-900 mb-2">
                    {user.name?.split(' ')[0]}'s Portal
                </h1>
                <p className="text-gray-500 font-medium text-lg">Your sanctuary journey, at a glance.</p>
            </motion.div>

            {/* ── Stat Bar ─────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10"
            >
                {[
                    { icon: Calendar,   label: 'Total Stays',      value: bookings.length,                     color: 'text-[var(--tm-ethereal-purple)]' },
                    { icon: Star,       label: 'Active Now',       value: confirmed,                            color: 'text-green-600'                   },
                    { icon: TrendingUp, label: 'Total Invested',   value: `₹${totalSpent.toLocaleString('en-IN')}`, color: 'text-[var(--tm-deep-indigo)]' },
                    { icon: Clock,      label: 'Member Since',     value: '2025',                               color: 'text-amber-600'                   },
                ].map((stat, i) => (
                    <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.06 }}
                        className="elite-stat-card">
                        <stat.icon className={`w-5 h-5 mb-3 ${stat.color}`} />
                        <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">{stat.label}</p>
                    </motion.div>
                ))}
            </motion.div>

            {/* ── Main Grid: Profile | Bookings ───────────────────── */}
            <div className="grid lg:grid-cols-4 gap-8">

                {/* Profile Card */}
                <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
                    className="lg:col-span-1">
                    <div className="elite-card p-6 sticky top-28">
                        {/* Avatar */}
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="relative mb-4">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--tm-deep-indigo)] to-[var(--tm-ethereal-purple)] flex items-center justify-center shadow-lg shadow-[var(--tm-ethereal-purple)]/30">
                                    <User className="w-9 h-9 text-white" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white shadow-sm" />
                            </div>
                            <h2 className="text-xl font-black text-gray-900">{user.name}</h2>
                            <span className="text-xs font-black uppercase tracking-widest text-[var(--tm-ethereal-purple)] bg-purple-50 border border-purple-100 px-3 py-1 rounded-full mt-2">
                                Premium Member
                            </span>
                        </div>
                        {/* Details */}
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center gap-2 p-3 bg-gray-50/80 rounded-xl border border-gray-100">
                                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <span className="text-gray-600 font-medium truncate">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-2 p-3 bg-gray-50/80 rounded-xl border border-gray-100">
                                <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <span className="text-gray-400 font-mono text-xs truncate">{user.userId || user._id}</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Reservations Panel */}
                <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                    className="lg:col-span-3">
                    <div className="elite-card p-6 md:p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="elite-section-title text-2xl flex items-center gap-3">
                                <span className="w-8 h-8 bg-gradient-to-br from-[var(--tm-deep-indigo)] to-[var(--tm-ethereal-purple)] rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Calendar className="w-4 h-4 text-white" />
                                </span>
                                Active Reservations
                            </h2>
                            {bookings.length > 0 && (
                                <span className="text-xs font-black text-gray-400 uppercase tracking-wider">
                                    {bookings.length} {bookings.length === 1 ? 'stay' : 'stays'}
                                </span>
                            )}
                        </div>

                        {isLoading ? (
                            <div className="flex justify-center p-12">
                                <div className="w-8 h-8 border-[3px] border-[var(--tm-ethereal-purple)]/30 border-t-[var(--tm-ethereal-purple)] rounded-full animate-spin" />
                            </div>
                        ) : bookings.length === 0 ? (
                            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-16 px-8 bg-gradient-to-br from-gray-50 to-purple-50/30 rounded-2xl border border-dashed border-gray-200">
                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
                                    <Calendar className="w-7 h-7 text-gray-300" />
                                </div>
                                <p className="text-gray-700 font-bold text-lg mb-1">No active sanctuaries yet.</p>
                                <p className="text-gray-400 font-medium text-sm">Your next great stay is just a search away.</p>
                            </motion.div>
                        ) : (
                            // Old: <div className="space-y-4">
                            // NEW: Responsive grid — 1 col mobile / 2 col tablet / 3 col wide
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {bookings.map((b, i) => (
                                    <motion.div
                                        key={b._id}
                                        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.07, ease: 'easeOut' }}
                                        className="elite-booking-card"
                                    >
                                        {/* Hotel name + amount */}
                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className="font-black text-gray-900 text-sm leading-tight flex-1 pr-2">
                                                {b.hotel?.name || 'Luxury Suite'}
                                            </h3>
                                            <span className="text-[var(--tm-ethereal-purple)] font-black text-base flex-shrink-0">
                                                ₹{b.totalAmount?.toLocaleString('en-IN')}
                                            </span>
                                        </div>

                                        {/* Status badge */}
                                        <span className={`inline-block text-xs font-black px-2.5 py-1 rounded-lg border tracking-wide mb-3 ${STATUS_COLOR[b.status] || STATUS_COLOR.CONFIRMED}`}>
                                            {b.status}
                                        </span>

                                        {/* Dates */}
                                        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium bg-white/70 rounded-lg px-2.5 py-2 border border-white/60 shadow-sm">
                                            <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                            <span className="truncate">
                                                {new Date(b.checkInDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                                {' → '}
                                                {new Date(b.checkOutDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
//V's_new_end
