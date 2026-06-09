/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Raffle {
  id: string;
  name: string;
  description: string;
  rules: string;
  totalNumbers: number; // e.g. 100, 1000, 10000
  numberPrice: number;
  drawDate: string;
  drawConcurso: string; // e.g. Concurso 5982 da Loteria Federal
  imageUrl: string;
  status: 'active' | 'drawn' | 'archived';
  winnerNumber: string | null;
  winnerName: string | null;
  winnerCity: string | null;
  createdAt: string;
  prize1?: string;
  prize2?: string;
  prize3?: string;
}

export type TicketStatus = 'available' | 'reserved' | 'paid' | 'blocked';

export interface TicketReserved {
  number: string;
  status: TicketStatus;
  reservedAt: string; // ISO String
}

export interface BuyerInfo {
  name: string;
  cpf: string;
  phone: string;
  email: string;
  city?: string;
}

export interface TicketSale {
  raffleId: string;
  numbers: string[];
  buyer: BuyerInfo;
  paymentId: string;
  totalAmount: number;
  status: 'pending' | 'approved' | 'expired';
  qrCode: string;
  qrCodeCopy: string;
  gateway: 'mercadopago' | 'efi' | 'asaas' | 'manual';
  createdAt: string;
  expiresAt: string;
  approvedAt: string | null;
  manualPixKey?: string;
  manualPixName?: string;
  manualPixBank?: string;
  manualPixInstructions?: string;
  whatsappPhone?: string;
}

export interface GatewayConfig {
  activeGateway: 'mercadopago' | 'efi' | 'asaas' | 'manual';
  mercadopagoToken: string;
  efiToken: string;
  asaasToken: string;
  whatsappToken: string;
  whatsappPhone: string;
  autoApproveSimulation: boolean;
  manualPixKey?: string;
  manualPixName?: string;
  manualPixBank?: string;
  manualPixInstructions?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  ip: string;
}

export interface DashboardStats {
  totalArrecadado: number;
  totalVendido: number;
  totalParticipantes: number;
  rifasAtivas: number;
  rifasEncerradas: number;
  pagamentosPendentes: number;
  pagamentosAprovados: number;
  vendasPorDia: { data: string; total: number; qtd: number }[];
}

export interface WebhookSimulationLog {
  id: string;
  timestamp: string;
  paymentId: string;
  numbers: string[];
  raffleName: string;
  buyerName: string;
  buyerPhone: string;
  amount: number;
  status: 'sent' | 'failed';
  message: string;
}
