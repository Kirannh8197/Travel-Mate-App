import express from "express";
import { getAllUsers, createUser, updateUserById, loginUser } from "../services/user.service";
import { authorizeRole } from "../middleware/role.middleware";
const router = express.Router();

//Get ADMIN ONLY
router.get("/", authorizeRole(["ADMIN"]), async (req, res) => {
    try {
        const users = await getAllUsers();
        res.status(200).json({ users });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}
);

// Register User
router.post("/", async (req, res) => {
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

// Login User
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await loginUser(email, password);

        res.status(200).json({
            message: "Login successful",
            userId: user.userId,
            role: user.role
        });

    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

// update
router.put("/:id", async (req, res) => {
    try {
        const paramId = Number(req.params.id);
        const headerUserId = Number(req.headers.userid);

        if (!headerUserId) {
            return res.status(401).json({ message: "UserId header required" });
        }


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