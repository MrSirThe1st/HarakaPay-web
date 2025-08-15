import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const adminData = await request.json();
    // Use service role key for admin actions
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Generate random password if not provided
    const generateRandomPassword = () => {
      const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
      let password = "";
      for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return password;
    };

    const password = adminData.password || generateRandomPassword();

    // Create the admin user account in Supabase
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: adminData.email,
        password,
        email_confirm: true,
        user_metadata: {
          first_name: adminData.firstName,
          last_name: adminData.lastName,
          role: "admin",
        },
      });

    if (authError) {
      console.error("Auth error:", authError);
      return NextResponse.json(
        {
          success: false,
          error: `Failed to create admin account: ${authError.message}`,
        },
        { status: 400 }
      );
    }

  // Profile will be created by the trigger; no manual update needed

    return NextResponse.json({
      success: true,
      admin: {
        id: authData.user.id,
        email: adminData.email,
        firstName: adminData.firstName,
        lastName: adminData.lastName,
        role: "admin",
      },
      credentials: {
        email: adminData.email,
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
