import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, isAuthError } from '@/lib/apiAuth';

export async function GET(req: NextRequest) {
  try {
    // Authenticate and get user profile
    const authResult = await authenticateRequest({
      requiredRoles: ['school_admin', 'school_staff'],
      requireSchool: true,
      requireActive: true
    }, req);

    // Check if authentication failed
    if (isAuthError(authResult)) {
      return authResult;
    }

    const { profile, adminClient } = authResult;

    // Profile is guaranteed to have school_id at this point due to requireSchool: true
    const school_id = profile.school_id!;

    // Check if no school_id (defensive - should never happen due to middleware)
    if (!school_id) {
      return NextResponse.json(
        { success: false, error: 'School not found' }, 
        { status: 404 }
      );
    }

    // Get URL parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');
    const offset = (page - 1) * limit;
    const status = searchParams.get('status') || 'all';

    // First, get all student IDs for this school
    console.log('[API] Fetching students for school_id:', school_id);
    const { data: schoolStudents, error: studentsError } = await adminClient
      .from('students')
      .select('id')
      .eq('school_id', school_id);

    interface SchoolStudent {
      id: string;
    }
    const typedSchoolStudents = schoolStudents as SchoolStudent[] | null;

    if (studentsError) {
      console.error('[API] Error fetching students:', studentsError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch students' },
        { status: 500 }
      );
    }

    console.log('[API] Found students:', typedSchoolStudents?.length || 0);

    if (!typedSchoolStudents || typedSchoolStudents.length === 0) {
      console.log('[API] No students found for school, returning empty payment list');
      return NextResponse.json({
        success: true,
        data: {
          payments: [],
          pagination: {
            page,
            limit,
            total: 0,
            pages: 0,
            hasMore: false
          },
          stats: {
            totalRevenue: 0,
            successfulCount: 0,
            pendingCount: 0,
            failedCount: 0,
          }
        }
      });
    }

    const studentIds = typedSchoolStudents.map(s => s.id);

    // Query payments directly filtered by student IDs
    let query = adminClient
      .from('payments')
      .select(`
        *,
        students!inner(
          id,
          first_name,
          last_name,
          student_id
        ),
        parents(
          first_name,
          last_name
        )
      `, { count: 'exact' })
      .in('student_id', studentIds)
      .order('created_at', { ascending: false });

    // Apply status filter
    if (status !== 'all') {
      query = query.eq('status', status);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    console.log('[API] Querying payments for student IDs:', studentIds.length, 'students');
    const { data: payments, error: paymentsError, count } = await query;

    if (paymentsError) {
      console.error('[API] Error fetching payments:', paymentsError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch payments' },
        { status: 500 }
      );
    }

    console.log('[API] Found payments:', payments?.length || 0, 'Total count:', count);

    // Calculate statistics from all payments (not just current page)
    const statsQuery = adminClient
      .from('payments')
      .select(`
        amount,
        status
      `)
      .in('student_id', studentIds);

    if (status !== 'all') {
      statsQuery.eq('status', status);
    }

    const { data: allPayments } = await statsQuery;

    const stats = {
      totalRevenue: 0,
      successfulCount: 0,
      pendingCount: 0,
      failedCount: 0,
    };

    allPayments?.forEach((payment: { status: string; amount?: number | string }) => {
      if (payment.status === 'completed') {
        stats.totalRevenue += parseFloat(payment.amount?.toString() || '0');
        stats.successfulCount++;
      } else if (payment.status === 'pending') {
        stats.pendingCount++;
      } else if (payment.status === 'failed') {
        stats.failedCount++;
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        payments: payments,
        pagination: {
          page,
          limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / limit),
          hasMore: (offset + limit) < (count || 0)
        },
        stats
      }
    });

  } catch (error) {
    console.error('Payments API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }, 
      { status: 500 }
    );
  }
}

