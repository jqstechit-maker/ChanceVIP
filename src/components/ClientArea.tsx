/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TicketSale } from '../types';
import { Search, Hash, Clock, CheckCircle2, AlertTriangle, ArrowRight, UserCheck, Calendar, RefreshCw } from 'lucide-react';

interface ClientAreaProps {
  onSelectPayment: (payment: TicketSale) => void;
  autoFocusQuery?: string;
}

export default function ClientArea({ onSelectPayment, autoFocusQuery = '' }: ClientAreaProps) {
  const [query, setQuery] = useState(autoFocusQuery);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<(TicketSale & { raffleName: string; raffleImage: string; drawDate: string; drawConcurso: string })[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setHasSearched(true);
    setErrorMsg('');

    try {
      const response = await fetch(`/api/customer/tickets?query=${encodeURIComponent(query.trim())}`);
      if (response.ok) {
        const data = await response.json();
        setResults(data);
      } else {
        setErrorMsg('Erro ao consultar servidor. Tente novamente mais tarde.');
      }
    } catch (error) {
      console.error('Inquiry error:', error);
      setErrorMsg('Falha de conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: 'pending' | 'approved' | 'expired') => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50">
            <CheckCircle2 className="w-3.5 h-3.5" /> Pago / Aprovado
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/50 animate-pulse">
            <Clock className="w-3.5 h-3.5" /> Aguardando PIX
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/50">
            <AlertTriangle className="w-3.5 h-3.5" /> Cancelado / Expirado
          </span>
        );
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6" id="client-area-container">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center p-2 bg-emerald-100 dark:bg-emerald-950/50 rounded-full text-emerald-600 dark:text-emerald-400 mb-2">
          <UserCheck className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white font-sans sm:text-3xl">
          Meus Números / Meus Bilhetes
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Consulte rapidamente suas cotas reservadas e pagas utilizando seu CPF ou Telefone associados.
        </p>
      </div>

      <div className="bg-zinc-950/50 rounded-2xl border border-zinc-900 overflow-hidden shadow-sm p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 dark:text-zinc-600" />
              <input
                type="text"
                placeholder="Insira seu CPF ou Telefone (ex: 11999998888)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl py-3 pl-11 pr-4 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                id="customer-search-input"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-6 py-3 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer text-sm"
              id="customer-search-submit"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Buscando...
                </>
              ) : (
                'Consultar'
              )}
            </button>
          </div>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            Dica: Digite apenas os números do seu CPF ou do seu telefone com DDD para obter resultados instantâneos.
          </p>
        </form>

        {errorMsg && (
          <div className="mt-4 p-3.5 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40 text-red-600 dark:text-red-400 rounded-xl text-xs font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {hasSearched && !loading && (
        <div id="search-results-section" className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-mono">
            Compras Encontradas ({results.length})
          </h3>

          {results.length === 0 ? (
            <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 text-center space-y-2">
              <p className="text-zinc-600 dark:text-zinc-300 font-medium">Nenhum bilhete encontrado para "{query}"</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-500 max-w-sm mx-auto">
                Verifique se o número do telefone com DDD ou CPF inserido está idêntico ao cadastrado na hora de efetuar a compra.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((sale) => (
                <div
                  key={sale.paymentId}
                  className="bg-zinc-950/50 rounded-2xl border border-zinc-900/60 p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col md:flex-row gap-5 items-start md:items-center justify-between"
                  id={`purchase-${sale.paymentId}`}
                >
                  <div className="flex gap-4 items-center">
                    <img
                      src={sale.raffleImage}
                      alt={sale.raffleName}
                      className="w-12 h-12 md:w-16 md:h-16 rounded-xl object-cover flex-shrink-0 bg-zinc-100 dark:bg-zinc-900"
                      referrerPolicy="no-referrer"
                    />
                    <div className="space-y-1.5 max-w-md">
                      <h4 className="text-sm md:text-base font-bold text-zinc-800 dark:text-zinc-100 leading-tight line-clamp-1">
                        {sale.raffleName}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                        <span className="bg-zinc-100 dark:bg-zinc-900 py-0.5 px-2 rounded">
                          PIX: {sale.paymentId.substring(0, 15)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(sale.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="w-full md:w-auto border-t md:border-t-0 border-zinc-100 dark:border-zinc-800/80 pt-4 md:pt-0 flex flex-col md:items-end gap-3">
                    <div className="flex items-center justify-between md:justify-end gap-4">
                      <div className="text-left md:text-right">
                        <span className="text-xs text-zinc-400 dark:text-zinc-500 block">Total Pago</span>
                        <span className="text-sm font-bold text-zinc-900 dark:text-white">
                          R$ {sale.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      {getStatusBadge(sale.status)}
                    </div>

                    <div className="flex flex-col gap-2 w-full">
                      {/* Numbers purchased */}
                      <div className="flex flex-wrap gap-1.5 py-1">
                        {sale.numbers.map((nu) => (
                          <span
                            key={nu}
                            className="inline-block font-mono text-xs font-bold px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200/50 dark:border-borderColor"
                          >
                            {nu}
                          </span>
                        ))}
                      </div>

                      {sale.status === 'pending' && (
                        <button
                          onClick={() => onSelectPayment(sale)}
                          className="w-full md:w-auto bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold py-2 px-3.5 rounded-lg flex items-center justify-center gap-1 border border-amber-500/15 cursor-pointer hover:scale-[1.01] transition-all"
                        >
                          Pagar via PIX QR Code <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {sale.status === 'approved' && (
                        <div className="flex items-center gap-1.5 self-start md:self-end text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-1 rounded">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Bilhetes homologados!
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
