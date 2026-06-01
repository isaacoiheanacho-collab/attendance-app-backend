import { Router } from "express";
import { markAttendance, getAttendance } from "../controllers/attendanceController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

// Mark attendance
router.post("/", authMiddleware, markAttendance);

// Query attendance
router.get("/", authMiddleware, getAttendance);

export default router;
