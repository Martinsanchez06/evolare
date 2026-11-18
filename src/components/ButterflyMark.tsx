import React from 'react';

interface ButterflyMarkProps {
  className?: string;
}

/**
 * Ilustración SVG minimalista de trazo fino inspirada en la mariposa de Evolare Nail Studio.
 */
export const ButterflyMark: React.FC<ButterflyMarkProps> = ({ className = 'w-8 h-8' }) => (
  <svg
    viewBox="0 0 64 56"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Ala superior izquierda */}
    <path
      d="M29 29C22 17 11 10 6 14C2 17 5 29 14 33C19 35 25 33 29 29Z"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Ala superior derecha */}
    <path
      d="M35 29C42 17 53 10 58 14C62 17 59 29 50 33C45 35 39 33 35 29Z"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Ala inferior izquierda */}
    <path
      d="M29 31C23 33 14 38 15 45C16 49 23 48 27 42C29 39 30 34 29 31Z"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Ala inferior derecha */}
    <path
      d="M35 31C41 33 50 38 49 45C48 49 41 48 37 42C35 39 34 34 35 31Z"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Nervaduras sutiles */}
    <path
      d="M27 27C21 21 15 18 11 18M37 27C43 21 49 18 53 18"
      stroke="currentColor"
      strokeWidth="0.9"
      strokeLinecap="round"
      opacity="0.55"
    />
    {/* Cuerpo central */}
    <path
      d="M32 22V44"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    {/* Antenas */}
    <path
      d="M32 22C30.5 16 28 13 25.5 12M32 22C33.5 16 36 13 38.5 12"
      stroke="currentColor"
      strokeWidth="1.15"
      strokeLinecap="round"
    />
  </svg>
);

export const EvolareWordmark: React.FC<{ compact?: boolean }> = ({ compact = false }) => (
  <div className="inline-flex items-center gap-2.5 text-[#2B1D14] min-w-0">
    <ButterflyMark className={compact ? 'w-7 h-7 shrink-0' : 'w-9 h-9 shrink-0'} />
    <div className="flex flex-col leading-none min-w-0">
      <span
        className={`font-serif tracking-[0.22em] font-medium uppercase ${
          compact ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'
        }`}
      >
        EVOLARE
      </span>
      <span className="text-[10px] tracking-[0.28em] uppercase text-[#2B1D14]/70 mt-0.5">
        NAIL STUDIO
      </span>
    </div>
  </div>
);
