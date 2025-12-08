'use client';

import dynamic from 'next/dynamic';

const SchoolMessages = dynamic(() => import('@/components/admin/communications/SchoolMessages'), {
  loading: () => <div className="text-center py-8"><div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>,
  ssr: false
});

export default function AdminCommunicationsPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Support Tickets</h1>
        <p className="text-gray-600 mt-2">
          View and manage support tickets from schools
        </p>
      </div>

      <SchoolMessages />
    </div>
  );
}