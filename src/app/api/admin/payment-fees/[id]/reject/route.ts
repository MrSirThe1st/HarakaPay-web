import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, isAuthError } from '@/lib/apiAuth';
import { createAdminClient } from "@/lib/supabaseServerOnly";
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
      requiredRoles: ['super_admin', 'platform_admin']
    }, request);
    if (isAuthError(authResult)) return authResult;
    const { user, profile, adminClient } = authResult;

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
      .select("*, school:schools(id, name, verification_status)")
      .eq("id", rateId)
      .single();

    if (fetchError || !feeRate) {
      return NextResponse.json(
        { success: false, error: "Fee rate not found" },
        { status: 404 }
      );
    }

    // Verify school is verified
    if (feeRate.school?.verification_status !== 'verified') {
      return NextResponse.json(
        { success: false, error: "Payment fees can only be managed for verified schools" },
        { status: 403 }
      );
    }

    // Check if this rate can be rejected by admin
    if (feeRate.status !== "pending_admin") {
      return NextResponse.json(
        { success: false, error: `Cannot reject: rate status is ${feeRate.status}` },
        { status: 400 }
      );
    }

    // Reject the rate
    const { data: updatedRate, error: updateError } = await adminClient
      .from("payment_fee_rates")
      .update({
        status: "rejected_by_admin",
        rejection_reason,
        rejected_by: profile.id,
        rejected_at: new Date().toISOString(),
      })
      .eq("id", rateId)
      .select(`
        *,
        school:schools(id, name)
      `)
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
      message: `Fee rate proposal rejected for ${feeRate.school.name}.`
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
