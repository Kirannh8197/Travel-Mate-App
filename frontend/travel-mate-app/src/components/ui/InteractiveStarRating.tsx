import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

interface InteractiveStarRatingProps {
    rating: number;
    setRating: (rating: number) => void;
    editable?: boolean;
}

export const InteractiveStarRating: React.FC<InteractiveStarRatingProps> = ({ rating, setRating, editable = true }) => {
    const [hoverRating, setHoverRating] = useState(0);

    const activeRating = hoverRating || rating; // use hover preview, fall back to committed rating

    return (
        <div
            className="flex gap-2 items-center"
            onMouseLeave={() => editable && setHoverRating(0)}
        >
            {[1, 2, 3, 4, 5].map((index) => {
                const filled = activeRating >= index;
                return (
                    <motion.button
                        key={index}
                        type="button"
                        onClick={() => editable && setRating(index)}
                        onMouseEnter={() => editable && setHoverRating(index)}
                        whileHover={editable ? { scale: 1.25, rotate: 5 } : {}}
                        whileTap={editable ? { scale: 0.85 } : {}}
                        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                        className={`relative focus:outline-none ${editable ? 'cursor-pointer' : 'cursor-default'}`}
                        aria-label={`Rate ${index} star${index > 1 ? 's' : ''}`}
                    >
                        {/* Base (empty) star — always rendered */}
                        <Star className="w-9 h-9 text-white/30 transition-colors duration-150" />

                        {/* Filled star — overlaid, toggled via opacity (no AnimatePresence mount/unmount glitch) */}
                        <span
                            className="absolute inset-0 flex items-center justify-center transition-all duration-150"
                            style={{
                                opacity: filled ? 1 : 0,
                                transform: filled ? 'scale(1)' : 'scale(0.6)',
                            }}
                        >
                            <Star className="w-9 h-9 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.7)]" />
                        </span>
                    </motion.button>
                );
            })}
        </div>
    );
};
//V's_new_end
