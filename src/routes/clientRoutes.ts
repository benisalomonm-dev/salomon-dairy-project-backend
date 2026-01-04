import express from 'express';
import {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
  getClientStats,
} from '../controllers/clientController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router
  .route('/')
  .get(protect, getClients)
  .post(protect, authorize('admin', 'manager'), createClient);

router
  .route('/:id')
  .get(protect, getClient)
  .put(protect, authorize('admin', 'manager'), updateClient)
  .delete(protect, authorize('admin'), deleteClient);

router.get('/:id/stats', protect, getClientStats);

export default router;
