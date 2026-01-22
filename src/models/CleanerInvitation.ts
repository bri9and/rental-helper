import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICleanerInvitation {
  managerId: string; // The ownerId who created the invitation
  code: string; // Unique 6-character alphanumeric code
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  cleanerId?: string; // Set when a cleaner accepts the invitation
  cleanerName?: string; // Name provided when accepting
  expiresAt: Date;
}

export interface ICleanerInvitationDocument extends ICleanerInvitation, Document {
  createdAt: Date;
  updatedAt: Date;
}

const CleanerInvitationSchema = new Schema<ICleanerInvitationDocument>(
  {
    managerId: { type: String, required: true, index: true },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'expired', 'revoked'],
      default: 'pending',
      index: true,
    },
    cleanerId: { type: String },
    cleanerName: { type: String },
    expiresAt: { type: Date, required: true },
  },
  {
    timestamps: true,
  }
);

// Index for looking up invitations by code (used during acceptance)
CleanerInvitationSchema.index({ code: 1, status: 1 });

// Generate a random 6-character alphanumeric code
export function generateInvitationCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excludes similar chars I/1/O/0
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

const CleanerInvitation: Model<ICleanerInvitationDocument> =
  mongoose.models.CleanerInvitation ||
  mongoose.model<ICleanerInvitationDocument>('CleanerInvitation', CleanerInvitationSchema);

export default CleanerInvitation;
