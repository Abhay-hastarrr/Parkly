// src/components/TypingText.jsx
import React from 'react';

const TypingText = () => (
  <div className="text-2xl font-bold leading-tight">
    <span className="inline-block animate-type-p">P</span>
    <span className="inline-block animate-type-a">a</span>
    <span className="inline-block animate-type-r">r</span>
    <span className="inline-block animate-type-k">k</span>
    <span className="inline-block animate-type-H">l</span>
    <span className="inline-block animate-type-u">y</span>


    <style jsx>{`
      @keyframes type {
        to { opacity: 1; }
      }

      .animate-type-p { animation: type 0.12s 2.0s forwards; opacity: 0; }
      .animate-type-a { animation: type 0.12s 2.1s forwards; opacity: 0; }
      .animate-type-r { animation: type 0.12s 2.2s forwards; opacity: 0; }
      .animate-type-k { animation: type 0.12s 2.3s forwards; opacity: 0; }
      .animate-type-L { animation: type 0.12s 2.4s forwards; opacity: 0; }
      .animate-type-Y { animation: type 0.12s 2.5s forwards; opacity: 0; }

      /* Full loop reset */
      div {
        animation: resetText 4.5s infinite;
      }

      @keyframes resetText {
        0%, 99.9% { opacity: 1; }
        100% { opacity: 0; }
      }

      @media (prefers-reduced-motion: reduce) {
        span { opacity: 1 !important; animation: none !important; }
      }
    `}</style>
  </div>
);

export default TypingText;