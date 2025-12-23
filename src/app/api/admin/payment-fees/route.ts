import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, isAuthError } from '@/lib/apiAuth';
import { z } from "zod";

// Force dynamic rendering (required for Next.js 16+)
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface School {
  id?: string;
  name?: string;
  verification_status: string;
}

// Validation schema for creating fee rate
const CreateFeeRateSchema = z.object({
  school_id: z.string().uuid(),
  fee_percentage: z.number().min(0).max(100),
  effective_from: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest({
      requiredRoles: ['super_admin', 'platform_admin']
    }, request);
    if (isAuthError(authResult)) return authResult;
    const { adminClient } = authResult;

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const schoolId = searchParams.get("school_id");

    // If schoolId is provided, verify the school is verified
    if (schoolId) {
      const { data: school } = await adminClient
        .from("schools")
        .select("verification_status")
        .eq("id", schoolId)
        .single();

      const typedSchool = school as School | null;

      if (!typedSchool || typedSchool.verification_status !== 'verified') {
        return NextResponse.json(
          { success: false, error: "Payment fees can only be viewed for verified schools" },
          { status: 403 }
        );
      }
    }

    // Build query with relations
    let query = adminClient
      .from("payment_fee_rates")
      .select(`
        *,
        school:schools!inner(id, name, verification_status),
        proposed_by:profiles!payment_fee_rates_proposed_by_id_fkey(id, first_name, last_name, role),
        school_approved_by_profile:profiles!payment_fee_rates_school_approved_by_fkey(id, first_name, last_name),
        admin_approved_by_profile:profiles!payment_fee_rates_admin_approved_by_fkey(id, first_name, last_name)
      `)
      .eq("school.verification_status", "verified")
      .order("created_at", { ascending: false });

    // Apply filters
    if (status) {
      query = query.eq("status", status);
    }

    if (schoolId) {
      query = query.eq("school_id", schoolId);
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
      requiredRoles: ['super_admin', 'platform_admin']
    }, request);
    if (isAuthError(authResult)) return authResult;
    const { profile, adminClient } = authResult;

    // Parse and validate request body
    const body = await request.json();
    const validation = CreateFeeRateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Invalid request data", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { school_id, fee_percentage, effective_from } = validation.data;

    // Check if school exists and is verified
    const { data: school, error: schoolError } = await adminClient
      .from("schools")
      .select("id, name, verification_status")
      .eq("id", school_id)
      .single();

    if (schoolError || !school) {
      return NextResponse.json(
        { success: false, error: "School not found" },
        { status: 404 }
      );
    }

    const typedSchool = school as School;

    // Only allow fee management for verified schools
    if (typedSchool.verification_status !== 'verified') {
      return NextResponse.json(
        { success: false, error: "Payment fees can only be managed for verified schools" },
        { status: 403 }
      );
    }

    // Check if there's already a pending proposal for this school
    const { data: existingPending } = await adminClient
      .from("payment_fee_rates")
      .select("id, status")
      .eq("school_id", school_id)
      .in("status", ["pending_school", "pending_admin"])
      .single();

    if (existingPending) {
      return NextResponse.json(
        { success: false, error: "There is already a pending fee rate proposal for this school" },
        { status: 409 }
      );
    }

    // Create new fee rate (admin proposes -> pending_school)
    const { data: newRate, error: createError } = await adminClient
      .from("payment_fee_rates")
      .insert({
        school_id,
        fee_percentage,
        status: "pending_school",
        proposed_by_id: profile.id,
        proposed_by_role: "platform_admin",
        effective_from: effective_from || new Date().toISOString(),
      } as any)
      .select(`
        *,
        school:schools(id, name)
      `)
      .single();

    if (createError) {
      console.error("Error creating fee rate:", createError);
      return NextResponse.json(
        { success: false, error: "Failed to create fee rate" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: newRate,
      message: `Fee rate proposal created for ${typedSchool.name}. Awaiting school approval.`
    }, { status: 201 });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
