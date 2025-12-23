import { NextResponse } from 'next/server';
import { authenticateRequest, isAuthError } from '@/lib/apiAuth';

// Force dynamic rendering (required for Next.js 16+)
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    const authResult = await authenticateRequest({
      requiredRoles: ['school_admin', 'school_staff'],
      requireSchool: true,
      requireActive: true
    }, req);
    if (isAuthError(authResult)) return authResult;

    // Payment schedules feature is not available in current schema
    return NextResponse.json({
      success: false,
      error: 'Payment schedules feature is not available. Please use payment plans instead.'
    }, { status: 501 });

  } catch (error) {
    console.error('Payment schedules API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const authResult = await authenticateRequest({
      requiredRoles: ['school_admin'],
      requireSchool: true,
      requireActive: true
    }, req);
    if (isAuthError(authResult)) return authResult;

    return NextResponse.json({
      success: false,
      error: 'Payment schedules feature is not available. Please use payment plans instead.'
    }, { status: 501 });

  } catch (error) {
    console.error('Payment schedules API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
