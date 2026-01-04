import express from 'express';
import {
  getBatches,
  getBatch,
  createBatch,
  updateBatch,
  completeBatch,
  updateQualityChecks,
  deleteBatch,
} from '../controllers/batchController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router
  .route('/')
  .get(protect, getBatches)
  .post(protect, authorize('admin', 'manager', 'operator'), createBatch);

router
  .route('/:id')
  .get(protect, getBatch)
  .put(protect, authorize('admin', 'manager', 'operator'), updateBatch)
  .delete(protect, authorize('admin'), deleteBatch);

router.patch('/:id/complete', protect, authorize('admin', 'manager', 'operator'), completeBatch);
router.patch('/:id/quality-checks', protect, authorize('admin', 'manager', 'operator'), updateQualityChecks);

export default router;
