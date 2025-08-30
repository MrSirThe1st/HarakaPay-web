This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

HarakaPay – Digital School Fee Payment and Communication Platform for Congo
Project Overview
HarakaPay is a secure, easy-to-use digital platform designed to solve the challenges parents face
when paying school fees in Congo. Currently, parents must visit schools in person, often facing long
queues and repeated trips. HarakaPay enables parents to pay fees instantly via popular mobile
money services (M-Pesa, Airtel Money, Orange Money) and direct bank transfers.
Beyond payments, the platform facilitates direct communication between schools and parents
through notifications, reminders, announcements, and downloadable invoices — all accessible from
a mobile app for parents and a web portal for schools and administrators.
Key Features
Parent Mobile App
• Secure account creation and login(one parent can have several children in one school or
different school ).
• View detailed fee balances and payment history.
• Make instant payments via integrated mobile money providers and banks.
• Receive real-time announcements, fee reminders, and downloadable invoices.
• Push notifications to keep parents informed.

School Web Portal
• Upload and manage student and parent databases.
• Track fee payments in real-time and identify defaulters.
• Send bulk communications and reminders to parents.
• Configure fee structures and payment methods.
• Generate reports and export payment data.
Admin Dashboard
• Register, approve, and manage schools on the platform.
• Monitor transactions, platform usage, and resolve disputes.
• Manage user roles and permissions (parents, school staff, admins).
• Enforce security policies, including blocking or banning accounts if necessary.


Technical Architecture & Stack
• Mobile App: React Native (Expo) — cross-platform iOS & Android development with fast
iteration.
• Web Portal & Admin Dashboard: React + Tailwind CSS — for responsive and
maintainable web interfaces.
• Backend & Database:
◦ Supabase (PostgreSQL) — primary backend, authentication, real-time data, and
storage.
◦ Node.js microservices — handle payment API integrations securely.
◦ MongoDB (optional) — flexible logging or unstructured data if needed.
• Payments: M-Pesa, Airtel Money, Orange Money APIs integrated via backend
microservices.
• Hosting: Vercel/Netlify for frontend, Render/Railway or Supabase for backend services.
• Notifications: Expo Push Notifications or OneSignal for real-time alerts.
• Security: HTTPS/TLS, JWT authentication, role-based access control.

System Interaction Overview
Parents use the mobile app to view and pay school fees, receive notifications, and download
receipts. Schools manage student data, track payments, and communicate via the web portal.
Platform admins oversee the entire system using the admin dashboard.
All client apps interact with a centralized backend that coordinates payment processing, data
storage, and communication. Payment gateways are integrated through secure backend
microservices ensuring smooth and reliable transactions.


this is the web portal page of the project 
School Web Portal
• Upload and manage student and parent databases.
• Track fee payments in real-time and identify defaulters.
• Send bulk communications and reminders to parents.
• Configure fee structures and payment methods.
• Generate reports and export payment data.
Admin Dashboard
• Register, approve, and manage schools on the platform.
• Monitor transactions, platform usage, and resolve disputes.
• Manage user roles and permissions (parents, school staff, admins).
• Enforce security policies, including blocking or banning accounts if necessary.


HarakaPay


Style

The design should feel enterprise-grade, minimal, trustworthy, and futuristic, with a strong grid layout, lots of whitespace, modern sans-serif typography, and abstract data-inspired graphics. Use gradients, geometric shapes, and subtle animations instead of stock photos. Prioritize clarity and scalability (for complex product ecosystems). Always communicate authority and innovation without overwhelming the user with visuals.

