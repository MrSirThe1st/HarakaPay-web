# Migration Guide: From 2-Role to 5-Role System

This guide explains how to migrate your existing code from the old 2-role system (`admin` and `school_staff`) to the new 5-role hierarchy.

## 🔄 **What Changed**

### **Old System (2 Roles)**
- `admin` - Had access to everything
- `school_staff` - Limited school access

### **New System (5 Roles)**
- `super_admin` - Ultimate platform control
- `platform_admin` - School onboarding and management
- `support_admin` - Data management and support
- `school_admin` - School-level control
- `school_staff` - Limited school permissions

**Note:** Parents have a separate mobile application and are not part of this web platform.

## 📝 **Code Changes Made**

### **1. Updated Types (`src/types/user.ts`)**
```typescript
// OLD
role?: "admin" | "school_staff";

// NEW
role?: UserRole;
type UserRole = "super_admin" | "platform_admin" | "support_admin" | "school_admin" | "school_staff";
```

### **2. Enhanced Authentication Hook (`src/shared/hooks/useDualAuth.ts`)**
```typescript
// OLD
const isAdmin = authState.profile?.role === "admin";
const isSchoolStaff = authState.profile?.role === "school_staff";

// NEW
const isSuperAdmin = authState.profile?.role === "super_admin";
const isPlatformAdmin = authState.profile?.role === "platform_admin";
const isSupportAdmin = authState.profile?.role === "support_admin";
const isSchoolAdmin = authState.profile?.role === "school_admin";
const isSchoolStaff = authState.profile?.role === "school_staff";

// Legacy compatibility
const isAdmin = isSuperAdmin || isPlatformAdmin || isSupportAdmin;
```

### **3. Enhanced Role-Based Route (`src/shared/auth/RoleBasedRoute.tsx`)**
```typescript
// OLD
requiredRole: 'admin' | 'school_staff' | 'both' | ('admin' | 'school_staff')[];

// NEW
requiredRole: UserRole | UserRole[] | 'admin_type' | 'school_level' | 'any';
```

### **4. Updated Admin Page (`src/app/admin/page.tsx`)**
```typescript
// OLD
<RoleBasedRoute requiredRole="admin">

// NEW
<RoleBasedRoute requiredRole="admin_type">
```

## 🚀 **How to Use the New System**

### **Role Checking in Components**
```typescript
const { 
  isSuperAdmin, 
  isPlatformAdmin, 
  isSchoolAdmin, 
  canAccessAdminPanel,
  canAccessSchoolPanel 
} = useDualAuth();

// Check specific roles
if (isSuperAdmin) {
  // Show super admin features
}

// Check admin type access
if (canAccessAdminPanel) {
  // Show admin panel features
}

// Check school level access
if (canAccessSchoolPanel) {
  // Show school features
}
```

### **Route Protection**
```typescript
// Protect routes for specific roles
<RoleBasedRoute requiredRole="super_admin">
  <SuperAdminComponent />
</RoleBasedRoute>

// Protect routes for admin types
<RoleBasedRoute requiredRole="admin_type">
  <AdminComponent />
</RoleBasedRoute>

// Protect routes for school level
<RoleBasedRoute requiredRole="school_level">
  <SchoolComponent />
</RoleBasedRoute>

// Protect routes for multiple roles
<RoleBasedRoute requiredRole={["super_admin", "platform_admin"]}>
  <HighLevelAdminComponent />
</RoleBasedRoute>

// Protect routes with minimum role level
<RoleBasedRoute requiredRole="admin_type" minRole="platform_admin">
  <PlatformAdminComponent />
</RoleBasedRoute>
```

### **Conditional Rendering**
```typescript
// Show different content based on role
{isSuperAdmin && <SuperAdminFeatures />}
{isPlatformAdmin && <PlatformAdminFeatures />}
{isSchoolAdmin && <SchoolAdminFeatures />}
{isSchoolStaff && <SchoolStaffFeatures />}

// Show admin panel access
{canAccessAdminPanel && <AdminPanel />}

// Show school panel access
{canAccessSchoolPanel && <SchoolPanel />}
```

