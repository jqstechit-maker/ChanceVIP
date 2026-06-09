/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { Raffle, TicketSale, GatewayConfig, AuditLog, WebhookSimulationLog, DashboardStats, TicketStatus } from './src/types';

export const app = express();
const PORT = 3000;

app.use(express.json());

// Persistent Data Paths
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'platform-db.json');

// Ensure database directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial default configuration
const defaultGatewayConfig: GatewayConfig = {
  activeGateway: 'mercadopago',
  mercadopagoToken: 'TEST-7281394719283719-MP-MOCK-TOKEN',
  efiToken: 'TEST-EFI-90184029384-TOKEN',
  asaasToken: 'TEST-ASAAS-92817392817-TOKEN',
  whatsappToken: 'WHATSAPP_MOCK_API_KEY_J298H',
  whatsappPhone: '5511999998888',
  autoApproveSimulation: true,
  manualPixKey: 'suachave@pix.com',
  manualPixName: 'ChanceVip Facilitadora LTDA',
  manualPixBank: 'Mercado Pago / Banco Inter',
  manualPixInstructions: 'Prezado cliente, realize o Pix Copia e Cola ou escaneie o código QR. Em seguida, clique no botão de WhatsApp para nos enviar o comprovante de pagamento. Nós daremos a baixa manual das suas cotas em instantes!'
};

// Initial default raffles to populate the applet elegantly
const initialRaffles: Raffle[] = [
  {
    id: 'raf-mt07',
    name: 'YAMAHA MT-07 2026 - ZERO KM + R$ 5.000 NO PIX',
    description: 'A esportiva mais amada do Brasil pode ser sua nesta ação imperdível! Motor bicilíndrico crossplane de 689cc, freios ABS e painel digital completo. Documentação e frete grátis para todo o território nacional. Participe e boa sorte!',
    rules: '1. O sorteio será realizado com base na Extração da Loteria Federal assim que todos os números forem vendidos.\n2. Para identificar o ganhador, utilizaremos os últimos 4 dígitos do 1º prêmio.\n3. O pagamento deve ser realizado em até 15 minutos via PIX, caso contrário, os números voltarão a ficar disponíveis.\n4. Imagens meramente ilustrativas.',
    totalNumbers: 10000,
    numberPrice: 15.00,
    drawDate: '2026-06-25',
    drawConcurso: 'Concurso 6023 da Loteria Federal',
    imageUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=800',
    status: 'active',
    winnerNumber: null,
    winnerName: null,
    winnerCity: null,
    createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    prize1: 'YAMAHA MT-07 2026 - ZERO KM',
    prize2: 'R$ 5.000 NO PIX',
    prize3: 'R$ 1.000 NO PIX'
  },
  {
    id: 'raf-iphone15',
    name: 'IPHONE 15 PRO MAX 512GB - TITÂNIO NATURAL',
    description: 'Participe do sorteio de um iPhone 15 Pro Max de 512GB na cor Titânio Natural. O smartphone mais avançado com chip A17 Pro de alto desempenho, câmera pro de 48MP e estojo em titânio incrivelmente resistente.',
    rules: '1. Sorteio garantido baseado na Loteria Federal.\n2. O vencedor será o portador do número exato sorteado.\n3. Cancelamento automático de reservas não pagas em 15 minutos.\n4. Entrega expressa grátis para todo o Brasil.',
    totalNumbers: 1000,
    numberPrice: 5.00,
    drawDate: '2026-06-18',
    drawConcurso: 'Concurso 6021 da Loteria Federal',
    imageUrl: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&q=80&w=800',
    status: 'active',
    winnerNumber: null,
    winnerName: null,
    winnerCity: null,
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    prize1: 'IPHONE 15 PRO MAX 512GB',
    prize2: 'R$ 1.500 NO PIX',
    prize3: 'R$ 500 NO PIX'
  },
  {
    id: 'raf-mini',
    name: 'MINI COOPER S ROADSTER CABRIOLET',
    description: 'Ação promocional super exclusiva! Mini Cooper S Roadster conversível com motor Turbo, bancos esportivos em couro, câmbio borboleta e design inconfundível. Uma verdadeira máquina britânica na sua garagem!',
    rules: '1. Sorteio pela Loteria Federal.\n2. Reservas com validade estrita de 15 minutos.\n3. Retirada de responsabilidade do ganhador ou opção de entrega direta acordada.\n4. Auditoria completa pós-pagamento.',
    totalNumbers: 5000,
    numberPrice: 45.00,
    drawDate: '2026-06-30',
    drawConcurso: 'Concurso 6025 da Loteria Federal',
    imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800',
    status: 'active',
    winnerNumber: null,
    winnerName: null,
    winnerCity: null,
    createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
    prize1: 'MINI COOPER S ROADSTER CABRIOLET',
    prize2: 'R$ 10.000 NO PIX',
    prize3: 'R$ 2.000 NO PIX'
  },
  {
    id: 'raf-drawn-tv',
    name: 'SAMSUNG ULTRA HD SMART TV 65" 4K',
    description: 'Sorteio realizado para celebrar a inauguração da nossa plataforma! Uma Smart TV Samsung de nova geração para assistir ao seu futebol ou séries com o máximo de imersão tecnológica.',
    rules: 'Contemplado via extração regulamentar da Loteria Federal.',
    totalNumbers: 500,
    numberPrice: 2.50,
    drawDate: '2026-05-28',
    drawConcurso: 'Concurso 6015 da Loteria Federal',
    imageUrl: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&q=80&w=800',
    status: 'drawn',
    winnerNumber: '0317',
    winnerName: 'Marcos de Souza Mendes',
    winnerCity: 'Ribeirão Preto - SP',
    createdAt: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString(),
    prize1: 'SAMSUNG SMART TV 65" 4K',
    prize2: 'R$ 500 NO PIX',
    prize3: 'R$ 200 NO PIX'
  }
];

