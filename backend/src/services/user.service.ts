import { User } from "../models/userSchema.model";
import bcrypt from "bcryptjs";



 // Get All Users
 
export const getAllUsers = async () => {
  return await User.find().select("-password");
};
/** 
 * Create user
*/

export const createUser = async (data: any) => {
  if (!data) {
    throw new Error("User data is required");
  }
  const existingUser = await User.findOne({ email: data.email });
  if (existingUser) {
    throw new Error("Email already exists");
  }
  const hashedPassword = await bcrypt.hash(data.password, 10);
  const user = await User.create({...data,password: hashedPassword,});
  const { password, ...userWithoutPassword } = user.toObject();
  return userWithoutPassword;
};


// login here

export const loginUser = async (email: string, password: string) => {
  const user = await User.findOne({ email });
  console.log("Login email:", email);

  if (!user) {
    throw new Error("User not found");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  const { password: _, ...userWithoutPassword } = user.toObject();
  return userWithoutPassword;
};

 export const updateUserById = async (userId: number, data: any) => {
  if (isNaN(userId)) {
    throw new Error("Invalid User ID");
  }

  // 1. If the user is trying to update their password, hash the new one!
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }

  // 2. Update the user
  const updatedUser = await User.findOneAndUpdate(
    { userId: userId },   
    { $set: data },      
    { 
        new: true, 
        runValidators: true // Ensures schema rules (like Enum roles) are enforced
    }        
  ).select('-password'); // Hide the new password from the response payload

  if (!updatedUser) {
    throw new Error("User not found");
  }

  return updatedUser;
};

/**
 * Get User By ID
 */
export const getUserById = async (userId: number) => {
  const user = await User.findOne({ userId }).select('-password');
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};