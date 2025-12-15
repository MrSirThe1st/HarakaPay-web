import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, isAuthError } from '@/lib/apiAuth';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await authenticateRequest({
      requiredRoles: ['school_admin', 'school_staff']
    }, request);
    if (isAuthError(authResult)) return authResult;
    const { profile, adminClient } = authResult;

    if (!profile.school_id) {
      return NextResponse.json(
        { success: false, error: "School association required" },
        { status: 403 }
      );
    }

    const resolvedParams = await params;
    const rateId = resolvedParams.id;

    // Get the fee rate
    const { data: feeRate, error: fetchError } = await adminClient
      .from("payment_fee_rates")
      .select("*")
      .eq("id", rateId)
      .single();

    interface FeeRate {
      school_id: string;
      status: string;
      proposed_by_id: string;
      [key: string]: unknown;
    }
    const typedFeeRate = feeRate as FeeRate | null;

    if (fetchError || !typedFeeRate) {
      return NextResponse.json(
        { success: false, error: "Fee rate not found" },
        { status: 404 }
      );
    }

    // Verify this rate belongs to the school
    if (typedFeeRate.school_id !== profile.school_id) {
      return NextResponse.json(
        { success: false, error: "Not authorized to approve this fee rate" },
        { status: 403 }
      );
    }

    // Check if this rate is pending school approval
    if (typedFeeRate.status !== "pending_school") {
      return NextResponse.json(
        { success: false, error: `Cannot approve: rate status is ${typedFeeRate.status}` },
        { status: 400 }
      );
    }

    // Prevent self-approval
    if (typedFeeRate.proposed_by_id === profile.id) {
      return NextResponse.json(
        { success: false, error: "Cannot approve own proposal" },
        { status: 403 }
      );
    }

    // Approve the rate (school approval, still needs admin approval)
    const { data: updatedRate, error: updateError } = await adminClient
      .from("payment_fee_rates")
      .update({
        status: "pending_admin",
        school_approved_at: new Date().toISOString(),
        school_approved_by: profile.id,
      } as never)
      .eq("id", rateId)
      .select()
      .single();

    if (updateError) {
      console.error("Error approving fee rate:", updateError);
      return NextResponse.json(
        { success: false, error: "Failed to approve fee rate" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedRate,
      message: "Fee rate approved. Awaiting platform admin approval."
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
