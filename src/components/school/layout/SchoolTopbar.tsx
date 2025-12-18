'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useDualAuth } from '@/hooks/shared/hooks/useDualAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { useSchoolInfo } from '@/hooks/useSchoolInfo';

export default function SchoolTopbar() {
  const { t } = useTranslation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { signOut } = useDualAuth();
  const { schoolInfo, loading: schoolLoading } = useSchoolInfo();

  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Mobile menu button */}
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button
              type="button"
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Right side - School Branding with dropdown */}
          <div className="flex items-center space-x-4">
            {/* School branding dropdown */}
            <div className="relative">
              <button
                type="button"
                className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 cursor-pointer"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                {/* School Logo */}
                {schoolInfo?.logo_url ? (
                  <div className="flex-shrink-0 relative">
                    <Image
                      src={schoolInfo.logo_url}
                      alt={`${schoolInfo.name} logo`}
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                      unoptimized={true}
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {schoolLoading ? '...' : schoolInfo?.name?.charAt(0).toUpperCase() || 'S'}
                    </span>
                  </div>
                )}

                {/* School Name */}
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {schoolLoading ? 'Loading...' : schoolInfo?.name || 'School Name'}
                  </p>
                  <p className="text-xs text-gray-500">{t('Staff Member')}</p>
                </div>
              </button>

              {/* Dropdown menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      setIsProfileOpen(false);
                      signOut();
                    }}
                  >
                    {t('Sign out')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile search */}
        <div className="sm:hidden pb-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('Search students, payments...')}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
