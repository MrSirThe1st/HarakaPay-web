'use client';

import React from 'react';
import { useDualAuth } from '@/shared/hooks/useDualAuth';
import { UserIcon, EnvelopeIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { UserRole } from '@/lib/roleUtils';

export default function ProfilePage() {
  const { user, profile, loading } = useDualAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Profile not found</p>
        </div>
      </div>
    );
  }

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center space-x-5">
            <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
              <UserIcon className="h-8 w-8 text-gray-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {user.email}
              </h3>
              <p className="text-sm text-gray-500">
                {getRoleDisplayName(profile.role)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Account Information
          </h3>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <EnvelopeIcon className="h-4 w-4 mr-2" />
                Email Address
              </dt>
              <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <ShieldCheckIcon className="h-4 w-4 mr-2" />
                Role
              </dt>
              <dd className="mt-1 text-sm text-gray-900">{getRoleDisplayName(profile.role)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">User ID</dt>
              <dd className="mt-1 text-sm text-gray-900">{user.id}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Account Created</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Actions
          </h3>
          <div className="space-y-3">
            <button className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
              Edit Profile
            </button>
            <button className="w-full sm:w-auto bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors">
              Change Password
            </button>
            <button className="w-full sm:w-auto bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
