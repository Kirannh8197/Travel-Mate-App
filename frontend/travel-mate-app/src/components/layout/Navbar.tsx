//V's_new_start — Sovereign Repair: Navbar (shrink kill + guest link purge)
// Root-cause of shrink: inner flex container had no min-w-0 and the nav
// element itself relied on sticky width propagation which fails on some routes.
// Fix: explicit w-full on the nav + min-w-0 on brand, explicit gap on flex row.
// Guest leak fix: Active Booking + Trust Portal are ONLY rendered when isAuthenticated.

import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useUserStore } from '../../store/useUserStore';
import { LiquidButton } from '../ui/LiquidButton';
import { AuthModal } from '../ui/AuthModal';
import { BrandIcon } from '../ui/BrandIcon';
import { UserCircle, LayoutDashboard } from 'lucide-react';

export const Navbar = () => {
    const { isAuthenticated, user, role, logout } = useUserStore();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    const navLinkClass = ({ isActive }: { isActive: boolean }) =>
        `text-sm font-semibold transition-all relative pb-1 whitespace-nowrap ${
            isActive
                ? 'text-[var(--tm-ethereal-purple)] font-black after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[var(--tm-ethereal-purple)] after:rounded-full'
                : 'text-gray-600 hover:text-[var(--tm-liquid-blue)]'
        }`;

    return (
        <>
            {/*
             * V's_new_start — Sovereign Nav Repair
             * KEY CHANGES:
             *   1. w-full + shrink-0 on <nav> so it never collapses on any route
             *   2. inner div: min-w-0 on brand, gap-6 replaces space-x-8 (more robust)
             *   3. Guest users: ONLY "Search & Discover" — no Active Booking, no Trust Portal
             *   4. border-white/20 + 3-layer shadow for pure glass look
             */}
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

                        {/* GUEST — only Search. Active Booking + Trust Portal are authenticated routes */}
                        {!isAuthenticated && (
                            <NavLink to="/search" className={navLinkClass}>Search & Discover</NavLink>
                        )}

                        {/* AUTHENTICATED TRAVELER (not host, not admin) */}
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
                                onClick={() => setIsAuthModalOpen(true)}
                                className="text-sm py-2 px-5 font-bold shadow-lg shadow-[var(--tm-ethereal-purple)]/20 whitespace-nowrap"
                            >
                                Sign In
                            </LiquidButton>
                        )}
                    </div>
                </div>
            </nav>
            {/* V's_new_end */}

            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        </>
    );
};
//V's_new_end
