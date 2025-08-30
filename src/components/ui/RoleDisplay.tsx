// src/components/ui/RoleDisplay.tsx - NO PARENTS
"use client";

import { useDualAuth } from "@/shared/hooks/useDualAuth";

export function RoleDisplay() {
  const { profile, canAccessAdminPanel, canAccessSchoolPanel } = useDualAuth();

  if (!profile) {
    return (
      <div className="role-display p-4 bg-yellow-50 rounded-lg shadow-sm border border-yellow-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="px-3 py-1 rounded-full text-sm font-medium text-yellow-800 bg-yellow-100">
            Profile Not Found
          </div>
        </div>
        
        <div className="text-sm text-yellow-700">
          <p className="font-medium mb-2">⚠️ User Profile Missing</p>
          <p>Your user account exists but no profile has been created in the database.</p>
          <p className="mt-2">Please contact an administrator to create your profile.</p>
        </div>
      </div>
    );
  }

  const getRoleDisplayName = (role: string) => {
    const roleNames = {
      super_admin: "Super Administrator",
      platform_admin: "Platform Administrator", 
      support_admin: "Support Administrator",
      school_admin: "School Administrator",
      school_staff: "School Staff"
    };
    return roleNames[role as keyof typeof roleNames] || role;
  };

  const getRoleColor = (role: string) => {
    const roleColors = {
      super_admin: "text-red-600 bg-red-100",
      platform_admin: "text-blue-600 bg-blue-100",
      support_admin: "text-green-600 bg-green-100", 
      school_admin: "text-purple-600 bg-purple-100",
      school_staff: "text-orange-600 bg-orange-100"
    };
    return roleColors[role as keyof typeof roleColors] || "text-gray-600 bg-gray-100";
  };

  const getPermissions = () => {
    const permissions = [];
    
    if (canAccessAdminPanel) {
      permissions.push("Admin Panel Access");
    }
    
    if (canAccessSchoolPanel) {
      permissions.push("School Panel Access");
    }
    
    if (profile.role === "super_admin") {
      permissions.push("Full System Control", "User Management", "System Settings");
    }
    
    if (profile.role === "platform_admin") {
      permissions.push("School Management", "School Onboarding");
    }
    
    if (profile.role === "support_admin") {
      permissions.push("Data Management", "Support Tools");
    }
    
    if (profile.role === "school_admin") {
      permissions.push("School Control", "Staff Management", "Payment Settings");
    }
    
    if (profile.role === "school_staff") {
      permissions.push("Student Management", "Payment Viewing");
    }
    
    return permissions;
  };

  return (
    <div className="role-display p-4 bg-white rounded-lg shadow-sm border">
      <div className="flex items-center gap-3 mb-3">
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(profile.role)}`}>
          {getRoleDisplayName(profile.role)}
        </div>
        {profile.admin_type && (
          <div className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-600">
            {profile.admin_type.replace('_', ' ')}
          </div>
        )}
      </div>
      
      <div className="text-sm text-gray-600 mb-3">
        <p><strong>Name:</strong> {profile.first_name} {profile.last_name}</p>
        {profile.school_id && (
          <p><strong>School ID:</strong> {profile.school_id}</p>
        )}
        {profile.phone && (
          <p><strong>Phone:</strong> {profile.phone}</p>
        )}
      </div>
      
      <div className="text-sm">
        <p className="font-medium text-gray-700 mb-2">Permissions:</p>
        <ul className="space-y-1">
          {getPermissions().map((permission, index) => (
            <li key={index} className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              {permission}
            </li>
          ))}
        </ul>
      </div>
      
      {profile.permissions && Object.keys(profile.permissions).length > 0 && (
        <div className="mt-3 pt-3 border-t">
          <p className="text-xs text-gray-500">
            <strong>Custom Permissions:</strong> {JSON.stringify(profile.permissions)}
          </p>
        </div>
      )}
    </div>
  );
}
