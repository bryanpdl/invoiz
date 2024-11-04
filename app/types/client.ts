export interface Client {
  id: string;
  userId: string;
  name: string;
  company: string;
  email: string;
  phone?: string;
  notes?: string;
  totalSpent: number;
  lastPayment?: string;
  paymentRegularity: 'regular' | 'irregular';
  customPaymentTerms?: {
    preferredPaymentMethod?: string;
    bankDetails?: {
      accountName: string;
      accountNumber: string;
      bankName: string;
      routingNumber: string;
    };
    paypalEmail?: string;
  };
}