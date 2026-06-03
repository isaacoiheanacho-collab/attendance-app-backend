import { Request, Response } from 'express';
import { pool } from '../config/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query(
      'SELECT id, email, password_hash, full_name, last_token FROM admins WHERE email = $1',
      [email]
    );
    if (result.rowCount === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const admin = result.rows[0];
    const match = await bcrypt.compare(password, admin.password_hash);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if already logged in elsewhere
    if (admin.last_token) {
      try {
        jwt.verify(admin.last_token, process.env.JWT_SECRET as string);
        // Token is still valid – reject new login
        return res.status(401).json({ 
          message: 'Admin already logged in on another device. Please log out from there first.' 
        });
      } catch (err) {
        // Token expired or invalid – safe to proceed
        console.log('Previous token expired, allowing new login');
      }
    }

    // Generate new token (30 days expiry for better mobile persistence)
    const token = jwt.sign(
      { id: admin.id, email: admin.email }, 
      process.env.JWT_SECRET as string, 
      { expiresIn: '30d' }
    );

    // Store the new token in the database
    await pool.query(
      'UPDATE admins SET last_token = $1 WHERE id = $2',
      [token, admin.id]
    );

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