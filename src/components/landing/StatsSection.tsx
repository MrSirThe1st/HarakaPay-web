import { ArrowTrendingUpIcon, UsersIcon, BuildingOfficeIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "@/hooks/useTranslation";

export function StatsSection() {
  const { t } = useTranslation();

  const stats = [
    {
      icon: BuildingOfficeIcon,
      value: "500+",
      label: "Schools Served",
      description: "Trusted by institutions nationwide",
    },
    {
      icon: UsersIcon,
      value: "50,000+",
      label: "Students Enrolled",
      description: "Active student database",
    },
    {
      icon: ArrowTrendingUpIcon,
      value: "98%",
      label: "Collection Rate",
      description: "Improved fee collection efficiency",
    },
    {
      icon: CurrencyDollarIcon,
      value: "$10M+",
      label: "Transactions Processed",
      description: "Secure payment processing",
    },
  ];

  return (
    <section className="py-16 bg-white border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="text-center group hover:scale-105 transition-transform duration-300"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 mb-4 group-hover:from-blue-100 group-hover:to-indigo-100 transition-colors">
                  <Icon className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </div>
                <div className="text-sm md:text-base font-medium text-gray-700 mb-1">
                  {t(stat.label)}
                </div>
                <div className="text-xs md:text-sm text-gray-500">
                  {t(stat.description)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}


