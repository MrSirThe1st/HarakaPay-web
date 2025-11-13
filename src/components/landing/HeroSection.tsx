import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, GraduationCap } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20 md:py-32">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      {/* Left Illustration - Absolutely positioned at bottom */}
      <div className="hidden lg:block absolute left-0 bottom-0 w-80 xl:w-96 2xl:w-[28rem] h-[600px] md:h-[700px] z-0">
        <div className="relative w-full h-full">
          <Image
            src="/student.png"
            alt="Student illustration"
            fill
            className="object-contain object-bottom"
            priority
          />
        </div>
      </div>

      {/* Right Illustration - Absolutely positioned at bottom */}
      <div className="hidden lg:block absolute right-0 bottom-0 w-[28rem] xl:w-[32rem] 2xl:w-[36rem] h-[750px] md:h-[850px] z-0">
        <div className="relative w-full h-full">
          <Image
            src="/parent.png"
            alt="Parent illustration"
            fill
            className="object-contain object-bottom"
            priority
          />
        </div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex items-center justify-center min-h-[500px] md:min-h-[600px]">
          {/* Center Content */}
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-8">
              <GraduationCap className="w-4 h-4" />
              Trusted by Schools Nationwide
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Streamline School Fee
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Management
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto">
              All-in-one platform for schools to manage payments, track fees, and connect with parents seamlessly.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild size="lg" className="text-base px-8 py-6 h-auto">
                <Link href="/login">
                  Get Started
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-base px-8 py-6 h-auto">
                <Link href="/register">
                  Register Your School
                </Link>
              </Button>
            </div>
            
            {/* <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-500">
              <div>
                <div className="text-2xl font-bold text-gray-900">500+</div>
                <div>Schools</div>
              </div>
              <div className="w-px h-12 bg-gray-300"></div>
              <div>
                <div className="text-2xl font-bold text-gray-900">50K+</div>
                <div>Students</div>
              </div>
              <div className="w-px h-12 bg-gray-300"></div>
              <div>
                <div className="text-2xl font-bold text-gray-900">$10M+</div>
                <div>Processed</div>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </section>
  );
}


