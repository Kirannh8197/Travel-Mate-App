import bcrypt from "bcryptjs";
import { User } from "../models/userSchema.model";
import { Types } from "mongoose";

/**
 * Get All Users
 */
export const getAllUsers = async () => {
  return await User.find().select('-password');
};

// /**
//  * Get User By custom userId
//  */
// export const getUserByUserId = async (userId: number) => {
//   if (isNaN(userId)) {
//     throw new Error("Invalid User ID");
//   }

//   // Changed from findById to findOne
//   const user = await User.findOne({ userId }).select('-password');

//   if (!user) {
//     throw new Error("User not found");
//   }

//   return user;
// };

// /**
//  * Create User
//  */
// export const createUser = async (data: any) => {
//   if (!data) {
//     throw new Error("User data is required");
//   }

//   // Hash the password before saving
//   if (data.password) {
//     const salt = await bcrypt.genSalt(10);
//     data.password = await bcrypt.hash(data.password, salt);
//   }

//   const user = await User.create(data);
  
//   const { password: removedPassword, ...userWithoutPassword } = user.toObject();
  
//   return userWithoutPassword;
// };

// /**
//  * Update User By custom userId
//  */
// export const updateUserByUserId = async (userId: number, data: any) => {
//   if (isNaN(userId)) {
//     throw new Error("Invalid User ID");
//   }

//   if (data.password) {
//     const salt = await bcrypt.genSalt(10);
//     data.password = await bcrypt.hash(data.password, salt);
//   }

//   // Changed from findByIdAndUpdate to findOneAndUpdate
//   const updatedUser = await User.findOneAndUpdate(
//     { userId: userId }, // Search by your custom userId field
//     data,
//     {
//       new: true,
//       runValidators: true,
//     }
//   ).select('-password');

//   if (!updatedUser) {
//     throw new Error("User not found");
//   }

//   return updatedUser;
// };

// /**
//  * Delete User by custom userId
//  */
// export const deleteUserByUserId = async (userId: number) => {
//   if (isNaN(userId)) {
//     throw new Error("Invalid User ID");
//   }

//   // Changed from findByIdAndDelete to findOneAndDelete
//   const deletedUser = await User.findOneAndDelete({ userId: userId });

//   if (!deletedUser) {
//     throw new Error("User not found");
//   }

//   return deletedUser;
// };

export const createUser = async (data: any) => {
  if (!data) {
    throw new Error("User data is required");
  }

  const existingUser = await User.findOne({ email: data.email });
  if (existingUser) {
    throw new Error("Email already exists");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await User.create({...data,password: hashedPassword,});

  return user;
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

  return user;
};

 // Update User 
 
export const updateUserById = async (id: string, data: any) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new Error("Invalid User ID");
  }

  const updatedUser = await User.findByIdAndUpdate(
    id,
    data,
    {
      new: true,
      runValidators: true,
    }
  );  

  if (!updatedUser) {
    throw new Error("User not found");
  }

  return updatedUser;
};

// Get User By ID
 
export const getUserById = async (id: string) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new Error("Invalid User ID");
  }

  const user = await User.findById(id);

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

// Delete User

export const deleteUserById = async (id: string) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new Error("Invalid User ID");
  }

  const deletedUser = await User.findByIdAndDelete(id);

  if (!deletedUser) {
    throw new Error("User not found");
  }

  return deletedUser;
};