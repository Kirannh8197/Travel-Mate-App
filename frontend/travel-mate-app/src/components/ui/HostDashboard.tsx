import { useEffect, useState } from 'react';
import { useUserStore } from '../../store/useUserStore';
import { Building, Pencil, Bell, Calendar, CheckCircle, PlusCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { hotelService } from '../../services/hotel.service';
import { bookingService } from '../../services/booking.service';
import { EditHotelModal as HotelEditForm } from '../forms/hotel/HotelEditForm';

export const HostDashboard = () => {
    const { user, role } = useUserStore();
    const [bookings, setBookings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editOpen, setEditOpen] = useState(false);
    const [hotelData, setHotelData] = useState<any>(user);

    const BACKEND = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';
    const imgUrl = (path: string) => path.startsWith('http') ? path : `${BACKEND}${path}`;

    useEffect(() => {
        const fetchHostData = async () => {
            if (!user || role !== "HOTEL_HOST") return;
            setIsLoading(true);
            try {
                // FIX: Instead of calling the Admin-only 'getAllHotels()', 
                // we fetch exactly this host's hotel using their ID!
                const targetId = user._id || user.hotelId;
                
                if (targetId) {
                    const actualHotelRes = await hotelService.getHotelById(targetId);
                    const actualHotel = actualHotelRes.data || actualHotelRes;

                    if (actualHotel) {
                        setHotelData(actualHotel);
                        const bData = await bookingService.getHotelBookings(actualHotel._id);
                        setBookings(bData);
                    }
                }
            } catch (error) { 
                console.error("Failed to fetch host dashboard data:", error); 
            } finally { 
                setIsLoading(false); 
            }
        };
        fetchHostData();
    }, [user, role]);

    if (!user || role !== "HOTEL_HOST") return <div className="p-8 text-center text-red-400">Restricted Access. Hotel Hosts only.</div>;

    return (
        <div className="elite-container min-h-screen">
            <div className="flex justify-between items-end mb-10">
                <div>
                    <p className="text-xs font-black uppercase tracking-[0.25em] text-[var(--tm-ethereal-purple)] mb-2">Host Command</p>
                    <h1 className="elite-section-title text-5xl text-gray-900 mb-2">Command Center</h1>
                    <p className="text-gray-500 font-medium">Manage your premium listings and guest reservations.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link to="/list-hotel"
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[var(--tm-deep-indigo)] to-[var(--tm-ethereal-purple)] text-white font-bold text-sm shadow-lg shadow-[var(--tm-ethereal-purple)]/25 hover:-translate-y-0.5 transition-all whitespace-nowrap">
                        <PlusCircle className="w-4 h-4" /> List New Property
                    </Link>
                    <div className="px-4 py-2 bg-green-50 border border-green-100 shadow-sm rounded-xl flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-sm font-bold text-green-700">Status: {hotelData.status || 'PENDING'}</span>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-1 elite-card overflow-hidden">
                    <div className="h-32 relative bg-gradient-to-br from-[var(--tm-deep-indigo)] to-[var(--tm-ethereal-purple)]">
                        {hotelData.images?.[0] && (
                            <img src={imgUrl(hotelData.images[0])} alt="" className="absolute inset-0 w-full h-full object-cover" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <button onClick={() => setEditOpen(true)}
                            className="absolute top-3 right-3 w-9 h-9 bg-white/20 hover:bg-white/40 backdrop-blur-sm border border-white/30 rounded-full flex items-center justify-center text-white transition-all hover:scale-110"
                            title="Edit hotel details">
                            <Pencil className="w-4 h-4" />
                        </button>
                    </div>
                    
                    <div className="p-6 relative -mt-12">
                        <div className="w-16 h-16 rounded-2xl bg-white border border-gray-100 flex items-center justify-center mb-4 shadow-lg">
                            <Building className="w-8 h-8 text-[var(--tm-liquid-blue)]" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-0.5">{hotelData.name}</h2>
                        <p className="text-sm text-gray-500 font-medium mb-1">{hotelData.address?.city || 'No city set'}, {hotelData.address?.country || 'No country set'}</p>
                        
                        {hotelData.description ? (
                            <p className="text-xs text-gray-400 font-medium mb-4 line-clamp-2">{hotelData.description}</p>
                        ) : (
                            <p className="text-xs text-amber-500 font-bold mb-4">⚠ Profile incomplete. Please edit details.</p>
                        )}
                        
                        <div className="space-y-3 mt-4">
                            <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                                <span className="text-gray-500 font-bold">Nightly Rate</span>
                                <span className="text-gray-900 font-mono font-bold text-lg">₹{hotelData.pricePerNight || 0}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                                <span className="text-gray-500 font-bold">Total Bookings</span>
                                <span className="text-gray-900 font-mono font-bold text-lg">{bookings.length}</span>
                            </div>
                        </div>
                        <button onClick={() => setEditOpen(true)}
                            className="mt-5 w-full py-2.5 rounded-2xl text-sm font-black text-[var(--tm-ethereal-purple)] border-2 border-[var(--tm-ethereal-purple)]/30 hover:bg-purple-50 transition-all flex items-center justify-center gap-2">
                            <Pencil className="w-4 h-4" /> Edit Hotel Details
                        </button>
                    </div>
                </div>

                <div className="md:col-span-2">
                    <div className="elite-card p-6 h-full flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                <Bell className="w-6 h-6 text-[var(--tm-liquid-blue)]" /> Live Guest Activity
                            </h2>
                        </div>
                        {isLoading ? (
                            <div className="flex-grow flex items-center justify-center"><div className="w-8 h-8 border-2 border-[var(--tm-liquid-blue)] border-t-transparent rounded-full animate-spin" /></div>
                        ) : bookings.length === 0 ? (
                            <div className="flex-grow flex flex-col items-center justify-center text-center p-8 border border-gray-200 rounded-xl bg-gray-50">
                                <Calendar className="w-12 h-12 text-gray-400 mb-4" />
                                <p className="text-gray-500 font-bold">Your registry is clean. Awaiting new guests.</p>
                            </div>
                        ) : (
                            <div className="space-y-4 overflow-y-auto pr-2 max-h-[500px]">
                                {bookings.map((b, i) => (
                                    <motion.div key={b._id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                                        className="elite-booking-card relative">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />
                                        <div className="ml-4 flex justify-between items-start">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                                    <h3 className="font-bold text-gray-900">New Booking Received</h3>
                                                </div>
                                                <p className="text-sm text-gray-600 font-medium">Guest <span className="text-[var(--tm-liquid-blue)] font-bold">{b.user?.name || b.user}</span> booked for {new Date(b.checkInDate).toLocaleDateString()}</p>
                                                <p className="text-xs text-gray-400 mt-2 font-mono font-bold tracking-wider">Ref: {b._id.substring(0, 8).toUpperCase()}</p>
                                            </div>
                                            <div className="text-right shrink-0 ml-3">
                                                <span className="text-2xl font-black text-[var(--tm-ethereal-purple)]">₹{b.totalAmount}</span>
                                                <span className={`text-xs mt-1 uppercase font-bold tracking-wider inline-block px-2 py-0.5 rounded border ${
                                                    b.status === 'CANCELLED' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-100/50 text-green-600 border-green-200'
                                                }`}>{b.status}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {editOpen && (
                    <HotelEditForm hotel={hotelData} onClose={() => setEditOpen(false)} onSaved={(updated) => { setHotelData(updated); setEditOpen(false); }} />
                )}
            </AnimatePresence>
        </div>
    );
};