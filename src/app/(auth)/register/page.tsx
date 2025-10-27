"use client";

import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { CONGOLESE_GRADES } from "@/lib/congoleseGrades";

interface FormData {
  schoolName: string;
  schoolAddress: string;
  registrationNumber: string;
  schoolEmail: string;
  schoolSize: string;
  contactPersonName: string;
  contactPersonEmail: string;
  contactPersonPhone: string;
  existingSystem: string;
  hasMpesaAccount: boolean;
  feeSchedules: {
    monthly: boolean;
    monthlyDetails: string;
    termly: boolean;
    termlyDetails: string;
    annually: boolean;
    annuallyDetails: string;
    oneTime: boolean;
    oneTimeDetails: string;
    installments: boolean;
    installmentsDetails: string;
  };
  schoolLevels: string[];
  gradeLevels: string[];
  additionalInfo: string;
}

export default function RegisterPage() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<FormData>({
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
    feeSchedules: {
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
    },
    schoolLevels: [],
    gradeLevels: [],
    additionalInfo: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const availableLevels = ["Maternelle", "Primaire", "Éducation de Base", "Humanités", "Université"];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // School name validation
    if (!formData.schoolName.trim()) {
      newErrors.schoolName = t("School name is required");
    }
    
    // School address validation
    if (!formData.schoolAddress.trim()) {
      newErrors.schoolAddress = t("School address is required");
    }
    
    // Registration number validation
    if (!formData.registrationNumber.trim()) {
      newErrors.registrationNumber = t("Registration number is required");
    }
    
    // School email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.schoolEmail.trim()) {
      newErrors.schoolEmail = t("School email is required");
    } else if (!emailRegex.test(formData.schoolEmail)) {
      newErrors.schoolEmail = t("Please enter a valid email address");
    }
    
    // School size validation
    if (!formData.schoolSize.trim()) {
      newErrors.schoolSize = t("School size is required");
    } else if (isNaN(parseInt(formData.schoolSize)) || parseInt(formData.schoolSize) <= 0) {
      newErrors.schoolSize = t("Please enter a valid number of students");
    }
    
    // Contact person name validation
    if (!formData.contactPersonName.trim()) {
      newErrors.contactPersonName = t("Contact person name is required");
    }
    
    // Contact person email validation
    if (!formData.contactPersonEmail.trim()) {
      newErrors.contactPersonEmail = t("Contact person email is required");
    } else if (!emailRegex.test(formData.contactPersonEmail)) {
      newErrors.contactPersonEmail = t("Please enter a valid email address");
    }
    

    // Check at least one fee schedule is selected
    const hasFeeSchedule = Object.entries(formData.feeSchedules).some(
      ([key, value]) => !key.includes("Details") && value === true
    );
    if (!hasFeeSchedule) {
      newErrors.feeSchedules = t("Please select at least one fee schedule");
    }

    // Check at least one school level is selected
    if (formData.schoolLevels.length === 0) {
      newErrors.schoolLevels = t("Please select at least one school level");
    }

    // Check at least one grade is selected
    if (formData.gradeLevels.length === 0) {
      newErrors.gradeLevels = t("Please select at least one grade level");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Build fee schedules with details
      const feeSchedulesData: Record<string, string> = {};
      if (formData.feeSchedules.monthly) {
        feeSchedulesData["monthly"] = formData.feeSchedules.monthlyDetails || "";
      }
      if (formData.feeSchedules.termly) {
        feeSchedulesData["termly"] = formData.feeSchedules.termlyDetails || "";
      }
      if (formData.feeSchedules.annually) {
        feeSchedulesData["annually"] = formData.feeSchedules.annuallyDetails || "";
      }
      if (formData.feeSchedules.oneTime) {
        feeSchedulesData["oneTime"] = formData.feeSchedules.oneTimeDetails || "";
      }
      if (formData.feeSchedules.installments) {
        feeSchedulesData["installments"] = formData.feeSchedules.installmentsDetails || "";
      }

      const submissionData = {
        school_name: formData.schoolName,
        school_address: formData.schoolAddress,
        registration_number: formData.registrationNumber,
        school_email: formData.schoolEmail,
        school_size: parseInt(formData.schoolSize) || 0,
        contact_person_name: formData.contactPersonName,
        contact_person_email: formData.contactPersonEmail,
        contact_person_phone: formData.contactPersonPhone || null,
        existing_system: formData.existingSystem || null,
        has_mpesa_account: formData.hasMpesaAccount,
        fee_schedules: feeSchedulesData,
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
      // Reset form
      setFormData({
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
        feeSchedules: {
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
        },
        schoolLevels: [],
        gradeLevels: [],
        additionalInfo: "",
      });
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : t("An unexpected error occurred") });
    } finally {
      setIsSubmitting(false);
    }
  };

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

  if (submitSuccess) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t("Registration Request Submitted!")}</h2>
          <p className="text-gray-600 mb-6">
            {t("Thank you for your interest in HarakaPay. We've received your registration request and will contact you within 24-48 hours to get you started.")}
          </p>
          <div className="space-y-2 text-sm text-gray-500 mb-6">
            <p>{t("What happens next?")}</p>
            <ul className="list-disc list-inside space-y-1">
              <li>{t("Our team will review your information")}</li>
              <li>{t("We'll contact you to schedule a demo")}</li>
              <li>{t("You'll receive login credentials after approval")}</li>
            </ul>
          </div>
          <a
            href="/login"
            className="inline-block px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t("Go to Login")}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 p-8 bg-white rounded-lg shadow-md">
      <div className="text-center mb-8">
        <h2 className="page-title text-3xl font-bold mb-2">{t("Register Your School")}</h2>
        <p className="page-subtitle text-gray-600">
          {t("Complete the form below to request registration on HarakaPay. Our team will review your application and get back to you shortly.")}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* School Information Section */}
        <section className="space-y-4 border-b pb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">{t("School Information")}</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("School Name")} *</label>
            <input
              type="text"
              value={formData.schoolName}
              onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            {errors.schoolName && <p className="text-red-600 text-sm mt-1">{errors.schoolName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("School Address")} *</label>
            <input
              type="text"
              value={formData.schoolAddress}
              onChange={(e) => setFormData({ ...formData, schoolAddress: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            {errors.schoolAddress && <p className="text-red-600 text-sm mt-1">{errors.schoolAddress}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("Registration Number")} *</label>
            <input
              type="text"
              value={formData.registrationNumber}
              onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            {errors.registrationNumber && <p className="text-red-600 text-sm mt-1">{errors.registrationNumber}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("School Email")} *</label>
            <input
              type="email"
              value={formData.schoolEmail}
              onChange={(e) => setFormData({ ...formData, schoolEmail: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            {errors.schoolEmail && <p className="text-red-600 text-sm mt-1">{errors.schoolEmail}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("Approximate Number of Students")} *</label>
            <input
              type="number"
              min="1"
              value={formData.schoolSize}
              onChange={(e) => setFormData({ ...formData, schoolSize: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            {errors.schoolSize && <p className="text-red-600 text-sm mt-1">{errors.schoolSize}</p>}
          </div>
        </section>

        {/* Contact Person Section */}
        <section className="space-y-4 border-b pb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">{t("Primary Contact / Future Admin")}</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("Full Name")} *</label>
            <input
              type="text"
              value={formData.contactPersonName}
              onChange={(e) => setFormData({ ...formData, contactPersonName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            {errors.contactPersonName && <p className="text-red-600 text-sm mt-1">{errors.contactPersonName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("Email Address")} *</label>
            <input
              type="email"
              value={formData.contactPersonEmail}
              onChange={(e) => setFormData({ ...formData, contactPersonEmail: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            {errors.contactPersonEmail && <p className="text-red-600 text-sm mt-1">{errors.contactPersonEmail}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("Phone Number")}</label>
            <input
              type="tel"
              value={formData.contactPersonPhone}
              onChange={(e) => setFormData({ ...formData, contactPersonPhone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </section>

        {/* Current Systems Section */}
        <section className="space-y-4 border-b pb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">{t("Current Systems")}</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("Existing Fee Management System")}</label>
            <input
              type="text"
              value={formData.existingSystem}
              onChange={(e) => setFormData({ ...formData, existingSystem: e.target.value })}
              placeholder={t("e.g., Excel, Manual records, Other system")}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">{t("Do you have an M-Pesa business account?")}</label>
            <div className="flex gap-6">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="hasMpesaAccount"
                  checked={formData.hasMpesaAccount === true}
                  onChange={() => setFormData({ ...formData, hasMpesaAccount: true })}
                  className="mr-2"
                />
                <span>{t("Yes")}</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="hasMpesaAccount"
                  checked={formData.hasMpesaAccount === false}
                  onChange={() => setFormData({ ...formData, hasMpesaAccount: false })}
                  className="mr-2"
                />
                <span>{t("No")}</span>
              </label>
            </div>
          </div>
        </section>

        {/* Fee Schedules Section */}
        <section className="space-y-4 border-b pb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">{t("Fee Schedule Preferences")} *</h3>
          {errors.feeSchedules && <p className="text-red-600 text-sm">{errors.feeSchedules}</p>}
          
          {[
            { key: "monthly", label: t("Monthly"), details: "monthlyDetails", placeholder: t("Specify monthly details") },
            { key: "termly", label: t("Termly"), details: "termlyDetails", placeholder: t("Specify termly details") },
            { key: "annually", label: t("Annually"), details: "annuallyDetails", placeholder: t("Specify annual details") },
            { key: "oneTime", label: t("One-time"), details: "oneTimeDetails", placeholder: t("Specify one-time details") },
            { key: "installments", label: t("Installments"), details: "installmentsDetails", placeholder: t("Specify installment details") },
          ].map((schedule) => (
            <div key={schedule.key}>
              <label className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={formData.feeSchedules[schedule.key as keyof typeof formData.feeSchedules] as boolean}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      feeSchedules: {
                        ...formData.feeSchedules,
                        [schedule.key]: e.target.checked,
                      },
                    })
                  }
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">{schedule.label}</span>
              </label>
              {(formData.feeSchedules[schedule.key as keyof typeof formData.feeSchedules] as boolean) && (
                <input
                  type="text"
                  value={formData.feeSchedules[schedule.details as keyof typeof formData.feeSchedules] as string}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      feeSchedules: {
                        ...formData.feeSchedules,
                        [schedule.details]: e.target.value,
                      },
                    })
                  }
                  placeholder={schedule.placeholder}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              )}
            </div>
          ))}
        </section>

        {/* School Levels Section */}
        <section className="space-y-4 border-b pb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">{t("School Levels")} *</h3>
          {errors.schoolLevels && <p className="text-red-600 text-sm">{errors.schoolLevels}</p>}
          
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
        </section>

        {/* Grade Levels Section */}
        <section className="space-y-4 border-b pb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">{t("Grade Levels Offered")} *</h3>
          {errors.gradeLevels && <p className="text-red-600 text-sm">{errors.gradeLevels}</p>}
          
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
        </section>

        {/* Additional Information Section */}
        <section className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">{t("Additional Information")}</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("Tell us anything else about your school")}
            </label>
            <textarea
              value={formData.additionalInfo}
              onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
              rows={5}
              placeholder={t("Optional: Add any additional information about your school, special requirements, or questions...")}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </section>

        {/* Submit Button */}
        <div className="pt-6">
          {errors.submit && <p className="text-red-600 text-sm mb-4">{errors.submit}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-6 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? t("Submitting...") : t("Submit Registration Request")}
          </button>
        </div>
      </form>
    </div>
  );
}
