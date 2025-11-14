# API Auth Middleware Migration Guide

This guide explains how to migrate your existing API routes to use the new shared authentication middleware.

## Benefits

- ✅ **70+ routes reduced** from ~35 lines to ~8 lines of auth code
- ✅ **Centralized auth logic** - easier to maintain and update
- ✅ **Consistent error handling** across all routes
- ✅ **Type-safe** with full TypeScript support
- ✅ **Smaller bundle size** - less duplicate code

---

## Before & After

### ❌ Before (35 lines of duplicate code)

```typescript
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';
import { createAdminClient } from '@/lib/supabaseServerOnly';

export async function GET(req: Request) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const adminClient = createAdminClient();
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('role, school_id, is_active')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ success: false, error: 'User profile not found' }, { status: 404 });
    }

    if (!profile.is_active) {
      return NextResponse.json({ success: false, error: 'Account inactive' }, { status: 403 });
    }

    if (!['school_admin', 'school_staff'].includes(profile.role)) {
      return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
    }

    // Your actual business logic here...
  } catch (error) {
    // Error handling...
  }
}
```

### ✅ After (8 lines!)

```typescript
import { NextResponse } from 'next/server';
import { authenticateRequest, isAuthError } from '@/lib/apiAuth';

export async function GET(req: Request) {
  try {
    const authResult = await authenticateRequest({
      requiredRoles: ['school_admin', 'school_staff'],
      requireSchool: true,
      requireActive: true
    });

    if (isAuthError(authResult)) {
      return authResult;
    }

    const { profile, adminClient } = authResult;

    // Your actual business logic here...
  } catch (error) {
    // Error handling...
  }
}
```

---

## Migration Steps

### Step 1: Update imports

**Remove:**
```typescript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';
import { createAdminClient } from '@/lib/supabaseServerOnly'; // Usually not needed
```

**Add:**
```typescript
import { authenticateRequest, isAuthError } from '@/lib/apiAuth';
```

### Step 2: Replace auth code

**Replace this pattern:**
```typescript
const supabase = createRouteHandlerClient<Database>({ cookies });
const { data: { user }, error: authError } = await supabase.auth.getUser();
// ... 30+ more lines of auth checks
```

**With:**
```typescript
const authResult = await authenticateRequest({
  requiredRoles: ['role1', 'role2'], // Optional
  requireSchool: true/false,         // Optional, default: false
  requireActive: true/false          // Optional, default: true
});

if (isAuthError(authResult)) {
  return authResult; // Returns error response
}

const { user, profile, adminClient } = authResult;
```

### Step 3: Configure auth options

Choose the appropriate options for your route:

```typescript
// School-only routes (students, fees, etc.)
const authResult = await authenticateRequest({
  requiredRoles: ['school_admin', 'school_staff'],
  requireSchool: true,
  requireActive: true
});

// Platform admin routes
const authResult = await authenticateRequest({
  requiredRoles: ['super_admin', 'platform_admin'],
  requireActive: true
});

// Mixed access (admins or school staff)
const authResult = await authenticateRequest({
  requiredRoles: ['super_admin', 'platform_admin', 'school_admin', 'school_staff'],
  requireActive: true
});

// Any authenticated user
const authResult = await authenticateRequest({
  requireActive: true
});
```

---

## Examples by Route Type

### School-specific routes (require school_id)

```typescript
// src/app/api/students/route.ts
// src/app/api/school/fees/route.ts
// src/app/api/school/payments/route.ts

const authResult = await authenticateRequest({
  requiredRoles: ['school_admin', 'school_staff'],
  requireSchool: true,
  requireActive: true
});

if (isAuthError(authResult)) {
  return authResult;
}

const { profile, adminClient } = authResult;
const school_id = profile.school_id!; // Guaranteed to exist
```

### Platform admin routes

```typescript
// src/app/api/admin/schools/route.ts
// src/app/api/admin/users/route.ts

const authResult = await authenticateRequest({
  requiredRoles: ['super_admin', 'platform_admin', 'support_admin'],
  requireActive: true
});

if (isAuthError(authResult)) {
  return authResult;
}

const { profile, adminClient } = authResult;
```

### Dashboard/Stats routes (mixed access)

```typescript
// src/app/api/dashboard/stats/route.ts

const authResult = await authenticateRequest({
  requiredRoles: ['super_admin', 'platform_admin', 'support_admin', 'school_admin', 'school_staff'],
  requireActive: true
});

if (isAuthError(authResult)) {
  return authResult;
}

const { profile, adminClient } = authResult;

// Branch based on role
if (['super_admin', 'platform_admin', 'support_admin'].includes(profile.role)) {
  // Platform-wide stats
} else {
  // School-specific stats
}
```

---

## What You Get

### AuthResult object

```typescript
{
  user: User,              // Supabase user object
  profile: UserProfile,    // Full profile with role, school_id, etc.
  adminClient: SupabaseClient  // Admin client for database operations
}
```

### UserProfile type

```typescript
{
  id: string;
  user_id: string;
  role: string;
  school_id?: string | null;
  is_active: boolean;
  // ... other profile fields
}
```

---

## Common Patterns

### 1. School ID access

```typescript
const { profile } = authResult;

// If requireSchool: true
const school_id = profile.school_id!; // Safe to use !

// If requireSchool: false (handle both cases)
const school_id = profile.school_id || null;
```

### 2. Role-based logic

```typescript
const { profile } = authResult;

if (profile.role === 'super_admin') {
  // Super admin logic
} else if (profile.role === 'school_admin') {
  // School admin logic
}
```

### 3. Database queries

```typescript
const { adminClient, profile } = authResult;

// Use adminClient for all database operations
const { data, error } = await adminClient
  .from('students')
  .select('*')
  .eq('school_id', profile.school_id);
```

---

## Routes to Migrate (70+ total)

You can apply this pattern to these routes:

### Students
- `/api/students/route.ts` ✅ **Done**
- `/api/students/[id]/route.ts`
- `/api/students/bulk-import/route.ts`
- `/api/students/bulk-delete/route.ts`

### Payments
- `/api/school/payments/route.ts` ✅ **Done**
- `/api/payments/route.ts`
- `/api/payments/[id]/route.ts`
- `/api/payments/simulate-webhook/route.ts`

### Dashboard
- `/api/dashboard/stats/route.ts` ✅ **Done**

### Fees
- `/api/school/fees/structures/route.ts`
- `/api/school/fees/structures/[id]/route.ts`
- `/api/school/fees/categories/route.ts`
- `/api/school/fees/payment-plans/route.ts`
- `/api/school/fees/academic-years/route.ts`

### Schools
- `/api/schools/route.ts`
- `/api/schools/[id]/route.ts`
- `/api/schools/settings/route.ts`

### Staff
- `/api/staff/route.ts`
- `/api/staff/[id]/route.ts`

### Admin routes
- `/api/admin/**/*.ts` (all admin routes)

...and 50+ more routes!

---

## Tips

1. **Search and replace carefully** - Each route might have slight variations
2. **Test after migration** - Verify auth still works correctly
3. **Check role requirements** - Make sure requiredRoles matches the old logic
4. **Update in batches** - Migrate similar routes together (all student routes, then payment routes, etc.)
5. **Keep adminClient** - You still need it for database operations

---

## Need Help?

The shared middleware is in: `/src/lib/apiAuth.ts`

Key functions:
- `authenticateRequest(options)` - Main auth function
- `isAuthError(result)` - Type guard to check for errors
