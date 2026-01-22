import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IInventorySetting {
  itemSku: string;
  parLevel: number;
}

export interface IRoomConfiguration {
  bedrooms: number;
  bathrooms: number;
  halfBathrooms: number;
  kitchens: number;
  livingRooms: number;
  diningRooms: number;
  laundryRooms: number;
  garages: number;
  outdoorSpaces: number;
}

export interface IProperty {
  ownerId: string;
  name: string;
  address?: string;
  rooms: IRoomConfiguration;
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

const RoomConfigurationSchema = new Schema<IRoomConfiguration>(
  {
    bedrooms: { type: Number, default: 1, min: 0 },
    bathrooms: { type: Number, default: 1, min: 0 },
    halfBathrooms: { type: Number, default: 0, min: 0 },
    kitchens: { type: Number, default: 1, min: 0 },
    livingRooms: { type: Number, default: 1, min: 0 },
    diningRooms: { type: Number, default: 0, min: 0 },
    laundryRooms: { type: Number, default: 0, min: 0 },
    garages: { type: Number, default: 0, min: 0 },
    outdoorSpaces: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const defaultRooms: IRoomConfiguration = {
  bedrooms: 1,
  bathrooms: 1,
  halfBathrooms: 0,
  kitchens: 1,
  livingRooms: 1,
  diningRooms: 0,
  laundryRooms: 0,
  garages: 0,
  outdoorSpaces: 0,
};

const PropertySchema = new Schema<IPropertyDocument>(
  {
    ownerId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    address: { type: String },
    rooms: { type: RoomConfigurationSchema, default: () => ({ ...defaultRooms }) },
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
