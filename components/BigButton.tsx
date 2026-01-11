import React from 'react';
import { motion } from 'framer-motion';

interface BigButtonProps {
  onClick: () => void;
  color?: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export const BigButton: React.FC<BigButtonProps> = ({ 
  onClick, 
  color = 'bg-lego-blue', 
  children, 
  className = '',
  disabled = false
}) => {
  return (
    <motion.button
      whileHover={!disabled ? { y: -3, scale: 1.02 } : {}}
      whileTap={!disabled ? { y: 4, scale: 0.98 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={`
        relative 
        w-full
        ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer'}
        ${color} 
        text-white 
        font-bold 
        text-2xl 
        rounded-[2rem] 
        p-6
        shadow-toy-lg
        active:shadow-toy-active
        transition-all
        duration-200
        flex items-center justify-center gap-4
        border-b-[6px] border-black/10
        border-t-2 border-white/30
        overflow-hidden
        ${className}
      `}
    >
      {/* Glossy highlight top half */}
      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent rounded-t-[2rem] pointer-events-none" />
      
      {/* Shimmer Effect */}
      {!disabled && (
        <div className="absolute top-0 left-[-100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] animate-shimmer pointer-events-none" />
      )}

      {/* Content */}
      <div className="relative z-10 flex items-center gap-3 drop-shadow-md">
        {children}
      </div>
    </motion.button>
  );
};