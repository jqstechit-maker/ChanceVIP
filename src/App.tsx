/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Raffle, TicketSale, GatewayConfig } from './types';
import WinnerPanel from './components/WinnerPanel';
import ClientArea from './components/ClientArea';
import RaffleDetailPage from './components/RaffleDetailPage';
import AdminPanel from './components/AdminPanel';
import { 
  Trophy, Menu, X, Sun, Moon, Ticket, Coins, LayoutDashboard, Check, 
  CheckCircle2, Copy, ArrowRight, Search, Calendar, ChevronRight, Info, 
  Lock, User, Sparkles, Clock, ArrowLeft, AlertTriangle, Download, RefreshCw 
} from 'lucide-react';

interface CheckoutModalProps {
  raffle: Raffle;
  selectedNumbers: string[];
  onClose: () => void;
  onSuccess: (payment: TicketSale) => void;
}

// Sub-component to manage the 15-minute countdown and billing simulation
function CheckoutModal({ raffle, selectedNumbers, onClose, onSuccess }: CheckoutModalProps) {
  const [form, setForm] = useState({ name: '', cpf: '', phone: '', email: '', city: 'São Paulo - SP' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const totalAmount = selectedNumbers.length * raffle.numberPrice;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.cpf || !form.phone || !form.email) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/tickets/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          raffleId: raffle.id,
          numbers: selectedNumbers,
          buyer: form
        })
      });

      if (response.ok) {
        const data = await response.json();
        onSuccess(data.payment);
      } else {
        const errData = await response.json();
        setError(errData.error || 'Erro ao processar reserva. Tente outros números.');
      }
    } catch (err) {
      console.error(err);
      setError('Falha de comunicação com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-900 max-w-md w-full shadow-2xl relative my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-450 hover:text-zinc-650 cursor-pointer text-sm font-bold font-mono bg-zinc-100 dark:bg-zinc-900 p-1 rounded-full w-8 h-8 flex items-center justify-center"
        >
          ✕
        </button>

        <div className="space-y-4 text-zinc-900 dark:text-zinc-100">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-5 h-5 text-emerald-500 animate-pulse" />
            <h3 className="text-base font-bold uppercase tracking-tight font-sans">Identificação do Comprador</h3>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-900/40 p-4 rounded-xl border space-y-1.5 text-xs">
            <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-zinc-400">Resumo do pedido</span>
            <p className="font-bold text-zinc-850 dark:text-white">{raffle.name}</p>
            <p className="font-mono text-zinc-500">
              Cotas ({selectedNumbers.length}): {selectedNumbers.join(', ')}
            </p>
            <p className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
              Total: R$ {totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <label className="block font-semibold">Nome Completo *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="Insira seu nome"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block font-semibold">CPF (Para validação) *</label>
                <input
                  type="text"
                  required
                  value={form.cpf}
                  onChange={(e) => setForm(p => ({ ...p, cpf: e.target.value }))}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="000.000.000-00"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-semibold">Telefone (WhatsApp) *</label>
                <input
                  type="text"
                  required
                  value={form.phone}
                  onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="Ex: 11999998888"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block font-semibold">E-mail *</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="suporte@gmail.com"
                />
              </div>
              <div className="space-y-1">
                <label className="block font-semibold">Sua Cidade (UF) *</label>
                <input
                  type="text"
                  required
                  value={form.city}
                  onChange={(e) => setForm(p => ({ ...p, city: e.target.value }))}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="Belo Horizonte - MG"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-650 rounded-lg text-[11px] font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 hover:scale-[1.01] transition-transform shadow-md shadow-emerald-500/10"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Reservando...
                </>
              ) : (
                <>
                  Reservar e Gerar Cobrança PIX <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            <p className="text-[10px] text-zinc-400 text-center leading-normal">
              Ao gerar a cobrança, seus números serão bloqueados na cartela exclusiva por 15 minutos até a quitação.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

// Payment visual board displaying visual QR and Simulated approving callback trigger
function ActivePaymentDrawer({ payment, raffles, onClose, onRefreshData }: { payment: TicketSale; raffles: Raffle[]; onClose: () => void; onRefreshData: () => void }) {
  const [secondsLeft, setSecondsLeft] = useState(900); // 15 mins (900 seconds)
  const [copied, setCopied] = useState(false);
  const [approving, setApproving] = useState(false);
  const [paid, setPaid] = useState(payment.status === 'approved');

  const instanceRaffle = raffles.find((r) => r.id === payment.raffleId);
  const raffleName = instanceRaffle ? instanceRaffle.name : 'Ação Premium';

  useEffect(() => {
    if (paid) return;

    // Calc remaining seconds left on mount
    const expiresTime = new Date(payment.expiresAt).getTime();
    const now = Date.now();
    const remainSecs = Math.max(0, Math.floor((expiresTime - now) / 1000));
    setSecondsLeft(remainSecs > 0 ? remainSecs : 900);

    const timer = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [payment, paid]);

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(payment.qrCodeCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulatePaymentApproval = async () => {
    setApproving(true);
    try {
      const response = await fetch('/api/tickets/pay-simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId: payment.paymentId })
      });

      if (response.ok) {
        setPaid(true);
        onRefreshData();
      } else {
        alert('Erro ao processar simulação.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setApproving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-900 max-w-sm w-full shadow-2xl relative my-8 block">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-450 hover:text-zinc-650 cursor-pointer text-sm font-bold font-mono bg-zinc-100 dark:bg-zinc-900 p-1 rounded-full w-8 h-8 flex items-center justify-center"
        >
          ✕
        </button>

        <div className="space-y-4 text-center text-zinc-900 dark:text-zinc-100">
          {!paid ? (
            /* Pending unpaid state display */
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="mx-auto inline-flex items-center justify-center p-2 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-500 border border-amber-100">
                <Clock className="w-6 h-6 animate-spin" />
              </div>

              <div>
                <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 uppercase tracking-tight">Cobrança PIX Gerada</h4>
                <p className="text-[11px] text-zinc-400">Escaneie o código abaixo no aplicativo do seu banco</p>
              </div>

              {/* Display visual QR code */}
              <div className="mx-auto w-48 h-48 bg-white p-2 rounded-2xl border border-zinc-100 shadow flex items-center justify-center">
                <img
                  src={payment.qrCode}
                  alt="PIX QR Code"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Expiration warning timer */}
              <div className="bg-amber-50 dark:bg-amber-950/10 p-3 rounded-xl border border-amber-100/50 dark:border-amber-900/20 text-xs flex items-center justify-between">
                <span className="font-semibold text-amber-850 dark:text-amber-400">Expira em:</span>
                <span className="font-mono text-base font-black text-amber-600 dark:text-amber-400">
                  {secondsLeft > 0 ? formatTimer(secondsLeft) : 'EXPIRADO'}
                </span>
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleCopy}
                  className="w-full bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-[0.98]"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400 animate-bounce" /> Copiado com Sucesso!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" /> Copiar Código PIX
                    </>
                  )}
                </button>

                {/* Manual PIX Info Card */}
                {payment.gateway === 'manual' && (
                  <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-150/40 p-4 rounded-xl text-left space-y-3 mt-3 animate-in fade-in duration-300">
                    <span className="text-[10px] font-black text-indigo-700 dark:text-indigo-400 uppercase tracking-wider block font-mono">
                      💼 Instância do PIX Próprio
                    </span>
                    
                    <div className="space-y-1.5 text-xs">
                      {payment.manualPixBank && (
                        <p className="text-zinc-700 dark:text-zinc-300">
                          <span className="text-[9px] font-bold text-zinc-400 uppercase font-mono mr-1">BANCO:</span>
                          <span className="font-semibold">{payment.manualPixBank}</span>
                        </p>
                      )}
                      {payment.manualPixKey && (
                        <p className="text-zinc-800 dark:text-zinc-200">
                          <span className="text-[9px] font-bold text-zinc-400 uppercase font-mono mr-1">CHAVE PIX:</span>
                          <span className="font-mono font-black select-all bg-zinc-100 dark:bg-zinc-900 p-0.5 px-1 rounded">{payment.manualPixKey}</span>
                        </p>
                      )}
                      {payment.manualPixName && (
                        <p className="text-zinc-700 dark:text-zinc-300">
                          <span className="text-[9px] font-bold text-zinc-400 uppercase font-mono mr-1">FAVORECIDO:</span>
                          <span className="font-semibold">{payment.manualPixName}</span>
                        </p>
                      )}
                    </div>
                    
                    {payment.manualPixInstructions && (
                      <div className="text-[10px] text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-950 p-2.5 rounded-lg border leading-relaxed border-zinc-100 dark:border-zinc-900">
                        {payment.manualPixInstructions}
                      </div>
                    )}

                    {payment.whatsappPhone && (
                      <a
                        href={`https://wa.me/${payment.whatsappPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                          `Olá! Realizei o pagamento do PIX para as minhas Cotas da ação "${raffleName}". Segue em anexo o comprovante!\n\n📋 *Detalhes da Reserva:*\n• Cotas: ${payment.numbers.join(', ')}\n• Valor: R$ ${payment.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n• Identificador da Fatura: ${payment.paymentId}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all hover:scale-[1.01] active:scale-[0.99] shadow cursor-pointer text-center"
                      >
                        <Sparkles className="w-3.5 h-3.5 animate-bounce" /> Enviar Comprovante do PIX
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Developer Testing / Reviewer Panel (Autosufficient simulation) */}
              <div className="p-3.5 bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-xl border border-dotted border-emerald-300 dark:border-emerald-800/40 text-left space-y-2.5">
                <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block font-mono">
                  ★ Sandbox Dev Simulation Panel
                </span>
                <p className="text-[10px] text-zinc-500 leading-normal">
                  Este applet opera com checkout simulado. Clique no botão de homologação abaixo para simular o recebimento do webhook e aprovação síncrona instantânea!
                </p>
                <button
                  onClick={handleSimulatePaymentApproval}
                  disabled={approving}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-1.5 px-3 rounded-lg text-[11px] font-bold cursor-pointer transition-transform hover:scale-[1.01] flex items-center justify-center gap-1 active:scale-[0.99]"
                >
                  {approving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Homologando PIX...
                    </>
                  ) : (
                    <>
                      Simular Pagamento Webhook (Aprovar)
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Confirmed Paid Display state */
            <div className="space-y-4 py-4 animate-in zoom-in-95 duration-300">
              <div className="mx-auto inline-flex items-center justify-center p-2 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 mb-1">
                <CheckCircle2 className="w-10 h-10 animate-pulse" />
              </div>

              <div className="space-y-1">
                <h4 className="text-lg font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-tight">Compra Confirmada!</h4>
                <p className="text-[11px] text-zinc-400 leading-normal">Seu pagamento PIX foi aprovado com sucesso via Webhook do Banco!</p>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-900/60 p-4 rounded-xl border border-dashed text-left text-xs space-y-2.5">
                <div>
                  <span className="text-[9px] text-zinc-400 block font-bold uppercase">Cotas Homologadas:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {payment.numbers.map(n => (
                      <span key={n} className="inline-block font-mono font-bold px-2 py-0.5 rounded bg-white dark:bg-zinc-950 text-emerald-600 border dark:border-zinc-800">
                        {n}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div>
                    <span className="text-zinc-400 block font-medium">Comprador</span>
                    <span className="text-zinc-800 dark:text-zinc-200 font-bold truncate block">{payment.buyer.name}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block font-medium">WhatsApp</span>
                    <span className="text-zinc-800 dark:text-zinc-200 font-mono font-bold block">{payment.buyer.phone}</span>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-teal-650 dark:text-teal-400 font-semibold bg-teal-50 dark:bg-teal-950/40 p-2.5 rounded-lg border border-teal-100 dark:border-teal-900/35">
                📞 Comprovante oficial enviado para seu WhatsApp!
              </div>

              <button
                onClick={() => {
                  onClose();
                }}
                className="w-full bg-zinc-900 hover:bg-zinc-850 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs cursor-pointer"
              >
                Voltar para os sorteios
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [view, setView] = useState<'home' | 'raffle-detail' | 'ganhadores' | 'meus-numeros' | 'admin'>('home');
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [selectedRaffleId, setSelectedRaffleId] = useState<string | null>(null);
  const [selectedRaffleInspect, setSelectedRaffleInspect] = useState<any | null>(null);
  const [activePayment, setActivePayment] = useState<TicketSale | null>(null);
  const [checkoutNumbers, setCheckoutNumbers] = useState<string[] | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Auto query state from Client area context links
  const [clientFocusQuery, setClientFocusQuery] = useState('');

  useEffect(() => {
    fetchRaffles();
  }, []);

  const fetchRaffles = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/raffles');
      if (response.ok) {
        const data = await response.json();
        setRaffles(data);
      }
    } catch (e) {
      console.error('Error listing raffles', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRaffle = async (id: string) => {
    setSelectedRaffleId(id);
    setView('raffle-detail');
    setLoading(true);
    try {
      const r = await fetch(`/api/raffles/${id}`);
      if (r.ok) {
        const d = await r.json();
        setSelectedRaffleInspect(d);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const syncActiveRaffleData = async () => {
    if (!selectedRaffleId) return;
    try {
      const r = await fetch(`/api/raffles/${selectedRaffleId}`);
      if (r.ok) {
        const d = await r.json();
        setSelectedRaffleInspect(d);
      }
      fetchRaffles();
    } catch (e) {
      console.error(e);
    }
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const activeRaffleDetails = useMemo(() => {
    if (!selectedRaffleId) return null;
    return raffles.find(r => r.id === selectedRaffleId) || null;
  }, [selectedRaffleId, raffles]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'dark bg-zinc-950 text-zinc-100' : 'bg-zinc-50 text-zinc-900'}`} id="app-container">
      
      {/* HEADER NAVBAR */}
      <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur border-b border-zinc-900 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div
            onClick={() => { setView('home'); setSelectedRaffleId(null); }}
            className="flex items-center gap-3 cursor-pointer group"
            id="brand-logo"
          >
            <div className="relative flex items-center justify-center">
              <svg viewBox="0 0 100 80" className="w-10 h-10 -mr-1 text-amber-500 fill-current drop-shadow-[0_0_8px_rgba(251,191,36,0.3)] transition-transform group-hover:scale-105 duration-300">
                <defs>
                  <linearGradient id="crownGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFE259" />
                    <stop offset="50%" stopColor="#F9D423" />
                    <stop offset="100%" stopColor="#FFA751" />
                  </linearGradient>
                </defs>
                <path
                  d="M15,55 L85,55 L75,28 L58,38 L50,15 L42,38 L25,28 Z"
                  fill="url(#crownGrad)"
                  stroke="#B45309"
                  strokeWidth="1"
                  strokeLinejoin="round"
                />
                <path
                  d="M50,28 L53,32 L50,36 L47,32 Z"
                  fill="#0F0F12"
                />
                <path
                  d="M18,53 Q50,57 82,53"
                  stroke="url(#crownGrad)"
                  strokeWidth="2.5"
                  fill="none"
                />
              </svg>
            </div>
            <div className="flex flex-col">
              <div className="flex items-baseline font-sans italic tracking-tighter text-lg font-black leading-none">
                <span className="text-white">chance</span>
                <span className="text-[#F9D423] ml-0.5">vip</span>
              </div>
              <span className="text-[7.5px] uppercase font-bold tracking-[0.25em] text-zinc-400 font-mono leading-none mt-1">
                Sua sorte, seu prêmio!
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-bold uppercase tracking-wider text-zinc-650 dark:text-zinc-400">
            <button
              onClick={() => { setView('home'); setSelectedRaffleId(null); }}
              className={`hover:text-emerald-500 transition-colors cursor-pointer ${view === 'home' ? 'text-emerald-600 dark:text-emerald-400' : ''}`}
            >
              📱 Sorteios Ativos
            </button>
            <button
              onClick={() => setView('ganhadores')}
              className={`hover:text-emerald-500 transition-colors cursor-pointer ${view === 'ganhadores' ? 'text-emerald-600 dark:text-emerald-400' : ''}`}
            >
              🏆 Ganhadores
            </button>
            <button
              onClick={() => { setView('meus-numeros'); setClientFocusQuery(''); }}
              className={`hover:text-emerald-500 transition-colors cursor-pointer ${view === 'meus-numeros' ? 'text-emerald-600 dark:text-emerald-400' : ''}`}
            >
              🔍 Meus Números
            </button>
            <button
              onClick={() => setView('admin')}
              className={`hover:text-emerald-500 transition-colors cursor-pointer flex items-center gap-1 bg-zinc-900 dark:bg-zinc-800 text-white py-1.5 px-3 rounded-lg ${view === 'admin' ? 'bg-emerald-600!' : ''}`}
            >
              <Lock className="w-3.5 h-3.5" /> Administração
            </button>
          </nav>

          <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 py-1 px-1 rounded-xl">
            {/* Dark/Light mode switcher */}
            <button
              onClick={toggleTheme}
              className="p-1.5 text-zinc-500 dark:text-zinc-450 hover:text-emerald-500 transition-all cursor-pointer rounded-lg"
              title={theme === 'dark' ? 'Tema Claro' : 'Tema Escuro'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-zinc-700" />}
            </button>

            {/* Mobile menu trigger button */}
            <button
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="md:hidden p-1.5 text-zinc-500 hover:text-emerald-500 rounded-lg cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer Overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-zinc-950 border-t border-zinc-900 p-4 transition-all block animate-in slide-in-from-top-4">
            <div className="flex flex-col gap-3 font-semibold text-xs text-zinc-700 dark:text-zinc-300">
              <button
                onClick={() => { setView('home'); setSelectedRaffleId(null); setMobileMenuOpen(false); }}
                className="text-left py-2 hover:bg-zinc-50 dark:hover:bg-zinc-900 px-3 rounded-lg"
              >
                📱 Cotas e Sorteios
              </button>
              <button
                onClick={() => { setView('ganhadores'); setMobileMenuOpen(false); }}
                className="text-left py-2 hover:bg-zinc-50 dark:hover:bg-zinc-900 px-3 rounded-lg"
              >
                🏆 Quadro de Ganhadores
              </button>
              <button
                onClick={() => { setView('meus-numeros'); setClientFocusQuery(''); setMobileMenuOpen(false); }}
                className="text-left py-2 hover:bg-zinc-50 dark:hover:bg-zinc-900 px-3 rounded-lg"
              >
                🔍 Consultar Cotas por CPF
              </button>
              <button
                onClick={() => { setView('admin'); setMobileMenuOpen(false); }}
                className="text-left py-2 bg-zinc-900 dark:bg-zinc-800 text-white px-3 py-2 rounded-lg flex items-center gap-1"
              >
                <Lock className="w-3.5 h-3.5" /> Administração
              </button>
            </div>
          </div>
        )}
      </header>

      {/* PRIMARY CENTRAL CONTENT BODY */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {view === 'home' && (
          <div className="space-y-8 animate-in fade-in duration-300" id="home-view">
            {/* List of Active Raffles */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white uppercase tracking-tight flex items-center gap-1.5 font-sans">
                🍀 Sorteios em Destaque
              </h2>

              {loading && raffles.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 space-y-2 bg-zinc-900 rounded-2xl border border-zinc-900">
                  <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
                  <span className="text-xs text-zinc-500">Montando os sorteios...</span>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" id="public-raffles-grid">
                  {raffles.filter(r => r.status === 'active').map(raffle => {
                    const numbersSold = (raffle as any).numbersSold || 0;
                    const numbersReserved = (raffle as any).numbersReserved || 0;
                    const progressPercent = Math.min(100, Math.round((numbersSold / raffle.totalNumbers) * 100));

                    return (
                      <div
                        key={raffle.id}
                        onClick={() => handleSelectRaffle(raffle.id)}
                        className="bg-zinc-950/40 rounded-2xl border border-zinc-900 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group cursor-pointer"
                        id={`raffle-card-${raffle.id}`}
                      >
                        <div className="h-48 md:h-52 w-full bg-zinc-100 dark:bg-zinc-900 overflow-hidden relative">
                          <img
                            src={raffle.imageUrl}
                            alt={raffle.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute top-3 left-3 bg-emerald-600 text-white font-mono font-bold px-2.5 py-1 rounded text-xs">
                            R$ {raffle.numberPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                        </div>

                        <div className="p-5 flex-grow flex flex-col justify-between space-y-4 text-xs font-sans text-left">
                          <div className="space-y-2">
                            <span className="text-[10px] text-zinc-400 block font-semibold uppercase tracking-wider font-mono">
                              FEDERAL: {raffle.drawDate ? new Date(raffle.drawDate).toLocaleDateString('pt-BR') : 'A definir'}
                            </span>
                            <h3 className="text-sm sm:text-base font-bold text-zinc-850 dark:text-white group-hover:text-emerald-500 leading-snug line-clamp-2">
                              {raffle.name}
                            </h3>
                          </div>

                          <div className="space-y-1.5 pt-2">
                            <div className="flex justify-between font-semibold text-zinc-500 dark:text-zinc-400">
                              <span>Progresso ({progressPercent}%)</span>
                              <span className="font-mono text-emerald-600 font-bold">{numbersSold} pagos</span>
                            </div>
                            <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-600 rounded-full"
                                style={{ width: `${progressPercent}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-zinc-400 block font-mono">Total cotas: {raffle.totalNumbers}</span>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectRaffle(raffle.id);
                            }}
                            className="w-full mt-2 bg-zinc-900 hover:bg-zinc-850 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            Escolher Números Manuais <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Visual Hero Header */}
            <div className="relative p-8 sm:p-12 bg-gradient-to-b from-[#121216] to-[#0A0A0C] border border-white/5 text-white rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row justify-between items-center gap-8">
              {/* Left Column: Title & Slogan */}
              <div className="text-left space-y-4 max-w-lg z-10">
                <div className="inline-flex items-center gap-1 text-[9px] bg-[#F9D423]/10 border border-[#F9D423]/25 text-[#F9D423] py-1 px-3.5 rounded-full font-mono font-bold uppercase tracking-wider">
                  ⚡ COMPROMISSO E CREDIBILIDADE CHANCE VIP
                </div>
                <h1 className="text-2xl sm:text-3.5xl font-black tracking-tight font-sans leading-tight">
                  ESCOLHA SEUS NÚMEROS E CONCORRA HOJE!
                </h1>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  Rifas legítimas com apurações automatizadas direto da extração mensal da Loteria Federal. Escolha livremente suas cotas e pague seguro e síncrono via PIX.
                </p>
              </div>

              {/* Center Column: Highly branded visual presentation of the uploaded logo */}
              <div className="flex flex-col items-center justify-center bg-[#070709] border border-white/5 p-6 rounded-2xl w-full max-w-sm shrink-0 z-10 shadow-xl relative group">
                <div className="absolute top-3 right-3 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                </div>
                
                {/* Gold Crown */}
                <svg viewBox="0 0 100 70" className="w-16 h-12 text-amber-500 fill-current drop-shadow-[0_0_10px_rgba(251,191,36,0.35)] transition-transform duration-500 group-hover:scale-105">
                  <path
                    d="M15,55 L85,55 L75,28 L58,38 L50,15 L42,38 L25,28 Z"
                    fill="url(#crownGrad)"
                    stroke="#B45309"
                    strokeWidth="1"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M50,28 L53,32 L50,36 L47,32 Z"
                    fill="#070709"
                  />
                </svg>

                {/* typography slanted and beautiful */}
                <div className="flex items-baseline font-sans italic tracking-tighter text-3xl sm:text-4.5xl font-black leading-none -mt-1 select-none">
                  <span className="text-white">chance</span>
                  <span className="text-[#F9D423] ml-1 drop-shadow-[0_2px_8px_rgba(249,212,35,0.4)]">vip</span>
                </div>

                {/* Swoosh Underline */}
                <svg viewBox="0 0 200 20" className="w-52 h-4 text-[#F9D423] -mt-1">
                  <path
                     d="M20,5 Q100,16 180,5"
                     fill="none"
                     stroke="currentColor"
                     strokeWidth="3.5"
                     strokeLinecap="round"
                  />
                </svg>

                {/* Slogan */}
                <div className="text-[9px] uppercase font-bold tracking-[0.25em] text-zinc-400 font-sans mt-2">
                  SUA SORTE, SEU PRÊMIO!
                </div>

                {/* Action trigger to checkout lookup */}
                <div className="w-full mt-5 pt-4 border-t border-white/5 flex gap-2 justify-between items-center text-[11px]">
                  <span className="text-slate-500">Consulta de cotas</span>
                  <button
                    onClick={() => setView('meus-numeros')}
                    className="bg-[#121216] hover:bg-[#16161C] border border-white/10 hover:border-[#F9D423]/40 text-white font-bold py-1.5 px-3.5 rounded-xl cursor-pointer transition-all active:scale-95"
                  >
                    Consultar CPF
                  </button>
                </div>
              </div>

              {/* Backglow decor */}
              <div className="absolute -bottom-10 -right-10 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />
            </div>
          </div>
        )}

        {view === 'raffle-detail' && activeRaffleDetails && selectedRaffleInspect && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <button
              onClick={() => { setView('home'); setSelectedRaffleId(null); }}
              className="text-xs text-zinc-500 hover:text-emerald-500 font-bold flex items-center gap-1 cursor-pointer bg-zinc-900 py-1.5 px-3 rounded-lg border border-zinc-900 w-fit"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Voltar para os Sorteios
            </button>

            <RaffleDetailPage
              raffle={selectedRaffleInspect.raffle}
              occupied={selectedRaffleInspect.occupied}
              stats={selectedRaffleInspect.stats}
              onCheckout={(numbers) => {
                setCheckoutNumbers(numbers);
              }}
            />
          </div>
        )}

        {view === 'ganhadores' && (
          <div className="animate-in fade-in duration-300">
            <WinnerPanel
              raffles={raffles}
              onSelectRaffle={(id) => handleSelectRaffle(id)}
            />
          </div>
        )}

        {view === 'meus-numeros' && (
          <div className="animate-in fade-in duration-300">
            <ClientArea
              onSelectPayment={(payment) => {
                setActivePayment(payment);
              }}
              autoFocusQuery={clientFocusQuery}
            />
          </div>
        )}

        {view === 'admin' && (
          <div className="animate-in fade-in duration-300">
            <AdminPanel
              raffles={raffles}
              onRefreshRaffles={() => {
                fetchRaffles();
                syncActiveRaffleData();
              }}
              onNavigateToRaffle={(id) => handleSelectRaffle(id)}
            />
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="bg-zinc-950 border-t border-zinc-900 mt-16 p-8 text-center text-xs text-zinc-500 space-y-3">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 100 80" className="w-8 h-8 text-amber-500 fill-current drop-shadow-[0_0_8px_rgba(251,191,36,0.2)]">
              <path
                d="M15,55 L85,55 L75,28 L58,38 L50,15 L42,38 L25,28 Z"
                fill="url(#crownGrad)"
                stroke="#B45309"
                strokeWidth="1"
                strokeLinejoin="round"
              />
              <path
                d="M50,28 L53,32 L50,36 L47,32 Z"
                fill="#0A0A0B"
              />
            </svg>
            <span className="font-sans italic tracking-tighter text-base font-black text-white">chance<span className="text-[#F9D423]">vip</span></span>
          </div>
          <span className="font-mono text-zinc-500">Desenvolvido com diretrizes de conformidade LGPD e segurança PIX instantâneo</span>
        </div>
        <div className="border-t border-zinc-200/50 dark:border-zinc-900 pt-4 text-[10px]">
          @ 2026 ChanceVip. Todos os direitos reservados. Extrações baseadas nos concursos oficiais da Loteria Federal.
        </div>
      </footer>

      {/* MODAL: COLLECT BUYER INFORMATIONS */}
      {checkoutNumbers && activeRaffleDetails && (
        <CheckoutModal
          raffle={activeRaffleDetails}
          selectedNumbers={checkoutNumbers}
          onClose={() => setCheckoutNumbers(null)}
          onSuccess={(payment) => {
            setCheckoutNumbers(null);
            setActivePayment(payment);
            syncActiveRaffleData();
          }}
        />
      )}

      {/* DRAWER: COMPLETED RESUME PIX AND WEBHOOK SIMULATION */}
      {activePayment && (
        <ActivePaymentDrawer
          payment={activePayment}
          raffles={raffles}
          onClose={() => {
            setActivePayment(null);
            syncActiveRaffleData();
            // Retain to user lookup view so they can review easily
            setView('meus-numeros');
            setClientFocusQuery(activePayment.buyer.cpf);
          }}
          onRefreshData={() => {
            syncActiveRaffleData();
            fetchRaffles();
          }}
        />
      )}
    </div>
  );
}
