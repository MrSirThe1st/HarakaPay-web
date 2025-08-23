"use client";

import { useClientTranslations } from "@/hooks/useClientTranslations";
import { LanguageSelector } from "@/components/LanguageSelector";

export default function RegisterPage() {
  const { t } = useClientTranslations();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Language Selector */}
        <div className="absolute top-4 right-4">
          <LanguageSelector />
        </div>

        <div className="text-center">
          <h2 className="page-title text-center text-3xl font-bold mb-2">
            Register School
          </h2>
          <p className="page-subtitle text-center text-base text-gray-600 mb-4">
            Contact admin to register your school on HarakaPay.
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="enterprise-card">
            <h3 className="text-lg font-medium color-text-main mb-4">
              School Registration
            </h3>
            <p className="color-text-secondary mb-4">
              To register your school on HarakaPay, please contact the platform administrator.
            </p>
            <div className="enterprise-card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <h4 className="text-sm font-medium text-blue-800 mb-2">
                Contact Information:
              </h4>
              <p className="text-sm text-blue-700">
                <strong>Email:</strong> admin@harakapay.com<br />
                <strong>Phone:</strong> +243 XXX XXX XXX
              </p>
            </div>
          </div>

          <div className="text-center mt-4">
            <a
              href="/login"
              className="btn btn-secondary"
            >
              Already have an account? Sign In
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
