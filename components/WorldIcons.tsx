import React from 'react';

// Shared SVG props
interface IconProps {
  className?: string;
  size?: number;
}

export const VehicleIcon: React.FC<IconProps> = ({ className, size = 64 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Car Body */}
    <path d="M10,60 L20,40 L80,40 L90,60 L90,80 L10,80 Z" fill="#EF4444" stroke="#B91C1C" strokeWidth="2" />
    <path d="M25,40 L35,25 L65,25 L75,40 Z" fill="#60A5FA" stroke="#2563EB" strokeWidth="2" />
    {/* Wheels */}
    <circle cx="25" cy="80" r="10" fill="#111" stroke="#333" strokeWidth="2" />
    <circle cx="25" cy="80" r="4" fill="#DDD" />
    <circle cx="75" cy="80" r="10" fill="#111" stroke="#333" strokeWidth="2" />
    <circle cx="75" cy="80" r="4" fill="#DDD" />
    {/* Spoiler */}
    <rect x="5" y="50" width="10" height="10" fill="#B91C1C" />
  </svg>
);

export const DinoIcon: React.FC<IconProps> = ({ className, size = 64 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Head */}
    <path d="M30,80 Q20,50 40,30 Q60,10 90,20 Q95,40 80,50 L60,50 L60,60 Q80,70 80,90 L30,90 Z" fill="#4ADE80" stroke="#15803D" strokeWidth="2" />
    {/* Eye */}
    <circle cx="60" cy="35" r="4" fill="white" />
    <circle cx="62" cy="35" r="2" fill="black" />
    {/* Teeth */}
    <path d="M60,50 L62,55 L64,50 L66,55 L68,50" stroke="white" strokeWidth="2" fill="white" />
    {/* Spots */}
    <circle cx="40" cy="60" r="3" fill="#15803D" opacity="0.5" />
    <circle cx="50" cy="70" r="2" fill="#15803D" opacity="0.5" />
  </svg>
);

export const CastleIcon: React.FC<IconProps> = ({ className, size = 64 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
     {/* Tower */}
     <rect x="30" y="40" width="40" height="50" fill="#A8A29E" stroke="#57534E" strokeWidth="2" />
     {/* Top */}
     <rect x="25" y="25" width="50" height="15" fill="#A8A29E" stroke="#57534E" strokeWidth="2" />
     {/* Battlements */}
     <rect x="28" y="15" width="8" height="10" fill="#A8A29E" stroke="#57534E" strokeWidth="2" />
     <rect x="46" y="15" width="8" height="10" fill="#A8A29E" stroke="#57534E" strokeWidth="2" />
     <rect x="64" y="15" width="8" height="10" fill="#A8A29E" stroke="#57534E" strokeWidth="2" />
     {/* Door */}
     <path d="M40,90 L40,65 Q50,55 60,65 L60,90 Z" fill="#451A03" />
     {/* Flag */}
     <path d="M50,15 L50,5 L70,5 L50,15" fill="#DC2626" />
  </svg>
);

export const LavaIcon: React.FC<IconProps> = ({ className, size = 64 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Mountain */}
    <path d="M20,90 L50,20 L80,90 Z" fill="#57534E" stroke="#292524" strokeWidth="2" />
    {/* Snow/Lava Cap */}
    <path d="M50,20 L60,45 Q50,40 40,45 Z" fill="#EF4444" />
    {/* Lava Flow */}
    <path d="M50,20 Q50,60 55,90" stroke="#EF4444" strokeWidth="4" strokeLinecap="round" />
    <path d="M48,25 Q40,60 45,90" stroke="#F97316" strokeWidth="3" strokeLinecap="round" />
    {/* Eruption */}
    <circle cx="50" cy="15" r="3" fill="#F97316" />
    <circle cx="55" cy="10" r="2" fill="#EF4444" />
  </svg>
);

export const SpaceIcon: React.FC<IconProps> = ({ className, size = 64 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Rocket Body */}
    <ellipse cx="50" cy="50" rx="15" ry="35" fill="#E2E8F0" stroke="#475569" strokeWidth="2" />
    {/* Window */}
    <circle cx="50" cy="40" r="8" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="2" />
    {/* Fins */}
    <path d="M35,70 L20,90 L40,80 Z" fill="#DC2626" stroke="#991B1B" strokeWidth="2" />
    <path d="M65,70 L80,90 L60,80 Z" fill="#DC2626" stroke="#991B1B" strokeWidth="2" />
    {/* Flame */}
    <path d="M45,85 L50,100 L55,85 Z" fill="#F59E0B" />
  </svg>
);