import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, isAuthError } from '@/lib/apiAuth';

// Force dynamic rendering (required for Next.js 16+)
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

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

    // Query payments with join filter on school_id instead of IN clause
    console.log('[API] Fetching payments for school_id:', school_id);
    let query = adminClient
      .from('payments')
      .select(`
        *,
        students!inner(
          id,
          first_name,
          last_name,
          student_id,
          school_id
        ),
        parents(
          first_name,
          last_name
        )
      `, { count: 'exact' })
      .eq('students.school_id', school_id)
      .order('created_at', { ascending: false });

    // Apply status filter
    if (status !== 'all') {
      query = query.eq('status', status);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    console.log('[API] Querying payments for school');
    const { data: payments, error: paymentsError, count } = await query;

    if (paymentsError) {
      console.error('[API] Error fetching payments:', {
        message: paymentsError.message,
        details: paymentsError.details,
        hint: paymentsError.hint,
        code: paymentsError.code
      });
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
        status,
        students!inner(school_id)
      `)
      .eq('students.school_id', school_id);

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

    allPayments?.forEach((payment: { status: string | null; amount: number }) => {
      if (payment.status === 'completed') {
        stats.totalRevenue += payment.amount;
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

