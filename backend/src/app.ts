import express from "express";
import cors from "cors";
import hotelRoutes from "./routes/hotelRoutes.routes";
import bookingRoutes from "./routes/hotelBookingRoutes.route"
import userRegRoutes from "./routes/userRoutes.routes"
const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/users",userRegRoutes);
app.use("/api/hotel", hotelRoutes);
app.use("/api/bookings",bookingRoutes)


export default app;