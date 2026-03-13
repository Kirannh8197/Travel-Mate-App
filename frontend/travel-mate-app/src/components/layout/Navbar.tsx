import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useUserStore } from '../../store/useUserStore';
import { LiquidButton } from '../ui/LiquidButton';
import { BrandIcon } from '../ui/BrandIcon';
import { UserCircle, LayoutDashboard } from 'lucide-react';

export const Navbar = () => {
    const { isAuthenticated, user, role, logout } = useUserStore();
    const navigate = useNavigate();

    const navLinkClass = ({ isActive }: { isActive: boolean }) =>
        `text-sm font-semibold transition-all relative pb-1 whitespace-nowrap ${
            isActive
                ? 'text-[var(--tm-ethereal-purple)] font-black after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[var(--tm-ethereal-purple)] after:rounded-full'
                : 'text-gray-600 hover:text-[var(--tm-liquid-blue)]'
        }`;

    return (
        <nav className="sticky top-0 z-50 w-full shrink-0 bg-white/70 backdrop-blur-3xl border-b border-white/20 shadow-[inset_0_-1px_0_0_rgba(255,255,255,0.4),0_4px_24px_-6px_rgba(0,0,0,0.07)]">
            <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-3.5 flex items-center justify-between gap-4">

                {/* ── Brand ─────────────────────────────── */}
                <div className="flex items-center gap-2.5 shrink-0">
                    <BrandIcon size={34} />
                    <Link
                        to="/"
                        className="text-xl font-serif font-black tracking-tight text-gray-900 hover:text-[var(--tm-ethereal-purple)] transition-colors whitespace-nowrap"
                    >
                        TravelMate
                    </Link>
                </div>

                {/* ── Nav Links ─────────────────────────── */}
                <div className="hidden md:flex items-center gap-7">
                    {/* HOST links */}
                    {role === 'HOTEL_HOST' && (
                        <>
                            <NavLink to="/dashboard" className={navLinkClass}>My Listings</NavLink>
                            <NavLink to="/review"    className={navLinkClass}>Reviews</NavLink>
                        </>
                    )}

                    {/* ADMIN links */}
                    {role === 'ADMIN' && (
                        <NavLink to="/dashboard" className={navLinkClass}>
                            <span className="flex items-center gap-1.5">
                                <LayoutDashboard className="w-3.5 h-3.5" /> Admin Panel
                            </span>
                        </NavLink>
                    )}

                    {/* GUEST */}
                    {!isAuthenticated && (
                        <NavLink to="/search" className={navLinkClass}>Search & Discover</NavLink>
                    )}

                    {/* AUTHENTICATED TRAVELER */}
                    {isAuthenticated && role !== 'HOTEL_HOST' && role !== 'ADMIN' && (
                        <>
                            <NavLink to="/search"  className={navLinkClass}>Search & Discover</NavLink>
                            <NavLink to="/booking" className={navLinkClass}>Active Booking</NavLink>
                            <NavLink to="/review"  className={navLinkClass}>Trust Portal</NavLink>
                        </>
                    )}

                    {/* Dashboard shortcut for any authenticated user */}
                    {isAuthenticated && (
                        <Link
                            to="/dashboard"
                            className="text-sm font-bold text-[var(--tm-ethereal-purple)] hover:text-[var(--tm-deep-indigo)] transition-all flex items-center gap-1 whitespace-nowrap"
                        >
                            <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
                        </Link>
                    )}
                </div>

                {/* ── Auth Controls ─────────────────────── */}
                <div className="shrink-0">
                    {isAuthenticated ? (
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 text-sm font-bold text-gray-700 whitespace-nowrap">
                                <UserCircle className="w-4.5 h-4.5 text-[var(--tm-liquid-blue)]" />
                                <span>
                                    {role === 'ADMIN' ? 'Admin' : user?.name?.split(' ')[0] || 'Traveler'}
                                </span>
                            </div>
                            <button
                                onClick={() => logout()}
                                className="px-3 py-1.5 rounded-lg text-red-500 hover:bg-red-50 font-bold text-sm transition-colors border border-transparent hover:border-red-400/30 whitespace-nowrap"
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <LiquidButton
                            variant="primary"
                            onClick={() => navigate('/login')}
                            className="text-sm py-2 px-5 font-bold shadow-lg shadow-[var(--tm-ethereal-purple)]/20 whitespace-nowrap"
                        >
                            Sign In
                        </LiquidButton>
                    )}
                </div>
            </div>
        </nav>
    );
};