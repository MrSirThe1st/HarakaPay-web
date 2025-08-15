import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabaseServerOnly";

export async function POST(request: NextRequest) {
  try {
    const schoolData = await request.json();
    const supabase = createServerClient();

    // Generate random credentials
    const generateRandomPassword = () => {
      const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
      let password = "";
      for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return password;
    };

    const email = `${schoolData.name
      .toLowerCase()
      .replace(/\s+/g, ".")}@${schoolData.name
      .toLowerCase()
      .replace(/\s+/g, "")}.school`;
    const password = generateRandomPassword();

    // Create the school user account in Supabase
      const { data: authData, error: authError } =
        await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            first_name: schoolData.contactFirstName,
            last_name: schoolData.contactLastName,
            role: "school_staff",
          },
        });

    if (authError) {
      console.error("Auth error:", authError);
      return NextResponse.json(
        {
          success: false,
          error: `Failed to create user account: ${authError.message}`,
        },
        { status: 400 }
      );
    }

    // Create the school record
    const { data: school, error: schoolError } = await supabase
      .from("schools")
      .insert({
        name: schoolData.name,
        address: schoolData.address,
        contact_email: email,
        contact_phone: schoolData.contactPhone,
        registration_number: schoolData.registrationNumber,
        status: "approved",
      })
      .select()
      .single();

    if (schoolError) {
      console.error("School creation error:", schoolError);
      // Clean up the auth user if school creation failed
      await supabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        {
          success: false,
          error: `Failed to create school record: ${schoolError.message}`,
        },
        { status: 400 }
      );
    }

    // Update the user profile with school_id
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        school_id: school.id,
        first_name: schoolData.contactFirstName,
        last_name: schoolData.contactLastName,
      })
      .eq("user_id", authData.user.id);

    if (profileError) {
      console.error("Profile update error:", profileError);
      return NextResponse.json(
        {
          success: false,
          error: `Failed to update profile: ${profileError.message}`,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      school,
      credentials: {
        email,
        password,
      },
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