// In-Memory Database State
let raffles: Raffle[] = [];
let sales: TicketSale[] = [];
// Map representation of occupied tickets to prevent iterating huge arrays: 
// { [raffleId]: { [ticketNumber]: { status, buyerName, phone, cpf, reservedAt, paymentId } } }
let occupiedTickets: {
  [raffleId: string]: {
    [ticketNumber: string]: {
      status: TicketStatus;
      buyerName: string;
      phone: string;
      cpf: string;
      reservedAt: string;
      paymentId: string;
    }
  }
} = {};
let config: GatewayConfig = defaultGatewayConfig;
let auditLogs: AuditLog[] = [];
let webhookLogs: WebhookSimulationLog[] = [];

// Load data function
function loadDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const dbContent = fs.readFileSync(DB_FILE, 'utf-8');
      const data = JSON.parse(dbContent);
      raffles = data.raffles || [];
      sales = data.sales || [];
      occupiedTickets = data.occupiedTickets || {};
      config = data.config || defaultGatewayConfig;
      auditLogs = data.auditLogs || [];
      webhookLogs = data.webhookLogs || [];
      console.log('Database loaded successfully. Records count:', raffles.length, 'raffles,', sales.length, 'sales.');
    } else {
      // First boot: populate with initial values
      raffles = initialRaffles;
      config = defaultGatewayConfig;
      sales = [
        {
          raffleId: 'raf-drawn-tv',
          numbers: ['0317'],
          buyer: {
            name: 'Marcos de Souza Mendes',
            cpf: '123***789-00',
            phone: '5511988887777',
            email: 'marcos.mendes@email.com',
            city: 'Ribeirão Preto - SP'
          },
          paymentId: 'pay-drawn-tv-0317',
          totalAmount: 2.50,
          status: 'approved',
          qrCode: '00020101021226300014br.gov.pix0112...',
          qrCodeCopy: '000201010212263000...MOCK...PIX',
          gateway: 'mercadopago',
          createdAt: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
          expiresAt: new Date(Date.now() - 5.9 * 24 * 3600 * 1000).toISOString(),
          approvedAt: new Date(Date.now() - 5.9 * 24 * 3600 * 1000).toISOString()
        }
      ];
      occupiedTickets = {
        'raf-drawn-tv': {
          '0317': {
            status: 'paid',
            buyerName: 'Marcos de Souza Mendes',
            phone: '5511988887777',
            cpf: '123***789-00',
            reservedAt: new Date().toISOString(),
            paymentId: 'pay-drawn-tv-0317'
          }
        }
      };
      
      // Let's pre-populate some test sales for 'raf-mt07' to make the stats graphs and filters look visually active immediately!
      createSampleSalesForDemo();
      
      saveDatabase();
      writeAuditLog('SYSTEM', 'Database initialized and formatted with demo data.');
    }
  } catch (error) {
    console.error('Error loading database:', error);
    // fallback to safety
    raffles = initialRaffles;
    config = defaultGatewayConfig;
  }
}

