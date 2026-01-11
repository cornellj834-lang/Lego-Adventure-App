import { GoogleGenAI, Modality } from "@google/genai";

const CACHE_NAME = 'lego-tts-v8-puck'; // Incremented cache version

let audioContext: AudioContext | null = null;
let currentSource: AudioBufferSourceNode | null = null;
let currentPlaybackId = 0;
// Track the active resolve function to clean up promises if interrupted
let currentResolve: ((value: void | PromiseLike<void>) => void) | null = null;

// Queue for preloading to prevent rate limiting
const preloadQueue: string[] = [];
let isProcessingQueue = false;
let isRateLimited = false;
const RATE_LIMIT_COOLDOWN = 60000; // 1 minute cooldown if we hit 429
const PRELOAD_DELAY = 2500; // 2.5s delay to stay comfortably under standard RPM limits

// Map to track in-flight fetch requests to prevent duplicate API calls
const pendingFetches = new Map<string, Promise<Uint8Array | null>>();

const getAudioContext = () => {
  if (!audioContext) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioContext = new AudioContextClass({ sampleRate: 24000 });
  }
  return audioContext;
};

function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodePCM(
  data: Uint8Array,
  ctx: AudioContext
): Promise<AudioBuffer> {
  const sampleRate = 24000;
  const numChannels = 1;
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const initAudio = async () => {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }
};

export const stopSpeaking = () => {
  currentPlaybackId++; 

  // Resolve any pending play promise so awaiters don't hang
  if (currentResolve) {
      currentResolve();
      currentResolve = null;
  }

  if (currentSource) {
    try {
      currentSource.stop();
      currentSource.disconnect();
    } catch (e) {
      // ignore
    }
    currentSource = null;
  }
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};

const speakTextFallback = (text: string, rate: number = 0.9): Promise<void> => {
  return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) {
          resolve();
          return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      
      const preferredVoice = 
        voices.find(v => v.name.includes('Google US English')) || 
        voices.find(v => v.name.includes('Natural')) ||
        voices.find(v => v.name === 'Samantha') || 
        voices.find(v => v.name === 'Daniel') ||   
        voices.find(v => v.lang.startsWith('en-US'));

      if (preferredVoice) utterance.voice = preferredVoice;
      utterance.rate = rate; 
      utterance.pitch = 1.2; 
      
      utterance.onend = () => {
          resolve();
      };
      utterance.onerror = () => {
          resolve();
      }

      window.speechSynthesis.speak(utterance);
  });
};

const getCacheKey = (text: string) => {
    return `https://tts-cache.local/v7-puck/${encodeURIComponent(text.slice(0, 32))}-${text.length}`;
};

async function getAudioData(text: string, isPreload = false): Promise<Uint8Array | null> {
    const cacheKey = getCacheKey(text);

    // 1. Try Cache
    if ('caches' in window) {
        try {
            const cache = await caches.open(CACHE_NAME);
            const response = await cache.match(cacheKey);
            if (response) {
                const blob = await response.blob();
                const arrayBuffer = await blob.arrayBuffer();
                return new Uint8Array(arrayBuffer);
            }
        } catch(e) { console.warn("Cache read failed", e); }
    }

    // 2. Check in-flight requests (Deduplication)
    if (pendingFetches.has(cacheKey)) {
        return pendingFetches.get(cacheKey)!;
    }

    // If we are rate limited, skip API calls and return null (triggers fallback)
    if (isRateLimited) {
        return null;
    }

    // 3. Fetch from API
    // Initialize AI strictly using the environment variable right before use
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const fetchPromise = (async () => {
            try {
                const response = await ai.models.generateContent({
                    model: "gemini-2.5-flash-preview-tts",
                    contents: [{ parts: [{ text: text }] }],
                    config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Puck' }, 
                        },
                    },
                    },
                });

                const base64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
                if (base64) {
                    const audioData = decode(base64);
                    if ('caches' in window) {
                        const cache = await caches.open(CACHE_NAME);
                        const blob = new Blob([audioData], { type: 'application/octet-stream' });
                        cache.put(cacheKey, new Response(blob));
                    }
                    return audioData;
                }
            } catch (e: any) {
                const errMsg = e?.toString() || "";
                if (errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED')) {
                     console.warn("Quota exceeded (429). Switching to fallback voice for 60s.");
                     isRateLimited = true;
                     setTimeout(() => isRateLimited = false, RATE_LIMIT_COOLDOWN);
                } else {
                     console.error("Gemini API call failed", e);
                }
            }
            return null;
        })();

        pendingFetches.set(cacheKey, fetchPromise);
        
        try {
            return await fetchPromise;
        } finally {
            pendingFetches.delete(cacheKey);
        }
    } catch (err) {
        console.error("Failed to initialize GoogleGenAI", err);
        return null;
    }
}

