export type PredefinedAdmin = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
};
// Client-side admin validation (uses API route for security)

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "school_staff";
  school_id?: string;
  isPredefined?: boolean;
  
}

// Check if email/password matches predefined admin via API
export async function validatePredefinedAdmin(
  email: string,
  password: string
): Promise<AuthUser | null> {
  try {
    const response = await fetch("/api/auth/validate-admin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.admin || null;
  } catch (error) {
    console.error("Error validating predefined admin:", error);
    return null;
  }
}
