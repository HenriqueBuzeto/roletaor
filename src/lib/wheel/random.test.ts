import { describe, it, expect } from "vitest";
import { selectUniformIndex, selectWeightedIndex, getUniformProbability } from "@/lib/wheel/random";

describe("Probabilidade Equitativa e Aleatoriedade Justa", () => {
  it("deve calcular a probabilidade uniforme com exatidão matemática", () => {
    expect(getUniformProbability(2).formattedPercentage).toBe("50%");
    expect(getUniformProbability(4).formattedPercentage).toBe("25%");
    expect(getUniformProbability(5).formattedPercentage).toBe("20%");
    expect(getUniformProbability(8).formattedPercentage).toBe("12.50%");
    expect(getUniformProbability(10).formattedPercentage).toBe("10%");
    expect(getUniformProbability(3).formattedPercentage).toBe("33.33%");
    expect(getUniformProbability(7).formattedPercentage).toBe("14.29%");
  });

  it("deve permitir injeção determinística de fonte aleatória para testes", () => {
    // Simulando 0.0, 0.49 e 0.99 para 4 itens
    expect(selectUniformIndex(4, () => 0.0)).toBe(0);
    expect(selectUniformIndex(4, () => 0.26)).toBe(1);
    expect(selectUniformIndex(4, () => 0.51)).toBe(2);
    expect(selectUniformIndex(4, () => 0.99)).toBe(3);
  });

  it("deve cobrir todos os índices no intervalo [0, count-1] sem valores fora do range", () => {
    const count = 7;
    const seen = new Set<number>();

    // Roda 1000 sorteios simulados com crypto
    for (let i = 0; i < 1000; i++) {
      const idx = selectUniformIndex(count);
      expect(idx).toBeGreaterThanOrEqual(0);
      expect(idx).toBeLessThan(count);
      seen.add(idx);
    }

    // Todos os 7 índices devem ser sorteados pelo menos uma vez em 1000 iterações
    expect(seen.size).toBe(count);
  });

  it("deve respeitar probabilidades ponderadas personalizadas (ex: óculos 3% e limpa lente 15%)", () => {
    const prizes = [
      { name: "Óculos de Sol", probability: 3 },
      { name: "Limpa Lente", probability: 15 },
      { name: "Brinde Geral", probability: 82 },
    ];

    // Valida CDF (Cumulative Distribution Function)
    // 0.0 a 0.0299 => index 0 (Óculos)
    expect(selectWeightedIndex(prizes, () => 0.01)).toBe(0);
    // 0.03 a 0.1799 => index 1 (Limpa Lente)
    expect(selectWeightedIndex(prizes, () => 0.05)).toBe(1);
    expect(selectWeightedIndex(prizes, () => 0.17)).toBe(1);
    // 0.18 a 0.9999 => index 2 (Brinde Geral)
    expect(selectWeightedIndex(prizes, () => 0.20)).toBe(2);
    expect(selectWeightedIndex(prizes, () => 0.95)).toBe(2);
  });
});
