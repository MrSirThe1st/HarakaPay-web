"use client";

import { useClientTranslations } from "@/hooks/useClientTranslations";
import { LanguageSelector } from "@/components/LanguageSelector";

export default function RegisterPage() {
  const { t } = useClientTranslations();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Language Selector */}
        <div className="absolute top-4 right-4">
          <LanguageSelector />
        </div>

        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t('auth.welcome')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Contact admin to register your school
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              School Registration
            </h3>
            <p className="text-gray-600 mb-4">
              To register your school on HarakaPay, please contact the platform administrator.
            </p>
            <div className="bg-blue-50 p-4 rounded-md">
              <h4 className="text-sm font-medium text-blue-800 mb-2">
                Contact Information:
              </h4>
              <p className="text-sm text-blue-700">
                <strong>Email:</strong> admin@harakapay.com<br />
                <strong>Phone:</strong> +243 XXX XXX XXX
              </p>
            </div>
          </div>

          <div className="text-center">
            <a
              href="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Back to Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
