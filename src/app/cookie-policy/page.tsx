import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Cookie Policy | HarakaPay',
  description: 'Learn about how HarakaPay uses cookies to provide essential functionality.',
};

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="mb-8">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            ← Back to Home
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-6">Cookie Policy</h1>

        <div className="prose prose-blue max-w-none">
          <p className="text-gray-600 mb-6">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">What Are Cookies</h2>
            <p className="text-gray-700 mb-4">
              Cookies are small text files stored on your device when you visit our website.
              They help us provide you with a better experience by remembering your preferences
              and settings.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Use Cookies</h2>
            <p className="text-gray-700 mb-4">
              HarakaPay uses essential cookies that are necessary for the platform to function properly.
              These cookies enable core functionality such as:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Authentication and security</li>
              <li>Session management</li>
              <li>User preferences and settings</li>
              <li>Platform performance and stability</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Types of Cookies We Use</h2>

            <div className="mb-6">
              <h3 className="text-xl font-medium text-gray-900 mb-2">Essential Cookies</h3>
              <p className="text-gray-700">
                These cookies are strictly necessary for the operation of our platform.
                They include cookies that enable you to log into secure areas and use essential features.
                Without these cookies, services you have requested cannot be provided.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Managing Cookies</h2>
            <p className="text-gray-700 mb-4">
              Most web browsers allow you to control cookies through their settings. However,
              please note that disabling essential cookies may impact the functionality of the
              HarakaPay platform and prevent you from using certain features.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-700">
              If you have questions about our use of cookies, please contact us at{' '}
              <a href="mailto:support@harakapay.com" className="text-blue-600 hover:text-blue-700">
                support@harakapay.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}