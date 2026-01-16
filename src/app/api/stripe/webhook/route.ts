import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe, PLANS } from '@/lib/stripe';
import dbConnect from '@/lib/db';
import Subscription from '@/models/Subscription';

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('[Stripe Webhook] Signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  await dbConnect();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.userId || session.client_reference_id;
        const planId = session.metadata?.plan;

        if (userId && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );

          const subData = subscription as unknown as Record<string, unknown>;

          await Subscription.findOneAndUpdate(
            { userId },
            {
              userId,
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: subscription.id,
              stripePriceId: subscription.items.data[0].price.id,
              plan: planId || 'starter',
              status: subscription.status === 'trialing' ? 'trialing' : 'active',
              currentPeriodStart: new Date((subData.current_period_start as number) * 1000),
              currentPeriodEnd: new Date((subData.current_period_end as number) * 1000),
              cancelAtPeriodEnd: subData.cancel_at_period_end,
            },
            { upsert: true, new: true }
          );
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const subData = subscription as unknown as Record<string, unknown>;
        const userId = (subscription.metadata as Record<string, string>)?.userId;

        // Find plan by price ID
        let plan = 'starter';
        const priceId = subscription.items.data[0].price.id;
        for (const [key, value] of Object.entries(PLANS)) {
          if (value.priceId === priceId) {
            plan = key;
            break;
          }
        }

        await Subscription.findOneAndUpdate(
          { stripeSubscriptionId: subscription.id },
          {
            status: subscription.status === 'trialing' ? 'trialing' :
                    subscription.status === 'active' ? 'active' :
                    subscription.status === 'past_due' ? 'past_due' : 'canceled',
            stripePriceId: priceId,
            plan,
            currentPeriodStart: new Date((subData.current_period_start as number) * 1000),
            currentPeriodEnd: new Date((subData.current_period_end as number) * 1000),
            cancelAtPeriodEnd: subData.cancel_at_period_end,
          }
        );
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        await Subscription.findOneAndUpdate(
          { stripeSubscriptionId: subscription.id },
          { status: 'canceled' }
        );
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Stripe Webhook Error]', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
