// src/app/dashboard/page.tsx - UPDATED FOR NEW ROLE HIERARCHY
"use client";

import { useDualAuth } from "@/shared/hooks/useDualAuth";
import { RoleBasedRoute } from "@/shared/auth/RoleBasedRoute";
import { AdminDashboard } from "@/admin/components/AdminDashboard";
import { SchoolStaffDashboard } from "@/school-staff/components/SchoolStaffDashboard";
import { RoleDisplay } from "@/components/ui/RoleDisplay";
import { RoleBasedNavigation } from "@/components/navigation/RoleBasedNavigation";

export default function DashboardPage() {
  const { 
    canAccessAdminPanel, 
    canAccessSchoolPanel,
    isSuperAdmin,
    isPlatformAdmin,
    isSupportAdmin,
    isSchoolAdmin,
    isSchoolStaff
  } = useDualAuth();

  // Temporary debugging - remove this after fixing
  console.log('Environment check:', {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Found' : '❌ Missing',
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Found' : '❌ Missing'
  });

  const renderDashboard = () => {
    if (canAccessAdminPanel) {
      return <AdminDashboard />;
    } else if (canAccessSchoolPanel) {
      return <SchoolStaffDashboard />;
    }
    return null;
  };

  return (
    <RoleBasedRoute requiredRole="any">
      <div className="dashboard-container">
        {/* Role Information Display */}
        <div className="mb-6">
          <RoleDisplay />
        </div>
        
        {/* Role-Based Navigation */}
        <div className="mb-6">
          <RoleBasedNavigation />
        </div>
        
        {/* Main Dashboard Content */}
        <div className="dashboard-content">
          {renderDashboard()}
        </div>
      </div>
    </RoleBasedRoute>
  );
}
