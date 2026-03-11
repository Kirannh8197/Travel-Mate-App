//V's_new_start — Sovereign Repair: ReviewPortal
// Fixes: (1) max-w-4xl centering (was drifting left), (2) Host role guard (Hosts cannot self-review),
// (3) Star rating contrast fix (gradient background behind stars so they're always visible).

import React, { useState } from 'react';
import { useUserStore } from '../store/useUserStore';
import { InteractiveStarRating } from '../components/ui/InteractiveStarRating';
import { ShieldAlert } from 'lucide-react';

export const ReviewPortal = () => {
    const { isAuthenticated, user, role } = useUserStore();
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [status, setStatus] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const hotelId = "6650"; // Custom numeric ID used by backend

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAuthenticated) { setStatus('Error: You must be logged in.'); return; }
        if (role === 'HOTEL_HOST') { setStatus('Error: Hosts cannot submit reviews.'); return; }

        setSubmitting(true);
        try {
            const response = await fetch(`http://localhost:5000/api/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reviewId: Math.floor(Math.random() * 100000),
                    userId: user?.userId || "6650",
                    hotelId,
                    rating,
                    comment,
                }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Review failed');
            setStatus('✓ Review submitted successfully! Thank you for your feedback.');
            setComment('');
            setRating(5);
        } catch (err: any) {
            setStatus(`Error: ${err.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        // Old: <div className="elite-container min-h-screen"> (was drifting left, card too narrow)
        <div className="elite-container min-h-screen">
            {/* Strict max-w-4xl centering — mathematically centered */}
            <div className="max-w-4xl mx-auto">

                {/* Page Header */}
                <div className="mb-10">
                    <p className="text-xs font-black uppercase tracking-[0.25em] text-[var(--tm-ethereal-purple)] mb-2">
                        Verified Feedback
                    </p>
                    <h1 className="elite-section-title text-5xl text-gray-900 mb-3">Trust Portal</h1>
                    <p className="text-gray-500 font-medium text-lg">Share your authenticated experience.</p>
                </div>

                {/* ── HOST BARRIER — V's_new_start ──────────────── */}
                {role === 'HOTEL_HOST' ? (
                    <div className="elite-card p-10 text-center">
                        <div className="w-16 h-16 bg-amber-50 rounded-2xl border border-amber-100 flex items-center justify-center mx-auto mb-5 shadow-md">
                            <ShieldAlert className="w-8 h-8 text-amber-500" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-2">View-Only Mode</h2>
                        <p className="text-gray-500 font-medium max-w-sm mx-auto">
                            As a Hotel Host, you cannot submit reviews. This prevents conflicts of interest
                            and maintains the integrity of our Trust System.
                        </p>
                        <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm font-bold">
                            <ShieldAlert className="w-4 h-4" /> Host Review Restriction Active
                        </div>
                    </div>
                ) : (
                /* ── TRAVELER / GUEST REVIEW FORM ─────────────── */
                    <div className="elite-card p-8 md:p-10">

                        {/* Status Message */}
                        {status && (
                            <div className={`p-4 rounded-xl mb-6 text-sm font-bold shadow-sm ${
                                status.startsWith('Error')
                                    ? 'bg-red-50 text-red-600 border border-red-100'
                                    : 'bg-green-50 text-green-700 border border-green-100'
                            }`}>
                                {status}
                            </div>
                        )}

                        {!isAuthenticated ? (
                            <div className="p-6 bg-yellow-50 border border-yellow-100 text-yellow-800 rounded-2xl font-medium text-center">
                                Please sign in to submit a verified review.
                            </div>
                        ) : (
                            <form onSubmit={handleSubmitReview} className="space-y-7">
                                {/*
                                 * Star Rating Panel — dark gradient bg ensures stars are ALWAYS visible.
                                 * Root-cause of invisible stars: InteractiveStarRating renders yellow stars
                                 * on a white-on-white background when the card bg is #fff. The contrast fix
                                 * is the deep purple/indigo gradient, not adding a stroke.
                                 */}
                                <div className="bg-gradient-to-br from-[var(--tm-deep-indigo)] to-[var(--tm-ethereal-purple)] p-8 rounded-2xl flex flex-col items-center shadow-xl shadow-[var(--tm-ethereal-purple)]/20">
                                    <p className="text-white/70 text-xs font-black uppercase tracking-[0.25em] mb-5">
                                        Your Rating
                                    </p>
                                    <InteractiveStarRating rating={rating} setRating={setRating} />
                                    <p className="text-white/60 text-sm font-medium mt-4">
                                        {rating === 5 ? 'Exceptional Experience' : rating === 4 ? 'Great Stay' : rating === 3 ? 'Satisfactory' : rating === 2 ? 'Below Expectations' : 'Needs Improvement'}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2.5 ml-0.5">
                                        Your Experience
                                    </label>
                                    <textarea
                                        value={comment}
                                        onChange={e => setComment(e.target.value)}
                                        placeholder="Describe your stay in detail — the ambiance, service, and what made it memorable..."
                                        className="w-full bg-white border-2 border-gray-100 p-4 rounded-2xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[var(--tm-ethereal-purple)] focus:ring-4 focus:ring-[var(--tm-ethereal-purple)]/10 transition-all shadow-sm resize-none"
                                        rows={5}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting || !comment.trim()}
                                    className="w-full py-4 rounded-2xl font-black text-white text-base shadow-xl shadow-[var(--tm-ethereal-purple)]/25 hover:shadow-[var(--tm-ethereal-purple)]/40 transform hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                                    style={{ background: 'linear-gradient(135deg, var(--tm-deep-indigo), var(--tm-ethereal-purple))' }}
                                >
                                    {submitting ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Submitting…
                                        </span>
                                    ) : 'Submit Verified Review'}
                                </button>

                                <p className="text-center text-xs text-gray-400 font-medium">
                                    Only guests with a completed booking can submit a verified review.
                                    Your review is immutable once submitted.
                                </p>
                            </form>
                        )}
                        {/*
                         * [x] Host role barrier active — hosts redirected to View-Only mode
                         * [x] Backend trust check — backend blocks if no COMPLETED booking
                         */}
                    </div>
                )}
                {/* ── HOST BARRIER — V's_new_end ────────────────── */}
            </div>
        </div>
    );
};
//V's_new_end
