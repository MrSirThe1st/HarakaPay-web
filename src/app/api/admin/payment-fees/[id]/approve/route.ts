import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, isAuthError } from '@/lib/apiAuth';
import { createAdminClient } from "@/lib/supabaseServerOnly";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await authenticateRequest({
      requiredRoles: ['super_admin', 'platform_admin']
    }, request);
    if (isAuthError(authResult)) return authResult;
    const { user, profile, adminClient } = authResult;

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

    // Check if this rate is pending admin approval
    if (feeRate.status !== "pending_admin") {
      return NextResponse.json(
        { success: false, error: `Cannot approve: rate status is ${feeRate.status}` },
        { status: 400 }
      );
    }

    // Check if already approved by school
    if (!feeRate.school_approved_at) {
      return NextResponse.json(
        { success: false, error: "School has not approved yet" },
        { status: 400 }
      );
    }

    // Deactivate any currently active rate for this school
    const { error: deactivateError } = await adminClient
      .from("payment_fee_rates")
      .update({
        status: "expired",
        effective_until: new Date().toISOString()
      })
      .eq("school_id", feeRate.school_id)
      .eq("status", "active");

    if (deactivateError) {
      console.error("Error deactivating old rate:", deactivateError);
    }

    // Approve the rate (admin approval completes the process)
    const { data: updatedRate, error: updateError } = await adminClient
      .from("payment_fee_rates")
      .update({
        status: "active",
        admin_approved_at: new Date().toISOString(),
        admin_approved_by: profile.id,
      })
      .eq("id", rateId)
      .select(`
        *,
        school:schools(id, name)
      `)
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
      message: `Fee rate approved for ${feeRate.school.name}. Rate is now active.`
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
