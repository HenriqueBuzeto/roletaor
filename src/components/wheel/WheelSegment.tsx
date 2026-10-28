import React from "react";
import { WheelSegmentGeometry } from "@/types/wheel";

interface WheelSegmentProps {
  segment: WheelSegmentGeometry;
  totalSegments: number;
  isWinner?: boolean;
}

export const WheelSegment: React.FC<WheelSegmentProps> = ({
  segment,
  totalSegments,
  isWinner,
}) => {
  // Ajuste de tamanho de fonte baseado na quantidade de fatias
  const fontSize =
    totalSegments <= 4
      ? 19
      : totalSegments <= 8
      ? 16
      : totalSegments <= 12
      ? 13
      : 11;

  // Truncamento inteligente caso o texto seja muito longo para o espaço
  const displayName =
    segment.prize.name.length > 15
      ? `${segment.prize.name.slice(0, 14)}…`
      : segment.prize.name;

  // No tema preto e laranja, o texto é sempre BRANCO PURO para contraste máximo
  const textColor = "#FFFFFF";
  const textShadow = "drop-shadow(0 2px 4px rgba(0,0,0,0.85))";

  return (
    <g className="wheel-segment select-none">
      {/* Fatia SVG com borda branca refinada destacando o segmento */}
      <path
        d={segment.pathD}
        fill={segment.color}
        stroke="#FFFFFF"
        strokeWidth="1.5"
        strokeOpacity="0.4"
        className={`transition-colors duration-300 ${
          isWinner ? "filter brightness-125" : ""
        }`}
      />

      {/* Rótulo do Prêmio perfeitamente centralizado e alinhado ao raio da fatia */}
      <g
        transform={`rotate(${segment.textAngle}, 300, 300) translate(300, ${
          300 - segment.textRadius
        })`}
      >
        <text
          x="0"
          y="0"
          fill={textColor}
          textAnchor="middle"
          dominantBaseline="central"
          transform={
            segment.textAngle > 90 && segment.textAngle < 270
              ? "rotate(270)"
              : "rotate(90)"
          }
          style={{
            fontFamily: "var(--font-sans, system-ui, sans-serif)",
            fontWeight: 800,
            fontSize: `${fontSize}px`,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            filter: textShadow,
          }}
        >
          {displayName}
        </text>
      </g>
    </g>
  );
};
