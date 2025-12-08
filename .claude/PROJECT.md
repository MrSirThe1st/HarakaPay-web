# HarakaPay Project Patterns

## Database Authorization Pattern

- **RLS is rarely used** - Most tables have no Row Level Security policies
- **API routes use `createAdminClient()`** - Bypasses RLS via service role
- **Authorization happens in API code** - Not at database level
- **RLS provides defense-in-depth** - Basic policies for backup security

When adding new features:
- Enable RLS on new tables (basic/restrictive policies)
- Use `createAdminClient()` in API routes for all DB operations
- Implement authorization checks in API route logic