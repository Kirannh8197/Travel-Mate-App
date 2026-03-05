import bcrypt from "bcryptjs";
import { Hotel } from "../models/hotelSchema.model";

/**
 * Get All Hotels (Hides passwords)
 */
export const getAllHotels = async () => {
  return await Hotel.find().select('-password');
};

/**
 * Get Hotel By custom hotelId (Hides passwords)
 */
export const getHotelByHotelId = async (hotelId: number) => {
  if (isNaN(hotelId)) {
    throw new Error("Invalid Hotel ID");
  }

  const hotel = await Hotel.findOne({ hotelId }).select('-password');

  if (!hotel) {
    throw new Error("Hotel not found");
  }

  return hotel;
};

/**
 * Register / Create a new Hotel
 */
export const createHotel = async (data: any) => {
  if (!data || !data.images || data.images.length < 3) {
    throw new Error("Hotel data is incomplete. At least 3 images are required.");
  }
  if (!data.email || !data.password) {
    throw new Error("Email and password are required for registration.");
  }

  // Hash the password before saving
  const salt = await bcrypt.genSalt(10);
  data.password = await bcrypt.hash(data.password, salt);

  const hotel = await Hotel.create(data);
  
  // Remove password before returning
  const { password, ...hotelWithoutPassword } = hotel.toObject();
  return hotelWithoutPassword;
};

/**
 * Login a Hotel
 */
export const loginHotel = async (email: string, passwordText: string) => {
  if (!email || !passwordText) {
    throw new Error("Email and password are required");
  }

  // Find the hotel by email
  const hotel = await Hotel.findOne({ email });
  if (!hotel) {
    throw new Error("Invalid credentials"); // Use a generic error for security
  }

  // Compare the provided password with the hashed password in the database
  const isMatch = await bcrypt.compare(passwordText, hotel.password);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  // Remove password before returning
  const { password, ...hotelWithoutPassword } = hotel.toObject();
  return hotelWithoutPassword;
};

/**
 * Update Hotel By custom hotelId
 */
export const updateHotelByHotelId = async (hotelId: number, data: any) => {
  if (isNaN(hotelId)) {
    throw new Error("Invalid Hotel ID");
  }

  // If the hotel is trying to update their password, hash the new one
  if (data.password) {
    const salt = await bcrypt.genSalt(10);
    data.password = await bcrypt.hash(data.password, salt);
  }

  const updatedHotel = await Hotel.findOneAndUpdate(
    { hotelId: hotelId },
    data,
    { new: true, runValidators: true }
  ).select('-password');

  if (!updatedHotel) {
    throw new Error("Hotel not found");
  }

  return updatedHotel;
};

/**
 * Delete Hotel by custom hotelId
 */
export const deleteHotelByHotelId = async (hotelId: number) => {
  if (isNaN(hotelId)) {
    throw new Error("Invalid Hotel ID");
  }
  const deletedHotel = await Hotel.findOneAndDelete({ hotelId: hotelId });
  if (!deletedHotel) {
    throw new Error("Hotel not found");
  }
  return deletedHotel;
};

/**
 * Find Hotels Near a Specific Location
 */
export const getHotelsNearLocation = async (lng: number, lat: number, maxDistance: number = 10000) => {
  const hotels = await Hotel.find({
    location: {
      $near: {
        $geometry: { type: "Point", coordinates: [lng, lat] },
        $maxDistance: maxDistance
      }
    }
  }).select('-password');

  return hotels;
};