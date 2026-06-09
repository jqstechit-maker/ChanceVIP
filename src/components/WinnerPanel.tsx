/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Raffle } from '../types';
import { Trophy, Calendar, Hash, MapPin, Award } from 'lucide-react';

interface WinnerPanelProps {
  raffles: Raffle[];
  onSelectRaffle: (id: string) => void;
}

export default function WinnerPanel({ raffles, onSelectRaffle }: WinnerPanelProps) {
  const drawnRaffles = raffles.filter(r => r.status === 'drawn');

  return (
    <div className="space-y-8" id="winners-section">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center justify-center p-2 bg-amber-100 dark:bg-amber-950/40 rounded-full text-amber-600 dark:text-amber-400 mb-2">
          <Trophy className="w-6 h-6 animate-pulse" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl font-sans">
          Nossos Ganhadores
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Acompanhe os resultados baseados na Loteria Federal. Quem sabe você será o próximo a levar o grande prêmio para casa!
        </p>
      </div>

      {drawnRaffles.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-zinc-900 rounded-2xl border border-zinc-800 text-center space-y-3">
          <Award className="w-12 h-12 text-zinc-300 dark:text-zinc-700" />
          <p className="text-zinc-500 dark:text-zinc-400 font-medium">Nenhum sorteio homologado ainda.</p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">Volte em breve para conferir os resultados!</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {drawnRaffles.map(raffle => (
            <div
              key={raffle.id}
              className="bg-zinc-950/50 rounded-2xl border border-zinc-900 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col md:flex-row relative group"
              id={`winner-card-${raffle.id}`}
            >
              {/* Decorative side accent */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500" />
              
              <div className="w-full md:w-2/5 relative h-48 md:h-auto overflow-hidden bg-zinc-100 dark:bg-zinc-900 flex-shrink-0">
                <img
                  src={raffle.imageUrl}
                  alt={raffle.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4 md:hidden">
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 px-2 py-1 rounded inline-block w-fit mb-1">
                    Concluído
                  </span>
                  <h4 className="text-white font-bold text-sm line-clamp-1">{raffle.name}</h4>
                </div>
              </div>

              <div className="p-6 flex flex-col justify-between flex-grow space-y-4">
                <div className="hidden md:block">
                  <span className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-full border border-emerald-100 dark:border-emerald-900/50">
                    Sorteio Finalizado
                  </span>
                  <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-100 mt-2 line-clamp-2 leading-snug">
                    {raffle.name}
                  </h3>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-900/60 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">Número Sorteado:</span>
                    <div className="flex items-center space-x-1.5">
                      <Hash className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-xl font-mono font-black text-amber-600 dark:text-amber-400 tracking-wider">
                        {raffle.winnerNumber}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-zinc-200/50 dark:border-zinc-800/50 my-1" />

                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2 text-zinc-700 dark:text-zinc-300 text-sm font-semibold">
                      <Trophy className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span className="truncate">{raffle.winnerName}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-zinc-500 dark:text-gray-400 text-xs">
                      <MapPin className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-600 flex-shrink-0" />
                      <span>{raffle.winnerCity}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-gray-500 dark:text-gray-400 space-y-2 sm:space-y-0">
                  <div className="flex items-center space-x-1.5 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{raffle.drawDate ? new Date(raffle.drawDate).toLocaleDateString('pt-BR') : '---'}</span>
                  </div>
                  <span className="text-zinc-400 dark:text-zinc-500 italic bg-zinc-100 dark:bg-zinc-900 py-0.5 px-2 rounded">
                    {raffle.drawConcurso}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
