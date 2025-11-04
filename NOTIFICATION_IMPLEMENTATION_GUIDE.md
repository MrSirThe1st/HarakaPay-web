# Notification System - Complete Implementation Guide

## System Overview

Your notification system allows schools to:
- Send notifications to parents (all or filtered by level/grade/student)
- Create and manage reusable message templates
- Schedule recurring notifications (daily, weekly, monthly, one-time)
- Track delivery status
- Send via multiple channels (in-app, push notifications)

---

## Architecture

### Backend (✅ Complete)

**Services:**
- `notificationService.js` - Core notification sending logic
- `scheduledNotificationService.js` - Scheduled/recurring notifications
- `templateService.js` - Template management

**API Routes:**
- `POST /api/notifications/send` - Send notification
- `GET /api/notifications/templates` - List templates
- `POST /api/notifications/templates` - Create template
- `GET /api/notifications/templates/[id]` - Get single template
- `PUT /api/notifications/templates/[id]` - Update template
- `DELETE /api/notifications/templates/[id]` - Delete template
- `GET /api/notifications/scheduled` - List scheduled notifications
- `POST /api/notifications/scheduled` - Create scheduled notification
- `PUT /api/notifications/scheduled/[id]` - Update scheduled notification
- `DELETE /api/notifications/scheduled/[id]` - Delete scheduled notification

---

## Implementation Tasks

### 1. Web Admin UI (School Dashboard)

#### A. Notifications Hub Page (`/school/communications/notifications/page.tsx`)
Main landing page with tabs:
- Send Notification
- Templates
- Scheduled Notifications
- History

**Components to Build:**
- `NotificationsLayout` - Tab navigation
- `NotificationStats` - Quick stats (sent today, scheduled, templates)

#### B. Send Notification Tab
**File:** `src/components/school/notifications/SendNotificationForm.tsx`

**Features:**
- Title and message inputs
- Template selector (loads from API)
- Target audience filters:
  - All students
  - By level (dropdown, multi-select)
  - By grade level (dropdown, multi-select)
  - Individual students (search/autocomplete)
- Channel selector (In-app, Push, Both)
- Schedule options (Send now vs. Schedule for later)
- Preview pane
- Variable insertion helpers (e.g., {student_name}, {parent_name})

**API Calls:**
```javascript
// Fetch templates
GET /api/notifications/templates

// Fetch students for filters
GET /api/students?schoolId={schoolId}

// Send notification
POST /api/notifications/send
Body: {
  title,
  message,
  templateId,
  targetAudience: { levels, gradeLevels, studentIds },
  channel,
  scheduledAt,
  metadata
}
```

#### C. Templates Management Tab
**File:** `src/components/school/notifications/TemplatesManager.tsx`

**Features:**
- List all templates (table/cards)
- Filter by category
- Create new template button → opens modal
- Edit template (inline or modal)
- Delete template (with confirmation)
- Template preview
- Variable helper/guide
- Category badges with icons

**Components:**
- `TemplateList` - Grid/table of templates
- `TemplateCard` - Individual template display
- `TemplateForm` - Create/edit form (modal or page)
- `VariableHelper` - Shows available variables

**API Calls:**
```javascript
// List templates
GET /api/notifications/templates?category={cat}&activeOnly=true

// Create template
POST /api/notifications/templates
Body: { name, subject, body, category, variables, isActive }

// Update template
PUT /api/notifications/templates/[id]
Body: { name, subject, body, category, variables, isActive }

// Delete template
DELETE /api/notifications/templates/[id]
```

#### D. Scheduled Notifications Tab
**File:** `src/components/school/notifications/ScheduledNotificationsManager.tsx`

**Features:**
- List all scheduled notifications
- Show next send time, frequency, target audience
- Create new scheduled notification button
- Edit scheduled notification
- Pause/resume scheduled notification
- Delete scheduled notification
- View send history for each scheduled notification

**Components:**
- `ScheduledNotificationList` - Table of scheduled notifications
- `ScheduledNotificationForm` - Create/edit form
- `FrequencySelector` - Daily, Weekly, Monthly, One-time
- `TimeSelector` - Time picker
- `DaySelector` - For weekly (checkboxes for days)
- `DateSelector` - For monthly/one-time

**API Calls:**
```javascript
// List scheduled
GET /api/notifications/scheduled?activeOnly=true

// Create scheduled
POST /api/notifications/scheduled
Body: {
  templateId,
  frequency, // 'daily' | 'weekly' | 'monthly' | 'once'
  scheduleTime, // 'HH:MM'
  scheduleDays, // [0,1,2,3,4,5,6] for weekly
  scheduleDate, // Date string or day of month (1-31)
  targetAudience
}

// Update scheduled
PUT /api/notifications/scheduled/[id]
Body: { ...same as create }

// Delete/deactivate
DELETE /api/notifications/scheduled/[id]
```

---

### 2. Mobile App (Parent Interface)

#### A. Notifications Screen (`src/screens/parent/NotificationsScreen.tsx`)

