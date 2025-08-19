"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useDualAuth } from "@/hooks/useDualAuth";
import { useClientTranslations } from "@/hooks/useClientTranslations";
import { useLanguage } from "@/hooks/useLanguage";
import { useState } from "react";

function SettingsContent() {
  const { user, signOut } = useDualAuth();
  const { t } = useClientTranslations();
  const { currentLanguage, changeLanguage, availableLanguages } = useLanguage();
  const [preferencesSaved, setPreferencesSaved] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  const handleSavePreferences = () => {
    // Here you could save language preference to user profile
    setPreferencesSaved(true);
    setTimeout(() => setPreferencesSaved(false), 3000);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{t('settings.title')}</h1>
        <p className="text-gray-600">{t('settings.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Language Settings */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">{t('settings.language')}</h2>
          <p className="text-gray-600 mb-4">{t('settings.languageDescription')}</p>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('settings.currentLanguage')}
            </label>
            <div className="flex gap-2">
              {availableLanguages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code as 'en' | 'fr')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
                    currentLanguage === lang.code
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span className="font-medium">{lang.name}</span>
                </button>
              ))}
            </div>
          </div>
          
          <button
            onClick={handleSavePreferences}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            {t('settings.savePreferences')}
          </button>
          
          {preferencesSaved && (
            <div className="mt-3 text-sm text-green-600">
              {t('settings.preferencesSaved')}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">{t('settings.userManagement')}</h2>
          <p className="text-gray-600">{t('settings.userManagementDescription')}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">{t('settings.systemSettings')}</h2>
          <p className="text-gray-600">{t('settings.systemSettingsDescription')}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">{t('settings.account')}</h2>
          <p className="mb-4">{t('settings.loggedInAs')}: {user?.email}</p>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            {t('auth.signOut')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <SettingsContent />
    </ProtectedRoute>
  );
}
