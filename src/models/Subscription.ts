import mongoose, { Schema, Document } from 'mongoose';

export interface ISubscription extends Document {
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  stripePriceId: string;
  plan: 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    stripeCustomerId: { type: String, required: true, index: true },
    stripeSubscriptionId: { type: String, required: true, unique: true },
    stripePriceId: { type: String, required: true },
    plan: {
      type: String,
      enum: ['starter', 'professional', 'enterprise'],
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'canceled', 'past_due', 'trialing'],
      default: 'trialing',
    },
    currentPeriodStart: { type: Date, required: true },
    currentPeriodEnd: { type: Date, required: true },
    cancelAtPeriodEnd: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Subscription ||
  mongoose.model<ISubscription>('Subscription', SubscriptionSchema);
