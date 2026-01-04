import express from 'express';
import {
  getInvoices,
  getInvoice,
  createInvoiceFromOrder,
  createInvoice,
  updateInvoice,
  markInvoiceAsPaid,
  deleteInvoice,
  getFinancialSummary,
} from '../controllers/invoiceController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.get('/stats/summary', protect, getFinancialSummary);

router
  .route('/')
  .get(protect, getInvoices)
  .post(protect, authorize('admin', 'manager'), createInvoice);

router.post('/from-order/:orderId', protect, authorize('admin', 'manager'), createInvoiceFromOrder);

router
  .route('/:id')
  .get(protect, getInvoice)
  .put(protect, authorize('admin', 'manager'), updateInvoice)
  .delete(protect, authorize('admin'), deleteInvoice);

router.patch('/:id/pay', protect, authorize('admin', 'manager'), markInvoiceAsPaid);

export default router;
