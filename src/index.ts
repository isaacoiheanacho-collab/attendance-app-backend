import express from "express";
import dotenv from "dotenv";
import cors from "cors";                    // ✅ CORS added

import authRoutes from "./routes/auth";
import memberRoutes from "./routes/members";
import attendanceRoutes from "./routes/attendance";

dotenv.config();

const app = express();

// ------------------------------
// CORS configuration
// ------------------------------
const allowedOrigins = [
  "http://localhost:5173",                      // Vite dev (local)
  "http://localhost:3000",                      // alternative dev port
  "https://sayitloudclub-2026.netlify.app"      // your live frontend
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`Blocked by CORS: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,        // if you ever use cookies/sessions
}));

// Middleware
app.use(express.json());

// Serve uploaded images (if any are stored locally – though you use Cloudinary)
app.use("/uploads", express.static("uploads"));

// Health check
app.get("/", (_req, res) => {
  res.send("Attendance API is running");
});

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/members", memberRoutes);
app.use("/api/v1/attendance", attendanceRoutes);

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});