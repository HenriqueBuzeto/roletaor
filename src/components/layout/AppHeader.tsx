"use client";

import React from "react";
import Image from "next/image";
import { Maximize2, Minimize2, Tv, Settings, RotateCw } from "lucide-react";
import { useWheelStore } from "@/store/useWheelStore";

interface AppHeaderProps {
  onToggleFullscreen?: () => void;
  isFullscreen?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  onToggleFullscreen,
  isFullscreen,
}) => {
  const { settings, togglePresentationMode, rotateScreen } = useWheelStore();
  const rotation = settings.orientationRotation || 0;

  return (
    <header className="w-full flex items-center justify-between py-2 sm:py-2.5 px-4 sm:px-8 border-b border-neutral-800 bg-black/90 backdrop-blur-md sticky top-0 z-40 shadow-md">
      {/* Logomarca Oficial da Ótica Renata com corte perfeito das margens transparentes */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center">
          <img
            src="/oticarenata_cropped.png"
            alt="Ótica Renata Prime"
            className="h-9 sm:h-11 md:h-12 w-auto object-contain drop-shadow-[0_2px_12px_rgba(249,115,22,0.5)]"
          />
        </div>
      </div>

      {/* Ações do Cabeçalho */}
      <div className="flex items-center gap-2">
        {/* Girar Orientação da Tela (Vertical / Horizontal para TV ou Monitor em Pé) */}
        <button
          onClick={rotateScreen}
          title={`Girar tela do monitor (Atual: ${rotation}°)`}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer border ${
            rotation !== 0
              ? "bg-orange-600/20 border-orange-500 text-orange-400 shadow-sm"
              : "bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700 shadow-xs"
          }`}
        >
          <RotateCw className="w-3.5 h-3.5 text-orange-400" />
          <span className="hidden sm:inline">
            Girar Tela {rotation > 0 ? `(${rotation}°)` : ""}
          </span>
        </button>

        {/* Alternar Modo Apresentação */}
        <button
          onClick={togglePresentationMode}
          title={
            settings.presentationMode
              ? "Sair do Modo Apresentação"
              : "Entrar no Modo Apresentação"
          }
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer border ${
            settings.presentationMode
              ? "bg-orange-600 border-orange-500 text-white shadow-sm"
              : "bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700 shadow-xs"
          }`}
        >
          {settings.presentationMode ? (
            <>
              <Settings className="w-3.5 h-3.5 text-white" />
              <span className="hidden sm:inline">Modo Configurar</span>
            </>
          ) : (
            <>
              <Tv className="w-3.5 h-3.5 text-orange-400" />
              <span className="hidden sm:inline">Modo Telão</span>
            </>
          )}
        </button>

        {/* Alternar Fullscreen */}
        {onToggleFullscreen && (
          <button
            onClick={onToggleFullscreen}
            title={isFullscreen ? "Sair de Tela Cheia" : "Tela Cheia"}
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5 text-orange-400" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5 text-orange-400" />
            )}
            <span className="hidden md:inline">
              {isFullscreen ? "Normal" : "Tela Cheia"}
            </span>
          </button>
        )}
      </div>
    </header>
  );
};
