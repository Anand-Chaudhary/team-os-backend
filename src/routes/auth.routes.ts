import { Router } from 'express'

import { loginClient } from '../controllers/clientAuth.controller';
import { register, login, logout, getMe, changePassword } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router()

router.post('/register', register)
router.post('/login', login)
router.post('/logout', logout)
router.get('/me', requireAuth, getMe);
router.post('/client/login', loginClient)
router.post('/change-password', requireAuth, changePassword)

export default router
