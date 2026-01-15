import mongoose, { Schema, Document } from "mongoose";

export interface ICartOrderItem {
  productId: string;
  amazonAsin: string;
  name: string;
  quantity: number;
  price: number;
}

export interface ICartOrder extends Document {
  userId: string;
  items: ICartOrderItem[];
  totalAmount: number;
  amazonCartUrl: string;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CartOrderItemSchema = new Schema<ICartOrderItem>(
  {
    productId: { type: String, required: true },
    amazonAsin: { type: String, required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
  },
  { _id: false }
);

const CartOrderSchema = new Schema<ICartOrder>(
  {
    userId: { type: String, required: true, index: true },
    items: { type: [CartOrderItemSchema], required: true },
    totalAmount: { type: Number, required: true },
    amazonCartUrl: { type: String, required: true },
    submittedAt: { type: Date, required: true, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Index for fetching user's order history sorted by date
CartOrderSchema.index({ userId: 1, submittedAt: -1 });

export const CartOrder =
  mongoose.models.CartOrder ||
  mongoose.model<ICartOrder>("CartOrder", CartOrderSchema);
