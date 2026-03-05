import { Request, Response, NextFunction } from "express";
import { User } from "../models/userSchema.model";

export const authorizeRole = (allowedRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = Number(req.headers.userid);

      if (!userId) {
        return res.status(401).json({ message: "UserId header required" });
      }

      const user = await User.findOne({ userId });

      if (!user || !allowedRoles.includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      next();
    } catch (error) {
      return res.status(500).json({ message: "Authorization failed" });
    }
  };
};