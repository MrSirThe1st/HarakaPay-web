import dynamic from 'next/dynamic';
import { LandingNav } from '@/components/landing/LandingNav';
import { HeroSection } from '@/components/landing/HeroSection';

// Code splitting: Lazy load below-the-fold components for better performance
const FeaturesSection = dynamic(() => import('@/components/landing/FeaturesSection').then(mod => ({ default: mod.FeaturesSection })), {
  loading: () => <div className="min-h-screen animate-pulse bg-gray-50" />
});

const HowItWorksSection = dynamic(() => import('@/components/landing/HowItWorksSection').then(mod => ({ default: mod.HowItWorksSection })), {
  loading: () => <div className="min-h-[400px] animate-pulse bg-gray-50" />
});

const ContactSection = dynamic(() => import('@/components/landing/ContactSection').then(mod => ({ default: mod.ContactSection })), {
  loading: () => <div className="min-h-[400px] animate-pulse bg-gray-50" />
});

const FAQSection = dynamic(() => import('@/components/landing/FAQSection').then(mod => ({ default: mod.FAQSection })), {
  loading: () => <div className="min-h-[400px] animate-pulse bg-gray-50" />
});

const LandingFooter = dynamic(() => import('@/components/landing/LandingFooter').then(mod => ({ default: mod.LandingFooter })), {
  loading: () => <div className="h-64 animate-pulse bg-gray-900" />
});

export default function RootPage() {
  return (
    <div className="min-h-screen">
      <LandingNav />
      <main>
        <HeroSection />
        {/* <StatsSection /> */}
        {/* <SchoolCarousel /> */}
        <FeaturesSection />
        <HowItWorksSection />
        <ContactSection />
        <FAQSection />
      </main>
      <LandingFooter />
    </div>
  );
}
