import { GoogleGenAI, Modality } from "@google/genai";

// Cache versioning for robust updates
const CACHE_NAME = 'lego-tts-v9-puck'; 

let audioContext: AudioContext | null = null;
let currentSource: AudioBufferSourceNode | null = null;
let currentPlaybackId = 0;
let currentResolve: ((value: void | PromiseLike<void>) => void) | null = null;

const preloadQueue: string[] = [];
let isProcessingQueue = false;
let isRateLimited = false;
const RATE_LIMIT_COOLDOWN = 60000;
const PRELOAD_DELAY = 2500;

const pendingFetches = new Map<string, Promise<Uint8Array | null>>();

const getAudioContext = () => {
  if (!audioContext) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioContext = new AudioContextClass({ sampleRate: 24000 });
  }
  return audioContext;
};

function decode(base64: string): Uint8Array {
  try {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  } catch (e) {
    console.error("Base64 decode failed", e);
    return new Uint8Array(0);
  }
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

  if (currentResolve) {
      currentResolve();
      currentResolve = null;
  }

  if (currentSource) {
    try {
      currentSource.stop();
      currentSource.disconnect();
    } catch (e) { /* ignore */ }
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
      const preferredVoice = voices.find(v => v.lang.startsWith('en-US'));

      if (preferredVoice) utterance.voice = preferredVoice;
      utterance.rate = rate; 
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      window.speechSynthesis.speak(utterance);
  });
};

const getCacheKey = (text: string) => {
    return `https://tts-cache.local/v9/${encodeURIComponent(text.slice(0, 32))}-${text.length}`;
};

async function getAudioData(text: string): Promise<Uint8Array | null> {
    const cacheKey = getCacheKey(text);

    if ('caches' in window) {
        try {
            const cache = await caches.open(CACHE_NAME);
            const response = await cache.match(cacheKey);
            if (response) {
                const blob = await response.blob();
                return new Uint8Array(await blob.arrayBuffer());
            }
        } catch(e) { console.warn("Cache read failed", e); }
    }

    if (pendingFetches.has(cacheKey)) return pendingFetches.get(cacheKey)!;
    if (isRateLimited) return null;

    try {
        const apiKey = (window as any).process?.env?.API_KEY || "";
        if (!apiKey) {
          console.warn("API_KEY missing - using fallback TTS");
          return null;
        }

        const ai = new GoogleGenAI({ apiKey });
        const fetchPromise = (async () => {
            try {
                const response = await ai.models.generateContent({
                    model: "gemini-2.5-flash-preview-tts",
                    contents: [{ parts: [{ text: text }] }],
                    config: {
                      responseModalities: [Modality.AUDIO],
                      speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } },
                      },
                    },
                });

                const base64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
                if (base64) {
                    const audioData = decode(base64);
                    if ('caches' in window) {
                        const cache = await caches.open(CACHE_NAME);
                        cache.put(cacheKey, new Response(new Blob([audioData])));
                    }
                    return audioData;
                }
            } catch (e: any) {
                if (e?.toString().includes('429')) {
                     isRateLimited = true;
                     setTimeout(() => isRateLimited = false, RATE_LIMIT_COOLDOWN);
                }
            }
            return null;
        })();

        pendingFetches.set(cacheKey, fetchPromise);
        try { return await fetchPromise; } finally { pendingFetches.delete(cacheKey); }
    } catch (err) {
        return null;
    }
}

const processPreloadQueue = async () => {
    if (isProcessingQueue) return;
    isProcessingQueue = true;
    while (preloadQueue.length > 0) {
        if (isRateLimited) { preloadQueue.length = 0; break; }
        const text = preloadQueue.shift()!;
        await getAudioData(text);
        await new Promise(r => setTimeout(r, PRELOAD_DELAY));
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

export const playAudio = async (key: string, text: string, rate: number = 1.0): Promise<void> => {
  stopSpeaking();
  const myPlaybackId = currentPlaybackId;
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') await ctx.resume().catch(() => {});

  return new Promise<void>(async (resolve) => {
      currentResolve = resolve;
      try {
         const audioData = await getAudioData(text);
         if (currentPlaybackId !== myPlaybackId) return resolve();

         if (audioData) {
             const buffer = await decodePCM(audioData, ctx);
             if (currentPlaybackId !== myPlaybackId) return resolve();

             const source = ctx.createBufferSource();
             source.buffer = buffer;
             source.playbackRate.value = rate;
             source.connect(ctx.destination);
             source.start();
             currentSource = source;
             source.onended = () => {
                 if (currentPlaybackId === myPlaybackId) resolve();
             };
             return;
         }
      } catch (e) { console.error("Playback failed", e); }

      if (currentPlaybackId === myPlaybackId) {
          await speakTextFallback(text, rate);
          resolve();
      } else resolve();
  });
};

export const playSoundEffect = (type: 'click' | 'success' | 'pop' | 'sparkle') => {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    
    if (type === 'success') {
      const now = ctx.currentTime;
      const freqs = [523.25, 659.25, 783.99, 1046.50];
      freqs.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(f, now + i * 0.1);
        gain.gain.setValueAtTime(0.2, now + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.4);
      });
    } else {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.setValueAtTime(type === 'click' ? 300 : type === 'pop' ? 800 : 1200, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    }
};