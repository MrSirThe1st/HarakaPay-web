"use client";

import { useTranslation } from "@/hooks/useTranslation";

export default function RegisterPage() {
  const { t } = useTranslation();

  return (
    <>
      <div className="text-center">
        <h2 className="page-title text-center text-3xl font-bold mb-2">
          Enregistrer une école
        </h2>
        <p className="page-subtitle text-center text-base text-gray-600 mb-4">
          Contactez l'administrateur pour enregistrer votre école sur HarakaPay.
        </p>
      </div>

      <div className="mt-8 space-y-6">
        <div className="enterprise-card">
          <h3 className="text-lg font-medium color-text-main mb-4">
            Enregistrement d'école
          </h3>
          <p className="color-text-secondary mb-4">
            Pour enregistrer votre école sur HarakaPay, veuillez contacter l'administrateur de la plateforme.
          </p>
          <div className="enterprise-card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <h4 className="text-sm font-medium text-blue-800 mb-2">
              Informations de contact :
            </h4>
            <p className="text-sm text-blue-700">
              <strong>Email :</strong> admin@harakapay.com<br />
              <strong>Téléphone :</strong> +243 XXX XXX XXX
            </p>
          </div>
        </div>

        <div className="text-center mt-4">
          <a
            href="/login"
            className="btn btn-secondary"
          >
            {t("Already have an account?")} {t("Sign In")}
          </a>
        </div>
      </div>
    </>
  );
}
