export interface Client {
    id: string;
    company: string;
    name?: string;
    email: string;
    phone?: string;
    totalSpent: number;
    lastPayment: string | null;
    paymentRegularity: 'regular' | 'irregular';
    customPaymentTerms?: {
      lateFeePercentage: number | null;
      preferredPaymentMethod: string | null;
    };
  }