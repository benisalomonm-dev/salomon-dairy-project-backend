import mongoose, { Schema, Document } from 'mongoose';

export interface IBatch extends Document {
  batchNumber: string;
  productId: mongoose.Types.ObjectId;
  productName: string;
  quantity: number;
  productionDate: Date;
  expiryDate?: Date;
  status: 'active' | 'expired' | 'recalled';
  notes?: string;
  yield?: number;
  qualityChecks?: any;
}

const BatchSchema = new Schema<IBatch>(
  {
    batchNumber: {
      type: String,
      required: true,
      unique: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    productionDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'recalled'],
      default: 'active',
    },
    notes: {
      type: String,
      trim: true,
    },
    yield: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },
    qualityChecks: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IBatch>('Batch', BatchSchema);
