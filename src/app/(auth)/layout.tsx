'use client';

import React from 'react';
import Image from 'next/image';
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
        <div className="hidden lg:flex lg:w-1/2 bg-blue-50 relative overflow-hidden flex-col justify-center px-12">
          {/* Okapi Background Image */}
          <div className="absolute inset-0 flex items-center justify-center z-[1]">
            <div className="relative w-[480px] h-[480px] xl:w-[600px] xl:h-[600px] opacity-20">
              <Image
                src="/okapi.png"
                alt="Okapi"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
          
          {/* Content */}
          <div className="max-w-md relative z-10">
            <div className="text-gray-900">
              <p className="text-2xl font-light text-gray-800 mb-6 leading-relaxed">
                &ldquo;Derrière chaque paiement se cache un rêve, l&apos;éducation d&apos;un enfant, l&apos;espoir d&apos;un parent, l&apos;avenir d&apos;une nation.&rdquo;
              </p>
              <p className="text-lg font-medium text-gray-800">— Founder of HarakaPay</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
