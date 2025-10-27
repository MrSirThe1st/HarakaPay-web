import { LandingNav } from '@/components/landing/LandingNav';
import { HeroSection } from '@/components/landing/HeroSection';
import { StatsSection } from '@/components/landing/StatsSection';
import { SchoolCarousel } from '@/components/landing/SchoolCarousel';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { ContactSection } from '@/components/landing/ContactSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { LandingFooter } from '@/components/landing/LandingFooter';

export default function RootPage() {
  return (
    <div className="min-h-screen">
      <LandingNav />
      <main>
        <HeroSection />
        <StatsSection />
        <SchoolCarousel />
        <FeaturesSection />
        <HowItWorksSection />
        <ContactSection />
        <FAQSection />
      </main>
      <LandingFooter />
    </div>
  );
}
