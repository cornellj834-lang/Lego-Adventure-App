import React from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { World, WorldType } from '../types';
import { VehicleIcon, DinoIcon, CastleIcon, LavaIcon, SpaceIcon } from './WorldIcons';

interface WorldCardProps {
  world: World;
  isLocked: boolean;
  onClick: () => void;
}

export const WorldCard: React.FC<WorldCardProps> = ({ world, isLocked, onClick }) => {
  const renderIcon = () => {
    switch (world.id) {
        case WorldType.VEHICLE: return <VehicleIcon size={70} />;
        case WorldType.DINO: return <DinoIcon size={70} />;
        case WorldType.CASTLE: return <CastleIcon size={70} />;
        case WorldType.LAVA: return <LavaIcon size={70} />;
        case WorldType.SPACE: return <SpaceIcon size={70} />;
        default: return null;
    }
  };

  return (
    <motion.div 
      whileHover={!isLocked ? { scale: 1.05, y: -5 } : {}}
      whileTap={!isLocked ? { scale: 0.95 } : { x: [0, -10, 10, 0] }}
      onClick={onClick}
      className={`
        relative 
        rounded-[2rem] 
        overflow-hidden 
        shadow-card
        hover:shadow-toy-xl
        cursor-pointer
        border-4 border-white
        h-full
        bg-white
        flex flex-col
        transition-shadow duration-300
      `}
    >
      {/* Top Half: Color & Icon */}
      <div className={`relative h-[65%] ${world.color} flex items-center justify-center overflow-hidden`}>
         {/* Background Decoration */}
         <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent" />
         
         <div className={`
             relative z-10 p-5 rounded-full bg-white/20 backdrop-blur-sm shadow-sm
             ${isLocked ? 'grayscale opacity-60' : 'drop-shadow-lg'}
         `}>
             {renderIcon()}
         </div>
      </div>

      {/* Bottom Half: Title & Info */}
      <div className="h-[35%] flex flex-col items-center justify-center bg-white relative z-20">
         <h2 className={`
            text-2xl font-bold tracking-tight
            ${isLocked ? 'text-gray-400' : 'text-gray-800'}
         `}>
           {world.name}
         </h2>
         
         {isLocked && (
             <div className="flex items-center gap-1 mt-1 text-lego-red font-bold text-sm bg-red-50 px-3 py-1 rounded-full">
                 <Lock size={14} />
                 <span>{world.unlockCount} Stickers</span>
             </div>
         )}
      </div>

      {/* Full Locked Overlay for disabled feel */}
      {isLocked && (
          <div className="absolute inset-0 bg-white/30 z-30 pointer-events-none" />
      )}
    </motion.div>
  );
};