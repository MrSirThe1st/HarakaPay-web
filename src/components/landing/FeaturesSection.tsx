import {
  ShieldCheckIcon,
  ReceiptPercentIcon,
  DevicePhoneMobileIcon,
  ChartBarIcon,
  ClockIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "@/hooks/useTranslation";

const features = [
  {
    icon: DevicePhoneMobileIcon,
    title: "Mobile Payments",
    description:
      "Parents pay instantly via mobile money, cards, or bank transfers right from their phones.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Secure & Fast",
    description:
      "Bank-level security with instant payment confirmation. Funds reach schools safely.",
  },
  {
    icon: ReceiptPercentIcon,
    title: "Instant Receipts",
    description:
      "Parents receive digital receipts immediately after payment. No more paper trails.",
  },
  {
    icon: ClockIcon,
    title: "Flexible Payment Plans",
    description:
      "Let parents pay in installments or full amount. Configure payment schedules easily.",
  },
  {
    icon: ChartBarIcon,
    title: "Real-Time Tracking",
    description:
      "Schools see payments instantly. Track who paid, who's pending, all in one dashboard.",
  },
  {
    icon: UsersIcon,
    title: "Parent Notifications",
    description:
      "Automated SMS and email reminders. Parents never miss payment deadlines.",
  },
];

export function FeaturesSection() {
  const { t } = useTranslation();

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t("Why Parents Love Paying With HarakaPay")}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t("Simple, secure mobile payments that make school fees stress-free for parents and schools.")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {t(feature.title)}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {t(feature.description)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}


