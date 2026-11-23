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
  const name = segment.prize.name.trim();

  // Divide o nome em até 2 linhas caso contenha mais de 1 palavra e passe de 10 caracteres
  let lines: string[] = [name];
  if (name.length > 10 && name.includes(" ")) {
    const words = name.split(" ");
    const mid = Math.ceil(words.length / 2);
    lines = [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
  }

  // Ajuste inteligente do tamanho da fonte para caber perfeitamente no raio da fatia
  const maxLineLength = Math.max(...lines.map((l) => l.length));
  let fontSize = 14;
  if (totalSegments <= 4) {
    fontSize = maxLineLength > 12 ? 14 : 17;
  } else if (totalSegments <= 8) {
    fontSize = maxLineLength > 12 ? 12 : 14;
  } else if (totalSegments <= 12) {
    fontSize = maxLineLength > 14 ? 9.5 : maxLineLength > 10 ? 11 : 12.5;
  } else {
    fontSize = maxLineLength > 12 ? 8.5 : 10;
  }

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
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            filter: textShadow,
          }}
        >
          {lines.length === 1 ? (
            lines[0]
          ) : (
            <>
              <tspan x="0" dy={`-${fontSize * 0.6}px`}>
                {lines[0]}
              </tspan>
              <tspan x="0" dy={`${fontSize * 1.2}px`}>
                {lines[1]}
              </tspan>
            </>
          )}
        </text>
      </g>
    </g>
  );
};
