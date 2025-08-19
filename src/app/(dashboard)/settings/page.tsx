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
    <div className="enterprise-container">
      {/* Page Header */}
      <header className="page-header">
        <div className="page-header-content">
          <div className="page-header-main">
            <h1 className="page-title">{t('settings.title')}</h1>
            <p className="page-subtitle">{t('settings.subtitle')}</p>
          </div>
        </div>
      </header>

      <section className="enterprise-section">
        <div className="enterprise-grid">
          {/* Language Settings */}
          <div className="enterprise-card">
            <div className="feature-card-icon feature-card-icon-info mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"/>
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-4 color-text-main">{t('settings.language')}</h2>
            <p className="color-text-secondary mb-4">{t('settings.languageDescription')}</p>
            
            <div className="mb-4">
              <label className="form-label">
                {t('settings.currentLanguage')}
              </label>
              <div className="flex gap-2">
                {availableLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code as 'en' | 'fr')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
                      currentLanguage === lang.code
                        ? 'border-primary bg-primary-light text-primary'
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
              className="btn btn-primary"
            >
              {t('settings.savePreferences')}
            </button>
            
            {preferencesSaved && (
              <div className="success-message mt-3">
                {t('settings.preferencesSaved')}
              </div>
            )}
          </div>

          <div className="enterprise-card">
            <div className="feature-card-icon feature-card-icon-primary mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-4 color-text-main">{t('settings.userManagement')}</h2>
            <p className="color-text-secondary">{t('settings.userManagementDescription')}</p>
          </div>

          <div className="enterprise-card">
            <div className="feature-card-icon feature-card-icon-warning mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 00-1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 001.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-4 color-text-main">{t('settings.systemSettings')}</h2>
            <p className="color-text-secondary">{t('settings.systemSettingsDescription')}</p>
          </div>

          <div className="enterprise-card">
            <div className="feature-card-icon feature-card-icon-success mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-4 color-text-main">{t('settings.account')}</h2>
            <p className="color-text-secondary mb-4">{t('settings.loggedInAs')}: {user?.email}</p>
            <button
              onClick={handleSignOut}
              className="btn btn-secondary bg-red-600 hover:bg-red-700 text-white border-red-600"
            >
              {t('auth.signOut')}
            </button>
          </div>
        </div>
      </section>
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
