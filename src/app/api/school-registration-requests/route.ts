import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabaseServerOnly";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      "school_name",
      "school_address",
      "registration_number",
      "school_email",
      "school_size",
      "contact_person_name",
      "contact_person_email",
      "fee_schedules",
      "school_levels",
      "grade_levels",
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `${field} is required` },
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

    // Validate fee_schedules has at least one entry with a value
    if (typeof body.fee_schedules !== "object") {
      return NextResponse.json(
        { success: false, error: "Fee schedules must be an object" },
        { status: 400 }
      );
    }
    
    // Check if at least one schedule is selected (has a truthy key)
    const hasAnySchedule = Object.entries(body.fee_schedules).some(([key, value]) => {
      // A schedule is selected if it's a boolean true
      if (key.includes('Details')) return false; // Details don't count as selection
      return value === true;
    });
    
    if (!hasAnySchedule) {
      return NextResponse.json(
        { success: false, error: "At least one fee schedule must be selected" },
        { status: 400 }
      );
    }

    // Validate school_levels is an array with at least one element
    if (!Array.isArray(body.school_levels) || body.school_levels.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one school level is required" },
        { status: 400 }
      );
    }

    // Validate grade_levels is an array with at least one element
    if (!Array.isArray(body.grade_levels) || body.grade_levels.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one grade level is required" },
        { status: 400 }
      );
    }

    // Use admin client to bypass RLS (since this is a public insert)
    const adminClient = createAdminClient();

    // Clean fee_schedules - remove keys with false values and empty detail values
    const cleanedFeeSchedules: Record<string, string> = {};
    for (const [key, value] of Object.entries(body.fee_schedules)) {
      if (key.includes('Details')) {
        // Only include detail fields if they have a non-empty value
        if (value && typeof value === 'string' && value.trim() !== '') {
          // Store the detail without the "Details" suffix in the key name
          const baseKey = key.replace('Details', '');
          cleanedFeeSchedules[baseKey] = value.trim();
        }
      }
    }
    
    // Ensure we have at least one schedule with a value (even if just empty string for the schedule type itself)
    if (Object.keys(cleanedFeeSchedules).length === 0) {
      // If no details were provided, just store an empty object indicating schedules were selected
      // Find which schedules were selected (boolean true)
      const selectedSchedules: string[] = [];
      for (const [key, value] of Object.entries(body.fee_schedules)) {
        if (!key.includes('Details') && value === true) {
          selectedSchedules.push(key);
        }
      }
      // Store as selected schedule names with empty strings
      selectedSchedules.forEach(schedule => {
        cleanedFeeSchedules[schedule] = '';
      });
    }
    
    // Insert the registration request
    const { data, error } = await adminClient
      .from("school_registration_requests")
      .insert({
        school_name: body.school_name,
        school_address: body.school_address,
        registration_number: body.registration_number,
        school_email: body.school_email,
        school_size: body.school_size,
        contact_person_name: body.contact_person_name,
        contact_person_email: body.contact_person_email,
        contact_person_phone: body.contact_person_phone || null,
        existing_system: body.existing_system || null,
        has_mpesa_account: body.has_mpesa_account || false,
        fee_schedules: cleanedFeeSchedules,
        school_levels: body.school_levels,
        grade_levels: body.grade_levels,
        additional_info: body.additional_info || null,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating registration request:", error);
      return NextResponse.json(
        { success: false, error: "Failed to submit registration request" },
        { status: 500 }
      );
    }

    // TODO: Send email notification (implement later)
    // For now, just log the success
    console.log("Registration request created:", data.id);

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        message: "Registration request submitted successfully",
      },
    });
  } catch (error) {
    console.error("Error processing registration request:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

