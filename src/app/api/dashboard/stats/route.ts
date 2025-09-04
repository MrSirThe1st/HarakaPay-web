import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabaseServerOnly';

export async function GET() {
  try {
    console.log('Dashboard stats API called');
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Check authentication using regular client
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.log('Auth error:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('User authenticated:', user.id);

    // Use admin client for database operations
    const adminClient = createAdminClient();

    // Get user profile using admin client (bypasses RLS)
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('role, school_id, is_active')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('Profile fetch error:', profileError);
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    if (!profile.is_active) {
      return NextResponse.json({ error: 'Account inactive' }, { status: 403 });
    }

    console.log('User profile found:', { role: profile.role, school_id: profile.school_id });

    // Check if user has permission to view dashboard stats
    const allowedRoles = ['super_admin', 'platform_admin', 'support_admin', 'school_admin', 'school_staff'];
    if (!allowedRoles.includes(profile.role)) {
      return NextResponse.json({ 
        error: `Role '${profile.role}' cannot view dashboard stats` 
      }, { status: 403 });
    }

    let stats;
    
    if (['super_admin', 'platform_admin', 'support_admin'].includes(profile.role)) {
      // Admin gets platform-wide stats
      console.log('Fetching admin dashboard stats...');
      stats = await getAdminDashboardStats(adminClient);
      console.log('Admin stats fetched:', stats);
    } else if (['school_admin', 'school_staff'].includes(profile.role) && profile.school_id) {
      // School staff gets their school's stats
      console.log('Fetching school dashboard stats for school:', profile.school_id);
      stats = await getSchoolDashboardStats(adminClient, profile.school_id);
      console.log('School stats fetched:', stats);
    } else {
      return NextResponse.json({ error: 'Invalid role or school not assigned' }, { status: 400 });
    }

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('API error in /api/dashboard/stats:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Helper function to get admin dashboard stats
async function getAdminDashboardStats(adminClient: ReturnType<typeof createAdminClient>) {
  try {
    // Get current month and last month for comparison
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    // Get total schools count
    const { count: totalSchools } = await adminClient
      .from('schools')
      .select('*', { count: 'exact', head: true });

    // Get schools count from last month for comparison
    const lastMonthStart = new Date(lastMonthYear, lastMonth, 1);
    const lastMonthEnd = new Date(lastMonthYear, lastMonth + 1, 0);
    
    const { count: lastMonthSchools } = await adminClient
      .from('schools')
      .select('*', { count: 'exact', head: true })
      .lte('created_at', lastMonthEnd.toISOString());

    // Get active users count (profiles with is_active = true)
    const { count: activeUsers } = await adminClient
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Get active users count from last month
    const { count: lastMonthUsers } = await adminClient
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .lte('created_at', lastMonthEnd.toISOString());

    // Get total revenue from completed payments
    const { data: payments } = await adminClient
      .from('payments')
      .select('amount')
      .eq('status', 'completed');

    const totalRevenue = payments?.reduce((sum: number, payment: { amount: number }) => sum + payment.amount, 0) || 0;

    // Get revenue from last month
    const { data: lastMonthPayments } = await adminClient
      .from('payments')
      .select('amount')
      .eq('status', 'completed')
      .gte('payment_date', lastMonthStart.toISOString())
      .lte('payment_date', lastMonthEnd.toISOString());

    const lastMonthRevenue = lastMonthPayments?.reduce((sum: number, payment: { amount: number }) => sum + payment.amount, 0) || 0;


    // Calculate percentage changes
    const schoolsChange = lastMonthSchools && lastMonthSchools > 0 
      ? ((totalSchools || 0) - lastMonthSchools) / lastMonthSchools * 100 
      : 0;

    const usersChange = lastMonthUsers && lastMonthUsers > 0 
      ? ((activeUsers || 0) - lastMonthUsers) / lastMonthUsers * 100 
      : 0;

    const revenueChange = lastMonthRevenue > 0 
      ? (totalRevenue - lastMonthRevenue) / lastMonthRevenue * 100 
      : 0;


    return {
      totalSchools: totalSchools || 0,
      activeUsers: activeUsers || 0,
      totalRevenue,
      schoolsChange,
      usersChange,
      revenueChange
    };
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    throw new Error('Failed to fetch admin dashboard statistics');
  }
}

// Helper function to get school dashboard stats
async function getSchoolDashboardStats(adminClient: ReturnType<typeof createAdminClient>, schoolId: string) {
  try {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    // const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    // const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    // Get total students count for this school
    const { count: totalStudents } = await adminClient
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', schoolId);

    // Get active students count
    const { count: activeStudents } = await adminClient
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', schoolId)
      .eq('status', 'active');

    // Get total revenue for this school's students
    const { data: studentIds } = await adminClient
      .from('students')
      .select('id')
      .eq('school_id', schoolId);

    const studentIdList = studentIds?.map((s: { id: string }) => s.id) || [];

    let totalRevenue = 0;
    let monthlyRevenue = 0;

    if (studentIdList.length > 0) {
      // Get total revenue
      const { data: payments } = await adminClient
        .from('payments')
        .select('amount')
        .in('student_id', studentIdList)
        .eq('status', 'completed');

      totalRevenue = payments?.reduce((sum: number, payment: { amount: number }) => sum + payment.amount, 0) || 0;

      // Get monthly revenue
      const currentMonthStart = new Date(currentYear, currentMonth, 1);
      const { data: monthlyPayments } = await adminClient
        .from('payments')
        .select('amount')
        .in('student_id', studentIdList)
        .eq('status', 'completed')
        .gte('payment_date', currentMonthStart.toISOString());

      monthlyRevenue = monthlyPayments?.reduce((sum: number, payment: { amount: number }) => sum + payment.amount, 0) || 0;
    }

    // Calculate changes (simplified for now)
    const studentsChange = 0; // Could be calculated based on enrollment trends
    const revenueChange = 0; // Could be calculated based on previous months

    return {
      totalStudents: totalStudents || 0,
      activeStudents: activeStudents || 0,
      totalRevenue,
      monthlyRevenue,
      studentsChange,
      revenueChange
    };
  } catch (error) {
    console.error('Error fetching school dashboard stats:', error);
    throw new Error('Failed to fetch school dashboard statistics');
  }
}

