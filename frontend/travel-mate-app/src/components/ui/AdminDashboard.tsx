import { useEffect, useState } from 'react';
import { useUserStore } from '../../store/useUserStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldAlert, CheckCircle, XCircle, Eye, BanIcon, Hotel,
    Users, LayoutList, RefreshCw, X, MapPin, Star, DollarSign,
    Mail, Hash, Wifi
} from 'lucide-react';
import { apiClient } from '../../api/client'; // ── Clean Axios Client 

const BACKEND = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';
const imgUrl = (path: string) => !path ? '' : path.startsWith('http') ? path : path.startsWith('/') ? `${BACKEND}${path}` : `${BACKEND}/uploads/${path}`;

// ── Deep Inspect Drawer ─────────────────────────────────────────────────
const HotelInspectDrawer = ({ hotel, onClose, onAction }: { hotel: any; onClose: () => void; onAction: (id: string | number, status: string) => void }) => {
    if (!hotel) return null;
    return (
        <AnimatePresence>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex justify-end"
                onClick={onClose}>
                <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                    onClick={e => e.stopPropagation()}
                    className="w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl">
                    {/* Header */}
                    <div className="relative h-40 bg-gradient-to-br from-[var(--tm-deep-indigo)] to-[var(--tm-ethereal-purple)] flex flex-col justify-end p-6">
                        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white transition-all">
                            <X className="w-4 h-4" />
                        </button>
                        <p className="text-white/60 text-xs font-black uppercase tracking-widest mb-1">Deep Inspect</p>
                        <h2 className="text-white text-2xl font-serif font-black">{hotel.name}</h2>
                    </div>
                    <div className="p-6 space-y-5">
                        {/* Status badge */}
                        <div className="flex items-center gap-2">
                            <span className={`text-xs font-black px-3 py-1.5 rounded-lg border tracking-wider ${
                                hotel.status === 'APPROVED'            ? 'bg-green-50  text-green-700  border-green-200'
                              : hotel.status === 'PENDING_VERIFICATION'? 'bg-amber-50  text-amber-700  border-amber-200'
                              :                                          'bg-red-50    text-red-600    border-red-200'
                            }`}>{hotel.status}</span>
                            <span className="text-xs text-gray-400 font-mono">ID: {hotel.hotelId}</span>
                        </div>
                        {/* Details grid */}
                        <div className="space-y-3">
                            {[
                                { icon: MapPin,       label: 'Location',    val: `${hotel.address?.city || '—'}, ${hotel.address?.country || '—'}` },
                                { icon: Mail,         label: 'Owner Email', val: hotel.email || '—' },
                                { icon: DollarSign,   label: 'Nightly Rate', val: `₹${hotel.pricePerNight || 0}` },
                                { icon: Star,         label: 'Avg Rating',  val: hotel.averageRating || 'No reviews' },
                                { icon: Hash,         label: 'Mongo ID',    val: hotel._id?.slice(-8) || '—' },
                            ].map(item => (
                                <div key={item.label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                    <item.icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    <span className="text-xs font-bold text-gray-400 w-24 flex-shrink-0">{item.label}</span>
                                    <span className="text-sm font-bold text-gray-900 truncate">{String(item.val)}</span>
                                </div>
                            ))}
                        </div>
                        {/* Description */}
                        {hotel.description && (
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Description</p>
                                <p className="text-sm text-gray-700 font-medium leading-relaxed">{hotel.description}</p>
                            </div>
                        )}
                        {/* Amenities */}
                        {hotel.amenities?.length > 0 && (
                            <div>
                                <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1"><Wifi className="w-3 h-3" /> Amenities</p>
                                <div className="flex flex-wrap gap-2">
                                    {hotel.amenities.map((a: string) => (
                                        <span key={a} className="text-xs font-bold bg-purple-50 text-[var(--tm-ethereal-purple)] border border-purple-100 px-2.5 py-1 rounded-lg">{a}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {/* Admin Actions */}
                        <div className="pt-2 border-t border-gray-100 space-y-2">
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Admin Actions</p>
                            <div className="grid grid-cols-2 gap-2">
                                <button onClick={() => { onAction(hotel.hotelId, 'APPROVED'); onClose(); }}
                                    className="py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 font-black text-sm flex items-center justify-center gap-2 hover:bg-green-500 hover:text-white transition-all">
                                    <CheckCircle className="w-4 h-4" /> Approve
                                </button>
                                <button onClick={() => { onAction(hotel.hotelId, 'REJECTED'); onClose(); }}
                                    className="py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 font-black text-sm flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-all">
                                    <XCircle className="w-4 h-4" /> Reject
                                </button>
                                <button onClick={() => { onAction(hotel.hotelId, 'BANNED'); onClose(); }}
                                    className="col-span-2 py-3 rounded-xl bg-gray-900 text-white font-black text-sm flex items-center justify-center gap-2 hover:bg-black transition-all">
                                    <BanIcon className="w-4 h-4" /> De-list / Ban Property
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

// ── Tab IDs ─────────────────────────────────────────────────────────────
type Tab = 'pending' | 'all' | 'users';
const TABS: { id: Tab; label: string; icon: typeof LayoutList }[] = [
    { id: 'pending', label: 'Pending Approvals', icon: ShieldAlert },
    { id: 'all',     label: 'All Hotels',        icon: Hotel       },
    { id: 'users',   label: 'User Management',   icon: Users       },
];

const STATUS_STYLE: Record<string, string> = {
    APPROVED:             'bg-green-50  text-green-700  border-green-200',
    PENDING_VERIFICATION: 'bg-amber-50  text-amber-700  border-amber-200',
    REJECTED:             'bg-red-50    text-red-600    border-red-100',
    BANNED:               'bg-gray-100  text-gray-600   border-gray-200',
};
const ROLE_STYLE: Record<string, string> = {
    ADMIN:      'bg-red-50   text-red-700   border-red-200',
    HOTEL_HOST: 'bg-blue-50  text-blue-700  border-blue-200',
    USER:       'bg-gray-50  text-gray-600  border-gray-200',
};

// ── Main Component ──────────────────────────────────────────────────────
export const AdminDashboard = () => {
    const { user, role } = useUserStore();
    const [activeTab, setActiveTab] = useState<Tab>('pending');
    const [hotels, setHotels] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [inspect, setInspect] = useState<any>(null);

    const fetchHotels = async () => {
        setIsLoading(true);
        try {
            // ── Clean Axios fetch. Headers added automatically! ──
            const res = await apiClient.get('/hotel');
            setHotels(res.data?.data || res.data || []);
        } catch (e) { console.error(e); } finally { setIsLoading(false); }
    };

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            // ── Clean Axios fetch for Users ──
            const res = await apiClient.get('/users');
            setUsers(res.data?.users || res.data?.data || []);
        } catch (e) { console.error(e); } finally { setIsLoading(false); }
    };

    useEffect(() => { if (role === 'ADMIN') fetchHotels(); }, [role]);
    useEffect(() => { if (activeTab === 'users' && users.length === 0) fetchUsers(); }, [activeTab]);

    const handleAction = async (hotelId: string | number, status: string) => {
        const actionMap: Record<string, string> = {
            APPROVED: 'approve', REJECTED: 'reject', BANNED: 'reject'
        };
        const endpoint = actionMap[status] || 'reject';
        
        try {
            // ── Clean Axios Patch for Approvals ──
            const res = await apiClient.patch(`/hotel/${hotelId}/${endpoint}`);
            if (res.status === 200) {
                setHotels(prev => prev.map(h => h.hotelId === hotelId ? { ...h, status } : h));
            }
        } catch (e) { console.error("Failed to update status", e); }
    };

    if (role !== 'ADMIN') {
        return (
            <div className="elite-container min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <ShieldAlert className="w-12 h-12 text-red-400 mx-auto mb-3" />
                    <p className="text-red-500 font-bold">Restricted — Admins only.</p>
                </div>
            </div>
        );
    }

    const pendingHotels  = hotels.filter(h => h.status === 'PENDING_VERIFICATION');
    const approvedHotels = hotels.filter(h => h.status === 'APPROVED');

    return (
        <>
        <div className="elite-container min-h-screen pb-24">
            {/* ── Page Header ─────────────────────────────── */}
            <div className="mb-10 pt-10 flex items-start justify-between gap-6">
                <div>
                    <p className="text-xs font-black uppercase tracking-[0.25em] text-red-500 mb-2">Admin Console</p>
                    <h1 className="elite-section-title text-5xl text-gray-900 mb-2">Global Governance</h1>
                    <p className="text-gray-500 font-medium">Full platform oversight — approve, audit, and govern all properties and users.</p>
                </div>
                <div className="flex items-center gap-3 mt-2 shrink-0">
                    <button onClick={() => { activeTab === 'users' ? fetchUsers() : fetchHotels() }} className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 border border-gray-200 flex items-center justify-center transition-all" title="Refresh data">
                        <RefreshCw className="w-4 h-4 text-gray-600" />
                    </button>
                    <div className="w-12 h-12 bg-red-50 rounded-2xl border border-red-100 flex items-center justify-center shadow-lg">
                        <ShieldAlert className="w-6 h-6 text-red-500" />
                    </div>
                </div>
            </div>

            {/* ── Stat Bar ─────────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'Total Properties', value: hotels.length,          color: 'text-gray-900'                        },
                    { label: 'Pending Review',   value: pendingHotels.length,   color: 'text-amber-600'                       },
                    { label: 'Approved',         value: approvedHotels.length,  color: 'text-green-600'                       },
                    { label: 'Registered Users', value: users.length || '—',    color: 'text-[var(--tm-ethereal-purple)]'     },
                ].map(s => (
                    <div key={s.label} className="elite-stat-card">
                        <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* ── Tab Bar ──────────────────────────────────── */}
            <div className="flex gap-1 p-1.5 bg-gray-100 rounded-2xl mb-8 w-fit overflow-x-auto max-w-full">
                {TABS.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all whitespace-nowrap ${
                            activeTab === tab.id
                                ? 'bg-white shadow-md text-gray-900'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}>
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                        {tab.id === 'pending' && pendingHotels.length > 0 && (
                            <span className="ml-1 w-5 h-5 bg-amber-500 text-white text-xs font-black rounded-full flex items-center justify-center">
                                {pendingHotels.length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-[var(--tm-ethereal-purple)]/20 border-t-[var(--tm-ethereal-purple)] rounded-full animate-spin" />
                </div>
            ) : (
                <AnimatePresence mode="wait">

                    {/* ─── TAB: Pending Approvals ──────────────── */}
                    {activeTab === 'pending' && (
                        <motion.div key="pending" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                            {pendingHotels.length === 0 ? (
                                <div className="elite-card p-16 text-center border-dashed">
                                    <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                                    <p className="text-gray-700 font-bold text-xl mb-1">All clear.</p>
                                    <p className="text-gray-400 font-medium">No applications pending verification.</p>
                                </div>
                            ) : (
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {pendingHotels.map((h, i) => (
                                        <motion.div key={h.hotelId} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                                            className="elite-card p-5 border-amber-100/50 bg-gradient-to-b from-white to-amber-50/10">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-black text-gray-900 text-lg truncate">{h.name}</h3>
                                                    <p className="text-sm text-gray-500 font-medium">{h.address?.city || 'No Location'}, {h.address?.country}</p>
                                                    <p className="text-xs text-gray-400 font-mono mt-1">{h.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                                                <button onClick={() => handleAction(h.hotelId, 'APPROVED')}
                                                    className="flex-1 py-2.5 rounded-xl bg-green-50 text-green-700 hover:bg-green-500 hover:text-white border border-green-200 font-black text-sm flex items-center justify-center gap-1.5 transition-all">
                                                    <CheckCircle className="w-4 h-4" /> Approve
                                                </button>
                                                <button onClick={() => setInspect(h)}
                                                    className="w-11 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 border border-gray-200 flex items-center justify-center transition-all" title="Deep Inspect">
                                                    <Eye className="w-4 h-4 text-gray-500" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* ─── TAB: All Hotels ─────────────────────── */}
                    {activeTab === 'all' && (
                        <motion.div key="all" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="elite-card overflow-x-auto">
                            <table className="w-full min-w-[800px]">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50/50">
                                        {['Property', 'Location', 'Owner', 'Rate / Night', 'Status', 'Actions'].map(col => (
                                            <th key={col} className="text-left px-5 py-3.5 text-xs font-black text-gray-400 uppercase tracking-wider">
                                                {col}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {hotels.map((h, i) => (
                                        <motion.tr key={h.hotelId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                                            className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-5 py-4">
                                                <p className="font-bold text-gray-900 text-sm truncate max-w-[180px]">{h.name}</p>
                                                <p className="text-xs text-gray-400 font-mono">#{h.hotelId}</p>
                                            </td>
                                            <td className="px-5 py-4 text-sm text-gray-600 font-medium">{h.address?.city || '—'}</td>
                                            <td className="px-5 py-4 text-xs text-gray-500 font-medium truncate max-w-[160px]">{h.email || '—'}</td>
                                            <td className="px-5 py-4 text-sm font-black text-gray-900">₹{h.pricePerNight || 0}</td>
                                            <td className="px-5 py-4">
                                                <span className={`text-xs font-black px-2.5 py-1 rounded-lg border ${STATUS_STYLE[h.status] || STATUS_STYLE['REJECTED']}`}>
                                                    {h.status?.replace('_VERIFICATION', '') || 'UNKNOWN'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => setInspect(h)} title="Deep Inspect"
                                                        className="w-8 h-8 rounded-lg bg-purple-50 hover:bg-[var(--tm-ethereal-purple)] hover:text-white text-[var(--tm-ethereal-purple)] border border-purple-100 flex items-center justify-center transition-all">
                                                        <Eye className="w-3.5 h-3.5" />
                                                    </button>
                                                    {h.status !== 'APPROVED' && (
                                                        <button onClick={() => handleAction(h.hotelId, 'APPROVED')} title="Approve"
                                                            className="w-8 h-8 rounded-lg bg-green-50 hover:bg-green-500 hover:text-white text-green-700 border border-green-200 flex items-center justify-center transition-all">
                                                            <CheckCircle className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                    <button onClick={() => handleAction(h.hotelId, 'REJECTED')} title="De-list"
                                                        className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-500 hover:text-white text-red-600 border border-red-100 flex items-center justify-center transition-all">
                                                        <BanIcon className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                            {hotels.length === 0 && (
                                <div className="text-center py-16 text-gray-400 font-medium">No hotels found.</div>
                            )}
                        </motion.div>
                    )}

                    {/* ─── TAB: User Management ────────────────── */}
                    {activeTab === 'users' && (
                        <motion.div key="users" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                            {users.length === 0 ? (
                                <div className="elite-card p-10 text-center">
                                    <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500 font-bold">No users returned from API.</p>
                                </div>
                            ) : (
                                <div className="elite-card overflow-x-auto">
                                    <table className="w-full min-w-[600px]">
                                        <thead>
                                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                                {['User', 'Email', 'User ID', 'Role'].map(col => (
                                                    <th key={col} className="text-left px-5 py-3.5 text-xs font-black text-gray-400 uppercase tracking-wider">{col}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {users.map((u, i) => (
                                                <motion.tr key={u._id || i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                                                    className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-5 py-4">
                                                        <p className="font-bold text-gray-900 text-sm">{u.name || u.username || '—'}</p>
                                                    </td>
                                                    <td className="px-5 py-4 text-sm text-gray-500 font-medium">{u.email || '—'}</td>
                                                    <td className="px-5 py-4 text-xs text-gray-400 font-mono">{u.userId || u._id?.slice(-8) || '—'}</td>
                                                    <td className="px-5 py-4">
                                                        <span className={`text-xs font-black px-2.5 py-1 rounded-lg border ${ROLE_STYLE[u.role] || ROLE_STYLE['USER']}`}>
                                                            {u.role || 'USER'}
                                                        </span>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </motion.div>
                    )}

                </AnimatePresence>
            )}
        </div>

        {/* ── Deep Inspect Drawer ─── */}
        {inspect && (
            <HotelInspectDrawer hotel={inspect} onClose={() => setInspect(null)} onAction={handleAction} />
        )}
        </>
    );
};