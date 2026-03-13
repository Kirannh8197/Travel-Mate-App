import { Router, Request, Response } from "express";
import {
  createBooking,
  getBookingsByUser,
  getBookingsByHotel,
  cancelBooking,
  completeBooking,
  confirmBooking,
  checkInBooking,
  checkOutBooking
} from "../services/hotelBooking.service";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    const { userId, hotelId, checkInDate, checkOutDate, roomTypeId } = req.body;
    const booking = await createBooking(userId, hotelId, checkInDate, checkOutDate, roomTypeId);
    res.status(201).json(booking);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/user/:userId", async (req: Request<{ userId: string }>, res: Response) => {
  try {
    const { userId } = req.params;
    const bookings = await getBookingsByUser(userId);
    res.status(200).json(bookings);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/hotel/:hotelId", async (req: Request<{ hotelId: string }>, res: Response) => {
  try {
    const { hotelId } = req.params;
    const bookings = await getBookingsByHotel(hotelId);
    res.status(200).json(bookings);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.patch("/:bookingId/checkin", async (req: Request<{ bookingId: string }>, res: Response) => {
  try {
    const { bookingId } = req.params;
    const booking = await checkInBooking(bookingId);
    res.status(200).json(booking);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.patch("/:bookingId/checkout", async (req: Request<{ bookingId: string }>, res: Response) => {
  try {
    const { bookingId } = req.params;
    const booking = await checkOutBooking(bookingId);
    res.status(200).json(booking);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.patch("/:bookingId/confirm", async (req: Request<{ bookingId: string }>, res: Response) => {
  try {
    const { bookingId } = req.params;
    const booking = await confirmBooking(bookingId);
    res.status(200).json(booking);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.patch("/:bookingId/cancel", async (req: Request<{ bookingId: string }>, res: Response) => {
  try {
    const { bookingId } = req.params;
    const booking = await cancelBooking(bookingId);
    res.status(200).json(booking);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.patch("/:bookingId/complete", async (req: Request<{ bookingId: string }>, res: Response) => {
  try {
    const { bookingId } = req.params;
    const booking = await completeBooking(bookingId);
    res.status(200).json(booking);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

export default router;