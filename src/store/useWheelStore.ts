import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  Prize,
  WheelStatus,
  WheelSettings,
  SpinResult,
} from "@/types/wheel";
import { DEFAULT_PRIZES, PrizeSchema, WheelExportDataSchema } from "@/lib/validations";
import { selectWeightedIndex } from "@/lib/wheel/random";
import { soundFx } from "@/lib/sound";
import { fireWinnerConfetti } from "@/lib/confetti";

interface WheelState {
  prizes: Prize[];
  status: WheelStatus;
  currentRotation: number;
  winningIndex: number | null;
  winningPrize: Prize | null;
  history: SpinResult[];
  settings: WheelSettings;

  // Ações de gerenciamento de prêmios
  addPrize: (name: string, probability?: number) => { success: boolean; error?: string };
  updatePrize: (
    id: string,
    name: string,
    probability?: number
  ) => { success: boolean; error?: string };
  removePrize: (id: string) => { success: boolean; error?: string };
  togglePrizeActive: (id: string) => { success: boolean; error?: string };
  resetDefaultPrizes: () => void;
  reorderPrizes: (sourceIndex: number, destIndex: number) => void;
  distributeEqualProbabilities: () => void;

  // Ações de configurações
  updateSettings: (partial: Partial<WheelSettings>) => void;
  togglePresentationMode: () => void;
  toggleSound: () => void;
  rotateScreen: () => void;
  clearHistory: () => void;

  // Orquestração do Giro
  startSpin: () => boolean;
  completeSpin: () => void;
  dismissWinner: () => void;
  setRotation: (rotation: number) => void;

  // Import / Export
  exportConfiguration: () => string;
  importConfiguration: (jsonString: string) => { success: boolean; error?: string };
}

