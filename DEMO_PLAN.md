# Rental Helper Demo Experience Plan

**Created by:** NAT (Creative Director) with N1, N2, N3 Sub-agents
**Date:** January 2026
**Version:** 1.0

---

## Executive Summary

This document outlines a comprehensive plan to transform Rental Helper's demo experience from a basic "load sample data" button into a compelling, guided journey that showcases all product capabilities. Our goal: convert visitors into paying customers by demonstrating immediate value within 60 seconds.

---

## Part 1: Demo Strategy (N1 Research Findings)

### Industry Best Practices Analysis

Based on research of leading SaaS companies (Linear, Notion, Figma), here are the key insights:

#### What Works
1. **Interactive demos outperform passive content** - 84% of buyers are persuaded after watching/experiencing a demo
2. **Keep it short** - Most effective demos are 60-180 seconds or 10-15 interactive steps
3. **Focus on pain points first** - Notion opens with "information scattered across too many tools" before showing solutions
4. **Self-serve tours have 123% higher completion rates** than randomly-triggered ones
5. **Hybrid approach wins** - Combine tooltips, modals, and highlighted UI elements

#### What to Avoid
1. Trying to show everything at once (Linear's criticism)
2. More than 5-7 essential steps per tour
3. Forcing participation without skip option
4. Generic "Lorem Ipsum" placeholder data

### Recommended Strategy: Hybrid Interactive Demo

```
Primary: Self-guided interactive tour with tooltips
Secondary: 90-second video overview (for quick scanners)
Tertiary: Pre-populated dashboard (for self-explorers)
```

**Why Hybrid?**
- Different users have different learning preferences
- Video captures attention quickly
- Interactive tour builds muscle memory
- Pre-populated data lets power users explore freely

---

## Part 2: Demo Content Specification (N2 Deliverable)

### Property Portfolio (5 Properties)

Each property represents a different Airbnb archetype with distinct scenarios:

#### 1. Oceanview Beach House (Malibu, CA)
- **Type:** Luxury beach vacation rental
- **Status:** CRITICAL - 2 items out of stock
- **Scenario:** Cleaner just submitted report showing they're out of trash bags and low on soap
- **Teaching moment:** Show supply request notifications + one-click Amazon ordering

```
Inventory:
- Toilet Paper: 2/4 (50% - LOW)
- Bath Towels: 4/6 (67% - OK)
- Coffee Pods: 0/2 (0% - CRITICAL)
- Trash Bags: 0/2 (0% - CRITICAL)
- Hand Soap: 1/3 (33% - LOW)
```

#### 2. Downtown Loft (Austin, TX)
- **Type:** Urban studio for business travelers
- **Status:** GOOD - Recently restocked
- **Scenario:** Just cleaned yesterday, all items at par level
- **Teaching moment:** Show what "healthy" looks like

```
Inventory:
- Toilet Paper: 2/2 (100% - GOOD)
- Coffee Pods: 1/1 (100% - GOOD)
- All-Purpose Cleaner: 1/1 (100% - GOOD)
- Disinfecting Wipes: 2/2 (100% - GOOD)
```

#### 3. Mountain Retreat Cabin (Aspen, CO)
- **Type:** Family ski vacation home
- **Status:** LOW - Pending supply request
- **Scenario:** Cleaner flagged air freshener running low
- **Teaching moment:** Show cleaner-to-manager communication flow

```
Inventory:
- Toilet Paper: 4/6 (67% - OK)
- Throw Blankets: 1/2 (50% - LOW)
- Coffee Pods: 1/2 (50% - LOW)
- Air Freshener: 0/3 (0% - CRITICAL)
```

#### 4. Lakeside Villa (Lake Tahoe, CA)
- **Type:** Large luxury property
- **Status:** LOW - High-volume property needs attention
- **Scenario:** Most items slightly low after busy weekend
- **Teaching moment:** Show bulk restocking for large properties

```
Inventory:
- Toilet Paper: 5/8 (63% - OK)
- Bath Towels: 4/8 (50% - LOW)
- Paper Towels: 2/4 (50% - LOW)
- Coffee Pods: 1/3 (33% - LOW)
```

#### 5. Urban Studio (New York, NY)
- **Type:** Compact city apartment
- **Status:** ORDERED - Supplies on the way
- **Scenario:** Manager already ordered supplies, showing order tracking
- **Teaching moment:** Show order status tracking

```
Inventory:
- Toilet Paper: 0/2 (0% - ORDERED)
- Air Freshener: 1/2 (50% - LOW)
- Dish Soap: 1/1 (100% - GOOD)
```

### Supply Request Scenarios (6 Requests)

| Property | Item | Status | Cleaner | Time |
|----------|------|--------|---------|------|
| Oceanview Beach House | Trash Bags | Pending | Maria Garcia | 1 day ago |
| Oceanview Beach House | Hand Soap | Pending | Maria Garcia | 1 day ago |
| Mountain Retreat Cabin | Air Freshener | Pending | James Wilson | 2 days ago |
| Lakeside Villa | Bath Towels | Pending | Sarah Johnson | Today |
| Downtown Loft | Coffee Pods | Ordered | Mike Chen | 3 days ago |
| Urban Studio | Toilet Paper | Ordered | Lisa Park | 4 days ago |

### Cleaner Personas

| Name | Properties | Recent Activity |
|------|------------|-----------------|
| Maria Garcia | Oceanview Beach House | Submitted report yesterday, flagged 2 items |
| James Wilson | Mountain Retreat Cabin | Submitted report 2 days ago |
| Sarah Johnson | Lakeside Villa | Submitted report today |
| Mike Chen | Downtown Loft | Submitted report 2 days ago |
| Lisa Park | Urban Studio | Submitted report 4 days ago |

### Cleaning Report History (Last 7 Days)

```
Day 1 (Yesterday):
  - Oceanview Beach House: Maria Garcia
    - Cleaned: Bath, Kitchen, Beds, Living
    - Notes: "Property was in good condition. Restocked toiletries."
    - Items restocked: 4

Day 2:
  - Downtown Loft: Mike Chen
    - Cleaned: Bath, Kitchen, Beds, Living
    - Notes: "Guest left early. Minimal cleaning needed."
    - Items restocked: 2

Day 3:
  - Mountain Retreat Cabin: James Wilson
    - Cleaned: Bath, Kitchen, Beds, Living
    - Notes: "Deep cleaned. Extra blanket was used, replaced."
    - Items restocked: 6

Day 4:
  - Lakeside Villa: Sarah Johnson (today)
    - Cleaned: Bath, Kitchen, Beds, Living
    - Notes: "Busy weekend - multiple items running low."
    - Items restocked: 3
```

### Warehouse Inventory (Realistic Stock Levels)

Show variety: some items well-stocked, some low, some critical:

| Category | Item | Stock | Status |
|----------|------|-------|--------|
| Bathroom | Charmin Toilet Paper (4-pack) | 24/50 | OK |
| Bathroom | Softsoap Hand Soap | 8/20 | LOW |
| Bathroom | White Bath Towels (6-pack) | 18/36 | OK |
| Kitchen | Keurig K-Cup Variety (72ct) | 8/20 | LOW |
| Kitchen | Glad Trash Bags (110ct) | 4/12 | LOW |
| Cleaning | Febreze Air Freshener (2ct) | 10/24 | LOW |
| Cleaning | Clorox Wipes (75ct) | 12/24 | OK |
| Amenities | Bottled Water (40ct) | 5/12 | LOW |

---

## Part 3: Demo UX Flow (N3 Deliverable)

### Demo Entry Points

#### Option A: "See Demo" Button (Current - Landing Page)
**Enhancement:** Change destination from `/admin/dashboard` to `/demo` (new demo launcher page)

#### Option B: Demo Launcher Page (`/demo`)
New page with three paths:

```
+------------------------------------------+
|                                          |
|       Experience Rental Helper           |
|                                          |
|  Choose how you want to explore:         |
|                                          |
|  [1. Guided Tour]     <- 3 min           |
|     Interactive walkthrough with         |
|     tooltips showing key features        |
|                                          |
|  [2. Watch Video]     <- 90 sec          |
|     Quick overview of all features       |
|                                          |
|  [3. Explore Demo]    <- Self-paced      |
|     Jump right in with sample data       |
|                                          |
+------------------------------------------+
```

### Guided Tour Flow (7 Steps)

**Step 1: Dashboard Overview (10 sec)**
- Highlight: Stats cards at top
- Tooltip: "See all your properties at a glance. Red means action needed."
- Action: Auto-advance after 3 seconds

**Step 2: Critical Property Alert (15 sec)**
- Highlight: Oceanview Beach House card (critical status)
- Tooltip: "This property needs attention! Cleaners reported items running low."
- Action: User clicks to expand

**Step 3: Supply Request Notification (15 sec)**
- Highlight: Cleaner Requests section
- Tooltip: "Maria flagged these items as running low after yesterday's cleaning."
- Action: User clicks "Buy" button

**Step 4: One-Click Amazon (10 sec)**
- Highlight: Amazon cart popup/confirmation
- Tooltip: "One click adds the exact quantity needed to your Amazon cart. No math required!"
- Action: User clicks to continue

**Step 5: Cleaner App Preview (20 sec)**
- Highlight: Show mobile view/screenshot
- Tooltip: "Your cleaners see this simple checklist. Count items, check off rooms, flag issues."
- Action: Click "See Cleaner View"

**Step 6: Cleaner Checklist Demo (20 sec)**
- Navigate to: `/cleaner/[propertyId]`
- Tooltip: "Cleaners tap to count each item. Takes about 2 minutes per property."
- Action: Let user interact with +/- buttons

**Step 7: Tour Complete (15 sec)**
- Modal: Celebration/completion
- Content: "You've seen the core workflow! Ready to try it with your own properties?"
- CTA: "Start Free Trial" | "Continue Exploring Demo"

### Demo Mode Indicators

#### Banner Component
Persistent banner at top of all demo pages:

```
+------------------------------------------------------------------+
| DEMO MODE  |  Exploring with sample data  |  [Exit Demo] [Sign Up] |
+------------------------------------------------------------------+
```

- Semi-transparent background
- Doesn't interfere with core UI
- Always visible reminder this is demo
- Easy escape hatches

#### Demo Badge on Data
Add subtle "(Demo)" indicator on sample properties/data:

```
Oceanview Beach House (Demo)
123 Coastal Drive, Malibu, CA
```

### Reset Functionality

Add "Reset Demo" button in demo banner or settings:

```javascript
// Reset behavior:
1. Clear all demo user data
2. Re-run seed-demo script
3. Redirect to /demo start page
4. Show toast: "Demo data has been reset!"
```

### Mobile Demo Experience

The cleaner app portion should be demonstrated on mobile viewport:

1. On desktop: Show phone mockup frame around cleaner UI
2. On mobile: Seamless native experience
3. Consider: QR code to open cleaner demo on phone while viewing manager demo on desktop

---

## Part 4: Implementation Roadmap

### Phase 1: Foundation (Week 1) - HIGH PRIORITY

| Task | Effort | Priority |
|------|--------|----------|
| Create `/demo` launcher page | 4h | P0 |
| Add demo mode banner component | 2h | P0 |
| Enhance seed-demo data per spec above | 4h | P0 |
| Add realistic cleaner names to reports | 1h | P0 |
| Add demo indicator badges | 2h | P1 |

**Total:** ~13 hours

### Phase 2: Guided Tour (Week 2) - MEDIUM PRIORITY

| Task | Effort | Priority |
|------|--------|----------|
| Integrate tooltip library (react-joyride or similar) | 3h | P1 |
| Create 7-step tour configuration | 4h | P1 |
| Add tour state management (resume/skip) | 3h | P1 |
| Style tooltips to match brand | 2h | P2 |
| Add tour completion tracking (analytics) | 2h | P2 |

**Total:** ~14 hours

### Phase 3: Polish (Week 3) - LOWER PRIORITY

| Task | Effort | Priority |
|------|--------|----------|
| Create 90-second demo video | 8h | P2 |
| Add mobile phone frame for cleaner preview | 3h | P2 |
| Add "Reset Demo" functionality | 2h | P2 |
| Add demo analytics/tracking | 3h | P2 |
| A/B test different tour lengths | 4h | P3 |

**Total:** ~20 hours

### Phase 4: Advanced (Future)

| Task | Notes |
|------|-------|
| AI-personalized tours | Adapt based on user behavior |
| Role-specific demos | Separate flows for hosts vs property managers |
| Comparison demo | "Before Rental Helper vs After" |
| Integration demos | Show Airbnb/VRBO sync capabilities |

---

## Part 5: Technical Implementation Notes

### Recommended Libraries

**For Guided Tours:**
- `react-joyride` - Most popular, good for tooltips + modals
- `@reactour/tour` - Lightweight alternative
- `driver.js` - Framework agnostic, works well with Next.js

**For Demo Video:**
- Embed from YouTube/Vimeo (SEO benefits)
- Or use Loom embed for quick recording

### State Management

```typescript
// Demo state to track
interface DemoState {
  isDemoMode: boolean;
  tourStep: number;
  tourCompleted: boolean;
  viewedSections: string[];
  startedAt: Date;
}

// Store in:
// - localStorage for persistence
// - Context for React access
// - Send to analytics on completion
```

### URL Structure

```
/demo                    - Demo launcher page
/demo/tour               - Start guided tour (auto-redirects through flow)
/admin/dashboard?demo=1  - Dashboard in demo mode
/cleaner?demo=1          - Cleaner app in demo mode
```

### Analytics Events to Track

```javascript
// Key events
demo_started
demo_tour_step_completed (step_number, step_name)
demo_tour_skipped (at_step)
demo_tour_completed (duration_seconds)
demo_video_played
demo_video_completed (watch_percentage)
demo_signup_clicked (from_location)
demo_reset_clicked
```

---

## Part 6: Success Metrics

### Primary KPIs

| Metric | Current | Target |
|--------|---------|--------|
| Demo → Signup conversion | Unknown | 15% |
| Tour completion rate | N/A | 60% |
| Avg time in demo | Unknown | 3 min |
| Demo bounce rate | Unknown | < 40% |

### Secondary KPIs

| Metric | Target |
|--------|--------|
| Video play rate | 40% of demo visitors |
| Video completion rate | 70% of plays |
| Cleaner app preview views | 50% of tour completers |
| "Reset Demo" usage | < 20% (indicates confusion) |

---

## Appendix A: Competitor Demo Analysis

### Hostaway
- Offers personalized demo booking
- "Fantastic onboarding experience" per reviews
- Users report accomplishing "more in 3 weeks than 2 years with previous system"

### iGMS
- All-inclusive onboarding package
- Personalized assistance approach
- Data-driven market insights included

### Key Differentiator for Rental Helper
Our demo should emphasize:
1. **Simplicity** - Show the 2-minute cleaner workflow
2. **Immediate value** - One-click Amazon ordering
3. **Real scenario** - "Your cleaner just texted asking about toilet paper"

---

## Appendix B: Sample Tooltip Copy

**Step 1 - Dashboard:**
> "This is your command center. Green means you're good. Yellow means running low. Red means act now."

**Step 2 - Critical Property:**
> "Oceanview Beach House needs attention. Maria cleaned yesterday and flagged some issues."

**Step 3 - Supply Request:**
> "Maria noticed you're out of trash bags and low on soap. She flagged it right from her phone."

**Step 4 - Amazon Integration:**
> "One click. The right quantity. Added to your Amazon cart. That's it."

**Step 5 - Cleaner App:**
> "This is what Maria sees. Simple counters for each item. Takes 2 minutes after each cleaning."

**Step 6 - Counting Items:**
> "Try it! Tap the numbers to adjust counts. This is exactly how your cleaners will use it."

**Step 7 - Tour Complete:**
> "You just saw the full loop: Cleaner counts → You see alerts → One-click restock. Ready to eliminate stockouts at your properties?"

---

## Appendix C: Mobile-First Considerations

The cleaner app is the "wow moment" of the demo. Mobile experience is critical:

1. **Responsive Demo Page:** Demo launcher must work on mobile
2. **Touch-Friendly Tour:** Tooltips should be tap-friendly
3. **QR Code Option:** Desktop users can scan to try cleaner app on phone
4. **PWA Demo:** Demonstrate offline capability with service worker

---

## Next Steps

1. **Review this plan** with stakeholders
2. **Approve Phase 1** implementation
3. **Set up analytics** tracking before launch
4. **Create demo video script** (parallel to Phase 1)
5. **User test** with 3-5 target customers before full rollout

---

*Document prepared by NAT Creative Director team*
*Research sources: Navattic, Userpilot, Appcues, UX Design Institute, Hostaway, iGMS*
