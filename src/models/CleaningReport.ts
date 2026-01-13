import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IReportItem {
  sku: string;
  observedCount: number;
  restockedAmount: number;
}

export interface ICleaningReport {
  propertyId: Types.ObjectId;
  cleanerId: string;
  date: Date;
  items: IReportItem[];
  notes?: string;
}

export interface ICleaningReportDocument extends ICleaningReport, Document {
  createdAt: Date;
  updatedAt: Date;
}

const ReportItemSchema = new Schema<IReportItem>(
  {
    sku: { type: String, required: true },
    observedCount: { type: Number, required: true },
    restockedAmount: { type: Number, required: true },
  },
  { _id: false }
);

const CleaningReportSchema = new Schema<ICleaningReportDocument>(
  {
    propertyId: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
    cleanerId: { type: String, required: true },
    date: { type: Date, default: Date.now },
    items: { type: [ReportItemSchema], default: [] },
    notes: { type: String },
  },
  {
    timestamps: true,
  }
);

// Index for querying reports by property and date
CleaningReportSchema.index({ propertyId: 1, date: -1 });

// Prevent model recompilation error in development
const CleaningReport: Model<ICleaningReportDocument> =
  mongoose.models.CleaningReport ||
  mongoose.model<ICleaningReportDocument>('CleaningReport', CleaningReportSchema);

export default CleaningReport;
