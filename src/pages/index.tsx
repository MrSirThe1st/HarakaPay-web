import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h1 className="text-4xl font-bold mb-4">Welcome to HarakaPay</h1>
      <p className="mb-6 text-lg text-gray-700">Your school payment and management platform</p>
      <div className="mb-6">
        <LanguageSwitcher variant="default" />
      </div>
      <div className="flex gap-4">
        <Link href="/login" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">Login</Link>
        <Link href="/register" className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition">Register</Link>
      </div>
    </main>
  );
}
