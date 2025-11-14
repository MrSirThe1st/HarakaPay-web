import {
  ShieldCheckIcon,
  ReceiptPercentIcon,
  DevicePhoneMobileIcon,
  ChartBarIcon,
  ClockIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

const features = [
  {
    icon: ReceiptPercentIcon,
    title: "Instant Receipts",
    description:
      "Generate and send automated receipts immediately after payment processing.",
  },
  {
    icon: DevicePhoneMobileIcon,
    title: "Parent Portal",
    description:
      "Easy-to-use mobile app for parents to track payments and receive notifications.",
  },
  {
    icon: ChartBarIcon,
    title: "Financial Reports",
    description:
      "Real-time analytics and comprehensive reports for better financial oversight.",
  },
  {
    icon: ClockIcon,
    title: "Automated Reminders",
    description:
      "Never miss a payment with intelligent automated reminders sent to parents.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Secure & Compliant",
    description:
      "Bank-level encryption and PCI DSS compliance for maximum security.",
  },
  {
    icon: UsersIcon,
    title: "Multi-User Support",
    description:
      "Assign roles and permissions for staff members with audit trail tracking.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Manage School Fees
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Powerful features designed to streamline your fee management process
            and enhance parent communication.
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
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}


