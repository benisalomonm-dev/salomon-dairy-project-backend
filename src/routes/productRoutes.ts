import express from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
  getLowStockProducts,
} from '../controllers/productController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.get('/alerts/low-stock', protect, getLowStockProducts);

router
  .route('/')
  .get(protect, getProducts)
  .post(protect, authorize('admin', 'manager'), createProduct);

router
  .route('/:id')
  .get(protect, getProduct)
  .put(protect, authorize('admin', 'manager'), updateProduct)
  .delete(protect, authorize('admin'), deleteProduct);

router.patch('/:id/stock', protect, authorize('admin', 'manager', 'operator'), updateStock);

export default router;