function createSampleSalesForDemo() {
  const buyerNames = ['Ana Júlia Santos', 'Pedro Henrique Alencar', 'Camila Rodrigues Coimbra', 'Cláudio Bezerra Neto'];
  const cpfs = ['411.233.159-01', '142.948.309-88', '110.455.677-44', '350.291.990-21'];
  const phones = ['11942831000', '21984223101', '31971168233', '81992147754'];
  const emails = ['anajulia@decor.com', 'pedro.alencar@site.com.br', 'camila.coi@gmail.com', 'claudio@net.com.br'];
  const cities = ['São Paulo - SP', 'Rio de Janeiro - RJ', 'Belo Horizonte - MG', 'Recife - PE'];

  occupiedTickets['raf-mt07'] = {};

  buyerNames.forEach((name, i) => {
    const qty = [5, 3, 8, 2][i];
    const ticketNumbers: string[] = [];
    for (let k = 0; k < qty; k++) {
      // numbers from 0005 to 0040 to make them visual
      const numStr = String(5 + i * 10 + k).padStart(4, '0');
      ticketNumbers.push(numStr);
    }

    const payId = `pay-demo-${i}-${Date.now()}`;
    const amount = qty * 15.00;

    const sale: TicketSale = {
      raffleId: 'raf-mt07',
      numbers: ticketNumbers,
      buyer: { name, cpf: cpfs[i], phone: phones[i], email: emails[i], city: cities[i] },
      paymentId: payId,
      totalAmount: amount,
      status: i === 3 ? 'pending' : 'approved', // one pending, three approved
      qrCode: '00020101021226300014br.gov.pix0112...',
      qrCodeCopy: `00020101021226300014br.gov.pix...DEMO...${payId}`,
      gateway: 'mercadopago',
      createdAt: new Date(Date.now() - (3 - i) * 12 * 3600 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      approvedAt: i === 3 ? null : new Date(Date.now() - (3 - i) * 11.5 * 3600 * 1000).toISOString()
    };

    sales.push(sale);

    ticketNumbers.forEach(n => {
      occupiedTickets['raf-mt07'][n] = {
        status: i === 3 ? 'reserved' : 'paid',
        buyerName: name,
        phone: phones[i],
        cpf: cpfs[i],
        reservedAt: i === 3 ? new Date().toISOString() : new Date(Date.now() - (3 - i) * 12 * 3600 * 1000).toISOString(),
        paymentId: payId
      };
    });
  });
}

// Save database helper
function saveDatabase() {
  try {
    const dataToSave = {
      raffles,
      sales,
      occupiedTickets,
      config,
      auditLogs,
      webhookLogs
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving database:', error);
  }
}

// Audit log helper
function writeAuditLog(user: string, action: string, details: string = '') {
  const log: AuditLog = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    action,
    details,
    ip: '127.0.0.1'
  };
  auditLogs.unshift(log);
  if (auditLogs.length > 500) {
    auditLogs.pop(); // cap audit logs size
  }
  saveDatabase();
}

// 15-Minute Reservation Check sweep
function checkReservationsSweep() {
  const now = Date.now();
  const fifteenMinutes = 15 * 60 * 1000;
  let hasChanges = false;

  sales.forEach(sale => {
    if (sale.status === 'pending') {
      const createdTime = new Date(sale.createdAt).getTime();
      if (now - createdTime > fifteenMinutes) {
        sale.status = 'expired';
        hasChanges = true;

        // Release associated tickets in occupiedTickets map
        const raffleOccupied = occupiedTickets[sale.raffleId];
        if (raffleOccupied) {
          sale.numbers.forEach(num => {
            if (raffleOccupied[num] && raffleOccupied[num].paymentId === sale.paymentId) {
              delete raffleOccupied[num];
            }
          });
        }
        writeAuditLog('SYSTEM', 'Reserva expirada automaticamente', `Compra ${sale.paymentId} com os números ${sale.numbers.join(', ')} expirou após 15 minutos.`);
      }
    }
  });

  if (hasChanges) {
    saveDatabase();
  }
}

// Run reservation check on API calls or via periodic 30-sec interval
setInterval(checkReservationsSweep, 30000);

// Initialize DB on boot
loadDatabase();

// API ROUTES

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'Chancevip' && password === 'Chancevip@2026') {
    res.json({ success: true, token: 'Chancevip@2026' });
  } else {
    res.status(401).json({ error: 'Usuário ou senha incorretos' });
  }
});

// Protect administrative endpoints
app.use('/api/admin', (req, res, next) => {
  if (req.path === '/login') {
    return next();
  }
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== 'Bearer Chancevip@2026') {
    return res.status(401).json({ error: 'Acesso não autorizado. Por favor, autentique-se primeiro.' });
  }
  next();
});

app.get('/api/admin/stats', (req, res) => {
  checkReservationsSweep();
  
  const approvedPaymentsArray = sales.filter(s => s.status === 'approved');
  const pendingPaymentsCount = sales.filter(s => s.status === 'pending').length;
  const approvedPaymentsCount = approvedPaymentsArray.length;

  const totalArrecadado = approvedPaymentsArray.reduce((acc, s) => acc + s.totalAmount, 0);
  const totalVendido = sales.reduce((acc, s) => acc + (s.status === 'approved' ? s.numbers.length : 0), 0);
  
  // Set of participants
  const participantsSet = new Set<string>();
  sales.forEach(s => {
    if (s.buyer?.cpf) {
      participantsSet.add(s.buyer.cpf);
    }
  });

  const rifasAtivas = raffles.filter(r => r.status === 'active').length;
  const rifasEncerradas = raffles.filter(r => r.status === 'drawn').length;

  // Group approved sales by day for charts (last 7 days)
  const salesByDay: { [dateStr: string]: { total: number; qty: number } } = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    salesByDay[dateStr] = { total: 0, qty: 0 };
  }

  approvedPaymentsArray.forEach(sale => {
    const dateObj = new Date(sale.approvedAt || sale.createdAt);
    const dateStr = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    if (salesByDay[dateStr]) {
      salesByDay[dateStr].total += sale.totalAmount;
      salesByDay[dateStr].qty += sale.numbers.length;
    }
  });

  const chartData = Object.keys(salesByDay).map(k => ({
    data: k,
    total: salesByDay[k].total,
    qtd: salesByDay[k].qty
  }));

  const stats: DashboardStats = {
    totalArrecadado,
    totalVendido,
    totalParticipantes: participantsSet.size,
    rifasAtivas,
    rifasEncerradas,
    pagamentosPendentes: pendingPaymentsCount,
    pagamentosAprovados: approvedPaymentsCount,
    vendasPorDia: chartData
  };

  res.json(stats);
});

