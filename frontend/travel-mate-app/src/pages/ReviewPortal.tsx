import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useUserStore } from '../store/useUserStore';
import { InteractiveStarRating } from '../components/ui/InteractiveStarRating';
import { ArrowLeft, Trash2, Loader2, CheckCircle } from 'lucide-react';
import { reviewService } from '../services/review.service'; 

export const ReviewPortal = () => {
    const { user, role } = useUserStore();
    const location = useLocation();
    
    const hotelId = location.state?.hotelId;
    const hotelName = location.state?.hotelName || "this hotel";

    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [status, setStatus] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [existingReviewId, setExistingReviewId] = useState<number | null>(null);

    const fetchExistingReview = async () => {
        if (!hotelId || !user || role === 'HOTEL_HOST') {
            setIsLoading(false);
            return;
        }
        try {
            const response = await reviewService.getReviewsByHotel(hotelId);
            const allReviews = response.data || [];
            const myReview = allReviews.find((r: any) => 
                r.user === (user?._id) || r.user?._id === (user?._id)
            );

            if (myReview) {
                setExistingReviewId(myReview.reviewId);
                setRating(myReview.rating);
                setComment(myReview.comment);
            }
        } catch (err) {
            console.error("Error checking review:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchExistingReview(); }, [hotelId, user, role]);

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setStatus(null);
        try {
            await reviewService.createReview({
                reviewId: Math.floor(Math.random() * 1000000),
                userId: user?.userId || user?._id,
                hotelId: hotelId,
                rating,
                comment,
            });
            setStatus('✓ Review submitted successfully!');
            await fetchExistingReview();
        } catch (err: any) {
            setStatus(`Error: ${err.response?.data?.message || err.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteReview = async () => {
        if (!existingReviewId || !window.confirm("Delete this review?")) return;
        setSubmitting(true);
        try {
            await reviewService.deleteReview(existingReviewId);
            setStatus('✓ Review deleted.');
            setExistingReviewId(null);
            setComment('');
            setRating(5);
        } catch (err: any) {
            setStatus(`Error: ${err.response?.data?.message || err.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-[var(--tm-ethereal-purple)]" /></div>;

    return (
        <div className="elite-container min-h-screen pt-24 pb-12">
            <div className="max-w-4xl mx-auto px-4">
                <Link to="/dashboard" className="flex items-center gap-2 text-gray-500 hover:text-[var(--tm-ethereal-purple)] font-bold mb-6 transition-colors w-fit">
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </Link>

                <div className="mb-10">
                    <p className="text-xs font-black uppercase tracking-[0.25em] text-[var(--tm-ethereal-purple)] mb-2">
                        {existingReviewId ? 'Your Verified Feedback' : 'Verified Feedback'}
                    </p>
                    <h1 className="elite-section-title text-5xl text-gray-900 mb-3 tracking-tighter">Trust Portal</h1>
                    <p className="text-gray-500 font-medium text-lg">
                        {existingReviewId ? `Authenticated review for ` : `Share your authenticated experience for `}
                        <strong>{hotelName}</strong>.
                    </p>
                </div>

                <div className="elite-card p-8 md:p-10 relative overflow-hidden bg-white shadow-2xl">
                    {existingReviewId && (
                        <div className="absolute top-0 right-0">
                            <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-4 py-2 rounded-bl-2xl font-black text-[10px] border-l border-b border-green-100 shadow-sm">
                                <CheckCircle className="w-3 h-3" /> VERIFIED
                            </div>
                        </div>
                    )}

                    {status && (
                        <div className={`p-4 rounded-xl mb-8 text-sm font-bold border ${status.startsWith('Error') ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-700 border-green-100'}`}>
                            {status}
                        </div>
                    )}

                    <form onSubmit={handleSubmitReview} className="space-y-8">
                        {/* Rating Panel - Fixed Height to prevent jumping */}
                        <div className={`bg-gradient-to-br from-[var(--tm-deep-indigo)] to-[var(--tm-ethereal-purple)] p-10 rounded-3xl flex flex-col items-center justify-center shadow-xl transition-all duration-500 min-h-[200px] ${existingReviewId ? 'opacity-90 grayscale-[0.2]' : ''}`}>
                            <div className={existingReviewId ? 'pointer-events-none' : ''}>
                                <InteractiveStarRating rating={rating} setRating={setRating} />
                            </div>
                            <p className="text-white/60 text-xs font-black uppercase tracking-widest mt-5">
                                {rating === 5 ? 'Exceptional' : rating === 4 ? 'Great' : rating === 3 ? 'Satisfactory' : 'Needs Work'}
                            </p>
                        </div>

                        {/* Comment Area - Fixed Size */}
                        <div className="space-y-3">
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">The Experience</label>
                            <textarea
                                value={comment}
                                onChange={e => setComment(e.target.value)}
                                readOnly={!!existingReviewId}
                                placeholder="Describe the ambiance and service..."
                                className={`w-full min-h-[160px] p-5 rounded-2xl text-gray-900 border-2 outline-none transition-all resize-none font-medium leading-relaxed ${
                                    existingReviewId 
                                    ? 'bg-gray-50 border-gray-100 text-gray-500 cursor-not-allowed shadow-inner' 
                                    : 'bg-white border-gray-100 focus:border-[var(--tm-ethereal-purple)] focus:ring-4 focus:ring-purple-50 shadow-sm'
                                }`}
                            />
                        </div>

                        {/* Action Button - Maintains same height/width */}
                        {existingReviewId ? (
                            <button
                                type="button"
                                onClick={handleDeleteReview}
                                disabled={submitting}
                                className="w-full py-4 rounded-2xl font-black text-white text-base shadow-xl flex justify-center items-center gap-2 transition-all active:scale-[0.98] bg-red-500 hover:bg-red-600 shadow-red-200"
                            >
                                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Trash2 className="w-5 h-5" /> Remove Review</>}
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={submitting || !comment.trim()}
                                className="w-full py-4 rounded-2xl font-black text-white text-base shadow-xl flex justify-center items-center gap-2 transition-all active:scale-[0.98] shadow-purple-200"
                                style={{ background: 'linear-gradient(135deg, var(--tm-deep-indigo), var(--tm-ethereal-purple))' }}
                            >
                                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Verified Review'}
                            </button>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};