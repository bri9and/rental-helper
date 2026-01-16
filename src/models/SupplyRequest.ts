import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type SupplyRequestStatus = 'pending' | 'ordered' | 'received' | 'cancelled';

export interface ISupplyRequest {
  ownerId: string;
  propertyId: Types.ObjectId;
  propertyName: string;
  sku: string;
  itemName: string;
  requestedBy: string;
  requestedByName?: string;
  currentCount: number;
  status: SupplyRequestStatus;
  orderQuantity?: number;
  notes?: string;
  orderedAt?: Date;
  receivedAt?: Date;
}

export interface ISupplyRequestDocument extends ISupplyRequest, Document {
  createdAt: Date;
  updatedAt: Date;
}

const SupplyRequestSchema = new Schema<ISupplyRequestDocument>(
  {
    ownerId: { type: String, required: true, index: true },
    propertyId: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
    propertyName: { type: String, required: true },
    sku: { type: String, required: true },
    itemName: { type: String, required: true },
    requestedBy: { type: String, required: true },
    requestedByName: { type: String },
    currentCount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'ordered', 'received', 'cancelled'],
      default: 'pending',
      index: true
    },
    orderQuantity: { type: Number },
    notes: { type: String },
    orderedAt: { type: Date },
    receivedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
SupplyRequestSchema.index({ ownerId: 1, status: 1, createdAt: -1 });
SupplyRequestSchema.index({ propertyId: 1, sku: 1, status: 1 });

const SupplyRequest: Model<ISupplyRequestDocument> =
  mongoose.models.SupplyRequest ||
  mongoose.model<ISupplyRequestDocument>('SupplyRequest', SupplyRequestSchema);

export default SupplyRequest;
