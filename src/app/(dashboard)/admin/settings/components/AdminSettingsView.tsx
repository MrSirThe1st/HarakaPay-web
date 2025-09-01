// src/app/(dashboard)/admin/settings/components/AdminSettingsView.tsx
"use client";

import React from 'react';
import { Cog6ToothIcon, ShieldCheckIcon, BellIcon } from '@heroicons/react/24/outline';

export function AdminSettingsView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Settings</h1>
        <p className="text-gray-600">Configure platform-wide settings and preferences</p>
      </div>

      {/* Settings Categories */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Platform Settings */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center mb-4">
              <Cog6ToothIcon className="h-6 w-6 text-blue-500 mr-3" />
              <h3 className="text-lg font-medium text-gray-900">Platform Settings</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Platform Name</span>
                <span className="text-sm font-medium text-gray-900">HarakaPay</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Version</span>
                <span className="text-sm font-medium text-gray-900">1.0.0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Maintenance Mode</span>
                <span className="text-sm font-medium text-green-600">Disabled</span>
              </div>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center mb-4">
              <ShieldCheckIcon className="h-6 w-6 text-green-500 mr-3" />
              <h3 className="text-lg font-medium text-gray-900">Security</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">2FA Required</span>
                <span className="text-sm font-medium text-green-600">Enabled</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Session Timeout</span>
                <span className="text-sm font-medium text-gray-900">24 hours</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Password Policy</span>
                <span className="text-sm font-medium text-green-600">Strong</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center mb-4">
              <BellIcon className="h-6 w-6 text-purple-500 mr-3" />
              <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Email Notifications</span>
                <span className="text-sm font-medium text-green-600">Enabled</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">SMS Notifications</span>
                <span className="text-sm font-medium text-gray-400">Disabled</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">System Alerts</span>
                <span className="text-sm font-medium text-green-600">Enabled</span>
              </div>
            </div>
          </div>
        </div>

        {/* Placeholder for future settings */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="text-center py-8">
              <Cog6ToothIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">More Settings</h3>
              <p className="mt-1 text-sm text-gray-500">
                Additional configuration options coming soon...
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
