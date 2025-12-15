import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, isAuthError } from '@/lib/apiAuth';
import { z } from "zod";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

const RejectSchema = z.object({
  rejection_reason: z.string().min(1, "Rejection reason is required"),
});

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

    // Parse and validate request body
    const body = await request.json();
    const validation = RejectSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Rejection reason is required" },
        { status: 400 }
      );
    }

    const { rejection_reason } = validation.data;
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
        { success: false, error: "Not authorized to reject this fee rate" },
        { status: 403 }
      );
    }

    // Check if this rate can be rejected by school
    if (typedFeeRate.status !== "pending_school") {
      return NextResponse.json(
        { success: false, error: `Cannot reject: rate status is ${typedFeeRate.status}` },
        { status: 400 }
      );
    }

    // Reject the rate
    const { data: updatedRate, error: updateError } = await adminClient
      .from("payment_fee_rates")
      .update({
        status: "rejected_by_school",
        rejection_reason,
        rejected_by: profile.id,
        rejected_at: new Date().toISOString(),
      } as never)
      .eq("id", rateId)
      .select()
      .single();

    if (updateError) {
      console.error("Error rejecting fee rate:", updateError);
      return NextResponse.json(
        { success: false, error: "Failed to reject fee rate" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedRate,
      message: "Fee rate proposal rejected."
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
