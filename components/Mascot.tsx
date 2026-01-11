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

  // Blinking Logic
  useEffect(() => {
    const blinkLoop = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 200);
      
      // Random blink interval between 3 and 6 seconds
      const nextBlink = Math.random() * 3000 + 3000;
      setTimeout(blinkLoop, nextBlink);
    };
    
    const timer = setTimeout(blinkLoop, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size * 1.5 }}>
      <motion.div
        animate={isExcited ? { y: [0, -15, 0], rotate: [0, -5, 5, 0] } : { y: [0, -5, 0] }}
        transition={isExcited ? { duration: 0.6, repeat: Infinity } : { duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="w-full h-full filter drop-shadow-xl will-change-transform"
      >
        <svg viewBox="0 0 100 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Head Stud */}
          <rect x="35" y="5" width="30" height="12" rx="2" fill="#FFCC00" stroke="#E6A800" strokeWidth="2" />
          
          {/* Head */}
          <rect x="15" y="15" width="70" height="65" rx="12" fill="#FFCC00" stroke="#E6A800" strokeWidth="2" />
          
          {/* Face */}
          {/* Eyes with Blink */}
          <g transform={isBlinking ? "scale(1, 0.1) translate(0, 360)" : ""}>
             <ellipse cx="35" cy="40" rx="6" ry="7" fill="#111" />
             <ellipse cx="65" cy="40" rx="6" ry="7" fill="#111" />
             {!isBlinking && (
               <>
                 <circle cx="37" cy="37" r="2" fill="white" opacity="0.9" />
                 <circle cx="67" cy="37" r="2" fill="white" opacity="0.9" />
               </>
             )}
          </g>

          {/* Mouth */}
          {isTalking ? (
             <motion.path 
               d="M35 60 Q50 75 65 60" 
               stroke="#111" 
               strokeWidth="4" 
               strokeLinecap="round" 
               fill="white"
               animate={{ d: ["M35 60 Q50 75 65 60", "M35 60 Q50 85 65 60", "M35 60 Q50 75 65 60"] }}
               transition={{ duration: 0.25, repeat: Infinity }}
             />
          ) : isExcited ? (
             <path d="M30 60 Q50 80 70 60" stroke="#111" strokeWidth="5" strokeLinecap="round" fill="none" />
          ) : (
             <path d="M35 60 Q50 70 65 60" stroke="#111" strokeWidth="5" strokeLinecap="round" fill="none" />
          )}

          {/* Torso */}
          <path d="M20 85 L80 85 L90 145 L10 145 Z" fill="#0055BF" stroke="#004499" strokeWidth="2" />
          
          {/* Logo on shirt */}
          <circle cx="50" cy="110" r="12" fill="white" opacity="0.9" />
          <path d="M45,110 L55,110 M50,105 L50,115" stroke="#D11013" strokeWidth="4" strokeLinecap="round" />

          {/* Arms */}
          <motion.path 
            d="M15 90 Q5 110 10 130" 
            stroke="#FFCC00" 
            strokeWidth="14" 
            strokeLinecap="round"
            animate={isExcited ? { d: ["M15 90 Q0 80 5 60", "M15 90 Q5 110 10 130"] } : {}}
            transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
          />
           <motion.path 
            d="M85 90 Q95 110 90 130" 
            stroke="#FFCC00" 
            strokeWidth="14" 
            strokeLinecap="round"
            animate={isExcited ? { d: ["M85 90 Q100 80 95 60", "M85 90 Q95 110 90 130"] } : {}}
            transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse", delay: 0.1 }}
          />
        </svg>
      </motion.div>
    </div>
  );
};