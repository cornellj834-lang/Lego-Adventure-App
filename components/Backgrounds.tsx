import React from 'react';
import { motion } from 'framer-motion';

export const HomeBackground = () => (
  <div className="absolute inset-0 overflow-hidden bg-gradient-to-b from-sky-300 to-sky-100">
    {/* Sun */}
    <motion.div 
      animate={{ rotate: 360 }}
      transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      className="absolute top-[-5%] right-[-5%] w-[30vh] h-[30vh] bg-yellow-300 rounded-full blur-2xl opacity-60 will-change-transform" 
    />
    <div className="absolute top-10 right-10 w-24 h-24 bg-yellow-400 rounded-full shadow-lg border-4 border-yellow-200 opacity-90" />

    {/* Clouds */}
    {[1, 2, 3].map((i) => (
       <motion.div 
        key={i}
        initial={{ x: -200 }}
        animate={{ x: '120vw' }} 
        transition={{ duration: 30 + i * 10, repeat: Infinity, ease: "linear", delay: i * 5 }}
        className="absolute opacity-80 will-change-transform"
        style={{ top: `${10 + i * 15}%` }}
      >
        <svg width="120" height="70" viewBox="0 0 120 70" fill="white">
            <path d="M10,50 Q0,50 0,40 Q0,20 20,20 Q30,0 50,0 Q80,0 90,20 Q110,20 110,40 Q110,60 90,60 L10,60 Z" />
        </svg>
      </motion.div>
    ))}

    {/* Rolling Hills - Layered for depth */}
    <div className="absolute bottom-0 w-full h-[45%]">
         <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1200 400">
             {/* Back Hill */}
             <path d="M0,250 C300,100 800,400 1200,200 L1200,400 L0,400 Z" fill="#86EFAC" />
             {/* Middle Hill */}
             <path d="M0,300 C400,150 700,450 1200,300 L1200,400 L0,400 Z" fill="#4ADE80" />
             {/* Front Hill */}
             <path d="M0,350 C200,280 500,420 1200,320 L1200,400 L0,400 Z" fill="#22C55E" />
         </svg>
    </div>
    
    {/* Road with Dash details */}
    <div className="absolute bottom-0 w-full h-32 flex items-end">
        <div className="w-full h-20 bg-stone-700 relative border-t-4 border-stone-600">
            <div className="absolute top-1/2 left-0 w-full h-0 border-t-4 border-dashed border-white/80 -translate-y-1/2"></div>
        </div>
    </div>
  </div>
);

export const DinoBackground = () => (
  <div className="absolute inset-0 overflow-hidden bg-gradient-to-b from-teal-200 to-green-100">
    {/* Distant Volcano */}
    <div className="absolute bottom-[20%] left-[15%] w-[40vw] h-[30vh]">
        <svg viewBox="0 0 200 100" preserveAspectRatio="none" className="w-full h-full">
            <path d="M50,100 L100,20 L150,100 Z" fill="#78350F" />
            <path d="M100,20 L90,40 L110,40 Z" fill="#EF4444" />
        </svg>
        {/* Smoke Particles */}
        <motion.div
           animate={{ y: -50, opacity: 0, scale: 1.5 }}
           transition={{ duration: 3, repeat: Infinity }}
           className="absolute top-0 left-1/2 w-8 h-8 bg-gray-400 rounded-full blur-md will-change-transform"
        />
    </div>

    {/* Lush Jungle Vegetation Layers */}
    <div className="absolute bottom-0 w-full h-full pointer-events-none">
        {/* Back Layer */}
        <svg className="absolute bottom-0 w-full h-[60%]" preserveAspectRatio="none" viewBox="0 0 1000 400">
            <path d="M0,400 L0,200 Q200,100 400,300 T800,200 T1200,300 L1200,400 Z" fill="#166534" opacity="0.8" />
        </svg>
        
        {/* Front Layer - Giant Leaves */}
        <svg className="absolute bottom-[-10%] w-full h-[40%]" preserveAspectRatio="none" viewBox="0 0 1000 200">
            <path d="M0,200 Q100,0 200,200 Q300,50 400,200 Q500,0 600,200 Q700,50 800,200 Q900,0 1000,200 Z" fill="#15803D" />
        </svg>
    </div>

    {/* Sunlight Beams */}
    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-yellow-100/20 to-transparent pointer-events-none" />
  </div>
);

