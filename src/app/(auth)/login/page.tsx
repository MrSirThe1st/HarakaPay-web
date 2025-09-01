"use client";

import { useState } from "react";
import { useDualAuth } from "@/hooks/shared/hooks/useDualAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { signIn } = useDualAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn(email, password);

      if (!result.success) {
        setError(result.error || "Invalid credentials");
      } else {
        router.push("/");
      }
    } catch {
      setError("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>

      <div className="text-center">
        <h2 className="page-title text-center text-3xl font-bold mb-2">
          Sign In
        </h2>
        <p className="page-subtitle text-center text-base text-gray-600 mb-4">
          Welcome back! Please log in to your account.
        </p>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="form-input"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="form-input"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div className="error-message text-center">{error}</div>
        )}

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary w-full"
          >
            {isLoading ? "Loading..." : "Sign In"}
          </button>
        </div>

        <div className="text-center mt-4">
          <p className="text-sm color-text-secondary">
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="font-medium text-primary hover:text-primary-dark transition-colors"
            >
              Register your school
            </Link>
          </p>
        </div>
      </form>

      <div className="enterprise-card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <h3 className="text-sm font-medium text-blue-800 mb-2">
          Demo Credentials:
        </h3>
        <div className="text-xs text-blue-700 space-y-1">
          <p>
            <strong>Admin:</strong> admin@harakapay.com / HarakaPay2025!Admin
          </p>
          <p>
            <strong>Marci Admin:</strong> marci@harakapay.com /
            HarakaPay2025!Marci
          </p>
        </div>
      </div>
    </>
  );
}
