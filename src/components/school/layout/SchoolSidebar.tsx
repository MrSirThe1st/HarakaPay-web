'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  UserGroupIcon, 
  CreditCardIcon, 
  ChatBubbleLeftRightIcon, 
  Cog6ToothIcon 
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/school/dashboard', icon: HomeIcon },
  { name: 'Students', href: '/school/students', icon: UserGroupIcon },
  { name: 'Payments', href: '/school/payments', icon: CreditCardIcon },
  { name: 'Communications', href: '/school/communications', icon: ChatBubbleLeftRightIcon },
  { name: 'Settings', href: '/school/settings', icon: Cog6ToothIcon },
];

export default function SchoolSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Logo/Brand */}
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">School Portal</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-green-100 text-green-700 border-r-2 border-green-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">S</span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">School Staff</p>
            <p className="text-xs text-gray-500">Staff Member</p>
          </div>
        </div>
      </div>
    </div>
  );
}
