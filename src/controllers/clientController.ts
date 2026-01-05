import { Response } from 'express';
import Client from '../models/Client.mongo';
import { AuthRequest } from '../middleware/auth';

// @desc    Get all clients
// @route   GET /api/v1/clients
// @access  Private
export const getClients = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type, status, search } = req.query;
    
    let query: any = {};
    
    if (type) {
      query.type = type;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const clients = await Client.find(query)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: clients.length,
      data: clients,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get single client
// @route   GET /api/v1/clients/:id
// @access  Private
export const getClient = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      res.status(404).json({
        success: false,
        message: 'Client not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: client,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Create client
// @route   POST /api/v1/clients
// @access  Private (Admin, Manager)
export const createClient = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const client = await Client.create(req.body);

    res.status(201).json({
      success: true,
      data: client,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Update client
// @route   PUT /api/v1/clients/:id
// @access  Private (Admin, Manager)
export const updateClient = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      res.status(404).json({
        success: false,
        message: 'Client not found',
      });
      return;
    }

    Object.assign(client, req.body);
    await client.save();

    res.status(200).json({
      success: true,
      data: client,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Delete client
// @route   DELETE /api/v1/clients/:id
// @access  Private (Admin)
export const deleteClient = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      res.status(404).json({
        success: false,
        message: 'Client not found',
      });
      return;
    }

    await client.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Client deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get client statistics
// @route   GET /api/v1/clients/:id/stats
// @access  Private
export const getClientStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      res.status(404).json({
        success: false,
        message: 'Client not found',
      });
      return;
    }

    // TODO: Aggregate orders data for more detailed stats

    res.status(200).json({
      success: true,
      data: {
        totalOrders: client.totalOrders,
        totalRevenue: client.totalRevenue,
        monthlyRevenue: client.monthlyRevenue,
        lastOrderDate: client.lastOrderDate,
        rating: client.rating,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};
