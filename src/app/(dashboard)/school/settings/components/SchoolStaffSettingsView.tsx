// src/app/(dashboard)/school/settings/components/SchoolStaffSettingsView.tsx
"use client";

import React from 'react';
import { 
  Cog6ToothIcon, 
  BuildingOfficeIcon, 
  BellIcon, 
  ShieldCheckIcon,
  AcademicCapIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';

export function SchoolStaffSettingsView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">School Settings</h1>
        <p className="text-gray-600">Configure your school's preferences and settings</p>
      </div>

      {/* Settings Categories */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* School Information */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center mb-4">
              <BuildingOfficeIcon className="h-6 w-6 text-blue-500 mr-3" />
              <h3 className="text-lg font-medium text-gray-900">School Information</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">School Name</span>
                <span className="text-sm font-medium text-gray-900">Haraka Academy</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Address</span>
                <span className="text-sm font-medium text-gray-900">123 Education St</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Contact Email</span>
                <span className="text-sm font-medium text-gray-900">admin@haraka.edu</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Phone</span>
                <span className="text-sm font-medium text-gray-900">+1 (555) 123-4567</span>
              </div>
            </div>
          </div>
        </div>

        {/* Academic Settings */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center mb-4">
              <AcademicCapIcon className="h-6 w-6 text-green-500 mr-3" />
              <h3 className="text-lg font-medium text-gray-900">Academic Settings</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Academic Year</span>
                <span className="text-sm font-medium text-gray-900">2024-2025</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Grading System</span>
                <span className="text-sm font-medium text-gray-900">A-F Scale</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Attendance Policy</span>
                <span className="text-sm font-medium text-gray-900">Strict</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Max Class Size</span>
                <span className="text-sm font-medium text-gray-900">25 Students</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Settings */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center mb-4">
              <CreditCardIcon className="h-6 w-6 text-purple-500 mr-3" />
              <h3 className="text-lg font-medium text-gray-900">Payment Settings</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Currency</span>
                <span className="text-sm font-medium text-gray-900">USD ($)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Payment Methods</span>
                <span className="text-sm font-medium text-gray-900">Credit Card, Bank Transfer</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Late Fee Policy</span>
                <span className="text-sm font-medium text-gray-900">$25 after 30 days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Auto-billing</span>
                <span className="text-sm font-medium text-green-600">Enabled</span>
              </div>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center mb-4">
              <ShieldCheckIcon className="h-6 w-6 text-red-500 mr-3" />
              <h3 className="text-lg font-medium text-gray-900">Security</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">2FA Required</span>
                <span className="text-sm font-medium text-green-600">Enabled</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Session Timeout</span>
                <span className="text-sm font-medium text-gray-900">8 hours</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Password Policy</span>
                <span className="text-sm font-medium text-green-600">Strong</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Login Attempts</span>
                <span className="text-sm font-medium text-gray-900">5 attempts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center mb-4">
              <BellIcon className="h-6 w-6 text-orange-500 mr-3" />
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
                <span className="text-sm text-gray-600">Payment Alerts</span>
                <span className="text-sm font-medium text-green-600">Enabled</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">System Updates</span>
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

      {/* Action Buttons */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Actions
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <button className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              <BuildingOfficeIcon className="h-4 w-4 mr-2" />
              Edit School Info
            </button>
            <button className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              <ShieldCheckIcon className="h-4 w-4 mr-2" />
              Security Settings
            </button>
            <button className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              <BellIcon className="h-4 w-4 mr-2" />
              Notification Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
