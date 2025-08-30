// src/components/navigation/RoleBasedNavigation.tsx - NO PARENTS
"use client";

import { useDualAuth } from "@/shared/hooks/useDualAuth";
import Link from "next/link";

export function RoleBasedNavigation() {
  const {
    isSuperAdmin,
    isPlatformAdmin,
    isSupportAdmin,
    isSchoolAdmin,
    isSchoolStaff,
    canAccessAdminPanel,
    canAccessSchoolPanel,
  } = useDualAuth();

  return (
    <nav className="role-based-navigation">
      {/* Super Admin Navigation */}
      {isSuperAdmin && (
        <div className="nav-section">
          <h3>Super Admin</h3>
          <ul>
            <li><Link href="/admin">Admin Dashboard</Link></li>
            <li><Link href="/admin/users">Manage Users</Link></li>
            <li><Link href="/admin/schools">Manage Schools</Link></li>
            <li><Link href="/admin/system">System Settings</Link></li>
            <li><Link href="/admin/audit">Audit Logs</Link></li>
          </ul>
        </div>
      )}

      {/* Platform Admin Navigation */}
      {isPlatformAdmin && (
        <div className="nav-section">
          <h3>Platform Admin</h3>
          <ul>
            <li><Link href="/admin">Admin Dashboard</Link></li>
            <li><Link href="/admin/schools">Manage Schools</Link></li>
            <li><Link href="/admin/verification">School Verification</Link></li>
            <li><Link href="/admin/onboarding">School Onboarding</Link></li>
            <li><Link href="/school">School Interface</Link></li>
          </ul>
        </div>
      )}

      {/* Support Admin Navigation */}
      {isSupportAdmin && (
        <div className="nav-section">
          <h3>Support Admin</h3>
          <ul>
            <li><Link href="/admin">Admin Dashboard</Link></li>
            <li><Link href="/admin/support">Support Tools</Link></li>
            <li><Link href="/admin/data">Data Management</Link></li>
            <li><Link href="/school">School Interface</Link></li>
          </ul>
        </div>
      )}

      {/* School Admin Navigation */}
      {isSchoolAdmin && (
        <div className="nav-section">
          <h3>School Admin</h3>
          <ul>
            <li><Link href="/school">School Dashboard</Link></li>
            <li><Link href="/school/students">Manage Students</Link></li>
            <li><Link href="/school/staff">Manage Staff</Link></li>
            <li><Link href="/school/payments">Payment Settings</Link></li>
            <li><Link href="/school/reports">Reports</Link></li>
          </ul>
        </div>
      )}

      {/* School Staff Navigation */}
      {isSchoolStaff && (
        <div className="nav-section">
          <h3>School Staff</h3>
          <ul>
            <li><Link href="/school">School Dashboard</Link></li>
            <li><Link href="/school/students">Manage Students</Link></li>
            <li><Link href="/school/payments">View Payments</Link></li>
          </ul>
        </div>
      )}

      {/* Common Navigation for Admin Types */}
      {canAccessAdminPanel && (
        <div className="nav-section">
          <h3>Admin Tools</h3>
          <ul>
            <li><Link href="/admin">Admin Dashboard</Link></li>
            {isSuperAdmin && <li><Link href="/admin/users">User Management</Link></li>}
            <li><Link href="/admin/schools">School Management</Link></li>
            {isSuperAdmin && <li><Link href="/admin/system">System Settings</Link></li>}
          </ul>
        </div>
      )}

      {/* Common Navigation for School Level */}
      {canAccessSchoolPanel && (
        <div className="nav-section">
          <h3>School Tools</h3>
          <ul>
            <li><Link href="/school">School Dashboard</Link></li>
            <li><Link href="/school/students">Student Management</Link></li>
            <li><Link href="/school/payments">Payment Management</Link></li>
          </ul>
        </div>
      )}

      {/* Switch Interface Button for Admin Types */}
      {canAccessAdminPanel && (
        <div className="nav-section">
          <h3>Interface Switch</h3>
          <ul>
            <li><Link href="/admin">Admin Interface</Link></li>
            <li><Link href="/school">School Interface</Link></li>
          </ul>
        </div>
      )}
    </nav>
  );
}
