"use client";

import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { CONGOLESE_GRADES } from "@/lib/congoleseGrades";

export default function RegisterPage() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    schoolName: "",
    schoolAddress: "",
    registrationNumber: "",
    schoolEmail: "",
    schoolSize: "",
    contactPersonName: "",
    contactPersonEmail: "",
    contactPersonPhone: "",
    existingSystem: "",
    hasMpesaAccount: false,
    monthly: false,
    monthlyDetails: "",
    termly: false,
    termlyDetails: "",
    annually: false,
    annuallyDetails: "",
    oneTime: false,
    oneTimeDetails: "",
    installments: false,
    installmentsDetails: "",
    schoolLevels: [] as string[],
    gradeLevels: [] as string[],
    additionalInfo: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableLevels = ["Maternelle", "Primaire", "Éducation de Base", "Humanités", "Université"];
  
  const updateSchoolLevels = (level: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      schoolLevels: checked
        ? [...prev.schoolLevels, level]
        : prev.schoolLevels.filter((l) => l !== level),
      gradeLevels: checked
        ? [
            ...prev.gradeLevels,
            ...CONGOLESE_GRADES.filter((g) => g.level === level).map((g) => g.value),
          ]
        : prev.gradeLevels.filter(
            (g) => !CONGOLESE_GRADES.find((gl) => gl.value === g && gl.level === level)
          ),
    }));
  };

  const toggleGradeLevel = (gradeValue: string) => {
    setFormData((prev) => ({
      ...prev,
      gradeLevels: prev.gradeLevels.includes(gradeValue)
        ? prev.gradeLevels.filter((g) => g !== gradeValue)
        : [...prev.gradeLevels, gradeValue],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Build fee_schedules as ARRAY of selected schedules
      const feeSchedules: string[] = [];
      if (formData.monthly && formData.monthlyDetails) {
        feeSchedules.push(`Monthly: ${formData.monthlyDetails}`);
      } else if (formData.monthly) {
        feeSchedules.push("Monthly");
      }
      if (formData.termly && formData.termlyDetails) {
        feeSchedules.push(`Termly: ${formData.termlyDetails}`);
      } else if (formData.termly) {
        feeSchedules.push("Termly");
      }
      if (formData.annually && formData.annuallyDetails) {
        feeSchedules.push(`Annually: ${formData.annuallyDetails}`);
      } else if (formData.annually) {
        feeSchedules.push("Annually");
      }
      if (formData.oneTime && formData.oneTimeDetails) {
        feeSchedules.push(`One-time: ${formData.oneTimeDetails}`);
      } else if (formData.oneTime) {
        feeSchedules.push("One-time");
      }
      if (formData.installments && formData.installmentsDetails) {
        feeSchedules.push(`Installments: ${formData.installmentsDetails}`);
      } else if (formData.installments) {
        feeSchedules.push("Installments");
      }

      const submissionData = {
        school_name: formData.schoolName,
        school_address: formData.schoolAddress,
        registration_number: formData.registrationNumber,
        school_email: formData.schoolEmail,
        school_size: formData.schoolSize,
        contact_person_name: formData.contactPersonName,
        contact_person_email: formData.contactPersonEmail,
        contact_person_phone: formData.contactPersonPhone || null,
        existing_system: formData.existingSystem || null,
        has_mpesa_account: formData.hasMpesaAccount,
        fee_schedules: feeSchedules,
        school_levels: formData.schoolLevels,
        grade_levels: formData.gradeLevels,
        additional_info: formData.additionalInfo || null,
      };

      const response = await fetch("/api/school-registration-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || t("Failed to submit registration request"));
      }

      setSubmitSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("An unexpected error occurred"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-8 bg-white rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{t("Registration Request Submitted!")}</h2>
        <p className="text-gray-600 mb-6">{t("Thank you for your interest in HarakaPay. We will contact you shortly.")}</p>
        <a href="/login" className="inline-block px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">{t("Go to Login")}</a>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 p-8 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold mb-2 text-center">{t("Register Your School")}</h2>
      {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">{t("School Name")} *</label>
          <input type="text" value={formData.schoolName} onChange={(e) => setFormData({...formData, schoolName: e.target.value})} className="w-full px-4 py-2 border rounded-lg" required />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">{t("School Address")} *</label>
          <input type="text" value={formData.schoolAddress} onChange={(e) => setFormData({...formData, schoolAddress: e.target.value})} className="w-full px-4 py-2 border rounded-lg" required />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">{t("Registration Number")} *</label>
          <input type="text" value={formData.registrationNumber} onChange={(e) => setFormData({...formData, registrationNumber: e.target.value})} className="w-full px-4 py-2 border rounded-lg" required />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">{t("School Email")} *</label>
          <input type="email" value={formData.schoolEmail} onChange={(e) => setFormData({...formData, schoolEmail: e.target.value})} className="w-full px-4 py-2 border rounded-lg" required />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">{t("School Size (Number of Students)")} *</label>
          <input type="number" min="1" value={formData.schoolSize} onChange={(e) => setFormData({...formData, schoolSize: e.target.value})} className="w-full px-4 py-2 border rounded-lg" required />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">{t("Contact Person Name")} *</label>
          <input type="text" value={formData.contactPersonName} onChange={(e) => setFormData({...formData, contactPersonName: e.target.value})} className="w-full px-4 py-2 border rounded-lg" required />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">{t("Contact Person Email")} *</label>
          <input type="email" value={formData.contactPersonEmail} onChange={(e) => setFormData({...formData, contactPersonEmail: e.target.value})} className="w-full px-4 py-2 border rounded-lg" required />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">{t("Contact Person Phone")}</label>
          <input type="tel" value={formData.contactPersonPhone} onChange={(e) => setFormData({...formData, contactPersonPhone: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">{t("Existing System")}</label>
          <input type="text" value={formData.existingSystem} onChange={(e) => setFormData({...formData, existingSystem: e.target.value})} placeholder="e.g., Excel, Manual" className="w-full px-4 py-2 border rounded-lg" />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-3">{t("M-Pesa Account?")}</label>
          <div className="flex gap-6">
            <label><input type="radio" checked={formData.hasMpesaAccount} onChange={() => setFormData({...formData, hasMpesaAccount: true})} /> {t("Yes")}</label>
            <label><input type="radio" checked={!formData.hasMpesaAccount} onChange={() => setFormData({...formData, hasMpesaAccount: false})} /> {t("No")}</label>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-4">{t("Fee Schedules")} *</h3>
          {["monthly", "termly", "annually", "oneTime", "installments"].map((type) => (
            <div key={type} className="mb-4">
              <label className="flex items-center mb-2">
                <input type="checkbox" checked={formData[type as keyof typeof formData] as boolean} onChange={(e) => setFormData({...formData, [type]: e.target.checked})} className="mr-2" />
                <span className="capitalize">{type}</span>
              </label>
              {formData[type as keyof typeof formData] && (
                <input type="text" value={formData[`${type}Details` as keyof typeof formData] as string} onChange={(e) => setFormData({...formData, [`${type}Details`]: e.target.value})} placeholder={`${type} details`} className="w-full px-4 py-2 border rounded-lg" />
              )}
            </div>
          ))}
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-4">{t("School Levels")} *</h3>
          <div className="grid grid-cols-2 gap-4">
            {availableLevels.map((level) => (
              <label key={level} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.schoolLevels.includes(level)}
                  onChange={(e) => updateSchoolLevels(level, e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">{level}</span>
              </label>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-4">{t("Grade Levels Offered")} *</h3>
          <div className="max-h-64 overflow-y-auto border border-gray-300 rounded-lg p-4 grid grid-cols-2 gap-2">
            {CONGOLESE_GRADES.map((grade) => (
              <label key={grade.value} className="flex items-center cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={formData.gradeLevels.includes(grade.value)}
                  onChange={() => toggleGradeLevel(grade.value)}
                  className="mr-2"
                />
                <span className="text-gray-700">{grade.label}</span>
              </label>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">{t("Additional Information")}</label>
          <textarea value={formData.additionalInfo} onChange={(e) => setFormData({...formData, additionalInfo: e.target.value})} rows={4} className="w-full px-4 py-2 border rounded-lg" />
        </div>
        
        <button type="submit" disabled={isSubmitting} className="w-full py-3 px-6 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {isSubmitting ? t("Submitting...") : t("Submit")}
        </button>
      </form>
    </div>
  );
}

