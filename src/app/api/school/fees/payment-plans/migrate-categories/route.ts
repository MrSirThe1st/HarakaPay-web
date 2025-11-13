// Migration endpoint to populate fee_category_id for existing payment plans
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createAdminClient } from '@/lib/supabaseServerOnly';
import { Database } from '@/types/supabase';

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies: async () => await cookies() });

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user profile to check role and school
    const adminClient = createAdminClient();
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('role, school_id, is_active, user_id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { success: false, error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Only school admins can run migrations
    if (profile.role !== 'school_admin') {
      return NextResponse.json(
        { success: false, error: 'Only school admins can run migrations' },
        { status: 403 }
      );
    }

    if (!profile.school_id) {
      return NextResponse.json(
        { success: false, error: 'School not found' },
        { status: 404 }
      );
    }

    console.log('🔄 Starting payment plans migration for school:', profile.school_id);

    // Get all payment plans for this school that don't have a fee_category_id
    const { data: paymentPlans, error: plansError } = await adminClient
      .from('payment_plans')
      .select(`
        id,
        structure_id,
        type,
        discount_percentage,
        installments,
        fee_structures!inner(
          id,
          school_id,
          fee_items
        )
      `)
      .eq('fee_structures.school_id', profile.school_id)
      .is('fee_category_id', null);

    if (plansError) {
      console.error('Error fetching payment plans:', plansError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch payment plans' },
        { status: 500 }
      );
    }

    if (!paymentPlans || paymentPlans.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No payment plans need migration',
        updated: 0
      });
    }

    console.log('📊 Found payment plans to migrate:', paymentPlans.length);

    let updatedCount = 0;
    const updates = [];

    // For each payment plan, match it to a fee category based on amount
    for (const plan of paymentPlans) {
      // Handle fee_structures as array or single object (Supabase type inference issue)
      const feeStructureData = plan.fee_structures;
      const feeStructure = Array.isArray(feeStructureData) ? feeStructureData[0] : feeStructureData;
      if (!feeStructure || !feeStructure.fee_items) continue;

      const feeItems = feeStructure.fee_items as any[];

      // Calculate plan total
      const installments = (plan.installments as any[]) || [];
      const planTotal = installments.reduce((sum, inst) => sum + (inst.amount || 0), 0);

      // Find matching fee category
      let matchedCategoryId = null;
      for (const item of feeItems) {
        const expectedTotal = item.amount * (1 - (plan.discount_percentage || 0) / 100);
        const tolerance = item.amount * 0.05; // 5% tolerance

        if (Math.abs(planTotal - expectedTotal) <= tolerance) {
          matchedCategoryId = item.categoryId;
          console.log(`✅ Matched plan ${plan.id} (${planTotal}) to category ${item.categoryName} (${item.amount})`);
          break;
        }
      }

      if (matchedCategoryId) {
        updates.push({
          id: plan.id,
          fee_category_id: matchedCategoryId
        });
        updatedCount++;
      } else {
        console.warn(`⚠️ Could not match plan ${plan.id} (total: ${planTotal}) to any category`);
      }
    }

    // Batch update payment plans
    if (updates.length > 0) {
      for (const update of updates) {
        const { error: updateError } = await adminClient
          .from('payment_plans')
          .update({ fee_category_id: update.fee_category_id })
          .eq('id', update.id);

        if (updateError) {
          console.error(`Error updating plan ${update.id}:`, updateError);
        }
      }
    }

    console.log(`✨ Migration complete: ${updatedCount} payment plans updated`);

    return NextResponse.json({
      success: true,
      message: `Successfully migrated ${updatedCount} payment plan(s)`,
      total_plans: paymentPlans.length,
      updated: updatedCount,
      unmatched: paymentPlans.length - updatedCount
    });

  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}
