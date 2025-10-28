import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabaseServerOnly";

// Handle CORS preflight requests
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

export async function POST(request: NextRequest) {
  console.log("🔥 API ROUTE HIT - POST request received");
  try {
    const body = await request.json();
    console.log("=== RECEIVED BODY ===");
    console.log(JSON.stringify(body, null, 2));

    // Validate required fields - TEMPORARILY DISABLED FOR DEBUGGING
    // if (!body.school_name) return NextResponse.json({ success: false, error: "School name is required" }, { status: 400 });
    // if (!body.school_address) return NextResponse.json({ success: false, error: "School address is required" }, { status: 400 });
    // if (!body.registration_number) return NextResponse.json({ success: false, error: "Registration number is required" }, { status: 400 });
    // if (!body.school_email) return NextResponse.json({ success: false, error: "School email is required" }, { status: 400 });
    // if (!body.school_size) return NextResponse.json({ success: false, error: "School size is required" }, { status: 400 });
    // if (!body.contact_person_name) return NextResponse.json({ success: false, error: "Contact person name is required" }, { status: 400 });
    // if (!body.contact_person_email) return NextResponse.json({ success: false, error: "Contact person email is required" }, { status: 400 });
    // if (!Array.isArray(body.fee_schedules) || body.fee_schedules.length === 0) return NextResponse.json({ success: false, error: "At least one fee schedule is required" }, { status: 400 });
    // if (!Array.isArray(body.school_levels) || body.school_levels.length === 0) return NextResponse.json({ success: false, error: "At least one school level is required" }, { status: 400 });
    // if (!Array.isArray(body.grade_levels) || body.grade_levels.length === 0) return NextResponse.json({ success: false, error: "At least one grade level is required" }, { status: 400 });

    // Validate email format - TEMPORARILY DISABLED FOR DEBUGGING
    // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // if (!emailRegex.test(body.school_email)) {
    //   return NextResponse.json({ success: false, error: "Invalid school email format" }, { status: 400 });
    // }
    // if (!emailRegex.test(body.contact_person_email)) {
    //   return NextResponse.json({ success: false, error: "Invalid contact person email format" }, { status: 400 });
    // }

    console.log("=== ABOUT TO INSERT ===");
    console.log("fee_schedules:", body.fee_schedules);
    console.log("school_levels:", body.school_levels);
    console.log("grade_levels:", body.grade_levels);
    
    const adminClient = createAdminClient();

    // Parse and validate school_size
    let schoolSize: number | null = null;
    if (body.school_size) {
      const parsed = parseInt(body.school_size);
      if (!isNaN(parsed) && parsed > 0) {
        schoolSize = parsed;
      }
    }

    const insertPayload = {
      school_name: body.school_name,
      school_address: body.school_address,
      registration_number: body.registration_number,
      school_email: body.school_email,
      school_size: schoolSize,
      contact_person_name: body.contact_person_name,
      contact_person_email: body.contact_person_email,
      contact_person_phone: body.contact_person_phone || null,
      existing_system: body.existing_system || null,
      has_mpesa_account: body.has_mpesa_account || false,
      fee_schedules: Array.isArray(body.fee_schedules) ? body.fee_schedules : [],
      school_levels: Array.isArray(body.school_levels) ? body.school_levels : [],
      grade_levels: Array.isArray(body.grade_levels) ? body.grade_levels : [],
      additional_info: body.additional_info || null,
      status: "pending",
    };
    
    console.log("=== INSERT PAYLOAD ===");
    console.log(JSON.stringify(insertPayload, null, 2));

    const { data, error } = await adminClient
      .from("school_registration_requests")
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.error("=== DATABASE ERROR ===");
      console.error("Error message:", error.message);
      console.error("Error details:", error);
      const errorResponse = NextResponse.json({ success: false, error: error.message }, { status: 500 });
      errorResponse.headers.set('Access-Control-Allow-Origin', '*');
      errorResponse.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
      errorResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      return errorResponse;
    }
    
    console.log("=== SUCCESS ===");
    console.log("Created record with ID:", data.id);

    const response = NextResponse.json({ success: true, data: { id: data.id, message: "Registration request submitted successfully" } });
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return response;
  } catch (error) {
    console.error("Error processing registration request:", error);
    const errorResponse = NextResponse.json({ success: false, error: "An unexpected error occurred" }, { status: 500 });
    errorResponse.headers.set('Access-Control-Allow-Origin', '*');
    errorResponse.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    errorResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return errorResponse;
  }
}

