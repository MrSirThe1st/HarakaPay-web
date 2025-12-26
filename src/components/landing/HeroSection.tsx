import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, AcademicCapIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "@/hooks/useTranslation";

export function HeroSection() {
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20 md:py-32">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex items-center justify-center min-h-[500px] md:min-h-[600px]">
          {/* Center Content */}
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-8">
              <AcademicCapIcon className="w-4 h-4" />
              {t("Trusted by Schools Nationwide")}
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              {t("School Fee Payments")}
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {t("Made Simple")}
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto">
              {t("The easiest way for parents to pay school fees. Fast, secure, and hassle-free mobile payments for schools across Africa.")}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild size="lg" className="text-base px-8 py-6 h-auto">
                <Link href="/login">
                  {t("Get Started")}
                  <ArrowRightIcon className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-base px-8 py-6 h-auto">
                <Link href="/register">
                  {t("Register Your School")}
                </Link>
              </Button>
            </div>
            
            {/* <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-500">
              <div>
                <div className="text-2xl font-bold text-gray-900">500+</div>
                <div>Schools</div>
              </div>
              <div className="w-px h-12 bg-gray-300"></div>
              <div>
                <div className="text-2xl font-bold text-gray-900">50K+</div>
                <div>Students</div>
              </div>
              <div className="w-px h-12 bg-gray-300"></div>
              <div>
                <div className="text-2xl font-bold text-gray-900">$10M+</div>
                <div>Processed</div>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </section>
  );
}