// GET configuration
app.get('/api/admin/config', (req, res) => {
  res.json(config);
});

// POST configuration save
app.post('/api/admin/config', (req, res) => {
  config = { ...config, ...req.body };
  saveDatabase();
  writeAuditLog('ADMIN', 'Configurações de Gateways atualizadas');
  res.json({ success: true, config });
});

// GET audit logs & notification simulation log
app.get('/api/admin/logs', (req, res) => {
  res.json({ auditLogs, webhookLogs });
});

// GET list of all raffles
app.get('/api/raffles', (req, res) => {
  checkReservationsSweep();
  // Return raffles with sold statistics computed on-the-fly
  const responseData = raffles.map(raffle => {
    const raffleSales = sales.filter(s => s.raffleId === raffle.id && s.status === 'approved');
    const numbersSold = raffleSales.reduce((acc, sale) => acc + sale.numbers.length, 0);
    const raffleReserved = sales.filter(s => s.raffleId === raffle.id && s.status === 'pending');
    const numbersReserved = raffleReserved.reduce((acc, sale) => acc + sale.numbers.length, 0);

    return {
      ...raffle,
      numbersSold,
      numbersReserved
    };
  });
  res.json(responseData);
});

// GET single raffle and its occupied numbers map (essential to keep transfer small)
app.get('/api/raffles/:id', (req, res) => {
  const { id } = req.params;
  const raffle = raffles.find(r => r.id === id);
  if (!raffle) {
    return res.status(404).json({ error: 'Rifa não encontrada' });
  }

  // Ensure occupied ticket status structure is fully swept
  checkReservationsSweep();

  const occupied = occupiedTickets[id] || {};

  // For high-fidelity response, include statistics
  const raffleApprovedSales = sales.filter(s => s.raffleId === id && s.status === 'approved');
  const numbersPaid = raffleApprovedSales.reduce((acc, sale) => acc + sale.numbers.length, 0);
  const rafflePendingSales = sales.filter(s => s.raffleId === id && s.status === 'pending');
  const numbersReserved = rafflePendingSales.reduce((acc, sale) => acc + sale.numbers.length, 0);

  res.json({
    raffle,
    occupied,
    stats: {
      paid: numbersPaid,
      reserved: numbersReserved,
      available: raffle.totalNumbers - numbersPaid - numbersReserved
    }
  });
});

// CREATE / DUPLICATE raffle
app.post('/api/raffles', (req, res) => {
  const { id, name, description, rules, totalNumbers, numberPrice, drawDate, drawConcurso, imageUrl, status, prize1, prize2, prize3 } = req.body;
  
  if (!name || !totalNumbers || !numberPrice) {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
  }

  const isNew = !id;
  const raffleId = id || `raf-${Date.now()}`;

  const raffleData: Raffle = {
    id: raffleId,
    name,
    description: description || '',
    rules: rules || 'Regulamento tradicional.',
    totalNumbers: Number(totalNumbers),
    numberPrice: Number(numberPrice),
    drawDate: drawDate || '',
    drawConcurso: drawConcurso || 'Loteria Federal',
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=800',
    status: status || 'active',
    winnerNumber: req.body.winnerNumber || null,
    winnerName: req.body.winnerName || null,
    winnerCity: req.body.winnerCity || null,
    createdAt: req.body.createdAt || new Date().toISOString(),
    prize1: prize1 || '',
    prize2: prize2 || '',
    prize3: prize3 || ''
  };

  if (isNew) {
    raffles.push(raffleData);
    occupiedTickets[raffleId] = {};
    writeAuditLog('ADMIN', 'Nova Rifa Criada', `Ação: ${name} (${totalNumbers} números)`);
  } else {
    const idx = raffles.findIndex(r => r.id === id);
    if (idx !== -1) {
      raffles[idx] = raffleData;
      writeAuditLog('ADMIN', 'Rifa Editada/Atualizada', `Ação: ${name}`);
    } else {
      raffles.push(raffleData);
    }
  }

  saveDatabase();
  res.json({ success: true, raffle: raffleData });
});

// DELETE / ARCHIVE raffle
app.delete('/api/raffles/:id', (req, res) => {
  const { id } = req.params;
  const idx = raffles.findIndex(r => r.id === id);
  if (idx !== -1) {
    const name = raffles[idx].name;
    raffles.splice(idx, 1);
    delete occupiedTickets[id];
    // Keep sales but mark them or archive
    writeAuditLog('ADMIN', 'Rifa Excluída Permanentemente', `Ação: ${name}`);
    saveDatabase();
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Rifa não encontrada' });
  }
});

