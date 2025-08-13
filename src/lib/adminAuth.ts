// Admin and School Authentication Service
import { createServerClient } from "./supabaseServerOnly";

// Predefined admin accounts
const PREDEFINED_ADMINS = [
  {
    email: process.env.ADMIN_EMAIL_1!,
    password: process.env.ADMIN_PASSWORD_1!,
    name: "HarakaPay Admin",
    role: "admin" as const,
  },
  {
    email: process.env.ADMIN_EMAIL_2!,
    password: process.env.ADMIN_PASSWORD_2!,
    name: "Marci Admin",
    role: "admin" as const,
  },
];

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "school_staff";
  school_id?: string;
  isPredefined?: boolean;
}

// Check if email/password matches predefined admin
export function validatePredefinedAdmin(
  email: string,
  password: string
): AuthUser | null {
  const admin = PREDEFINED_ADMINS.find(
    (a) => a.email === email && a.password === password
  );

  if (admin) {
    return {
      id: `predefined_${admin.email}`,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      isPredefined: true,
    };
  }

  return null;
}

// Admin creates a new school account
export async function createSchoolAccount(schoolData: {
  schoolName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  adminEmail: string; // The email the school will use to login
  adminPassword: string; // The password the school will use to login
}) {
  const supabase = createServerClient();

  try {
    // 1. Create the school record first
    const { data: school, error: schoolError } = await supabase
      .from("schools")
      .insert({
        name: schoolData.schoolName,
        contact_email: schoolData.contactEmail,
        contact_phone: schoolData.contactPhone,
        address: schoolData.address,
        status: "approved", // Admin-created schools are auto-approved
      })
      .select()
      .single();

    if (schoolError) throw schoolError;

    // 2. Create Supabase auth user for the school
    const { data: authUser, error: authError } =
      await supabase.auth.admin.createUser({
        email: schoolData.adminEmail,
        password: schoolData.adminPassword,
        email_confirm: true,
        user_metadata: {
          school_id: school.id,
          school_name: schoolData.schoolName,
          role: "school_staff",
        },
      });

    if (authError) throw authError;

    // 3. Create profile for the school user
    const { error: profileError } = await supabase.from("profiles").insert({
      user_id: authUser.user.id,
      first_name: schoolData.schoolName,
      last_name: "Admin",
      role: "school_staff",
      school_id: school.id,
      phone: schoolData.contactPhone,
    });

    if (profileError) throw profileError;

    return {
      success: true,
      school,
      credentials: {
        email: schoolData.adminEmail,
        password: schoolData.adminPassword,
      },
    };
  } catch (error) {
    console.error("Error creating school account:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create school account",
    };
  }
}

// Admin creates another admin account
export async function createAdminAccount(adminData: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}) {
  const supabase = createServerClient();

  try {
    // Create Supabase auth user for the new admin
    const { data: authUser, error: authError } =
      await supabase.auth.admin.createUser({
        email: adminData.email,
        password: adminData.password,
        email_confirm: true,
        user_metadata: {
          role: "admin",
          full_name: `${adminData.firstName} ${adminData.lastName}`,
        },
      });

    if (authError) throw authError;

    // Create profile for the admin user
    const { error: profileError } = await supabase.from("profiles").insert({
      user_id: authUser.user.id,
      first_name: adminData.firstName,
      last_name: adminData.lastName,
      role: "admin",
    });

    if (profileError) throw profileError;

    return {
      success: true,
      admin: authUser.user,
      credentials: {
        email: adminData.email,
        password: adminData.password,
      },
    };
  } catch (error) {
    console.error("Error creating admin account:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create admin account",
    };
  }
}

// Get all schools (admin only)
export async function getAllSchools() {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("schools")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching schools:", error);
    return { success: false, error: error.message };
  }

  return { success: true, schools: data };
}

// Get all admin users (admin only)
export async function getAllAdmins() {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "admin")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching admins:", error);
    return { success: false, error: error.message };
  }

  return { success: true, admins: data };
}
