import { Schema, model, Document } from 'mongoose';

export interface IHotel extends Document {
  hotelId: number;
  name: string;
  email: string;
  password: string;
  description?: string;
  address?: {
    city?: string;
    state?: string;
    country?: string;
  };
  location?: {
    type: 'Point';
    coordinates: number[];
  };
  pricePerNight?: number;
  amenities?: string[];
  images?: string[];
  averageRating?: number;
  status: 'PENDING_VERIFICATION' | 'APPROVED' | 'REJECTED';
}

const HotelSchema = new Schema<IHotel>(
  {
    hotelId: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },

    description: { type: String, default: '' },

    address: {
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      country: { type: String, default: '' }
    },

    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }
    },

    pricePerNight: { type: Number, default: 0 },

    amenities: [{ type: String }],

    images: {
      type: [String],
      default: []
    },

    averageRating: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ['PENDING_VERIFICATION', 'APPROVED', 'REJECTED'],
      default: 'PENDING_VERIFICATION'
    }
  },
  { timestamps: true }
);

HotelSchema.index({ location: '2dsphere' });

export const Hotel = model<IHotel>('Hotel', HotelSchema);