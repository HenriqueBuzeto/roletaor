"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { PrizeWheel } from "@/components/wheel/PrizeWheel";
import { PrizeManager } from "@/components/prizes/PrizeManager";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { WinnerOverlay } from "@/components/celebration/WinnerOverlay";
import { AppHeader } from "@/components/layout/AppHeader";
import { CharacterAssistant } from "@/components/character/CharacterAssistant";
import { useWheelStore } from "@/store/useWheelStore";
import { calculateWheelGeometry } from "@/lib/wheel/geometry";
import { calculateTargetRotation } from "@/lib/wheel/rotation";
import { Play } from "lucide-react";

export default function Home() {
  const {
    prizes,
    status,
    currentRotation,
    startSpin,
    completeSpin,
    setRotation,
    settings,
  } = useWheelStore();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<"prizes" | "settings">("prizes");
  const [isMounted, setIsMounted] = useState(false);
  const celebrationTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      if (celebrationTimerRef.current) {
        clearTimeout(celebrationTimerRef.current);
      }
    };
  }, []);

  const activePrizes = useMemo(() => prizes.filter((p) => p.active), [prizes]);
  const segments = useMemo(
    () => calculateWheelGeometry(activePrizes, 255, 300),
    [activePrizes]
  );

  const handleToggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const handleTriggerSpin = useCallback(() => {
    if (status !== "idle" || activePrizes.length < 2) return;

    if (celebrationTimerRef.current) {
      clearTimeout(celebrationTimerRef.current);
    }

    const started = startSpin();
    if (!started) return;

    const nextWinningIndex = useWheelStore.getState().winningIndex;
    if (nextWinningIndex === null || nextWinningIndex === undefined) return;

    // 8 voltas completas para 10 segundos de rotação suave e cinematográfica
    const nextRotation = calculateTargetRotation(
      nextWinningIndex,
      segments,
      currentRotation,
      8
    );

    setRotation(nextRotation);
  }, [status, activePrizes.length, startSpin, segments, currentRotation, setRotation]);

  // Tecla de Espaço: Aciona a roleta automaticamente ou fecha a tela de parabéns voltando para o giro
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignora se o usuário estiver digitando em um campo de texto, input ou modal de PIN
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.code === "Space" || e.key === " ") {
        e.preventDefault();

        const currentStatus = useWheelStore.getState().status;
        if (currentStatus === "celebrating") {
          // Fecha a tela de celebração e volta para a tela de giro
          useWheelStore.getState().dismissWinner();
        } else if (currentStatus === "idle") {
          handleTriggerSpin();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleTriggerSpin]);

  const handleAnimationComplete = useCallback(() => {
    if (status === "spinning") {
      celebrationTimerRef.current = setTimeout(() => {
        completeSpin();
      }, 3000);
    }
  }, [status, completeSpin]);

  if (!isMounted) {
    return (
      <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center text-slate-900">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold tracking-wider text-orange-600">
            CARREGANDO ÓTICA RENATA PRIME...
          </p>
        </div>
      </div>
    );
  }

  const isPresentation = settings.presentationMode;
  const rotation = settings.orientationRotation || 0;
  const isRotated90or270 = rotation === 90 || rotation === 270;

  // Render content inside an orientation-aware container
  const pageContent = (
    <div
      className={`bg-slate-50 text-slate-900 flex flex-col justify-between select-none ${
        isRotated90or270
          ? "w-[100vh] h-[100vw] overflow-y-auto overflow-x-hidden"
          : "min-h-screen w-full overflow-x-hidden xl:overflow-hidden xl:h-screen"
      }`}
      style={
        rotation !== 0
          ? {
              transform: `rotate(${rotation}deg)`,
              transformOrigin: "center center",
              transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
            }
          : {
              transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
            }
      }
    >
      {/* Luz ambiente suave alaranjada adaptada para fundo claro */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[1400px] h-[350px] bg-gradient-to-b from-orange-400/15 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Cabeçalho */}
      <AppHeader
        onToggleFullscreen={handleToggleFullscreen}
        isFullscreen={isFullscreen}
      />

      {/* Área Principal:
          - No celular / tablet: empilhamento vertical com scroll suave (overflow-y-auto)
          - No desktop / TV 16:9: layout com painel no canto esquerdo, roleta alinhada no centro e Renata ao lado
      */}
      <main className="flex-1 w-full px-3 sm:px-6 lg:px-8 py-2 sm:py-3 flex flex-col justify-between items-center">
        {/* 
          Distribuição Responsiva:
          - Painel no Canto Esquerdo
          - Roleta no Centro
          - Renata ao lado da Roleta
        */}
        <div className="w-full max-w-[1700px] flex-1 flex flex-col xl:flex-row items-center justify-between gap-4 lg:gap-8 mx-auto">
          {/* 1. Lado Esquerdo: Painel de Prêmios e Ajustes */}
          <div className="w-full max-w-md xl:max-w-[360px] 2xl:max-w-[390px] flex items-start justify-center xl:justify-start shrink-0 order-2 xl:order-1 self-start">
            {!isPresentation ? (
              <div className="w-full flex flex-col gap-2">
                <div className="flex bg-slate-200/80 p-1 rounded-xl border border-slate-300/60 shrink-0">
                  <button
                    onClick={() => setActiveTab("prizes")}
                    className={`flex-1 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-bold transition cursor-pointer ${
                      activeTab === "prizes"
                        ? "bg-white text-orange-600 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Prêmios ({activePrizes.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("settings")}
                    className={`flex-1 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-bold transition cursor-pointer ${
                      activeTab === "settings"
                        ? "bg-white text-orange-600 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Ajustes
                  </button>
                </div>

                <div className="w-full">
                  {activeTab === "prizes" ? <PrizeManager /> : <SettingsPanel />}
                </div>
              </div>
            ) : (
              <div className="w-full hidden xl:block" />
            )}
          </div>

          {/* 2. Área Central e Direita: Roleta e Personagem Renata */}
          <div
            className={`flex-1 w-full flex flex-row items-center justify-center gap-2 sm:gap-4 md:gap-6 lg:gap-8 order-1 xl:order-2 ${
              isRotated90or270
                ? "pr-4 sm:pr-8"
                : ""
            }`}
          >
            {/* Coluna da Roleta com Título rigorosamente alinhado ao centro geométrico */}
            <div className="shrink-0 flex flex-col items-center justify-center z-10">
              {/* Título de Impacto Centralizado rigorosamente com a Roleta */}
              <div className="text-center mb-2.5 sm:mb-3 shrink-0">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-orange-700 via-orange-600 to-amber-600 drop-shadow-xs">
                  SUA SORTE BRILHA AQUI!
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                  Gire a roleta e descubra seu prêmio exclusivo
                </p>
              </div>

              {/* Roleta Premiada */}
              <PrizeWheel
                targetRotation={currentRotation}
                onSpinClick={handleTriggerSpin}
                onAnimationComplete={handleAnimationComplete}
              />

              {/* Ações Rápidas abaixo da roleta */}
              <div className="mt-2.5 sm:mt-3 flex items-center justify-center gap-2">
                <button
                  onClick={handleTriggerSpin}
                  disabled={status === "spinning" || activePrizes.length < 2}
                  className="px-6 sm:px-8 py-2.5 rounded-full font-extrabold text-xs sm:text-sm uppercase tracking-wider text-white bg-gradient-to-r from-[#FF6B00] via-[#EA580C] to-[#C2410C] hover:brightness-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_8px_20px_rgba(234,88,12,0.35)] transition cursor-pointer flex items-center gap-2"
                >
                  <Play className="w-4 h-4 fill-current" />
                  {status === "spinning" ? "Girando..." : "Girar Roleta"}
                </button>

                {isPresentation && (
                  <button
                    onClick={() => useWheelStore.getState().togglePresentationMode()}
                    className="px-4 py-2.5 rounded-full font-semibold text-xs text-slate-700 bg-white border border-slate-300 hover:text-orange-600 hover:border-orange-300 shadow-xs transition cursor-pointer"
                  >
                    Configurar Prêmios
                  </button>
                )}
              </div>
            </div>

            {/* Personagem Renata: SEMPRE AO LADO DA ROLETA em celular, tablet e TV */}
            <div className="flex items-end justify-center shrink-0 -ml-2 sm:-ml-4 md:-ml-6 lg:-ml-8 self-end pb-2">
              <CharacterAssistant />
            </div>
          </div>
        </div>
      </main>

      {/* Rodapé Institucional em toda a largura */}
      <footer className="w-full py-2.5 text-center border-t border-slate-200 bg-white/70 backdrop-blur-xs text-slate-500 text-xs flex items-center justify-between px-4 sm:px-10 shrink-0">
        <span className="font-medium text-slate-500">© {new Date().getFullYear()} Ótica Renata Prime</span>
        <span className="text-[11px] sm:text-xs font-semibold text-orange-600 tracking-wide">
          Desenvolvido por HB Studio Dev
        </span>
      </footer>

      {/* Modal Cinematográfico de Resultado com Confetes */}
      <WinnerOverlay onSpinAgain={handleTriggerSpin} />
    </div>
  );

  if (!isRotated90or270) {
    return pageContent;
  }

  // Quando girado 90° ou 270°, o viewport físico inverte as dimensões relativas
  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-slate-100 flex items-center justify-center">
      {pageContent}
    </div>
  );
}
