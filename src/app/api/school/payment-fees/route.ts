import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, isAuthError } from '@/lib/apiAuth';
import { createAdminClient } from "@/lib/supabaseServerOnly";
import { z } from "zod";

// Validation schema for creating fee rate proposal
const CreateFeeRateSchema = z.object({
  fee_percentage: z.number().min(0).max(100),
  effective_from: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest({
      requiredRoles: ['school_admin', 'school_staff']
    }, request);
    if (isAuthError(authResult)) return authResult;
    const { user, profile, adminClient } = authResult;

    if (!profile.school_id) {
      return NextResponse.json(
        { success: false, error: "School association required" },
        { status: 403 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");

    // Build query for school's fee rates
    let query = adminClient
      .from("payment_fee_rates")
      .select(`
        *,
        proposed_by:profiles!payment_fee_rates_proposed_by_id_fkey(id, first_name, last_name, role),
        school_approved_by_profile:profiles!payment_fee_rates_school_approved_by_fkey(id, first_name, last_name),
        admin_approved_by_profile:profiles!payment_fee_rates_admin_approved_by_fkey(id, first_name, last_name)
      `)
      .eq("school_id", profile.school_id)
      .order("created_at", { ascending: false });

    // Apply filters
    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching payment fee rates:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch payment fee rates" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest({
      requiredRoles: ['school_admin', 'school_staff']
    }, request);
    if (isAuthError(authResult)) return authResult;
    const { user, profile, adminClient } = authResult;

    const isSchoolAdmin = profile.role === "school_admin";
    if (!isSchoolAdmin || !profile.school_id) {
      return NextResponse.json(
        { success: false, error: "School admin access required" },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = CreateFeeRateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Invalid request data", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { fee_percentage, effective_from } = validation.data;

    // Check if there's already a pending proposal for this school
    const { data: existingPending } = await adminClient
      .from("payment_fee_rates")
      .select("id, status")
      .eq("school_id", profile.school_id)
      .in("status", ["pending_school", "pending_admin"])
      .single();

    if (existingPending) {
      return NextResponse.json(
        { success: false, error: "There is already a pending fee rate proposal for your school" },
        { status: 409 }
      );
    }

    // Create new fee rate (school proposes -> pending_admin)
    const { data: newRate, error: createError } = await adminClient
      .from("payment_fee_rates")
      .insert({
        school_id: profile.school_id,
        fee_percentage,
        status: "pending_admin",
        proposed_by_id: profile.id,
        proposed_by_role: "school_admin",
        effective_from: effective_from || new Date().toISOString(),
      })
      .select()
      .single();

    if (createError) {
      console.error("Error creating fee rate:", createError);
      return NextResponse.json(
        { success: false, error: "Failed to create fee rate proposal" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: newRate,
      message: "Fee rate proposal created. Awaiting platform admin approval."
    }, { status: 201 });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
