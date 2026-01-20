'use client';

import { Check } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { SiteHeader } from "@/components/layout/SiteHeader";

const plans = [
  {
    name: "Starter",
    description: "Perfect for new hosts",
    price: 24.95,
    properties: "1-5",
    features: [
      "Up to 5 properties",
      "Unlimited inventory items",
      "Cleaner mobile app",
      "AI-powered counting",
      "Email alerts",
      "Basic analytics",
    ],
    priceId: "starter",
  },
  {
    name: "Pro",
    description: "For growing portfolios",
    price: 49.95,
    properties: "6-10",
    features: [
      "Up to 10 properties",
      "Everything in Starter",
      "Manager mobile app",
      "Advanced analytics",
      "Burn rate predictions",
      "Priority support",
    ],
    priceId: "professional",
  },
  {
    name: "Max",
    description: "For serious operators",
    price: 99.95,
    properties: "11-25",
    features: [
      "Up to 25 properties",
      "Everything in Pro",
      "Custom integrations",
      "Dedicated account manager",
      "SLA guarantee",
      "White-label options",
    ],
    priceId: "enterprise",
  },
];

export default function PricingPage() {
  const { isSignedIn } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    if (!isSignedIn) {
      window.location.href = `/sign-up?plan=${planId}`;
      return;
    }

    setLoading(planId);
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Something went wrong');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Shared Site Header */}
      <SiteHeader showPricing={false} />

      {/* Pricing Section */}
      <main className="mx-auto max-w-7xl px-4 pt-24 pb-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-zinc-900 sm:text-5xl">
            Simple, Transparent Pricing
          </h1>
          <p className="mt-4 text-xl text-zinc-600">
            Choose the plan that fits your property portfolio
          </p>
        </div>

        {/* Plans Grid */}
        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="relative rounded-2xl border border-zinc-200 bg-white p-8 transition-all duration-200 hover:border-zinc-300 hover:shadow-lg"
            >

              <div className="text-center">
                <h3 className="text-xl font-semibold text-zinc-900">{plan.name}</h3>
                <p className="mt-2 text-zinc-600">{plan.description}</p>
                <div className="mt-6">
                  <span className="text-5xl font-bold text-zinc-900">${plan.price}</span>
                  <span className="text-zinc-600">/month</span>
                </div>
                <p className="mt-2 text-sm text-zinc-600">
                  {plan.properties} properties
                </p>
              </div>

              <ul className="mt-8 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-zinc-600 flex-shrink-0" />
                    <span className="text-zinc-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.priceId)}
                disabled={loading === plan.priceId}
                className="mt-8 block w-full rounded-lg py-3 text-center font-medium transition-colors disabled:opacity-50 bg-emerald-700 text-white hover:bg-emerald-800"
              >
                {loading === plan.priceId ? 'Loading...' : 'Get Started'}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ or additional info */}
        <div className="mt-16 text-center space-y-4">
          <p className="text-zinc-600">
            All plans include a 14-day free trial. No credit card required.
          </p>
          <div className="pt-4 border-t border-zinc-200 max-w-xl mx-auto">
            <p className="text-zinc-700 font-medium">
              Need a custom solution?
            </p>
            <p className="mt-2 text-zinc-500">
              Looking for enterprise features, annual commitment pricing, or managing 25+ properties?{" "}
              <a href="mailto:sales@rental-helper.com" className="text-zinc-900 hover:underline font-medium">
                Contact our sales team
              </a>{" "}
              to discuss a package tailored to your needs.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
