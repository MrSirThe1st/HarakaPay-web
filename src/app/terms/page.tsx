import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service | HarakaPay',
  description: 'Read the HarakaPay terms of service and user agreement.',
};

export default function TermsPage() {
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

        <h1 className="text-4xl font-bold text-gray-900 mb-6">Terms of Service</h1>

        <div className="prose prose-blue max-w-none">
          <p className="text-gray-600 mb-6">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 mb-4">
              By accessing and using HarakaPay, you accept and agree to be bound by these
              Terms of Service. If you do not agree to these terms, please do not use our platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
            <p className="text-gray-700 mb-4">
              HarakaPay provides a comprehensive school fee management platform that enables:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Fee collection and payment processing</li>
              <li>Student and parent account management</li>
              <li>Payment tracking and reporting</li>
              <li>Communication between schools and parents</li>
              <li>Financial reporting and analytics</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
            <p className="text-gray-700 mb-4">
              To use HarakaPay, you must:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Be responsible for all activities under your account</li>
              <li>Not share your account with others</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Payment Terms</h2>
            <p className="text-gray-700 mb-4">
              For schools using HarakaPay:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Transaction fees apply as per agreed pricing</li>
              <li>Payments are processed through secure third-party providers</li>
              <li>Schools are responsible for setting their fee structures</li>
              <li>Refund policies are determined by individual schools</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. User Responsibilities</h2>
            <p className="text-gray-700 mb-4">
              Users agree to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Use the platform only for lawful purposes</li>
              <li>Not attempt to compromise platform security</li>
              <li>Not upload malicious code or content</li>
              <li>Respect intellectual property rights</li>
              <li>Comply with all applicable laws and regulations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Intellectual Property</h2>
            <p className="text-gray-700 mb-4">
              All content, features, and functionality on HarakaPay are owned by
              HarakaPay and protected by international copyright, trademark, and other
              intellectual property laws.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Data Privacy</h2>
            <p className="text-gray-700 mb-4">
              Your use of HarakaPay is also governed by our{' '}
              <Link href="/privacy" className="text-blue-600 hover:text-blue-700">
                Privacy Policy
              </Link>
              . We are committed to protecting your personal information and using it
              responsibly.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Service Availability</h2>
            <p className="text-gray-700 mb-4">
              While we strive for maximum uptime, we do not guarantee uninterrupted
              access to our platform. We reserve the right to modify or discontinue
              services with reasonable notice.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Limitation of Liability</h2>
            <p className="text-gray-700 mb-4">
              HarakaPay shall not be liable for any indirect, incidental, special,
              consequential, or punitive damages resulting from your use of or inability
              to use the platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Termination</h2>
            <p className="text-gray-700 mb-4">
              We reserve the right to suspend or terminate accounts that violate these
              terms or engage in fraudulent activity.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to Terms</h2>
            <p className="text-gray-700 mb-4">
              We may update these Terms of Service from time to time. Continued use of
              the platform after changes constitutes acceptance of updated terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Governing Law</h2>
            <p className="text-gray-700 mb-4">
              These terms are governed by the laws of the Democratic Republic of Congo.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Contact</h2>
            <p className="text-gray-700 mb-4">
              For questions about these Terms of Service, contact us at:
            </p>
            <p className="text-gray-700">
              <a
                href="mailto:legal@harakapayment.com"
                className="text-blue-600 hover:text-blue-700"
              >
                support@harakapayment.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
