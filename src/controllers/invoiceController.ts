import { Response } from 'express';
import Invoice from '../models/Invoice.mongo';
import Order from '../models/Order.mongo';
import Client from '../models/Client.mongo';
import { AuthRequest } from '../middleware/auth';

// @desc    Get all invoices
// @route   GET /api/v1/invoices
// @access  Private
export const getInvoices = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, clientId, startDate, endDate } = req.query;
    
    let query: any = {};
    
    if (status) {
      query.status = status;
    }
    
    if (clientId) {
      query.clientId = clientId;
    }
    
    if (startDate || endDate) {
      query.issueDate = {};
      if (startDate) {
        query.issueDate.$gte = new Date(startDate as string);
      }
      if (endDate) {
        query.issueDate.$lte = new Date(endDate as string);
      }
    }

    const invoices = await Invoice.find(query)
      .populate('clientId', 'name type email')
      .populate('orderId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: invoices.length,
      data: invoices,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get single invoice
// @route   GET /api/v1/invoices/:id
// @access  Private
export const getInvoice = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('clientId')
      .populate('orderId')
      .populate('createdBy', 'name');

    if (!invoice) {
      res.status(404).json({
        success: false,
        message: 'Invoice not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: invoice,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Create invoice from order
// @route   POST /api/v1/invoices/from-order/:orderId
// @access  Private (Admin, Manager)
export const createInvoiceFromOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('clientId');

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found',
      });
      return;
    }

    const items = order.items.map((item: any) => ({
      description: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.total,
    }));

    const { paymentTerms = 30 } = req.body;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + paymentTerms);

    const invoice = await Invoice.create({
      orderId: order._id,
      clientId: order.clientId,
      clientName: order.clientName,
      items,
      subtotal: order.subtotal,
      tax: order.tax,
      discount: order.discount || 0,
      total: order.total,
      issueDate: new Date(),
      dueDate,
      createdBy: req.user?.id,
    });

    res.status(201).json({
      success: true,
      data: invoice,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Create invoice
// @route   POST /api/v1/invoices
// @access  Private (Admin, Manager)
export const createInvoice = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { clientId, items, dueDate, discount, termsAndConditions, notes } = req.body;

    const client = await Client.findById(clientId);
    if (!client) {
      res.status(404).json({
        success: false,
        message: 'Client not found',
      });
      return;
    }

    // Calculate totals
    let subtotal = 0;
    items.forEach((item: any) => {
      subtotal += item.total;
    });

    const tax = subtotal * 0.2; // 20% tax
    const total = subtotal + tax - (discount || 0);

    const invoice = await Invoice.create({
      clientId,
      clientName: client.name,
      items,
      subtotal,
      tax,
      discount: discount || 0,
      total,
      dueDate,
      termsAndConditions,
      notes,
      createdBy: req.user?.id,
    });

    res.status(201).json({
      success: true,
      data: invoice,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Update invoice
// @route   PUT /api/v1/invoices/:id
// @access  Private (Admin, Manager)
export const updateInvoice = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      res.status(404).json({
        success: false,
        message: 'Invoice not found',
      });
      return;
    }

    Object.assign(invoice, req.body);
    await invoice.save();

    res.status(200).json({
      success: true,
      data: invoice,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Mark invoice as paid
// @route   PATCH /api/v1/invoices/:id/pay
// @access  Private (Admin, Manager)
export const markInvoiceAsPaid = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { paymentMethod, paymentReference } = req.body;

    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      res.status(404).json({
        success: false,
        message: 'Invoice not found',
      });
      return;
    }

    invoice.status = 'paid';
    invoice.paidDate = new Date();
    invoice.paymentMethod = paymentMethod;
    invoice.paymentReference = paymentReference;

    await invoice.save();

    res.status(200).json({
      success: true,
      data: invoice,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Delete invoice
// @route   DELETE /api/v1/invoices/:id
// @access  Private (Admin)
export const deleteInvoice = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      res.status(404).json({
        success: false,
        message: 'Invoice not found',
      });
      return;
    }

    await invoice.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Invoice deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get financial summary
// @route   GET /api/v1/invoices/stats/summary
// @access  Private
export const getFinancialSummary = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Total revenue
    const totalRevenueResult = await Invoice.aggregate([
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    // Paid invoices
    const paidResult = await Invoice.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    // Pending invoices (sent or draft)
    const pendingResult = await Invoice.aggregate([
      { $match: { status: { $in: ['sent', 'draft'] } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    // Overdue invoices
    const overdueResult = await Invoice.aggregate([
      { $match: { status: 'overdue' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalRevenue: totalRevenueResult[0]?.total || 0,
        collected: paidResult[0]?.total || 0,
        pending: pendingResult[0]?.total || 0,
        overdue: overdueResult[0]?.total || 0,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};
