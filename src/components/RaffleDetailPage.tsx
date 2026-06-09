/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Raffle, TicketStatus } from '../types';
import { HelpCircle, Sparkles, ShoppingCart, Check, X, Search, ChevronLeft, ChevronRight, Hash, Info, Calendar } from 'lucide-react';

interface RaffleDetailPageProps {
  raffle: Raffle;
  occupied: {
    [number: string]: {
      status: TicketStatus;
      buyerName: string;
      phone: string;
      cpf: string;
    }
  };
  stats: {
    paid: number;
    reserved: number;
    available: number;
  };
  onCheckout: (selectedNumbers: string[]) => void;
}

const BATCH_SIZE = 500;

export default function RaffleDetailPage({ raffle, occupied, stats, onCheckout }: RaffleDetailPageProps) {
  const [selectedNumbers, setSelectedNumbers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentBatch, setCurrentBatch] = useState(0);
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'reserved' | 'paid'>('all');

  const totalNumbers = raffle.totalNumbers;
  const digits = totalNumbers === 10000 ? 4 : totalNumbers === 1000 ? 3 : 2;

  // Maximum batch count
  const totalBatches = Math.ceil(totalNumbers / BATCH_SIZE);

  // Generate dynamic paging labels (e.g. "0001 - 0500")
  const batchLabels = useMemo(() => {
    const labels = [];
    for (let i = 0; i < totalBatches; i++) {
      const start = i * BATCH_SIZE + 1;
      const end = Math.min((i + 1) * BATCH_SIZE, totalNumbers);
      const startStr = String(start).padStart(digits, '0');
      const endStr = String(end).padStart(digits, '0');
      labels.push(`${startStr} - ${endStr}`);
    }
    return labels;
  }, [totalBatches, totalNumbers, digits]);

  // Specific single number query handler
  const handleSearchNumber = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;

    const numVal = parseInt(searchQuery, 10);
    if (isNaN(numVal) || numVal < 1 || numVal > totalNumbers) {
      alert(`Por favor, insira um número entre 1 e ${totalNumbers}`);
      return;
    }

    // Determine which batch contains this number
    const targetBatch = Math.floor((numVal - 1) / BATCH_SIZE);
    setCurrentBatch(targetBatch);

    const targetNumStr = String(numVal).padStart(digits, '0');
    
    // Check if available
    const occupiedData = occupied[targetNumStr];
    if (occupiedData && occupiedData.status !== 'available') {
      alert(`O número ${targetNumStr} já está ocupado (Status: ${occupiedData.status === 'paid' ? 'Pago' : occupiedData.status === 'reserved' ? 'Reservado' : 'Bloqueado'}).`);
    } else {
      // Toggle selection
      setSelectedNumbers(prev => {
        if (prev.includes(targetNumStr)) {
          return prev.filter(n => n !== targetNumStr);
        } else {
          return [...prev, targetNumStr];
        }
      });
    }
  };

  // Compute numbers list inside current page range
  const pageNumbers = useMemo(() => {
    const nums = [];
    const startNum = currentBatch * BATCH_SIZE + 1;
    const endNum = Math.min((currentBatch + 1) * BATCH_SIZE, totalNumbers);

    for (let i = startNum; i <= endNum; i++) {
      nums.push(String(i).padStart(digits, '0'));
    }
    return nums;
  }, [currentBatch, totalNumbers, digits]);

  const toggleSelectNumber = (numStr: string, status: TicketStatus) => {
    if (status === 'paid' || status === 'reserved' || status === 'blocked') {
      return; // Cannot select occupied
    }

    setSelectedNumbers(prev => {
      if (prev.includes(numStr)) {
        return prev.filter(n => n !== numStr);
      } else {
        return [...prev, numStr];
      }
    });
  };

  const clearSelection = () => {
    setSelectedNumbers([]);
  };

  const getTicketStatus = (numStr: string): TicketStatus => {
    const data = occupied[numStr];
    if (data) return data.status;
    return 'available';
  };

  // Progress percentage
  const totalSoldAndReserved = stats.paid + stats.reserved;
  const progressPercent = Math.min(100, Math.round((stats.paid / totalNumbers) * 100));

  // Filter local numbers inside current batch for visual searches
  const filteredPageNumbers = useMemo(() => {
    return pageNumbers.filter(numStr => {
      const status = getTicketStatus(numStr);
      if (statusFilter === 'all') return true;
      if (statusFilter === 'available') return status === 'available';
      if (statusFilter === 'reserved') return status === 'reserved';
      if (statusFilter === 'paid') return status === 'paid';
      return true;
    });
  }, [pageNumbers, occupied, statusFilter]);

  return (
    <div className="space-y-8" id="raffle-details-view">
      {/* Back and Breadcrumbs / Basic Details Card */}
      <div className="bg-white dark:bg-zinc-950/40 rounded-2xl border border-zinc-200 dark:border-zinc-900 overflow-hidden shadow-sm flex flex-col lg:flex-row">
        <div className="w-full lg:w-1/2 h-64 lg:h-auto min-h-[320px] relative bg-zinc-100 dark:bg-zinc-900">
          <img
            src={raffle.imageUrl}
            alt={raffle.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-4 left-4 bg-emerald-600 text-white font-mono font-bold px-3 py-1.5 rounded-lg shadow text-sm">
            R$ {raffle.numberPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / número
          </div>
        </div>

        <div className="p-6 lg:p-8 w-full lg:w-1/2 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-1.5 text-xs text-orange-600 dark:text-orange-400 font-semibold bg-orange-50 dark:bg-orange-950/20 px-2.5 py-1 rounded-full w-fit border border-orange-100 dark:border-orange-900/30">
              <Calendar className="w-3.5 h-3.5" />
              Sorteio: {raffle.drawDate ? new Date(raffle.drawDate).toLocaleDateString('pt-BR') : 'A definir'}
            </div>
            
            <h1 className="text-xl md:text-2xl font-black text-zinc-900 dark:text-white leading-tight">
              {raffle.name}
            </h1>
            
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {raffle.description}
            </p>

            {/* PRÊMIOS PRINCIPAIS */}
            {(raffle.prize1 || raffle.prize2 || raffle.prize3) && (
              <div className="p-3.5 rounded-xl border border-zinc-150 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-950/30 space-y-2">
                <span className="block text-[10px] font-black uppercase tracking-wider text-zinc-450 dark:text-zinc-500 font-mono">🏆 Prêmios Principais da Ação</span>
                <div className="space-y-2 text-xs">
                  {raffle.prize1 && (
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/20 text-xs font-black text-amber-500 font-mono">1º</span>
                      <span className="font-bold text-zinc-800 dark:text-zinc-200 font-sans">{raffle.prize1}</span>
                    </div>
                  )}
                  {raffle.prize2 && (
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-zinc-405/20 text-xs font-black text-zinc-400 font-mono">2º</span>
                      <span className="font-semibold text-zinc-700 dark:text-zinc-350 font-sans">{raffle.prize2}</span>
                    </div>
                  )}
                  {raffle.prize3 && (
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-orange-450/20 text-xs font-black text-orange-500 font-mono">3º</span>
                      <span className="text-zinc-600 dark:text-zinc-300 font-sans">{raffle.prize3}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                <span>Progresso das Vendas ({stats.paid} pagos)</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{progressPercent}%</span>
              </div>
              <div className="relative w-full h-2.5 bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
                <div
                  className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-emerald-500 to-teal-500 dark:from-emerald-600 dark:to-teal-600 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-zinc-400 font-mono">
                <span>Total: {totalNumbers} cotas</span>
                <span>Restam: {stats.available} cotas</span>
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-100 dark:border-zinc-900 pt-4 grid grid-cols-3 gap-2 text-center">
            <div className="bg-emerald-50/50 dark:bg-emerald-950/10 p-2.5 rounded-xl border border-emerald-100/40 dark:border-emerald-950/30">
              <span className="block text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase font-mono">Vendidos</span>
              <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono">{stats.paid}</span>
            </div>
            <div className="bg-amber-50/50 dark:bg-amber-950/10 p-2.5 rounded-xl border border-amber-100/40 dark:border-amber-950/30">
              <span className="block text-[11px] font-semibold text-amber-700 dark:text-amber-400 uppercase font-mono">Reservados</span>
              <span className="text-base font-bold text-amber-600 dark:text-amber-400 font-mono">{stats.reserved}</span>
            </div>
            <div className="bg-zinc-100/80 dark:bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-200/40 dark:border-zinc-800/40">
              <span className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase font-mono">Disponíveis</span>
              <span className="text-base font-bold text-zinc-600 dark:text-zinc-300 font-mono">{stats.available}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Grid Section with Tabs & Filters */}
      <div className="bg-white dark:bg-zinc-950/40 rounded-2xl border border-zinc-200 dark:border-zinc-900 p-6 space-y-6" id="numbers-grid-container">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-900 pb-5">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-1.5 font-sans">
              <ShoppingCart className="w-5 h-5 text-emerald-600" />
              Escolha Seus Números Premiados
            </h2>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              Selecione manualmente os números diretamente na cartela visual abaixo.
            </p>
          </div>

          {/* Quick Number Search Input */}
          <form onSubmit={handleSearchNumber} className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-grow md:w-56">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-600" />
              <input
                type="text"
                placeholder="Ex: 0482 ou 1000"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl py-2 pl-9 pr-3 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="bg-zinc-900 hover:bg-zinc-850 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white font-medium py-2 px-4 rounded-xl text-xs flex items-center gap-1 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" /> Ir para Número
            </button>
          </form>
        </div>

        {/* Status Legend */}
        <div className="flex flex-wrap gap-4 items-center justify-between text-xs text-zinc-650 dark:text-zinc-400 border-b border-zinc-100 dark:border-zinc-900/50 pb-4">
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded bg-slate-800 border border-white/5 inline-block" />
              <span>Livre</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded bg-indigo-600 inline-block" />
              <span>Selecionado</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded bg-amber-500/20 border border-amber-500/30 inline-block" />
              <span>Reservado</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded bg-red-900/60 border border-red-500/30 inline-block" />
              <span>Pago</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded bg-zinc-805 border border-zinc-800 opacity-40 inline-block" />
              <span>Bloqueado</span>
            </div>
          </div>

          <div className="flex gap-1 bg-zinc-50 dark:bg-zinc-900/60 p-1 rounded-lg border border-zinc-150 dark:border-zinc-850">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium cursor-pointer transition-all ${
                statusFilter === 'all'
                  ? 'bg-white dark:bg-zinc-850 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setStatusFilter('available')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium cursor-pointer transition-all ${
                statusFilter === 'available'
                  ? 'bg-white dark:bg-zinc-850 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              Livres
            </button>
            <button
              onClick={() => setStatusFilter('reserved')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium cursor-pointer transition-all ${
                statusFilter === 'reserved'
                  ? 'bg-white dark:bg-zinc-850 text-amber-600 dark:text-amber-400 shadow-sm'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              Reservados
            </button>
            <button
              onClick={() => setStatusFilter('paid')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium cursor-pointer transition-all ${
                statusFilter === 'paid'
                  ? 'bg-white dark:bg-zinc-850 text-green-600 dark:text-green-400 shadow-sm'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              Pagos
            </button>
          </div>
        </div>

        {/* Batch Pagination Controls (Essential for up to 10k items) */}
        {totalBatches > 1 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-500 dark:text-zinc-400 px-1">
              <span>Navegação pelas páginas da cartela ({totalNumbers} números):</span>
              <span className="font-mono text-zinc-700 dark:text-zinc-300">Pág. {currentBatch + 1} de {totalBatches}</span>
            </div>
            
            <div className="grid grid-cols-2 min-[480px]:grid-cols-4 sm:grid-cols-5 md:grid-cols-8 gap-1.5">
              {batchLabels.map((label, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentBatch(idx)}
                  className={`py-1.5 px-2 rounded-lg text-[10px] sm:text-[11px] font-semibold text-center border font-mono transition-all cursor-pointer ${
                    currentBatch === idx
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm font-bold scale-[1.02]'
                      : 'bg-zinc-50 text-zinc-600 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Dynamic Display Grid */}
        <div className="relative">
          {filteredPageNumbers.length === 0 ? (
            <div className="p-12 text-center text-zinc-400 bg-zinc-50 dark:bg-zinc-900/30 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
              <Info className="w-8 h-8 mx-auto mb-2 text-zinc-300 dark:text-zinc-700" />
              <p className="text-sm font-medium">Nenhum número com este status nesta página.</p>
              <button
                onClick={() => setStatusFilter('all')}
                className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold underline cursor-pointer"
              >
                Exibir todos os números.
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-4 min-[380px]:grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-15 gap-2" id="ticket-slots-grid">
              {filteredPageNumbers.map(numStr => {
                const status = getTicketStatus(numStr);
                const isSelected = selectedNumbers.includes(numStr);

                // Build tailored visual styles depending on statuses
                let styles = 'bg-slate-800/85 hover:bg-slate-700 hover:text-white hover:border-slate-500 border border-white/5 text-slate-400'; // available
                let cursorStyle = 'cursor-pointer hover:scale-[1.08] transition-all';

                if (isSelected) {
                  styles = 'bg-emerald-600 border-emerald-400 text-white font-black scale-[1.04] shadow-[0_0_10px_rgba(16,185,129,0.4)]';
                } else if (status === 'paid') {
                  styles = 'bg-red-900/60 text-red-200 border-red-500/30 font-bold';
                  cursorStyle = 'cursor-not-allowed opacity-50';
                } else if (status === 'reserved') {
                  styles = 'bg-amber-500/20 text-amber-200 border-amber-500/30 font-semibold';
                  cursorStyle = 'cursor-not-allowed opacity-75';
                } else if (status === 'blocked') {
                  styles = 'bg-zinc-805 bg-opacity-40 text-zinc-500 border-zinc-800 border-dotted';
                  cursorStyle = 'cursor-not-allowed opacity-40';
                }

                return (
                  <button
                    key={numStr}
                    disabled={status !== 'available' && !isSelected}
                    onClick={() => toggleSelectNumber(numStr, status)}
                    title={`Número ${numStr} - Status: ${status === 'available' ? 'Livre' : status === 'paid' ? 'Pago' : status === 'reserved' ? 'Reservado' : 'Bloqueado'}`}
                    className={`h-11 sm:h-12 flex flex-col items-center justify-center border text-xs sm:text-xs font-mono font-medium rounded-lg transition-all ${styles} ${cursorStyle}`}
                    id={`slot-button-${numStr}`}
                  >
                    <span>{numStr}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-4 border border-zinc-200/60 dark:border-zinc-800 text-xs flex items-start gap-2.5 text-zinc-500 dark:text-zinc-400 leading-normal">
          <HelpCircle className="w-5 h-5 text-zinc-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-zinc-700 dark:text-zinc-300">Termos de Reserva da Rifa:</span>
            <p>Ao selecionar seus bilhetes e prosseguir clicando no carrinho, seus números ficarão reservados pelo período improrrogável de 15 minutos até que o pagamento correspondente seja aprovado pelo Pix. Se não pago, as cotas voltam automaticamente para novos compradores.</p>
          </div>
        </div>
      </div>

      {raffle.rules && (
        <div className="bg-white dark:bg-zinc-950/40 rounded-2xl border border-zinc-200 dark:border-zinc-900 p-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-mono mb-3">
            Regulamento Completo
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 whitespace-pre-line leading-relaxed">
            {raffle.rules}
          </p>
        </div>
      )}

      {/* Persistent Shopping Cart Bottom Bar (Sticky when selection exists) */}
      {selectedNumbers.length > 0 && (
        <div
          className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 dark:bg-zinc-950/95 backdrop-blur border-t border-zinc-200 dark:border-zinc-900 z-40 shadow-2xl transition-all animate-in slide-in-from-bottom"
          id="raffle-shopping-cart-bar"
        >
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="p-3 bg-emerald-500 text-white rounded-xl shadow-md hidden sm:block">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <div className="space-y-1 w-full sm:w-auto">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-zinc-950 dark:text-white font-sans">
                    {selectedNumbers.length} {selectedNumbers.length === 1 ? 'Número' : 'Números'} selecionados
                  </span>
                  <button
                    onClick={clearSelection}
                    className="text-xs text-red-500 hover:underline flex items-center gap-0.5 cursor-pointer font-semibold"
                  >
                    (esvaziar)
                  </button>
                </div>
                {/* Visual numbers horizontal scroll */}
                <div className="flex gap-1 overflow-x-auto max-w-[280px] sm:max-w-md md:max-w-lg py-0.5 no-scrollbar">
                  {selectedNumbers.map(n => (
                    <span
                      key={n}
                      className="inline-flex items-center gap-0.5 font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-950 text-emerald-600 border border-zinc-200/60 dark:border-zinc-800"
                    >
                      {n}
                      <X
                        className="w-3 h-3 text-zinc-400 hover:text-red-500 cursor-pointer"
                        onClick={() => setSelectedNumbers(prev => prev.filter(x => x !== n))}
                      />
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between md:justify-end gap-5 w-full md:w-auto border-t md:border-t-0 border-zinc-100 dark:border-zinc-900 pt-3 md:pt-0">
              <div className="text-left md:text-right">
                <span className="text-xs text-zinc-400 dark:text-zinc-500 block font-medium">Subtotal Compra</span>
                <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  R$ {(selectedNumbers.length * raffle.numberPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <button
                onClick={() => onCheckout(selectedNumbers)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold py-3 px-6 rounded-xl flex items-center gap-2 hover:scale-[1.03] active:scale-[0.98] cursor-pointer transition-all shadow-md shadow-emerald-500/10"
                id="checkout-trigger-button"
              >
                Participar Agora (PIX) <Check className="w-4 h-4 animate-bounce" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
