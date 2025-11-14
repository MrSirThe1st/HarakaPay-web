'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

const features = [
  {
    title: "Real-time Payment Tracking",
    description: "Monitor all school fee payments in real-time with instant notifications and automated receipt generation."
  },
  {
    title: "Multi-Currency Support",
    description: "Accept payments in multiple currencies with automatic conversion and comprehensive financial reporting."
  },
  {
    title: "Parent Portal Access",
    description: "Parents can view payment history, outstanding balances, and pay fees online 24/7 from any device."
  },
  {
    title: "Automated Reminders",
    description: "Send customizable payment reminders via email and SMS to keep parents informed of upcoming deadlines."
  },
  {
    title: "Fee Structure Management",
    description: "Easily create and manage complex fee structures with support for installments, discounts, and scholarships."
  },
  {
    title: "Comprehensive Reporting",
    description: "Generate detailed financial reports, analytics, and export data for accounting and audit purposes."
  },
  {
    title: "Secure & Compliant",
    description: "Bank-level security with encrypted transactions and full compliance with educational payment regulations."
  },
  {
    title: "Student Management",
    description: "Maintain complete student records with payment history, academic information, and family connections."
  }
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';
  const [currentFeature, setCurrentFeature] = useState(0);

  useEffect(() => {
    // Set random initial feature
    setCurrentFeature(Math.floor(Math.random() * features.length));

    // Rotate features every 8 seconds
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Column - Login Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-8">
        <div className="w-full">
          {children}
        </div>
      </div>

      {isLoginPage && (
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden flex-col justify-center px-12">
          {/* Feature Content */}
          <div className="max-w-md relative z-10">
            <div className="text-gray-900 transition-opacity duration-500">
              <div className="mb-4">
                <span className="inline-block px-3 py-1 text-sm font-medium bg-blue-100 text-blue-700 rounded-full">
                  Feature Highlight
                </span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                {features[currentFeature].title}
              </h3>
              <p className="text-xl font-light text-gray-700 leading-relaxed">
                {features[currentFeature].description}
              </p>
              <div className="flex gap-2 mt-8">
                {features.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      index === currentFeature ? 'w-8 bg-blue-600' : 'w-1.5 bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
