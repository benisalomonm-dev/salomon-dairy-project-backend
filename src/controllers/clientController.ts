import { Response } from 'express';
import { Op } from 'sequelize';
import Client from '../models/Client';
import { AuthRequest } from '../middleware/auth';

// @desc    Get all clients
// @route   GET /api/v1/clients
// @access  Private
export const getClients = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type, status, search } = req.query;
    
    let where: any = {};
    
    if (type) {
      where.type = type;
    }
    
    if (status) {
      where.status = status;
    }
    
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
      ];
    }

    const clients = await Client.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });

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
    const client = await Client.findByPk(req.params.id);

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
    const client = await Client.findByPk(req.params.id);

    if (!client) {
      res.status(404).json({
        success: false,
        message: 'Client not found',
      });
      return;
    }

    await client.update(req.body);

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
    const client = await Client.findByPk(req.params.id);

    if (!client) {
      res.status(404).json({
        success: false,
        message: 'Client not found',
      });
      return;
    }

    await client.destroy();

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
    const client = await Client.findByPk(req.params.id);

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
