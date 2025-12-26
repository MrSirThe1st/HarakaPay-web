import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy | HarakaPay',
  description: 'Learn how HarakaPay collects, uses, and protects your personal information.',
};

export default function PrivacyPage() {
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

        <h1 className="text-4xl font-bold text-gray-900 mb-6">Privacy Policy</h1>

        <div className="prose prose-blue max-w-none">
          <p className="text-gray-600 mb-6">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-700 mb-4">
              HarakaPay is committed to protecting your privacy. This Privacy Policy explains
              how we collect, use, disclose, and safeguard your information when you use our
              school fee management platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
            <h3 className="text-xl font-medium text-gray-900 mb-3">Personal Information</h3>
            <p className="text-gray-700 mb-4">
              We collect information that you provide directly to us, including:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Name, email address, and phone number</li>
              <li>School information and student details</li>
              <li>Payment information (processed securely by third-party providers)</li>
              <li>Communication preferences</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-900 mb-3">Automatically Collected Information</h3>
            <p className="text-gray-700 mb-4">
              When you use HarakaPay, we automatically collect:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Device information and IP address</li>
              <li>Browser type and operating system</li>
              <li>Usage data and analytics</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-700 mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Provide and maintain our services</li>
              <li>Process payments and transactions</li>
              <li>Send important notifications and updates</li>
              <li>Improve and optimize our platform</li>
              <li>Provide customer support</li>
              <li>Comply with legal obligations</li>
              <li>Prevent fraud and enhance security</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Information Sharing</h2>
            <p className="text-gray-700 mb-4">
              We do not sell your personal information. We may share your information with:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Schools you are associated with (for parents and students)</li>
              <li>Payment processors (for transaction processing)</li>
              <li>Service providers who help us operate the platform</li>
              <li>Law enforcement when required by law</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Security</h2>
            <p className="text-gray-700 mb-4">
              We implement industry-standard security measures to protect your information:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Encryption of data in transit and at rest</li>
              <li>Secure authentication and access controls</li>
              <li>Regular security audits and updates</li>
              <li>Staff training on data protection</li>
            </ul>
            <p className="text-gray-700 mb-4">
              However, no method of transmission over the internet is 100% secure.
              We cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Cookies and Tracking</h2>
            <p className="text-gray-700 mb-4">
              We use essential cookies to enable core functionality of our platform.
              For more information, see our{' '}
              <Link href="/cookie-policy" className="text-blue-600 hover:text-blue-700">
                Cookie Policy
              </Link>
              .
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Your Rights</h2>
            <p className="text-gray-700 mb-4">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to processing of your data</li>
              <li>Withdraw consent at any time</li>
              <li>Export your data in a portable format</li>
            </ul>
            <p className="text-gray-700 mb-4">
              To exercise these rights, contact us at{' '}
              <a
                href="mailto:support@harakapayment.com"
                className="text-blue-600 hover:text-blue-700"
              >
                support@harakapayment.com
              </a>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Children's Privacy</h2>
            <p className="text-gray-700 mb-4">
              Our platform is designed for use by schools and parents. Student information
              is collected and managed by schools. We require parental consent for students
              under 18 years of age.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Data Retention</h2>
            <p className="text-gray-700 mb-4">
              We retain your information for as long as necessary to provide our services
              and comply with legal obligations. Schools may have their own data retention
              policies for student records.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. International Data Transfers</h2>
            <p className="text-gray-700 mb-4">
              Your information may be transferred to and processed in countries other than
              your country of residence. We ensure appropriate safeguards are in place for
              such transfers.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to Privacy Policy</h2>
            <p className="text-gray-700 mb-4">
              We may update this Privacy Policy from time to time. We will notify you of
              significant changes via email or platform notification.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Us</h2>
            <p className="text-gray-700 mb-4">
              If you have questions about this Privacy Policy or our data practices:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">

              <p className="text-gray-700 mb-2">
                <strong>General Inquiries:</strong>{' '}
                <a
                  href="mailto:support@harakapayment.com"
                  className="text-blue-600 hover:text-blue-700"
                >
                  support@harakapayment.com
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
