import React from 'react';

const AnimatedLogo = () => (
  <div className="group inline-block cursor-pointer">
    <svg
      width="48"
      height="48"
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      className="w-12 h-12 transition-transform duration-300 group-hover:scale-105"
      aria-hidden="true"
    >
      {/* Modern Parking Sign */}
      <g id="parking-sign">
        <rect x="14.5" y="3" width="3" height="22" rx="1.5" fill="url(#poleGradient)" />
        <rect x="14.5" y="3" width="3" height="22" rx="1.5" fill="black" opacity="0.1" transform="translate(0.5, 0.5)" />
        <circle cx="16" cy="10" r="7" fill="url(#signGradient)" />
        <circle cx="16" cy="10" r="7" fill="none" stroke="#5B21B6" strokeWidth="0.5" />
        <circle cx="16" cy="10" r="5.5" fill="white" opacity="0.95" />
        <text 
          x="16" 
          y="10" 
          fontFamily="Arial, sans-serif" 
          fontSize="8" 
          fontWeight="bold" 
          fill="#6366F1" 
          textAnchor="middle" 
          dominantBaseline="central"
        >
          P
        </text>
        <circle cx="14" cy="8" r="1.5" fill="white" opacity="0.4" />
      </g>

      {/* Modern Animated Car */}
      <g id="car">
        <ellipse cx="5" cy="29" rx="5" ry="0.8" fill="black" opacity="0.2" />
        <rect x="0" y="23" width="11" height="5" rx="1.2" fill="url(#carBody)" />
        <path d="M2 23 Q2 20 4.5 20 L6.5 20 Q9 20 9 23 Z" fill="url(#roofGradient)" />
        <path d="M2.5 21 Q2.5 20.5 3 20.5 L4 20.5 Q4.5 20.5 4.5 21 L4.5 22.5 L2.5 22.5 Z" fill="#DBEAFE" opacity="0.85" />
        <path d="M6.5 21 Q6.5 20.5 7 20.5 L8 20.5 Q8.5 20.5 8.5 21 L8.5 22.5 L6.5 22.5 Z" fill="#DBEAFE" opacity="0.85" />
        <rect x="2.5" y="21" width="2" height="1.5" rx="0.2" fill="none" stroke="#1E40AF" strokeWidth="0.3" opacity="0.5" />
        <rect x="6.5" y="21" width="2" height="1.5" rx="0.2" fill="none" stroke="#1E40AF" strokeWidth="0.3" opacity="0.5" />
        <g id="wheel-left">
          <circle cx="2.5" cy="28.5" r="1.5" fill="#1F2937" />
          <circle cx="2.5" cy="28.5" r="1.2" fill="#374151" />
          <circle cx="2.5" cy="28.5" r="0.5" fill="#6B7280" />
        </g>
        <g id="wheel-right">
          <circle cx="8.5" cy="28.5" r="1.5" fill="#1F2937" />
          <circle cx="8.5" cy="28.5" r="1.2" fill="#374151" />
          <circle cx="8.5" cy="28.5" r="0.5" fill="#6B7280" />
        </g>
        <circle cx="10.5" cy="24.5" r="0.6" fill="#FCD34D" opacity="0.9" />
        <circle cx="10.5" cy="26.5" r="0.6" fill="#EF4444" opacity="0.7" />
        <line x1="5.5" y1="23" x2="5.5" y2="28" stroke="#1E40AF" strokeWidth="0.4" opacity="0.4" />
        <ellipse cx="1" cy="24" rx="0.5" ry="0.8" fill="#60A5FA" />
        <rect x="0" y="27.5" width="11" height="0.5" rx="0.2" fill="#1E3A8A" opacity="0.3" />
      </g>

      <defs>
        <linearGradient id="signGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="50%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#6D28D9" />
        </linearGradient>
        <linearGradient id="poleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#71717A" />
          <stop offset="50%" stopColor="#52525B" />
          <stop offset="100%" stopColor="#71717A" />
        </linearGradient>
        <linearGradient id="carBody" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="50%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
        <linearGradient id="roofGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
      </defs>

      <style jsx>{`
        #car, #wheel-left, #wheel-right {
          animation: none;
        }

        .group:hover #car {
          transform-origin: center;
          animation: 
            carEnter 2.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards,
            carPark 0.8s 2.2s cubic-bezier(0.34, 0.5, 0.64, 1) forwards,
            stayParked 3s 3s forwards;
        }

        .group:hover #wheel-left, 
        .group:hover #wheel-right {
          transform-origin: center;
          animation: wheelSpin 2.2s linear forwards;
        }

        @keyframes carEnter {
          0% { transform: translateX(-30px) scale(0.7); opacity: 0; }
          60% { opacity: 1; }
          100% { transform: translateX(10px) scale(1); opacity: 1; }
        }

        @keyframes carPark {
          to { transform: translateX(0) translateY(-6px) scale(1.05); }
        }

        @keyframes stayParked {
          to { transform: translateX(0) translateY(-6px) scale(1.05); }
        }

        @keyframes wheelSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(720deg); }
        }
      `}</style>
    </svg>
  </div>
);

export default AnimatedLogo;
