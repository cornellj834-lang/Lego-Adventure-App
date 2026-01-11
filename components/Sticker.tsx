import React from 'react';
import { motion } from 'framer-motion';
import { IconHelper } from './IconHelper';

interface StickerProps {
  iconName: string;
  color: string;
  locked?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'lego' | 'duplo';
}

export const Sticker: React.FC<StickerProps> = ({ iconName, color, locked, size = 'md', variant = 'lego' }) => {
  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-32 h-32',
    lg: 'w-48 h-48',
  };

  const iconSize = size === 'sm' ? 40 : size === 'md' ? 60 : 80;

  if (locked) {
      return (
          <div className={`${sizeClasses[size]} flex items-center justify-center`}>
              <div className="w-2/3 h-2/3 bg-black/10 rounded-full animate-pulse" />
          </div>
      );
  }

  return (
    <motion.div 
       initial={{ scale: 0.8, opacity: 0 }}
       animate={{ scale: 1, opacity: 1, rotate: Math.random() * 10 - 5 }}
       whileHover={{ scale: 1.1, rotate: 0, zIndex: 10 }}
       className={`relative ${sizeClasses[size]} flex-shrink-0 cursor-pointer group`}
    >
       {/* Sticker visuals */}
       <div className={`
          relative w-full h-full 
          bg-white rounded-full 
          shadow-md group-hover:shadow-xl transition-shadow
          border-[6px] border-white
          overflow-hidden
          flex items-center justify-center
       `}>
          {/* Inner Colored Area */}
          <div className={`
             w-full h-full rounded-full 
             ${color} 
             flex items-center justify-center
             shadow-inner
             relative
          `}>
             {/* Texture/Shine */}
             <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-black/5 to-white/20 pointer-events-none" />
             
             {/* Icon */}
             <div className="text-white drop-shadow-md z-10">
                <IconHelper name={iconName} size={iconSize} />
             </div>
          </div>
       </div>
    </motion.div>
  );
};