import { Schema, model, Document, Types } from 'mongoose';

export interface IReview extends Document {
  reviewId: number; 
  user: Types.ObjectId; // Still expects MongoDB _id to link correctly
  hotel: Types.ObjectId; // Still expects MongoDB _id to link correctly
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

// Prevent a user from leaving multiple reviews for the same hotel
ReviewSchema.index({ hotel: 1, user: 1 }, { unique: true });

export const Review = model<IReview>('Review', ReviewSchema);