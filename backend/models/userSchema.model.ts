import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  userId: Number
  name: string;
  email: string;
  password: string; 
  role: 'CUSTOMER' | 'ADMIN';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    userId: {type: Number, required: true, unique:true},
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['CUSTOMER', 'ADMIN'], default: 'CUSTOMER' },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt
);

export const User = model<IUser>('User', UserSchema);