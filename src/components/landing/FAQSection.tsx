"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How do I register my school on HarakaPay?",
    answer:
      "To register your school, click on 'Register Your School' and fill out the contact form. Our team will reach out within 24 hours to help you set up your account and configure your fee structure.",
  },
  {
    question: "What payment methods are supported?",
    answer:
      "HarakaPay supports multiple payment methods including bank transfers, mobile money (MTN, Airtel, Orange Money), and credit/debit cards. The specific methods available depend on your region.",
  },
  {
    question: "How secure is the payment data?",
    answer:
      "We use bank-level encryption and are PCI DSS compliant. All payment data is encrypted in transit and at rest. We never store full card details, ensuring maximum security for your transactions.",
  },
  {
    question: "Can parents track their payment history?",
    answer:
      "Yes! Parents can access a dedicated mobile app where they can view their complete payment history, upcoming fees, download receipts, and set up automated payment reminders.",
  },
  {
    question: "What types of reports can I generate?",
    answer:
      "You can generate comprehensive reports including fee collection summaries, outstanding balances, payment trends, student payment history, and financial analytics to help with decision-making.",
  },
  {
    question: "Is there a mobile app for administrators?",
    answer:
      "Yes, HarakaPay offers a mobile app for both administrators and parents. Administrators can approve payments, send notifications, and access real-time reports on the go.",
  },
  {
    question: "How much does HarakaPay cost?",
    answer:
      "HarakaPay offers flexible pricing plans based on your school size and requirements. Contact our sales team at admin@harakapay.com for a custom quote tailored to your needs.",
  },
  {
    question: "Can I integrate with my existing school management system?",
    answer:
      "HarakaPay offers API integrations with popular school management systems. Contact our technical support team to discuss integration options for your specific system.",
  },
];

export function FAQSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need to know about HarakaPay
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border-gray-200 px-4"
              >
                <AccordionTrigger className="text-left font-semibold text-gray-900 hover:text-blue-600">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 leading-relaxed pt-2">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}


