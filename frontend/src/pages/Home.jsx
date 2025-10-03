import { useEffect, useRef } from 'react';

export default function Home() {
  const heroTitleRef = useRef(null);
  const heroSubtitleRef = useRef(null);
  const ctaButtonRef = useRef(null);
  const featureCardsRef = useRef([]);
  const carRef = useRef(null);

  useEffect(() => {
    // Simple animations using CSS transitions
    const animateElements = () => {
      if (heroTitleRef.current) {
        heroTitleRef.current.style.opacity = '1';
        heroTitleRef.current.style.transform = 'translateY(0)';
      }
      
      setTimeout(() => {
        if (heroSubtitleRef.current) {
          heroSubtitleRef.current.style.opacity = '1';
          heroSubtitleRef.current.style.transform = 'translateY(0)';
        }
      }, 200);

      setTimeout(() => {
        if (ctaButtonRef.current) {
          ctaButtonRef.current.style.opacity = '1';
          ctaButtonRef.current.style.transform = 'scale(1)';
        }
      }, 400);

      featureCardsRef.current.forEach((card, index) => {
        setTimeout(() => {
          if (card) {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }
        }, 600 + index * 150);
      });

      setTimeout(() => {
        if (carRef.current) {
          carRef.current.style.opacity = '1';
          carRef.current.style.transform = 'translateX(0)';
        }
      }, 1200);
    };

    animateElements();
  }, []);

  return (
    <div className="bg-white min-h-screen overflow-hidden relative">
      {/* Floating animated shapes */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-64 h-64 bg-blue-100 rounded-full opacity-20 blur-3xl animate-pulse" style={{ top: '10%', left: '10%' }}></div>
        <div className="absolute w-96 h-96 bg-purple-100 rounded-full opacity-20 blur-3xl animate-pulse" style={{ top: '60%', right: '10%', animationDelay: '1s' }}></div>
        <div className="absolute w-80 h-80 bg-pink-100 rounded-full opacity-20 blur-3xl animate-pulse" style={{ bottom: '10%', left: '50%', animationDelay: '2s' }}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="container mx-auto px-6 py-20">
          <div className="flex flex-col items-center text-center">
            <div className="mb-8 inline-flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              <span className="text-sm text-blue-600 font-medium">Find parking in seconds</span>
            </div>

            <h1 
              ref={heroTitleRef}
              className="text-6xl md:text-7xl font-bold mb-6 leading-tight opacity-0 transition-all duration-1000"
              style={{ transform: 'translateY(50px)' }}
            >
              <span className="text-gray-900">Never Worry About</span><br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Parking Again</span>
            </h1>

            <p 
              ref={heroSubtitleRef}
              className="text-xl text-gray-600 mb-12 max-w-2xl opacity-0 transition-all duration-1000"
              style={{ transform: 'translateY(30px)' }}
            >
              Discover available parking spots near you in real-time. Smart, fast, and hassle-free parking solutions at your fingertips.
            </p>

            {/* CTA Button */}
            <a 
              href="/parking"
              ref={ctaButtonRef}
              className="group relative inline-flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 opacity-0"
              style={{ transform: 'scale(0.8)' }}
            >
              <span>Find Parking Now</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
              </svg>
            </a>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 w-full max-w-5xl">
              <div 
                ref={el => featureCardsRef.current[0] = el}
                className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 opacity-0"
                style={{ transform: 'translateY(60px)' }}
              >
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Real-Time Updates</h3>
                <p className="text-gray-600">Get instant notifications about available parking spots near your destination</p>
              </div>

              <div 
                ref={el => featureCardsRef.current[1] = el}
                className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 opacity-0"
                style={{ transform: 'translateY(60px)' }}
              >
                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Smart Navigation</h3>
                <p className="text-gray-600">Navigate directly to your chosen parking spot with turn-by-turn directions</p>
              </div>

              <div 
                ref={el => featureCardsRef.current[2] = el}
                className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 opacity-0"
                style={{ transform: 'translateY(60px)' }}
              >
                <div className="w-14 h-14 bg-pink-100 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Best Prices</h3>
                <p className="text-gray-600">Compare parking rates and find the best deals in your area instantly</p>
              </div>
            </div>

            {/* Animated Car */}
            <div 
              ref={carRef}
              className="mt-20 opacity-0 transition-all duration-1500 animate-bounce"
              style={{ transform: 'translateX(-100px)' }}
            >
              <svg className="w-32 h-32" viewBox="0 0 100 100" fill="none">
                <path d="M20 60 L30 40 L70 40 L80 60 Z" fill="#3B82F6" opacity="0.8"/>
                <rect x="15" y="60" width="70" height="15" rx="5" fill="#2563EB"/>
                <circle cx="30" cy="75" r="8" fill="#1F2937"/>
                <circle cx="30" cy="75" r="4" fill="#6B7280"/>
                <circle cx="70" cy="75" r="8" fill="#1F2937"/>
                <circle cx="70" cy="75" r="4" fill="#6B7280"/>
                <rect x="35" y="45" width="12" height="10" rx="2" fill="#93C5FD" opacity="0.6"/>
                <rect x="53" y="45" width="12" height="10" rx="2" fill="#93C5FD" opacity="0.6"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}