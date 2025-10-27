import { ArrowRight, UserPlus, CreditCard, FileText, CheckCircle } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Register Your School",
    description:
      "Sign up and complete your school profile with basic information and fee structure.",
  },
  {
    number: "02",
    icon: CreditCard,
    title: "Configure Payment Plans",
    description:
      "Set up flexible payment schedules, categories, and assign to student groups.",
  },
  {
    number: "03",
    icon: FileText,
    title: "Send Notifications",
    description:
      "Automatically notify parents about fees due via SMS, email, or in-app notifications.",
  },
  {
    number: "04",
    icon: CheckCircle,
    title: "Track & Analyze",
    description:
      "Monitor payments in real-time and generate comprehensive financial reports.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get started in minutes with our streamlined setup process
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
                        <ArrowRight className="w-6 h-6 text-blue-600" />
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
                      {step.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {step.description}
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


