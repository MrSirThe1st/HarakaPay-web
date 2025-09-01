'use client';

import React from 'react';
import { 
  BellIcon, 
  MagnifyingGlassIcon,
  ArrowRightOnRectangleIcon 
} from '@heroicons/react/24/outline';
import { supabase } from '@/lib/supabaseClient';
import { UserRole } from '@/lib/roleUtils';

interface TopBarProps {
  user: { id: string; email?: string; name?: string };
  profile: { role: UserRole; first_name?: string; last_name?: string };
}

export default function TopBar({ user, profile }: TopBarProps) {
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return 'Super Administrator';
      case 'platform_admin':
        return 'Platform Administrator';
      case 'support_admin':
        return 'Support Administrator';
      case 'school_admin':
        return 'School Administrator';
      case 'school_staff':
        return 'School Staff';
      case 'parent':
        return 'Parent';
      default:
        return 'User';
    }
  };

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Search */}
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Right side - Notifications and User */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="p-2 text-gray-400 hover:text-gray-500 relative">
            <BellIcon className="h-6 w-6" />
            <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-400"></span>
          </button>

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {user.email}
              </p>
              <p className="text-xs text-gray-500">
                {getRoleDisplayName(profile.role)}
              </p>
            </div>
            
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-700 text-sm font-medium">
                {user.email?.charAt(0).toUpperCase()}
              </span>
            </div>

            <button
              onClick={handleSignOut}
              className="p-2 text-gray-400 hover:text-gray-500"
              title="Sign out"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
