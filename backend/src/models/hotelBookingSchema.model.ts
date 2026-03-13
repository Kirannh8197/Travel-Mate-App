import { Schema, model, Document, Types } from 'mongoose';

export interface IBooking extends Document {
  user: Types.ObjectId;
  hotel: Types.ObjectId;
  checkInDate: Date;
  checkOutDate: Date;
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  roomType?: Types.ObjectId; 
  isCheckedIn: boolean; 
  isCheckedOut: boolean;  
}

const BookingSchema = new Schema<IBooking>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    hotel: { type: Schema.Types.ObjectId, ref: 'Hotel', required: true },
    roomType: { type: Schema.Types.ObjectId, ref: 'RoomType', required: false },
    checkInDate: { type: Date, required: true },
    checkOutDate: { type: Date, required: true },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'],
      default: 'PENDING'
    },
    isCheckedIn: {type: Boolean, default:false },
    isCheckedOut: {type: Boolean, default: false},
  },
  { timestamps: true }
);

BookingSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 900, partialFilterExpression: { status: 'PENDING' } }
);
export const Booking = model<IBooking>('Booking', BookingSchema);

