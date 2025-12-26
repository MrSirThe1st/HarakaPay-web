import { EnvelopeIcon, PhoneIcon, MapPinIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "@/hooks/useTranslation";
import Link from "next/link";

const contactInfo = [
  {
    icon: EnvelopeIcon,
    title: "Email Us",
    detail: "info@harakapayment.com",
    description: "We'll respond within 24 hours",
  },
  {
    icon: PhoneIcon,
    title: "Call Us",
    detail: "+243990111103",
    description: "Mon - Fri, 9am - 5pm",
  },
];

export function ContactSection() {
  const { t } = useTranslation();

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t("Get In Touch")}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t("Have questions or ready to get started? We're here to help.")}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {contactInfo.map((contact, index) => {
              const Icon = contact.icon;
              return (
                <div
                  key={index}
                  className="bg-white p-8 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 group text-center"
                >
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 mb-4 group-hover:scale-110 transition-transform mx-auto">
                    <Icon className="w-7 h-7 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {t(contact.title)}
                  </h3>
                  <p className="text-blue-600 font-medium mb-1">
                    {t(contact.detail)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {t(contact.description)}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-lg">
            <div className="max-w-2xl mx-auto text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {t("Ready to Simplify Fee Payments?")}
              </h3>
              <p className="text-gray-600 mb-6">
                  {t("Join schools across Africa using HarakaPay for fast, easy, and secure fee payments.")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                    {t("Register Your School")}
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-8 py-3 bg-white border-2 border-gray-300 text-gray-900 font-semibold rounded-lg hover:border-blue-600 hover:text-blue-600 transition-all duration-300"
                >
                    {t("Login")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

