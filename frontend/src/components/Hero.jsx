import React from 'react';
import { motion } from 'framer-motion';
import ParkingSlot from './ParkingSlot';

export default function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const slideFromLeft = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.7,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const slideFromRight = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 1,
        ease: [0.25, 0.46, 0.45, 0.94],
        delay: 0.4
      }
    }
  };

  return (
    <div className="w-full min-h-screen pt-15 bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center relative overflow-hidden">
      {/* Enhanced decorative elements */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute w-96 h-96 rounded-full bg-gradient-to-br from-purple-100/30 to-pink-100/30 blur-3xl -top-48 -left-48 animate-pulse" 
        style={{ animationDuration: '4s' }} 
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, delay: 0.2 }}
        className="absolute w-80 h-80 rounded-full bg-gradient-to-br from-cyan-100/30 to-purple-100/30 blur-3xl -bottom-40 left-20 animate-pulse" 
        style={{ animationDuration: '5s' }} 
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, delay: 0.4 }}
        className="absolute w-72 h-72 rounded-full bg-gradient-to-br from-pink-100/30 to-orange-100/30 blur-3xl top-1/3 right-1/4 animate-pulse" 
        style={{ animationDuration: '6s' }} 
      />

      {/* Left Section - Text Content */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 px-16 py-16 flex flex-col justify-center max-w-3xl z-10"
      >
        {/* Badge */}
        <motion.div 
          variants={itemVariants}
          className="inline-block px-6 py-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200/50 rounded-full mb-6 w-fit backdrop-blur-xl shadow-lg shadow-purple-500/10"
        >
          <span className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
           Finding parking was never this easy!
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h1 
          variants={itemVariants}
          className="text-7xl font-bold text-slate-800 mb-6 leading-tight"
        >
          The Future of
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 mt-2 animate-gradient">
            Smart Parking
          </span>
        </motion.h1>

        {/* Description */}
        <motion.p 
          variants={itemVariants}
          className="text-xl text-slate-600 mb-10 leading-relaxed max-w-xl"
        >
          Revolutionize your parking experience with automated gates,
          real-time availability, and seamless vehicle management powered by cutting-edge technology.
        </motion.p>

        {/* Buttons */}
        <motion.div 
          variants={itemVariants}
          className="flex gap-5 mb-14 flex-wrap"
        >
          <motion.a 
            href="/parking"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="group relative px-10 py-5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold text-white shadow-xl shadow-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/40 transition-all duration-500 overflow-hidden inline-block"
          >
            <span className="relative z-10 flex items-center space-x-3">
              <span>Find Parking</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
              </svg>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </motion.a>

          <motion.button 
            onClick={() => window.scrollBy({ top: window.innerHeight * 1.5, behavior: 'smooth' })}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="px-10 py-5 bg-white/80 backdrop-blur-xl border border-slate-200/50 rounded-xl font-semibold text-slate-700 hover:bg-white/90 hover:shadow-xl hover:border-purple-200 transition-all duration-500 shadow-lg"
          >
            Learn More
          </motion.button>
        </motion.div>

        
      </motion.div>

      {/* Right Section - Parking Animation */}
      <motion.div 
        variants={slideFromRight}
        initial="hidden"
        animate="visible"
        className="flex-[0.8] h-[calc(100vh-80px)] relative z-10"
      >
        <ParkingSlot />
      </motion.div>

      <style jsx>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
}