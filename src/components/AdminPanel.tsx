/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Raffle, TicketSale, GatewayConfig, AuditLog, WebhookSimulationLog, DashboardStats, TicketStatus } from '../types';
import { LayoutDashboard, Ticket, Users, Settings, ClipboardList, Plus, Trash2, Copy, Edit3, UserCheck, ShieldClose, Trash, RefreshCw, Layers, Sparkles, Hash, Download, Check, HelpCircle, ArrowRight, X } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface AdminPanelProps {
  raffles: Raffle[];
  onRefreshRaffles: () => void;
  onNavigateToRaffle: (id: string) => void;
}

export default function AdminPanel({ raffles, onRefreshRaffles, onNavigateToRaffle }: AdminPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('admin_authenticated') === 'true';
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [activeTab, setActiveTab] = useState<'dashboard' | 'raffles' | 'numbers' | 'participants' | 'sales' | 'gateways' | 'logs'>('dashboard');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [config, setConfig] = useState<GatewayConfig | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<WebhookSimulationLog[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const adminFetch = (url: string, init?: RequestInit) => {
    const token = sessionStorage.getItem('admin_token') || '';
    const headers: Record<string, string> = {
      ...(init?.headers as Record<string, string> || {}),
      'Authorization': `Bearer ${token}`
    };
    return fetch(url, { ...init, headers });
  };

  // States for sales management
  const [salesFilter, setSalesFilter] = useState<'all' | 'pending' | 'approved' | 'expired'>('all');
  const [salesSearch, setSalesSearch] = useState('');

  const filteredSalesList = sales.filter((item) => {
    if (salesFilter !== 'all' && item.status !== salesFilter) return false;
    if (salesSearch.trim() !== '') {
      const q = salesSearch.toLowerCase();
      const matchName = item.buyer?.name?.toLowerCase().includes(q);
      const matchCpf = item.buyer?.cpf?.toLowerCase().includes(q);
      const matchPhone = item.buyer?.phone?.toLowerCase().includes(q);
      const matchPaymentId = item.paymentId?.toLowerCase().includes(q);
      const matchRaffle = item.raffleName?.toLowerCase().includes(q);
      return matchName || matchCpf || matchPhone || matchPaymentId || matchRaffle;
    }
    return true;
  });

  // Form State for creating/editing raffle
  const [editingRaffle, setEditingRaffle] = useState<Partial<Raffle> | null>(null);
  const [showRaffleForm, setShowRaffleForm] = useState(false);

  // State for manual number management
  const [selectedRaffleId, setSelectedRaffleId] = useState(raffles[0]?.id || '');
  const [raffleInspectData, setRaffleInspectData] = useState<any | null>(null);
  const [targetNumberToInspect, setTargetNumberToInspect] = useState('');
  const [inspectDetail, setInspectDetail] = useState<any | null>(null);
  const [transferBuyerInput, setTransferBuyerInput] = useState({ name: '', phone: '', cpf: '' });

  // Sorteio Draw Winner modal state
  const [drawingRaffleId, setDrawingRaffleId] = useState<string | null>(null);
  const [drawWinnerNumber, setDrawWinnerNumber] = useState('');
  const [drawWinnerName, setDrawWinnerName] = useState('');
  const [drawWinnerCity, setDrawWinnerCity] = useState('');
  const [drawWinnerConcurso, setDrawWinnerConcurso] = useState('Concurso Federal');
  const [drawWinnerDate, setDrawWinnerDate] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchAdminAll();
    }
  }, [activeTab, raffles, isAuthenticated]);

  const fetchAdminAll = async () => {
    setLoading(true);
    try {
      const pStats = adminFetch('/api/admin/stats').then(r => r.json());
      const pConfig = adminFetch('/api/admin/config').then(r => r.json());
      const pLogs = adminFetch('/api/admin/logs').then(r => r.json());
      const pParts = adminFetch('/api/admin/participants').then(r => r.json());
      const pSales = adminFetch('/api/admin/sales').then(r => r.json());

      const [statsData, configData, logsData, partsData, salesData] = await Promise.all([pStats, pConfig, pLogs, pParts, pSales]);

      setStats(statsData);
      setConfig(configData);
      setAuditLogs(logsData.auditLogs || []);
      setWebhookLogs(logsData.webhookLogs || []);
      setParticipants(partsData || []);
      setSales(salesData || []);

      if (selectedRaffleId) {
        fetchRaffleInspect(selectedRaffleId);
      }
    } catch (e) {
      console.error('Error fetching admin data', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchRaffleInspect = async (raffleId: string) => {
    try {
      const r = await fetch(`/api/raffles/${raffleId}`);
      if (r.ok) {
        const d = await r.json();
        setRaffleInspectData(d);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleInspectNumberForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!raffleInspectData || !targetNumberToInspect) return;

    const formattedNum = String(targetNumberToInspect).padStart(raffleInspectData.raffle.totalNumbers === 10000 ? 4 : raffleInspectData.raffle.totalNumbers === 1000 ? 3 : 2, '0');
    const occupiedInfo = raffleInspectData.occupied[formattedNum];
    
    if (occupiedInfo) {
      setInspectDetail({
        number: formattedNum,
        ...occupiedInfo
      });
      setTransferBuyerInput({
        name: occupiedInfo.buyerName || '',
        phone: occupiedInfo.phone || '',
        cpf: occupiedInfo.cpf || ''
      });
    } else {
      setInspectDetail({
        number: formattedNum,
        status: 'available',
        buyerName: 'Disponível',
        phone: '',
        cpf: '',
        paymentId: ''
      });
      setTransferBuyerInput({ name: '', phone: '', cpf: '' });
    }
  };

  const handleBlockNumber = async (blockType: 'block' | 'release') => {
    if (!selectedRaffleId || !inspectDetail) return;
    try {
      const response = await adminFetch('/api/admin/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          raffleId: selectedRaffleId,
          numbers: [inspectDetail.number],
          blockType
        })
      });

      if (response.ok) {
        alert(blockType === 'block' ? 'Número bloqueado com sucesso!' : 'Número liberado com sucesso!');
        await fetchRaffleInspect(selectedRaffleId);
        setInspectDetail(null);
        setTargetNumberToInspect('');
        onRefreshRaffles();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleTransferOwnership = async () => {
    if (!selectedRaffleId || !inspectDetail || !transferBuyerInput.name || !transferBuyerInput.cpf) {
      alert('Preencha os campos obrigatórios para transferir.');
      return;
    }

    try {
      const response = await adminFetch('/api/admin/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          raffleId: selectedRaffleId,
          ticketNumber: inspectDetail.number,
          newBuyer: transferBuyerInput
        })
      });

      if (response.ok) {
        alert('Titularidade transferida com sucesso!');
        await fetchRaffleInspect(selectedRaffleId);
        setInspectDetail(null);
        setTargetNumberToInspect('');
        fetchAdminAll();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCancelSale = async (paymentId: string) => {
    if (!confirm('Deseja realmente cancelar esta venda e liberar os números correspondentes de forma imediata?')) {
      return;
    }

    try {
      const response = await adminFetch('/api/admin/cancel-sale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId })
      });

      if (response.ok) {
        alert('Venda cancelada e cotas liberadas!');
        setInspectDetail(null);
        setTargetNumberToInspect('');
        fetchAdminAll();
        onRefreshRaffles();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleApproveManualPayment = async (paymentId: string) => {
    if (!confirm(`Confirmar recebimento do PIX e dar baixa manual para a transação ${paymentId}?`)) {
      return;
    }

    try {
      const response = await fetch('/api/tickets/pay-simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId })
      });

      if (response.ok) {
        alert('Baixa manual efetuada com sucesso! Cotas marcadas como pagas.');
        setInspectDetail(null);
        setTargetNumberToInspect('');
        fetchAdminAll();
        onRefreshRaffles();
      } else {
        const err = await response.json();
        alert(err.error || 'Erro ao processar baixa.');
      }
    } catch (e) {
      console.error(e);
      alert('Erro de comunicação para aprovar.');
    }
  };

  const handleSaveGatewayConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;

    try {
      const response = await adminFetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      if (response.ok) {
        alert('Configurações atualizadas com sucesso!');
        fetchAdminAll();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveRaffle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRaffle || !editingRaffle.name || !editingRaffle.totalNumbers || !editingRaffle.numberPrice) {
      alert('Preencha os campos nome, cotas e valor.');
      return;
    }

    try {
      const response = await fetch('/api/raffles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingRaffle)
      });

      if (response.ok) {
        alert('Ação atualizada com sucesso!');
        setShowRaffleForm(false);
        setEditingRaffle(null);
        onRefreshRaffles();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDuplicateRaffle = (original: Raffle) => {
    const clone: Partial<Raffle> = {
      name: `${original.name} (CÓPIA)`,
      description: original.description,
      rules: original.rules,
      totalNumbers: original.totalNumbers,
      numberPrice: original.numberPrice,
      imageUrl: original.imageUrl,
      drawConcurso: original.drawConcurso,
      status: 'active',
      prize1: original.prize1 || '',
      prize2: original.prize2 || '',
      prize3: original.prize3 || ''
    };
    setEditingRaffle(clone);
    setShowRaffleForm(true);
  };

  const handleDeleteRaffle = async (id: string, name: string) => {
    if (!confirm(`Deseja EXCLUIR PERMANENTEMENTE a rifa "${name}"? Esta operação excluirá todas as reservas e vendas deste ID.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/raffles/${id}`, { method: 'DELETE' });
      if (response.ok) {
        alert('Rifa deletada!');
        onRefreshRaffles();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDrawWinnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!drawingRaffleId || !drawWinnerNumber) {
      alert('Número vencedor é obrigatório.');
      return;
    }

    try {
      const response = await adminFetch('/api/admin/draw-winner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          raffleId: drawingRaffleId,
          winnerNumber: drawWinnerNumber,
          winnerName: drawWinnerName,
          winnerCity: drawWinnerCity,
          drawConcurso: drawWinnerConcurso,
          drawDate: drawWinnerDate
        })
      });

      if (response.ok) {
        alert('Sorteio homologado! Ganhador publicado com base nas regras!');
        setDrawingRaffleId(null);
        setDrawWinnerNumber('');
        setDrawWinnerName('');
        setDrawWinnerCity('');
        setDrawWinnerDate('');
        onRefreshRaffles();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportCSV = async (raffleId: string = '') => {
    try {
      const response = await adminFetch(`/api/admin/export?type=csv&raffleId=${raffleId}`);
      if (response.ok) {
        const fileData = await response.json();
        // Convert rows to actual CSV string
        const header = Object.keys(fileData.data[0] || {}).join(',');
        const csvRows = fileData.data.map((row: any) => 
          Object.values(row).map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')
        );

        const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [header, ...csvRows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${fileData.filename}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 bg-zinc-950/40 p-8 rounded-3xl border border-white/5 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="space-y-2 text-center">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-xl text-white mx-auto shadow-lg shadow-indigo-600/25">
            🔑
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white uppercase text-center mt-3">Acesso Administrativo</h2>
          <p className="text-zinc-400 text-xs text-center leading-relaxed">
            Área restrita de gerenciamento para gestores do sistema ChanceVip.
          </p>
        </div>

        <form onSubmit={async (e) => {
          e.preventDefault();
          try {
            const response = await fetch('/api/admin/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username, password })
            });
            if (response.ok) {
              const data = await response.json();
              sessionStorage.setItem('admin_authenticated', 'true');
              sessionStorage.setItem('admin_token', data.token);
              setIsAuthenticated(true);
              setLoginError('');
            } else {
              const err = await response.json();
              setLoginError(err.error || 'Usuário ou senha incorretos.');
            }
          } catch (err) {
            setLoginError('Falha de conexão com o servidor.');
          }
        }} className="space-y-4 text-left">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-300">Usuário</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-zinc-900 border border-white/5 p-3 rounded-xl text-xs text-white placeholder-zinc-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              placeholder="Digite seu usuário"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-300">Senha</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-900 border border-white/5 p-3 rounded-xl text-xs text-white placeholder-zinc-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              placeholder="Digite sua senha"
            />
          </div>

          {loginError && (
            <div className="p-3 bg-red-950/40 border border-red-500/20 text-red-400 rounded-xl text-xs font-semibold text-center">
              ⚠️ {loginError}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 px-4 rounded-xl text-xs cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            Entrar no Painel
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="admin-panel-viewport">
      {/* Admin Title Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-zinc-900 border border-zinc-800 text-white rounded-2xl gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
              Painel de Gestão Completo
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <h1 className="text-xl md:text-2xl font-sans font-black tracking-tight">
            CENTRAL ADMINISTRATIVA
          </h1>
          <p className="text-zinc-400 text-xs font-mono">
            Gerenciamento de contas, faturamento PIX via Gateway e monitoramento de canais de venda
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setEditingRaffle({
                name: '',
                description: '',
                rules: '1. Sorteio pela Loteria Federal.\n2. Pagamentos rápidos via PIX 15 min.',
                totalNumbers: 1000,
                numberPrice: 5.00,
                drawDate: '',
                drawConcurso: 'Extração da Loteria Federal',
                imageUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=800',
                status: 'active',
                prize1: '',
                prize2: '',
                prize3: ''
              });
              setShowRaffleForm(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] transition-transform"
          >
            <Plus className="w-4 h-4" /> Criar Nova Rifa
          </button>
          <button
            onClick={fetchAdminAll}
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold py-2.5 px-3.5 rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Recarregar
          </button>
          <button
            onClick={() => {
              if (confirm('Deseja realmente sair do painel administrativo?')) {
                sessionStorage.removeItem('admin_authenticated');
                sessionStorage.removeItem('admin_token');
                setIsAuthenticated(false);
              }
            }}
            className="bg-red-950/45 hover:bg-red-900/60 border border-red-500/10 text-red-400 font-semibold py-2.5 px-3.5 rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-colors"
          >
            <ShieldClose className="w-4 h-4" /> Sair do Painel
          </button>
        </div>
      </div>

      {/* Tabs list inside beautiful card navigation */}
      <div className="flex overflow-x-auto bg-white dark:bg-zinc-950/40 p-1.5 rounded-2xl border border-zinc-150 dark:border-zinc-900 gap-1.5 no-scrollbar">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'dashboard'
              ? 'bg-zinc-900 text-white dark:bg-zinc-800'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" /> Dashboard Geral
        </button>
        <button
          onClick={() => setActiveTab('raffles')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'raffles'
              ? 'bg-zinc-900 text-white dark:bg-zinc-800'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
          }`}
        >
          <Layers className="w-4 h-4" /> Gerir de Rifas
        </button>
        <button
          onClick={() => setActiveTab('numbers')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'numbers'
              ? 'bg-zinc-900 text-white dark:bg-zinc-800'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
          }`}
        >
          <Ticket className="w-4 h-4" /> Auditores de Números
        </button>
        <button
          onClick={() => setActiveTab('participants')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'participants'
              ? 'bg-zinc-900 text-white dark:bg-zinc-800'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
          }`}
        >
          <Users className="w-4 h-4" /> Participantes ({participants.length})
        </button>
        <button
          onClick={() => setActiveTab('sales')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'sales'
              ? 'bg-zinc-900 text-white dark:bg-zinc-800'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
          }`}
        >
          <ClipboardList className="w-4 h-4 text-emerald-500" /> Baixar Comprovantes ({sales.filter(s => s.status === 'pending').length})
        </button>
        <button
          onClick={() => setActiveTab('gateways')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'gateways'
              ? 'bg-zinc-900 text-white dark:bg-zinc-800'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
          }`}
        >
          <Settings className="w-4 h-4" /> Config Gateways / WhatsApp
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'logs'
              ? 'bg-zinc-900 text-white dark:bg-zinc-800'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
          }`}
        >
          <ClipboardList className="w-4 h-4" /> Envios e Auditorias
        </button>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center p-12 space-y-2 bg-white dark:bg-zinc-950/50 rounded-2xl border border-zinc-205 dark:border-zinc-900">
          <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
          <span className="text-xs text-zinc-500 font-mono">Consolidando dados do servidor...</span>
        </div>
      )}

      {/* RAFFLE CREATOR/EDITOR MODAL FORM OVERLAY */}
      {showRaffleForm && editingRaffle && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleSaveRaffle}
            className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-900 max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-4"
          >
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white font-sans uppercase">
                {editingRaffle.id ? 'Editar Ação Rifa' : 'Adicionar Nova Ação Rifa'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowRaffleForm(false);
                  setEditingRaffle(null);
                }}
                className="text-zinc-450 hover:text-red-500"
              >
                Cancelar [X]
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-zinc-700 dark:text-zinc-300">
              <div className="space-y-1">
                <label className="block font-semibold">Nome da Rifa *</label>
                <input
                  type="text"
                  required
                  value={editingRaffle.name || ''}
                  onChange={(e) => setEditingRaffle(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2 text-sm rounded-lg"
                  placeholder="Ex: YAMAHA MT-07 2026 ZERADA"
                />
              </div>

              <div className="border border-zinc-150 dark:border-zinc-900 p-3.5 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/20 space-y-3">
                <span className="block font-bold text-zinc-500 uppercase tracking-wider text-[10px] font-mono">Configuração de Prêmios Principais</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="block font-semibold">1º Prêmio *</label>
                    <input
                      type="text"
                      required
                      value={editingRaffle.prize1 || ''}
                      onChange={(e) => setEditingRaffle(prev => ({ ...prev, prize1: e.target.value }))}
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2 text-xs rounded-lg"
                      placeholder="Ex: YAMAHA MT-07"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-semibold">2º Prêmio</label>
                    <input
                      type="text"
                      value={editingRaffle.prize2 || ''}
                      onChange={(e) => setEditingRaffle(prev => ({ ...prev, prize2: e.target.value }))}
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2 text-xs rounded-lg"
                      placeholder="Ex: R$ 5.000 no PIX"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-semibold">3º Prêmio</label>
                    <input
                      type="text"
                      value={editingRaffle.prize3 || ''}
                      onChange={(e) => setEditingRaffle(prev => ({ ...prev, prize3: e.target.value }))}
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2 text-xs rounded-lg"
                      placeholder="Ex: R$ 1.000 no PIX"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-semibold">Preço por Número (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingRaffle.numberPrice || ''}
                    onChange={(e) => setEditingRaffle(prev => ({ ...prev, numberPrice: parseFloat(e.target.value) }))}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2 text-sm rounded-lg"
                    placeholder="10.00"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-semibold">Qtde Total de Números (Max 10k) *</label>
                  <select
                    required
                    disabled={editingRaffle.id !== undefined} // Cannot edit digits of active raffle easily
                    value={editingRaffle.totalNumbers || 1000}
                    onChange={(e) => setEditingRaffle(prev => ({ ...prev, totalNumbers: parseInt(e.target.value, 10) }))}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2 text-sm rounded-lg cursor-pointer"
                  >
                    <option value={100}>100 números (01 - 100)</option>
                    <option value={500}>500 números (001 - 500)</option>
                    <option value={1000}>1.000 números (001 - 1000)</option>
                    <option value={5000}>5.000 números (0001 - 5000)</option>
                    <option value={10000}>10.000 números (0001 - 10000)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-semibold">Data do Sorteio</label>
                  <input
                    type="date"
                    value={editingRaffle.drawDate || ''}
                    onChange={(e) => setEditingRaffle(prev => ({ ...prev, drawDate: e.target.value }))}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2 text-sm rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-semibold">Concurso/Identificador Draw</label>
                  <input
                    type="text"
                    value={editingRaffle.drawConcurso || ''}
                    onChange={(e) => setEditingRaffle(prev => ({ ...prev, drawConcurso: e.target.value }))}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2 text-sm rounded-lg"
                    placeholder="Concurso 6023 Loteria Federal"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-semibold">URL Imagem Capa</label>
                <input
                  type="text"
                  value={editingRaffle.imageUrl || ''}
                  onChange={(e) => setEditingRaffle(prev => ({ ...prev, imageUrl: e.target.value }))}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2 text-sm rounded-lg"
                  placeholder="https://images.unsplash.com..."
                />
              </div>

              <div className="space-y-1">
                <label className="block font-semibold">Descrição</label>
                <textarea
                  rows={2}
                  value={editingRaffle.description || ''}
                  onChange={(e) => setEditingRaffle(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2 text-sm rounded-lg"
                  placeholder="Detalhes adicionais sobre o veículo/mimo..."
                />
              </div>

              <div className="space-y-1">
                <label className="block font-semibold">Regulamento</label>
                <textarea
                  rows={3}
                  value={editingRaffle.rules || ''}
                  onChange={(e) => setEditingRaffle(prev => ({ ...prev, rules: e.target.value }))}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2 text-sm rounded-lg"
                  placeholder="Regras de sorteio..."
                />
              </div>
            </div>

            <div className="border-t pt-4 flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowRaffleForm(false);
                  setEditingRaffle(null);
                }}
                className="bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-4 py-2 rounded-xl text-xs cursor-pointer font-bold"
              >
                Voltar
              </button>
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs cursor-pointer font-bold flex items-center gap-1"
              >
                Gravar Configuração <Check className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DRAW WINNER MODEL DIALOG */}
      {drawingRaffleId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleDrawWinnerSubmit}
            className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-900 max-w-md w-full space-y-4"
          >
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-sm font-bold text-zinc-950 dark:text-white uppercase flex items-center gap-1">
                <Layers className="w-4 h-4 text-amber-500 animate-bounce" /> Homologar Sorteio Base Federal
              </h3>
              <button type="button" onClick={() => setDrawingRaffleId(null)} className="text-xs text-zinc-400">Fechar [x]</button>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Insira o número sorteado de acordo com a Loteria Federal. A nossa plataforma fará a busca automatizada para identificar se existe um comprador com status 'Pago' correspondente. Se existir, o vencedor será proclamado com honrarias!
            </p>

            <div className="space-y-3.5 text-xs text-zinc-700 dark:text-zinc-300">
              <div className="space-y-1">
                <label className="block font-semibold">Número Sorteado *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 0317 ou 4829"
                  value={drawWinnerNumber}
                  onChange={(e) => setDrawWinnerNumber(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-250 p-2.5 rounded-lg text-sm font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-semibold">Ganhador (Deixe vazio para busca automática nos pagos) *</label>
                <input
                  type="text"
                  placeholder="Nome do vencedor"
                  value={drawWinnerName}
                  onChange={(e) => setDrawWinnerName(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 p-2 rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-semibold">Cidade / Estado vencedor</label>
                  <input
                    type="text"
                    placeholder="Ex: Curitiba - PR"
                    value={drawWinnerCity}
                    onChange={(e) => setDrawWinnerCity(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 p-2 rounded-lg text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-semibold">Concurso Loteria Federal</label>
                  <input
                    type="text"
                    required
                    value={drawWinnerConcurso}
                    onChange={(e) => setDrawWinnerConcurso(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 p-2 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-semibold">Data do Sorteio (Colocar Manualmente) *</label>
                <input
                  type="date"
                  required
                  value={drawWinnerDate}
                  onChange={(e) => setDrawWinnerDate(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 p-2 rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="border-t pt-3 flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setDrawingRaffleId(null)}
                className="bg-zinc-50 text-zinc-650 px-3 py-2 rounded text-xs"
              >
                Voltar
              </button>
              <button
                type="submit"
                className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded text-xs font-bold"
              >
                Proclamar Sorteio e Ganhador
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DASHBOARD TABVIEW */}
      {!loading && activeTab === 'dashboard' && stats && (
        <div id="admin-tab-dashboard" className="space-y-6">
          {/* Stats Widgets Bento Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-zinc-950/40 p-5 rounded-2xl border border-zinc-150 dark:border-zinc-900 shadow-sm flex flex-col justify-between">
              <span className="text-xs text-zinc-400 font-semibold uppercase block">Total Arrecadado</span>
              <div className="mt-2 text-lg sm:text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                R$ {stats.totalArrecadado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[10px] text-zinc-400 mt-1">Ganhos reais via PIX aprovados</span>
            </div>

            <div className="bg-white dark:bg-zinc-950/40 p-5 rounded-2xl border border-zinc-150 dark:border-zinc-900 shadow-sm flex flex-col justify-between">
              <span className="text-xs text-zinc-400 font-semibold uppercase block">Números Vendidos</span>
              <div className="mt-2 text-lg sm:text-2xl font-black font-mono text-zinc-900 dark:text-white">
                {stats.totalVendido} <span className="text-sm text-zinc-400 font-medium">unid.</span>
              </div>
              <span className="text-[10px] text-zinc-400 mt-1">Considerando status 'Pago'</span>
            </div>

            <div className="bg-white dark:bg-zinc-950/40 p-5 rounded-2xl border border-zinc-150 dark:border-zinc-900 shadow-sm flex flex-col justify-between">
              <span className="text-xs text-zinc-400 font-semibold uppercase block">Participantes Únicos</span>
              <div className="mt-2 text-lg sm:text-2xl font-black font-mono text-indigo-600 dark:text-indigo-400">
                {stats.totalParticipantes} <span className="text-sm text-indigo-400 font-medium">leads</span>
              </div>
              <span className="text-[10px] text-zinc-400 mt-1">Registrados por CPF distintos</span>
            </div>

            <div className="bg-white dark:bg-zinc-950/40 p-5 rounded-2xl border border-zinc-150 dark:border-zinc-900 shadow-sm flex flex-col justify-between">
              <span className="text-xs text-zinc-400 font-semibold uppercase block">Rifas em Execução</span>
              <div className="mt-2 text-lg sm:text-2xl font-black font-mono text-amber-600 dark:text-amber-400">
                {stats.rifasAtivas} / {stats.rifasEncerradas + stats.rifasAtivas}
              </div>
              <span className="text-[10px] text-zinc-400 mt-1">Ativas para compra manual</span>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-2 gap-4">
            <div className="bg-zinc-50 dark:bg-zinc-900/40 p-4 border rounded-xl flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-500">Transações Aguardando aprovação:</span>
              <span className="font-mono text-amber-600 font-bold bg-amber-50 dark:bg-amber-950/40 py-1 px-2.5 rounded-full animate-pulse border border-amber-200">
                {stats.pagamentosPendentes} PIX pendentes
              </span>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-900/40 p-4 border rounded-xl flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-500">Transações quitadas com sucesso:</span>
              <span className="font-mono text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/40 py-1 px-2.5 rounded-full border border-emerald-200">
                {stats.pagamentosAprovados} PIX concluídos
              </span>
            </div>
          </div>

          {/* Real-time Recharts Line Drawing */}
          <div className="bg-white dark:bg-zinc-950/40 p-5 rounded-2xl border border-zinc-150 dark:border-zinc-900 shadow-sm text-zinc-900 dark:text-white space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase font-mono text-zinc-500">Faturamento Diário - Últimos 7 dias (R$)</h3>
              <span className="text-[10px] font-mono text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200/50">Atualizado</span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.vendasPorDia} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eeeeee" />
                  <XAxis dataKey="data" stroke="#888888" style={{ fontSize: 10, fontFamily: 'monospace' }} />
                  <YAxis stroke="#888888" style={{ fontSize: 10, fontFamily: 'monospace' }} />
                  <Tooltip contentStyle={{ fontSize: 11, fontFamily: 'sans-serif' }} />
                  <Line type="monotone" dataKey="total" name="Faturamento (R$)" stroke="#10b981" strokeWidth={3} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="qtd" name="Unidades Vendidas" stroke="#6366f1" strokeWidth={1.5} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* MANAGE RAFFLES TAB */}
      {!loading && activeTab === 'raffles' && (
        <div id="admin-tab-raffles" className="space-y-4">
          <div className="flex justify-between items-center pb-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-mono">
              Campanhas de Sorteios Ativas ({raffles.length})
            </h3>
            <button
              onClick={() => handleExportCSV()}
              className="bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 text-zinc-700 dark:text-gray-300 font-semibold py-1.5 px-3 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer border dark:border-zinc-800"
            >
              <Download className="w-3.5 h-3.5" /> Exportar Vendas (CSV Geral)
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {raffles.map(raffle => {
              const totalRemaining = raffle.totalNumbers; // available or compute
              return (
                <div
                  key={raffle.id}
                  className="bg-white dark:bg-zinc-950/50 p-5 rounded-2xl border border-zinc-150 dark:border-zinc-900 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between shadow-sm relative overflow-hidden"
                  id={`manage-raffles-${raffle.id}`}
                >
                  <div className="flex gap-4 items-center">
                    <img
                      src={raffle.imageUrl}
                      alt={raffle.name}
                      className="w-14 h-14 rounded-xl object-cover bg-zinc-100"
                      referrerPolicy="no-referrer"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                          raffle.status === 'active'
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100/50'
                            : 'bg-zinc-105 border border-zinc-200 text-zinc-500'
                        }`}>
                          {raffle.status === 'active' ? 'ATIVO RECEPTIVO' : 'SORTEADO/FECHADO'}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-zinc-500 bg-zinc-100 dark:bg-zinc-900 py-0.5 px-1.5 rounded">
                          {raffle.totalNumbers} cotas
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-zinc-850 dark:text-zinc-100 line-clamp-1 leading-normal">
                        {raffle.name}
                      </h4>
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                        R$ {raffle.numberPrice.toFixed(2)} por bilhete
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 self-end md:self-auto border-t md:border-t-0 border-zinc-50 dark:border-zinc-900 pt-3 md:pt-0 w-full md:w-auto justify-end">
                    <button
                      onClick={() => onNavigateToRaffle(raffle.id)}
                      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 bg-opacity-70 border border-emerald-100/40 p-2 rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer font-bold"
                      title="Ver Página Comercial"
                    >
                      Ver Cartela
                    </button>
                    <button
                      onClick={() => {
                        setEditingRaffle(raffle);
                        setShowRaffleForm(true);
                      }}
                      className="bg-zinc-100 hover:bg-zinc-250 dark:bg-zinc-900 dark:hover:bg-zinc-850 text-zinc-700 dark:text-zinc-300 p-2 rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer"
                      title="Ajustar Parâmetros"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDuplicateRaffle(raffle)}
                      className="bg-zinc-100 hover:bg-zinc-250 dark:bg-zinc-900 dark:hover:bg-zinc-850 text-zinc-700 dark:text-zinc-300 p-2 rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer"
                      title="Duplicar Rifa"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    
                    {raffle.status === 'active' && (
                      <button
                        onClick={() => {
                          setDrawingRaffleId(raffle.id);
                          setDrawWinnerConcurso(raffle.drawConcurso || 'Loteria Federal');
                          setDrawWinnerDate(raffle.drawDate || new Date().toISOString().split('T')[0]);
                        }}
                        className="bg-amber-550 hover:bg-amber-600 text-white bg-amber-600 p-2 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                        title="Realizar Sorteio"
                      >
                        Sorteio
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteRaffle(raffle.id, raffle.name)}
                      className="bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-650 p-2 rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer"
                      title="Apagar Rifa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AUDITORS OF NUMBERS TAB */}
      {!loading && activeTab === 'numbers' && (
        <div id="admin-tab-numbers" className="bg-white dark:bg-zinc-950/40 p-5 rounded-2xl border border-zinc-150 dark:border-zinc-900 shadow-sm space-y-6">
          <div className="space-y-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 font-mono">
              Pesquisar e Alterar Titularidades / Bloqueios de Bilhetes
            </h3>
            <p className="text-xs text-zinc-400">
              Gerencie a cartela de forma manual. Verifique quem reservou um número, cancele vendas pendentes, transfira cotas ou configure bloqueios de mesa.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 items-start">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-500">Selecione a Rifa</label>
                <select
                  value={selectedRaffleId}
                  onChange={(e) => {
                    setSelectedRaffleId(e.target.value);
                    fetchRaffleInspect(e.target.value);
                    setInspectDetail(null);
                  }}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-xl text-xs cursor-pointer text-zinc-800 dark:text-zinc-200"
                >
                  {raffles.map(r => (
                    <option key={r.id} value={r.id}>{r.name} ({r.totalNumbers} números)</option>
                  ))}
                </select>
              </div>

              {/* Inspect query Form */}
              <form onSubmit={handleInspectNumberForm} className="space-y-1 w-full">
                <label className="block text-xs font-semibold text-zinc-500">Inserir Número da Ficha *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Ex: 0317"
                    value={targetNumberToInspect}
                    onChange={(e) => setTargetNumberToInspect(e.target.value)}
                    className="flex-grow bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2 rounded-xl text-xs font-mono font-bold"
                  />
                  <button
                    type="submit"
                    className="bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-800 text-white font-bold p-2 px-4 rounded-xl text-xs cursor-pointer"
                  >
                    Auditar
                  </button>
                </div>
                <p className="text-[10px] text-zinc-400">Insira de acordo com o padrão de dígitos (2, 3 ou 4 algarismos)</p>
              </form>
            </div>

            {/* Inspect Result Drawer */}
            <div className="md:col-span-2 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-800/80 p-5 rounded-2xl space-y-4">
              {inspectDetail ? (
                <div className="space-y-4 text-xs animate-in fade-in duration-300">
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-xs font-bold text-zinc-400 uppercase font-mono">Ficha Número:</span>
                    <span className="text-xl font-mono font-black text-emerald-600 dark:text-emerald-400">
                      {inspectDetail.number}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] text-zinc-400 block font-semibold uppercase">Status Atual</span>
                      <span className={`inline-block mt-1 font-bold font-mono text-[11px] px-2.5 py-0.5 rounded-full ${
                        inspectDetail.status === 'paid'
                          ? 'bg-green-150 text-green-700 bg-green-50'
                          : inspectDetail.status === 'reserved'
                          ? 'bg-amber-100 text-amber-700'
                          : inspectDetail.status === 'blocked'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-zinc-200 text-zinc-600'
                      }`}>
                        {inspectDetail.status === 'paid' ? 'PAGO / CONCLUÍDO' : inspectDetail.status === 'reserved' ? 'RESERVADO / EXPERIMENTAL' : inspectDetail.status === 'blocked' ? 'BLOQUEADO ADMIN' : 'DISPONÍVEL'}
                      </span>
                    </div>

                    {inspectDetail.reservedAt && (
                      <div>
                        <span className="text-[10px] text-zinc-400 block font-semibold uppercase">Registro</span>
                        <span className="text-zinc-600 dark:text-zinc-300 font-mono">
                          {new Date(inspectDetail.reservedAt).toLocaleString('pt-BR')}
                        </span>
                      </div>
                    )}
                  </div>

                  {inspectDetail.status === 'available' ? (
                    <div className="space-y-2 border-t pt-3">
                      <p className="text-[11px] text-zinc-400">Este número está inteiramente vago no sistema. Você pode bloqueá-lo para venda promocional temporária.</p>
                      <button
                        onClick={() => handleBlockNumber('block')}
                        className="bg-red-50 hover:bg-red-100 text-red-650 font-bold py-2 px-3 rounded-lg text-xs cursor-pointer border border-red-200"
                      >
                        Bloquear Venda Administrativamente
                      </button>
                    </div>
                  ) : inspectDetail.status === 'blocked' ? (
                    <div className="space-y-2 border-t pt-3">
                      <p className="text-[11px] text-zinc-400">Bloqueado administrativamente. Deseja retornar o bilhete para venda pública tradicional?</p>
                      <button
                        onClick={() => handleBlockNumber('release')}
                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-750 font-bold py-2 px-3 rounded-lg text-xs cursor-pointer border border-emerald-200"
                      >
                        Liberar Número para Venda Livre
                      </button>
                    </div>
                  ) : (
                    /* Active bookings metadata and actions */
                    <div className="space-y-4 border-t pt-4">
                      <div className="bg-white dark:bg-zinc-950/60 p-4 rounded-xl border space-y-3.5">
                        <span className="text-xs font-bold font-mono text-zinc-400 uppercase">Ficha Cadastral do Cliente</span>
                        
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-[10px] text-zinc-400 block font-medium">Nome</span>
                            <span className="text-zinc-800 dark:text-zinc-150 font-bold">{inspectDetail.buyerName}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-zinc-400 block font-medium">CPF</span>
                            <span className="text-zinc-800 dark:text-zinc-150 font-mono font-bold">{inspectDetail.cpf}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-zinc-400 block font-medium">Telefone</span>
                            <span className="text-zinc-800 dark:text-zinc-150 font-mono">{inspectDetail.phone}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-zinc-400 block font-medium">Cód. Transação</span>
                            <span className="text-zinc-650">{inspectDetail.paymentId}</span>
                          </div>
                        </div>

                        {inspectDetail.paymentId && (
                          <div className="flex gap-1.5 justify-end">
                            {inspectDetail.status === 'reserved' && (
                              <button
                                onClick={() => handleApproveManualPayment(inspectDetail.paymentId)}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1.5 rounded-lg font-bold text-xs cursor-pointer flex items-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5" /> Confirmar Pagamento (PIX)
                              </button>
                            )}
                            <button
                              onClick={() => handleCancelSale(inspectDetail.paymentId)}
                              className="bg-red-50 hover:bg-red-100 dark:bg-red-950/50 text-red-650 px-2.5 py-1.5 rounded-lg border border-red-200/50 font-bold"
                            >
                              Cancelar Compra Completa (Libera Lotéricas)
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Transfer ownership fields */}
                      <div className="space-y-3 border-t pt-3">
                        <span className="text-xs font-bold text-zinc-500 uppercase font-mono">Transferência Direta de Titularidade</span>
                        
                        <div className="grid grid-cols-3 gap-2">
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-zinc-405">Novo Proprietário *</label>
                            <input
                              type="text"
                              value={transferBuyerInput.name}
                              onChange={(e) => setTransferBuyerInput(prev => ({ ...prev, name: e.target.value }))}
                              className="bg-white dark:bg-zinc-950 border p-1 rounded w-full"
                              placeholder="Nome Completo"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-zinc-405">CPF *</label>
                            <input
                              type="text"
                              value={transferBuyerInput.cpf}
                              onChange={(e) => setTransferBuyerInput(prev => ({ ...prev, cpf: e.target.value }))}
                              className="bg-white dark:bg-zinc-950 border p-1 rounded w-full"
                              placeholder="CPF"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-zinc-405">Telefone</label>
                            <input
                              type="text"
                              value={transferBuyerInput.phone}
                              onChange={(e) => setTransferBuyerInput(prev => ({ ...prev, phone: e.target.value }))}
                              className="bg-white dark:bg-zinc-950 border p-1 rounded w-full"
                              placeholder="DD9..."
                            />
                          </div>
                        </div>

                        <button
                          onClick={handleTransferOwnership}
                          className="bg-zinc-900 hover:bg-zinc-850 text-white font-bold py-2 px-4 rounded-xl cursor-pointer"
                        >
                          Efetuar Modificação de Titular
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-12 text-center text-zinc-400">
                  <Hash className="w-10 h-10 mx-auto text-zinc-300 mb-2" />
                  <p>Insira um número do bilhete no painel esquerdo para obter análise de titularidade ou bloqueá-lo.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MANAGE PARTICIPANTS */}
      {!loading && activeTab === 'participants' && (
        <div id="admin-tab-participants" className="bg-white dark:bg-zinc-950/40 p-5 rounded-2xl border border-zinc-150 dark:border-zinc-900 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 font-mono">Participantes Cadastrados</h3>
              <p className="text-xs text-zinc-400">Relatório geral de participantes cadastrados por CPF na plataforma, compras aprovadas e valores despendidos.</p>
            </div>
            <button
              onClick={() => handleExportCSV()}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer shadow"
            >
              <Download className="w-4.5 h-4.5" /> Exportar Dados
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b text-zinc-400 uppercase font-mono font-bold text-[10px]">
                  <th className="py-2.5">Nome</th>
                  <th className="py-2.5">CPF</th>
                  <th className="py-2.5">Telefone</th>
                  <th className="py-2.5 text-center">Quantidade Paga</th>
                  <th className="py-2.5 text-right font-bold text-emerald-600">Valor Investido</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/50 dark:divide-zinc-900">
                {participants.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-zinc-400 italic">
                      Nenhum participante com vendas registradas ainda.
                    </td>
                  </tr>
                ) : (
                  participants.map((person: any) => (
                    <tr key={person.cpf} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 text-zinc-700 dark:text-zinc-300 font-medium">
                      <td className="py-3.5 pr-2 font-bold text-zinc-900 dark:text-white">{person.name}</td>
                      <td className="py-3.5 font-mono">{person.cpf}</td>
                      <td className="py-3.5 font-mono">{person.phone}</td>
                      <td className="py-3.5 text-center font-bold font-mono">{person.totalTicketsCount} cotas</td>
                      <td className="py-3.5 text-right font-bold text-emerald-600 font-mono">R$ {person.totalPaidAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MANAGE SALES & MANUAL PIX APPROVALS */}
      {!loading && activeTab === 'sales' && (
        <div id="admin-tab-sales" className="bg-white dark:bg-zinc-950/40 p-5 rounded-2xl border border-zinc-150 dark:border-zinc-900 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-3">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 font-mono flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Baixa de Comprovantes & Controle de Vendas
              </h3>
              <p className="text-xs text-zinc-400">
                Audite e gerencie faturas do sistema. Confirme o recebimento do PIX enviado pelo cliente e dê baixa manual em 1 clique.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
            <div className="flex flex-wrap gap-1 bg-zinc-50 dark:bg-zinc-900/50 p-1 rounded-xl border">
              {(['all', 'pending', 'approved', 'expired'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setSalesFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                    salesFilter === st
                      ? 'bg-zinc-900 text-white dark:bg-zinc-800'
                      : 'text-zinc-550 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  {st === 'all' ? 'Ver Todos' : st === 'pending' ? '🔵 Pendentes' : st === 'approved' ? '🟢 Aprovados' : '⚪ Expirados'}
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="Buscar por Nome, CPF, Telefone ou ID do Pagamento..."
              value={salesSearch}
              onChange={(e) => setSalesSearch(e.target.value)}
              className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2 rounded-xl text-xs w-full md:max-w-xs focus:ring-1 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b text-zinc-400 uppercase font-mono font-bold text-[10px]">
                  <th className="py-2.5 pr-2">Data / Transação</th>
                  <th className="py-2.5">Cliente</th>
                  <th className="py-2.5">Ação / Rifa</th>
                  <th className="py-2.5 text-center">Cotas / Números</th>
                  <th className="py-2.5 text-center">Método</th>
                  <th className="py-2.5 text-right font-bold text-emerald-600">Valor Total</th>
                  <th className="py-2.5 text-center">Status</th>
                  <th className="py-2.5 text-right pr-2">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/50 dark:divide-zinc-900">
                {filteredSalesList.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-zinc-400 italic">
                      Nenhuma reserva ou venda encontrada neste filtro.
                    </td>
                  </tr>
                ) : (
                  filteredSalesList.map((item) => (
                    <tr key={item.paymentId} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 text-zinc-700 dark:text-zinc-300 font-medium">
                      <td className="py-3 pr-2">
                        <span className="block font-bold text-zinc-900 dark:text-white">
                          {new Date(item.createdAt).toLocaleString('pt-BR')}
                        </span>
                        <span className="block font-mono text-[10px] text-zinc-400">{item.paymentId}</span>
                      </td>
                      <td className="py-3">
                        <span className="block font-bold text-zinc-850 dark:text-zinc-150">{item.buyer.name}</span>
                        <span className="block text-[10px] text-zinc-400 font-mono">
                          CPF: {item.buyer.cpf} | {item.buyer.phone}
                        </span>
                      </td>
                      <td className="py-3 max-w-[180px] truncate">
                        <span className="font-semibold text-zinc-700 dark:text-zinc-300" title={item.raffleName}>
                          {item.raffleName}
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        <span className="block font-bold font-mono text-zinc-805 dark:text-zinc-150">
                          {item.numbers.length} {item.numbers.length === 1 ? 'cota' : 'cotas'}
                        </span>
                        <span className="block text-[10px] text-zinc-400 font-mono max-w-[140px] truncate" title={item.numbers.join(', ')}>
                          {item.numbers.join(', ')}
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        <span className="capitalize font-mono font-bold text-[10px] bg-zinc-100 dark:bg-zinc-900/50 p-1 rounded inline-block">
                          {item.gateway === 'manual' ? '💼 PIX Manual' : item.gateway}
                        </span>
                      </td>
                      <td className="py-3 text-right font-bold text-zinc-900 dark:text-white font-mono">
                        R$ {item.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 text-center">
                        <span className={`inline-block font-mono font-bold text-[9px] uppercase px-2.5 py-0.5 rounded-full ${
                          item.status === 'approved'
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200/40'
                            : item.status === 'pending'
                            ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-200/40'
                            : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-500'
                        }`}>
                          {item.status === 'approved' ? 'Pago' : item.status === 'pending' ? 'Pendente' : 'Expirado'}
                        </span>
                      </td>
                      <td className="py-3 text-right pr-2">
                        {item.status === 'pending' ? (
                          <div className="flex gap-1.5 justify-end">
                            <button
                              onClick={() => handleApproveManualPayment(item.paymentId)}
                              className="bg-emerald-600 hover:bg-emerald-505 text-white text-[10px] font-bold px-2.5 py-1.5 rounded cursor-pointer transition-transform active:scale-95 flex items-center gap-0.5"
                              title="Confirmar pagamento e registrar bilhetes como pagos"
                            >
                              <Check className="w-3 h-3" /> Baixar PIX
                            </button>
                            <button
                              onClick={() => handleCancelSale(item.paymentId)}
                              className="bg-red-50 hover:bg-red-100 dark:bg-red-950/45 text-red-600 dark:text-red-400 text-[10px] font-bold px-2.5 py-1.5 rounded cursor-pointer border border-red-200/30"
                              title="Cancelar reserva e liberar números"
                            >
                              Liberar
                            </button>
                          </div>
                        ) : item.status === 'approved' && item.approvedAt ? (
                          <span className="block text-[10px] text-zinc-400 font-mono italic">
                            Aprovado em {new Date(item.approvedAt).toLocaleDateString('pt-BR')}
                          </span>
                        ) : (
                          <span className="text-[10px] text-zinc-400 font-mono italic">Expirado/Liberado</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* GATEWAY SETTINGS TAB */}
      {!loading && activeTab === 'gateways' && config && (
        <form onSubmit={handleSaveGatewayConfig} id="admin-tab-gateway" className="bg-white dark:bg-zinc-950/40 p-6 rounded-2xl border border-zinc-150 dark:border-zinc-900 shadow-sm space-y-6">
          <div className="space-y-1 border-b pb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 font-mono">
              Configurações de Meios de Pagamento (PIX) e WhatsApp API
            </h3>
            <p className="text-xs text-zinc-400">
              Gerencie as chaves de de API e selecione o gateway de cobrança PIX ativo para os clientes efetuarem checkout.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 text-xs text-zinc-700 dark:text-zinc-300">
            {/* Payment PIX config */}
            <div className="space-y-4">
              <span className="text-xs font-bold text-zinc-500 uppercase font-mono block">Instalação de Meio de Pagamento</span>
              
              <div className="space-y-1.5">
                <label className="block font-semibold">Gateway PIX Ativo *</label>
                <select
                  value={config.activeGateway}
                  onChange={(e: any) => setConfig(prev => prev ? ({ ...prev, activeGateway: e.target.value }) : null)}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border p-2.5 rounded-xl text-xs cursor-pointer font-bold text-zinc-800 dark:text-zinc-200"
                >
                  <option value="mercadopago">Mercado Pago (PIX com baixa automática)</option>
                  <option value="efi">Efí Bank (Antiga Gerencianet - Oficial PIX)</option>
                  <option value="asaas">Asaas PIX Gateway</option>
                  <option value="manual">Chave PIX Própria (Aprovação Manual por Envio de Comprovante)</option>
                </select>
              </div>

              <div className="space-y-3 p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border">
                <span className="font-bold text-[10px] tracking-wider uppercase text-zinc-450 block">Credenciais Ativas de Cobrança</span>
                
                {config.activeGateway === 'manual' && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 border border-indigo-100 rounded-xl space-y-1">
                      <span className="font-bold block">💡 Baixa Manual Ativa</span>
                      <span>O cliente efetuará o PIX na sua conta e enviará o comprovante para você validar e dar baixa manualmente no painel abaixo.</span>
                    </div>
                    <div className="space-y-1">
                      <label className="block font-medium">Sua Chave PIX *</label>
                      <input
                        type="text"
                        required
                        value={config.manualPixKey || ''}
                        onChange={(e) => setConfig(prev => prev ? ({ ...prev, manualPixKey: e.target.value }) : null)}
                        className="w-full bg-white dark:bg-zinc-950 border p-2 rounded text-xs"
                        placeholder="Insira CPF, Celular, E-mail ou Chave Aleatória"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block font-medium">Nome do Favorecido *</label>
                      <input
                        type="text"
                        required
                        value={config.manualPixName || ''}
                        onChange={(e) => setConfig(prev => prev ? ({ ...prev, manualPixName: e.target.value }) : null)}
                        className="w-full bg-white dark:bg-zinc-950 border p-2 rounded text-xs"
                        placeholder="Ex: Pedro Henrique Souza"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block font-medium">Instituição Bancária *</label>
                      <input
                        type="text"
                        required
                        value={config.manualPixBank || ''}
                        onChange={(e) => setConfig(prev => prev ? ({ ...prev, manualPixBank: e.target.value }) : null)}
                        className="w-full bg-white dark:bg-zinc-950 border p-2 rounded text-xs"
                        placeholder="Ex: Nubank, Banco Inter, Itaú"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block font-medium">Instruções aos Clientes (Exibido no checkout) *</label>
                      <textarea
                        rows={4}
                        required
                        value={config.manualPixInstructions || ''}
                        onChange={(e) => setConfig(prev => prev ? ({ ...prev, manualPixInstructions: e.target.value }) : null)}
                        className="w-full bg-white dark:bg-zinc-950 border p-2 rounded text-xs leading-relaxed"
                        placeholder="Prezado cliente, faça o PIX e clique no botão de WhatsApp para nos enviar o comprovante..."
                      />
                    </div>
                  </div>
                )}

                {config.activeGateway === 'mercadopago' && (
                  <div className="space-y-1">
                    <label className="block font-medium">Mercado Pago Access Token *</label>
                    <input
                      type="password"
                      value={config.mercadopagoToken}
                      onChange={(e) => setConfig(prev => prev ? ({ ...prev, mercadopagoToken: e.target.value }) : null)}
                      className="w-full bg-white dark:bg-zinc-950 border p-2 rounded text-xs"
                    />
                  </div>
                )}

                {config.activeGateway === 'efi' && (
                  <div className="space-y-1">
                    <label className="block font-medium">Efí API Token / Client Secret *</label>
                    <input
                      type="password"
                      value={config.efiToken}
                      onChange={(e) => setConfig(prev => prev ? ({ ...prev, efiToken: e.target.value }) : null)}
                      className="w-full bg-white dark:bg-zinc-950 border p-2 rounded text-xs"
                    />
                  </div>
                )}

                {config.activeGateway === 'asaas' && (
                  <div className="space-y-1">
                    <label className="block font-medium">Asaas API Key *</label>
                    <input
                      type="password"
                      value={config.asaasToken}
                      onChange={(e) => setConfig(prev => prev ? ({ ...prev, asaasToken: e.target.value }) : null)}
                      className="w-full bg-white dark:bg-zinc-950 border p-2 rounded text-xs"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 rounded-xl">
                <input
                  type="checkbox"
                  id="auto_approve_check"
                  checked={config.autoApproveSimulation}
                  onChange={(e) => setConfig(prev => prev ? ({ ...prev, autoApproveSimulation: e.target.checked }) : null)}
                  className="w-4 h-4 cursor-pointer"
                />
                <label htmlFor="auto_approve_check" className="font-semibold text-emerald-800 dark:text-emerald-400 cursor-pointer">
                  Habilitar simulação síncrona / Webhook automático de PIX aprovado
                </label>
              </div>
            </div>

            {/* Simulated WhatsApp Config */}
            <div className="space-y-4">
              <span className="text-xs font-bold text-zinc-500 uppercase font-mono block">WhatsApp API Service (Envio de Comprovante)</span>
              
              <div className="space-y-1">
                <label className="block font-semibold">Token de Autenticação WhatsApp API</label>
                <input
                  type="password"
                  value={config.whatsappToken}
                  onChange={(e) => setConfig(prev => prev ? ({ ...prev, whatsappToken: e.target.value }) : null)}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border p-2.5 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-semibold">Número do Remetente (Oficial da Rifa)</label>
                <input
                  type="text"
                  value={config.whatsappPhone}
                  onChange={(e) => setConfig(prev => prev ? ({ ...prev, whatsappPhone: e.target.value }) : null)}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border p-2.5 rounded-xl text-xs font-mono"
                  placeholder="Ex: 5511999998888"
                />
              </div>

              <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-dashed space-y-2 leading-relaxed">
                <h5 className="font-bold text-[10px] text-zinc-550 uppercase">Nota de Integração Directa</h5>
                <p className="text-[11px] text-zinc-450">
                  Nossa plataforma possui arquivos de escopo prontos para conexão rápida com APIs como Whatsapp Business Cloud API, Z-API ou Evolution API. O painel administrativo intercepta e simula esses disparos síncronos na aba <strong>Envios e Auditorias</strong> para fins de validação em tempo de execução de forma impecável!
                </p>
              </div>
            </div>
          </div>

          <div className="border-t pt-4 flex justify-end">
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-xl text-xs cursor-pointer shadow-md shadow-emerald-500/10 hover:scale-[1.01] transition-transform"
            >
              Salvar Credenciais da Plataforma
            </button>
          </div>
        </form>
      )}

      {/* WHATSAPP AUDITS AND NOTIFICATION LOGS */}
      {!loading && activeTab === 'logs' && (
        <div id="admin-tab-logs" className="grid lg:grid-cols-2 gap-6">
          {/* Audit Logs */}
          <div className="bg-white dark:bg-zinc-950/40 p-5 rounded-2xl border border-zinc-150 dark:border-zinc-900 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 font-mono border-b pb-2">Auditorias do Sistema</h3>
            <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-1">
              {auditLogs.length === 0 ? (
                <p className="text-xs text-zinc-450 italic text-center py-8">Sem auditorias de segurança registradas nas últimas horas.</p>
              ) : (
                auditLogs.map(log => (
                  <div key={log.id} className="p-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl text-xs border border-zinc-200/40 relative">
                    <div className="flex justify-between text-[10px] font-mono text-zinc-400 mb-1">
                      <span>Log: {log.action}</span>
                      <span>{new Date(log.timestamp).toLocaleString('pt-BR')}</span>
                    </div>
                    <p className="font-medium text-zinc-800 dark:text-zinc-200">{log.details || log.action}</p>
                    <span className="absolute bottom-1 right-2 font-mono text-[9px] text-zinc-400">IP: {log.ip}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Simulated WhatsApp Feeds */}
          <div className="bg-white dark:bg-zinc-950/40 p-5 rounded-2xl border border-zinc-150 dark:border-zinc-900 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 font-mono border-b pb-2">Feed do WhatsApp Simulator (Disparos Automáticos)</h3>
            <p className="text-xs text-zinc-400">Verifique em tempo real as mensagens que a plataforma disparou para o WhatsApp dos participantes quando as reservas de bilhetes foram criadas e as quitações via PIX foram identificadas.</p>
            
            <div className="space-y-3.5 max-h-[385px] overflow-y-auto pr-1">
              {webhookLogs.length === 0 ? (
                <p className="text-xs text-zinc-450 italic text-center py-8">Nenhuma mensagem disparada nas últimas interações.</p>
              ) : (
                webhookLogs.map(log => (
                  <div key={log.id} className="p-4 bg-zinc-900 rounded-2xl text-xs text-white border border-zinc-800 flex flex-col justify-between max-w-sm mx-auto shadow-xl relative">
                    {/* Header simulating WhatsApp top bar */}
                    <div className="flex justify-between items-center bg-zinc-800 -mx-4 -mt-4 p-2.5 rounded-t-2xl px-4 border-b border-zinc-850 mb-3 text-[10px] font-mono text-emerald-400 font-bold">
                      <span>📱 WhatsApp remetente: {config?.whatsappPhone || 'Rifa Atendente'}</span>
                      <span className="text-zinc-400 font-normal">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="space-y-1.5 font-sans leading-normal whitespace-pre-wrap block bg-teal-950/20 p-3 rounded-lg border border-teal-900/30">
                      {log.message}
                    </div>
                    <div className="mt-2 text-[10px] font-mono text-zinc-500 flex justify-between">
                      <span>Para: {log.buyerPhone} ({log.buyerName})</span>
                      <span className="text-emerald-400 flex items-center gap-0.5">✓✓ Enviado</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
