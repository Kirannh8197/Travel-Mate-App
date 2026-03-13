import express from "express";
import path from "path";
import cors from "cors";
import hotelRoutes from "./routes/hotelRoutes.routes";
import bookingRoutes from "./routes/hotelBookingRoutes.route"
import userRegRoutes from "./routes/userRoutes.routes"
import authRoutes from "./routes/authRoutes.routes"
import cabBookingRoutes from "./routes/cabBookingRoutes.routes";
import reviewRoutes from "./routes/reviewRoutes.route";
const app = express();

app.use(express.json());
app.use(cors());

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRegRoutes);
app.use("/api/hotel", hotelRoutes);
app.use("/api/bookings", bookingRoutes)
app.use("/api/cabs", cabBookingRoutes);
app.use("/api/reviews", reviewRoutes);


export default app;