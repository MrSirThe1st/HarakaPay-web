import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, isAuthError } from '@/lib/apiAuth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest({
      requiredRoles: ['parent']
    }, request);
    if (isAuthError(authResult)) return authResult;
    const { adminClient } = authResult;

    const searchParams = request.nextUrl.searchParams;
    const schoolId = searchParams.get("schoolId");

    if (!schoolId) {
      return NextResponse.json(
        { success: false, error: "School ID required" },
        { status: 400 }
      );
    }

    // Get active fee rate
    const { data: feeRate } = await adminClient
      .from('payment_fee_rates')
      .select('id, fee_percentage, effective_from, effective_until')
      .eq('school_id', schoolId)
      .eq('status', 'active')
      .lte('effective_from', new Date().toISOString())
      .or(`effective_until.is.null,effective_until.gt.${new Date().toISOString()}`)
      .order('effective_from', { ascending: false })
      .limit(1)
      .maybeSingle();

    return NextResponse.json({
      success: true,
      feeRate: feeRate || null,
      defaultPercentage: 2.5
    });
  } catch (error) {
    console.error("Error fetching active fee rate:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch active fee rate" },
      { status: 500 }
    );
  }
}
