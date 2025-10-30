import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabaseServerOnly";

export async function POST(request: NextRequest) {
  console.log("🔥 API ROUTE HIT - POST request received");
  console.log("Request URL:", request.url);
  console.log("Request method:", request.method);
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = [
      'school_name',
      'school_address', 
      'registration_number',
      'school_email',
      'contact_person_name',
      'contact_person_email'
    ];
    
    for (const field of requiredFields) {
      if (!body[field] || body[field].trim() === '') {
        return NextResponse.json(
          { success: false, error: `${field.replace('_', ' ')} is required` }, 
          { status: 400 }
        );
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.school_email)) {
      return NextResponse.json(
        { success: false, error: "Invalid school email format" }, 
        { status: 400 }
      );
    }
    if (!emailRegex.test(body.contact_person_email)) {
      return NextResponse.json(
        { success: false, error: "Invalid contact person email format" }, 
        { status: 400 }
      );
    }

    // Validate arrays
    if (!Array.isArray(body.fee_schedules) || body.fee_schedules.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one fee schedule is required" }, 
        { status: 400 }
      );
    }
    if (!Array.isArray(body.school_levels) || body.school_levels.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one school level is required" }, 
        { status: 400 }
      );
    }
    if (!Array.isArray(body.grade_levels) || body.grade_levels.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one grade level is required" }, 
        { status: 400 }
      );
    }

    // Parse school size
    let schoolSize: number | null = null;
    if (body.school_size) {
      const parsed = parseInt(body.school_size);
      if (!isNaN(parsed) && parsed > 0) {
        schoolSize = parsed;
      }
    }

    const adminClient = createAdminClient();

    const insertPayload = {
      school_name: body.school_name.trim(),
      school_address: body.school_address.trim(),
      registration_number: body.registration_number.trim(),
      school_email: body.school_email.trim().toLowerCase(),
      school_size: schoolSize,
      contact_person_name: body.contact_person_name.trim(),
      contact_person_email: body.contact_person_email.trim().toLowerCase(),
      contact_person_phone: body.contact_person_phone?.trim() || null,
      existing_systems: Array.isArray(body.existing_systems) ? body.existing_systems : [],
      has_mpesa_account: Boolean(body.has_mpesa_account),
      fee_schedules: body.fee_schedules,
      school_levels: body.school_levels,
      grade_levels: body.grade_levels,
      additional_info: body.additional_info?.trim() || null,
      status: "pending"
    };

    const { data, error } = await adminClient
      .from("school_registration_requests")
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to submit registration request" }, 
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: { 
        id: data.id, 
        message: "Registration request submitted successfully" 
      } 
    });

  } catch (error) {
    console.error("Error processing registration request:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" }, 
      { status: 500 }
    );
  }
}