// RESERVE TICKETS (Initiate checkout)
app.post('/api/tickets/reserve', (req, res) => {
  const { raffleId, numbers, buyer } = req.body;

  if (!raffleId || !numbers || !numbers.length || !buyer || !buyer.cpf || !buyer.phone || !buyer.name) {
    return res.status(400).json({ error: 'Informações incompletas para reserva.' });
  }

  const raffle = raffles.find(r => r.id === raffleId);
  if (!raffle) {
    return res.status(404).json({ error: 'Rifa não encontrada' });
  }

  if (raffle.status !== 'active') {
    return res.status(400).json({ error: 'Esta rifa não está ativa para vendas.' });
  }

  checkReservationsSweep();

  if (!occupiedTickets[raffleId]) {
    occupiedTickets[raffleId] = {};
  }

  const currentOccupied = occupiedTickets[raffleId];
  const conflicts: string[] = [];

  numbers.forEach((num: string) => {
    if (currentOccupied[num]) {
      conflicts.push(num);
    }
  });

  if (conflicts.length > 0) {
    return res.status(400).json({
      error: 'Alguns dos números escolhidos já estão reservados ou vendidos.',
      conflicts
    });
  }

  const paymentId = `pay-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const totalAmount = numbers.length * raffle.numberPrice;
  const createdAt = new Date().toISOString();
  // Expires in exactly 15 minutes
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  // Generate PIX QR Code payload (Simulated but fully readable with standard formatting)
  let copiaECola = `00020101021226300014br.gov.pix0112${config.whatsappPhone || '5511999998888'}5204000053039865405${totalAmount.toFixed(2)}5802BR5915RIFAS_ONLINE6014SAO_PAULO62290525${paymentId}6304`;
  if (config.activeGateway === 'manual' && config.manualPixKey) {
    const sanitizedKey = config.manualPixKey.replace(/[^a-zA-Z0-9@.-]/g, '');
    copiaECola = `00020101021226300014br.gov.pix0112${sanitizedKey}5204000053039865405${totalAmount.toFixed(2)}5802BR5915CHANCEVIP6104000062290525${paymentId}6304`;
  }

  const newSale: TicketSale = {
    raffleId,
    numbers,
    buyer,
    paymentId,
    totalAmount,
    status: 'pending',
    qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(copiaECola)}`,
    qrCodeCopy: copiaECola,
    gateway: config.activeGateway || 'mercadopago',
    createdAt,
    expiresAt,
    approvedAt: null,
    manualPixKey: config.manualPixKey || '',
    manualPixName: config.manualPixName || '',
    manualPixBank: config.manualPixBank || '',
    manualPixInstructions: config.manualPixInstructions || '',
    whatsappPhone: config.whatsappPhone || ''
  };

  sales.push(newSale);

  // Mark in occupied tickets map as reserved
  numbers.forEach((num: string) => {
    currentOccupied[num] = {
      status: 'reserved',
      buyerName: buyer.name,
      phone: buyer.phone,
      cpf: buyer.cpf,
      reservedAt: createdAt,
      paymentId
    };
  });

  saveDatabase();

  writeAuditLog('VENDAS', 'Reserva criada temporariamente', `Comprador ${buyer.name} reservou os números ${numbers.join(', ')} por 15 minutos.`);

  // If auto-simulate approval is enabled, trigger simulated WhatsApp pre-invoice message
  simulateWhatsAppNotification(newSale, 'invoice_created');

  res.json({
    success: true,
    payment: newSale
  });
});

// SIMULATE PIX AUTO-APPROVE / WEBHOOK INCOMING
app.post('/api/tickets/pay-simulate', (req, res) => {
  const { paymentId } = req.body;
  
  if (!paymentId) {
    return res.status(400).json({ error: 'paymentId obrigatório' });
  }

  const sale = sales.find(s => s.paymentId === paymentId);
  if (!sale) {
    return res.status(404).json({ error: 'Transação PIX não encontrada' });
  }

  if (sale.status === 'approved') {
    return res.json({ success: true, message: 'Este pagamento já estava aprovado.', sale });
  }

  if (sale.status === 'expired') {
    return res.status(400).json({ error: 'Esta reserva expirou e não pode ser paga direta.' });
  }

  // Approve sale
  sale.status = 'approved';
  sale.approvedAt = new Date().toISOString();

  // Commit tickets as paid
  const currentOccupied = occupiedTickets[sale.raffleId];
  if (currentOccupied) {
    sale.numbers.forEach(num => {
      if (currentOccupied[num]) {
        currentOccupied[num].status = 'paid';
      } else {
        // Safe check
        currentOccupied[num] = {
          status: 'paid',
          buyerName: sale.buyer.name,
          phone: sale.buyer.phone,
          cpf: sale.buyer.cpf,
          reservedAt: sale.createdAt,
          paymentId
        };
      }
    });
  }

  saveDatabase();

  writeAuditLog('GATEWAY_PIX', 'Pagamento aprovado via PIX', `Compra ${paymentId} aprovada automaticamente para ${sale.buyer.name}.`);

  // Send WhatsApp delivery simulation
  simulateWhatsAppNotification(sale, 'receipt_delivered');

  res.json({
    success: true,
    message: 'Pagamento simulado com o gateway de forma síncrona!',
    sale
  });
});

