"use client";

import React, { useMemo } from "react";
import { motion } from "motion/react";
import { WheelPointer } from "./WheelPointer";
import { WheelSegment } from "./WheelSegment";
import { calculateWheelGeometry, polarToCartesian } from "@/lib/wheel/geometry";
import { useWheelStore } from "@/store/useWheelStore";

interface PrizeWheelProps {
  onSpinClick?: () => void;
  targetRotation: number;
  onAnimationComplete?: () => void;
}

export const PrizeWheel: React.FC<PrizeWheelProps> = ({
  onSpinClick,
  targetRotation,
  onAnimationComplete,
}) => {
  const { prizes, status, winningPrize, settings } = useWheelStore();

  const activePrizes = useMemo(() => prizes.filter((p) => p.active), [prizes]);
  const segments = useMemo(
    () => calculateWheelGeometry(activePrizes, 255, 300),
    [activePrizes]
  );

  const isSpinning = status === "spinning";

  // Pontos luminosos / rebites no anel externo da roleta
  const pinCount = Math.max(16, activePrizes.length * 2);
  const rimPins = useMemo(() => {
    const pins = [];
    for (let i = 0; i < pinCount; i++) {
      const angle = (360 / pinCount) * i;
      const coords = polarToCartesian(300, 300, 276, angle);
      pins.push({ id: i, ...coords });
    }
    return pins;
  }, [pinCount]);

  const rotation = settings.orientationRotation || 0;
  const isRotated = rotation === 90 || rotation === 270;

  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      {/* Container da Roleta: proporções dinâmicas para estar sempre ao lado da personagem */}
      <div
        className={`relative flex items-center justify-center shrink-0 ${
          isRotated
            ? "w-[44vw] h-[44vw] max-w-[480px] max-h-[480px] min-w-[200px] min-h-[200px]"
            : "w-[56vw] h-[56vw] max-w-[280px] max-h-[280px] sm:w-[340px] sm:h-[340px] sm:max-w-[340px] md:w-[400px] md:h-[400px] md:max-w-[400px] lg:w-[460px] lg:h-[460px] lg:max-w-[460px] xl:w-[500px] xl:h-[500px] xl:max-w-[500px] 2xl:w-[540px] 2xl:h-[540px] 2xl:max-w-[540px]"
        }`}
      >
        {/* Glow Laranja Radiante de Fundo */}
        <div className="absolute inset-2 rounded-full bg-orange-600/25 blur-3xl -z-10 pointer-events-none" />

        {/* Ponteiro Fixo Superior (12h) */}
        <WheelPointer isSpinning={isSpinning} />

        {/* Disco Rotativo da Roleta Orquestrado com Motion */}
        <motion.div
          className="w-full h-full"
          animate={{ rotate: targetRotation }}
          transition={{
            duration: settings.spinDuration || 7,
            ease: [0.15, 0.95, 0.2, 1], // Desaceleração suave cinematográfica
          }}
          onAnimationComplete={onAnimationComplete}
          style={{ willChange: "transform" }}
        >
          <svg
            viewBox="0 0 600 600"
            className="w-full h-full drop-shadow-[0_15px_35px_rgba(234,88,12,0.18)]"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Aro Externo Laranja Radiante */}
              <linearGradient id="wheelRimGrad" x1="0" y1="0" x2="600" y2="600" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#EA580C" />
                <stop offset="35%" stopColor="#FF7A00" />
                <stop offset="70%" stopColor="#C2410C" />
                <stop offset="100%" stopColor="#EA580C" />
              </linearGradient>

              {/* Borda escura interna para profundidade */}
              <linearGradient id="innerRimShadow" x1="0" y1="0" x2="0" y2="600" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#0B0B0B" />
                <stop offset="100%" stopColor="#1C1C1C" />
              </linearGradient>
            </defs>

            {/* Aro Externo Principal */}
            <circle
              cx="300"
              cy="300"
              r="292"
              fill="#000000"
              stroke="url(#wheelRimGrad)"
              strokeWidth="14"
            />

            {/* Aro Secundário Preto Absoluto (#000000) */}
            <circle
              cx="300"
              cy="300"
              r="280"
              fill="#000000"
              stroke="#000000"
              strokeWidth="2"
            />

            {/* Fatias e Segmentos (Laranja e Preto com detalhes brancos) */}
            <g id="wheel-segments-group">
              {segments.map((seg) => (
                <WheelSegment
                  key={seg.prize.id}
                  segment={seg}
                  totalSegments={segments.length}
                  isWinner={status === "celebrating" && winningPrize?.id === seg.prize.id}
                />
              ))}
            </g>

            {/* Pinos / Rebites Luminosos ao Redor da Borda */}
            {rimPins.map((pin) => (
              <g key={pin.id}>
                <circle cx={pin.x} cy={pin.y} r="4" fill="#FFFFFF" opacity="0.9" />
                <circle cx={pin.x} cy={pin.y} r="1.8" fill="#FFEDD5" />
              </g>
            ))}

            {/* Moldura circular do Centro (Hub) Preto Puro com borda Laranja suave */}
            <circle
              cx="300"
              cy="300"
              r="70"
              fill="#000000"
              stroke="#EA580C"
              strokeWidth="4"
            />
          </svg>
        </motion.div>

        {/* Botão Central "GIRAR" em Destaque Proporcional */}
        <button
          onClick={onSpinClick}
          disabled={isSpinning || activePrizes.length < 2}
          aria-label="Girar roleta"
          className="absolute z-20 w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] md:w-[134px] md:h-[134px] lg:w-[144px] lg:h-[144px] xl:w-[150px] xl:h-[150px] rounded-full flex flex-col items-center justify-center font-black tracking-wider text-white shadow-[0_0_25px_rgba(249,115,22,0.85)] border-[3px] border-orange-300/80 bg-gradient-to-b from-[#FF6B00] via-[#EA580C] to-[#C2410C] hover:brightness-110 active:scale-95 disabled:opacity-85 disabled:cursor-not-allowed transition-all cursor-pointer group"
        >
          <span className="text-sm sm:text-lg md:text-xl font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-widest">
            {isSpinning ? "..." : "GIRAR"}
          </span>
          <span className="text-[9px] sm:text-[11px] font-semibold text-orange-100/90 tracking-tight mt-0.5 opacity-90 group-hover:opacity-100">
            {isSpinning ? "SORTEANDO" : "ROLETA"}
          </span>
        </button>
      </div>

      {/* Aviso caso haja menos de 2 prêmios */}
      {activePrizes.length < 2 && (
        <div className="mt-2 text-center">
          <p className="text-[11px] text-red-500 font-medium">
            Ative pelo menos 2 prêmios para poder girar
          </p>
        </div>
      )}
    </div>
  );
};
