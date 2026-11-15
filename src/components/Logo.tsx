import React from 'react';

interface LogoProps {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  showDescriptor?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'dark',
  size = 'md',
  showDescriptor = false,
  className = '',
}) => {
  const isLight = variant === 'light';

  // Sizing definitions
  const symbolDimensions = {
    sm: { w: 30, h: 30 },
    md: { w: 38, h: 38 },
    lg: { w: 48, h: 48 },
  }[size];

  const brandTextSize = {
    sm: 'text-lg tracking-[0.16em]',
    md: 'text-2xl tracking-[0.18em]',
    lg: 'text-3xl tracking-[0.2em]',
  }[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Minimalist Symbol: Cordillera + Sendero + Estilizada 'S' */}
      <svg
        width={symbolDimensions.w}
        height={symbolDimensions.h}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform group-hover:scale-105 duration-300"
        aria-hidden="true"
      >
        {/* Background shield/pod */}
        <rect
          width="48"
          height="48"
          rx="12"
          fill={isLight ? '#FAF8F5' : '#142B1F'}
          stroke={isLight ? 'rgba(255,255,255,0.2)' : 'rgba(20,43,31,0.1)'}
          strokeWidth="1"
        />

        {/* Back mountain ridge in glacial blue tone */}
        <path
          d="M23 13L35 32H16L23 13Z"
          fill={isLight ? '#3A829E' : '#2D6B82'}
          fillOpacity={isLight ? '0.7' : '0.6'}
        />

        {/* Front mountain peak in deep forest tone */}
        <path
          d="M14 18L26 33H7L14 18Z"
          fill={isLight ? '#1B4D36' : '#22553C'}
        />

        {/* Ridge crest highlight */}
        <path
          d="M14 18L19 25L26 33"
          stroke={isLight ? '#EBF5FB' : '#A2D2DF'}
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Winding mountain path forming the stylized 'S' in warm Patagonia sand */}
        <path
          d="M18.5 14.5C25 14 31.5 17 31 22C30.5 27 18 24.5 17.5 30.5C17 35 23.5 36.5 30 35"
          stroke="#D4A373"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Summit apex accent point */}
        <circle cx="23" cy="11.5" r="1.5" fill="#D4A373" />
      </svg>

      {/* Typographic logotype */}
      <div className="flex flex-col justify-center text-left">
        <span
          className={`font-serif font-bold uppercase transition-colors leading-none ${brandTextSize} ${
            isLight ? 'text-white' : 'text-[#142B1F]'
          }`}
        >
          SURARIO
        </span>
        {showDescriptor && (
          <span
            className={`text-[9.5px] uppercase tracking-[0.18em] font-medium mt-1 leading-tight ${
              isLight ? 'text-stone-300' : 'text-stone-500'
            }`}
          >
            Guía de la Patagonia
          </span>
        )}
      </div>
    </div>
  );
};
