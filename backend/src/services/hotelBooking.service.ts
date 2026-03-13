import { Types } from "mongoose";
import { Booking } from "../models/hotelBookingSchema.model";
import { Hotel } from "../models/hotelSchema.model";
import { User } from "../models/userSchema.model";
/**
 * Create Booking Of Hotel.
 */
export const createBooking = async (
  userId: string,
  hotelId: string,
  checkInDate: string,
  checkOutDate: string,
  roomTypeId?: string
) => {
  // 1. Resolve User ID (Handles both MongoDB _id and custom numeric userId)
  let userObjectId: Types.ObjectId;
  if (Types.ObjectId.isValid(userId)) {
    userObjectId = new Types.ObjectId(userId);
  } else {
    const numericUserId = parseInt(userId, 10);
    if (isNaN(numericUserId)) throw new Error("Invalid User ID format");
    const userRecord = await User.findOne({ userId: numericUserId });
    if (!userRecord) throw new Error("User not found");
    userObjectId = userRecord._id as Types.ObjectId;
  }

  // 2. Resolve Hotel ID & Fetch Hotel details (Handles both MongoDB _id and custom numeric hotelId)
  let hotelObjectId: Types.ObjectId;
  let hotel;
  if (Types.ObjectId.isValid(hotelId)) {
    hotel = await Hotel.findById(hotelId);
  } else {
    const numericHotelId = parseInt(hotelId, 10);
    if (isNaN(numericHotelId)) throw new Error("Invalid Hotel ID format");
    hotel = await Hotel.findOne({ hotelId: numericHotelId });
  }

  if (!hotel) {
    throw new Error("Hotel not found");
  }
  hotelObjectId = hotel._id as Types.ObjectId;

  // 3. Validate Dates
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  if (checkOut <= checkIn) {
    throw new Error("Check-out date must be after check-in date");
  }

  // 4. Calculate Pricing
  const diffTime = checkOut.getTime() - checkIn.getTime();
  const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const totalAmount = totalDays * (hotel.pricePerNight ?? 0);

  // 5. Create Booking using the resolved MongoDB ObjectIds
  const booking = await Booking.create({
    user: userObjectId,
    hotel: hotelObjectId,
    roomType: roomTypeId,
    checkInDate: checkIn,
    checkOutDate: checkOut,
    totalAmount,
    status: "PENDING",
  });

  return booking;
};

/**
 * Get All Bookings of a User
 */
export const getBookingsByUser = async (userId: string) => {
  let userObjectId: Types.ObjectId;
  
  if (Types.ObjectId.isValid(userId)) {
    userObjectId = new Types.ObjectId(userId);
  } else {
    const numericUserId = parseInt(userId, 10);
    if (isNaN(numericUserId)) throw new Error("Invalid User ID format");
    const userRecord = await User.findOne({ userId: numericUserId });
    if (!userRecord) throw new Error("User not found");
    userObjectId = userRecord._id as Types.ObjectId;
  }

  return await Booking.find({ user: userObjectId })
    .populate("hotel")
    .sort({ createdAt: -1 });
};

/**
 * Get All Bookings of a Hotel (Admin / Host use)
 */
export const getBookingsByHotel = async (hotelId: string) => {
  let hotelObjectId: Types.ObjectId;
  
  if (Types.ObjectId.isValid(hotelId)) {
    hotelObjectId = new Types.ObjectId(hotelId);
  } else {
    const numericHotelId = parseInt(hotelId, 10);
    if (isNaN(numericHotelId)) throw new Error("Invalid Hotel ID format");
    const hotelRecord = await Hotel.findOne({ hotelId: numericHotelId });
    if (!hotelRecord) throw new Error("Hotel not found");
    hotelObjectId = hotelRecord._id as Types.ObjectId;
  }

  return await Booking.find({ hotel: hotelObjectId })
    .populate("user")
    .sort({ createdAt: -1 });
};

/**
 * Cancel Booking (Uses Booking _id)
 */
export const cancelBooking = async (bookingId: string) => {
  if (!Types.ObjectId.isValid(bookingId)) throw new Error("Invalid Booking ID");
  
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new Error("Booking not found");
  if (booking.status === "CANCELLED") throw new Error("Booking already cancelled");

  booking.status = "CANCELLED";
  await booking.save();

  return booking;
};

/**
 * Check-In Booking (Uses Booking _id)
 */
export const checkInBooking = async (bookingId: string) => {
  if (!Types.ObjectId.isValid(bookingId)) throw new Error("Invalid Booking ID");
  
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new Error("Booking not found");
  if (booking.status !== "CONFIRMED") throw new Error("Only confirmed bookings can be checked into");
  if (booking.isCheckedIn) throw new Error("Booking is already checked in");

  booking.isCheckedIn = true;
  await booking.save();
  
  return booking;
};

/**
 * Check-Out Booking (Uses Booking _id)
 */
export const checkOutBooking = async (bookingId: string) => {
  if (!Types.ObjectId.isValid(bookingId)) throw new Error("Invalid Booking ID");
  
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new Error("Booking not found");
  if (!booking.isCheckedIn) throw new Error("Cannot check out before checking in");
  if (booking.isCheckedOut) throw new Error("Booking is already checked out");

  booking.isCheckedOut = true;
  booking.status = "COMPLETED";
  await booking.save();
  
  return booking;
};

/**
 * Confirm Booking (Payment Success) (Uses Booking _id)
 */
export const confirmBooking = async (bookingId: string) => {
  if (!Types.ObjectId.isValid(bookingId)) throw new Error("Invalid Booking ID");
  
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new Error("Booking not found");
  if (booking.status !== "PENDING") throw new Error("Only pending bookings can be confirmed");
  
  booking.status = "CONFIRMED";
  await booking.save();
  
  return booking;
};

/**
 * Complete Booking (optional - admin/system) (Uses Booking _id)
 */
export const completeBooking = async (bookingId: string) => {
  if (!Types.ObjectId.isValid(bookingId)) throw new Error("Invalid Booking ID");
  
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new Error("Booking not found");
  if (booking.status !== "CONFIRMED") throw new Error("Only confirmed bookings can be completed");
  
  booking.status = "COMPLETED";
  await booking.save();
  
  return booking;
};