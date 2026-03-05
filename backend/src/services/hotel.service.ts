import { Hotel } from "../models/hotelSchema.model";

/**
 * Get All Hotels
 */
export const getAllHotels = async () => {
  return await Hotel.find();
};

/**
 * Get Hotel By custom hotelId
 */
export const getHotelByHotelId = async (hotelId: number) => {
  if (isNaN(hotelId)) {
    throw new Error("Invalid Hotel ID");
  }

  const hotel = await Hotel.findOne({ hotelId });

  if (!hotel) {
    throw new Error("Hotel not found");
  }

  return hotel;
};

/**
 * Create a new Hotel
 */
export const createHotel = async (data: any) => {
  if (!data || !data.images || data.images.length < 3) {
    throw new Error("Hotel data is incomplete. At least 3 images are required.");
  }

  const hotel = await Hotel.create(data);
  return hotel;
};

/**
 * Update Hotel By custom hotelId
 */
export const updateHotelByHotelId = async (hotelId: number, data: any) => {
  if (isNaN(hotelId)) {
    throw new Error("Invalid Hotel ID");
  }

  const updatedHotel = await Hotel.findOneAndUpdate(
    { hotelId: hotelId },
    data,
    { new: true, runValidators: true }
  );

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
 * Find Hotels Near a Specific Location (GeoSpatial Search)
 * @param lng Longitude
 * @param lat Latitude
 * @param maxDistance In meters (e.g., 10000 for 10km)
 */
export const getHotelsNearLocation = async (lng: number, lat: number, maxDistance: number = 10000) => {
  const hotels = await Hotel.find({
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [lng, lat]
        },
        $maxDistance: maxDistance
      }
    }
  });

  return hotels;
};