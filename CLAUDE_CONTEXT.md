# Claude Session Coordination

Last updated: 2026-01-20
Current version: 1.4011

## Project: Rental Helper
Inventory management system for short-term rental properties.

### Production
- **Domain**: https://rental-helper.com
- **Webhook URL**: https://rental-helper.com/api/stripe/webhook
- **GitHub**: https://github.com/bri9and/rental-helper
- **Deployed on**: Vercel

### Two Apps
1. **Owner/Operator App** (`/admin/*`) - Dashboard, properties, supply requests, reports
2. **Cleaner App** (`/cleaner/*`) - Mobile-friendly checklists for cleaners

### Key Conventions

- **QA Required**: Always run a QA sub-agent before telling user to test
- **Version Numbers**: Increment by 0.0001 in package.json with each deploy
- **Amazon URLs**: Use calculated quantities `?qty=${needed}` where `needed = parLevel - currentCount`
- **Amazon Affiliate Tag**: `rentalhelper-20`
- **Styling**: Emerald-700 primary (WCAG AA compliant), zinc for text, minimal UI
- **No Warehouse Page**: Warehouse functionality was removed, items managed per-property

### Tech Stack

- Next.js 16.1.1 (App Router)
- React 19
- MongoDB/Mongoose
- Clerk Auth
- Stripe Payments (14-day trial)
- Tailwind CSS v4
- Vercel deployment

### Stripe Plans

| Plan | Price | Properties | Price ID Env Var |
|------|-------|------------|------------------|
| Starter | $24.95/mo | 1-5 | STRIPE_STARTER_PRICE_ID |
| Pro | $49.95/mo | 6-10 | STRIPE_PROFESSIONAL_PRICE_ID |
| Max | $99.95/mo | 11-25 | STRIPE_ENTERPRISE_PRICE_ID |

### File Structure

```
src/
  app/
    (admin)/          # Owner app (requires auth)
      admin/
        dashboard/    # PropertyRestockCards with cart preview
        properties/
          [id]/       # Property detail page
        supply-requests/
        reports/
        settings/
      layout.tsx      # Admin layout with nav
    (cleaner)/        # Cleaner app
    api/
      stripe/
        checkout/     # Creates Stripe checkout sessions
        webhook/      # Handles subscription events
        portal/       # Customer billing portal
    pricing/          # Pricing page
    page.tsx          # Landing page (problem-first marketing)
  lib/
    actions/          # Server actions
    stripe.ts         # Stripe client + plan definitions
    amazon.ts         # Amazon URL utilities
    db.ts             # MongoDB connection
    auth.ts           # Auth helpers
  models/
    Subscription.ts   # Stripe subscription storage
  components/
    layout/
      SiteHeader.tsx  # Shared header with version number
    ui/               # Shared UI components
```

### Recent Changes (2026-01-20)

- [x] v1.4008 - Accessibility fix (emerald-600 → emerald-700 for WCAG AA)
- [x] v1.4008 - New hero: "Your Rentals, Always Guest-Ready"
- [x] v1.4009 - Problem-first feature section ("Sound Familiar?")
- [x] v1.4009 - Concrete "How It Works" with mini UI previews
- [x] v1.4010 - Cart preview modal for restock flow
- [x] v1.4010 - Clickable dashboard stat cards (link to Properties/Supply Requests)
- [x] v1.4010 - Property cards link to detail page
- [x] v1.4010 - Stripe products/prices created via CLI (test mode)
- [x] v1.4011 - Fixed middleware to allow public access to /pricing and /api/stripe/*
- [x] NAT creative team research for demo experience (see DEMO_PLAN.md)

---

## How to Sync

When starting a new session or switching context, read this file first:
```
Read CLAUDE_CONTEXT.md for project context and coordination with other sessions.
```
