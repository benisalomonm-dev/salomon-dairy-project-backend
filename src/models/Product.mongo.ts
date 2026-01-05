import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  category: string;
  unit: string;
  price: number;
  unitPrice: number; // Alias for price
  stock: number;
  currentStock: number; // Alias for stock
  minStock: number;
  description?: string;
  isActive: boolean;
  sku?: string;
  lastRestocked?: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'Please add a product name'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please add a category'],
      trim: true,
    },
    unit: {
      type: String,
      required: [true, 'Please add a unit'],
      default: 'liter',
    },
    price: {
      type: Number,
      required: [true, 'Please add a price'],
      min: 0,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    minStock: {
      type: Number,
      default: 10,
      min: 0,
    },
    lastRestocked: {
      type: Date,
    },
    description: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sku: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for unitPrice (alias for price)
ProductSchema.virtual('unitPrice').get(function() {
  return this.price;
});

// Virtual for currentStock (alias for stock)
ProductSchema.virtual('currentStock')
  .get(function() {
    return this.stock;
  })
  .set(function(value: number) {
    this.stock = value;
  });

export default mongoose.model<IProduct>('Product', ProductSchema);
