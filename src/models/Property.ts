import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IInventorySetting {
  itemSku: string;
  parLevel: number;
}

export interface IProperty {
  ownerId: string;
  name: string;
  address?: string;
  inventorySettings: IInventorySetting[];
}

export interface IPropertyDocument extends IProperty, Document {
  createdAt: Date;
  updatedAt: Date;
}

const InventorySettingSchema = new Schema<IInventorySetting>(
  {
    itemSku: { type: String, required: true },
    parLevel: { type: Number, required: true },
  },
  { _id: false }
);

const PropertySchema = new Schema<IPropertyDocument>(
  {
    ownerId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    address: { type: String },
    inventorySettings: { type: [InventorySettingSchema], default: [] },
  },
  {
    timestamps: true,
  }
);

// Prevent model recompilation error in development
const Property: Model<IPropertyDocument> =
  mongoose.models.Property ||
  mongoose.model<IPropertyDocument>('Property', PropertySchema);

export default Property;
