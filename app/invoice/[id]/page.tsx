'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { getInvoice } from '../../utils/firestore';
import { getConnectedPaymentProvider } from '../../utils/paymentProviders';
import { Invoice } from '../../types/invoice';
import InvoicePreview from '../../components/InvoicePreview';
import Link from 'next/link';

export default function InvoiceView() {
  const { id } = useParams() as { id: string };
  const searchParams = useSearchParams();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPayNowButton, setShowPayNowButton] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'canceled' | null>(null);

  useEffect(() => {
    async function fetchInvoice() {
      try {
        const fetchedInvoice = await getInvoice(id);
        setInvoice(fetchedInvoice);
        
        const connectedProvider = await getConnectedPaymentProvider(fetchedInvoice.userId);
        setShowPayNowButton(!!connectedProvider);

        if (connectedProvider) {
          setInvoice(prev => ({ ...prev!, paymentProvider: connectedProvider.provider }));
        }
      } catch (error) {
        console.error('Error fetching invoice:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchInvoice();
  }, [id]);

  useEffect(() => {
    if (searchParams) {
      if (searchParams.get('success') === 'true') {
        setPaymentStatus('success');
      } else if (searchParams.get('canceled') === 'true') {
        setPaymentStatus('canceled');
      }
    }
  }, [searchParams]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!invoice) {
    return <div>Invoice not found</div>;
  }

  return (
    <div className="container mx-auto p-4">
      {paymentStatus === 'success' && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Payment Successful!</strong>
          <span className="block sm:inline"> Thank you for your payment.</span>
        </div>
      )}
      {paymentStatus === 'canceled' && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Payment Canceled.</strong>
          <span className="block sm:inline"> Your payment was not processed.</span>
        </div>
      )}
      {invoice.showWatermark && (
        <div className="bg-gray-100 p-2 text-center mb-4">
          <Link href="/" className="text-blue-500 hover:underline">
            Created with InvoiceGen - Create your own invoices for free!
          </Link>
        </div>
      )}
      <InvoicePreview invoice={invoice} showWatermark={invoice.showWatermark} showPayNowButton={showPayNowButton} />
    </div>
  );
}
