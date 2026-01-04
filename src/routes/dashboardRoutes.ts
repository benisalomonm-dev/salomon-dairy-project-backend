import express from 'express';
import {
  getDashboardStats,
  getSalesReport,
  getProductionReport,
  getInventoryReport,
  getClientReport,
  getFinancialReport,
} from '../controllers/dashboardController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// Dashboard
router.get('/dashboard/stats', protect, getDashboardStats);

// Reports
router.get('/reports/sales', protect, getSalesReport);
router.get('/reports/production', protect, getProductionReport);
router.get('/reports/inventory', protect, getInventoryReport);
router.get('/reports/clients', protect, getClientReport);
router.get('/reports/financial', protect, authorize('admin', 'manager'), getFinancialReport);

export default router;
