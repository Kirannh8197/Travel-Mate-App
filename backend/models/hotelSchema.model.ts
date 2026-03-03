import { Schema, model, Document } from 'mongoose';

export interface IHotel extends Document {
  name: string;
  description: string;
  address: {
    city: string;
    state: string;
    country: string;
  };
  location: {
    type: 'Point';
    coordinates: number[]; // [longitude, latitude]
  };
  pricePerNight: number;
  amenities: string[];
  averageRating: number;
}

const HotelSchema = new Schema<IHotel>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    address: {
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
    },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point', required: true },
      coordinates: { type: [Number], required: true },
    },
    pricePerNight: { type: Number, required: true },
    amenities: [{ type: String }],
    averageRating: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// This index makes geospatial queries (like $near) incredibly fast
HotelSchema.index({ location: '2dsphere' });

export const Hotel = model<IHotel>('Hotel', HotelSchema);