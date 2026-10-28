"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Gift, Sparkles, RotateCw, X } from "lucide-react";
import { useWheelStore } from "@/store/useWheelStore";

interface WinnerOverlayProps {
  onSpinAgain: () => void;
}

export const WinnerOverlay: React.FC<WinnerOverlayProps> = ({ onSpinAgain }) => {
  const { status, winningPrize, dismissWinner } = useWheelStore();

  if (status !== "celebrating" || !winningPrize) {
    return null;
  }

  return (
    <AnimatePresence>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="winner-title"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      >
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 10 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md sm:max-w-lg rounded-3xl border border-orange-200 bg-white p-6 sm:p-8 text-center shadow-[0_20px_60px_rgba(234,88,12,0.3)]"
        >
          {/* Botão de Fechar Rápido */}
          <button
            onClick={dismissWinner}
            aria-label="Fechar"
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 rounded-full bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Ícone com Efeito Luminoso de Presente */}
          <div className="mx-auto mb-4 relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 shadow-[0_10px_25px_rgba(234,88,12,0.4)]">
            <Gift className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-amber-200 animate-pulse" />
          </div>

          {/* Título de Celebração */}
          <h2
            id="winner-title"
            className="text-2xl sm:text-3xl font-extrabold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 drop-shadow-xs"
          >
            PARABÉNS!
          </h2>

          <p className="mt-2 text-sm sm:text-base font-semibold text-slate-600">
            Você acabou de ganhar:
          </p>

          {/* Card do Prêmio em Destaque */}
          <div className="my-6 py-5 px-4 rounded-2xl bg-orange-50 border-2 border-orange-400 shadow-sm">
            <span className="text-2xl sm:text-4xl font-black tracking-wide text-orange-600 drop-shadow-xs">
              {winningPrize.name}
            </span>
          </div>

          <p className="text-xs text-slate-500 mb-6 font-medium">
            Apresente este resultado ao consultor da Ótica Renata Prime.
          </p>

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={onSpinAgain}
              className="flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 active:scale-98 transition shadow-lg shadow-orange-500/30 cursor-pointer"
            >
              <RotateCw className="w-5 h-5" />
              NOVO GIRO
            </button>
            <button
              onClick={dismissWinner}
              className="py-3.5 px-6 rounded-xl font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 transition border border-slate-200 cursor-pointer"
            >
              FECHAR
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
