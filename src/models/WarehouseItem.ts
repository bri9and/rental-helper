import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBurnRateEntry {
  date: Date;
  amountUsed: number;
}

export interface IWarehouseItem {
  ownerId: string;
  name: string;
  sku: string;
  quantity: number;
  parLevel: number;
  lowStockThreshold: number;
  costPerUnit?: number;
  amazonAsin?: string;
  burnRateHistory: IBurnRateEntry[];
}

export interface IWarehouseItemDocument extends IWarehouseItem, Document {
  createdAt: Date;
  updatedAt: Date;
}

const BurnRateEntrySchema = new Schema<IBurnRateEntry>(
  {
    date: { type: Date, required: true },
    amountUsed: { type: Number, required: true },
  },
  { _id: false }
);

const WarehouseItemSchema = new Schema<IWarehouseItemDocument>(
  {
    ownerId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    sku: { type: String, required: true },
    quantity: { type: Number, default: 0 },
    parLevel: { type: Number, default: 10 },
    lowStockThreshold: { type: Number, default: 5 },
    costPerUnit: { type: Number },
    amazonAsin: { type: String },
    burnRateHistory: { type: [BurnRateEntrySchema], default: [] },
  },
  {
    timestamps: true,
  }
);

// Compound unique index: each user can only have one item per SKU
WarehouseItemSchema.index({ ownerId: 1, sku: 1 }, { unique: true });

// Prevent model recompilation error in development
const WarehouseItem: Model<IWarehouseItemDocument> =
  mongoose.models.WarehouseItem ||
  mongoose.model<IWarehouseItemDocument>('WarehouseItem', WarehouseItemSchema);

export default WarehouseItem;
