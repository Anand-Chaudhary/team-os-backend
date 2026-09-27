import { Router } from 'express';
import {
  createClientReview,
  listPendingReviews,
  addClientReview,
  getReviewsForPost,
} from '../controllers/clientReview.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();
router.use(requireAuth);

// Employee creates a new post for client review (media upload information)
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(process.cwd(), 'uploads');
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${file.originalname}`;
    cb(null, unique);
  },
});

const upload = multer({ storage });

router.post('/', upload.single('media'), createClientReview);

// Employee fetches posts awaiting client review (optionally filter by clientId via query)
router.get('/', listPendingReviews);

// Client submits feedback / change request for a specific post (max 3 requests)
router.post('/:id/review', addClientReview);

// Employee retrieves all client feedback entries for a post
router.get('/:id/reviews', getReviewsForPost);

export default router;
