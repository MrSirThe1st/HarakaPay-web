"use client";

import { useState, useEffect } from "react";
import { useDualAuth } from "@/hooks/shared/hooks/useDualAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/hooks/useTranslation";
import { createClient } from "@/lib/supabaseClient";
import { setRememberMePreference, getRememberMePreference } from "@/lib/sessionStorage";
import type { UserRole } from "@/lib/roleUtils";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { signIn } = useDualAuth();
  const router = useRouter();
  const { t } = useTranslation();

  // Load "Remember Me" preference on mount
  useEffect(() => {
    setRememberMe(getRememberMePreference());
  }, []);

  const getRedirectPath = (role: UserRole): string => {
    // Check for admin roles (platform-level admins)
    if (role === "super_admin" || role === "platform_admin" || role === "support_admin") {
      return "/admin/dashboard";
    }
    
    // Check for school roles
    if (role === "school_admin" || role === "school_staff") {
      return "/school/dashboard";
    }
    
    // Default fallback (shouldn't happen with valid users)
    return "/";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Save "Remember Me" preference before signing in
      setRememberMePreference(rememberMe);

      const result = await signIn(email, password, rememberMe);

      if (!result.success) {
        setError(result.error || t("Invalid credentials"));
        setIsLoading(false);
        return;
      }

      // Fetch user profile to determine redirect
      const supabase = createClient();
      // SECURITY: Use getUser() to validate with server
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        setError(t("Failed to get user session"));
        setIsLoading(false);
        return;
      }

      // Fetch profile from API
      const response = await fetch('/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });

      if (!response.ok) {
        setError(t("Failed to load user profile"));
        setIsLoading(false);
        return;
      }

      const { profile } = await response.json();

      if (!profile || !profile.role) {
        setError(t("User profile not found"));
        setIsLoading(false);
        return;
      }

      // Redirect based on role
      const redirectPath = getRedirectPath(profile.role);
      router.push(redirectPath);
      
    } catch (err) {
      console.error("Login error:", err);
      setError(t("An error occurred"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
        <p className="text-lg text-gray-600">Sign in to your account</p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-900">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium text-gray-900">
                Password
              </Label>
              <Link
                href="/reset"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
              disabled={isLoading}
            />
          </div>
          
          {/* Remember Me checkbox */}
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={isLoading}
            />
            <Label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
              {t("Remember me")}
            </Label>
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3">
            <p className="text-sm text-red-800 text-center">{error}</p>
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing in...
            </span>
          ) : (
            t("Sign In")
          )}
        </Button>

        <div className="text-center pt-2">
          <p className="text-sm text-gray-600">
            {t("Don't have an account?")}{' '}
            <Link
              href="/register"
              className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              Register your school
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
