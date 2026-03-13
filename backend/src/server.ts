import dotenv from "dotenv";
import connectDb from "./config/db.config";
import app from "./app";

dotenv.config();

const PORT = process.env.PORT || 1234;

connectDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
});