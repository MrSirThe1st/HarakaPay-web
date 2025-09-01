import { NextRequest, NextResponse } from "next/server";

// Predefined admin accounts (server-side only)
const PREDEFINED_ADMINS = [
  {
    email: process.env.ADMIN_EMAIL_1!,
    password: process.env.ADMIN_PASSWORD_1!,
    name: "HarakaPay Admin",
    role: "super_admin" as const,
  },
  {
    email: process.env.ADMIN_EMAIL_2!,
    password: process.env.ADMIN_PASSWORD_2!,
    name: "Marci Admin",
    role: "super_admin" as const,
  },
];

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Find matching admin
    const admin = PREDEFINED_ADMINS.find(
      (admin) => admin.email === email && admin.password === password
    );

    if (admin) {
      return NextResponse.json({
        success: true,
        admin: {
          id: `predefined-${admin.email}`,
          email: admin.email,
          name: admin.name,
          role: admin.role,
          isPredefined: true,
        },
      });
    }

    return NextResponse.json({ success: false, admin: null });
  } catch (error) {
    console.error("Error validating admin:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
