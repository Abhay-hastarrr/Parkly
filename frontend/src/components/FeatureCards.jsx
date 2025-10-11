import { useEffect, useRef, useState } from 'react';

export default function FeatureCards() {
  const [currentCheckpoint, setCurrentCheckpoint] = useState(-1);
  const carRef = useRef(null);
  const roadRef = useRef(null);
  const featureCardsRef = useRef([]);

  const features = [
    {
      icon: 'fa-search-location',
      title: 'Smart Search',
      description: 'Discover available parking spots near your location with real-time availability updates and intelligent recommendations.',
      gradient: 'from-purple-50 to-pink-50',
      hoverBorder: 'hover:border-purple-500/50',
      iconGradient: 'from-purple-600 to-pink-600',
      bgGradient: 'from-purple-500/5'
    },
    {
      icon: 'fa-route',
      title: 'Navigation',
      description: 'Navigate directly to your reserved spot with turn-by-turn directions and live traffic updates for optimal routing.',
      gradient: 'from-cyan-50 to-purple-50',
      hoverBorder: 'hover:border-cyan-500/50',
      iconGradient: 'from-cyan-600 to-purple-600',
      bgGradient: 'from-cyan-500/5'
    },
    {
      icon: 'fa-calendar-check',
      title: 'Easy Booking',
      description: 'Manage all your parking reservations in one place with easy modification and cancellation options available anytime.',
      gradient: 'from-pink-50 to-orange-50',
      hoverBorder: 'hover:border-pink-500/50',
      iconGradient: 'from-pink-600 to-orange-600',
      bgGradient: 'from-pink-500/5'
    },
    {
      icon: 'fa-shield-alt',
      title: 'Secure Payment',
      description: 'Access your account settings, payment methods, and parking history with secure authentication and encrypted transactions.',
      gradient: 'from-green-50 to-cyan-50',
      hoverBorder: 'hover:border-green-500/50',
      iconGradient: 'from-green-600 to-cyan-600',
      bgGradient: 'from-green-500/5'
    }
  ];

  const checkpointIcons = ['fa-home', 'fa-search', 'fa-calendar-check', 'fa-shield-alt'];
  const checkpointColors = {
    border: ['#8b5cf6', '#10b981', '#f59e0b', '#ec4899'],
    icon: ['#7c3aed', '#059669', '#d97706', '#db2777']
  };

  const moveCarToCheckpoint = (checkpointIndex) => {
    if (!roadRef.current || !carRef.current) return;
    
    const checkpointPositions = [0, 33.33, 66.66, 100];
    const position = checkpointPositions[checkpointIndex];
    
    carRef.current.style.transition = 'left 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    carRef.current.style.left = `${position}%`;
    
    setTimeout(() => {
      setCurrentCheckpoint(checkpointIndex);
    }, 1500);
  };

  const startJourney = () => {
    setCurrentCheckpoint(-1);
    if (carRef.current) {
      carRef.current.style.left = '0%';
      carRef.current.style.transition = 'none';
    }
    
    featureCardsRef.current.forEach(card => {
      if (card) {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
      }
    });
    
    setTimeout(() => {
      moveCarToCheckpoint(0);
    }, 100);
  };

  // Auto-start animation on mount
  useEffect(() => {
    const initialDelay = setTimeout(() => {
      startJourney();
    }, 500);

    return () => clearTimeout(initialDelay);
  }, []);

  // Handle checkpoint progression and loop
  useEffect(() => {
    if (currentCheckpoint >= 0 && currentCheckpoint < 4) {
      if (featureCardsRef.current[currentCheckpoint]) {
        setTimeout(() => {
          featureCardsRef.current[currentCheckpoint].style.opacity = '1';
          featureCardsRef.current[currentCheckpoint].style.transform = 'translateY(0) scale(1)';
          featureCardsRef.current[currentCheckpoint].style.transition = 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
        }, 100);
      }
      
      if (currentCheckpoint < 3) {
        // Move to next checkpoint
        const timer = setTimeout(() => {
          moveCarToCheckpoint(currentCheckpoint + 1);
        }, 2500);
        return () => clearTimeout(timer);
      } else {
        // Reached last checkpoint - restart the journey after a pause
        const restartTimer = setTimeout(() => {
          startJourney();
        }, 3000); // 3 second pause before restarting
        return () => clearTimeout(restartTimer);
      }
    }
  }, [currentCheckpoint]);

  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-slate-100 py-20">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-slate-800 mb-6">
            Your Journey
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mt-2">
              Simplified
            </span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Follow the seamless experience from search to parking in four easy steps
          </p>
        </div>

        {/* Journey Road */}
        <div className="relative w-full max-w-5xl h-32 mx-auto mb-20">
          {/* Road */}
          <div 
            ref={roadRef}
            className="absolute top-1/2 left-0 right-0 h-3 bg-gradient-to-r from-slate-300 via-slate-400 to-slate-300 rounded-full transform -translate-y-1/2 shadow-lg"
          >
            {/* Animated road markings */}
            <div 
              className="absolute top-1/2 left-0 w-full h-0.5 bg-white opacity-70 transform -translate-y-1/2"
              style={{ 
                backgroundImage: 'repeating-linear-gradient(to right, transparent, transparent 20px, white 20px, white 40px)',
                animation: 'roadMove 1s linear infinite'
              }}
            />
          </div>
          
          {/* Checkpoints */}
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className="absolute top-1/2 w-12 h-12 bg-white rounded-full transform -translate-y-1/2 -translate-x-1/2 flex items-center justify-center shadow-xl transition-all duration-500"
              style={{ 
                left: `${idx * 33.33}%`,
                zIndex: 10,
                borderWidth: '4px',
                borderStyle: 'solid',
                borderColor: currentCheckpoint >= idx ? checkpointColors.border[idx] : '#cbd5e1',
                transform: currentCheckpoint >= idx ? 'translate(-50%, -50%) scale(1.1)' : 'translate(-50%, -50%) scale(1)'
              }}
            >
              <i 
                className={`fas ${checkpointIcons[idx]} text-lg transition-colors duration-500`}
                style={{ 
                  color: currentCheckpoint >= idx ? checkpointColors.icon[idx] : '#94a3b8'
                }}
              />
            </div>
          ))}
          
          {/* Animated Car */}
          <div 
            ref={carRef}
            className="absolute top-1/2 left-0 w-16 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg transform -translate-y-1/2 -translate-x-1/2 flex items-center justify-center shadow-2xl"
            style={{ 
              zIndex: 20,
              boxShadow: '0 8px 30px rgba(239, 68, 68, 0.4)'
            }}
          >
            {/* Car wheels */}
            <div className="w-3 h-3 bg-slate-900 rounded-full absolute left-2 top-1" />
            <div className="w-3 h-3 bg-slate-900 rounded-full absolute left-2 bottom-1" />
            <div className="w-3 h-3 bg-slate-900 rounded-full absolute right-2 top-1" />
            <div className="w-3 h-3 bg-slate-900 rounded-full absolute right-2 bottom-1" />
            {/* Headlight */}
            <div className="w-2 h-1 bg-yellow-300 rounded absolute right-0 top-1/2 transform translate-x-1 -translate-y-1/2 shadow-lg shadow-yellow-300/50" />
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <div 
              key={index}
              ref={el => featureCardsRef.current[index] = el}
              className={`group relative bg-gradient-to-br ${feature.gradient} backdrop-blur-xl border border-slate-200/50 rounded-3xl p-8 ${feature.hoverBorder} transition-all duration-700 opacity-0 overflow-hidden`}
              style={{ 
                transform: 'translateY(30px) scale(0.95)', 
                boxShadow: '0 10px 40px rgba(0,0,0,0.05)'
              }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
              
              <div className="relative z-10">
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.iconGradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg mx-auto`}>
                  <i className={`fas ${feature.icon} text-white text-2xl`} />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3 text-center group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 transition-all duration-300">
                  {feature.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed text-center">
                  {feature.description}
                </p>
              </div>

              {/* Hover effect decoration */}
              <div className="absolute -bottom-2 -right-2 w-24 h-24 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes roadMove {
          0% { background-position: 0 0; }
          100% { background-position: 40px 0; }
        }
      `}</style>

      {/* Font Awesome for icons */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
    </div>
  );
}