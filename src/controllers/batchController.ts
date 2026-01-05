import { Response } from 'express';
import Batch from '../models/Batch.mongo';
import Product from '../models/Product.mongo';
import { AuthRequest } from '../middleware/auth';

// @desc    Get all batches
// @route   GET /api/v1/batches
// @access  Private
export const getBatches = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, productType, startDate, endDate } = req.query;
    
    let query: any = {};
    
    if (status) {
      query.status = status;
    }
    
    if (productType) {
      query.productType = productType;
    }
    
    if (startDate || endDate) {
      query.startTime = {};
      if (startDate) {
        query.startTime.$gte = new Date(startDate as string);
      }
      if (endDate) {
        query.startTime.$lte = new Date(endDate as string);
      }
    }

    const batches = await Batch.find(query)
      .populate('operatorId', 'name')
      .populate('productId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: batches.length,
      data: batches,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get single batch
// @route   GET /api/v1/batches/:id
// @access  Private
export const getBatch = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const batch = await Batch.findById(req.params.id)
      .populate('operatorId')
      .populate('productId');

    if (!batch) {
      res.status(404).json({
        success: false,
        message: 'Batch not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: batch,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Create batch
// @route   POST /api/v1/batches
// @access  Private (Admin, Manager, Operator)
export const createBatch = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const batchData = {
      ...req.body,
      // Use operatorId from request body if provided, otherwise use authenticated user's ID
      operatorId: req.body.operatorId || req.user?.id,
      // Use operator name from request body if provided, otherwise use authenticated user's name
      operator: req.body.operator || req.user?.name || 'Unknown Operator',
    };

    const batch = await Batch.create(batchData);

    res.status(201).json({
      success: true,
      data: batch,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Update batch
// @route   PUT /api/v1/batches/:id
// @access  Private (Admin, Manager, Operator)
export const updateBatch = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const batch = await Batch.findById(req.params.id);

    if (!batch) {
      res.status(404).json({
        success: false,
        message: 'Batch not found',
      });
      return;
    }

    Object.assign(batch, req.body);
    await batch.save();

    res.status(200).json({
      success: true,
      data: batch,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Complete batch
// @route   PATCH /api/v1/batches/:id/complete
// @access  Private (Admin, Manager, Operator)
export const completeBatch = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { yield: batchYield, qualityChecks } = req.body;

    const batch = await Batch.findById(req.params.id);

    if (!batch) {
      res.status(404).json({
        success: false,
        message: 'Batch not found',
      });
      return;
    }
    
    if (batchYield) {
      batch.yield = batchYield;
    }
    
    if (qualityChecks) {
      batch.qualityChecks = { ...batch.qualityChecks, ...qualityChecks };
    }

    await batch.save();

    // Update product stock if productId exists
    if (batch.productId && batch.yield) {
      const actualQuantity = (batch.quantity * batch.yield) / 100;
      const product = await Product.findById(batch.productId);
      if (product) {
        product.currentStock += actualQuantity;
        product.lastRestocked = new Date();
        await product.save();
      }
    }

    res.status(200).json({
      success: true,
      data: batch,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Update quality checks
// @route   PATCH /api/v1/batches/:id/quality-checks
// @access  Private (Admin, Manager, Operator)
export const updateQualityChecks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const batch = await Batch.findById(req.params.id);

    if (!batch) {
      res.status(404).json({
        success: false,
        message: 'Batch not found',
      });
      return;
    }

    batch.qualityChecks = { ...batch.qualityChecks, ...req.body };
    await batch.save();

    res.status(200).json({
      success: true,
      data: batch,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Delete batch
// @route   DELETE /api/v1/batches/:id
// @access  Private (Admin)
export const deleteBatch = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const batch = await Batch.findById(req.params.id);

    if (!batch) {
      res.status(404).json({
        success: false,
        message: 'Batch not found',
      });
      return;
    }

    await batch.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Batch deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};
