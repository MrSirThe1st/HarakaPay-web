import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, isAuthError } from '@/lib/apiAuth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Authenticate and authorize
    const authResult = await authenticateRequest({
      requiredRoles: ['super_admin', 'platform_admin', 'support_admin'],
      requireActive: true
    }, request);
    if (isAuthError(authResult)) return authResult;
    const { profile, adminClient } = authResult;

    const body = await request.json();

    // Validate status if provided
    if (body.status && !["pending", "in_progress", "approved", "rejected"].includes(body.status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status" },
        { status: 400 }
      );
    }

    // Build update object
    const updateData: {
      updated_at: string;
      status?: string;
      reviewed_by?: string;
      admin_notes?: string;
    } = {
      updated_at: new Date().toISOString(),
    };

    if (body.status) {
      updateData.status = body.status;
      updateData.reviewed_by = profile.id;
    }

    if (body.admin_notes !== undefined) {
      updateData.admin_notes = body.admin_notes;
    }

    // Update the request using admin client to bypass RLS
    const { data, error } = await adminClient
      .from("school_registration_requests")
      .update(updateData as never)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating registration request:", error);
      return NextResponse.json(
        { success: false, error: "Failed to update registration request" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Authenticate and authorize
    const authResult = await authenticateRequest({
      requiredRoles: ['super_admin', 'platform_admin', 'support_admin'],
      requireActive: true
    }, request);
    if (isAuthError(authResult)) return authResult;
    const { adminClient } = authResult;

    // Get the specific request using admin client to bypass RLS
    const { data, error } = await adminClient
      .from("school_registration_requests")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching registration request:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch registration request" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: "Registration request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

