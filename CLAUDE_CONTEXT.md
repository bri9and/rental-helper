# Claude Session Coordination

Last updated: 2026-01-19
Current version: 1.4005

## Project: Rental Helper
Inventory management system for short-term rental properties.

### Two Apps
1. **Owner/Operator App** (`/admin/*`) - Dashboard, properties, supply requests, reports
2. **Cleaner App** (`/cleaner/*`) - Mobile-friendly checklists for cleaners

### Key Conventions

- **QA Required**: Always run a QA sub-agent before telling user to test
- **Version Numbers**: Increment by 0.0001 in package.json with each deploy (currently 1.4003)
- **Amazon URLs**: Use calculated quantities `?qty=${needed}` where `needed = parLevel - currentCount`
- **Styling**: Minimal, neutral colors (zinc/slate), avoid orange, small buttons
- **No Warehouse Page**: Warehouse functionality was removed, items managed per-property

### Recent Changes (Session A)

- [x] Property detail page at `/admin/properties/[id]`
- [x] Property cards link to detail page
- [x] Supply requests show calculated Buy quantities
- [x] Version number displayed in bottom-right corner
- [x] Simplified supply request UI (smaller buttons, just "Buy")

### Tech Stack

- Next.js 16.1.1 (App Router)
- React 19
- MongoDB/Mongoose
- Clerk Auth
- Stripe payments
- Tailwind CSS v4
- Deployed on Vercel

### File Structure

```
src/
  app/
    (admin)/          # Owner app (requires auth)
      admin/
        dashboard/
        properties/
          [id]/       # NEW: Property detail page
        supply-requests/
        reports/
        settings/
      layout.tsx      # Admin layout with nav
    (cleaner)/        # Cleaner app
    page.tsx          # Landing page
  lib/
    actions/          # Server actions
    db.ts             # MongoDB connection
    auth.ts           # Auth helpers
  models/             # Mongoose models
  components/ui/      # Shared UI components
```

### Current Session Tasks

**Session A (this file's author):**
- Property detail page - COMPLETE
- Available for new tasks

**Session B:**
- Active as of 2026-01-19
- [x] Comprehensive site-wide standardization - COMPLETE
- [x] Created shared SiteHeader component with version number
- [x] Standardized all colors to zinc/slate (removed sky, orange)
- [x] Updated all layouts to use shared header
- [x] Fixed Amazon URLs to include affiliate tag everywhere
- [x] Centralized Amazon URL utility in src/lib/amazon.ts
- [x] Standardized Button component to zinc-900 primary
- [x] Updated version to 1.4004
- [x] QA Agent #1 - Found 4 issues, all fixed
- [x] QA Agent #2 - All checks passed, ready for user testing

---

## How to Sync

When starting a new session or switching context, read this file first:
```
Read CLAUDE_CONTEXT.md for project context and coordination with other sessions.
```
