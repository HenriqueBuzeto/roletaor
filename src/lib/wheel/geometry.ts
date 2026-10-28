import { Prize, WheelSegmentGeometry } from "@/types/wheel";

/**
 * Cores da Roleta da Ótica Renata Prime:
 * Alternância entre PRETO PROFUNDO (#121212) e LARANJA VIBRANTE (#EA580C / #FF6B00),
 * com detalhes e textos em BRANCO PURO (#FFFFFF).
 */
export const SEGMENT_COLORS = {
  black: "#121212",
  orange: "#EA580C",
  white: "#FFFFFF",
  brightOrange: "#FF6B00",
  rimOrange: "#F97316",
  oddAmber: "#9A3412", // Âmbar queimado / terracota escuro para fechar números ímpares sem parecer vermelho
};

/**
 * Converte graus para radianos.
 */
export function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Converte coordenadas polares (raio, ângulo em graus) para coordenadas cartesianas (x, y).
 * 0 graus = topo (12h) no nosso padrão de ponteiro.
 */
export function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
): { x: number; y: number } {
  const angleInRadians = degreesToRadians(angleInDegrees - 90);
  return {
    x: Number((centerX + radius * Math.cos(angleInRadians)).toFixed(4)),
    y: Number((centerY + radius * Math.sin(angleInRadians)).toFixed(4)),
  };
}

/**
 * Gera o comando SVG 'd' para uma fatia circular (arco de torta).
 */
export function createSvgArc(
  centerX: number,
  centerY: number,
  radius: number,
  startAngle: number,
  endAngle: number
): string {
  if (Math.abs(endAngle - startAngle) >= 360) {
    return `M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 1 0 ${centerX + radius} ${centerY} A ${radius} ${radius} 0 1 0 ${centerX - radius} ${centerY} Z`;
  }

  const start = polarToCartesian(centerX, centerY, radius, startAngle);
  const end = polarToCartesian(centerX, centerY, radius, endAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

  return [
    `M ${centerX} ${centerY}`,
    `L ${start.x} ${start.y}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`,
    "Z",
  ].join(" ");
}

/**
 * Calcula a geometria precisa de todos os segmentos da roleta.
 * Alterna entre LARANJA e BRANCO para o tema claro.
 */
export function calculateWheelGeometry(
  prizes: Prize[],
  radius = 260,
  center = 300
): WheelSegmentGeometry[] {
  const count = prizes.length;
  if (count === 0) return [];

  const segmentAngle = 360 / count;

  return prizes.map((prize, index) => {
    const startAngle = index * segmentAngle;
    const endAngle = (index + 1) * segmentAngle;
    const centerAngle = startAngle + segmentAngle / 2;

    // Alternância estrita de LARANJA e PRETO com detalhes em BRANCO
    let color = index % 2 === 0 ? SEGMENT_COLORS.orange : SEGMENT_COLORS.black;
    if (count % 2 !== 0 && index === count - 1) {
      // Quando for ímpar (ex: 9 prêmios), a 9ª fatia usa o tom âmbar queimado (#9A3412),
      // harmonizando com a paleta da ótica e evitando repetir laranja com laranja ou preto com preto
      color = SEGMENT_COLORS.oddAmber;
    }

    const pathD = createSvgArc(center, center, radius, startAngle, endAngle);
    const textRadius = radius * 0.65;

    return {
      index,
      prize,
      startAngle,
      endAngle,
      centerAngle,
      pathD,
      textAngle: centerAngle,
      textRadius,
      color,
    };
  });
}
