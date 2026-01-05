import mongoose, { Schema, Document } from 'mongoose';

export interface IBatch extends Document {
  batchNumber: string;
  product: string;
  productType: 'milk' | 'yogurt' | 'cheese' | 'butter' | 'cream' | 'other';
  productId?: mongoose.Types.ObjectId;
  quantity: number;
  unit: 'L' | 'kg' | 'units';
  status: 'pending' | 'in-progress' | 'completed' | 'failed' | 'cancelled';
  operatorId: mongoose.Types.ObjectId;
  operator: string;
  startTime: Date;
  endTime?: Date;
  temperature?: number;
  pH?: number;
  yield?: number;
  qualityChecks: {
    temperature?: string;
    pH?: string;
    bacteria?: string;
  };
  notes?: string;
  ingredients?: any[];
  equipment?: any[];
}

const BatchSchema = new Schema<IBatch>(
  {
    batchNumber: {
      type: String,
      required: true,
      unique: true,
    },
    product: {
      type: String,
      required: true,
    },
    productType: {
      type: String,
      enum: ['milk', 'yogurt', 'cheese', 'butter', 'cream', 'other'],
      required: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      enum: ['L', 'kg', 'units'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed', 'failed', 'cancelled'],
      default: 'pending',
    },
    operatorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    operator: {
      type: String,
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
    },
    temperature: {
      type: Number,
    },
    pH: {
      type: Number,
    },
    yield: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    qualityChecks: {
      type: Schema.Types.Mixed,
      default: {
        temperature: 'pending',
        pH: 'pending',
        bacteria: 'pending',
      },
    },
    notes: {
      type: String,
      trim: true,
    },
    ingredients: {
      type: [Schema.Types.Mixed],
      default: [],
    },
    equipment: {
      type: [Schema.Types.Mixed],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to generate batch number if not provided
BatchSchema.pre('save', function() {
  if (!this.batchNumber) {
    const randomSuffix = Math.random().toString(36).substring(2, 15).toUpperCase();
    this.batchNumber = `BATCH-${Date.now()}-${randomSuffix}`;
  }
});

export default mongoose.model<IBatch>('Batch', BatchSchema);
