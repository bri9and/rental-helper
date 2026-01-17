import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IReportItem {
  sku: string;
  observedCount: number;
  restockedAmount: number;
}

export interface ICleaningChecklist {
  bathrooms: boolean;
  kitchen: boolean;
  bedrooms: boolean;
  livingSpace: boolean;
}

export interface ICleaningReport {
  propertyId: Types.ObjectId;
  cleanerId: string;
  cleanerName?: string;
  date: Date;
  items: IReportItem[];
  notes?: string;
  checklist?: ICleaningChecklist;
  completedAt?: Date;
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

const CleaningChecklistSchema = new Schema<ICleaningChecklist>(
  {
    bathrooms: { type: Boolean, default: false },
    kitchen: { type: Boolean, default: false },
    bedrooms: { type: Boolean, default: false },
    livingSpace: { type: Boolean, default: false },
  },
  { _id: false }
);

const CleaningReportSchema = new Schema<ICleaningReportDocument>(
  {
    propertyId: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
    cleanerId: { type: String, required: true },
    cleanerName: { type: String },
    date: { type: Date, default: Date.now },
    items: { type: [ReportItemSchema], default: [] },
    notes: { type: String },
    checklist: { type: CleaningChecklistSchema },
    completedAt: { type: Date },
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
