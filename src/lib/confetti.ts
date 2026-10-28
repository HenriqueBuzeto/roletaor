import confetti from "canvas-confetti";

/**
 * Dispara celebração elegante nas cores da Ótica Renata Prime:
 * Laranja (#F97316), Laranja Vivo (#FF6B00), Ouro/Âmbar (#FB923C) e Branco (#FFFFFF).
 */
export function fireWinnerConfetti() {
  if (typeof window === "undefined") return;

  // Respeita prefers-reduced-motion do usuário
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  const colors = ["#F97316", "#FF6B00", "#FB923C", "#FFFFFF", "#FFAA33"];

  // Explosão da esquerda
  confetti({
    particleCount: 50,
    angle: 60,
    spread: 55,
    origin: { x: 0.1, y: 0.7 },
    colors,
    zIndex: 9999,
  });

  // Explosão da direita
  confetti({
    particleCount: 50,
    angle: 120,
    spread: 55,
    origin: { x: 0.9, y: 0.7 },
    colors,
    zIndex: 9999,
  });

  // Pulverização central suave
  setTimeout(() => {
    confetti({
      particleCount: 40,
      spread: 100,
      origin: { x: 0.5, y: 0.4 },
      colors,
      zIndex: 9999,
      scalar: 1.1,
    });
  }, 250);
}
