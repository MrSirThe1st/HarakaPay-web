export interface User {
  id: string;
  email: string;
  name?: string;
  role?: "admin" | "school_staff";
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  first_name?: string;
  last_name?: string;
  role: "admin" | "school_staff";
  school_id?: string; // School staff will be associated with a specific school
  phone?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}
