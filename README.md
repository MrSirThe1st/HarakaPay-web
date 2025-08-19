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
