import { Request, Response } from "express";
import { pool } from "../config/db";
import cloudinary from "../config/cloudinary";

export const getMemberByRegNumber = async (req: Request, res: Response) => {
  try {
    const { reg_number } = req.params;
    const result = await pool.query(
      `SELECT * FROM members WHERE reg_number = $1`,
      [reg_number]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Member not found" });
    }
    return res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const uploadMemberPhoto = async (req: Request, res: Response) => {
  try {
    const memberId = req.params.id;
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Convert buffer to base64 data URI
    const base64 = req.file.buffer.toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${base64}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: `members/${memberId}`,
      public_id: `${Date.now()}`,
      transformation: [{ width: 400, height: 400, crop: "fill" }],
    });

    const photoUrl = result.secure_url;

    // Update database
    await pool.query(
      `UPDATE members SET profile_photo_url = $1 WHERE id = $2`,
      [photoUrl, memberId]
    );

    return res.json({
      message: "Photo uploaded successfully",
      photo_url: photoUrl,
    });
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    return res.status(500).json({ message: "Upload failed" });
  }
};