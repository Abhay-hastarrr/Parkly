import { useEffect, useState } from 'react';
import Hero from '../components/Hero';
import FeatureCards from '../components/FeatureCards';

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen overflow-hidden relative pt-5 ">
      {/* Dynamic gradient orb that follows mouse */}
      <div 
        className="fixed w-96 h-96 opacity-15 pointer-events-none z-50 "
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)',
          left: (mousePosition.x - 192) + 'px',
          top: (mousePosition.y - 192) + 'px',
          filter: 'blur(60px)',
          transition: 'all 0.3s ease-out'
        }}
      />

      {/* Hero Section */}
      <div className='px-5 pt-3'>
        <Hero />
      </div>

      {/* Feature Cards Section */}
      <FeatureCards />

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-slate-50 via-white to-slate-100 py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl md:text-6xl font-bold text-slate-800 mb-6">
              Ready to Transform Your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mt-2">
                Parking Experience?
              </span>
            </h2>
            <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto">
              Join thousands of satisfied users who have already made parking hassle-free with our smart solution.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="group relative px-10 py-5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold text-white text-lg shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-500 hover:scale-105 overflow-hidden">
                <span className="relative z-10 flex items-center justify-center space-x-2">
                  <span>Download App</span>
                  <svg className="w-5 h-5 group-hover:translate-y-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>

              <button className="px-10 py-5 bg-white backdrop-blur-xl border-2 border-slate-200 rounded-xl font-semibold text-slate-700 text-lg hover:bg-slate-50 hover:border-slate-300 hover:shadow-lg transition-all duration-500 hover:scale-105">
                Watch Demo
              </button>
            </div>

            {/* App Store Badges */}
            <div className="flex flex-wrap justify-center gap-4 mt-12">
              <div className="bg-white border border-slate-200 rounded-xl px-6 py-3 flex items-center space-x-3 hover:shadow-lg transition-all duration-300 cursor-pointer">
                <i className="fab fa-apple text-3xl text-slate-700"></i>
                <div className="text-left">
                  <div className="text-xs text-slate-500">Download on the</div>
                  <div className="text-sm font-semibold text-slate-700">App Store</div>
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl px-6 py-3 flex items-center space-x-3 hover:shadow-lg transition-all duration-300 cursor-pointer">
                <i className="fab fa-google-play text-3xl text-slate-700"></i>
                <div className="text-left">
                  <div className="text-xs text-slate-500">Get it on</div>
                  <div className="text-sm font-semibold text-slate-700">Google Play</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                SmartParking
              </h3>
              <p className="text-slate-400 text-sm">
                Revolutionizing urban mobility with AI-powered parking solutions.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li className="hover:text-white cursor-pointer transition-colors">Features</li>
                <li className="hover:text-white cursor-pointer transition-colors">Pricing</li>
                <li className="hover:text-white cursor-pointer transition-colors">FAQ</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li className="hover:text-white cursor-pointer transition-colors">About Us</li>
                <li className="hover:text-white cursor-pointer transition-colors">Careers</li>
                <li className="hover:text-white cursor-pointer transition-colors">Contact</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li className="hover:text-white cursor-pointer transition-colors">Privacy Policy</li>
                <li className="hover:text-white cursor-pointer transition-colors">Terms of Service</li>
                <li className="hover:text-white cursor-pointer transition-colors">Cookie Policy</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 text-sm mb-4 md:mb-0">
              © 2025 SmartParking. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <i className="fab fa-twitter text-slate-400 hover:text-white cursor-pointer transition-colors text-xl"></i>
              <i className="fab fa-facebook text-slate-400 hover:text-white cursor-pointer transition-colors text-xl"></i>
              <i className="fab fa-instagram text-slate-400 hover:text-white cursor-pointer transition-colors text-xl"></i>
              <i className="fab fa-linkedin text-slate-400 hover:text-white cursor-pointer transition-colors text-xl"></i>
            </div>
          </div>
        </div>
      </footer>

      {/* Font Awesome for icons */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
    </div>
  );
}