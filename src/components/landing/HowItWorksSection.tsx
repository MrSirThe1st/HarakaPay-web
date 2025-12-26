import { ArrowRightIcon, UserPlusIcon, CreditCardIcon, DevicePhoneMobileIcon, ChartBarIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "@/hooks/useTranslation";

const steps = [
  {
    number: "01",
    icon: UserPlusIcon,
    title: "Register Your School",
    description:
      "Quick sign-up process. Add your school info and you're ready to start accepting payments.",
  },
  {
    number: "02",
    icon: CreditCardIcon,
    title: "Configure Payment Plans",
    description:
      "Set up fee structures and flexible payment schedules. One-time or installments - you choose.",
  },
  {
    number: "03",
    icon: DevicePhoneMobileIcon,
    title: "Parents Pay",
    description:
      "Parents receive payment links and pay instantly via mobile money, cards, or bank transfer.",
  },
  {
    number: "04",
    icon: ChartBarIcon,
    title: "Track Everything",
    description:
      "See all payments in real-time. Know exactly who paid, who's pending, all from one dashboard.",
  },
];

export function HowItWorksSection() {
  const { t } = useTranslation();

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t("Start Accepting Payments in Minutes")}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t("From setup to first payment in 4 simple steps")}
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="relative">
                  {/* Connector line for desktop */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-blue-200 via-blue-300 to-transparent -translate-x-1/2">
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2">
                        <ArrowRightIcon className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  )}
                  
                  <div className="relative bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 h-full">
                    <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {step.number}
                    </div>
                    
                    <div className="mt-8 mb-6">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50">
                        <Icon className="w-8 h-8 text-blue-600" />
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {t(step.title)}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {t(step.description)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}


