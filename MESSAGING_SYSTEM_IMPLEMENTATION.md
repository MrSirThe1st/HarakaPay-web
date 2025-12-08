# Messaging System Implementation

Complete bidirectional messaging system for parent↔school and school↔admin communication.

## Overview

Implemented messaging system enabling:
- **Parents → School**: Parents send messages about their children to school
- **School → Admin**: School staff send messages to platform administrators

## Database Schema

**File**: `supabase/migrations/20251205_messaging_system.sql`

### Tables Created

#### parent_school_messages
- Parent messages to school with student context
- RLS policies: parents can send/view own messages, school staff can view/update messages for their school
- Indexes on school_id, parent_id, status

#### school_admin_messages
- School messages to admin
- RLS policies: school staff can send/view own school messages, admins can view/update all messages
- Indexes on created_at, status

## API Routes

### Parent→School Messages

**POST** `/api/messages/parent-to-school`
- Parent sends message to school
- Validates parent-student relationship
- Requires: student_id, subject, message

**GET** `/api/messages/parent-to-school`
- List messages (parent or school view)
- Pagination support
- Returns unread count

**PUT** `/api/messages/parent-to-school/[id]/read`
- Mark message as read (school staff only)

### School→Admin Messages

**POST** `/api/messages/school-to-admin`
- School staff sends message to admin
- Requires: subject, message

**GET** `/api/messages/school-to-admin`
- List messages (school or admin view)
- Pagination support
- Returns unread count for admins

**PUT** `/api/messages/school-to-admin/[id]/read`
- Mark message as read (admin only)

## Web Frontend (School & Admin)

### School Communications Page
**File**: `src/app/(dashboard)/school/communications/page.tsx`

Added 2 new tabs:
- **Parent Messages**: View messages from parents with parent/student details
- **Message Admin**: Send messages to admin, view sent messages

**Components**:
- `src/components/school/messages/ParentMessages.tsx`
- `src/components/school/messages/SchoolToAdminMessages.tsx`

### Admin Navigation
**File**: `src/components/admin/layout/AdminSidebar.tsx`

Added **Communications** navigation item with ChatBubbleLeftRightIcon

### Admin Communications Page
**File**: `src/app/(dashboard)/admin/communications/page.tsx`

New page displaying:
- Messages from all schools
- School name, sender info
- Mark as read functionality

**Component**: `src/components/admin/communications/SchoolMessages.tsx`

## Mobile Frontend (Parent)

### Updated Notifications Screen
**File**: `src/screens/parent/NotificationsScreen.tsx`

Added tab interface:
- **Notifications** tab: Original notification list
- **Messages** tab: New message interface

### New Components

**NotificationsTab** (`src/components/NotificationsTab.tsx`)
- Extracted original notification logic
- Maintains all existing functionality

**MessagesTab** (`src/components/MessagesTab.tsx`)
- Display message list
- Send message button
- Modal for message details
- Unread count badge

**SendMessageModal** (`src/components/SendMessageModal.tsx`)
- Select student from linked students
- Enter subject and message
- Send to school

### Mobile API
**File**: `src/api/messageApi.ts`

Functions:
- `fetchMessages(page, limit)` - Get parent messages
- `sendMessage({ student_id, subject, message })` - Send message to school

**Types**: `src/types/message.ts`

## Key Features

### Parent→School Messages
- Parent selects which child message is about
- School sees parent contact info + student details
- Mark as read tracking
- Status indicators (unread/read)

### School→Admin Messages
- School staff can send messages to admin
- Admin sees school name + sender details
- Status tracking (pending/read by admin)
- Message history for school

### UI/UX
- Unread badges
- Click to expand full message
- Pagination (20 items per page)
- Refresh control
- Empty states
- Loading states
- Modals for full message view

## Usage Instructions

### Web Setup
1. Run migration: `supabase/migrations/20251205_messaging_system.sql`
2. School staff navigate to Communications → Parent Messages or Message Admin tabs
3. Admin navigate to Communications in sidebar

### Mobile Setup
1. Parents open Notifications screen
2. Switch to Messages tab
3. Tap compose icon to send new message
4. Select student, enter subject/message

## Security

**Architecture Pattern**: Authorization at API Layer (following project conventions)

- **RLS Enabled** but **no policies** - API uses `createAdminClient()` (service role) which bypasses RLS
- **All authorization in API routes** using manual checks:
  - Auth token verification via `createClient().auth.getUser()`
  - Profile fetching and role validation
  - Parent-student relationship verification
  - School assignment validation
- **Why this approach**:
  - Avoids RLS complexity and infinite loops
  - Prevents performance issues from nested queries
  - Centralizes authorization logic in API routes
  - Follows existing codebase pattern (see `src/lib/apiAuth.ts`)
- Input validation with Zod schemas
- All database operations use `createAdminClient()` for consistency

## Next Steps (Optional Enhancements)

- Reply functionality (bi-directional threads)
- Message categories/tags
- File attachments
- Push notifications for new messages
- Email notifications
- Message search/filter
- Archive messages
- Admin reply to schools