// Queue Processor
const processPreloadQueue = async () => {
    if (isProcessingQueue) return;
    isProcessingQueue = true;

    while (preloadQueue.length > 0) {
        if (isRateLimited) {
            preloadQueue.length = 0; 
            break;
        }

        const text = preloadQueue[0];
        
        const startTime = Date.now();
        await getAudioData(text, true);
        const duration = Date.now() - startTime;

        if (duration > 100) {
            await new Promise(resolve => setTimeout(resolve, PRELOAD_DELAY));
        } else {
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        preloadQueue.shift(); 
    }

    isProcessingQueue = false;
};

export const preloadAudio = (text: string) => {
    if (isRateLimited) return;
    if (!preloadQueue.includes(text)) {
        preloadQueue.push(text);
        processPreloadQueue();
    }
};

/**
 * Plays audio and returns a Promise that resolves when playback completes.
 * @param key Unique key for the audio
 * @param text Text to speak/fetch
 * @param rate Playback rate (1.0 = normal, 0.85 = slower for toddlers)
 */
export const playAudio = async (key: string, text: string, rate: number = 1.0): Promise<void> => {
  stopSpeaking(); // Cleans up previous promise and stops audio
  
  const myPlaybackId = currentPlaybackId;
  const ctx = getAudioContext();

  if (ctx.state === 'suspended') {
      try { await ctx.resume(); } catch (e) { console.warn("Auto-resume failed", e); }
  }

  // Create a new promise for this playback session
  return new Promise<void>(async (resolve) => {
      currentResolve = resolve;

      try {
         // Start fetch immediately
         const audioDataPromise = getAudioData(text);
         const audioData = await audioDataPromise;

         if (currentPlaybackId !== myPlaybackId) {
             resolve(); // Interrupted
             return;
         }

         if (audioData) {
             const buffer = await decodePCM(audioData, ctx);
             
             if (currentPlaybackId !== myPlaybackId) {
                 resolve();
                 return;
             }

             const source = ctx.createBufferSource();
             source.buffer = buffer;
             source.playbackRate.value = rate; // Apply playback rate
             source.connect(ctx.destination);
             source.start();
             currentSource = source;
             
             source.onended = () => {
                 if (currentSource === source) {
                     currentSource = null;
                 }
                 if (currentPlaybackId === myPlaybackId) {
                    resolve();
                    currentResolve = null;
                 }
             };
             return;
         }

      } catch (e) {
          console.error("Playback failed", e);
      }

      // Fallback
      if (currentPlaybackId === myPlaybackId) {
          await speakTextFallback(text, rate);
          resolve();
          currentResolve = null;
      } else {
          resolve();
      }
  });
};

// --- SOUND EFFECTS ---

export const playSuccessSound = () => {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  
  const playNote = (freq: number, startTime: number, duration: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine'; 
    osc.frequency.value = freq;
    
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(startTime);
    osc.stop(startTime + duration);
  };

  const now = ctx.currentTime;
  playNote(523.25, now, 0.4);       // C5
  playNote(659.25, now + 0.1, 0.4); // E5
  playNote(783.99, now + 0.2, 0.4); // G5
  playNote(1046.50, now + 0.3, 0.8);// C6
};

const playPopSound = (ctx: AudioContext) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
};

const playSparkleSound = (ctx: AudioContext) => {
  const now = ctx.currentTime;
  const count = 5;
  for(let i=0; i<count; i++) {
     const osc = ctx.createOscillator();
     const gain = ctx.createGain();
     osc.type = 'triangle';
     osc.frequency.setValueAtTime(1000 + (i*200), now + (i*0.05));
     
     gain.gain.setValueAtTime(0.05, now + (i*0.05));
     gain.gain.linearRampToValueAtTime(0, now + (i*0.05) + 0.1);
     
     osc.connect(gain);
     gain.connect(ctx.destination);
     osc.start(now + (i*0.05));
     osc.stop(now + (i*0.05) + 0.1);
  }
};

const playClickSound = (ctx: AudioContext) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
};

export const playSoundEffect = (type: 'click' | 'success' | 'pop' | 'sparkle') => {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});

    switch (type) {
        case 'success':
            playSuccessSound();
            break;
        case 'click':
            playClickSound(ctx);
            break;
        case 'pop':
            playPopSound(ctx);
            break;
        case 'sparkle':
            playSparkleSound(ctx);
            break;
    }
};