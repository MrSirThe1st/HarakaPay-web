# HarakaPay Performance Optimization Guide

## ✅ Already Implemented (Good Job!)
- ✅ Code splitting in next.config.ts (Supabase, Radix UI, Heroicons chunks)
- ✅ Dynamic imports for modals (SchoolStaffStudentsView.tsx)
- ✅ Client-side caching in hooks (useStudents, useStaff)
- ✅ Console.log removal in production
- ✅ Memory optimization (memoization in components)

## 🚀 High-Impact Optimizations (Do These First)

### 1. Font Optimization (✅ DONE)
**Impact:** 2-3 seconds improvement on first load
**Status:** Implemented in src/app/layout.tsx

### 2. API Route Caching
**Impact:** 50-80% faster repeated API calls
**Implementation:**

Add to frequently-accessed routes:
```typescript
// For rarely-changing data (grade levels, academic years)
export const revalidate = 300; // 5 minutes

// For settings/school data
export const revalidate = 60; // 1 minute

// For stats/dashboards
export const revalidate = 30; // 30 seconds
```

**Routes to add caching:**
- [x] `/api/students/levels` (5 min)
- [ ] `/api/academic-years` (5 min)
- [ ] `/api/schools/settings` (1 min)
- [ ] `/api/school/fees/categories` (5 min)
- [ ] `/api/dashboard/stats` (30 sec)

### 3. Replace <img> with Next.js Image Component
**Impact:** 40-60% smaller images, lazy loading
**Current usage:** 7 files using `<img>` tags

**Files to fix:**
```
src/components/landing/HeroSection.tsx
src/components/school/layout/SchoolTopbar.tsx
src/app/(dashboard)/school/store/components/ItemFormModal.tsx
src/app/(dashboard)/school/store/components/ItemsListView.tsx
src/app/(dashboard)/school/fees/receipts/components/ReceiptPreview.tsx
src/app/(dashboard)/school/settings/components/SchoolStaffSettingsView.tsx
src/app/(dashboard)/school/fees/receipts/components/ReceiptConfigPanel.tsx
```

**Example fix:**
```tsx
// Before:
<img src="/okapi.png" alt="Logo" />

// After:
import Image from 'next/image';
<Image src="/okapi.png" alt="Logo" width={200} height={200} priority />
```

### 4. Database Query Optimization
**Impact:** 30-50% faster API responses

**Add database indexes:**
```sql
-- Students table
CREATE INDEX IF NOT EXISTS idx_students_school_grade
ON students(school_id, grade_level);

CREATE INDEX IF NOT EXISTS idx_students_status
ON students(school_id, status);

-- Profiles table
CREATE INDEX IF NOT EXISTS idx_profiles_role_school
ON profiles(role, school_id, is_active);

-- Fee structures
CREATE INDEX IF NOT EXISTS idx_fee_structures_active
ON fee_structures(school_id, academic_year_id, is_active);
```

### 5. Reduce Client-Side Bundle Size
**Current:** 402MB build size (too large!)

**Actions:**
a) Remove unused dependencies:
```bash
npm uninstall @supabase/auth-helpers-nextjs  # Already replaced with @supabase/ssr
```

b) Add package analysis:
```bash
npm install --save-dev @next/bundle-analyzer
```

```typescript
// next.config.ts
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

export default withBundleAnalyzer(nextConfig);
```

Run: `ANALYZE=true npm run build` to see what's taking up space.

### 6. Optimize Heroicons Usage
**Impact:** Reduce bundle by 100-200KB

**Current:** Importing individual icons (good!)
**Optimization:** Use shared icon imports

Create `src/lib/icons.ts`:
```typescript
// Centralize commonly-used icons
export {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

export {
  CheckCircleIcon as CheckCircleIconSolid,
  ExclamationCircleIcon as ExclamationCircleIconSolid,
} from '@heroicons/react/24/solid';
```

### 7. Add Lazy Loading to Large Tables
**Impact:** Faster initial page load

**Implementation (Virtual Scrolling):**
```bash
npm install react-window
```

For tables with 100+ rows, use virtualization:
```tsx
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={students.length}
  itemSize={60}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      {/* Student row component */}
    </div>
  )}
</FixedSizeList>
```

## 🔧 Medium-Impact Optimizations

### 8. Server Components Where Possible
Convert static/rarely-changing components to Server Components:

**Good candidates:**
- Dashboard layouts
- Static settings pages
- Fee categories list
- Academic years selector

**Example:**
```tsx
// Remove "use client" if component doesn't need:
// - useState, useEffect
// - Event handlers (onClick, onChange)
// - Browser APIs

// src/app/(dashboard)/school/fees/components/FeeCategoriesPage.tsx
// Remove "use client" and fetch data server-side
export default async function FeeCategoriesPage() {
  const categories = await getCategories(); // Server-side fetch
  return <CategoriesList categories={categories} />;
}
```

