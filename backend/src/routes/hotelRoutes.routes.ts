import express, { Request, Response } from 'express';
import multer from 'multer'; // <-- Import standard multer
import * as hotelService from '../services/hotel.service';
import { authorizeRole } from '../middleware/role.middleware'; 
import { upload } from '../middleware/upload.middleware'; // Keep this for secure update routes

const router = express.Router();

// ── FIX: Create a Public Upload instance ──
// This strictly parses FormData WITHOUT checking for the userid header!
const publicStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const publicUpload = multer({ storage: publicStorage });

/**
 * Register a New Hotel (Host)
 * POST /api/hotel/
 */
router.post("/", publicUpload.array('images', 10), async (req: Request, res: Response) => {
    try {
        const hotelData = { ...req.body };

        // SAFELY parse JSON strings. If they are missing (like in quick registration), skip them!
        if (hotelData.address && typeof hotelData.address === 'string') {
            hotelData.address = JSON.parse(hotelData.address);
        }
        if (hotelData.location && typeof hotelData.location === 'string') {
            hotelData.location = JSON.parse(hotelData.location);
        }
        if (hotelData.amenities && typeof hotelData.amenities === 'string') {
            hotelData.amenities = JSON.parse(hotelData.amenities);
        }

        if (req.files && Array.isArray(req.files)) {
            const imageUrls = req.files.map((file: any) => `/uploads/${file.filename}`);
            hotelData.images = imageUrls;
        }

        const createdHotel = await hotelService.createHotel(hotelData);
        res.status(201).json({ message: "Hotel registered successfully", data: createdHotel });

    } catch (err: any) {
        if (err.code === 11000) {
            return res.status(400).json({ message: "A hotel with this ID or email already exists." });
        }
        res.status(500).json({ message: err.message });
    }
});

/**
 * Get All Hotels (ADMIN ONLY)
 * GET /api/hotel/
 */
router.get("/", authorizeRole(["ADMIN"]), async (req: Request, res: Response) => {
    try {
        const hotels = await hotelService.getAllHotelsAdmin();
        res.status(200).json({ data: hotels });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * Get Approved Hotels
 * GET /api/hotel/approved
 */
router.get("/approved", async (req: Request, res: Response) => {
    try {
        const { maxPrice, amenities } = req.query;
        const query: any = { status: 'APPROVED' };
        
        if (maxPrice) query.pricePerNight = { $lte: parseFloat(maxPrice as string) };
        if (amenities) query.amenities = { $all: (amenities as string).split(',').map(a => a.trim()) };
        
        const hotels = await hotelService.Hotel.find(query).select('-password');
        res.status(200).json({ count: hotels.length, data: hotels });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * Get Nearby Hotels
 * GET /api/hotel/nearby
 */
router.get("/nearby", async (req: Request, res: Response) => {
    try {
        const lng = parseFloat(req.query.lng as string);
        const lat = parseFloat(req.query.lat as string);
        const distance = req.query.distance ? parseInt(req.query.distance as string) : 10000;

        const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined;
        const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined;

        let amenities: string[] = [];
        if (req.query.amenities) {
            amenities = (req.query.amenities as string).split(',').map(a => a.trim());
        }

        const options = { minPrice, maxPrice, amenities };

        if (isNaN(lng) || isNaN(lat)) {
            return res.status(400).json({ message: "Valid longitude (lng) and latitude (lat) are required." });
        }

        const hotels = await hotelService.getHotelsNearLocation(lng, lat, distance, options);
        res.status(200).json({ count: hotels.length, data: hotels });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * Get Hotel By ID
 * GET /api/hotel/:id
 */
router.get("/:id", async (req: Request, res: Response) => {
    try {
        const idParam = req.params.id;
        const { Types } = require('mongoose');
        
        let hotel;
        // Supports both MongoDB Object IDs and Custom Numeric IDs seamlessly
        if (Types.ObjectId.isValid(idParam)) {
            hotel = await hotelService.Hotel.findById(idParam).select('-password');
        } else {
            const hotelId = Number(idParam);
            hotel = await hotelService.getHotelByHotelId(hotelId);
        }
        
        if (!hotel) return res.status(404).json({ message: "Hotel not found" });
        res.status(200).json({ data: hotel });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * Update Hotel By ID
 * PUT /api/hotel/:id
 */
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

/**
 * Edit Hotel Details (Multipart Form Data)
 * PATCH /api/hotel/:id/edit
 * Notice we use your strict `upload` middleware here because the user IS logged in!
 */
router.patch("/:id/edit", (req: Request, res: Response) => {
    upload.array('images', 10)(req, res, async (err) => {
        if (err) return res.status(400).json({ message: `Upload error: ${err.message}` });
        try {
            const idParam = req.params.id;
            const updates: any = {};
            if (req.body.name) updates.name = req.body.name;
            if (req.body.description) updates.description = req.body.description;
            if (req.body.pricePerNight) updates.pricePerNight = parseFloat(req.body.pricePerNight);
            
            if (req.body.amenities) {
                updates.amenities = typeof req.body.amenities === 'string'
                    ? JSON.parse(req.body.amenities) : req.body.amenities;
            }
          
            if (req.files && Array.isArray(req.files) && req.files.length > 0) {
                updates.images = req.files.map((file: any) => `/uploads/${file.filename}`);
            }

            let updated;
            const { Types } = require('mongoose');
            if (Types.ObjectId.isValid(idParam)) {
                updated = await hotelService.Hotel.findByIdAndUpdate(idParam, { $set: updates }, { new: true });
            } else {
                const hotelId = Number(idParam);
                if (isNaN(hotelId)) return res.status(400).json({ message: 'Invalid hotel ID' });
                updated = await hotelService.Hotel.findOneAndUpdate({ hotelId }, { $set: updates }, { new: true });
            }
            if (!updated) return res.status(404).json({ message: 'Hotel not found' });
            
            res.status(200).json({ message: 'Hotel updated successfully', data: updated });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    });
});

/**
 * Delete Hotel
 * DELETE /api/hotel/:id
 */
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

/**
 * Approve Hotel (Admin)
 * PATCH /api/hotel/:id/approve
 */
router.patch("/:id/approve", authorizeRole(["ADMIN"]), async (req: Request, res: Response) => {
    try {
        const hotelId = Number(req.params.id);
        const updatedHotel = await hotelService.updateHotelStatus(hotelId, 'APPROVED');
        res.status(200).json({ message: "Hotel approved successfully", data: updatedHotel });
    } catch (error: any) {
        if (error.message === "Hotel not found" || error.message === "Invalid Hotel ID") {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
});

/**
 * Reject Hotel (Admin)
 * PATCH /api/hotel/:id/reject
 */
router.patch("/:id/reject", authorizeRole(["ADMIN"]), async (req: Request, res: Response) => {
    try {
        const hotelId = Number(req.params.id);
        const updatedHotel = await hotelService.updateHotelStatus(hotelId, 'REJECTED');
        res.status(200).json({ message: "Hotel rejected successfully", data: updatedHotel });
    } catch (error: any) {
        if (error.message === "Hotel not found" || error.message === "Invalid Hotel ID") {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
});



export default router;