import Link from "next/link";
import { AcademicCapIcon, EnvelopeIcon, PhoneIcon, MapPinIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "@/hooks/useTranslation";

export function LandingFooter() {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <AcademicCapIcon className="w-8 h-8 text-blue-500" />
              <span className="text-xl font-bold">HarakaPay</span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              {t("Streamlining school fee management for institutions nationwide.")}
            </p>
            <div className="flex gap-3">
              {/* Social media placeholders */}
              <div className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors flex items-center justify-center cursor-pointer">
                <span className="text-xs">FB</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors flex items-center justify-center cursor-pointer">
                <span className="text-xs">TW</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors flex items-center justify-center cursor-pointer">
                <span className="text-xs">LI</span>
              </div>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold mb-4">{t("Product")}</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link
                  href="/#features"
                  className="hover:text-white transition-colors"
                >
                  {t("Features")}
                </Link>
              </li>
              <li>
                <Link
                  href="/#how-it-works"
                  className="hover:text-white transition-colors"
                >
                  {t("How It Works")}
                </Link>
              </li>
              <li>
                <Link
                  href="/#pricing"
                  className="hover:text-white transition-colors"
                >
                  {t("Pricing")}
                </Link>
              </li>
              <li>
                <Link
                  href="/#faq"
                  className="hover:text-white transition-colors"
                >
                  {t("FAQ")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">{t("Company")}</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  {t("About Us")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  {t("Contact")}
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-white transition-colors">
                  {t("Careers")}
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-white transition-colors">
                  {t("Blog")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">{t("Support")}</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a
                  href="mailto:admin@harakapay.com"
                  className="hover:text-white transition-colors flex items-center gap-2"
                >
                  <EnvelopeIcon className="w-4 h-4" />
                  admin@harakapay.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+243XXX"
                  className="hover:text-white transition-colors flex items-center gap-2"
                >
                  <PhoneIcon className="w-4 h-4" />
                  +243 XXX XXX XXX
                </a>
              </li>
              <li>
                <span className="flex items-center gap-2">
                  <MapPinIcon className="w-4 h-4" />
                  {t("DRC, Africa")}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              {t("© 2025 HarakaPay. All rights reserved.")}
            </p>
            <div className="flex gap-6 text-sm text-gray-400">
              <Link href="/privacy" className="hover:text-white transition-colors">
                {t("Privacy Policy")}
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                {t("Terms of Service")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}


