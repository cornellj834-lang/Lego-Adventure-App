import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface MascotProps {
  emotion?: 'happy' | 'excited' | 'talking';
  className?: string;
  size?: number;
}

export const Mascot: React.FC<MascotProps> = ({ emotion = 'happy', className = '', size = 120 }) => {
  const isExcited = emotion === 'excited';
  const isTalking = emotion === 'talking';
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    const blinkLoop = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 200);
      const nextBlink = Math.random() * 3000 + 3000;
      setTimeout(blinkLoop, nextBlink);
    };
    const timer = setTimeout(blinkLoop, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size * 1.25 }}>
      <motion.div
        animate={isExcited ? { y: [0, -10, 0], rotate: [0, -5, 5, 0] } : { y: [0, -3, 0] }}
        transition={isExcited ? { duration: 0.6, repeat: Infinity } : { duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="w-full h-full filter drop-shadow-xl will-change-transform"
      >
        <svg viewBox="0 0 100 130" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Head Stud */}
          <rect x="38" y="0" width="24" height="10" rx="2" fill="#FFCC00" stroke="#E6A800" strokeWidth="2" />
          
          {/* Head */}
          <rect x="15" y="10" width="70" height="60" rx="12" fill="#FFCC00" stroke="#E6A800" strokeWidth="2" />
          
          {/* Face */}
          <g transform={isBlinking ? "scale(1, 0.1) translate(0, 360)" : ""}>
             <ellipse cx="35" cy="35" rx="5" ry="6" fill="#111" />
             <ellipse cx="65" cy="35" rx="5" ry="6" fill="#111" />
          </g>

          {/* Mouth */}
          {isTalking ? (
             <motion.path 
               d="M35 55 Q50 70 65 55" stroke="#111" strokeWidth="4" strokeLinecap="round" fill="white"
               animate={{ d: ["M35 55 Q50 65 65 55", "M35 55 Q50 75 65 55", "M35 55 Q50 65 65 55"] }}
               transition={{ duration: 0.2, repeat: Infinity }}
             />
          ) : isExcited ? (
             <path d="M30 55 Q50 75 70 55" stroke="#111" strokeWidth="4" strokeLinecap="round" fill="none" />
          ) : (
             <path d="M35 55 Q50 63 65 55" stroke="#111" strokeWidth="4" strokeLinecap="round" fill="none" />
          )}

          {/* Torso */}
          <path d="M20 75 L80 75 L85 125 L15 125 Z" fill="#0055BF" stroke="#004499" strokeWidth="2" />
          <circle cx="50" cy="100" r="10" fill="white" opacity="0.9" />
          <path d="M46,100 L54,100 M50,96 L50,104" stroke="#D11013" strokeWidth="3" strokeLinecap="round" />

          {/* Arms */}
          <motion.path 
            d="M15 80 Q5 100 8 115" stroke="#FFCC00" strokeWidth="12" strokeLinecap="round"
            animate={isExcited ? { d: ["M15 80 Q0 70 5 50", "M15 80 Q5 100 8 115"] } : {}}
            transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
          />
           <motion.path 
            d="M85 80 Q95 100 92 115" stroke="#FFCC00" strokeWidth="12" strokeLinecap="round"
            animate={isExcited ? { d: ["M85 80 Q100 70 95 50", "M85 80 Q95 100 92 115"] } : {}}
            transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse", delay: 0.1 }}
          />
        </svg>
      </motion.div>
    </div>
  );
};