// CLIENT lookup tickets by CPF or Phone (Area do Cliente)
app.get('/api/customer/tickets', (req, res) => {
  const { query } = req.query; // query can be CPF or Phone
  if (!query) {
    return res.status(400).json({ error: 'Informe o CPF ou Telefone para consulta' });
  }

  const cleanedQuery = String(query).replace(/[^\w\d]/g, ''); // alphanumeric format filter

  const results = sales.filter(sale => {
    const saleCpfCleaned = sale.buyer?.cpf?.replace(/[^\w\d]/g, '') || '';
    const salePhoneCleaned = sale.buyer?.phone?.replace(/[^\w\d]/g, '') || '';
    return saleCpfCleaned.includes(cleanedQuery) || salePhoneCleaned.includes(cleanedQuery);
  });

  // Hydrate with raffle details
  const hydratedResults = results.map(sale => {
    const rf = raffles.find(r => r.id === sale.raffleId);
    return {
      ...sale,
      // Mask sensitive buyer data
      buyer: {
        name: sale.buyer.name,
        cpf: sale.buyer.cpf ? (sale.buyer.cpf.includes('***') ? sale.buyer.cpf : (sale.buyer.cpf.length >= 6 ? sale.buyer.cpf.substring(0, 3) + '.***.***-' + sale.buyer.cpf.substring(sale.buyer.cpf.length - 2) : '***')) : '',
        phone: sale.buyer.phone ? (sale.buyer.phone.length >= 8 ? sale.buyer.phone.substring(0, 4) + '*****' + sale.buyer.phone.substring(sale.buyer.phone.length - 4) : '***') : '',
        email: sale.buyer.email ? (sale.buyer.email.includes('@') ? (sale.buyer.email.split('@')[0].substring(0, 1) + '***@' + sale.buyer.email.split('@')[1]) : '***') : '',
        city: sale.buyer.city || 'Não informado'
      },
      raffleName: rf ? rf.name : 'Rifa Própria',
      raffleImage: rf ? rf.imageUrl : '',
      drawDate: rf ? rf.drawDate : '',
      drawConcurso: rf ? rf.drawConcurso : ''
    };
  });

  res.json(hydratedResults);
});

// ADMIN: BLOCK or UNBLOCK numbers
app.post('/api/admin/block', (req, res) => {
  const { raffleId, numbers, blockType } = req.body; // blockType: 'block' | 'release'

  if (!raffleId || !numbers || !numbers.length) {
    return res.status(400).json({ error: 'raffleId e números são necessários.' });
  }

  if (!occupiedTickets[raffleId]) {
    occupiedTickets[raffleId] = {};
  }

  const currentOccupied = occupiedTickets[raffleId];
  
  if (blockType === 'block') {
    numbers.forEach((num: string) => {
      currentOccupied[num] = {
        status: 'blocked',
        buyerName: 'Administração (Bloqueado)',
        phone: '',
        cpf: '',
        reservedAt: new Date().toISOString(),
        paymentId: 'admin-block'
      };
    });
    writeAuditLog('ADMIN', 'Números bloqueados manualmente', `Rifa ${raffleId}. Números: ${numbers.join(', ')}`);
  } else {
    numbers.forEach((num: string) => {
      if (currentOccupied[num] && (currentOccupied[num].status === 'blocked' || currentOccupied[num].paymentId === 'admin-block')) {
        delete currentOccupied[num];
      }
    });
    writeAuditLog('ADMIN', 'Números liberados manualmente', `Rifa ${raffleId}. Números: ${numbers.join(', ')}`);
  }

  saveDatabase();
  res.json({ success: true, occupied: currentOccupied });
});

// ADMIN: GET LIST OF USERS/PARTICIPANTS with advanced aggregates
app.get('/api/admin/participants', (req, res) => {
  const buyerRegistry: { [cpf: string]: any } = {};

  sales.forEach(sale => {
    if (!sale.buyer || !sale.buyer.cpf) return;
    const cpf = sale.buyer.cpf;

    if (!buyerRegistry[cpf]) {
      buyerRegistry[cpf] = {
        name: sale.buyer.name,
        cpf: sale.buyer.cpf,
        phone: sale.buyer.phone,
        email: sale.buyer.email,
        city: sale.buyer.city || 'Não informado',
        totalTicketsCount: 0,
        totalPaidAmount: 0,
        purchases: []
      };
    }

    const rf = raffles.find(r => r.id === sale.raffleId);
    buyerRegistry[cpf].purchases.push({
      paymentId: sale.paymentId,
      raffleName: rf ? rf.name : 'Rifa',
      numbersCount: sale.numbers.length,
      amount: sale.totalAmount,
      status: sale.status,
      createdAt: sale.createdAt
    });

    if (sale.status === 'approved') {
      buyerRegistry[cpf].totalTicketsCount += sale.numbers.length;
      buyerRegistry[cpf].totalPaidAmount += sale.totalAmount;
    }
  });

  const participants = Object.values(buyerRegistry);
  res.json(participants);
});

