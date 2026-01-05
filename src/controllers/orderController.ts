import { Response } from 'express';
import Order from '../models/Order.mongo';
import Client from '../models/Client.mongo';
import Product from '../models/Product.mongo';
import { AuthRequest } from '../middleware/auth';
// import emailService from '../services/emailService';

// @desc    Get all orders
// @route   GET /api/v1/orders
// @access  Private
export const getOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, clientId, startDate, endDate } = req.query;
    
    const query: any = {};
    
    if (status) {
      query.status = status;
    }
    
    if (clientId) {
      query.clientId = clientId;
    }
    
    if (startDate || endDate) {
      query.deliveryDate = {};
      if (startDate) {
        query.deliveryDate.$gte = new Date(startDate as string);
      }
      if (endDate) {
        query.deliveryDate.$lte = new Date(endDate as string);
      }
    }

    const orders = await Order.find(query)
      .populate('clientId', 'name type')
      .populate('driverId', 'name')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get single order
// @route   GET /api/v1/orders/:id
// @access  Private
export const getOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('clientId')
      .populate('driverId', 'name')
      .populate('createdBy', 'name');

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Create order
// @route   POST /api/v1/orders
// @access  Private (Admin, Manager)
export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { clientId, items, deliveryAddress, deliveryDate, specialInstructions } = req.body;

    // Verify client exists
    const client = await Client.findById(clientId);
    if (!client) {
      res.status(404).json({
        success: false,
        message: 'Client not found',
      });
      return;
    }

    // Calculate totals and verify products
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        res.status(404).json({
          success: false,
          message: `Product not found: ${item.productId}`,
        });
        return;
      }

      if (product.currentStock < item.quantity) {
        res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`,
        });
        return;
      }

      const itemTotal = product.unitPrice * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: product._id,
        productName: product.name,
        quantity: item.quantity,
        unit: product.unit,
        unitPrice: product.unitPrice,
        total: itemTotal,
      });
    }

    // Calculate tax and total
    const tax = subtotal * 0.2; // 20% tax
    const total = subtotal + tax;

    // Create order
    const order = await Order.create({
      clientId,
      clientName: client.name,
      items: orderItems,
      subtotal,
      tax,
      total,
      deliveryAddress,
      deliveryDate,
      specialInstructions,
      createdBy: req.user?.id,
      tracking: {
        status: 'pending',
        events: [{
          status: 'pending',
          timestamp: new Date(),
          note: 'Order created',
          updatedBy: req.user?.id,
        }],
      },
    });

    // Update product stocks
    for (const item of orderItems) {
      const product = await Product.findById(item.productId);
      if (product) {
        product.currentStock -= item.quantity;
        await product.save();
      }
    }

    // Update client stats
    if (client.totalOrders !== undefined) {
      client.totalOrders += 1;
    }
    if (client.totalRevenue !== undefined) {
      client.totalRevenue += total;
    }
    client.lastOrderDate = new Date();
    await client.save();

    // Send order confirmation email
    // if (client.email) {
    //   await emailService.sendOrderConfirmationEmail(
    //     order,
    //     client.email,
    //     client.name
    //   );
    // }

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Update order
// @route   PUT /api/v1/orders/:id
// @access  Private (Admin, Manager)
export const updateOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found',
      });
      return;
    }

    Object.assign(order, req.body);
    await order.save();

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Update order status
// @route   PATCH /api/v1/orders/:id/status
// @access  Private
export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, note, location } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found',
      });
      return;
    }

    // Parse tracking if it's a JSON string
    const tracking = typeof order.tracking === 'string' 
      ? JSON.parse(order.tracking) 
      : order.tracking;
    
    // Update tracking object
    tracking.status = status;
    if (!Array.isArray(tracking.events)) {
      tracking.events = [];
    }
    tracking.events.push({
      status,
      timestamp: new Date(),
      note,
      location,
      updatedBy: req.user?.id,
    });

    // Update order
    order.status = status;
    order.tracking = tracking;

    await order.save();

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Assign driver to order
// @route   PATCH /api/v1/orders/:id/assign-driver
// @access  Private (Admin, Manager)
export const assignDriver = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { driverId, driverName } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found',
      });
      return;
    }

    order.driverId = driverId;
    order.driverName = driverName;
    await order.save();

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Cancel order
// @route   PATCH /api/v1/orders/:id/cancel
// @access  Private (Admin, Manager)
export const cancelOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found',
      });
      return;
    }

    if (order.status === 'delivered') {
      res.status(400).json({
        success: false,
        message: 'Cannot cancel delivered order',
      });
      return;
    }

    // Parse tracking if it's a JSON string
    const tracking = typeof order.tracking === 'string' 
      ? JSON.parse(order.tracking) 
      : order.tracking;
    
    // Update tracking object
    tracking.status = 'cancelled';
    if (!Array.isArray(tracking.events)) {
      tracking.events = [];
    }
    tracking.events.push({
      status: 'cancelled',
      timestamp: new Date(),
      note: req.body.reason || 'Order cancelled',
      updatedBy: req.user?.id,
    });

    // Update order
    order.status = 'cancelled';
    order.tracking = tracking;

    await order.save();

    // Restore product stocks
    const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (product) {
        product.currentStock += item.quantity;
        await product.save();
      }
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};
