import express, { Request, Response } from 'express';
import * as reviewService from '../services/review.service';

const router = express.Router();

// POST - Create a new review
router.post("/", async (req: Request, res: Response) => {
    try {
        const review = await reviewService.createReview(req.body);
        res.status(201).json({ message: "Review added successfully", data: review });
    } catch (err: any) {
        if (err.code === 11000) {
            // Check if it's the duplicate reviewId OR the duplicate user/hotel combo
            if (err.keyPattern && err.keyPattern.reviewId) {
                return res.status(400).json({ message: "A review with this reviewId already exists." });
            }
            return res.status(400).json({ message: "You have already reviewed this hotel." });
        }
        res.status(500).json({ message: err.message });
    }
});

// GET - All reviews for a specific hotel 
router.get("/hotel/:hotelId", async (req: Request, res: Response) => {
    try {
        const hotelId = Number(req.params.hotelId);
        
        const reviews = await reviewService.getReviewsByHotel(hotelId);
        res.status(200).json({ count: reviews.length, data: reviews });
    } catch (err: any) {
        if (err.message === "Invalid Hotel ID" || err.message === "Hotel not found") {
            return res.status(404).json({ message: err.message });
        }
        res.status(500).json({ message: err.message });
    }
});
// GET - Single review by custom reviewId
router.get("/:id", async (req: Request, res: Response) => {
    try {
        const reviewId = Number(req.params.id);
        const review = await reviewService.getReviewByReviewId(reviewId);
        res.status(200).json({ data: review });
    } catch (err: any) {
        if (err.message === "Review not found" || err.message === "Invalid Review ID") {
            return res.status(404).json({ message: err.message });
        }
        res.status(500).json({ message: err.message });
    }
});

// PUT - Update a review by custom reviewId
router.put("/:id", async (req: Request, res: Response) => {
    try {
        const reviewId = Number(req.params.id);
        const updatedReview = await reviewService.updateReviewByReviewId(reviewId, req.body);
        res.status(200).json({ message: "Review updated successfully", data: updatedReview });
    } catch (err: any) {
        if (err.message === "Review not found" || err.message === "Invalid Review ID") {
            return res.status(404).json({ message: err.message });
        }
        res.status(500).json({ message: err.message });
    }
});

// DELETE - Remove a review by custom reviewId
router.delete("/:id", async (req: Request, res: Response) => {
    try {
        const reviewId = Number(req.params.id);
        await reviewService.deleteReviewByReviewId(reviewId);
        res.status(200).json({ message: "Review deleted successfully" });
    } catch (err: any) {
        if (err.message === "Review not found" || err.message === "Invalid Review ID") {
            return res.status(404).json({ message: err.message });
        }
        res.status(500).json({ message: err.message });
    }
});

export default router;