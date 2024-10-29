'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '../../components/ProtectedRoute';
import InvoiceForm from '../../components/InvoiceForm';
import InvoicePreview from '../../components/InvoicePreview';
import { Invoice } from '../../types/invoice';
import { generatePDF } from '../../utils/pdfGenerator';
import { getInvoice, updateInvoice } from '../../utils/firestore';
import { useAuth } from '../../hooks/useAuth';
import Link from 'next/link';

export default function EditInvoice({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const fetchedInvoice = await getInvoice(params.id);
        setInvoice({
          ...fetchedInvoice,
          showWatermark: user?.subscribed !== 'yes',
        });
      } catch (error) {
        console.error('Error fetching invoice:', error);
        setSaveError('Failed to load invoice. Please try again.');
      }
    };

    if (params.id) {
      fetchInvoice();
    }
  }, [params.id, user]);

  const handleInvoiceChange = (updatedInvoice: Invoice) => {
    setInvoice(updatedInvoice);
  };

  const handleGeneratePDF = () => {
    if (invoice) {
      generatePDF(invoice);
    }
  };

  const handleSaveInvoice = async () => {
    if (!user || !invoice) {
      setSaveError('You must be logged in to save an invoice.');
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      await updateInvoice(params.id, invoice);
      alert('Invoice updated successfully!');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error updating invoice:', error);
      setSaveError('An error occurred while updating the invoice. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateLink = () => {
    if (invoice && invoice.id) {
      window.open(`/invoice/${invoice.id}`, '_blank');
    }
  };

  if (!invoice) {
    return <div>Loading...</div>;
  }

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
            <h1 className="text-3xl font-bold mb-6">Edit Invoice</h1>
            <InvoiceForm 
              invoice={invoice} 
              onInvoiceChange={handleInvoiceChange}
              onGeneratePDF={handleGeneratePDF}
              onSaveInvoice={handleSaveInvoice}
              onGenerateLink={handleGenerateLink}
            />
            {saveError && <p className="mt-2 text-red-500">{saveError}</p>}
          </div>
          <div className="w-full md:w-1/2 p-8 bg-gray-100">
            <h2 className="text-2xl font-bold mb-6">Preview</h2>
            <InvoicePreview invoice={invoice} />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}