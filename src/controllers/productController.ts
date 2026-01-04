import { Response } from 'express';
import { Op } from 'sequelize';
import Product from '../models/Product';
import { AuthRequest } from '../middleware/auth';

// @desc    Get all products
// @route   GET /api/v1/products
// @access  Private
export const getProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { category, status, search } = req.query;
    
    let where: any = {};
    
    if (category) {
      where.category = category;
    }
    
    if (status) {
      where.status = status;
    }
    
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { sku: { [Op.like]: `%${search}%` } },
        { barcode: { [Op.like]: `%${search}%` } },
      ];
    }

    const products = await Product.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get single product
// @route   GET /api/v1/products/:id
// @access  Private
export const getProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Create product
// @route   POST /api/v1/products
// @access  Private (Admin, Manager)
export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Update product
// @route   PUT /api/v1/products/:id
// @access  Private (Admin, Manager)
export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

    await product.update(req.body);

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/v1/products/:id
// @access  Private (Admin)
export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

    await product.destroy();

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Update stock
// @route   PATCH /api/v1/products/:id/stock
// @access  Private (Admin, Manager, Operator)
export const updateStock = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { quantity, type } = req.body;
    
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

    if (type === 'add') {
      product.currentStock += quantity;
      product.lastRestocked = new Date();
    } else if (type === 'subtract') {
      if (product.currentStock < quantity) {
        res.status(400).json({
          success: false,
          message: 'Insufficient stock',
        });
        return;
      }
      product.currentStock -= quantity;
    } else if (type === 'set') {
      product.currentStock = quantity;
    }

    await product.save();

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get low stock products
// @route   GET /api/v1/products/alerts/low-stock
// @access  Private
export const getLowStockProducts = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const products = await Product.findAll({
      where: {
        status: {
          [Op.in]: ['low', 'critical', 'out-of-stock']
        }
      },
      order: [['currentStock', 'ASC']],
    });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};
