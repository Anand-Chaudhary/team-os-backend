import { Router } from 'express';
import { createSalarySlip, getSalarySlip } from '../controllers/salarySlip.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

// Protect all salary slip endpoints
router.use(requireAuth);

// POST /salary-slips – generate a new salary slip PDF
router.post('/', createSalarySlip);

// GET /salary-slips/:id – retrieve a salary slip PDF for the logged‑in user
router.get('/:id', getSalarySlip);

export default router;
