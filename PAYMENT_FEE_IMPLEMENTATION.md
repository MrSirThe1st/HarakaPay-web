# Payment Fee System Implementation Summary

## Overview
Platform payment fee system with dual approval workflow. Parents pay base fee + percentage, schools receive full amount, schools owe platform the percentage.

## What Was Built

### 1. Database (Migration: 20251203_payment_fee_system.sql)
- `payment_fee_rates` - fee rate configs with dual approval
- `payment_fee_rate_history` - immutable audit trail
- `transaction_fee_snapshots` - locked fee record per transaction
- RLS policies enabled (defense in depth)
- Functions: `get_active_payment_fee_rate()`, `expire_pending_fee_proposals()`

### 2. Types (/src/types/payment-fee.ts)
- Complete TypeScript definitions
- Status enums, interfaces, helper functions
- `calculateFee()` helper

### 3. API Routes

**Admin Routes:**
- `GET /api/admin/payment-fees` - list rates (with filters)
- `POST /api/admin/payment-fees` - propose new rate
- `POST /api/admin/payment-fees/[id]/approve` - approve rate
- `POST /api/admin/payment-fees/[id]/reject` - reject rate
- `GET /api/admin/payment-fees/reports` - amounts owed by schools

**School Routes:**
- `GET /api/school/payment-fees` - view school's rates
- `POST /api/school/payment-fees` - propose rate change (unused currently)
- `POST /api/school/payment-fees/[id]/approve` - school approves admin proposal
- `POST /api/school/payment-fees/[id]/reject` - school rejects admin proposal
- `GET /api/school/payment-fees/reports` - school's fees owed

**Payment Integration:**
- Modified `/api/payments/initiate/route.js`:
  - Calculates fee based on active rate (default 2.5%)
  - Creates immutable snapshot
  - Parent charged: base + fee
  - Returns `feeInfo` in response

### 4. Admin Dashboards

**Fee Management** (`/admin/payment-fees`):
- Stats cards (active rates, pending approval, avg rate, schools configured)
- Rates list with filters
- Create fee rate modal
- Approve/reject modals
- Hook: `usePaymentFeeStats`

**Reports** (`/admin/payment-fees/reports`):
- Total fees owed across all schools
- Per-school breakdown
- Date range filters
- CSV export

### 5. School Dashboards

**Settings** (`/school/settings/payment-fees`):
- Current active rate display
- Pending proposals requiring school approval
- Approve/reject modals
- Rate history

**Dashboard Widget** (`/school/dashboard/components/PaymentFeesWidget.tsx`):
- Summary card showing total owed
- Can be added to school dashboard

## Payment Flow

1. Parent initiates payment (e.g., KES 10,000)
2. System looks up active fee rate for school (e.g., 2.5%)
3. Calculates: base + fee = KES 10,000 + KES 250 = **KES 10,250**
4. Creates transaction snapshot (immutable record)
5. Charges parent KES 10,250 via M-Pesa
6. School receives KES 10,250
7. School owes platform KES 250 (tracked, paid manually/offline)

## Dual Approval Workflow

**Admin proposes:**
1. Admin creates rate → `pending_school`
2. School approves → `pending_admin`
3. Admin approves → `active`

**School proposes** (not implemented in UI):
1. School creates rate → `pending_admin`
2. Admin approves → `active`

Either party can reject at their step.

## Next Steps

### To Complete:
1. **Run migration**: `supabase db push` or apply migration file
2. **Test flows**:
   - Admin creates fee rate for school
   - School approves
   - Admin approves
   - Make test payment, verify fee calculated correctly
3. **Parent UI**: Update mobile app/parent portal to display fee breakdown at checkout (API already returns `feeInfo`)
4. **Add widget to school dashboard**: Import `PaymentFeesWidget` in `/src/app/(dashboard)/school/dashboard/page.tsx`

### Optional Enhancements:
- Email notifications for pending approvals
- Cron job to expire old proposals (calls `expire_pending_fee_proposals()`)
- Settlement tracking (when schools pay platform)
- Bulk rate management for multiple schools
- Rate change scheduling

## Files Created/Modified

### New Files:
- `supabase/migrations/20251203_payment_fee_system.sql`
- `src/types/payment-fee.ts`
- `src/hooks/usePaymentFeeStats.ts`
- `src/app/api/admin/payment-fees/route.ts`
- `src/app/api/admin/payment-fees/[id]/approve/route.ts`
- `src/app/api/admin/payment-fees/[id]/reject/route.ts`
- `src/app/api/admin/payment-fees/reports/route.ts`
- `src/app/api/school/payment-fees/route.ts`
- `src/app/api/school/payment-fees/[id]/approve/route.ts`
- `src/app/api/school/payment-fees/[id]/reject/route.ts`
- `src/app/api/school/payment-fees/reports/route.ts`
- `src/app/(dashboard)/admin/payment-fees/page.tsx`
- `src/app/(dashboard)/admin/payment-fees/components/*`
- `src/app/(dashboard)/admin/payment-fees/reports/page.tsx`
- `src/app/(dashboard)/admin/payment-fees/reports/components/*`
- `src/app/(dashboard)/school/settings/payment-fees/page.tsx`
- `src/app/(dashboard)/school/settings/payment-fees/components/*`
- `src/app/(dashboard)/school/dashboard/components/PaymentFeesWidget.tsx`

### Modified Files:
- `src/app/api/payments/initiate/route.js` - added fee calculation & snapshot

## Technical Notes

- All API routes use `createAdminClient()` (bypasses RLS)
- Authorization checks in API code (matches project pattern)
- Default fee: 2.5% if no active rate
- Snapshots are immutable (prevent disputes)
- Uses existing API cache system
- Follows project structure conventions
