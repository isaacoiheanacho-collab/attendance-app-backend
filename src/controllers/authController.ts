import { Request, Response } from 'express';
import { pool } from '../config/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query(
      'SELECT id, email, password_hash, full_name FROM admins WHERE email = $1',
      [email]
    );
    if (result.rowCount === 0) return res.status(401).json({ message: 'Invalid credentials' });

    const admin = result.rows[0];
    const match = await bcrypt.compare(password, admin.password_hash);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: admin.id, email: admin.email }, process.env.JWT_SECRET as string, {
      expiresIn: '8h',
    });

    res.json({
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        full_name: admin.full_name,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
