import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabaseServerOnly';

/**
 * Get the payment plan that has been used for a student's fee category
 * Returns the payment_plan_id that has been used (if any)
 */
export async function GET(req: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify the token
    const supabase = createAdminClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');
    const categoryId = searchParams.get('categoryId');

    if (!studentId || !categoryId) {
      return NextResponse.json(
        { error: 'studentId and categoryId are required' },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();

    // Verify parent owns this student
    const { data: parent } = await adminClient
      .from('parents')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!parent) {
      return NextResponse.json({ error: 'Parent not found' }, { status: 404 });

    }

    const typedParent = parent as { id: string };

    const { data: parentStudent } = await adminClient
      .from('parent_students')
      .select('student_id')
      .eq('parent_id', typedParent.id)
      .eq('student_id', studentId)
      .single();

    if (!parentStudent) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get fee assignment for this student
    const { data: feeAssignment } = await adminClient
      .from('student_fee_assignments')
      .select('id, structure_id')
      .eq('student_id', studentId)
      .in('status', ['active', 'fully_paid'])
      .maybeSingle();

    if (!feeAssignment) {
      return NextResponse.json({
        used_payment_plan_id: null
      });
    }

    const typedFeeAssignment = feeAssignment as { id: string; structure_id: string };

    // Get payment plans for this category
    const { data: categoryPlans } = await adminClient
      .from('payment_plans')
      .select('id')
      .eq('structure_id', typedFeeAssignment.structure_id)
      .eq('fee_category_id', categoryId);

    if (!categoryPlans || categoryPlans.length === 0) {
      return NextResponse.json({
        used_payment_plan_id: null
      });
    }

    const typedCategoryPlans = categoryPlans as { id: string }[];
    const planIds = typedCategoryPlans.map(p => p.id);

    // Get the first completed payment transaction for any of these payment plans
    const { data: usedTransaction } = await adminClient
      .from('payment_transactions')
      .select('payment_plan_id')
      .eq('student_fee_assignment_id', typedFeeAssignment.id)
      .in('payment_plan_id', planIds)
      .eq('transaction_status', 'completed')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    const typedUsedTransaction = usedTransaction as { payment_plan_id: string } | null;

    return NextResponse.json({
      used_payment_plan_id: typedUsedTransaction?.payment_plan_id || null
    });

  } catch (error) {
    console.error('Used payment plan API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

