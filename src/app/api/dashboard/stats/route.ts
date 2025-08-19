import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { dashboardService } from '@/lib/dashboardService';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile to determine role and school
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, school_id')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    let stats;
    
    if (profile.role === 'admin') {
      // Admin gets platform-wide stats
      stats = await dashboardService.getAdminDashboardStats();
    } else if (profile.role === 'school_staff' && profile.school_id) {
      // School staff gets their school's stats
      stats = await dashboardService.getSchoolDashboardStats(profile.school_id);
    } else {
      return NextResponse.json({ error: 'Invalid role or school not assigned' }, { status: 400 });
    }

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