**Features:**
- List all notifications for logged-in parent
- Filter: All, Unread
- Group by date (Today, Yesterday, This Week, Earlier)
- Notification card shows:
  - Title
  - Message preview (truncated)
  - Timestamp (relative, e.g., "2 hours ago")
  - Read/unread indicator
  - Student context (which child it's about)
- Pull to refresh
- Mark as read on tap
- Mark all as read button
- Delete notification swipe action
- Empty state when no notifications

**Components:**
- `NotificationsList` - FlatList of notifications
- `NotificationCard` - Individual notification item
- `NotificationFilters` - All/Unread toggle
- `NotificationDetail` - Modal/screen for full notification

**API Calls:**
```javascript
// Fetch user's notifications
GET /api/notifications/user?limit=20&offset=0&unreadOnly=false

// Mark as read
PUT /api/notifications/[id]/read

// Delete notification
DELETE /api/notifications/[id]

// Get unread count (for badge)
GET /api/notifications/unread-count
```

**API Routes to Create:**
```javascript
// src/app/api/notifications/user/route.js
export async function GET(request) {
  // Get notifications for auth.uid()
  // Filter by user_id
  // Return notifications with pagination
}

// src/app/api/notifications/[id]/read/route.js
export async function PUT(request, { params }) {
  // Mark notification as read
  // Update is_read = true, read_at = now
}
```

#### B. Push Notification Setup

**File:** `src/services/pushNotificationService.ts` (Mobile)

**Features:**
- Request notification permissions
- Register for push notifications (Expo)
- Save token to backend
- Handle notification received (foreground)
- Handle notification tapped (background/killed)
- Update token on app launch
- Remove token on logout

**Implementation:**
```typescript
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Request permissions and get token
async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    console.log('Must use physical device for Push Notifications');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification!');
    return null;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('school-notifications', {
      name: 'School Notifications',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}

// Save token to backend
async function savePushToken(token, userId, parentId) {
  await fetch('/api/notifications/register-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token,
      userId,
      parentId,
      deviceType: Platform.OS,
      deviceName: Device.deviceName,
    }),
  });
}
```

**Backend API Route to Create:**
```javascript
// src/app/api/notifications/register-token/route.js
export async function POST(request) {
  const { token, userId, parentId, deviceType, deviceName } = await request.json();

  // Upsert token in push_notification_tokens table
  // If token exists, update last_used_at
  // Otherwise insert new record
}
```

#### C. Notification Listeners (Mobile)

**In App.tsx or main navigation:**
```typescript
import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';

function App() {
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // Listener for notifications received while app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      // Optionally show in-app alert or update notification badge
    });

    // Listener for user tapping on notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification tapped:', response);
      const data = response.notification.request.content.data;

      // Navigate to notification screen or specific notification detail
      navigation.navigate('Notifications', { notificationId: data.notificationId });
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  // ... rest of app
}
```

---

### 3. Background Jobs (Scheduled Notifications Processing)

**Options:**

#### Option A: Vercel Cron Jobs (Recommended for Vercel deployment)
**File:** `vercel.json`
```json
{
  "crons": [{
    "path": "/api/cron/process-scheduled-notifications",
    "schedule": "*/5 * * * *"
  }]
}
```

**File:** `src/app/api/cron/process-scheduled-notifications/route.js`
```javascript
import { NextResponse } from 'next/server';
import scheduledNotificationService from '@/services/scheduledNotificationService';
import notificationService from '@/services/notificationService';
import templateService from '@/services/templateService';

export async function GET(request) {
  // Verify cron secret for security
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Get all due notifications
    const { dueNotifications } = await scheduledNotificationService.getDueNotifications();

    if (!dueNotifications || dueNotifications.length === 0) {
      return NextResponse.json({ message: 'No due notifications' });
    }

    // 2. Process each due notification
    const results = [];
    for (const scheduled of dueNotifications) {
      try {
        // Get template
        const template = scheduled.notification_templates;

        // Send notification using notificationService
        const result = await notificationService.sendNotification({
          schoolId: scheduled.school_id,
          title: template.subject,
          message: template.body,
          templateId: scheduled.template_id,
          targetAudience: scheduled.target_audience,
          channel: 'push', // or 'all'
          createdBy: scheduled.created_by,
          metadata: {
            scheduledNotificationId: scheduled.id,
            isScheduled: true
          }
        });

        // Mark as sent and calculate next send time
        await scheduledNotificationService.markAsSent(scheduled.id);

        results.push({
          scheduledId: scheduled.id,
          success: result.success,
          recipientCount: result.recipientCount
        });
      } catch (error) {
        console.error(`Error processing scheduled notification ${scheduled.id}:`, error);
        results.push({
          scheduledId: scheduled.id,
          success: false,
          error: error.message
        });
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      results
    });

  } catch (error) {
    console.error('Error in cron job:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

#### Option B: Node-cron (For custom server)
**File:** `src/lib/scheduledNotificationsCron.js`
```javascript
import cron from 'node-cron';
import scheduledNotificationService from '@/services/scheduledNotificationService';
import notificationService from '@/services/notificationService';

// Run every 5 minutes
export function startScheduledNotificationsCron() {
  cron.schedule('*/5 * * * *', async () => {
    console.log('Processing scheduled notifications...');
    // Same logic as above
  });
}
```

---

## UI Component Examples

### Send Notification Form (Simplified)

```typescript
'use client';
import { useState, useEffect } from 'react';

export default function SendNotificationForm() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [targetAudience, setTargetAudience] = useState({
    all: true,
    levels: [],
    gradeLevels: [],
    studentIds: []
  });
  const [channel, setChannel] = useState('in_app');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch templates
    fetch('/api/notifications/templates?activeOnly=true')
      .then(res => res.json())
      .then(data => setTemplates(data.templates));
  }, []);

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setTitle(template.title_template);
    setMessage(template.message_template);
  };

  const handleSend = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          message,
          templateId: selectedTemplate?.id,
          targetAudience: targetAudience.all ? {} : targetAudience,
          channel,
        }),
      });

      const result = await response.json();
      if (result.success) {
        alert(`Notification sent to ${result.recipientCount} parent(s)!`);
        // Reset form
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Template Selector */}
      <div>
        <label>Choose Template (Optional)</label>
        <select onChange={(e) => {
          const template = templates.find(t => t.id === e.target.value);
          if (template) handleTemplateSelect(template);
        }}>
          <option value="">None - Write Custom Message</option>
          {templates.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>

      {/* Title */}
      <div>
        <label>Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Notification title"
        />
      </div>

      {/* Message */}
      <div>
        <label>Message</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Your message here..."
          rows={6}
        />
        <p className="text-sm text-gray-500">
          Available variables: {'{student_name}'}, {'{parent_name}'}, {'{student_level}'}
        </p>
      </div>

      {/* Target Audience */}
      <div>
        <label>Send To</label>
        <div className="space-y-2">
          <label>
            <input
              type="radio"
              checked={targetAudience.all}
              onChange={() => setTargetAudience({ ...targetAudience, all: true })}
            />
            All Students
          </label>
          <label>
            <input
              type="radio"
              checked={!targetAudience.all}
              onChange={() => setTargetAudience({ ...targetAudience, all: false })}
            />
            Specific Students
          </label>
        </div>

        {!targetAudience.all && (
          <div className="ml-6 space-y-2">
            {/* Level selector, Grade selector, Individual student selector */}
          </div>
        )}
      </div>

      {/* Channel */}
      <div>
        <label>Channel</label>
        <select value={channel} onChange={(e) => setChannel(e.target.value)}>
          <option value="in_app">In-App Only</option>
          <option value="push">Push Notification Only</option>
          <option value="all">Both In-App & Push</option>
        </select>
      </div>

      {/* Send Button */}
      <button
        onClick={handleSend}
        disabled={loading || !title || !message}
        className="px-6 py-2 bg-blue-600 text-white rounded"
      >
        {loading ? 'Sending...' : 'Send Notification'}
      </button>
    </div>
  );
}
```

---

## Testing Checklist

### Backend
- [ ] Can create template
- [ ] Can list templates
- [ ] Can update template
- [ ] Can delete template
- [ ] Can send notification to all students
- [ ] Can send notification to filtered students (level/grade)
- [ ] Can create scheduled notification
- [ ] Can list scheduled notifications
- [ ] Can update scheduled notification
- [ ] Can delete scheduled notification
- [ ] Scheduled notifications calculate next send time correctly

### Web Admin
- [ ] Can navigate to notifications section
- [ ] Send form loads templates
- [ ] Can select template and it populates fields
- [ ] Can write custom message
- [ ] Target audience filters work
- [ ] Can send notification and see success message
- [ ] Templates list displays correctly
- [ ] Can create new template
- [ ] Can edit template
- [ ] Can delete template
- [ ] Scheduled notifications list displays
- [ ] Can create scheduled notification
- [ ] Can edit scheduled notification
- [ ] Frequency options work correctly

### Mobile App
- [ ] Notifications screen loads notifications
- [ ] Can mark notification as read
- [ ] Unread count displays in tab badge
- [ ] Pull to refresh works
- [ ] Can delete notification
- [ ] Push notification permissions requested
- [ ] Push token registered with backend
- [ ] Receives push notifications
- [ ] Tapping push notification navigates to app
- [ ] Notifications update in real-time (optional: use Supabase realtime)

### Background Jobs
- [ ] Cron job runs every 5 minutes
- [ ] Due notifications are detected
- [ ] Notifications are sent
- [ ] Next send time is calculated
- [ ] One-time notifications are deactivated after sending

---

## Next Steps

1. **Build Web Admin UI** (I'll start this now)
2. **Build Mobile Notifications Screen**
3. **Implement Push Notifications on Mobile**
4. **Set up Background Job**
5. **End-to-end Testing**

Would you like me to proceed with building the admin UI components?
