import { createServerClient } from "./supabaseClient";
import { redirect } from "next/navigation";
import type { User, UserProfile } from "@/types/user";

export async function getUser(): Promise<User | null> {
  const supabase = createServerClient();

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email || "",
      name: user.user_metadata?.full_name || user.user_metadata?.name,
      created_at: user.created_at,
      updated_at: user.updated_at || user.created_at,
    };
  } catch (error) {
    console.error("Error getting user:", error);
    return null;
  }
}

export async function getUserProfile(
  userId: string
): Promise<UserProfile | null> {
  const supabase = createServerClient();

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error || !data) {
      return null;
    }

    return data as UserProfile;
  } catch (error) {
    console.error("Error getting user profile:", error);
    return null;
  }
}

export async function requireAuth() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireRole(
  requiredRole: "admin" | "school_staff" | ("admin" | "school_staff")[]
) {
  const user = await requireAuth();
  const profile = await getUserProfile(user.id);

  if (!profile) {
    redirect("/login");
  }

  const allowedRoles = Array.isArray(requiredRole)
    ? requiredRole
    : [requiredRole];

  if (!allowedRoles.includes(profile.role)) {
    redirect("/unauthorized");
  }

  return { user, profile };
}

export async function signOut() {
  const supabase = createServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
