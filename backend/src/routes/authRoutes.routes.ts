import express, { Request, Response } from "express";
import { getAllUsers, createUser, updateUserById } from "../services/user.service";
import { authorizeRole } from "../middleware/role.middleware";
import { authenticateUserOrHotel } from "../services/auth.service"
 
const router = express.Router();

/**
 * Get All Users (ADMIN ONLY)
 * GET /api/users/
 */
router.get("/", authorizeRole(["ADMIN"]), async (req: Request, res: Response) => {
    try {
        const users = await getAllUsers();
        res.status(200).json({ users });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * Register a New User
 * POST /api/users/
 */
router.post("/", async (req: Request, res: Response) => {
    try {
        const user = await createUser(req.body);

        res.status(201).json({
            message: "User created successfully",
            data: user,
        });

    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

/**
 * Universal Login Endpoint
 * POST /api/auth/login
 */
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        
        // Pass the credentials to your new service
        const result = await authenticateUserOrHotel(email, password);

        return res.status(200).json({
            message: "Login successful",
            data: result.data,
            role: result.role
        });

    } catch (error: any) {
        // Return a 400 if missing data, otherwise 401 Unauthorized for bad passwords/emails
        const statusCode = error.message === "Email and password are required" ? 400 : 401;
        return res.status(statusCode).json({ message: error.message });
    }
});

/**
 * Update User Profile
 * PUT /api/users/:id
 */
router.put("/:id", async (req: Request, res: Response) => {
    try {
        const paramId = Number(req.params.id);
        const headerUserId = Number(req.headers.userid);

        // Security check: Ensure the header is present
        if (!headerUserId) {
            return res.status(401).json({ message: "UserId header required" });
        }

        // Security check: Ensure users can only update their own profiles
        if (paramId !== headerUserId) {
            return res.status(403).json({ message: "You can update only your own profile" });
        }

        const updatedUser = await updateUserById(paramId, req.body);

        res.status(200).json({
            message: "User updated successfully",
            data: updatedUser,
        });

    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

export default router;