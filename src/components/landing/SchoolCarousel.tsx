"use client";

const schoolLogos = [
  { name: "Academy School", color: "bg-blue-500" },
  { name: "Bright Future", color: "bg-indigo-500" },
  { name: "Innovation High", color: "bg-purple-500" },
  { name: "Green Valley", color: "bg-green-500" },
  { name: "Royal Academy", color: "bg-red-500" },
  { name: "Pacific School", color: "bg-cyan-500" },
  { name: "Metro Educational", color: "bg-orange-500" },
  { name: "Unity School", color: "bg-pink-500" },
  { name: "Excellence College", color: "bg-yellow-500" },
  { name: "Noble Academy", color: "bg-teal-500" },
];

export function SchoolCarousel() {
  return (
    <section className="py-12 bg-gray-50 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Trusted by Leading Schools
          </h2>
          <p className="text-gray-600">
            Join hundreds of institutions managing their fees with HarakaPay
          </p>
        </div>
        
        <div className="relative">
          <div className="flex gap-8 animate-scroll whitespace-nowrap hover-pause">
            {/* First set */}
            {schoolLogos.map((school, index) => (
              <div
                key={`first-${index}`}
                className="inline-flex items-center justify-center w-48 h-24 flex-shrink-0"
              >
                <div
                  className={`${school.color} w-full h-full rounded-lg flex items-center justify-center text-white font-semibold text-sm px-4 shadow-md`}
                >
                  {school.name}
                </div>
              </div>
            ))}
            {/* Duplicate set for seamless loop */}
            {schoolLogos.map((school, index) => (
              <div
                key={`second-${index}`}
                className="inline-flex items-center justify-center w-48 h-24 flex-shrink-0"
              >
                <div
                  className={`${school.color} w-full h-full rounded-lg flex items-center justify-center text-white font-semibold text-sm px-4 shadow-md`}
                >
                  {school.name}
                </div>
              </div>
            ))}
          </div>
          
          {/* Gradient overlays for fade effect */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-gray-50 to-transparent pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none"></div>
        </div>
      </div>
      
    </section>
  );
}

