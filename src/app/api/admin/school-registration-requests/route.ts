import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, isAuthError } from '@/lib/apiAuth';
import { createAdminClient } from "@/lib/supabaseServerOnly";

// Force dynamic rendering (required for Next.js 16+)
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest({
      requiredRoles: ['super_admin', 'platform_admin', 'support_admin']
    }, request);
    if (isAuthError(authResult)) return authResult;
    const { user, profile, adminClient } = authResult;

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    // Build query using admin client to bypass RLS
    let query = adminClient
      .from("school_registration_requests")
      .select("*")
      .order("created_at", { ascending: false });

    // Apply filters
    if (status) {
      query = query.eq("status", status);
    }

    // Apply search
    if (search) {
      query = query.or(
        `school_name.ilike.%${search}%,contact_person_name.ilike.%${search}%,contact_person_email.ilike.%${search}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching registration requests:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch registration requests" },
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

