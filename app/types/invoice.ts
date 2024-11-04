export interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
}

interface BankTransferDetails {
  accountName: string;
  accountNumber: string;
  bankName: string;
  routingNumber: string;
}

interface PayPalDetails {
  email: string;
}

export interface PaymentTerms {
  bankTransfer: BankTransferDetails | null;
  creditCard: string[];
  paypal: PayPalDetails | null;
  lateFeePercentage: number | null;
}

export interface Invoice {
  id?: string;
  userId: string;
  businessName: string;
  businessAddress: string;
  businessPhone: string;
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