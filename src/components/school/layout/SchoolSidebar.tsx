'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  UserGroupIcon, 
  CreditCardIcon, 
  ChatBubbleLeftRightIcon, 
  Cog6ToothIcon,
  UsersIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from '@/hooks/useTranslation';

const navigation = [
  { name: 'Dashboard', href: '/school/dashboard', icon: HomeIcon },
  { name: 'Students', href: '/school/students', icon: UserGroupIcon },
  { name: 'Staff', href: '/school/staff', icon: UsersIcon },
  { name: 'Fees', href: '/school/fees', icon: CurrencyDollarIcon },
  { name: 'Payments', href: '/school/payments', icon: CreditCardIcon },
  { name: 'Communications', href: '/school/communications', icon: ChatBubbleLeftRightIcon },
  { name: 'Settings', href: '/school/settings', icon: Cog6ToothIcon },
];

export default function SchoolSidebar() {
  const { t } = useTranslation();
  const pathname = usePathname();

  return (
    <div className="w-64 bg-white shadow-lg h-full">
      {/* Header */}
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
        <h1 className="text-xl font-bold">{t('School Portal')}</h1>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4">
          {t('Navigation')}
        </div>
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className="mr-3 h-4 w-4" />
              {t(item.name)}
            </Link>
          );
        })}
      </nav>
      
      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">S</span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">{t('School Staff')}</p>
            <p className="text-xs text-gray-500">{t('Staff Member')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
