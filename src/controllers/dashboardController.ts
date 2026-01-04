import { Response } from 'express';
import { Op, fn, col } from 'sequelize';
import Order from '../models/Order';
import Product from '../models/Product';
import Client from '../models/Client';
import Batch from '../models/Batch';
import Invoice from '../models/Invoice';
import { AuthRequest } from '../middleware/auth';

// @desc    Get dashboard statistics
// @route   GET /api/v1/dashboard/stats
// @access  Private
export const getDashboardStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    // Total products
    const totalProducts = await Product.count();

    // Low stock products
    const lowStockProducts = await Product.count({
      where: {
        status: { [Op.in]: ['low', 'critical', 'out-of-stock'] },
      },
    });

    // Orders statistics
    const totalOrders = await Order.count();
    const pendingOrders = await Order.count({ where: { status: 'pending' } });
    const todayOrders = await Order.count({
      where: {
        createdAt: { [Op.gte]: today },
      },
    });

    // Revenue statistics - Monthly
    const monthlyRevenueResult = await Order.findOne({
      where: {
        createdAt: { [Op.gte]: thisMonth },
        status: { [Op.ne]: 'cancelled' },
      },
      attributes: [[fn('SUM', col('total')), 'total']],
      raw: true,
    });

    // Revenue statistics - Today
    const todayRevenueResult = await Order.findOne({
      where: {
        createdAt: { [Op.gte]: today },
        status: { [Op.ne]: 'cancelled' },
      },
      attributes: [[fn('SUM', col('total')), 'total']],
      raw: true,
    });

    // Active clients
    const activeClients = await Client.count({ where: { status: 'active' } });

    // Active batches
    const activeBatches = await Batch.count({ where: { status: 'in-progress' } });

    // Today's production (sum of completed batches today)
    const todayProductionResult = await Batch.findOne({
      where: {
        createdAt: { [Op.gte]: today },
        status: 'completed',
      },
      attributes: [[fn('SUM', col('quantity')), 'total']],
      raw: true,
    });

    // Previous day's production for trend calculation
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayProductionResult = await Batch.findOne({
      where: {
        createdAt: { [Op.gte]: yesterday, [Op.lt]: today },
        status: 'completed',
      },
      attributes: [[fn('SUM', col('quantity')), 'total']],
      raw: true,
    });

    // Previous month's revenue for trend calculation
    const lastMonth = new Date(thisMonth);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastMonthRevenueResult = await Order.findOne({
      where: {
        createdAt: { [Op.gte]: lastMonth, [Op.lt]: thisMonth },
        status: { [Op.ne]: 'cancelled' },
      },
      attributes: [[fn('SUM', col('total')), 'total']],
      raw: true,
    });

    // Calculate trends
    const todayProduction = Number((todayProductionResult as any)?.total || 0);
    const yesterdayProduction = Number((yesterdayProductionResult as any)?.total || 0);
    const productionTrend = yesterdayProduction > 0 
      ? ((todayProduction - yesterdayProduction) / yesterdayProduction) * 100 
      : 0;

    const monthlyRevenue = Number((monthlyRevenueResult as any)?.total || 0);
    const lastMonthRevenue = Number((lastMonthRevenueResult as any)?.total || 0);
    const revenueTrend = lastMonthRevenue > 0 
      ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
      : 0;

    // Previous day's pending orders for trend
    const yesterdayPendingOrders = await Order.count({
      where: {
        createdAt: { [Op.gte]: yesterday, [Op.lt]: today },
        status: 'pending',
      },
    });
    const ordersTrend = yesterdayPendingOrders > 0 
      ? ((pendingOrders - yesterdayPendingOrders) / yesterdayPendingOrders) * 100 
      : 0;

    res.status(200).json({
      success: true,
      data: {
        // Main stats for StatCards
        todayProduction: Math.round(todayProduction),
        pendingOrders,
        criticalStock: lowStockProducts,
        monthlyRevenue: Math.round(monthlyRevenue),
        
        // Trends (percentage change)
        productionTrend: Math.round(productionTrend * 10) / 10,
        ordersTrend: Math.round(ordersTrend * 10) / 10,
        revenueTrend: Math.round(revenueTrend * 10) / 10,
        
        // Additional stats (detailed breakdown)
        products: {
          total: totalProducts,
          lowStock: lowStockProducts,
        },
        orders: {
          total: totalOrders,
          pending: pendingOrders,
          today: todayOrders,
        },
        revenue: {
          monthly: Math.round(monthlyRevenue),
          today: Math.round(Number((todayRevenueResult as any)?.total || 0)),
        },
        clients: {
          active: activeClients,
        },
        production: {
          activeBatches,
          today: Math.round(todayProduction),
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get sales report
// @route   GET /api/v1/reports/sales
// @access  Private
export const getSalesReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    // Convert MongoDB query operators to Sequelize
    const whereClause: any = { status: { [Op.ne]: 'cancelled' } };

    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) {
        whereClause.createdAt[Op.gte] = new Date(startDate as string);
      }
      if (endDate) {
        whereClause.createdAt[Op.lte] = new Date(endDate as string);
      }
    }

    // Simplified reporting - get all orders and group in application logic
    // For complex time-series, consider using raw SQL queries
    const orders = await Order.findAll({
      where: whereClause,
      attributes: [
        'id',
        'totalAmount',
        'createdAt',
        'status',
      ],
      order: [['createdAt', 'ASC']],
      raw: true,
    });

    // Group data based on groupBy parameter
    const groupedData = orders.reduce((acc: any, order: any) => {
      const date = new Date(order.createdAt);
      let key: string;

      if (groupBy === 'day') {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      } else if (groupBy === 'month') {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      } else if (groupBy === 'year') {
        key = `${date.getFullYear()}`;
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      if (!acc[key]) {
        acc[key] = {
          _id: key,
          orders: 0,
          revenue: 0,
        };
      }

      acc[key].orders += 1;
      acc[key].revenue += parseFloat(order.totalAmount || 0);

      return acc;
    }, {});

    const salesData = Object.values(groupedData);

    res.status(200).json({
      success: true,
      count: salesData.length,
      data: salesData,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get production report
// @route   GET /api/v1/reports/production
// @access  Private
export const getProductionReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { startDate, endDate, productType } = req.query;

    const whereClause: any = { status: 'completed' };

    if (startDate || endDate) {
      whereClause.startTime = {};
      if (startDate) {
        whereClause.startTime[Op.gte] = new Date(startDate as string);
      }
      if (endDate) {
        whereClause.startTime[Op.lte] = new Date(endDate as string);
      }
    }

    if (productType) {
      whereClause.productType = productType;
    }

    // Get all batches and group by productType
    const batches = await Batch.findAll({
      where: whereClause,
      attributes: ['productType', 'quantity', 'yield'],
      raw: true,
    });

    // Group by productType
    const groupedData = batches.reduce((acc: any, batch: any) => {
      const type = batch.productType || 'Unknown';
      
      if (!acc[type]) {
        acc[type] = {
          _id: type,
          totalBatches: 0,
          totalQuantity: 0,
          totalYield: 0,
          yieldCount: 0,
        };
      }

      acc[type].totalBatches += 1;
      acc[type].totalQuantity += parseFloat(batch.quantity || 0);
      
      if (batch.yield != null) {
        acc[type].totalYield += parseFloat(batch.yield);
        acc[type].yieldCount += 1;
      }

      return acc;
    }, {});

    // Calculate averages and format data
    const productionData = Object.values(groupedData).map((item: any) => ({
      _id: item._id,
      totalBatches: item.totalBatches,
      totalQuantity: item.totalQuantity,
      avgYield: item.yieldCount > 0 ? item.totalYield / item.yieldCount : 0,
    }));

    res.status(200).json({
      success: true,
      count: productionData.length,
      data: productionData,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get inventory report
// @route   GET /api/v1/reports/inventory
// @access  Private
export const getInventoryReport = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Get all products
    const products = await Product.findAll({
      attributes: ['category', 'currentStock', 'unitPrice', 'status'],
      raw: true,
    });

    // Group by category
    const groupedData = products.reduce((acc: any, product: any) => {
      const category = product.category || 'Uncategorized';
      
      if (!acc[category]) {
        acc[category] = {
          _id: category,
          totalProducts: 0,
          totalStock: 0,
          totalValue: 0,
          lowStockCount: 0,
        };
      }

      acc[category].totalProducts += 1;
      acc[category].totalStock += parseFloat(product.currentStock || 0);
      acc[category].totalValue += parseFloat(product.currentStock || 0) * parseFloat(product.unitPrice || 0);
      
      if (['low', 'critical', 'out-of-stock'].includes(product.status)) {
        acc[category].lowStockCount += 1;
      }

      return acc;
    }, {});

    // Convert to array and sort
    const inventoryData = Object.values(groupedData).sort((a: any, b: any) => 
      a._id.localeCompare(b._id)
    );

    res.status(200).json({
      success: true,
      count: inventoryData.length,
      data: inventoryData,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get client report
// @route   GET /api/v1/reports/clients
// @access  Private
export const getClientReport = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Get all clients
    const clients = await Client.findAll({
      attributes: ['type', 'status', 'totalRevenue', 'rating'],
      raw: true,
    });

    // Group by type
    const groupedData = clients.reduce((acc: any, client: any) => {
      const type = client.type || 'Unknown';
      
      if (!acc[type]) {
        acc[type] = {
          _id: type,
          totalClients: 0,
          activeClients: 0,
          totalRevenue: 0,
          totalRating: 0,
          ratingCount: 0,
        };
      }

      acc[type].totalClients += 1;
      
      if (client.status === 'active') {
        acc[type].activeClients += 1;
      }
      
      acc[type].totalRevenue += parseFloat(client.totalRevenue || 0);
      
      if (client.rating != null) {
        acc[type].totalRating += parseFloat(client.rating);
        acc[type].ratingCount += 1;
      }

      return acc;
    }, {});

    // Calculate averages and sort
    const clientData = Object.values(groupedData)
      .map((item: any) => ({
        _id: item._id,
        totalClients: item.totalClients,
        activeClients: item.activeClients,
        totalRevenue: item.totalRevenue,
        avgRating: item.ratingCount > 0 ? item.totalRating / item.ratingCount : 0,
      }))
      .sort((a: any, b: any) => b.totalRevenue - a.totalRevenue);

    // Top clients by revenue
    const topClients = await Client.findAll({
      attributes: ['id', 'name', 'type', 'totalRevenue', 'totalOrders', 'rating'],
      order: [['totalRevenue', 'DESC']],
      limit: 10,
    });

    res.status(200).json({
      success: true,
      data: {
        byType: clientData,
        topClients,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get financial report
// @route   GET /api/v1/reports/financial
// @access  Private (Admin, Manager)
export const getFinancialReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    const whereClause: any = {};

    if (startDate || endDate) {
      whereClause.issueDate = {};
      if (startDate) {
        whereClause.issueDate[Op.gte] = new Date(startDate as string);
      }
      if (endDate) {
        whereClause.issueDate[Op.lte] = new Date(endDate as string);
      }
    }

    // Get all invoices
    const invoices = await Invoice.findAll({
      where: whereClause,
      attributes: ['status', 'total', 'issueDate'],
      raw: true,
    });

    // Group by status
    const statusData = invoices.reduce((acc: any, invoice: any) => {
      const status = invoice.status || 'unknown';
      
      if (!acc[status]) {
        acc[status] = {
          _id: status,
          count: 0,
          total: 0,
        };
      }

      acc[status].count += 1;
      acc[status].total += parseFloat(invoice.total || 0);

      return acc;
    }, {});

    const financialData = Object.values(statusData);

    // Group by month for trend analysis
    const monthlyData = invoices.reduce((acc: any, invoice: any) => {
      const date = new Date(invoice.issueDate);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const key = `${year}-${String(month).padStart(2, '0')}`;
      
      if (!acc[key]) {
        acc[key] = {
          _id: { year, month },
          revenue: 0,
          invoices: 0,
        };
      }

      acc[key].revenue += parseFloat(invoice.total || 0);
      acc[key].invoices += 1;

      return acc;
    }, {});

    // Sort monthly trend
    const monthlyTrend = Object.values(monthlyData).sort((a: any, b: any) => {
      if (a._id.year !== b._id.year) {
        return a._id.year - b._id.year;
      }
      return a._id.month - b._id.month;
    });

    res.status(200).json({
      success: true,
      data: {
        byStatus: financialData,
        monthlyTrend,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};
