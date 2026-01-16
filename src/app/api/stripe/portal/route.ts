import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/db';
import Subscription from '@/models/Subscription';

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const subscription = await Subscription.findOne({ userId });

    if (!subscription?.stripeCustomerId) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      );
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/dashboard`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error('[Stripe Portal Error]', error);
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    );
  }
}
