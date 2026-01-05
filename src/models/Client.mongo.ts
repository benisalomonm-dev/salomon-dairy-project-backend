import mongoose, { Schema, Document } from 'mongoose';

export interface IClient extends Document {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  type: 'regular' | 'wholesale' | 'retail';
  creditLimit?: number;
  balance: number;
  isActive: boolean;
  notes?: string;
  totalOrders?: number;
  totalRevenue?: number;
  monthlyRevenue?: number;
  lastOrderDate?: Date;
  rating?: number;
}

const ClientSchema = new Schema<IClient>(
  {
    name: {
      type: String,
      required: [true, 'Please add a client name'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ['regular', 'wholesale', 'retail'],
      default: 'regular',
    },
    creditLimit: {
      type: Number,
      default: 0,
      min: 0,
    },
    balance: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    totalOrders: {
      type: Number,
      default: 0,
    },
    totalRevenue: {
      type: Number,
      default: 0,
    },
    monthlyRevenue: {
      type: Number,
      default: 0,
    },
    lastOrderDate: {
      type: Date,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IClient>('Client', ClientSchema);
