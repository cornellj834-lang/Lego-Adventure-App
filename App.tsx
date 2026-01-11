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

  const pageVariants: Variants = {
    initial: { opacity: 0, scale: 0.98 },
    animate: { 
      opacity: 1, 
      scale: 1, 
      transition: { 
        duration: 0.4
      } 
    },
    exit: { 
      opacity: 0, 
      scale: 1.02, 
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

  const speak = async (key: string, text: string) => {
      const rate = isTiny ? 0.9 : 1.0;
      setIsMascotTalking(true);
      try {
          await playAudio(key, text, rate);
      } catch (e) {
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
        setTimeout(() => {
             speak(world.audioKey + (isTiny ? '_tiny' : ''), intro);
        }, 500);
    }
  };

  const handleMissionStart = (mission: Mission) => {
    playSoundEffect('click');
    setCurrentMission(mission);
    navigateTo(View.MISSION);
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
    const congrats = isTiny ? "Good job! Tap the gift box." : "Awesome job! Tap the gift box... What's inside?";
    setTimeout(() => {
        speak('mission_complete', congrats);
    }, 500);
  };

  const handleOpenGift = () => {
    setIsGiftOpen(true);
    playSoundEffect('sparkle');
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
    });
    const reveal = isTiny ? `Look! You got a sticker!` : `Wow! You got the ${currentMission?.title} sticker!`;
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

  const renderBackground = () => (
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

  const renderSplash = () => (
    <div className="flex flex-col items-center justify-center h-full w-full relative z-10 p-4 cursor-pointer" onClick={handleStart}>
       <div className="bg-white/90 backdrop-blur-sm p-6 sm:p-12 rounded-[2rem] sm:rounded-[3rem] shadow-toy-xl border-4 sm:border-8 border-lego-yellow flex flex-col items-center gap-4 sm:gap-8 max-w-lg w-full animate-float">
          <Mascot emotion="excited" size={160} />
          <div className="text-center">
             <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-lego-blue mb-1 tracking-tight">LEGO BUILD</h1>
             <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-lego-red tracking-wide">ADVENTURE</h2>
          </div>
          <div className="bg-lego-green text-white text-xl sm:text-3xl font-bold px-8 sm:px-12 py-3 sm:py-4 rounded-full shadow-toy animate-pulse">
             Tap to Play!
          </div>
       </div>
    </div>
  );

  const renderLevelSelect = () => (
    <div className="flex flex-col items-center justify-center h-full w-full relative z-10 p-4 gap-6 sm:gap-12">
        <motion.h2 className="text-2xl sm:text-4xl font-black text-lego-blue bg-white/90 px-8 py-3 sm:py-5 rounded-full shadow-toy-lg border-2 sm:border-4 border-white text-center">
          Who is playing?
        </motion.h2>
        
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 lg:gap-16 items-center w-full max-w-4xl px-4">
            <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleLevelSelect(UserLevel.ADVENTURE)}
                className="bg-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[3rem] shadow-toy-xl border-b-8 border-lego-blue flex flex-row sm:flex-col items-center gap-4 sm:gap-6 w-full sm:w-1/2"
            >
                <div className="bg-blue-100 p-4 sm:p-8 rounded-full">
                    <Blocks size={48} className="text-lego-blue sm:w-20 sm:h-20" />
                </div>
                <div className="text-left sm:text-center">
                    <h3 className="text-xl sm:text-3xl font-bold text-gray-800">Big Builder</h3>
                    <p className="text-lego-blue font-bold text-lg">Age 6+</p>
                </div>
            </motion.button>

            <motion.button 
                 whileHover={{ scale: 1.02 }}
                 whileTap={{ scale: 0.98 }}
                 onClick={() => handleLevelSelect(UserLevel.TINY)}
                 className="bg-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[3rem] shadow-toy-xl border-b-8 border-lego-green flex flex-row sm:flex-col items-center gap-4 sm:gap-6 w-full sm:w-1/2"
            >
                 <div className="bg-green-100 p-4 sm:p-8 rounded-full">
                    <Baby size={48} className="text-lego-green sm:w-20 sm:h-20" />
                </div>
                <div className="text-left sm:text-center">
                    <h3 className="text-xl sm:text-3xl font-bold text-gray-800">Tiny Builder</h3>
                    <p className="text-lego-green font-bold text-lg">Age 2+</p>
                </div>
            </motion.button>
        </div>
    </div>
  );

  const renderHome = () => {
    const relevantCompleted = completedMissions.filter(id => AVAILABLE_MISSIONS.some(m => m.id === id));
    const stickerCount = relevantCompleted.length;

    return (
      <div className="flex flex-col h-full relative z-10 p-4 sm:p-6">
         <div className="flex justify-between items-start mb-4 sm:mb-6 shrink-0">
            <motion.button 
              whileTap={{ scale: 0.9 }} 
              onClick={() => setView(View.LEVEL_SELECT)}
              className="bg-white rounded-2xl p-3 sm:p-4 shadow-toy border-2 border-white text-lego-blue"
            >
              <ArrowLeft size={24} sm:size={32} strokeWidth={3} />
            </motion.button>

            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={() => { playSoundEffect('pop'); navigateTo(View.STICKER_BOOK); speak('sticker_book_intro', "Sticker Book! Look at your collection."); }}
              className="bg-white rounded-full p-1.5 pr-4 sm:pr-6 shadow-toy-lg border-2 sm:border-4 border-white flex items-center gap-2 sm:gap-4 group"
            >
               <div className="bg-lego-yellow p-2 sm:p-3 rounded-full text-white shadow-sm">
                 <Star size={24} sm:size={32} fill="currentColor" />
               </div>
               <div className="flex flex-col items-start leading-none">
                 <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase">Stickers</span>
                 <span className="text-xl sm:text-3xl font-black text-gray-800">{stickerCount}</span>
               </div>
            </motion.button>
         </div>

         <div className="flex-1 flex items-start sm:items-center min-h-0">
            <div className="hidden lg:flex flex-col items-center justify-end h-full pb-12 w-64 shrink-0">
               <div className="bg-white p-6 rounded-3xl rounded-bl-none shadow-xl mb-4 relative border-2 border-gray-100">
                 <p className="font-bold text-gray-700 text-xl text-center leading-tight">Pick a world!</p>
                 <div className="absolute -bottom-3 left-8 w-6 h-6 bg-white rotate-45 border-r-2 border-b-2 border-gray-100"></div>
               </div>
               <Mascot emotion={isMascotTalking ? 'talking' : 'happy'} size={150} />
            </div>

            <div className="flex-1 h-full overflow-y-auto px-2 pb-10">
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 auto-rows-fr max-w-5xl mx-auto">
                 {WORLDS.map((world) => {
                   const isLocked = isTiny ? false : stickerCount < world.unlockCount;
                   return <WorldCard key={world.id} world={world} isLocked={isLocked} onClick={() => handleWorldSelect(world.id, isLocked)} />;
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
      <div className="flex flex-col h-full relative z-10 p-4 sm:p-6">
        <div className="flex items-center gap-4 sm:gap-6 mb-4 sm:mb-8">
          <motion.button whileTap={{ scale: 0.9 }} onClick={goHome} className="bg-white p-3 sm:p-4 rounded-2xl shadow-toy text-gray-500 border-2 border-white">
            <Home size={24} sm:size={32} strokeWidth={3} />
          </motion.button>
          <div className="bg-white/90 backdrop-blur-md px-6 sm:px-10 py-3 rounded-2xl sm:rounded-3xl shadow-toy flex-1 text-center border-2 sm:border-4 border-white">
             <h2 className={`text-xl sm:text-3xl font-black ${world.color.replace('bg-', 'text-')} uppercase tracking-tight truncate`}>{world.name}</h2>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-10">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto">
            {missions.map((mission, index) => (
              <motion.div
                key={mission.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleMissionStart(mission)}
                className={`group relative bg-white rounded-2xl sm:rounded-[2rem] p-3 sm:p-4 flex flex-col items-center gap-2 sm:gap-4 shadow-card border-4 ${completedMissions.includes(mission.id) ? 'border-lego-green' : 'border-transparent'}`}
              >
                 {completedMissions.includes(mission.id) && (
                   <div className="absolute -top-2 -right-2 bg-lego-green text-white p-1 rounded-full shadow-lg z-10 border-2 border-white">
                     <Check size={20} sm:size={24} strokeWidth={4} />
                   </div>
                 )}
                 <div className={`${mission.color} p-4 sm:p-6 rounded-xl sm:rounded-2xl w-full aspect-square flex items-center justify-center text-white shadow-inner`}>
                   <IconHelper name={mission.iconName} size={isTiny ? 64 : 48} />
                 </div>
                 <span className={`${isTiny ? 'text-lg sm:text-2xl' : 'text-sm sm:text-xl'} font-bold text-center text-gray-700 leading-tight truncate w-full`}>{mission.title}</span>
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
      <div className="flex flex-col lg:flex-row h-full relative z-10 p-4 sm:p-6 gap-4 sm:gap-8 overflow-y-auto lg:overflow-hidden">
         <div className="w-full lg:w-1/3 flex flex-col shrink-0">
            <motion.button whileTap={{ scale: 0.9 }} onClick={goBack} className="self-start bg-white p-3 sm:p-4 rounded-2xl shadow-toy text-gray-500 mb-4 sm:mb-6 border-2 border-white">
              <ArrowLeft size={24} sm:size={32} strokeWidth={3} />
            </motion.button>
            <div className="flex flex-col items-center bg-white/90 backdrop-blur-md rounded-3xl p-4 sm:p-6 shadow-xl border-2 sm:border-4 border-white/50">
               <div className="flex flex-row lg:flex-col items-center gap-4 sm:gap-6 w-full">
                  <Mascot emotion={isMascotTalking ? 'talking' : 'happy'} size={isTiny ? 100 : 140} />
                  <div className="flex-1 lg:w-full bg-blue-50 p-4 sm:p-6 rounded-2xl border-2 border-blue-100 text-center">
                    <p className="text-lg sm:text-2xl font-bold text-gray-800 leading-tight">"{currentMission.voicePrompt}"</p>
                  </div>
               </div>
               <motion.button 
                  whileTap={{ scale: 0.95 }}
                  onClick={() => speak(currentMission.audioKey, currentMission.audioScript || currentMission.voicePrompt)}
                  className="w-full mt-4 sm:mt-6 bg-white text-lego-blue rounded-xl p-3 sm:p-4 shadow-toy flex items-center justify-center gap-2 font-bold border-2 border-blue-100"
                >
                  <Ear size={20} sm:size={24} /> Hear Again
               </motion.button>
            </div>
         </div>

         <div className="flex-1 flex flex-col items-center justify-center gap-6 sm:gap-12 min-h-[300px]">
            <motion.div 
               initial={{ scale: 0.8 }} animate={{ scale: 1 }}
               className={`${currentMission.color} w-48 sm:w-64 lg:h-[45vh] lg:w-auto aspect-square rounded-full flex items-center justify-center shadow-toy-xl border-8 sm:border-[12px] border-white relative`}
            >
               <IconHelper name={currentMission.iconName} size={isTiny ? 100 : 120} className="text-white drop-shadow-2xl" />
               <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[85%] h-[35%] bg-gradient-to-b from-white/30 to-transparent rounded-t-full" />
            </motion.div>
            <div className="w-full max-w-sm">
              <BigButton onClick={handleMissionComplete} color="bg-lego-green" className="text-xl sm:text-3xl py-4 sm:py-8">
                <Check size={32} sm:size={48} strokeWidth={4} /> Done!
              </BigButton>
            </div>
         </div>
      </div>
    );
  };

  const renderCelebration = () => (
    <div className="flex flex-col h-full items-center justify-center relative z-10 p-6">
      <div className="absolute top-4 sm:top-8 right-4 sm:right-8 z-50">
         <motion.button whileTap={{ scale: 0.9 }} onClick={goHome} className="bg-white p-3 rounded-xl shadow-toy text-lego-blue border-2 border-white">
           <Home size={28} />
         </motion.button>
      </div>
      {!isGiftOpen ? (
        <div className="flex flex-col items-center gap-6 sm:gap-10">
          <motion.button onClick={handleOpenGift} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="relative group">
             <div className="bg-lego-yellow p-8 sm:p-16 rounded-[2rem] sm:rounded-[3rem] shadow-toy-xl border-4 sm:border-8 border-white animate-bounce-slow">
               <Gift size={80} sm:size={140} className="text-lego-red" strokeWidth={1.5} />
             </div>
             <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white px-6 py-2 rounded-full shadow-lg border-2 border-gray-100">
                <span className="text-xl sm:text-3xl font-black text-lego-blue">TAP ME!</span>
             </div>
          </motion.button>
          <Mascot emotion="excited" size={120} />
        </div>
      ) : (
        <div className="flex flex-col items-center w-full max-w-2xl relative">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute -z-10 text-white opacity-20"><Sun size={500} /></motion.div>
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white/95 backdrop-blur-xl p-6 sm:p-10 rounded-[2.5rem] shadow-2xl flex flex-col items-center gap-6 border-4 sm:border-8 border-white w-full">
             <h1 className="text-4xl sm:text-6xl font-black text-lego-yellow">WAHOO!</h1>
             <div className="scale-75 sm:scale-110"><Sticker iconName={currentMission?.iconName || 'Star'} color={currentMission?.color || 'bg-lego-blue'} size="lg" /></div>
             <p className="text-lg sm:text-2xl text-gray-600 font-bold text-center">New Sticker Added!</p>
             <div className="flex gap-4 w-full mt-2">
               <BigButton onClick={() => navigateTo(View.STICKER_BOOK)} color="bg-lego-purple" className="py-4 text-xl">My Collection</BigButton>
               <BigButton onClick={() => navigateTo(View.MISSION_SELECT)} color="bg-lego-blue" className="py-4 text-xl">Play More</BigButton>
             </div>
          </motion.div>
        </div>
      )}
    </div>
  );

  const renderStickerBook = () => {
    const relevantCompleted = completedMissions.filter(id => AVAILABLE_MISSIONS.some(m => m.id === id));
    return (
      <div className="flex flex-col h-full relative z-10 p-4 sm:p-6 bg-orange-100 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
           <div className="flex items-center gap-3">
              <motion.button whileTap={{ scale: 0.9 }} onClick={goHome} className="bg-white p-3 rounded-xl shadow-toy text-lego-blue border-2 border-gray-100"><Home size={24} /></motion.button>
              <div className="bg-white px-4 py-2 rounded-xl shadow-toy border-2 border-gray-100"><h2 className="text-lg sm:text-2xl font-black text-lego-purple">MY COLLECTION</h2></div>
           </div>
           <motion.button whileTap={{ scale: 0.9 }} onClick={handleReset} className="bg-white p-3 rounded-xl shadow-sm text-red-300 border-2 border-gray-100"><Trash2 size={24} /></motion.button>
        </div>
        <div className="flex-1 bg-white rounded-3xl shadow-inner p-4 sm:p-10 overflow-y-auto border-4 sm:border-8 border-indigo-100 relative">
           <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 sm:gap-8">
              {AVAILABLE_MISSIONS.map(mission => (
                 <div key={mission.id} className="flex flex-col items-center gap-2">
                    <Sticker iconName={mission.iconName} color={mission.color} locked={!relevantCompleted.includes(mission.id)} size="sm" />
                    <span className="text-[10px] sm:text-xs font-bold text-gray-400 text-center truncate w-full">{mission.title}</span>
                 </div>
              ))}
           </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full w-full font-sans overflow-hidden bg-gray-900 relative">
      {renderBackground()}
      <AnimatePresence mode="wait">
        <motion.div key={view} variants={pageVariants} initial="initial" animate="animate" exit="exit" className="h-full w-full max-w-7xl mx-auto">
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