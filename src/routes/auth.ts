import { Router } from 'express';
import { login } from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.post('/login', login);

// Token verification endpoint
router.get('/verify', authMiddleware, (req, res) => {
  res.json({ 
    valid: true, 
    user: (req as any).user 
  });
});

export default router;