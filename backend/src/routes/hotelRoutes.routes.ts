import express, { Request, Response } from 'express';
import * as hotelService from '../services/hotel.service';
import { authorizeRole } from '../middleware/role.middleware'; // Keep this if you use it

const router = express.Router();

// POST - Register a new hotel
router.post("/register", async (req: Request, res: Response) => {
    try {
        const createdHotel = await hotelService.createHotel(req.body);
        res.status(201).json({ message: "Hotel registered successfully", data: createdHotel });
    } catch (err: any) {
        if (err.code === 11000) {
             return res.status(400).json({ message: "A hotel with this hotelId or email already exists." });
        }
        res.status(500).json({ message: err.message });
    }
});

// POST - Login for Hotel Owners
router.post("/login", async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const hotel = await hotelService.loginHotel(email, password);
        
        // Note: In a real app, you would generate and return a JWT token here
        res.status(200).json({ message: "Login successful", data: hotel });
    } catch (error: any) {
        if (error.message === "Invalid credentials" || error.message === "Email and password are required") {
            return res.status(401).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
});

// GET - All Hotels
router.get("/", authorizeRole(["ADMIN"]), async (req: Request, res: Response) => {
    try {
        const hotels = await hotelService.getAllHotels();
        res.status(200).json({ data: hotels });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// GET - Hotels near a location
router.get("/nearby", async (req: Request, res: Response) => {
    try {
        const lng = parseFloat(req.query.lng as string);
        const lat = parseFloat(req.query.lat as string);
        const distance = req.query.distance ? parseInt(req.query.distance as string) : 10000;

        if (isNaN(lng) || isNaN(lat)) {
            return res.status(400).json({ message: "Valid longitude (lng) and latitude (lat) are required." });
        }

        const hotels = await hotelService.getHotelsNearLocation(lng, lat, distance);
        res.status(200).json({ count: hotels.length, data: hotels });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// GET - Single Hotel by custom hotelId
router.get("/:id", async (req: Request, res: Response) => {
    try {
        const hotelId = Number(req.params.id);
        const hotel = await hotelService.getHotelByHotelId(hotelId);
        res.status(200).json({ data: hotel });
    } catch (error: any) {
        if (error.message === "Hotel not found" || error.message === "Invalid Hotel ID") {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
});

// PUT - Update a hotel by custom hotelId
router.put("/:id", async (req: Request, res: Response) => {
    try {
        const hotelId = Number(req.params.id);
        const updatedHotel = await hotelService.updateHotelByHotelId(hotelId, req.body);
        res.status(200).json({ message: "Hotel updated successfully", data: updatedHotel });
    } catch (err: any) {
        if (err.message === "Hotel not found" || err.message === "Invalid Hotel ID") {
            return res.status(404).json({ message: err.message });
        }
        res.status(500).json({ message: err.message });
    }
});

// DELETE - Remove a hotel by custom hotelId
router.delete("/:id", async (req: Request, res: Response) => {
    try {
        const hotelId = Number(req.params.id);
        await hotelService.deleteHotelByHotelId(hotelId);
        res.status(200).json({ message: "Hotel deleted successfully" });
    } catch (error: any) {
        if (error.message === "Hotel not found" || error.message === "Invalid Hotel ID") {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
});

export default router;