'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Column - Login Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-8">
        <div className="w-full">
          {children}
        </div>
      </div>
      
      {isLoginPage && (
        <div className="hidden lg:flex lg:w-1/2 bg-black flex-col justify-center px-12">
          <div className="max-w-md">
            <div className="text-white">
              <div className="text-5xl text-gray-400 mb-6">&ldquo;</div>
              <p className="text-2xl font-light text-gray-200 mb-6 leading-relaxed">
                HarakaPay has transformed how we manage school payments. It&apos;s streamlined our entire fee collection process and significantly improved parent engagement.
              </p>
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">HP</span>
                </div>
                <div>
                  <p className="text-lg font-medium text-white">School Administrator</p>
                  <p className="text-sm text-gray-400">Kinshasa, DR Congo</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
