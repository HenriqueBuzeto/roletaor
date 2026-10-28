"use client";

import React, { useRef, useState } from "react";
import {
  Volume2,
  VolumeX,
  Sparkles,
  Download,
  Upload,
  History,
  Trash2,
  Sliders,
  Tv,
  RotateCw,
} from "lucide-react";
import { useWheelStore } from "@/store/useWheelStore";

export const SettingsPanel: React.FC = () => {
  const {
    settings,
    updateSettings,
    history,
    clearHistory,
    exportConfiguration,
    importConfiguration,
    togglePresentationMode,
    status,
  } = useWheelStore();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const isSpinning = status === "spinning";

  const handleExport = () => {
    const jsonStr = exportConfiguration();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `roleta-otica-renata-prime-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const res = importConfiguration(text);
      if (res.success) {
        setImportStatus("Configuração importada com sucesso!");
        setTimeout(() => setImportStatus(null), 3500);
      } else {
        setImportStatus(`Erro: ${res.error}`);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="bg-white/95 border border-slate-200 rounded-2xl p-3.5 flex flex-col gap-3 text-slate-800 w-full overflow-hidden shadow-lg">
      {/* Título */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-1.5">
          <Sliders className="w-4 h-4 text-orange-600" />
          Ajustes & Experiência
        </h3>
        <button
          onClick={togglePresentationMode}
          className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-orange-100 text-orange-700 border border-orange-200 hover:bg-orange-200 transition flex items-center gap-1 cursor-pointer"
        >
          <Tv className="w-3 h-3" />
          Modo Telão
        </button>
      </div>

      {/* Controles de Experiência */}
      <div className="space-y-3">
        {/* Duração do Giro */}
        <div>
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-slate-700 font-medium text-[11px]">Tempo de Giro</span>
            <span className="font-bold text-orange-600 text-xs">{settings.spinDuration} segundos</span>
          </div>
          <input
            type="range"
            min={4}
            max={12}
            step={1}
            value={settings.spinDuration}
            disabled={isSpinning}
            onChange={(e) => updateSettings({ spinDuration: Number(e.target.value) })}
            className="w-full accent-orange-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[9px] text-slate-400 mt-0.5">
            <span>Rápido (4s)</span>
            <span>Padrão (10s)</span>
            <span>Longo (12s)</span>
          </div>
        </div>

        {/* Orientação da Tela (Para Monitor/TV em Pé ou Deitado) */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
              <RotateCw className="w-3.5 h-3.5 text-orange-600" />
              Orientação da Tela
            </span>
            <span className="text-[10px] font-extrabold text-orange-600">
              {settings.orientationRotation || 0}° {settings.orientationRotation === 90 ? "(Vertical Dir)" : settings.orientationRotation === 180 ? "(Invertido)" : settings.orientationRotation === 270 ? "(Vertical Esq)" : "(Padrão)"}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1">
            {([0, 90, 180, 270] as const).map((deg) => (
              <button
                key={deg}
                onClick={() => updateSettings({ orientationRotation: deg })}
                className={`py-1.5 px-1 rounded-lg text-[10px] font-bold transition cursor-pointer border text-center ${
                  (settings.orientationRotation || 0) === deg
                    ? "bg-orange-600 border-orange-600 text-white shadow-xs"
                    : "bg-white border-slate-200 text-slate-700 hover:border-orange-300"
                }`}
              >
                {deg === 0 ? "0° Normal" : `${deg}°`}
              </button>
            ))}
          </div>
        </div>

        {/* Efeitos de Som e Confetes */}
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
            className={`p-2 rounded-xl border flex items-center justify-center gap-1.5 text-[11px] font-semibold transition cursor-pointer ${
              settings.soundEnabled
                ? "bg-orange-50 border-orange-300 text-orange-700"
                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
            }`}
          >
            {settings.soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            {settings.soundEnabled ? "Som Ligado" : "Som Mudo"}
          </button>

          <button
            onClick={() => updateSettings({ confettiEnabled: !settings.confettiEnabled })}
            className={`p-2 rounded-xl border flex items-center justify-center gap-1.5 text-[11px] font-semibold transition cursor-pointer ${
              settings.confettiEnabled
                ? "bg-orange-50 border-orange-300 text-orange-700"
                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {settings.confettiEnabled ? "Confetes On" : "Confetes Off"}
          </button>
        </div>
      </div>

      {/* Backup Local */}
      <div className="border-t border-slate-100 pt-2">
        <span className="text-[10px] font-bold text-slate-500 block mb-1.5 uppercase tracking-wider">
          Backup Local (JSON)
        </span>
        <div className="flex gap-1.5">
          <button
            onClick={handleExport}
            className="flex-1 py-1.5 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold flex items-center justify-center gap-1 transition cursor-pointer border border-slate-200"
          >
            <Download className="w-3 h-3 text-orange-600" />
            Exportar
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isSpinning}
            className="flex-1 py-1.5 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold flex items-center justify-center gap-1 transition cursor-pointer border border-slate-200 disabled:opacity-50"
          >
            <Upload className="w-3 h-3 text-orange-600" />
            Importar
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleImportFile}
            className="hidden"
          />
        </div>
        {importStatus && (
          <p className="text-[10px] mt-1.5 text-amber-800 bg-amber-50 border border-amber-200 p-1.5 rounded-lg">
            {importStatus}
          </p>
        )}
      </div>

      {/* Histórico Recente de Ganhadores */}
      <div className="border-t border-slate-100 pt-2">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1 uppercase tracking-wider">
            <History className="w-3 h-3" />
            Histórico ({history.length})
          </span>
          {history.length > 0 && (
            <button
              onClick={clearHistory}
              title="Limpar histórico"
              className="text-[10px] text-slate-400 hover:text-rose-600 flex items-center gap-0.5"
            >
              <Trash2 className="w-2.5 h-2.5" /> Limpar
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <p className="text-[11px] text-slate-400 italic py-0.5">Nenhum giro realizado ainda.</p>
        ) : (
          <div className="max-h-[85px] overflow-y-auto no-scrollbar space-y-1 pr-0.5">
            {history.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between text-[11px] py-1 px-2 rounded-lg bg-slate-50 border border-slate-200"
              >
                <span className="font-semibold text-orange-600 truncate">{item.prizeName}</span>
                <span className="text-[9px] text-slate-400 font-mono">
                  {new Date(item.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
