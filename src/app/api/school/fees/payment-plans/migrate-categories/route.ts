// Migration endpoint to populate fee_category_id for existing payment plans
import { NextResponse } from 'next/server';
import { authenticateRequest, isAuthError } from '@/lib/apiAuth';

export async function POST(req: Request) {
  try {
    const authResult = await authenticateRequest({
      requiredRoles: ['school_admin'],
      requireSchool: true,
      requireActive: true
    }, req);
    if (isAuthError(authResult)) return authResult;
    const { profile, adminClient } = authResult;

    if (!profile.school_id) {
      return NextResponse.json({ error: 'No school assigned' }, { status: 400 });
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

    interface PaymentPlan {
      id: string;
      structure_id: string;
      type: string;
      discount_percentage?: number;
      installments?: unknown;
      fee_structures?: unknown;
    }

    const typedPaymentPlans = paymentPlans as PaymentPlan[];

    console.log('📊 Found payment plans to migrate:', typedPaymentPlans.length);

    let updatedCount = 0;
    const updates = [];

    // For each payment plan, match it to a fee category based on amount
    for (const plan of typedPaymentPlans) {
      // Handle fee_structures as array or single object (Supabase type inference issue)
      const feeStructureData = plan.fee_structures;
      const feeStructure = Array.isArray(feeStructureData) ? feeStructureData[0] : feeStructureData;
      if (!feeStructure || !feeStructure.fee_items) continue;

      interface FeeItem {
        fee_category_id?: string;
        amount?: number;
        [key: string]: unknown;
      }
      interface Installment {
        amount?: number;
        [key: string]: unknown;
      }
      const feeItems = (feeStructure.fee_items || []) as FeeItem[];

      // Calculate plan total
      const installments = (plan.installments || []) as Installment[];
      const planTotal = installments.reduce((sum, inst) => sum + (inst.amount || 0), 0);

      // Find matching fee category
      let matchedCategoryId = null;
      for (const item of feeItems) {
        if (!item.amount) continue; // Skip items without amount

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
          .update({ fee_category_id: update.fee_category_id } as never)
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
