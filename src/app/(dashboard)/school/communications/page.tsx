// src/app/school/communications/page.tsx
'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Lazy load notification components - they're conditionally rendered in tabs
const SendNotificationForm = dynamic(() => import('@/components/school/notifications/SendNotificationForm'), {
  loading: () => <div className="text-center py-8"><div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div></div>,
  ssr: false
});

const NotificationHistory = dynamic(() => import('@/components/school/notifications/NotificationHistory'), {
  loading: () => <div className="text-center py-8"><div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div></div>,
  ssr: false
});

const ParentMessages = dynamic(() => import('@/components/school/messages/ParentMessages'), {
  loading: () => <div className="text-center py-8"><div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div></div>,
  ssr: false
});

const SchoolToAdminMessages = dynamic(() => import('@/components/school/messages/SchoolToAdminMessages'), {
  loading: () => <div className="text-center py-8"><div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div></div>,
  ssr: false
});

export default function CommunicationsPage() {
  const [activeTab, setActiveTab] = useState('send');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Communications & Messages</h1>
        <p className="text-gray-600 mt-2">
          Send notifications, view parent messages, and submit support tickets
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="send">Send Notification</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="parent-messages">Parent Messages</TabsTrigger>
          <TabsTrigger value="admin-messages">Support Tickets</TabsTrigger>
        </TabsList>

        <TabsContent value="send" className="mt-6">
          <SendNotificationForm />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <NotificationHistory />
        </TabsContent>

        <TabsContent value="parent-messages" className="mt-6">
          <ParentMessages />
        </TabsContent>

        <TabsContent value="admin-messages" className="mt-6">
          <SchoolToAdminMessages />
        </TabsContent>
      </Tabs>
    </div>
  );
}
