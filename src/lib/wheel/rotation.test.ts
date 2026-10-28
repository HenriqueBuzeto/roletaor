import { describe, it, expect } from "vitest";
import { calculateTargetRotation, getActiveIndexUnderPointer } from "@/lib/wheel/rotation";
import { calculateWheelGeometry } from "@/lib/wheel/geometry";
import { Prize } from "@/types/wheel";

const mockPrizes = (count: number): Prize[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `p-${i + 1}`,
    name: `Prêmio ${i + 1}`,
    active: true,
    createdAt: Date.now() + i,
  }));

describe("Alinhamento do Ponteiro e Rotação Contínua", () => {
  it("deve alinhar exatamente o segmento vencedor com o ponteiro a 12 horas", () => {
    const count = 8;
    const prizes = mockPrizes(count);
    const segments = calculateWheelGeometry(prizes, 250, 300);

    // Testa para cada índice de 0 a 7
    for (let targetIdx = 0; targetIdx < count; targetIdx++) {
      const finalRotation = calculateTargetRotation(targetIdx, segments, 0, 5);
      const pointerResultIdx = getActiveIndexUnderPointer(finalRotation, count);
      expect(pointerResultIdx).toBe(targetIdx);
    }
  });

  it("deve acumular rotação sem saltos bruscos ou decréscimos em giros subsequentes", () => {
    const count = 6;
    const prizes = mockPrizes(count);
    const segments = calculateWheelGeometry(prizes, 250, 300);

    let currentRot = 0;
    for (let i = 0; i < 5; i++) {
      const targetIdx = i % count;
      const nextRot = calculateTargetRotation(targetIdx, segments, currentRot, 6);

      // Sempre estritamente progressivo e contínuo
      expect(nextRot).toBeGreaterThan(currentRot);
      expect(nextRot - currentRot).toBeGreaterThanOrEqual(6 * 360);

      // O índice conferido sob o ponteiro deve corresponder exatamente ao target
      expect(getActiveIndexUnderPointer(nextRot, count)).toBe(targetIdx);

      currentRot = nextRot;
    }
  });

  it("deve funcionar perfeitamente com número ímpar de prêmios (ex: 3, 5, 7)", () => {
    [3, 5, 7].forEach((count) => {
      const prizes = mockPrizes(count);
      const segments = calculateWheelGeometry(prizes, 250, 300);

      for (let targetIdx = 0; targetIdx < count; targetIdx++) {
        const finalRotation = calculateTargetRotation(targetIdx, segments, 120, 5);
        expect(getActiveIndexUnderPointer(finalRotation, count)).toBe(targetIdx);
      }
    });
  });
});
