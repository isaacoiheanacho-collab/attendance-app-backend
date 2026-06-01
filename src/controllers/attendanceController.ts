import { Request, Response } from "express";
import { pool } from "../config/db";

// -----------------------------
// MARK ATTENDANCE (you already have this)
// -----------------------------
export const markAttendance = async (req: Request, res: Response) => {
  try {
    const { member_id, device_id, photo_verified } = req.body;
    const admin_id = (req as any).user.id;

    const result = await pool.query(
      `INSERT INTO attendance (member_id, admin_id, device_id, photo_verified)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [member_id, admin_id, device_id || null, photo_verified ?? true]
    );

    return res.json(result.rows[0]);
  } catch (err) {
    console.error("Attendance insert error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// -----------------------------
// GET ATTENDANCE (NEW)
// -----------------------------
export const getAttendance = async (req: Request, res: Response) => {
  try {
    const { date, name } = req.query;

    const filters: string[] = [];
    const values: any[] = [];

    // Filter by date
    if (date) {
      values.push(date);
      filters.push(`DATE(a.event_timestamp) = $${values.length}`);
    }

    // Filter by member full name (case-insensitive partial match)
    if (name) {
      values.push(`%${name}%`);
      filters.push(`LOWER(m.full_name) LIKE LOWER($${values.length})`);
    }

    const whereClause = filters.length > 0 ? `WHERE ${filters.join(" AND ")}` : "";

    const query = `
      SELECT 
        a.id,
        a.event_timestamp,
        a.device_id,
        a.photo_verified,
        m.id AS member_id,
        m.reg_number,
        m.full_name AS member_name,
        ad.id AS admin_id,
        ad.full_name AS admin_name
      FROM attendance a
      JOIN members m ON a.member_id = m.id
      JOIN admins ad ON a.admin_id = ad.id
      ${whereClause}
      ORDER BY a.event_timestamp DESC
    `;

    const result = await pool.query(query, values);

    return res.json({
      count: result.rowCount,
      records: result.rows,
    });
  } catch (err) {
    console.error("Attendance query error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
