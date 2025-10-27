import { Mail, Phone, MapPin } from "lucide-react";

const contactInfo = [
  {
    icon: Mail,
    title: "Email Us",
    detail: "admin@harakapay.com",
    description: "We'll respond within 24 hours",
  },
  {
    icon: Phone,
    title: "Call Us",
    detail: "+243 XXX XXX XXX",
    description: "Mon - Fri, 9am - 5pm",
  },
  {
    icon: MapPin,
    title: "Visit Us",
    detail: "Kinshasa, DR Congo",
    description: "Come say hello at our office",
  },
];

export function ContactSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Get In Touch
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Have questions or ready to get started? We're here to help.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
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
                    {contact.title}
                  </h3>
                  <p className="text-blue-600 font-medium mb-1">
                    {contact.detail}
                  </p>
                  <p className="text-sm text-gray-600">
                    {contact.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-lg">
            <div className="max-w-2xl mx-auto text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Ready to get started?
              </h3>
              <p className="text-gray-600 mb-6">
                Join hundreds of schools already using HarakaPay to streamline
                their fee management.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/register"
                  className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Register Your School
                </a>
                <a
                  href="/login"
                  className="inline-flex items-center justify-center px-8 py-3 bg-white border-2 border-gray-300 text-gray-900 font-semibold rounded-lg hover:border-blue-600 hover:text-blue-600 transition-all duration-300"
                >
                  Login
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

