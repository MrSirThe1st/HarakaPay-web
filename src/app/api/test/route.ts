import { NextResponse } from 'next/server';

// Force dynamic rendering (required for Next.js 16+)
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  console.log('🚀 GET /api/test called');
  return NextResponse.json({ message: 'Test API route is working!' });
}

export async function POST() {
  console.log('🚀 POST /api/test called');
  return NextResponse.json({ message: 'Test POST API route is working!' });
}

