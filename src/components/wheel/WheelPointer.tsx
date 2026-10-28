import React from "react";

interface WheelPointerProps {
  isSpinning?: boolean;
}

export const WheelPointer: React.FC<WheelPointerProps> = ({ isSpinning }) => {
  return (
    <div
      className="absolute top-[-10px] left-1/2 -translate-x-1/2 z-30 pointer-events-none drop-shadow-[0_8px_16px_rgba(249,115,22,0.6)]"
      style={{
        transformOrigin: "50% 15%",
      }}
    >
      <svg
        width="44"
        height="56"
        viewBox="0 0 44 56"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`transition-transform duration-75 ${
          isSpinning ? "animate-wiggle" : ""
        }`}
      >
        <defs>
          {/* Gradiente Branco / Dourado Refinado do Ponteiro */}
          <linearGradient id="pointerGrad" x1="22" y1="0" x2="22" y2="56" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="60%" stopColor="#F8FAFC" />
            <stop offset="100%" stopColor="#FB923C" />
          </linearGradient>

          {/* Sombra de corte interno */}
          <filter id="pointerShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.5" />
          </filter>
        </defs>

        {/* Borda Externa Laranja Brilhante */}
        <polygon
          points="22,54 4,6 40,6"
          stroke="#EA580C"
          strokeWidth="3.5"
          fill="url(#pointerGrad)"
          strokeLinejoin="round"
          filter="url(#pointerShadow)"
        />

        {/* Detalhe interno de fixador circular */}
        <circle cx="22" cy="14" r="5" fill="#171717" stroke="#EA580C" strokeWidth="2" />
        <circle cx="22" cy="14" r="2" fill="#F97316" />
      </svg>
    </div>
  );
};
