import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Careers | HarakaPay',
  description: 'Join the HarakaPay team and help revolutionize school fee management across Africa.',
};

export default function CareersPage() {
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

        <h1 className="text-4xl font-bold text-gray-900 mb-6">Careers at HarakaPay</h1>

        <div className="prose prose-blue max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Join Our Team</h2>
            <p className="text-gray-700 mb-4">
              At HarakaPay, we're building the future of school fee management in Africa.
              We're looking for passionate, talented individuals who want to make a real
              difference in education across the continent.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Why Work With Us</h2>
            <div className="grid gap-6 mb-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-xl font-medium text-gray-900 mb-2">Impact-Driven Work</h3>
                <p className="text-gray-700">
                  Your work directly impacts thousands of schools, students, and families
                  across Africa.
                </p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-xl font-medium text-gray-900 mb-2">Growth Opportunities</h3>
                <p className="text-gray-700">
                  We invest in our team's development with training, mentorship, and
                  career advancement opportunities.
                </p>
              </div>
              <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="text-xl font-medium text-gray-900 mb-2">Innovative Environment</h3>
                <p className="text-gray-700">
                  Work with cutting-edge technologies and contribute to innovative
                  solutions for real-world problems.
                </p>
              </div>
              <div className="bg-orange-50 p-6 rounded-lg">
                <h3 className="text-xl font-medium text-gray-900 mb-2">Collaborative Culture</h3>
                <p className="text-gray-700">
                  Join a supportive team that values collaboration, creativity, and
                  continuous learning.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Current Openings</h2>
            <p className="text-gray-700 mb-4">
              We're always looking for talented individuals to join our team.
              Current opportunities include:
            </p>
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <h3 className="text-xl font-medium text-gray-900 mb-2">Software Engineers</h3>
                <p className="text-gray-600 mb-3">Full-time • Remote/Hybrid</p>
                <p className="text-gray-700">
                  Build and maintain our core platform using modern technologies like
                  Next.js, TypeScript, and Supabase.
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <h3 className="text-xl font-medium text-gray-900 mb-2">Product Designers</h3>
                <p className="text-gray-600 mb-3">Full-time • Remote/Hybrid</p>
                <p className="text-gray-700">
                  Design intuitive, user-friendly interfaces that make fee management
                  simple for schools and parents.
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <h3 className="text-xl font-medium text-gray-900 mb-2">Customer Success Managers</h3>
                <p className="text-gray-600 mb-3">Full-time • On-site</p>
                <p className="text-gray-700">
                  Help schools maximize value from HarakaPay through training,
                  support, and strategic guidance.
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <h3 className="text-xl font-medium text-gray-900 mb-2">Sales Representatives</h3>
                <p className="text-gray-600 mb-3">Full-time • On-site/Hybrid</p>
                <p className="text-gray-700">
                  Drive growth by connecting with schools and demonstrating how
                  HarakaPay can transform their operations.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">How to Apply</h2>
            <p className="text-gray-700 mb-4">
              Interested in joining our team? We'd love to hear from you!
            </p>
            <div className="bg-blue-50 p-6 rounded-lg">
              <p className="text-gray-700 mb-4">
                Send your resume and cover letter to:
              </p>
              <p className="text-lg font-medium mb-2">
                <a
                  href="mailto:careers@harakapayment.com"
                  className="text-blue-600 hover:text-blue-700"
                >
                  admin@harakapayment.com
                </a>
              </p>
              <p className="text-sm text-gray-600">
                Please include the position you're applying for in the subject line.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Questions?</h2>
            <p className="text-gray-700">
              For general inquiries, contact us at{' '}
              <a
                href="mailto:info@harakapayment.com"
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
