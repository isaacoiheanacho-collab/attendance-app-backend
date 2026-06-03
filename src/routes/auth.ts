import { Router } from 'express';
import { login } from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware';
import { pool } from '../config/db';

const router = Router();

router.post('/login', login);

// Token verification endpoint
router.get('/verify', authMiddleware, (req, res) => {
  res.json({ 
    valid: true, 
    user: (req as any).user 
  });
});

// Logout endpoint – clear the stored token
router.post('/logout', authMiddleware, async (req, res) => {
  const adminId = (req as any).user.id;
  try {
    await pool.query('UPDATE admins SET last_token = NULL WHERE id = $1', [adminId]);
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ message: 'Server error during logout' });
  }
});

export default router;