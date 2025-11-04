'use client';

import { Card, CardContent } from '@/components/ui/card';
import { History } from 'lucide-react';

export default function NotificationHistory() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <History className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Notification History</h3>
        <p className="text-gray-600 text-center max-w-md">
          View all sent notifications, delivery status, and read receipts.
          This feature will be implemented next.
        </p>
      </CardContent>
    </Card>
  );
}