// ADMIN: GET LIST OF ALL SALES/RESERVATIONS FOR MANUAL MANAGEMENT
app.get('/api/admin/sales', (req, res) => {
  const salesWithRaffle = sales.map(sale => {
    const rf = raffles.find(r => r.id === sale.raffleId);
    return {
      ...sale,
      raffleName: rf ? rf.name : 'Ação Excluída'
    };
  });
  // Sort latest first
  salesWithRaffle.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(salesWithRaffle);
});

// ADMIN: EXPORT / REPORT DOWNLOAD SIMULATION (Outputs a fully structured downloadable object data or CSV mock)
app.get('/api/admin/export', (req, res) => {
  const { type, raffleId } = req.query; // type: csv, pdf, xlsx
  let filteredSales = sales;

  if (raffleId) {
    filteredSales = sales.filter(s => s.raffleId === raffleId);
  }

  // Create a clean readable simulated downloadable rowset
  const rows = filteredSales.map(s => {
    const rf = raffles.find(r => r.id === s.raffleId);
    return {
      DataCompra: new Date(s.createdAt).toLocaleString('pt-BR'),
      Rifa: rf ? rf.name : s.raffleId,
      Cliente: s.buyer?.name || '',
      CPF: s.buyer?.cpf || '',
      Telefone: s.buyer?.phone || '',
      NumerosAdquiridos: s.numbers.join(' | '),
      Quantidade: s.numbers.length,
      ValorTotal: s.totalAmount,
      Gateway: s.gateway,
      StatusPagamento: s.status === 'approved' ? 'PAGO' : s.status === 'pending' ? 'PENDENTE' : 'EXPIRADO'
    };
  });

  res.json({
    filename: `Relatorio_Vendas_${type === 'csv' ? 'CSV' : type === 'pdf' ? 'PDF' : 'PLANILHA'}_${Date.now()}`,
    data: rows
  });
});

// ADMIN: TRANSFER numbers ownership
app.post('/api/admin/transfer', (req, res) => {
  const { raffleId, ticketNumber, newBuyer } = req.body; // newBuyer: BuyerInfo

  if (!raffleId || !ticketNumber || !newBuyer || !newBuyer.cpf || !newBuyer.name) {
    return res.status(400).json({ error: 'Dados insuficientes para transferência.' });
  }

  const currentOccupied = occupiedTickets[raffleId];
  if (!currentOccupied || !currentOccupied[ticketNumber]) {
    return res.status(404).json({ error: 'Número não está reservado ou vendido' });
  }

  const ticketData = currentOccupied[ticketNumber];
  const oldOwnerName = ticketData.buyerName;

  // Find associated sale
  const sale = sales.find(s => s.paymentId === ticketData.paymentId);
  if (sale) {
    // If entire sale matches just this number, convert buyers. Otherwise split numbers
    if (sale.numbers.length === 1) {
      sale.buyer = { ...sale.buyer, ...newBuyer };
    } else {
      // Remove this number from previous sale
      sale.numbers = sale.numbers.filter(n => n !== ticketNumber);
      sale.totalAmount = sale.numbers.length * (sale.totalAmount / (sale.numbers.length + 1));
      
      // Create a specific sale for the new recipient
      const transferPayId = `pay-transfer-${Date.now()}`;
      sales.push({
        raffleId,
        numbers: [ticketNumber],
        buyer: newBuyer,
        paymentId: transferPayId,
        totalAmount: 1 * (sale.totalAmount / sale.numbers.length), // prorated price
        status: ticketData.status === 'paid' ? 'approved' : 'pending',
        qrCode: sale.qrCode,
        qrCodeCopy: sale.qrCodeCopy,
        gateway: sale.gateway,
        createdAt: sale.createdAt,
        expiresAt: sale.expiresAt,
        approvedAt: ticketData.status === 'paid' ? new Date().toISOString() : null
      });
      ticketData.paymentId = transferPayId;
    }
  }

  // Update map state
  ticketData.buyerName = newBuyer.name;
  ticketData.phone = newBuyer.phone;
  ticketData.cpf = newBuyer.cpf;

  saveDatabase();
  writeAuditLog('ADMIN', 'Transferência de titularidade', `Ficha número ${ticketNumber} da Rifa ${raffleId} transferida de ${oldOwnerName} para ${newBuyer.name}.`);

  res.json({ success: true, occupied: currentOccupied });
});