export const CastleBackground = () => (
  <div className="absolute inset-0 overflow-hidden bg-gradient-to-b from-blue-300 to-blue-100">
    {/* Distant Mountains */}
    <div className="absolute bottom-[30%] w-full h-[40%]">
         <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 300">
             <path d="M0,300 L200,100 L400,300 L600,150 L800,300 L1000,200 L1000,300 Z" fill="#94A3B8" />
             {/* Snow Caps */}
             <path d="M200,100 L170,140 L230,140 Z" fill="white" />
             <path d="M600,150 L570,190 L630,190 Z" fill="white" />
         </svg>
    </div>

    {/* Castle Foreground */}
    <div className="absolute bottom-0 w-full h-[35%] flex items-end justify-center">
        {/* Wall */}
        <div className="w-full h-full bg-stone-400 border-t-8 border-stone-500 relative flex justify-center">
            {/* Crenellations */}
            <div className="absolute -top-8 w-full flex justify-between px-4">
               {Array.from({ length: 15 }).map((_, i) => (
                   <div key={i} className="w-[4%] h-8 bg-stone-400 border-t-8 border-l-4 border-r-4 border-stone-500 rounded-t-sm" />
               ))}
            </div>
            
            {/* Gate */}
            <div className="w-48 h-32 bg-stone-700 rounded-t-full border-8 border-stone-500 absolute bottom-0">
               <div className="w-full h-full border-4 border-dashed border-stone-600 grid grid-cols-2">
                  <div className="border-r-4 border-stone-800"></div>
               </div>
            </div>
        </div>
    </div>
    
    {/* Floating Banners */}
    <motion.div 
       animate={{ rotate: [0, 5, 0], y: [0, -5, 0] }}
       transition={{ duration: 4, repeat: Infinity }}
       className="absolute top-[20%] left-[10%] will-change-transform"
    >
        <svg width="60" height="90" viewBox="0 0 60 90">
            <rect x="0" y="0" width="4" height="90" fill="#444" />
            <path d="M4,0 L60,0 L60,40 L32,30 L4,40 Z" fill="#DC2626" />
        </svg>
    </motion.div>
  </div>
);

export const LavaBackground = () => (
  <div className="absolute inset-0 overflow-hidden bg-gradient-to-b from-orange-900 via-red-900 to-stone-900">
     {/* Magma Background */}
     <div className="absolute inset-0 opacity-40">
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
             <defs>
                 <linearGradient id="magmaGradient" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="0%" stopColor="#EF4444" />
                     <stop offset="100%" stopColor="#F59E0B" />
                 </linearGradient>
             </defs>
             <rect width="100" height="100" fill="url(#magmaGradient)" />
        </svg>
     </div>

     {/* Floating Rocks / Platforms */}
     <motion.div 
       animate={{ y: [0, -20, 0] }}
       transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
       className="absolute top-1/4 left-1/4 w-40 h-12 bg-stone-800 rounded-full shadow-lg border-b-4 border-red-500/50 will-change-transform"
     />
     <motion.div 
       animate={{ y: [0, -30, 0] }}
       transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
       className="absolute bottom-1/3 right-1/4 w-56 h-16 bg-stone-800 rounded-full shadow-lg border-b-4 border-red-500/50 will-change-transform"
     />

     {/* Rising Embers */}
     {Array.from({ length: 10 }).map((_, i) => (
       <motion.div
          key={i}
          initial={{ y: '110vh', opacity: 1 }}
          animate={{ y: '-10vh', opacity: 0 }}
          transition={{ duration: 5 + Math.random() * 5, repeat: Infinity, delay: Math.random() * 5, ease: "linear" }}
          className="absolute w-2 h-2 bg-yellow-400 rounded-full blur-[1px] will-change-transform"
          style={{ left: `${Math.random() * 100}%` }}
       />
     ))}
  </div>
);

export const SpaceBackground = () => (
  <div className="absolute inset-0 overflow-hidden bg-[#0B0F19]">
     {/* Deep Space Gradient */}
     <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/20 to-blue-900/20"></div>

     {/* Stars */}
     {Array.from({ length: 50 }).map((_, i) => (
         <div 
            key={i}
            className="absolute bg-white rounded-full opacity-70"
            style={{
                width: Math.random() * 3 + 'px',
                height: Math.random() * 3 + 'px',
                top: Math.random() * 100 + '%',
                left: Math.random() * 100 + '%',
                animation: `pulse ${Math.random() * 3 + 1}s infinite`
            }}
         />
     ))}

     {/* Big Planet */}
     <div className="absolute top-[-10%] right-[-10%] w-[50vh] h-[50vh] rounded-full bg-indigo-600 shadow-2xl overflow-hidden opacity-90 border-4 border-indigo-400/30">
         <div className="absolute top-[20%] left-[-10%] w-[120%] h-[10%] bg-indigo-500/50 -rotate-12 blur-sm" />
         <div className="absolute bottom-[30%] left-[-10%] w-[120%] h-[15%] bg-indigo-800/50 -rotate-12 blur-sm" />
     </div>
     
     {/* Shooting Star */}
     <motion.div
        animate={{ x: [-200, 1500], y: [200, -800], opacity: [0, 1, 0] }}
        transition={{ duration: 4, repeat: Infinity, repeatDelay: 5 }}
        className="absolute top-[60%] left-0 w-48 h-1 bg-gradient-to-r from-transparent via-white to-transparent rotate-[-30deg] will-change-transform"
     />
  </div>
);