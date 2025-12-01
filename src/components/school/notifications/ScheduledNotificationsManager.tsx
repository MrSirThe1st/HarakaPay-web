'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { PlusIcon, PencilIcon, TrashIcon, ClockIcon, ArrowPathIcon, ExclamationCircleIcon, CheckCircleIcon, CalendarIcon } from '@heroicons/react/24/outline';

interface ScheduledNotification {
  id: string;
  subject: string;
  body: string;
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  schedule_time: string;
  schedule_days: number[] | null;
  schedule_date: string | null;
  target_audience: unknown;
  next_send_at: string;
  last_sent_at: string | null;
  is_active: boolean;
  created_at: string;
}

const WEEKDAYS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

export default function ScheduledNotificationsManager() {
  const [scheduledNotifications, setScheduledNotifications] = useState<ScheduledNotification[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNotification, setEditingNotification] = useState<ScheduledNotification | null>(null);
  const [formData, setFormData] = useState({
    subject: '',
    body: '',
    frequency: 'daily' as 'daily' | 'weekly' | 'monthly',
    scheduleTime: '09:00',
    scheduleDays: [] as number[],
    scheduleDate: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Load scheduled notifications
  const loadScheduledNotifications = async () => {
    try {
      const response = await fetch('/api/notifications/scheduled?activeOnly=true');
      const data = await response.json();
      setScheduledNotifications(data.scheduledNotifications || []);
    } catch (error) {
      console.error('Error loading scheduled notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScheduledNotifications();
  }, []);

  const openCreateDialog = () => {
    setEditingNotification(null);
    setFormData({
      subject: '',
      body: '',
      frequency: 'daily',
      scheduleTime: '09:00',
      scheduleDays: [],
      scheduleDate: '',
    });
    setFormError(null);
    setFormSuccess(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (notification: ScheduledNotification) => {
    setEditingNotification(notification);
    setFormData({
      subject: notification.subject || '',
      body: notification.body,
      frequency: notification.frequency,
      scheduleTime: notification.schedule_time,
      scheduleDays: notification.schedule_days || [],
      scheduleDate: notification.schedule_date || '',
    });
    setFormError(null);
    setFormSuccess(null);
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    setFormError(null);
    setFormSuccess(null);

    // Validation
    if (!formData.body.trim()) {
      setFormError('Message body is required');
      return;
    }

    if (formData.frequency === 'weekly' && formData.scheduleDays.length === 0) {
      setFormError('Please select at least one day for weekly notifications');
      return;
    }

    if (formData.frequency === 'monthly' && !formData.scheduleDate) {
      setFormError('Please select a day of the month');
      return;
    }

    setFormLoading(true);

    try {
      const url = editingNotification
        ? `/api/notifications/scheduled/${editingNotification.id}`
        : '/api/notifications/scheduled';

      const method = editingNotification ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: formData.subject,
          body: formData.body,
          category: 'general',
          frequency: formData.frequency,
          scheduleTime: formData.scheduleTime,
          scheduleDays: formData.frequency === 'weekly' ? formData.scheduleDays : null,
          scheduleDate: formData.frequency === 'monthly' ? formData.scheduleDate : null,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to save scheduled notification');
      }

      setFormSuccess(editingNotification ? 'Scheduled notification updated!' : 'Scheduled notification created!');

      setTimeout(() => {
        setIsDialogOpen(false);
        loadScheduledNotifications();
      }, 1000);

    } catch (error: unknown) {
      setFormError(error instanceof Error ? error.message : 'Failed to save scheduled notification');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (notification: ScheduledNotification) => {
    if (!confirm(`Are you sure you want to delete this scheduled notification?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/notifications/scheduled/${notification.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to delete scheduled notification');
      }

      loadScheduledNotifications();
    } catch (error: unknown) {
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const getFrequencyLabel = (frequency: string) => {
    const labels: Record<string, string> = {
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
    };
    return labels[frequency] || frequency;
  };

  const formatNextSendTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <ArrowPathIcon className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Scheduled Notifications</h2>
          <p className="text-gray-600 mt-1">
            Set up recurring or one-time notifications to be sent automatically
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Schedule Notification
        </Button>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingNotification ? 'Edit Scheduled Notification' : 'Schedule New Notification'}
              </DialogTitle>
              <DialogDescription>
                {editingNotification
                  ? 'Update your scheduled notification'
                  : 'Set up a notification to be sent automatically'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Subject */}
              <div className="space-y-2">
                <Label htmlFor="subject">Subject/Title (Optional)</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Notification title"
                />
              </div>

              {/* Body */}
              <div className="space-y-2">
                <Label htmlFor="body">Message *</Label>
                <Textarea
                  id="body"
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  placeholder="Your message here..."
                  rows={5}
                />
              </div>

              {/* Frequency */}
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency *</Label>
                <select
                  id="frequency"
                  value={formData.frequency}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      frequency: e.target.value as 'daily' | 'weekly' | 'monthly',
                      scheduleDays: [],
                      scheduleDate: ''
                    });
                  }}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              {/* Schedule Time */}
              <div className="space-y-2">
                <Label htmlFor="scheduleTime">Send Time *</Label>
                <Input
                  id="scheduleTime"
                  type="time"
                  value={formData.scheduleTime}
                  onChange={(e) => setFormData({ ...formData, scheduleTime: e.target.value })}
                  required
                />
                <p className="text-xs text-gray-500">
                  24-hour format (e.g., 09:00 for 9 AM, 14:30 for 2:30 PM)
                </p>
              </div>

              {/* Weekly: Days Selection */}
              {formData.frequency === 'weekly' && (
                <div className="space-y-2">
                  <Label>Select Days *</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {WEEKDAYS.map(day => (
                      <div key={day.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`day-${day.value}`}
                          checked={formData.scheduleDays.includes(day.value)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData({ ...formData, scheduleDays: [...formData.scheduleDays, day.value] });
                            } else {
                              setFormData({ ...formData, scheduleDays: formData.scheduleDays.filter(d => d !== day.value) });
                            }
                          }}
                        />
                        <Label htmlFor={`day-${day.value}`} className="cursor-pointer">
                          {day.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Monthly: Day of Month */}
              {formData.frequency === 'monthly' && (
                <div className="space-y-2">
                  <Label htmlFor="monthlyDate">Day of Month *</Label>
                  <Select
                    value={formData.scheduleDate}
                    onValueChange={(val) => setFormData({ ...formData, scheduleDate: val })}
                  >
                    <SelectTrigger id="monthlyDate">
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                        <SelectItem key={day} value={day.toString()}>
                          {day}{day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Alerts */}
              {formError && (
                <Alert variant="destructive">
                  <ExclamationCircleIcon className="h-4 w-4" />
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}

              {formSuccess && (
                <Alert className="border-green-500 bg-green-50">
                  <CheckCircleIcon className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">{formSuccess}</AlertDescription>
                </Alert>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={formLoading}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={formLoading}>
                {formLoading ? (
                  <>
                    <ArrowPathIcon className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  editingNotification ? 'Update' : 'Schedule'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Scheduled Notifications List */}
      {scheduledNotifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ClockIcon className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600">No scheduled notifications yet</p>
            <Button className="mt-4" onClick={openCreateDialog}>
              <PlusIcon className="mr-2 h-4 w-4" />
              Create Your First Scheduled Notification
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {scheduledNotifications.map(notification => {
            return (
              <Card key={notification.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        {notification.subject || 'Scheduled Notification'}
                      </CardTitle>
                      <CardDescription className="mt-2 flex flex-wrap gap-2">
                        <Badge variant="outline">
                          <ClockIcon className="mr-1 h-3 w-3" />
                          {getFrequencyLabel(notification.frequency)}
                        </Badge>
                        <Badge variant="outline">
                          <CalendarIcon className="mr-1 h-3 w-3" />
                          Next: {formatNextSendTime(notification.next_send_at)}
                        </Badge>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs font-semibold text-gray-500 uppercase mb-1">
                        Message
                      </div>
                      <div className="text-sm text-gray-700">
                        {notification.body}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-500 uppercase mb-1">
                        Schedule
                      </div>
                      <div className="text-sm text-gray-700">
                        {notification.frequency === 'daily' && `Every day at ${notification.schedule_time}`}
                        {notification.frequency === 'weekly' && (
                          <>
                            Every {notification.schedule_days?.map(d => WEEKDAYS[d].label).join(', ')} at {notification.schedule_time}
                          </>
                        )}
                        {notification.frequency === 'monthly' && `${notification.schedule_date}${notification.schedule_date === '1' ? 'st' : notification.schedule_date === '2' ? 'nd' : notification.schedule_date === '3' ? 'rd' : 'th'} of every month at ${notification.schedule_time}`}
                      </div>
                    </div>
                    {notification.last_sent_at && (
                      <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase mb-1">
                          Last Sent
                        </div>
                        <div className="text-sm text-gray-700">
                          {formatNextSendTime(notification.last_sent_at)}
                        </div>
                      </div>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => openEditDialog(notification)}
                      >
                        <PencilIcon className="mr-2 h-3 w-3" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(notification)}
                      >
                        <TrashIcon className="mr-2 h-3 w-3" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