// ADMIN: CANCEL sale (releases numbers)
app.post('/api/admin/cancel-sale', (req, res) => {
  const { paymentId } = req.body;

  if (!paymentId) {
    return res.status(400).json({ error: 'paymentId obrigatório' });
  }

  const saleIdx = sales.findIndex(s => s.paymentId === paymentId);
  if (saleIdx === -1) {
    return res.status(404).json({ error: 'Registro de compra não encontrado.' });
  }

  const sale = sales[saleIdx];
  
  // Wipe from occupied mapping
  const currentOccupied = occupiedTickets[sale.raffleId];
  if (currentOccupied) {
    sale.numbers.forEach(num => {
      if (currentOccupied[num] && currentOccupied[num].paymentId === paymentId) {
        delete currentOccupied[num];
      }
    });
  }

  writeAuditLog('ADMIN', 'Venda Cancelada Manualmente', `Cancelamento da transação ${paymentId} para ${sale.buyer.name}. Números ${sale.numbers.join(', ')} liberados.`);

  // Set sales record to expired/canceled or delete physical
  sales.splice(saleIdx, 1);
  saveDatabase();

  res.json({ success: true });
});

// ADMIN: REVEAL WINNER LOGIC (Federal Lottery numbers calculation)
app.post('/api/admin/draw-winner', (req, res) => {
  const { raffleId, winnerNumber, winnerName, winnerCity, drawConcurso, drawDate } = req.body;

  if (!raffleId || !winnerNumber) {
    return res.status(400).json({ error: 'raffleId e o número sorteado são necessários' });
  }

  const raffle = raffles.find(r => r.id === raffleId);
  if (!raffle) {
    return res.status(404).json({ error: 'Rifa não encontrada' });
  }

  // Check if anyone bought this number
  const formattedWinNumber = String(winnerNumber).padStart(raffle.totalNumbers === 10000 ? 4 : raffle.totalNumbers === 1000 ? 3 : 2, '0');
  
  let detectedWinnerName = winnerName || 'Acumulado (Sem Ganhador)';
  let detectedWinnerCity = winnerCity || '---';

  const currentOccupied = occupiedTickets[raffleId];
  if (currentOccupied && currentOccupied[formattedWinNumber]) {
    const buyerData = currentOccupied[formattedWinNumber];
    if (buyerData.status === 'paid') {
      detectedWinnerName = buyerData.buyerName;
      // search in sales record for buyer city
      const relatedSale = sales.find(s => s.paymentId === buyerData.paymentId);
      detectedWinnerCity = relatedSale?.buyer.city || 'Não informado';
    }
  }

  raffle.status = 'drawn';
  raffle.winnerNumber = formattedWinNumber;
  raffle.winnerName = detectedWinnerName;
  raffle.winnerCity = detectedWinnerCity;
  if (drawConcurso) {
    raffle.drawConcurso = drawConcurso;
  }
  if (drawDate) {
    raffle.drawDate = drawDate;
  }

  saveDatabase();
  writeAuditLog('ADMIN', 'Sorteio realizado', `Rifa: ${raffle.name}. Número Campeão: ${formattedWinNumber}. Ganhador: ${detectedWinnerName}`);

  res.json({ success: true, raffle });
});

// Helper for simulating WhatsApp Notifications
function simulateWhatsAppNotification(sale: TicketSale, triggerType: 'invoice_created' | 'receipt_delivered') {
  const rf = raffles.find(r => r.id === sale.raffleId);
  const raffleTitle = rf ? rf.name : 'Rifa Online';
  
  let textMessage = '';
  if (triggerType === 'invoice_created') {
    textMessage = `Olá, *${sale.buyer.name}*! Recebemos sua reserva de *${sale.numbers.length} números* para o sorteio *${raffleTitle}*.\n\n🎟️ Seus números: ${sale.numbers.join(', ')}\n💰 Valor Total: R$ ${sale.totalAmount.toFixed(2)}\n\n⚠️ Efetue o pagamento PIX em até 15 minutos utilizando o código Copia e Cola fornecido no site para garantir sua reserva.\n\nObrigado!`;
  } else {
    textMessage = `✅ *PAGAMENTO CONFIRMADO!*\n\nOlá, *${sale.buyer.name}*! Seu pagamento PIX de R$ ${sale.totalAmount.toFixed(2)} foi recebido com sucesso!\n\n🍀 Seus números da sorte para *${raffleTitle}* são:\n👉 *${sale.numbers.join(' - ')}*\n\n📅 Sorteio base: ${rf?.drawDate ? new Date(rf.drawDate).toLocaleDateString('pt-BR') : 'A definir'} (${rf?.drawConcurso})\n\nConsulte suas participações no nosso site a qualquer hora com seu CPF/Telefone.\n\nBoa sorte! 🤞`;
  }

  const log: WebhookSimulationLog = {
    id: `wa-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    paymentId: sale.paymentId,
    numbers: sale.numbers,
    raffleName: raffleTitle,
    buyerName: sale.buyer.name,
    buyerPhone: sale.buyer.phone,
    amount: sale.totalAmount,
    status: 'sent',
    message: textMessage
  };

  webhookLogs.unshift(log);
  if (webhookLogs.length > 50) {
    webhookLogs.pop();
  }
}

// VITE MIDDLEWARE SETUP
async function startServer() {
  // Mount Vite middleware in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve client-side compiled files in production
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Raffle Fullstack App running on http://localhost:${PORT}`);
  });
}

startServer();

export default app;
