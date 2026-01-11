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
        case WorldType.VEHICLE: return <VehicleIcon size={60} />;
        case WorldType.DINO: return <DinoIcon size={60} />;
        case WorldType.CASTLE: return <CastleIcon size={60} />;
        case WorldType.LAVA: return <LavaIcon size={60} />;
        case WorldType.SPACE: return <SpaceIcon size={60} />;
        default: return null;
    }
  };

  return (
    <motion.div 
      whileHover={!isLocked ? { y: -5 } : {}}
      whileTap={!isLocked ? { scale: 0.98 } : { x: [0, -5, 5, 0] }}
      onClick={onClick}
      className="relative rounded-2xl sm:rounded-[2rem] overflow-hidden shadow-card cursor-pointer border-4 border-white h-full bg-white flex flex-col transition-shadow"
    >
      <div className={`relative h-[55%] ${world.color} flex items-center justify-center overflow-hidden shrink-0`}>
         <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent" />
         <div className={`relative z-10 p-4 rounded-full bg-white/20 backdrop-blur-sm ${isLocked ? 'grayscale opacity-60' : 'drop-shadow-lg'}`}>
             {renderIcon()}
         </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center bg-white p-3">
         <h2 className={`text-lg sm:text-2xl font-bold tracking-tight text-center ${isLocked ? 'text-gray-400' : 'text-gray-800'}`}>
           {world.name}
         </h2>
         {isLocked && (
             <div className="flex items-center gap-1 mt-1 text-lego-red font-bold text-xs bg-red-50 px-2 py-1 rounded-full">
                 <Lock size={12} />
                 <span>{world.unlockCount} Stickers</span>
             </div>
         )}
      </div>
      {isLocked && <div className="absolute inset-0 bg-white/20 z-30 pointer-events-none" />}
    </motion.div>
  );
};