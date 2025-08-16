import React, { useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/login");
    }, 2500); // 2.5 seconds delay
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-100 to-white">
      <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center w-full max-w-md">
        <Image src="/globe.svg" alt="HarakaPay Logo" width={80} height={80} className="mb-4" />
        <h1 className="text-4xl font-bold mb-2 text-indigo-900">Welcome to HarakaPay</h1>
        <p className="mb-6 text-lg text-gray-700 text-center">Your fast and secure school payment platform.</p>
        <div className="mb-6">
          <LanguageSwitcher variant="default" />
        </div>
        <div className="flex gap-4 mb-2">
          <Link href="/login" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">Login</Link>
          <Link href="/register" className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition">Register</Link>
        </div>
        <span className="text-indigo-500 font-medium">Redirecting to login...</span>
      </div>
    </main>
  );
}