export const useWheelStore = create<WheelState>()(
  persist(
    (set, get) => ({
      prizes: DEFAULT_PRIZES,
      status: "idle",
      currentRotation: 0,
      winningIndex: null,
      winningPrize: null,
      history: [],
      settings: {
        spinDuration: 10,
        soundEnabled: false,
        confettiEnabled: true,
        presentationMode: false,
        fullScreen: false,
        orientationRotation: 0,
        adminPin: "1234",
      },

      addPrize: (name: string, probability?: number) => {
        const state = get();
        if (state.status === "spinning") {
          return { success: false, error: "Não é possível alterar prêmios durante o giro" };
        }

        const trimmed = name.trim();
        const parseResult = PrizeSchema.shape.name.safeParse(trimmed);
        if (!parseResult.success) {
          return { success: false, error: parseResult.error.issues[0]?.message || "Nome inválido" };
        }

        // Bloqueia duplicados acidentais ignorando maiúsculas e espaços
        const duplicate = state.prizes.some(
          (p) => p.name.trim().toLowerCase() === trimmed.toLowerCase()
        );
        if (duplicate) {
          return { success: false, error: "Já existe um prêmio com este nome" };
        }

        if (state.prizes.length >= 16) {
          return { success: false, error: "Limite máximo de 16 prêmios atingido" };
        }

        const validProb =
          typeof probability === "number" && !isNaN(probability) && probability > 0
            ? Math.min(100, Math.max(0.1, Number(probability.toFixed(2))))
            : undefined;

        const newPrize: Prize = {
          id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          name: trimmed,
          active: true,
          probability: validProb,
          createdAt: Date.now(),
        };

        set({ prizes: [...state.prizes, newPrize] });
        return { success: true };
      },

      updatePrize: (id: string, name: string, probability?: number) => {
        const state = get();
        if (state.status === "spinning") {
          return { success: false, error: "Não é possível editar durante o giro" };
        }

        const trimmed = name.trim();
        const parseResult = PrizeSchema.shape.name.safeParse(trimmed);
        if (!parseResult.success) {
          return { success: false, error: parseResult.error.issues[0]?.message || "Nome inválido" };
        }

        const duplicate = state.prizes.some(
          (p) => p.id !== id && p.name.trim().toLowerCase() === trimmed.toLowerCase()
        );
        if (duplicate) {
          return { success: false, error: "Já existe outro prêmio com este nome" };
        }

        const validProb =
          typeof probability === "number" && !isNaN(probability) && probability > 0
            ? Math.min(100, Math.max(0.01, Number(probability.toFixed(2))))
            : undefined;

        set({
          prizes: state.prizes.map((p) =>
            p.id === id ? { ...p, name: trimmed, probability: validProb } : p
          ),
        });
        return { success: true };
      },

      distributeEqualProbabilities: () => {
        const state = get();
        if (state.status === "spinning") return;
        const activeCount = state.prizes.filter((p) => p.active).length;
        if (activeCount === 0) return;
        const equalProb = Number((100 / activeCount).toFixed(2));
        set({
          prizes: state.prizes.map((p) =>
            p.active ? { ...p, probability: equalProb } : p
          ),
        });
      },

      removePrize: (id: string) => {
        const state = get();
        if (state.status === "spinning") {
          return { success: false, error: "Não é possível remover durante o giro" };
        }

        const remainingActive = state.prizes.filter((p) => p.id !== id && p.active);
        if (remainingActive.length < 2) {
          return {
            success: false,
            error: "A roleta precisa de no mínimo 2 prêmios ativos para funcionar",
          };
        }

        set({
          prizes: state.prizes.filter((p) => p.id !== id),
        });
        return { success: true };
      },

      togglePrizeActive: (id: string) => {
        const state = get();
        if (state.status === "spinning") {
          return { success: false, error: "Não é possível alterar durante o giro" };
        }

        const target = state.prizes.find((p) => p.id === id);
        if (!target) return { success: false, error: "Prêmio não encontrado" };

        const willBeActive = !target.active;
        if (!willBeActive) {
          const remainingActive = state.prizes.filter((p) => p.id !== id && p.active);
          if (remainingActive.length < 2) {
            return {
              success: false,
              error: "Mantenha pelo menos 2 prêmios ativos para girar a roleta",
            };
          }
        }

        set({
          prizes: state.prizes.map((p) =>
            p.id === id ? { ...p, active: willBeActive } : p
          ),
        });
        return { success: true };
      },

      resetDefaultPrizes: () => {
        const state = get();
        if (state.status === "spinning") return;
        set({ prizes: DEFAULT_PRIZES });
      },

      reorderPrizes: (sourceIndex: number, destIndex: number) => {
        const state = get();
        if (state.status === "spinning") return;
        const list = [...state.prizes];
        const [moved] = list.splice(sourceIndex, 1);
        list.splice(destIndex, 0, moved);
        set({ prizes: list });
      },

      updateSettings: (partial) => {
        set((state) => {
          const next = { ...state.settings, ...partial };
          if (partial.soundEnabled !== undefined) {
            soundFx.setMuted(!partial.soundEnabled);
          }
          return { settings: next };
        });
      },

      togglePresentationMode: () => {
        set((state) => ({
          settings: {
            ...state.settings,
            presentationMode: !state.settings.presentationMode,
          },
        }));
      },

      toggleSound: () => {
        set((state) => {
          const nextVal = !state.settings.soundEnabled;
          soundFx.setMuted(!nextVal);
          return {
            settings: { ...state.settings, soundEnabled: nextVal },
          };
        });
      },

      rotateScreen: () => {
        set((state) => {
          const current = state.settings.orientationRotation || 0;
          // Ciclo: 0° -> 90° -> 180° -> 270° -> 0°
          const next = ((current + 90) % 360) as 0 | 90 | 180 | 270;
          return {
            settings: { ...state.settings, orientationRotation: next },
          };
        });
      },

      clearHistory: () => {
        set({ history: [] });
      },

      startSpin: () => {
        const state = get();
        if (state.status !== "idle") return false;

        const activePrizes = state.prizes.filter((p) => p.active);
        if (activePrizes.length < 2) return false;

        // Sorteio criptograficamente justo com probabilidades ponderadas
        const winningActiveIdx = selectWeightedIndex(activePrizes);
        const selectedPrize = activePrizes[winningActiveIdx];

        if (state.settings.soundEnabled) {
          soundFx.playStart();
        }

        set({
          status: "spinning",
          winningIndex: winningActiveIdx,
          winningPrize: selectedPrize,
        });

        return true;
      },

      completeSpin: () => {
        const state = get();
        if (state.status !== "spinning" || !state.winningPrize) return;

        const newResult: SpinResult = {
          id: `res-${Date.now()}`,
          prizeId: state.winningPrize.id,
          prizeName: state.winningPrize.name,
          timestamp: Date.now(),
        };

        // Mantém histórico dos últimos 20 giros locais
        const updatedHistory = [newResult, ...state.history].slice(0, 20);

        if (state.settings.soundEnabled) {
          soundFx.playWin();
        }

        if (state.settings.confettiEnabled) {
          fireWinnerConfetti();
        }

        set({
          status: "celebrating",
          history: updatedHistory,
        });
      },

      dismissWinner: () => {
        set({
          status: "idle",
          winningIndex: null,
          winningPrize: null,
        });
      },

      setRotation: (rotation: number) => {
        set({ currentRotation: rotation });
      },

      exportConfiguration: () => {
        const state = get();
        const payload = {
          version: 1,
          prizes: state.prizes,
          settings: state.settings,
          history: state.history,
        };
        return JSON.stringify(payload, null, 2);
      },

      importConfiguration: (jsonString: string) => {
        const state = get();
        if (state.status === "spinning") {
          return { success: false, error: "Não é possível importar durante o giro" };
        }

        try {
          const parsed = JSON.parse(jsonString);
          const validation = WheelExportDataSchema.safeParse(parsed);
          if (!validation.success) {
            return {
              success: false,
              error: `Arquivo inválido: ${validation.error.issues[0]?.message || "Estrutura incorreta"}`,
            };
          }

          const { prizes, settings, history } = validation.data;
          set({
            prizes,
            settings: { ...state.settings, ...settings },
            history: history || [],
            winningIndex: null,
            winningPrize: null,
            status: "idle",
          });

          return { success: true };
        } catch {
          return { success: false, error: "Arquivo JSON corrompido ou inválido" };
        }
      },
    }),
    {
      name: "otica_renata_prime_wheel_v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        prizes: state.prizes,
        settings: state.settings,
        history: state.history,
        currentRotation: state.currentRotation,
      }),
    }
  )
);
