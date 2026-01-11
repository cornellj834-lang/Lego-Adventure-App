import React, { useState, useEffect } from 'react';
import { WORLDS, LEVEL_1_MISSIONS, LEVEL_2_MISSIONS } from './constants';
import { WorldType, Mission, UserLevel } from './types';
import { playAudio, stopSpeaking, playSoundEffect, initAudio, preloadAudio } from './services/voiceService';
import { loadProgress, saveProgress, resetProgress } from './services/storage';
import { BigButton } from './components/BigButton';
import { IconHelper } from './components/IconHelper';
import { Sticker } from './components/Sticker';
import { Mascot } from './components/Mascot';
import { WorldCard } from './components/WorldCard';
import { HomeBackground, DinoBackground, CastleBackground, LavaBackground, SpaceBackground } from './components/Backgrounds';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import confetti from 'canvas-confetti';
import { ArrowLeft, Check, Star, Trash2, Ear, Home, Gift, Sun, Blocks, Baby } from 'lucide-react';

enum View {
  SPLASH,
  LEVEL_SELECT,
  HOME,           
  MISSION_SELECT, 
  MISSION,        
  CELEBRATION,    
  STICKER_BOOK    
}

export default function App() {
  const [view, setView] = useState<View>(View.SPLASH);
  const [currentWorldId, setCurrentWorldId] = useState<WorldType | null>(null);
  const [currentMission, setCurrentMission] = useState<Mission | null>(null);
  const [completedMissions, setCompletedMissions] = useState<string[]>([]);
  const [userLevel, setUserLevel] = useState<UserLevel>(UserLevel.ADVENTURE);
  const [isGiftOpen, setIsGiftOpen] = useState(false);
  const [isMascotTalking, setIsMascotTalking] = useState(false);
  
  const AVAILABLE_MISSIONS = userLevel === UserLevel.TINY ? LEVEL_2_MISSIONS : LEVEL_1_MISSIONS;
  const isTiny = userLevel === UserLevel.TINY;

  // Variants with dynamic duration based on level
  const pageVariants: Variants = {
    initial: { opacity: 0, scale: 0.95, y: 20 },
    animate: { 
      opacity: 1, 
      scale: 1, 
      y: 0, 
      transition: { 
        type: "spring", 
        bounce: isTiny ? 0.3 : 0.4, 
        duration: isTiny ? 0.8 : 0.5 
      } 
    },
    exit: { 
      opacity: 0, 
      scale: 1.05, 
      transition: { duration: 0.3 } 
    }
  };

  useEffect(() => {
    const state = loadProgress();
    setCompletedMissions(state.completedMissions);
    setUserLevel(state.level);
  }, []);

  useEffect(() => {
    saveProgress(completedMissions, userLevel);
  }, [completedMissions, userLevel]);

  useEffect(() => {
    // Preload critical audio with punctuated text for better prosody
    preloadAudio("Welcome back! Let's play, Lego Adventure!");
    preloadAudio("Sticker Book! Look at your collection.");
    preloadAudio("Are you a Big Builder? Or a Tiny Builder?");
    preloadAudio("Tiny Builders! Let's play!");
    preloadAudio("Lego Adventure! Let's build!");
    preloadAudio("Locked! You need more stickers, for this world.");
    preloadAudio("All gone. Stickers cleared.");
    preloadAudio("Good job! Tap the gift box.");
    preloadAudio("Awesome job! Tap the gift box... What's inside?");
    WORLDS.forEach(world => {
         preloadAudio(world.voiceIntro);
         preloadAudio(`Welcome to ${world.name}! Let's play!`);
    });
    LEVEL_1_MISSIONS.slice(0, 5).forEach(m => preloadAudio(m.audioScript || m.voicePrompt));
    LEVEL_2_MISSIONS.slice(0, 5).forEach(m => preloadAudio(m.audioScript || m.voicePrompt));
  }, []);

  // Centralized speech handler to sync Mascot and manage speed
  const speak = async (key: string, text: string) => {
      // 0.9 speed for Tiny builders to ensure clarity and calm pacing
      const rate = isTiny ? 0.9 : 1.0;
      
      setIsMascotTalking(true);
      try {
          await playAudio(key, text, rate);
      } catch (e) {
          // Ignored (e.g. interruption)
      } finally {
          setIsMascotTalking(false);
      }
  };

  const navigateTo = (newView: View) => {
    stopSpeaking();
    setIsMascotTalking(false);
    setView(newView);
  };

  const handleStart = async () => {
    await initAudio();
    playSoundEffect('click');
    setView(View.LEVEL_SELECT);
    speak('level_select_intro', "Are you a Big Builder? Or a Tiny Builder?");
  };

  const handleLevelSelect = (level: UserLevel) => {
    playSoundEffect('pop');
    setUserLevel(level);
    
    // We navigate first, then speak in the new context if needed, 
    // but here we just speak immediately as we transition.
    if (level === UserLevel.TINY) {
        speak('level_tiny', "Tiny Builders! Let's play!");
        LEVEL_2_MISSIONS.forEach(m => preloadAudio(m.audioScript || m.voicePrompt));
    } else {
        speak('level_adventure', "Lego Adventure! Let's build!");
        LEVEL_1_MISSIONS.forEach(m => preloadAudio(m.audioScript || m.voicePrompt));
    }
    
    setView(View.HOME);
  };

  const handleWorldSelect = (worldId: WorldType, locked: boolean) => {
    if (locked && !isTiny) {
      playSoundEffect('pop'); 
      speak('locked_world', "Locked! You need more stickers, for this world.");
      return;
    }
    playSoundEffect('click');
    setCurrentWorldId(worldId);
    navigateTo(View.MISSION_SELECT);
    const world = WORLDS.find(w => w.id === worldId);
    if (world) {
        const intro = isTiny ? `Welcome to ${world.name}! Let's play!` : world.voiceIntro;
        // Small delay to let transition finish visually before talking starts
        setTimeout(() => {
             speak(world.audioKey + (isTiny ? '_tiny' : ''), intro);
        }, 500);
        
        const worldMissions = AVAILABLE_MISSIONS.filter(m => m.world === worldId);
        worldMissions.forEach(m => preloadAudio(m.audioScript || m.voicePrompt));
    }
  };

  const handleMissionStart = (mission: Mission) => {
    playSoundEffect('click');
    setCurrentMission(mission);
    navigateTo(View.MISSION);
    // Delay slightly for smooth transition
    setTimeout(() => {
        speak(mission.audioKey, mission.audioScript || mission.voicePrompt);
    }, 600);
  };

  const handleMissionComplete = () => {
    if (!currentMission) return;
    playSoundEffect('success');
    if (!completedMissions.includes(currentMission.id)) {
      setCompletedMissions(prev => [...prev, currentMission.id]);
    }
    setIsGiftOpen(false); 
    navigateTo(View.CELEBRATION);
    
    const congrats = isTiny 
        ? "Good job! Tap the gift box." 
        : "Awesome job! Tap the gift box... What's inside?";
    
    // Wait for view transition
    setTimeout(() => {
        speak('mission_complete', congrats);
    }, 500);
  };

  const handleOpenGift = () => {
    setIsGiftOpen(true);
    playSoundEffect('sparkle');
    confetti({
      particleCount: 200,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#D11013', '#FFCC00', '#0055BF', '#237841'],
      shapes: ['circle', 'square'],
      scalar: 1.5,
      drift: 0.5,
      gravity: 0.8,
    });
    
    const reveal = isTiny
        ? `Look! You got a ${currentMission?.title} sticker!`
        : `Wow! You got the ${currentMission?.title} sticker!`;
        
    // Wait for the confetti pop sound and visual burst before speaking
    setTimeout(() => {
        speak('sticker_reveal', reveal);
    }, 800);
  };

  const handleReset = () => {
    playSoundEffect('pop');
    if (confirm("Are you sure you want to delete all stickers?")) {
      resetProgress();
      setCompletedMissions([]);
      speak('data_cleared', "All gone. Stickers cleared.");
    }
  };

  const goHome = () => {
    playSoundEffect('pop');
    navigateTo(View.HOME);
    setCurrentWorldId(null);
    setCurrentMission(null);
  };

  const goBack = () => {
      playSoundEffect('pop');
      if (view === View.MISSION) navigateTo(View.MISSION_SELECT);
      else if (view === View.LEVEL_SELECT) setView(View.SPLASH);
      else if (view === View.HOME) setView(View.LEVEL_SELECT);
      else goHome();
  };

  // --- BACKGROUNDS ---
  const renderBackground = () => {
    return (
      <div className="absolute inset-0 z-0 bg-lego-yellow transition-all duration-700">
         <AnimatePresence mode="popLayout">
            <motion.div 
               key={currentWorldId || 'home'}
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }} 
               transition={{ duration: 0.8 }}
               className="absolute inset-0"
            >
              {currentWorldId === WorldType.DINO && <DinoBackground />}
              {currentWorldId === WorldType.CASTLE && <CastleBackground />}
              {currentWorldId === WorldType.LAVA && <LavaBackground />}
              {currentWorldId === WorldType.SPACE && <SpaceBackground />}
              {(currentWorldId === WorldType.VEHICLE || !currentWorldId) && <HomeBackground />}
            </motion.div>
         </AnimatePresence>
      </div>
    );
  };

  const renderSplash = () => (
    <div className="flex flex-col items-center justify-center h-full w-full relative z-10 p-8 cursor-pointer" onClick={handleStart}>
       <div className="bg-white/90 backdrop-blur-sm p-12 rounded-[3rem] shadow-toy-xl border-8 border-lego-yellow flex flex-col items-center gap-8 max-w-2xl animate-float">
          <Mascot emotion="excited" size={240} />
          <div className="text-center">
             <h1 className="text-6xl font-black text-lego-blue mb-2 tracking-tight drop-shadow-sm">LEGO BUILD</h1>
             <h2 className="text-5xl font-black text-lego-red tracking-wide drop-shadow-sm">ADVENTURE</h2>
          </div>
          <div className="bg-lego-green text-white text-3xl font-bold px-12 py-4 rounded-full shadow-toy animate-pulse mt-4">
             Tap to Start!
          </div>
       </div>
    </div>
  );

  const renderLevelSelect = () => (
    <div className="flex flex-col items-center justify-center h-full w-full relative z-10 p-8 gap-12">
        <motion.h2 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-4xl font-black text-lego-blue bg-white/90 px-10 py-5 rounded-full shadow-toy-lg border-4 border-white"
        >
          Who is playing?
        </motion.h2>
        
        <div className="flex gap-8 md:gap-16 items-center">
            {/* Level 1 */}
            <motion.button 
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleLevelSelect(UserLevel.ADVENTURE)}
                className="bg-white p-8 rounded-[3rem] shadow-toy-xl border-b-8 border-lego-blue flex flex-col items-center gap-6 w-72 md:w-80 group transition-all"
            >
                <div className="bg-blue-100 p-8 rounded-full group-hover:bg-blue-200 transition-colors shadow-inner">
                    <Blocks size={80} className="text-lego-blue" />
                </div>
                <div className="text-center">
                    <h3 className="text-3xl font-bold text-gray-800 mb-2">Build Adventure</h3>
                    <p className="text-lego-blue font-bold text-xl">Age 6+</p>
                </div>
            </motion.button>

            {/* Level 2 */}
            <motion.button 
                 whileHover={{ scale: 1.05, y: -5 }}
                 whileTap={{ scale: 0.95 }}
                 onClick={() => handleLevelSelect(UserLevel.TINY)}
                 className="bg-white p-8 rounded-[3rem] shadow-toy-xl border-b-8 border-lego-green flex flex-col items-center gap-6 w-72 md:w-80 group transition-all"
            >
                 <div className="bg-green-100 p-8 rounded-full group-hover:bg-green-200 transition-colors shadow-inner">
                    <Baby size={80} className="text-lego-green" />
                </div>
                <div className="text-center">
                    <h3 className="text-3xl font-bold text-gray-800 mb-2">Tiny Builders</h3>
                    <p className="text-lego-green font-bold text-xl">Age 2+</p>
                </div>
            </motion.button>
        </div>
    </div>
  );

  const renderHome = () => {
    const relevantCompleted = completedMissions.filter(id => AVAILABLE_MISSIONS.some(m => m.id === id));
    const stickerCount = relevantCompleted.length;

    return (
      <div className="flex flex-col h-full relative z-10 p-6 pb-2">
         {/* Top Bar */}
         <div className="flex justify-between items-start mb-6 shrink-0">
            <div className="flex items-center gap-4">
                 <motion.button 
                   whileTap={{ scale: 0.9 }} 
                   onClick={() => setView(View.LEVEL_SELECT)}
                   className="bg-white rounded-2xl p-4 shadow-toy border-2 border-white hover:bg-gray-50 text-lego-blue"
                 >
                   <ArrowLeft size={32} strokeWidth={3} />
                 </motion.button>
            </div>

            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={() => { playSoundEffect('pop'); navigateTo(View.STICKER_BOOK); speak('sticker_book_intro', "Sticker Book! Look at your collection."); }}
              className="bg-white rounded-full p-2 pr-6 shadow-toy-lg border-4 border-white flex items-center gap-4 group hover:scale-105 transition-transform"
            >
               <div className="bg-lego-yellow p-3 rounded-full text-white shadow-sm group-hover:rotate-12 transition-transform">
                 <Star size={32} fill="currentColor" />
               </div>
               <div className="flex flex-col items-start leading-none gap-1">
                 <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Stickers</span>
                 <span className="text-3xl font-black text-gray-800">{stickerCount}</span>
               </div>
            </motion.button>
         </div>

         {/* Content Area */}
         <div className="flex-1 flex items-center min-h-0">
            {/* Mascot Sidebar */}
            <div className="hidden lg:flex flex-col items-center justify-end h-full pb-12 w-64 shrink-0">
               <div className="bg-white p-6 rounded-3xl rounded-bl-none shadow-xl mb-4 relative border-2 border-gray-100 animate-bounce-slow">
                 <p className="font-bold text-gray-700 text-xl text-center leading-tight">Pick a world to explore!</p>
                 <div className="absolute -bottom-3 left-8 w-6 h-6 bg-white rotate-45 border-r-2 border-b-2 border-gray-100"></div>
               </div>
               <Mascot emotion={isMascotTalking ? 'talking' : 'happy'} size={180} />
            </div>

            {/* Worlds Grid */}
            <div className="flex-1 h-full overflow-y-auto pl-4 pr-4 pb-10">
               <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
                 {WORLDS.map((world) => {
                   const isLocked = isTiny ? false : stickerCount < world.unlockCount;
                   return (
                     <div key={world.id} className="min-h-[220px]">
                       <WorldCard 
                         world={world} 
                         isLocked={isLocked} 
                         onClick={() => handleWorldSelect(world.id, isLocked)} 
                       />
                     </div>
                   );
                 })}
               </div>
            </div>
         </div>
      </div>
    );
  };

  const renderMissionSelect = () => {
    const world = WORLDS.find(w => w.id === currentWorldId);
    const missions = AVAILABLE_MISSIONS.filter(m => m.world === currentWorldId);
    if (!world) return null;

    return (
      <div className="flex flex-col h-full relative z-10 p-6">
        {/* Header */}
        <div className="flex items-center gap-6 mb-8">
          <motion.button 
             whileTap={{ scale: 0.9 }} 
             onClick={goHome} 
             className="bg-white p-4 rounded-2xl shadow-toy text-gray-500 hover:text-lego-blue border-2 border-white"
          >
            <Home size={32} strokeWidth={3} />
          </motion.button>
          
          <div className="bg-white/90 backdrop-blur-md px-10 py-4 rounded-3xl shadow-toy flex-1 flex items-center justify-center border-4 border-white">
             <h2 className={`text-4xl font-black ${world.color.replace('bg-', 'text-')} drop-shadow-sm uppercase tracking-tight`}>{world.name}</h2>
          </div>
          
          <div className="w-20"></div> 
        </div>

        {/* Missions Grid */}
        <div className="flex-1 overflow-y-auto px-2 pb-10">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {missions.map((mission, index) => (
              <motion.div
                key={mission.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05, type: 'spring' }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleMissionStart(mission)}
                className={`
                   group relative bg-white rounded-[2rem] p-4 flex flex-col items-center gap-4 shadow-card hover:shadow-toy-lg cursor-pointer
                   border-4 ${completedMissions.includes(mission.id) ? 'border-lego-green bg-green-50' : 'border-transparent'}
                   transition-all duration-200
                `}
              >
                 {completedMissions.includes(mission.id) && (
                   <div className="absolute -top-3 -right-3 bg-lego-green text-white p-2 rounded-full shadow-lg z-10 border-2 border-white">
                     <Check size={28} strokeWidth={4} />
                   </div>
                 )}

                 <div className={`${mission.color} p-6 rounded-2xl w-full aspect-square flex items-center justify-center text-white shadow-inner`}>
                   <div className="drop-shadow-lg group-hover:scale-110 transition-transform duration-300">
                     <IconHelper name={mission.iconName} size={isTiny ? 72 : 56} />
                   </div>
                 </div>
                 <span className={`
                    ${isTiny ? 'text-2xl' : 'text-xl'} 
                    font-bold text-center text-gray-700 leading-tight w-full px-2 pb-2
                 `}>
                    {mission.title}
                 </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderMissionBuild = () => {
    if (!currentMission) return null;

    return (
      <div className="flex h-full relative z-10 p-6 gap-8">
         {/* Left Panel: Instructions */}
         <div className="w-1/3 flex flex-col z-20">
            <motion.button 
               whileTap={{ scale: 0.9 }}
               onClick={goBack} 
               className="self-start bg-white p-4 rounded-2xl shadow-toy text-gray-500 mb-6 border-2 border-white"
            >
              <ArrowLeft size={32} strokeWidth={3} />
            </motion.button>

            <div className="flex-1 flex flex-col items-center bg-white/90 backdrop-blur-md rounded-[2.5rem] p-6 shadow-xl border-4 border-white/50">
               <div className="flex-1 w-full flex flex-col items-center justify-center gap-6">
                  <div className="relative">
                      <Mascot emotion={isMascotTalking ? 'talking' : 'happy'} size={180} />
                  </div>
                  
                  <div className="bg-blue-50 p-6 rounded-3xl border-2 border-blue-100 w-full text-center">
                    <p className={`${isTiny ? 'text-3xl' : 'text-2xl'} font-bold text-gray-800 leading-relaxed`}>
                        "{currentMission.voicePrompt}"
                    </p>
                  </div>
               </div>

               <div className="w-full mt-6">
                 <motion.button 
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { playSoundEffect('click'); speak(currentMission.audioKey, currentMission.audioScript || currentMission.voicePrompt); }}
                    className="w-full bg-white text-lego-blue hover:bg-blue-50 rounded-2xl p-5 shadow-toy flex items-center justify-center gap-3 font-bold text-xl border-2 border-blue-100 transition-colors"
                  >
                    <Ear size={28} /> 
                    {isTiny ? "Listen" : "Hear Again"}
                 </motion.button>
               </div>
            </div>
         </div>

         {/* Right Panel: Visualization & Completion */}
         <div className="flex-1 flex flex-col items-center justify-center relative z-10">
            {/* Main Build Icon Circle */}
            <motion.div 
               initial={{ scale: 0, rotate: -180 }} 
               animate={{ scale: 1, rotate: 0 }}
               transition={{ type: "spring", bounce: isTiny ? 0.3 : 0.5, duration: 0.8 }}
               className={`
                 ${currentMission.color} 
                 aspect-square h-[50vh]
                 rounded-full 
                 flex items-center justify-center 
                 shadow-toy-xl border-[12px] border-white
                 mb-12
                 relative
                 group
               `}
            >
               <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-black/10 to-transparent pointer-events-none" />
               <motion.div 
                 animate={{ rotate: [0, 5, 0, -5, 0] }}
                 transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                 className="text-white drop-shadow-2xl"
               >
                   <IconHelper name={currentMission.iconName} size={isTiny ? 180 : 140} />
               </motion.div>
               {/* Gloss */}
               <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[90%] h-[40%] bg-gradient-to-b from-white/30 to-transparent rounded-t-full pointer-events-none" />
            </motion.div>

            <div className="w-full max-w-md">
              <BigButton onClick={handleMissionComplete} color="bg-lego-green" className="text-3xl py-8 rounded-[2rem] hover:brightness-110">
                <Check size={48} strokeWidth={4} />
                {isTiny ? "I Did It!" : "I Built It!"}
              </BigButton>
            </div>
         </div>
      </div>
    );
  };

  const renderCelebration = () => {
     if (!currentMission) return null;
     
     return (
       <div className="flex flex-col h-full items-center justify-center relative z-10 p-6">
         <div className="absolute top-8 right-8 z-50">
            <motion.button whileTap={{ scale: 0.9 }} onClick={goHome} className="bg-white p-4 rounded-2xl shadow-toy text-lego-blue border-4 border-white">
              <Home size={36} />
            </motion.button>
         </div>

         {!isGiftOpen ? (
           <div className="flex flex-col items-center gap-10">
             <motion.button 
               onClick={handleOpenGift}
               whileHover={{ scale: 1.05, rotate: 3 }}
               whileTap={{ scale: 0.95 }}
               className="relative cursor-pointer group"
             >
                <div className="bg-lego-yellow p-16 rounded-[3rem] shadow-toy-xl border-8 border-white animate-bounce-slow group-hover:bg-yellow-400 transition-colors">
                  <Gift size={140} className="text-lego-red" strokeWidth={1.5} />
                </div>
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white px-8 py-3 rounded-full shadow-lg whitespace-nowrap border-2 border-gray-100">
                   <span className="text-3xl font-bold text-lego-blue tracking-wide">{isTiny ? "Open!" : "Tap to Open!"}</span>
                </div>
             </motion.button>
             <Mascot emotion="excited" size={160} />
           </div>
         ) : (
           <div className="flex flex-col items-center w-full max-w-3xl relative">
             <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute -z-10 text-white opacity-40 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
             >
                <Sun size={800} />
             </motion.div>

             <motion.div 
               initial={{ scale: 0.5, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               transition={{ type: "spring", bounce: 0.6 }}
               className="bg-white/95 backdrop-blur-xl p-10 rounded-[3rem] shadow-2xl flex flex-col items-center gap-8 border-8 border-white w-full"
             >
                <h1 className="text-6xl font-black text-lego-yellow drop-shadow-sm tracking-wide stroke-gray-800">WAHOO!</h1>
                
                <div className="transform scale-125 my-4">
                   <Sticker 
                      iconName={currentMission.iconName} 
                      color={currentMission.color} 
                      size="lg" 
                      variant={isTiny ? 'duplo' : 'lego'}
                   />
                </div>
                
                <p className="text-3xl text-gray-600 font-bold text-center leading-relaxed">
                  {isTiny ? "Sticker!" : (
                      <>
                        You collected the <br/>
                        <span className={`text-4xl ${currentMission.color.replace('bg-', 'text-')}`}>{currentMission.title}</span> sticker!
                      </>
                  )}
                </p>

                <div className="flex gap-6 w-full mt-4 px-8">
                  <BigButton onClick={() => navigateTo(View.STICKER_BOOK)} color="bg-lego-purple">
                     {isTiny ? "Look!" : "Stickers"}
                  </BigButton>
                  <BigButton onClick={() => navigateTo(View.MISSION_SELECT)} color="bg-lego-blue">
                     {isTiny ? "More!" : "Next"}
                  </BigButton>
                </div>
             </motion.div>
           </div>
         )}
       </div>
     );
  };

  const renderStickerBook = () => {
    const relevantCompleted = completedMissions.filter(id => AVAILABLE_MISSIONS.some(m => m.id === id));
    
    return (
    <div className="flex flex-col h-full relative z-10 p-6 bg-orange-100">
      <div className="flex items-center justify-between mb-6">
         <div className="flex items-center gap-4">
            <motion.button whileTap={{ scale: 0.9 }} onClick={goHome} className="bg-white p-4 rounded-2xl shadow-toy text-lego-blue border-2 border-gray-100">
              <Home size={32} strokeWidth={3} />
            </motion.button>
            <div className="bg-white px-8 py-4 rounded-2xl shadow-toy border-2 border-gray-100">
                <h2 className="text-3xl font-black text-lego-purple tracking-tight">MY COLLECTION</h2>
            </div>
         </div>
         <motion.button whileTap={{ scale: 0.9 }} onClick={handleReset} className="text-red-300 hover:text-red-500 bg-white p-4 rounded-2xl shadow-sm border-2 border-gray-100">
           <Trash2 size={28} />
         </motion.button>
      </div>

      <div className="flex-1 bg-white rounded-[3rem] shadow-inner p-10 overflow-y-auto border-8 border-indigo-100 relative">
         {/* Binder Visuals */}
         <div className="absolute left-0 top-0 bottom-0 w-16 bg-gray-100 border-r border-gray-200 rounded-l-[2.5rem] flex flex-col justify-evenly items-center py-10 z-10">
            {[1,2,3,4].map(i => (
                <div key={i} className="w-20 h-8 bg-gray-300 rounded-full shadow-inner border-2 border-gray-400 -ml-2"></div>
            ))}
         </div>

         <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-10 pl-12">
            {AVAILABLE_MISSIONS.map(mission => (
               <motion.div 
                 key={mission.id} 
                 className="flex flex-col items-center gap-2"
                 initial={{ opacity: 0, scale: 0.8 }}
                 animate={{ opacity: 1, scale: 1 }}
               >
                  <Sticker 
                    iconName={mission.iconName} 
                    color={mission.color} 
                    locked={!relevantCompleted.includes(mission.id)} 
                    size="sm"
                    variant={isTiny ? 'duplo' : 'lego'}
                  />
               </motion.div>
            ))}
         </div>
      </div>
    </div>
    );
  };

  return (
    <div className="h-screen w-screen font-sans overflow-hidden bg-gray-900 relative selection:bg-transparent">
      {renderBackground()}

      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="h-full w-full max-w-7xl mx-auto"
        >
          {view === View.SPLASH && renderSplash()}
          {view === View.LEVEL_SELECT && renderLevelSelect()}
          {view === View.HOME && renderHome()}
          {view === View.MISSION_SELECT && renderMissionSelect()}
          {view === View.MISSION && renderMissionBuild()}
          {view === View.CELEBRATION && renderCelebration()}
          {view === View.STICKER_BOOK && renderStickerBook()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}