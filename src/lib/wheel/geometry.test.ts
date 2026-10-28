import { describe, it, expect } from "vitest";
import {
  calculateWheelGeometry,
  degreesToRadians,
  polarToCartesian,
} from "@/lib/wheel/geometry";
import { Prize } from "@/types/wheel";

const mockPrizes = (count: number): Prize[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `p-${i + 1}`,
    name: `Prêmio ${i + 1}`,
    active: true,
    createdAt: Date.now() + i,
  }));

describe("Geometria e Precisão Matemática da Roleta", () => {
  it("deve converter graus para radianos com exatidão", () => {
    expect(degreesToRadians(0)).toBe(0);
    expect(degreesToRadians(180)).toBeCloseTo(Math.PI);
    expect(degreesToRadians(360)).toBeCloseTo(2 * Math.PI);
  });

  it("deve calcular coordenadas com 0° apontando para o topo (12h)", () => {
    // Topo (12:00) => y deve ser menor que centerY (ou seja, acima)
    const top = polarToCartesian(300, 300, 200, 0);
    expect(top.x).toBeCloseTo(300);
    expect(top.y).toBeCloseTo(100);

    // Direita (3:00) => 90 graus
    const right = polarToCartesian(300, 300, 200, 90);
    expect(right.x).toBeCloseTo(500);
    expect(right.y).toBeCloseTo(300);
  });

  it("deve dividir o círculo em exatamente 360 graus para qualquer N (pares e ímpares)", () => {
    [2, 3, 5, 7, 8, 11, 16].forEach((count) => {
      const prizes = mockPrizes(count);
      const segments = calculateWheelGeometry(prizes, 250, 300);

      expect(segments).toHaveLength(count);

      // Soma dos arcos deve ser 360°
      let totalSpan = 0;
      segments.forEach((seg) => {
        const span = seg.endAngle - seg.startAngle;
        expect(span).toBeCloseTo(360 / count);
        totalSpan += span;
      });
      expect(totalSpan).toBeCloseTo(360);

      // O último segmento deve terminar em 360°
      expect(segments[segments.length - 1].endAngle).toBeCloseTo(360);
    });
  });

  it("deve posicionar o ângulo central precisamente no meio de cada fatia", () => {
    const prizes = mockPrizes(4);
    const segments = calculateWheelGeometry(prizes, 250, 300);
    // Para 4 segmentos: 0-90 (centro 45), 90-180 (centro 135), 180-270 (centro 225), 270-360 (centro 315)
    expect(segments[0].centerAngle).toBe(45);
    expect(segments[1].centerAngle).toBe(135);
    expect(segments[2].centerAngle).toBe(225);
    expect(segments[3].centerAngle).toBe(315);
  });
});
