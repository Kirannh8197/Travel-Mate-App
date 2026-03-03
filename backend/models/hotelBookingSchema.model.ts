import { Schema, model, Document, Types } from 'mongoose';

export interface IBooking extends Document {
  user: Types.ObjectId;
  hotel: Types.ObjectId;
  checkInDate: Date;
  checkOutDate: Date;
  totalAmount: number;
  status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
}

const BookingSchema = new Schema<IBooking>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    hotel: { type: Schema.Types.ObjectId, ref: 'Hotel', required: true },
    checkInDate: { type: Date, required: true },
    checkOutDate: { type: Date, required: true },
    totalAmount: { type: Number, required: true },
    status: { 
      type: String, 
      enum: ['CONFIRMED', 'CANCELLED', 'COMPLETED'], 
      default: 'CONFIRMED' 
    },
  },
  { timestamps: true }
);

export const Booking = model<IBooking>('Booking', BookingSchema);