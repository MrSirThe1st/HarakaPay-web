// src/app/(dashboard)/school/communications/components/SchoolStaffCommunicationsView.tsx
"use client";

import React, { useState } from 'react';
import { 
  ChatBubbleLeftRightIcon, 
  EnvelopeIcon, 
  BellIcon, 
  PlusIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from '@/hooks/useTranslation';

export function SchoolStaffCommunicationsView() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('Communications')}</h1>
        <p className="text-gray-600">{t('Manage school communications and notifications')}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <EnvelopeIcon className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {t('Total Messages')}
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    1,247
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {t('Delivered')}
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    1,189
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {t('Pending')}
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    58
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BellIcon className="h-6 w-6 text-purple-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {t('Active Campaigns')}
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    12
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('Search communications by subject, recipient, or content...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Type Filter */}
            <div className="sm:w-48">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">{t('All Types')}</option>
                <option value="email">{t('Email')}</option>
                <option value="sms">{t('SMS')}</option>
                <option value="notification">{t('Push Notification')}</option>
                <option value="announcement">{t('Announcement')}</option>
              </select>
            </div>

            {/* New Message Button */}
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
              <PlusIcon className="h-4 w-4 mr-2" />
              {t('New Message')}
            </button>
          </div>
        </div>
      </div>

      {/* Communication List Placeholder */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="text-center py-12">
            <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">{t('Communication Management')}</h3>
            <p className="mt-1 text-sm text-gray-500">
              {t('Message listing, composition, and management interface coming soon...')}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            {t('Quick Actions')}
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <button className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg border border-gray-200 hover:border-gray-300">
              <div>
                <span className="rounded-lg inline-flex p-3 bg-blue-50 text-blue-700 ring-4 ring-white">
                  <EnvelopeIcon className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  {t('Send Email')}
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {t('Compose and send email messages')}
                </p>
              </div>
            </button>

            <button className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg border border-gray-200 hover:border-gray-300">
              <div>
                <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-700 ring-4 ring-white">
                  <BellIcon className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  {t('Push Notification')}
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {t('Send instant app notifications')}
                </p>
              </div>
            </button>

            <button className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg border border-gray-200 hover:border-gray-300">
              <div>
                <span className="rounded-lg inline-flex p-3 bg-purple-50 text-purple-700 ring-4 ring-white">
                  <ChatBubbleLeftRightIcon className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  {t('Announcement')}
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {t('Create school-wide announcements')}
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Communications */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            {t('Recent Communications')}
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div className="flex items-center">
                <EnvelopeIcon className="h-5 w-5 text-blue-500 mr-3" />
                <div>
                  <span className="text-sm font-medium text-gray-900">{t('Monthly Newsletter')}</span>
                  <p className="text-xs text-gray-500">{t('Sent to all parents')}</p>
                </div>
              </div>
              <span className="text-sm text-gray-600">2 {t('hours ago')}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div className="flex items-center">
                <BellIcon className="h-5 w-5 text-green-500 mr-3" />
                <div>
                  <span className="text-sm font-medium text-gray-900">{t('Payment Reminder')}</span>
                  <p className="text-xs text-gray-500">{t('Sent to 45 students')}</p>
                </div>
              </div>
              <span className="text-sm text-gray-600">1 day ago</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div className="flex items-center">
                <ChatBubbleLeftRightIcon className="h-5 w-5 text-purple-500 mr-3" />
                <div>
                  <span className="text-sm font-medium text-gray-900">Event Announcement</span>
                  <p className="text-xs text-gray-500">Sent to all staff</p>
                </div>
              </div>
              <span className="text-sm text-gray-600">3 days ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
