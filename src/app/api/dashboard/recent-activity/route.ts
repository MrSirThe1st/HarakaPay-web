import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, isAuthError } from '@/lib/apiAuth';
import { dashboardService } from '@/lib/dashboardService';

export async function GET(request: NextRequest) {
  try {
    // Authenticate request
    const authResult = await authenticateRequest({
      requireActive: true
    }, request);
    if (isAuthError(authResult)) return authResult;

    // Get recent activity
    const recentActivity = await dashboardService.getRecentActivity(10);

    return NextResponse.json({ recentActivity });
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

