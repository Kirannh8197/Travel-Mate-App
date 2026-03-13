import bcrypt from "bcryptjs";
import { User } from "../models/userSchema.model";
import { Hotel } from "../models/hotelSchema.model";

/**
 * Authenticate either a User (USER/ADMIN) or a Hotel Owner (HOTEL_HOST)
 */
export const authenticateUserOrHotel = async (email: string, passwordText: string) => {
    if (!email || !passwordText) {
        throw new Error("Email and password are required");
    }

    const hotel = await Hotel.findOne({ email });
    if (hotel) {
        const isMatch = await bcrypt.compare(passwordText, hotel.password);
        if (!isMatch) throw new Error("Invalid credentials");

        const { password, ...hotelWithoutPassword } = hotel.toObject();
        return { 
            data: hotelWithoutPassword, 
            role: "HOTEL_HOST" 
        };
    }

    const user = await User.findOne({ email });
    if (user) {
        const isMatch = await bcrypt.compare(passwordText, user.password);
        if (!isMatch) throw new Error("Invalid credentials");

        const { password, ...userWithoutPassword } = user.toObject();
        return { 
            data: userWithoutPassword, 
            role: user.role // Pulls "USER" or "ADMIN" from the database
        };
    }

    throw new Error("Invalid credentials");
};