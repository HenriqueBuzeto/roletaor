import { WheelSegmentGeometry } from "@/types/wheel";

/**
 * Calcula o próximo ângulo de rotação absoluta contínua da roleta para alinhar
 * o segmento vencedor ao ponteiro fixo no topo (12:00 = 0°).
 *
 * Como a roleta gira no sentido horário (Clockwise):
 * Se um segmento tem seu ângulo central em C graus (onde 0° é 12h no sistema de desenho):
 * Para levar o ângulo C até 0° (12h) girando para a frente (sentido horário):
 * Uma rotação de R graus move o segmento na posição C para a posição (C + R) mod 360.
 * Queremos que a posição final sob o ponteiro (12h = 0°) seja: (C + R) = 360 * k.
 * Logo, R = 360 * k - C.
 *
 * Para garantir giros contínuos, progressivos e suaves:
 * Mantemos o total acumulado `currentRotation` e somamos um número mínimo de voltas inteiras.
 *
 * @param targetIndex Índice do segmento premiado
 * @param segments Lista de geometrias dos segmentos
 * @param currentRotation Rotação acumulada atual em graus
 * @param minFullTurns Número mínimo de voltas completas (padrão: 5 a 8 voltas)
 * @returns Nova rotação acumulada em graus
 */
export function calculateTargetRotation(
  targetIndex: number,
  segments: WheelSegmentGeometry[],
  currentRotation = 0,
  minFullTurns = 6
): number {
  const count = segments.length;
  if (count === 0 || targetIndex < 0 || targetIndex >= count) {
    return currentRotation;
  }

  const segment = segments[targetIndex];
  const targetCenterAngle = segment.centerAngle; // em [0, 360)

  // Queremos que targetCenterAngle fique em 0° (12 horas).
  // No sentido horário (positivo):
  // Rotação alvo dentro de uma volta = (360 - targetCenterAngle) % 360.
  const targetOffsetInTurn = (360 - targetCenterAngle) % 360;

  // Calculamos a rotação base atual normalizada
  const currentNormalized = ((currentRotation % 360) + 360) % 360;

  // Distância necessária para atingir o ângulo na próxima volta
  let forwardDelta = targetOffsetInTurn - currentNormalized;
  if (forwardDelta < 0) {
    forwardDelta += 360;
  }

  // Adiciona as voltas completas
  const totalDelta = minFullTurns * 360 + forwardDelta;

  return currentRotation + totalDelta;
}

/**
 * Dada uma rotação absoluta atual da roleta, calcula qual índice de segmento
 * está exatamente sob o ponteiro no topo (12 horas).
 * Útil para checagens de integridade e feedback sonoro/cliques por segmento.
 */
export function getActiveIndexUnderPointer(
  currentRotation: number,
  segmentCount: number
): number {
  if (segmentCount <= 0) return 0;
  const segmentAngle = 360 / segmentCount;
  // A rotação positiva gira no sentido horário.
  // O ângulo do disco que fica no topo (0°) é: (-rotation mod 360).
  const angleAtPointer = ((-currentRotation % 360) + 360) % 360;
  const index = Math.floor(angleAtPointer / segmentAngle);
  return (index + segmentCount) % segmentCount;
}
