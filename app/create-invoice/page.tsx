'use client';

import { useState, useCallback } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import InvoiceForm from '../components/InvoiceForm';
import InvoicePreview from '../components/InvoicePreview';
import { Invoice } from '../types/invoice';
import { generatePDF } from '../utils/pdfGenerator';
import { saveInvoice } from '../utils/firestore';
import { useAuth } from '../hooks/useAuth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CreateInvoice() {
  const { user } = useAuth();
  const [invoice, setInvoice] = useState<Invoice>({
    userId: user?.uid || '',
    businessName: '',
    invoiceNumber: '',
    date: '',
    dueDate: '',
    clientName: '',
    paymentProvider: '',
    paymentAccountId: '',
    clientEmail: '',
    items: [],
    notes: '',
    taxRate: 0,
    subtotal: 0,
    taxAmount: 0,
    total: 0,
    paymentTerms: {
      bankTransfer: null,
      creditCard: [],
      paypal: null,
      lateFeePercentage: null,
    },
    showWatermark: user?.subscribed !== 'yes',
    paid: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const router = useRouter();

  const handleInvoiceChange = useCallback((updatedInvoice: Invoice) => {
    setInvoice(updatedInvoice);
  }, []);

  const handleGeneratePDF = () => {
    generatePDF(invoice);
  };

  const handleGenerateLink = async () => {
    if (invoice.id) {
      window.open(`/invoice/${invoice.id}`, '_blank');
    } else {
      try {
        setIsSaving(true);
        const invoiceId = await saveInvoice(invoice, user!.uid);
        setInvoice({ ...invoice, id: invoiceId });
        window.open(`/invoice/${invoiceId}`, '_blank');
      } catch (error) {
        console.error('Error generating link:', error);
        setSaveError('Failed to generate link. Please try again.');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleSaveInvoice = async () => {
    if (!user) {
      setSaveError('You must be logged in to save an invoice.');
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      await saveInvoice(invoice, user.uid);
      alert('Invoice saved successfully!');
    } catch (error) {
      console.error('Error saving invoice:', error);
      setSaveError('An error occurred while saving the invoice. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  console.log('CreateInvoice rendered with invoice:', invoice);

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen">
        <nav className="bg-gray-800 text-white p-4">
          <Link href="/dashboard" className="text-white hover:underline">
            ← Back to Dashboard
          </Link>
        </nav>
        <div className="flex flex-col md:flex-row flex-grow">
          <div className="w-full md:w-1/2 p-8">
            <h1 className="text-3xl font-bold mb-6">Create Invoice</h1>
            <InvoiceForm 
              invoice={invoice} 
              onInvoiceChange={handleInvoiceChange} 
              onGeneratePDF={handleGeneratePDF}
              onGenerateLink={handleGenerateLink}
              onSaveInvoice={handleSaveInvoice}
            />
          </div>
          <div className="w-full md:w-1/2 p-8 bg-gray-100">
            <h2 className="text-2xl font-bold mb-4">Preview</h2>
            <InvoicePreview invoice={invoice} />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}