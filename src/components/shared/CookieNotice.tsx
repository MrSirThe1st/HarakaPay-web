'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const handleAccept = (): void => {
    localStorage.setItem('cookieConsent', 'true');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 shadow-lg z-50">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm">
          We use essential cookies for this platform to function.{' '}
          <Link
            href="/cookie-policy"
            className="underline hover:text-gray-300 transition-colors"
          >
            Cookie Policy
          </Link>
        </p>
        <button
          onClick={handleAccept}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap"
        >
          Close
        </button>
      </div>
    </div>
  );
}