*   Clean, minimalistic but professional layouts
*   Dark mode or gradient-heavy hero sections
*   Lots of abstract 3D/2D illustrations (waves, spheres, geometric shapes, network diagrams)
*   Trust-building design → logos of clients,"enterprise-ready", scalability graphics
*   Focus on products, solutions, and docs rather than flashy visuals
* Apple’s Human Interface Guidelines
* Font will be IBM Plex
* Lightning design system
* Target audience: Developers, CTOs, IT managers, enterprise clients → people who value clarity and authority over playfulness.
* Layout: Grid-based, spacious, consistent spacing system. No clutter, everything has a purpose
* Inspired by salesforce website, IBM and AWS
* Color Palette: Base: Neutral (white, light gray).
* Color Palette: Primary: Brand Color (#0080ff blue. rgba(0,128,255,255) used sparingly.


HarakaPay - User Access Policies & Architecture


Code Organization
Repository Structure
* HarakaPay-web/ (React + Next.js)
    * /admin/ - Platform administration interface
    * /school/ - School portal interface
    * /shared/ - Common components, utilities, auth
* HarakaPay-mobile/ (React Native/Expo)
    * Parent-facing mobile application
Both repositories share the same Supabase database with proper role-based access control.
Authentication & User Hierarchy
Web Platform Access
* No public sign-up - All accounts are created administratively
* Login only - Users access via provided credentials
* Dual-mode login - Admins choose between "Admin Side" or "School Side" with clear visual mode indicators
* Role-based redirects - Users with school-only access are auto-directed to school interface
Super Admin Level (Seeded Users)
Initial Setup:
* 2 super admins are seeded in the database (you + 1 other)
* These accounts have ultimate platform control
* Cannot be deleted or demoted by other users
Super Admin Privileges:
* Create, modify, and remove all admin types
* Edit payment gateway settings for any school
* Access comprehensive audit trails
* Approve payment setting change requests
* Override any permission or access control
Platform Admin Hierarchy
Admin Types:
1. Platform Admins (Created by Super Admins)
    * Can register new schools
    * Manage school verification and approval process
    * Full school data management (except payment settings)
    * Can toggle between Admin/School interfaces
2. Support Admins (Created by Super Admins)
    * Limited to data management tasks
    * Can edit student information, upload CSV files
    * Cannot create schools or manage users
    * Can toggle between Admin/School interfaces
Admin Permission Control:
* Super admins define what each admin type can read/write via granular toggles
* All admins are listed in settings with individual permission controls
* Regular admins cannot grant privileges to other admins (only Super Admins can)
School Registration & Approval Process
School Creation Flow:
1. Platform Admin registers school with full details
2. In-person verification - Admin physically visits school for document verification
3. School enters "pending approval" status
4. Super Admin reviews verification report and approves school
5. Initial school admin account is created with elevated privileges
6. School receives login credentials and goes live
School Verification Requirements:
* Human verification process - Admins conduct in-person visits
* Physical verification of school premises and operations
* Document authenticity checks on-site
* Meeting with school leadership to establish working agreement
School Staff Hierarchy
School Admin (Initial Staff):
* Created during school registration (typically the school owner/principal)
* Full privileges within their school
* Can add/remove other school staff
* Can initiate payment setting change requests
* Controls what payment data Platform Admins can view via transparency settings
* Final approval authority for internal school staff actions (deletions, role changes)
Regular School Staff:
* Limited permissions defined by School Admin
* Cannot modify payment settings
* Can manage assigned students and classes only
* Staff deletion/modification requires School Admin (principal) confirmation
Data Access & Transparency Controls
Payment Data Access:
* Super Admins: Full access to all financial data
* Platform Admins: Access determined by individual school transparency settings
* School Admins: Control their own school's data visibility to Platform Admins
* Regular School Staff: Limited to non-financial student data
Permission Granularity:
* Read-only vs read-write permissions set per admin
* Super Admins can override any access restriction
* School Admins define their own staff permissions
* Real-time permission updates without requiring re-login
Audit Trail & Security
Comprehensive Logging:
* All Super Admin actions (school deletions, payment changes, user management)
* Platform Admin actions (school registrations, data modifications, in-person verifications)
* School Staff actions (student data changes, staff management)
* Payment setting change requests and multi-level approvals
* Login attempts, session activities, and email approval interactions
Security Measures:
* Session timeout and re-authentication for sensitive actions
* IP address logging and suspicious activity detection
* Multi-factor authentication for Super Admin accounts
* Encrypted storage of all sensitive data
* Email verification for all approval workflows
Approval Workflows & Communication
Payment Setting Changes:
* Multi-level approval required: All current school staff + 2 Super Admins + 1 Platform Admin
* Email-based approval system: Each approver receives email notification with approve/deny options
* Request includes detailed justification and change summary
* Changes only implemented after all required approvals received
* Automatic email notifications to requester on approval status updates
Internal School Staff Management:
* School-level autonomy: Platform Admins are not involved in internal school staff decisions
* Principal/Owner approval: School Admin (typically principal/owner) has final say on staff changes
* Contract-based boundaries: Clear contractual agreements define Platform Admin vs School Admin responsibilities
* No conflict resolution needed: Contractual framework prevents admin/school disagreements
Training & Onboarding:
* In-person training: Admins personally train school staff on platform usage
* Hands-on approach: Direct instruction at school premises
* Ongoing support: Admins available for follow-up training sessions as needed
Mobile App (Parents)
Parent Access Rights
Straightforward Scope:
* View their children's information only
* Access to associated schools' public information
* Payment history and receipts for their accounts
* Communication from schools (announcements, fee reminders)
Multi-Child Support
* Single parent account can manage multiple children
* Children can be enrolled across different schools
* Consolidated payment view with per-child breakdowns
* Individual notification preferences per child/school
Push Notifications
* Payment confirmations with receipt details
* Fee due reminders with customizable timing
* School announcements and emergency alerts
* Payment failure notifications with retry options
Implementation Considerations
Database Schema Updates Needed
-- Add admin types and permission granularity
ALTER TABLE profiles ADD COLUMN admin_type TEXT CHECK (admin_type IN ('super_admin', 'platform_admin', 'support_admin'));
ALTER TABLE profiles ADD COLUMN permissions JSONB DEFAULT '{}';
ALTER TABLE schools ADD COLUMN verification_status TEXT DEFAULT 'pending';
ALTER TABLE schools ADD COLUMN payment_transparency JSONB DEFAULT '{}';

-- Create audit log table
CREATE TABLE audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
UI/UX Considerations
* Clear visual indicators for current interface mode (Admin vs School)
* Permission-based navigation hiding/showing
* Real-time notification system for approval workflows
* Mobile-responsive design for all web interfaces
* Offline capability for mobile app core features
Security Implementation
* Row Level Security (RLS) policies for all database tables
* JWT token validation with role-based claims
* API rate limiting and request validation
* Encrypted environment variables for Super Admin credentials
* Regular security audits and penetration testing
This policy framework ensures scalability, security, and clear separation of concerns while maintaining the flexibility to adapt as the platform grows.


HarakaPay - Database Access Control Policies for RLS
User Role Hierarchy
-- Role hierarchy for reference
super_admin > platform_admin > support_admin > school_admin > school_staff > parent
Table Access Policies
1. profiles Table
SELECT Policies:
* Users can view their own profile
* Super Admins can view all profiles
* Platform Admins can view all admin and school staff profiles
* Support Admins can view school staff profiles only
* School Admins can view their own school staff profiles
* School Staff can view profiles within their school
* Parents can view their own profile only
INSERT Policies:
* Users can insert their own profile (during account creation)
* Super Admins can create any profile type
* Platform Admins can create school staff profiles
* School Admins can create school staff profiles for their school
UPDATE Policies:
* Users can update their own profile (non-role fields)
* Super Admins can update any profile
* Platform Admins can update school staff profiles (non-payment related)
* School Admins can update their school staff profiles
* Role changes require specific approval workflows
DELETE Policies:
* Super Admins can delete any profile (except other Super Admins)
* Platform Admins can delete school staff profiles
* School Admins can delete their own school staff (with confirmation workflow)
2. schools Table
SELECT Policies:
* Super Admins can view all schools
* Platform Admins can view all schools
* Support Admins can view basic school info (no payment settings)
* School Admins can view their own school
* School Staff can view their own school (limited fields)
* Parents can view basic public info of schools their children attend
INSERT Policies:
* Super Admins can create schools
* Platform Admins can create schools
* Support Admins cannot create schools
UPDATE Policies:
* Super Admins can update all school fields
* Platform Admins can update basic school info (name, address, contact) based on school transparency settings
* School Admins can update all fields for their school
* School Staff can update limited fields for their school
* Payment settings require multi-level approval workflow
DELETE Policies:
* Only Super Admins can delete schools
* Requires audit trail and multi-level approval
3. students Table
SELECT Policies:
* Super Admins can view all students
* Platform Admins can view students based on school transparency settings
* Support Admins can view student basic info (no financial data)
* School Admins can view all students in their school
* School Staff can view students they are assigned to manage
* Parents can view only their own children
INSERT Policies:
* Super Admins can add students to any school
* Platform Admins can add students (with school permission)
* School Admins can add students to their school
* School Staff can add students (if permitted by School Admin)
UPDATE Policies:
* Super Admins can update any student record
* Platform Admins can update basic student info (non-financial)
* School Admins can update all student info in their school
* School Staff can update assigned students (limited fields)
* Parents cannot update student records directly
DELETE Policies:
* Super Admins can delete any student record
* School Admins can delete students from their school
* School Staff can delete students (if permitted and with School Admin approval)
4. parents Table
SELECT Policies:
* Super Admins can view all parent records
* Platform Admins can view parent records based on school transparency settings
* Support Admins can view basic parent info (no financial data)
* School Admins can view parents of students in their school
* School Staff can view parents of students they manage
* Parents can view their own record only
INSERT Policies:
* Super Admins can create parent records
* School Admins can create parent records for their school students
* School Staff can create parent records (if permitted)
* Parents can create their own account (mobile app registration)
UPDATE Policies:
* Super Admins can update any parent record
* School Admins can update parent records for their school (limited fields)
* School Staff can update assigned parent records (very limited fields)
* Parents can update their own profile information
DELETE Policies:
* Super Admins can delete parent records
* School Admins cannot delete parent records (only deactivate)
* Parents can deactivate their own accounts
5. payments Table
SELECT Policies:
* Super Admins can view all payment records
* Platform Admins can view payment records ONLY if school has enabled payment transparency
* Support Admins cannot view payment records
* School Admins can view all payments for their school
* School Staff can view payments (if permitted by School Admin)
* Parents can view their own payment history only
INSERT Policies:
* Payment records are created by system/API only
* Manual payment entry by School Admins (for cash payments)
* Super Admins can create payment records for any school
UPDATE Policies:
* Super Admins can update any payment record
* School Admins can update payment records for their school (limited scenarios)
* Payment status updates handled by system/API
* Manual corrections require approval workflow
DELETE Policies:
* Only Super Admins can delete payment records
* Requires audit trail and justification
* Soft delete preferred over hard delete
6. payment_settings Table
SELECT Policies:
* Super Admins can view all payment settings
* Platform Admins cannot view payment settings (security boundary)
* School Admins can view their own school payment settings
* School Staff can view their school payment settings (if permitted)
INSERT Policies:
* Super Admins can create payment settings for any school
* School Admins can request payment setting creation (requires approval)
UPDATE Policies:
* Super Admins can update any payment settings
* Payment setting changes require multi-level approval:
    * All current school staff approval
    * 2 Super Admin approvals
    * 1 Platform Admin approval
* Changes implemented only after all approvals received
DELETE Policies:
* Only Super Admins can delete payment settings
* Requires exceptional circumstances and full audit trail
7. audit_logs Table
SELECT Policies:
* Super Admins can view all audit logs
* Platform Admins can view logs related to their actions and assigned schools
* Support Admins can view logs related to their own actions
* School Admins can view logs related to their school
* School Staff can view logs related to their own actions
* Parents cannot view audit logs
INSERT Policies:
* System automatically inserts audit logs
* Manual audit entries only by Super Admins (for external actions)
UPDATE/DELETE Policies:
* Audit logs are immutable - no updates or deletes allowed
* Archive only after legal retention period
8. notifications Table
SELECT Policies:
* Users can view their own notifications
* Super Admins can view all notifications (for system monitoring)
* School Admins can view notifications sent to their school users
INSERT Policies:
* System can create notifications for any user
* Super Admins can create notifications for any user
* Platform Admins can create notifications for school users
* School Admins can create notifications for their school community
UPDATE Policies:
* Users can mark their own notifications as read
* Super Admins can update any notification status
DELETE Policies:
* Users can delete their own notifications
* System can delete old notifications after retention period
9. approval_workflows Table
SELECT Policies:
* Super Admins can view all approval workflows
* Platform Admins can view workflows they are part of
* School Admins can view workflows related to their school
* Participants can view workflows they need to approve
INSERT Policies:
* System creates approval workflows automatically
* School Admins can initiate approval workflows (payment changes, etc.)
UPDATE Policies:
* Approvers can update their approval status
* Super Admins can override or cancel workflows
* System updates workflow status based on approvals
DELETE Policies:
* Only Super Admins can delete approval workflows
* Completed workflows should be archived, not deleted
Special Security Rules
Payment Data Protection
* Boundary Rule: Platform Admins CANNOT access payment data unless explicitly permitted by School Admin
* Transparency Settings: Schools control what financial data Platform Admins can see
* Super Admin Override: Super Admins can always access payment data (for platform management)
Role Escalation Prevention
* Users cannot modify their own role
* Role changes require approval from higher authority level
* Super Admin role cannot be granted by non-Super Admins
School Isolation
* School Staff can only access data within their assigned school
* Cross-school data access only available to Platform+ level admins
* Parent data is strictly isolated to their own children/payments
Approval Workflow Security
* Payment setting changes require multi-party approval
* Approval emails contain unique tokens to prevent spoofing
* Approval status is immutable once submitted
* Timeout mechanisms for pending approvals
Implementation Notes
RLS Policy Structure
-- Example policy structure
CREATE POLICY "policy_name" ON table_name
  FOR operation USING (condition) WITH CHECK (condition);

-- Use role-based conditions
WHERE EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'super_admin')

-- Use school-based isolation  
WHERE school_id = (SELECT school_id FROM profiles WHERE user_id = auth.uid())

-- Use transparency settings
WHERE transparency_enabled = true OR is_super_admin(auth.uid())
Helper Functions Needed
* is_super_admin(user_id) - Check if user is Super Admin
* get_user_school(user_id) - Get user's school ID
* can_access_payment_data(user_id, school_id) - Check payment data access
* is_school_admin(user_id, school_id) - Check if user is admin of specific school
These policies ensure data security while maintaining operational flexibility and proper audit trails.



