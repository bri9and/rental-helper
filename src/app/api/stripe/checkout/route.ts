import { NextResponse } from 'next/server';
import { stripe, PLANS, PlanId } from '@/lib/stripe';
import { getAuthUserId } from '@/lib/auth';
import { auth, currentUser } from '@clerk/nextjs/server';
import dbConnect from '@/lib/db';
import Subscription from '@/models/Subscription';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { planId } = await request.json();

    if (!planId || !PLANS[planId as PlanId]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const plan = PLANS[planId as PlanId];

    if (!plan.priceId) {
      return NextResponse.json({ error: 'Plan not configured' }, { status: 400 });
    }

    await dbConnect();

    // Check if user already has a subscription
    const existingSubscription = await Subscription.findOne({ userId });

    if (existingSubscription?.stripeCustomerId) {
      // Create billing portal session for existing customers
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: existingSubscription.stripeCustomerId,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/dashboard`,
      });
      return NextResponse.json({ url: portalSession.url });
    }

    // Create checkout session for new customers
    const session = await stripe.checkout.sessions.create({
      customer_email: user.emailAddresses[0]?.emailAddress,
      client_reference_id: userId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 14,
        metadata: {
          userId,
          plan: planId,
        },
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      metadata: {
        userId,
        plan: planId,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('[Stripe Checkout Error]', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
