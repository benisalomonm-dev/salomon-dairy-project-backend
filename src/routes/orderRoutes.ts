import express from 'express';
import {
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  updateOrderStatus,
  assignDriver,
  cancelOrder,
} from '../controllers/orderController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router
  .route('/')
  .get(protect, getOrders)
  .post(protect, authorize('admin', 'manager'), createOrder);

router
  .route('/:id')
  .get(protect, getOrder)
  .put(protect, authorize('admin', 'manager'), updateOrder);

router.patch('/:id/status', protect, updateOrderStatus);
router.patch('/:id/assign-driver', protect, authorize('admin', 'manager'), assignDriver);
router.patch('/:id/cancel', protect, authorize('admin', 'manager'), cancelOrder);

export default router;
