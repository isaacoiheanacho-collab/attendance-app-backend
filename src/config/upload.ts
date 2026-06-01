import multer from "multer";

// Use memory storage (no local file)
const storage = multer.memoryStorage();

export const upload = multer({ storage });