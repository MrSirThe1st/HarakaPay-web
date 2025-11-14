'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ClockIcon,
  EnvelopeIcon,
  EyeIcon,
  UsersIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface NotificationHistoryItem {
  id: string;
  title: string;
  message: string;
  type: string;
  notification_channel: string;
  sent_at: string;
  created_at: string;
  target_audience: any;
  total_recipients: number;
  read_count: number;
}

export default function NotificationHistory() {
  const [notifications, setNotifications] = useState<NotificationHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/notifications/history?page=${page}&limit=20`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to fetch notification history');
      }

      setNotifications(result.data.notifications);
      setTotalPages(result.data.pagination.pages);
    } catch (err: any) {
      console.error('Error fetching notification history:', err);
      setError(err.message || 'Failed to load notification history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'N/A';
    }
  };

  const getReadPercentage = (notification: NotificationHistoryItem) => {
    if (notification.total_recipients === 0) return 0;
    return Math.round((notification.read_count / notification.total_recipients) * 100);
  };

  const getChannelBadge = (channel: string) => {
    switch (channel) {
      case 'in_app':
        return <Badge variant="outline">In-App</Badge>;
      case 'push':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Push</Badge>;
      case 'all':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Both</Badge>;
      default:
        return <Badge variant="outline">{channel}</Badge>;
    }
  };

  if (loading && notifications.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <ArrowPathIcon className="h-8 w-8 text-gray-400 mb-4 animate-spin" />
          <p className="text-gray-600">Loading notification history...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <ExclamationCircleIcon className="h-12 w-12 text-red-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2 text-red-600">Error Loading History</h3>
          <p className="text-gray-600 text-center max-w-md mb-4">{error}</p>
          <Button onClick={fetchHistory} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (notifications.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <ClockIcon className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Notifications Sent</h3>
          <p className="text-gray-600 text-center max-w-md">
            You haven't sent any notifications yet. Send your first notification from the "Send Notification" tab.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClockIcon className="h-5 w-5" />
            Notification History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{notification.title}</h3>
                      {getChannelBadge(notification.notification_channel)}
                    </div>

                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {notification.message}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <EnvelopeIcon className="h-4 w-4" />
                        <span>{formatDate(notification.sent_at || notification.created_at)}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <UsersIcon className="h-4 w-4" />
                        <span>{notification.total_recipients} recipients</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <EyeIcon className="h-4 w-4" />
                        <span>{notification.read_count} read ({getReadPercentage(notification)}%)</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center ml-4">
                    {getReadPercentage(notification) === 100 ? (
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    ) : (
                      <div className="w-12 h-12 rounded-full border-4 border-gray-200 flex items-center justify-center">
                        <span className="text-xs font-semibold">
                          {getReadPercentage(notification)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {notification.target_audience && Object.keys(notification.target_audience).length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <span className="text-xs text-gray-500">
                      Target: {
                        notification.target_audience.gradeLevels?.length > 0
                          ? `${notification.target_audience.gradeLevels.length} grade level(s)`
                          : 'All students'
                      }
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
              >
                <ChevronLeftIcon className="h-4 w-4 mr-1" />
                Previous
              </Button>

              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || loading}
              >
                Next
                <ChevronRightIcon className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
