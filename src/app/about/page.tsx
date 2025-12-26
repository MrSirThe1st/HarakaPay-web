import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Us | HarakaPay',
  description: 'Learn about HarakaPay - streamlining school fee management for institutions across Africa.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="mb-8">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            ← Back to Home
          </Link>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-6">About HarakaPay</h1>

        <div className="prose prose-blue max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-700 mb-4">
              HarakaPay is dedicated to revolutionizing school fee management across Africa.
              We provide schools with a comprehensive platform to streamline payments,
              manage student records, and improve financial transparency.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">What We Do</h2>
            <p className="text-gray-700 mb-4">
              Our platform simplifies the entire payment process for schools, parents, and students:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Automated fee collection and tracking</li>
              <li>Real-time payment notifications</li>
              <li>Flexible payment plans and installments</li>
              <li>Comprehensive reporting and analytics</li>
              <li>Secure payment processing</li>
              <li>Parent-school communication tools</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Vision</h2>
            <p className="text-gray-700 mb-4">
              We envision a future where every school in Africa has access to modern,
              efficient payment management tools. By reducing administrative burden
              and improving financial transparency, we help schools focus on what matters
              most: educating the next generation.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Why Choose HarakaPay</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Built for Africa</h3>
                <p className="text-gray-700">
                  Our platform is designed specifically for African schools,
                  with support for local payment methods and currencies.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Easy to Use</h3>
                <p className="text-gray-700">
                  Intuitive interface that requires minimal training for staff,
                  parents, and administrators.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Secure & Reliable</h3>
                <p className="text-gray-700">
                  Bank-level security and reliable infrastructure ensure your
                  data and payments are always protected.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Dedicated Support</h3>
                <p className="text-gray-700">
                  Our team is always ready to help you get the most out of
                  the platform.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-700 mb-4">
              Have questions or want to learn more? Get in touch with us:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 mb-2">
                <strong>Email:</strong>{' '}
                <a href="mailto:support@harakapayment.com" className="text-blue-600 hover:text-blue-700">
                  info@harakapayment.com
                </a>
              </p>
              <p className="text-gray-700">
                <strong>Phone:</strong>{' '}
                <a href="tel:+243990111103" className="text-blue-600 hover:text-blue-700">
                  +243 990 111 103
                </a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
