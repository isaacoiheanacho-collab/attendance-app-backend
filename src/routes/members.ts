import { Router } from "express";
import { getMemberByRegNumber, uploadMemberPhoto } from "../controllers/memberController";
import { authMiddleware } from "../middleware/authMiddleware";
import { upload } from "../config/upload";

const router = Router();

// Get member by reg number
router.get("/:reg_number", authMiddleware, getMemberByRegNumber);

// Upload member photo
router.post("/:id/photo", authMiddleware, upload.single("photo"), uploadMemberPhoto);

export default router;
