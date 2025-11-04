'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Clock } from 'lucide-react';

export default function ScheduledNotificationsManager() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <Clock className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Scheduled Notifications</h3>
        <p className="text-gray-600 text-center max-w-md">
          Set up recurring notifications (daily, weekly, monthly) to be sent automatically.
          This feature will be implemented next.
        </p>
      </CardContent>
    </Card>
  );
}