## 🔧 **Migration Steps for Your Existing Code**

### **Step 1: Update Role Checks**
Replace old role checks with new ones:

```typescript
// OLD
if (isAdmin) { ... }

// NEW
if (canAccessAdminPanel) { ... }
// OR
if (isSuperAdmin || isPlatformAdmin) { ... }
```

### **Step 2: Update Route Protection**
Update your existing routes:

```typescript
// OLD
<RoleBasedRoute requiredRole="admin">

// NEW
<RoleBasedRoute requiredRole="admin_type">
```

### **Step 3: Update Conditional Rendering**
Update your conditional rendering:

```typescript
// OLD
{isAdmin ? <AdminView /> : <SchoolView />}

// NEW
{canAccessAdminPanel ? <AdminView /> : <SchoolView />}
```

## 📱 **New Components Available**

### **1. RoleDisplay Component**
Shows user's current role and permissions:
```typescript
import { RoleDisplay } from "@/components/ui/RoleDisplay";

<RoleDisplay />
```

### **2. RoleBasedNavigation Component**
Shows navigation based on user's role:
```typescript
import { RoleBasedNavigation } from "@/components/navigation/RoleBasedNavigation";

<RoleBasedNavigation />
```

## 🔒 **Security Features**

### **Role Hierarchy**
- Higher roles can access lower role features
- Role escalation is prevented
- School isolation is enforced

### **Panel Access Control**
- `canAccessAdminPanel` - For admin types
- `canAccessSchoolPanel` - For school level

### **Permission Checking**
```typescript
const { hasRole, hasAnyRole, hasHigherRoleThan } = useDualAuth();

// Check specific role
if (hasRole("super_admin")) { ... }

// Check multiple roles
if (hasAnyRole(["super_admin", "platform_admin"])) { ... }

// Check minimum role level
if (hasHigherRoleThan("platform_admin")) { ... }
```

## 🧪 **Testing the New System**

### **1. Test Role Access**
- Login as different user types
- Verify correct navigation shows
- Verify correct permissions apply

### **2. Test Route Protection**
- Try accessing admin routes as school staff
- Try accessing school routes as different admin types
- Verify proper redirects

### **3. Test Conditional Rendering**
- Verify admin features show for admin types
- Verify school features show for school level

## 🆘 **Troubleshooting**

### **Common Issues**

1. **"Property does not exist on type"**
   - Make sure you're importing from the updated types
   - Check that you're using the new role names

2. **Routes not protecting properly**
   - Verify you're using the new `RoleBasedRoute` props
   - Check that role checking logic is correct

3. **Navigation not showing correctly**
   - Verify role checking in `RoleBasedNavigation`
   - Check that `useDualAuth` is returning correct values

### **Debug Role Information**
```typescript
const auth = useDualAuth();
console.log('Current role:', auth.profile?.role);
console.log('Can access admin panel:', auth.canAccessAdminPanel);
console.log('Can access school panel:', auth.canAccessSchoolPanel);
```

## 🎯 **Next Steps**

1. **Test the new system** with your super admin user
2. **Update existing components** to use new role checking
3. **Add new role-specific features** as needed
4. **Test all access patterns** to ensure security
5. **Update your UI** to show role information

## 📱 **Parent Access Note**

**Important:** Parents will never use this web application. They have a separate mobile application (React Native/Expo) that connects to the same database. This web platform is exclusively for:

- **Super Admins** - Platform owners
- **Platform Admins** - School onboarding and management
- **Support Admins** - Data management and support
- **School Admins** - School-level control
- **School Staff** - Limited school permissions

The new system provides much more granular control while maintaining backward compatibility through the legacy `isAdmin` property.
