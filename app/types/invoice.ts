export interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
}

export interface PaymentTerms {
  bankTransfer: string | null;
  creditCard: string[];
  paypal: string | null;
  lateFeePercentage: number | null;
}

export interface Invoice {
  id?: string;
  userId: string;
  businessName: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  clientName: string;
  clientEmail: string;
  items: InvoiceItem[];
  notes: string;
  taxRate: number;
  subtotal: number;
  taxAmount: number;
  total: number;
  paymentTerms: PaymentTerms;
  showWatermark: boolean;
  paymentProvider: string | null;
  paymentAccountId: string | null;
  paid: boolean;
}