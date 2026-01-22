import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICleaner {
  name: string;
  email?: string;
  phone?: string;
  managerId: string; // The ownerId of the property manager
  invitationCode: string; // The code they used to join
  status: 'active' | 'inactive';
  lastActiveAt?: Date;
}

export interface ICleanerDocument extends ICleaner, Document {
  createdAt: Date;
  updatedAt: Date;
}

const CleanerSchema = new Schema<ICleanerDocument>(
  {
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    managerId: { type: String, required: true, index: true },
    invitationCode: { type: String, required: true },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    },
    lastActiveAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Compound index for looking up cleaners by manager
CleanerSchema.index({ managerId: 1, status: 1 });

const Cleaner: Model<ICleanerDocument> =
  mongoose.models.Cleaner ||
  mongoose.model<ICleanerDocument>('Cleaner', CleanerSchema);

export default Cleaner;
