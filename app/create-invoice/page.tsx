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
      <div className="flex flex-col min-h-screen bg-gray-50">
        <nav className="border-b border-gray-100 px-8 py-4 bg-white">
          <Link 
            href="/dashboard" 
            className="text-gray-600 hover:text-gray-800 flex items-center"
          >
            <span className="mr-2">←</span>
            Back to Dashboard
          </Link>
        </nav>
        <div className="flex flex-col md:flex-row flex-grow p-8 gap-8 max-w-7xl mx-auto w-full">
          <div className="w-full md:w-1/2">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Invoice</h1>
            <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-6">
              <InvoiceForm 
                invoice={invoice} 
                onInvoiceChange={handleInvoiceChange} 
                onGeneratePDF={handleGeneratePDF}
                onGenerateLink={handleGenerateLink}
                onSaveInvoice={handleSaveInvoice}
              />
            </div>
          </div>
          <div className="w-full md:w-1/2">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Preview</h2>
            <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-6">
              <InvoicePreview invoice={invoice} />
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}