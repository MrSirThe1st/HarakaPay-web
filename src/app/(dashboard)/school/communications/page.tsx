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

// import ScheduledNotificationsManager from '@/components/school/notifications/ScheduledNotificationsManager';

const NotificationHistory = dynamic(() => import('@/components/school/notifications/NotificationHistory'), {
  loading: () => <div className="text-center py-8"><div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div></div>,
  ssr: false
});

export default function CommunicationsPage() {
  const [activeTab, setActiveTab] = useState('send');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Communications & Notifications</h1>
        <p className="text-gray-600 mt-2">
          Send announcements to parents and schedule recurring notifications
        </p>
      </div>


      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="send">Send Notification</TabsTrigger>
          {/* <TabsTrigger value="scheduled">Scheduled</TabsTrigger> */}
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="send" className="mt-6">
          <SendNotificationForm />
        </TabsContent>

        {/* <TabsContent value="scheduled" className="mt-6">
          <ScheduledNotificationsManager />
        </TabsContent> */}

        <TabsContent value="history" className="mt-6">
          <NotificationHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
}
