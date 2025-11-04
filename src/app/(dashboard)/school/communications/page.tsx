// src/app/school/communications/page.tsx
'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SendNotificationForm from '@/components/school/notifications/SendNotificationForm';
import TemplatesManager from '@/components/school/notifications/TemplatesManager';
import ScheduledNotificationsManager from '@/components/school/notifications/ScheduledNotificationsManager';
import NotificationHistory from '@/components/school/notifications/NotificationHistory';

export default function CommunicationsPage() {
  const [activeTab, setActiveTab] = useState('send');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Communications & Notifications</h1>
        <p className="text-gray-600 mt-2">
          Send announcements to parents, manage templates, and schedule recurring notifications
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Sent Today</div>
          <div className="text-2xl font-bold">-</div>
          <div className="text-xs text-gray-500 mt-1">Loading...</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Scheduled</div>
          <div className="text-2xl font-bold">-</div>
          <div className="text-xs text-gray-500 mt-1">Loading...</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Templates</div>
          <div className="text-2xl font-bold">-</div>
          <div className="text-xs text-gray-500 mt-1">Loading...</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Delivery Rate</div>
          <div className="text-2xl font-bold">-</div>
          <div className="text-xs text-gray-500 mt-1">Loading...</div>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="send">Send Notification</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="send" className="mt-6">
          <SendNotificationForm />
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <TemplatesManager />
        </TabsContent>

        <TabsContent value="scheduled" className="mt-6">
          <ScheduledNotificationsManager />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <NotificationHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
}
