import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface IOrder extends Document {
  orderNumber: string;
  clientId: mongoose.Types.ObjectId;
  clientName: string;
  items: IOrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: 'pending' | 'processing' | 'delivered' | 'cancelled';
  deliveryDate?: Date;
  deliveryAddress?: string;
  notes?: string;
  specialInstructions?: string;
  createdBy: mongoose.Types.ObjectId;
  tracking?: any;
  driverId?: mongoose.Types.ObjectId;
  driverName?: string;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
    },
    clientName: {
      type: String,
      required: true,
    },
    items: [{
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
      price: {
        type: Number,
        required: true,
        min: 0,
      },
      subtotal: {
        type: Number,
        required: true,
        min: 0,
      },
    }],
    subtotal: {
      type: Number,
      default: 0,
      min: 0,
    },
    tax: {
      type: Number,
      default: 0,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'delivered', 'cancelled'],
      default: 'pending',
    },
    deliveryDate: {
      type: Date,
    },
    deliveryAddress: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    specialInstructions: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tracking: {
      type: Schema.Types.Mixed,
      default: {},
    },
    driverId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    driverName: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IOrder>('Order', OrderSchema);
