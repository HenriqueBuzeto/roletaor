/**
 * Sorteio criptograficamente seguro com suporte a pesos/probabilidades customizadas.
 * Se nenhum peso for especificado (ou todos forem iguais), funciona de forma estritamente uniforme.
 * 
 * @param prizes Lista de prêmios ativos
 * @param randomSource Fonte opcional de float no intervalo [0, 1) injetável para testes
 * @returns Índice selecionado no array de prizes ativos [0, prizes.length - 1]
 */
export function selectWeightedIndex(
  prizes: { probability?: number }[],
  randomSource?: () => number
): number {
  const count = prizes.length;
  if (count <= 0) {
    throw new Error("A quantidade de opções ativas deve ser maior que 0");
  }
  if (count === 1) return 0;

  // Calcula os pesos normalizados
  const normalized = getNormalizedProbabilities(prizes);

  // Gera número aleatório criptográfico de alta precisão entre [0, 100)
  let randomVal: number;
  if (randomSource) {
    randomVal = randomSource() * 100;
  } else if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    // Divisão por 2^32 resulta em float [0, 1)
    randomVal = (array[0] / 0x100000000) * 100;
  } else {
    randomVal = Math.random() * 100;
  }

  // Roleta de probabilidade acumulada (Cumulative Distribution Function)
  let cumulative = 0;
  for (let i = 0; i < count; i++) {
    cumulative += normalized[i];
    if (randomVal < cumulative || i === count - 1) {
      return i;
    }
  }

  return count - 1;
}

/**
 * Normaliza as probabilidades de todos os prêmios ativos para que a soma seja exatamente 100%.
 * Se algum item não tiver probabilidade configurada, distribui o restante igualmente entre os não configurados.
 */
export function getNormalizedProbabilities(
  prizes: { probability?: number }[]
): number[] {
  const count = prizes.length;
  if (count === 0) return [];
  if (count === 1) return [100];

  // Identifica itens com probabilidade explícita
  let explicitSum = 0;
  let unassignedCount = 0;

  for (const p of prizes) {
    if (typeof p.probability === "number" && p.probability > 0) {
      explicitSum += p.probability;
    } else {
      unassignedCount++;
    }
  }

  // Se todos tiverem probabilidade explícita
  if (unassignedCount === 0) {
    if (explicitSum === 0) {
      const uniform = 100 / count;
      return prizes.map(() => uniform);
    }
    // Normaliza para 100% proporcionalmente
    return prizes.map((p) => Number((((p.probability || 0) / explicitSum) * 100).toFixed(4)));
  }

  // Se alguns itens têm probabilidade explícita e outros não
  if (explicitSum < 100 && unassignedCount > 0) {
    const remaining = 100 - explicitSum;
    const autoShare = remaining / unassignedCount;
    return prizes.map((p) =>
      typeof p.probability === "number" && p.probability > 0
        ? p.probability
        : Number(autoShare.toFixed(4))
    );
  }

  // Se explicitSum >= 100 ou caso extremo, normaliza tudo proporcionalmente
  const baseWeights = prizes.map((p) =>
    typeof p.probability === "number" && p.probability > 0 ? p.probability : 100 / count
  );
  const total = baseWeights.reduce((a, b) => a + b, 0);
  return baseWeights.map((w) => Number(((w / total) * 100).toFixed(4)));
}

/**
 * Função legado para uniformidade pura
 */
export function selectUniformIndex(
  count: number,
  randomSource?: () => number
): number {
  return selectWeightedIndex(Array(count).fill({}), randomSource);
}

/**
 * Retorna a probabilidade uniforme ou ponderada formatada
 */
export function getUniformProbability(count: number): {
  fraction: string;
  percentage: number;
  formattedPercentage: string;
} {
  if (count <= 0) {
    return { fraction: "0/0", percentage: 0, formattedPercentage: "0%" };
  }
  const percentage = 100 / count;
  const formatted =
    percentage % 1 === 0 ? `${percentage}%` : `${percentage.toFixed(2)}%`;

  return {
    fraction: `1/${count}`,
    percentage,
    formattedPercentage: formatted,
  };
}
