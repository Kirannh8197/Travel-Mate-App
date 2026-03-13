import { Schema, model, Document, Types } from 'mongoose';
import { Hotel } from './hotelSchema.model'; // ── Import the Hotel model

export interface IReview extends Document {
  reviewId: number;
  user: Types.ObjectId;
  hotel: Types.ObjectId;
  rating: number;
  comment: string;
}

const ReviewSchema = new Schema<IReview>(
  {
    reviewId: { type: Number, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    hotel: { type: Schema.Types.ObjectId, ref: 'Hotel', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

ReviewSchema.index({ hotel: 1, user: 1 }, { unique: true });

// ── STATIC METHOD TO CALCULATE AVERAGE ─────────────────────────────
ReviewSchema.statics.calculateAverageRating = async function(hotelId: Types.ObjectId) {
  const stats = await this.aggregate([
    {
      $match: { hotel: hotelId }
    },
    {
      $group: {
        _id: '$hotel',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  if (stats.length > 0) {
    await Hotel.findByIdAndUpdate(hotelId, {
      averageRating: Math.round(stats[0].avgRating * 10) / 10 // Rounds to 1 decimal place (e.g., 4.5)
    });
  } else {
    await Hotel.findByIdAndUpdate(hotelId, {
      averageRating: 0
    });
  }
};

// ── HOOKS TO TRIGGER CALCULATION ───────────────────────────────────

ReviewSchema.post('save', function() {
  // @ts-ignore
  this.constructor.calculateAverageRating(this.hotel);
});
ReviewSchema.post(/^findOneAnd/, async function(doc) {
  if (doc) {
      // @ts-ignore
      await doc.constructor.calculateAverageRating(doc.hotel);
  }
});

export const Review = model<IReview>('Review', ReviewSchema);