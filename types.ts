import { LucideIcon } from 'lucide-react';

export enum WorldType {
  VEHICLE = 'VEHICLE',
  DINO = 'DINO',
  CASTLE = 'CASTLE',
  LAVA = 'LAVA',
  SPACE = 'SPACE',
}

export enum UserLevel {
  ADVENTURE = 'ADVENTURE', // 6yo
  TINY = 'TINY',           // 2yo
}

export interface Mission {
  id: string;
  title: string;
  voicePrompt: string; // Text displayed
  audioScript?: string; // Text spoken/sung (if different from display)
  audioKey: string; // Filename reference
  iconName: string; 
  color: string;
  world: WorldType;
}

export interface World {
  id: WorldType;
  name: string;
  color: string;
  iconName: string;
  voiceIntro: string; // Fallback text
  audioKey: string; // Filename reference
  unlockCount: number; // Number of stickers needed to unlock
}

export interface UserState {
  completedMissions: string[]; // Mission IDs
  currentWorld: WorldType | null;
  level: UserLevel;
}