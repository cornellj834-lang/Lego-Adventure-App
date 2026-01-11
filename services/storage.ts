import { UserState, UserLevel } from '../types.ts';

const STORAGE_KEY = 'lego_adventure_save_v3';

const DEFAULT_STATE: UserState = {
  completedMissions: [],
  currentWorld: null,
  level: UserLevel.ADVENTURE // Default to normal mode
};

export const loadProgress = (): UserState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return DEFAULT_STATE;
    
    const parsed = JSON.parse(saved);
    return {
      ...DEFAULT_STATE,
      ...parsed,
      // Ensure arrays are initialized if missing in saved data
      completedMissions: parsed.completedMissions || [],
      // Default level if upgrading from v1/v2 save
      level: parsed.level || UserLevel.ADVENTURE
    };
  } catch (e) {
    console.error("Failed to load progress", e);
    return DEFAULT_STATE;
  }
};

export const saveProgress = (completedMissions: string[], level: UserLevel) => {
  try {
    const current = loadProgress();
    const newState: UserState = {
      ...current,
      completedMissions,
      level
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  } catch (e) {
    console.error("Failed to save progress", e);
  }
};

export const resetProgress = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error("Failed to reset progress", e);
  }
};