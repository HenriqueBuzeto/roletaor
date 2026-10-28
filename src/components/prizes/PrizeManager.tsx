"use client";

import React, { useState } from "react";
import { Plus, Trash2, Edit2, Check, X, Eye, EyeOff, RotateCcw, Percent, AlertCircle } from "lucide-react";
import { useWheelStore } from "@/store/useWheelStore";
import { getNormalizedProbabilities } from "@/lib/wheel/random";

export const PrizeManager: React.FC = () => {
  const {
    prizes,
    status,
    addPrize,
    updatePrize,
    removePrize,
    togglePrizeActive,
    resetDefaultPrizes,
    distributeEqualProbabilities,
  } = useWheelStore();

  const [newPrizeName, setNewPrizeName] = useState("");
  const [newPrizeProb, setNewPrizeProb] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingProb, setEditingProb] = useState<string>("");
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const activePrizes = prizes.filter((p) => p.active);
  const isSpinning = status === "spinning";

  // Calcula a soma e porcentagens normalizadas
  const normalizedProbabilities = getNormalizedProbabilities(activePrizes);
  const totalConfiguredProb = activePrizes.reduce(
    (acc, p) => acc + (typeof p.probability === "number" ? p.probability : 0),
    0
  );
  const hasCustomProbabilities = activePrizes.some(
    (p) => typeof p.probability === "number"
  );
  const totalFormatted = Number(totalConfiguredProb.toFixed(1));
  const isTotal100 = !hasCustomProbabilities || Math.abs(totalFormatted - 100) < 0.1;

  const handleAddPrize = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackError(null);
    if (!newPrizeName.trim()) return;

    const probNum = newPrizeProb.trim() ? parseFloat(newPrizeProb) : undefined;
    if (probNum !== undefined && (isNaN(probNum) || probNum <= 0 || probNum > 100)) {
      setFeedbackError("A probabilidade deve ser entre 0.1% e 100%");
      return;
    }

    const res = addPrize(newPrizeName, probNum);
    if (!res.success) {
      setFeedbackError(res.error || "Erro ao adicionar");
    } else {
      setNewPrizeName("");
      setNewPrizeProb("");
    }
  };

  const handleStartEdit = (id: string, currentName: string, currentProb?: number) => {
    if (isSpinning) return;
    setEditingId(id);
    setEditingName(currentName);
    setEditingProb(currentProb !== undefined ? String(currentProb) : "");
    setFeedbackError(null);
  };

  const handleSaveEdit = (id: string) => {
    const probNum = editingProb.trim() ? parseFloat(editingProb) : undefined;
    if (probNum !== undefined && (isNaN(probNum) || probNum <= 0 || probNum > 100)) {
      setFeedbackError("A probabilidade deve ser entre 0.01% e 100%");
      return;
    }

    const res = updatePrize(id, editingName, probNum);
    if (!res.success) {
      setFeedbackError(res.error || "Erro ao atualizar");
    } else {
      setEditingId(null);
      setEditingName("");
      setEditingProb("");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName("");
    setEditingProb("");
  };

  const handleRemove = (id: string) => {
    setFeedbackError(null);
    const res = removePrize(id);
    if (!res.success) {
      setFeedbackError(res.error || "Não foi possível remover");
    }
  };

  const handleToggle = (id: string) => {
    setFeedbackError(null);
    const res = togglePrizeActive(id);
    if (!res.success) {
      setFeedbackError(res.error || "Ação não permitida");
    }
  };

  return (
    <div className="bg-white/95 border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col gap-3 text-slate-800 w-full overflow-hidden shadow-lg">
      {/* Cabeçalho do Gerenciador */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Gerenciar Prêmios
            </h3>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700 border border-orange-200">
              {activePrizes.length}/{prizes.length}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure o nome e a probabilidade de cada item (total 100%).
          </p>
        </div>

        <button
          onClick={resetDefaultPrizes}
          disabled={isSpinning}
          title="Restaurar prêmios de exemplo"
          className="text-xs text-slate-500 hover:text-orange-600 flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-orange-50 transition disabled:opacity-50 shrink-0 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Exemplos</span>
        </button>
      </div>

      {/* Caixa de Status das Probabilidades */}
      <div
        className={`border rounded-xl p-3 flex items-center justify-between text-xs transition ${
          isTotal100
            ? "bg-orange-50/80 border-orange-200"
            : "bg-amber-50/90 border-amber-300"
        }`}
      >
        <div className="min-w-0 flex-1 pr-2">
          <div className="flex items-center gap-1.5 font-semibold text-slate-800">
            {!isTotal100 && <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />}
            <span>
              {hasCustomProbabilities
                ? "Probabilidades Ponderadas Personalizadas"
                : "Probabilidade Equitativa Automática"}
            </span>
          </div>
          <p className="text-slate-500 text-[11px] mt-0.5">
            {hasCustomProbabilities
              ? isTotal100
                ? "Soma total configurada fecha perfeitamente em 100%."
                : `Soma atual: ${totalFormatted}% (as chances serão ajustadas para 100%).`
              : `Cada opção tem chance igual de ${(100 / (activePrizes.length || 1)).toFixed(2)}%.`}
          </p>
        </div>

        <div className="flex flex-col items-end shrink-0 gap-1">
          <span
            className={`text-base font-black ${
              isTotal100 ? "text-orange-600" : "text-amber-600"
            }`}
          >
            {hasCustomProbabilities ? `${totalFormatted}%` : "100%"}
          </span>
          {hasCustomProbabilities && (
            <button
              onClick={distributeEqualProbabilities}
              disabled={isSpinning}
              title="Redistribuir chances iguais para todos"
              className="text-[10px] font-semibold text-orange-600 hover:text-orange-700 underline cursor-pointer"
            >
              Dividir por igual
            </button>
          )}
        </div>
      </div>

      {/* Formulário para Adicionar Prêmio com Chance % */}
      <form onSubmit={handleAddPrize} className="flex gap-2">
        <input
          type="text"
          value={newPrizeName}
          onChange={(e) => setNewPrizeName(e.target.value)}
          placeholder="Ex: Óculos de Sol..."
          maxLength={30}
          disabled={isSpinning || prizes.length >= 16}
          className="flex-1 min-w-0 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white transition disabled:opacity-50"
        />
        <div className="relative w-20 sm:w-24 shrink-0">
          <input
            type="number"
            step="0.1"
            min="0.1"
            max="100"
            value={newPrizeProb}
            onChange={(e) => setNewPrizeProb(e.target.value)}
            placeholder="Auto"
            title="Probabilidade em % (opcional)"
            disabled={isSpinning || prizes.length >= 16}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-2.5 pr-6 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white transition disabled:opacity-50"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400 pointer-events-none">
            %
          </span>
        </div>
        <button
          type="submit"
          disabled={isSpinning || !newPrizeName.trim() || prizes.length >= 16}
          className="bg-orange-600 hover:bg-orange-500 active:scale-95 text-white font-bold px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm flex items-center gap-1 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Adicionar</span>
        </button>
      </form>

      {/* Mensagem de Erro / Alerta se houver */}
      {feedbackError && (
        <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 p-2.5 rounded-lg flex items-center justify-between">
          <span className="truncate">{feedbackError}</span>
          <button
            onClick={() => setFeedbackError(null)}
            className="text-slate-400 hover:text-slate-700 ml-1 shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Lista de Prêmios — Expandida para cima com máxima visibilidade */}
      <div className="max-h-[440px] xl:max-h-[500px] 2xl:max-h-[560px] overflow-y-auto overflow-x-hidden space-y-2 no-scrollbar pr-0.5">
        {prizes.map((prize, idx) => {
          const activeIndex = activePrizes.findIndex((p) => p.id === prize.id);
          const effectiveChance =
            activeIndex !== -1 ? normalizedProbabilities[activeIndex] : null;

          return (
            <div
              key={prize.id}
              className={`flex items-center justify-between gap-2 p-2.5 rounded-xl border transition ${
                prize.active
                  ? "bg-slate-50 border-slate-200 hover:border-orange-300 hover:bg-orange-50/30"
                  : "bg-slate-100/60 border-slate-200/60 opacity-60"
              }`}
            >
              {editingId === prize.id ? (
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    maxLength={30}
                    placeholder="Nome do prêmio"
                    className="flex-1 min-w-0 bg-white border border-orange-500 rounded-lg px-2 py-1 text-xs text-slate-900 focus:outline-none"
                    autoFocus
                  />
                  <div className="relative w-18 shrink-0">
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="100"
                      value={editingProb}
                      onChange={(e) => setEditingProb(e.target.value)}
                      placeholder="Auto"
                      className="w-full bg-white border border-orange-500 rounded-lg pl-2 pr-5 py-1 text-xs text-slate-900 focus:outline-none"
                      title="Porcentagem de chance"
                    />
                    <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                      %
                    </span>
                  </div>
                  <button
                    onClick={() => handleSaveEdit(prize.id)}
                    className="p-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white shrink-0 cursor-pointer"
                    title="Salvar"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="p-1.5 rounded-md bg-slate-300 hover:bg-slate-400 text-slate-700 shrink-0 cursor-pointer"
                    title="Cancelar"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-xs font-mono text-slate-400 w-4 shrink-0">
                      {idx + 1}.
                    </span>
                    <span
                      className={`text-xs sm:text-sm font-semibold truncate ${
                        prize.active ? "text-slate-900" : "line-through text-slate-400"
                      }`}
                    >
                      {prize.name}
                    </span>
                  </div>

                  {/* Badge de Probabilidade Efetiva */}
                  {prize.active && effectiveChance !== null && (
                    <div
                      title={
                        prize.probability !== undefined
                          ? `Probabilidade configurada: ${prize.probability}%`
                          : "Probabilidade calculada automaticamente"
                      }
                      className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-orange-100/90 text-orange-800 text-[11px] font-bold shrink-0 border border-orange-200"
                    >
                      <Percent className="w-2.5 h-2.5 text-orange-600" />
                      <span>{effectiveChance.toFixed(1)}%</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1 shrink-0">
                    {/* Ativar / Desativar */}
                    <button
                      onClick={() => handleToggle(prize.id)}
                      disabled={isSpinning}
                      title={prize.active ? "Desativar opção" : "Ativar opção"}
                      className={`p-1.5 rounded-lg transition cursor-pointer ${
                        prize.active
                          ? "text-orange-600 hover:bg-orange-100"
                          : "text-slate-400 hover:bg-slate-200"
                      }`}
                    >
                      {prize.active ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </button>

                    {/* Editar Nome e Probabilidade */}
                    <button
                      onClick={() => handleStartEdit(prize.id, prize.name, prize.probability)}
                      disabled={isSpinning}
                      title="Editar nome e probabilidade"
                      className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition disabled:opacity-50 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Excluir */}
                    <button
                      onClick={() => handleRemove(prize.id)}
                      disabled={isSpinning}
                      title="Remover prêmio"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-100 rounded-lg transition disabled:opacity-50 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
