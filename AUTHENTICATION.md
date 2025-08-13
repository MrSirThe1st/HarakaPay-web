## Authentication System

This web platform includes a complete authentication system with role-based access control using Supabase.

### Features

- **User Authentication**: Sign up, sign in, sign out, password reset
- **Role-based Access Control**: Admin, School Staff roles
- **Protected Routes**: Middleware protection for dashboard routes
- **Client-side Hooks**: Easy-to-use React hooks for authentication state
- **TypeScript Support**: Fully typed authentication system

### User Roles

- **Admin**: Platform administrators who manage schools, monitor transactions, and access all features
- **School Staff**: School employees who manage their school's students, fees, and communications

**Note**: Students use the mobile app, not this web platform.

### Setup

1. **Environment Variables**

   ```bash
   cp .env.example .env.local
   ```

   Fill in your Supabase credentials in `.env.local`

2. **Database Schema**
   Run the SQL script in `database/setup.sql` in your Supabase SQL editor to create:
   - `profiles` table for user roles and school associations
   - `schools` table for school management
   - `students` table for student records (not user accounts)
   - `payments` table for fee tracking
   - Proper RLS policies for data security

### Route Protection

The middleware automatically protects dashboard routes:

- `/students` - School staff and admins (Student & School Management)
- `/payments` - School staff and admins (Payment Management)
- `/reports` - Admins only (Platform Analytics)
- `/settings` - Admins only (System Administration)

### Authentication Features Summary

- ✅ Admin and School Staff roles only
- ✅ School-based access control for staff
- ✅ Comprehensive school management system
- ✅ Student records management (not user accounts)
- ✅ Payment tracking and reporting
- ✅ Platform-wide analytics for admins
- ✅ Secure middleware protection
- ✅ TypeScript support throughout
