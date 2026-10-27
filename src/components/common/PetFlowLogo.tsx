import React from 'react';

interface PetFlowLogoProps {
  className?: string;
  size?: number;
  showName?: boolean;
}

export const PetFlowLogo: React.FC<PetFlowLogoProps> = ({ className = 'w-8 h-8', size = 32, showName = true }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background circle badge with subtle gradient */}
      <defs>
        <linearGradient id="petflowLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E4B82" />
          <stop offset="100%" stopColor="#0F2847" />
        </linearGradient>
        <linearGradient id="dogFurGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id="catFurGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E2E8F0" />
          <stop offset="100%" stopColor="#94A3B8" />
        </linearGradient>
      </defs>

      {/* Rounded Soft Background */}
      <rect width="64" height="64" rx="20" fill="url(#petflowLogoGrad)" />

      {/* Heart / Paw aura in background */}
      <path
        d="M32 50C24 43 14 34 14 24C14 17.5 19 13 25 13C28.5 13 31.5 14.8 32 16.5C32.5 14.8 35.5 13 39 13C45 13 50 17.5 50 24C50 34 40 43 32 50Z"
        fill="white"
        fillOpacity="0.08"
      />

      {/* DOG HEAD (Left side) */}
      <g id="dog">
        {/* Floppy ear left */}
        <path
          d="M17 21C14 25 13 34 18 36C20 37 22 34 22 30L21 23C21 21 18 19 17 21Z"
          fill="#B45309"
        />
        {/* Dog head base */}
        <path
          d="M20 25C20 18 26 18 30 20C32 21 34 23 34 27C34 35 28 42 22 40C19 39 18 35 18 31C18 28 20 26 20 25Z"
          fill="url(#dogFurGrad)"
        />
        {/* Dog snout */}
        <ellipse cx="27" cy="33" rx="5" ry="4" fill="#FDE68A" />
        <ellipse cx="27" cy="31.5" rx="2" ry="1.4" fill="#78350F" />
        {/* Dog eye */}
        <circle cx="25" cy="25" r="1.5" fill="#451A03" />
        <circle cx="25.5" cy="24.5" r="0.5" fill="white" />
      </g>

      {/* CAT HEAD (Right side, snuggled next to dog) */}
      <g id="cat">
        {/* Cat Pointy Ear Right */}
        <path
          d="M45 18L49 26C49 26 44 26 42 24L45 18Z"
          fill="#64748B"
        />
        <path
          d="M44.5 20L47.5 25C47.5 25 44 25 42.5 23.5L44.5 20Z"
          fill="#F472B6"
        />
        {/* Cat Pointy Ear Left */}
        <path
          d="M34 19L38 25C38 25 35 26 33 24L34 19Z"
          fill="#64748B"
        />
        {/* Cat head base */}
        <circle cx="41" cy="30" r="9" fill="url(#catFurGrad)" />
        {/* Cat muzzle */}
        <ellipse cx="41" cy="33.5" rx="3.5" ry="2.5" fill="white" />
        {/* Cat nose */}
        <path d="M40 33L42 33L41 34.2Z" fill="#F472B6" />
        {/* Cat eyes */}
        <ellipse cx="38" cy="29" rx="1.3" ry="1.8" fill="#047857" />
        <circle cx="38.3" cy="28.5" r="0.5" fill="white" />
        <ellipse cx="44" cy="29" rx="1.3" ry="1.8" fill="#047857" />
        <circle cx="44.3" cy="28.5" r="0.5" fill="white" />
        {/* Cat whiskers */}
        <line x1="36" y1="33" x2="32" y2="32" stroke="#64748B" strokeWidth="0.8" strokeLinecap="round" />
        <line x1="36" y1="34" x2="32" y2="35" stroke="#64748B" strokeWidth="0.8" strokeLinecap="round" />
        <line x1="46" y1="33" x2="50" y2="32" stroke="#64748B" strokeWidth="0.8" strokeLinecap="round" />
        <line x1="46" y1="34" x2="50" y2="35" stroke="#64748B" strokeWidth="0.8" strokeLinecap="round" />
      </g>

      {/* Little Paw Print at bottom center */}
      <g id="paw" fill="#FBBF24">
        <circle cx="28" cy="46" r="1.5" />
        <circle cx="31.5" cy="44.5" r="1.5" />
        <circle cx="35" cy="45" r="1.5" />
        <path d="M29.5 48.5C29.5 47 33.5 47 33.5 48.5C33.5 50.5 32.5 51.5 31.5 51.5C30.5 51.5 29.5 50.5 29.5 48.5Z" />
      </g>
    </svg>
  );
};
