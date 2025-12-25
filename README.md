# HarakaPay Web

Digital school fee payment platform for Congo - Web portal for schools and platform administrators.

## Overview

HarakaPay enables instant school fee payments via mobile money (M-Pesa, Airtel Money, Orange Money) eliminating in-person payment queues. This repository contains the web interface for schools and platform admins.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Payments**: M-Pesa, Airtel Money, Orange Money APIs
- **Deployment**: Vercel

## Features

### School Portal
- Student and parent database management
- Real-time payment tracking
- Bulk communications and reminders
- Fee structure configuration
- Payment reports and data export

### Admin Dashboard
- School registration and approval
- Transaction monitoring
- User role and permission management
- Security policy enforcement
- Platform-wide analytics

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/HarakaPay-web.git
cd HarakaPay-web

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Project Structure

```
HarakaPay-web/
├── app/
│   ├── admin/          # Platform admin interface
│   ├── school/         # School portal interface
│   └── api/            # API routes
├── components/
│   ├── admin/          # Admin-specific components
│   ├── school/         # School-specific components
│   └── shared/         # Shared components
├── lib/
│   ├── supabase/       # Supabase client setup
│   └── utils/          # Utility functions
└── types/              # TypeScript type definitions
```

## Development

```bash
# Run dev server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Build for production
npm run build
```

## Database

Generate TypeScript types from Supabase schema:

```bash
npx supabase gen types typescript --project-id "your_project_id" --schema public > database.types.ts
```

## Authentication & Access

- No public signup - all accounts created administratively
- Role-based access control (Super Admin, Platform Admin, Support Admin, School Admin, School Staff)
- Dual-mode interface for admins (Admin/School views)
- See `/docs/access-policies.md` for detailed permission structure

## Deployment

```bash
# Build production bundle
npm run build

# Deploy to Vercel
vercel --prod
```

## Related Repositories

- [HarakaPay Mobile](https://github.com/yourusername/HarakaPay-mobile) - Parent-facing React Native app

## Documentation

- [User Access Policies](./docs/access-policies.md)
- [Database RLS Policies](./docs/rls-policies.md)
- [Design Guidelines](./docs/design-guidelines.md)
- [API Documentation](./docs/api.md)

## License

MIT