### 9. Optimize Supabase Queries
**Impact:** 20-40% faster database queries

**Current pattern (good):**
```typescript
.select('*', { count: 'exact' })
```

**Optimization - Only select needed fields:**
```typescript
// Instead of:
.select('*')

// Use:
.select('id, first_name, last_name, grade_level, status')
```

**In your hooks (useStudents.ts, useStaff.ts):**
```typescript
// Line 98-110 in useStudents.ts
const query = `
  id,
  student_id,
  first_name,
  last_name,
  grade_level,
  status,
  parent_name,
  parent_phone,
  created_at
`;

const response = await fetch(`/api/students?fields=${query}`);
```

### 10. Implement Pagination Prefetching
**Impact:** Instant page navigation

```typescript
// In useStudents.ts
const prefetchNextPage = useCallback(async () => {
  if (pagination.page < pagination.pages) {
    const nextPage = pagination.page + 1;
    // Silently prefetch next page
    fetch(`/api/students?page=${nextPage}&limit=${filters.limit}`)
      .then(res => res.json())
      .then(data => {
        // Store in cache
        studentsCache.set(`${nextPage}-${filters.limit}`, {
          data,
          timestamp: Date.now()
        });
      });
  }
}, [pagination, filters]);

// Call prefetchNextPage after loading current page
```

### 11. Compress API Responses
**Impact:** 60-70% smaller responses

Add to `next.config.ts`:
```typescript
const nextConfig: NextConfig = {
  compress: true, // Enable gzip compression

  // Add response headers
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, stale-while-revalidate=300',
          },
        ],
      },
    ];
  },
};
```

### 12. Add Loading Skeletons
**Impact:** Better perceived performance

Create `src/components/ui/Skeleton.tsx`:
```tsx
export function TableSkeleton() {
  return (
    <div className="animate-pulse">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-16 bg-gray-200 rounded mb-2" />
      ))}
    </div>
  );
}
```

Use in components:
```tsx
{loading ? <TableSkeleton /> : <StudentsTable students={students} />}
```

## 🎯 Advanced Optimizations (After Above Are Done)

### 13. Implement Service Worker for Offline Support
```bash
npx create-next-pwa
```

### 14. Add CDN for Static Assets
Host images, fonts, and static files on a CDN (Cloudflare, Vercel, AWS CloudFront).

### 15. Database Connection Pooling
Use Supabase connection pooling:
```typescript
const supabase = createClient(url, key, {
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-connection-name': 'harakapay-pool'
    }
  }
});
```

### 16. Implement React Query (TanStack Query)
Replace custom hooks with React Query for automatic caching, background refetching:

```bash
npm install @tanstack/react-query
```

### 17. Add Monitoring
Install performance monitoring:
```bash
npm install @vercel/analytics @vercel/speed-insights
```

```tsx
// src/app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

## 📊 Performance Metrics to Track

After implementing optimizations, track these:

1. **First Contentful Paint (FCP):** Target < 1.8s
2. **Largest Contentful Paint (LCP):** Target < 2.5s
3. **Time to Interactive (TTI):** Target < 3.8s
4. **Cumulative Layout Shift (CLS):** Target < 0.1
5. **First Input Delay (FID):** Target < 100ms

Use Lighthouse (Chrome DevTools) to measure before/after.

## 🔄 Implementation Priority

### Week 1 (Quick Wins):
1. ✅ Font optimization (DONE)
2. ✅ API route caching for /students/levels (DONE)
3. Add caching to other routes
4. Replace <img> with Next.js Image

### Week 2 (Medium Impact):
5. Database indexes
6. Bundle size analysis and cleanup
7. Remove @supabase/auth-helpers-nextjs
8. Optimize Supabase queries (select specific fields)

### Week 3 (Polish):
9. Virtual scrolling for large tables
10. Loading skeletons
11. Prefetch next page
12. Response compression

### Week 4 (Advanced):
13. Convert to Server Components where possible
14. React Query migration
15. Performance monitoring
16. CDN setup

## 📈 Expected Results

After implementing all high-impact optimizations:
- **Initial Load:** 40-60% faster
- **Navigation:** 60-80% faster
- **API Calls:** 50-70% faster
- **Bundle Size:** 30-40% smaller
- **User Experience:** Significantly smoother

## 🛠️ Quick Test Commands

```bash
# Build and check bundle size
npm run build

# Test production build locally
npm run build && npm start

# Analyze bundle
ANALYZE=true npm run build

# Check lighthouse score
npx lighthouse http://localhost:3000 --view
```
