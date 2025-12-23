import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, isAuthError } from '@/lib/apiAuth';
import { createAdminClient } from '@/lib/supabaseServerOnly';

// Force dynamic rendering (required for Next.js 16+)
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Authenticate and get user profile
    const authResult = await authenticateRequest({
      requiredRoles: ['super_admin', 'platform_admin', 'support_admin', 'school_admin', 'school_staff'],
      requireActive: true
    }, request);

    // Check if authentication failed
    if (isAuthError(authResult)) {
      return authResult;
    }

    const { profile, adminClient } = authResult;

    let stats;

    if (['super_admin', 'platform_admin', 'support_admin'].includes(profile.role)) {
      // Admin gets platform-wide stats
      stats = await getAdminDashboardStats(adminClient);
    } else if (['school_admin', 'school_staff'].includes(profile.role) && profile.school_id) {
      // School staff gets their school's stats
      stats = await getSchoolDashboardStats(adminClient, profile.school_id);
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

    // OPTIMIZATION: Batch all platform stats queries in parallel
    const lastMonthStart = new Date(lastMonthYear, lastMonth, 1);
    const lastMonthEnd = new Date(lastMonthYear, lastMonth + 1, 0);

    const [
      { count: totalSchools },
      { count: lastMonthSchools },
      { count: activeUsers },
      { count: lastMonthUsers },
      { data: payments },
      { data: lastMonthPayments }
    ] = await Promise.all([
      // Total schools count
      adminClient
        .from('schools')
        .select('*', { count: 'exact', head: true }),

      // Schools count from last month
      adminClient
        .from('schools')
        .select('*', { count: 'exact', head: true })
        .lte('created_at', lastMonthEnd.toISOString()),

      // Active users count
      adminClient
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true),

      // Active users from last month
      adminClient
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .lte('created_at', lastMonthEnd.toISOString()),

      // Total revenue from completed payments
      adminClient
        .from('payments')
        .select('amount')
        .eq('status', 'completed'),

      // Revenue from last month
      adminClient
        .from('payments')
        .select('amount')
        .eq('status', 'completed')
        .gte('payment_date', lastMonthStart.toISOString())
        .lte('payment_date', lastMonthEnd.toISOString())
    ]);

    const totalRevenue = payments?.reduce((sum: number, payment: { amount: number }) => sum + payment.amount, 0) || 0;
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
    // OPTIMIZATION: Batch all school-level queries in parallel
    const currentMonthStart = new Date(currentYear, currentMonth, 1);

    const [
      { count: activeStudents },
      { data: studentIds },
      { data: payments },
      { data: monthlyPayments }
    ] = await Promise.all([
      // Active students count
      adminClient
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('school_id', schoolId)
        .eq('status', 'active'),

      // Get student IDs for payment queries
      adminClient
        .from('students')
        .select('id')
        .eq('school_id', schoolId),

      // Total revenue (using school_id directly if possible, or fetch all payments)
      adminClient
        .from('payments')
        .select('amount, student_id, students!inner(school_id)')
        .eq('students.school_id', schoolId)
        .eq('status', 'completed'),

      // Monthly revenue
      adminClient
        .from('payments')
        .select('amount, student_id, students!inner(school_id)')
        .eq('students.school_id', schoolId)
        .eq('status', 'completed')
        .gte('payment_date', currentMonthStart.toISOString())
    ]);

    const totalRevenue = payments?.reduce((sum: number, payment: { amount: number }) => sum + payment.amount, 0) || 0;
    const monthlyRevenue = monthlyPayments?.reduce((sum: number, payment: { amount: number }) => sum + payment.amount, 0) || 0;

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

