import { NextResponse } from 'next/server';

export async function GET() {
  console.log('🚀 GET /api/test called');
  return NextResponse.json({ message: 'Test API route is working!' });
}

export async function POST() {
  console.log('🚀 POST /api/test called');
  return NextResponse.json({ message: 'Test POST API route is working!' });
}

