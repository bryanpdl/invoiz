import React, { memo } from 'react';
import { Invoice } from '../types/invoice';
import { initiateStripePayment } from '../utils/paymentUtils';

interface InvoicePreviewProps {
  invoice: Invoice;
  showWatermark?: boolean;
  showPayNowButton?: boolean;
}

const InvoicePreview = memo(function InvoicePreview({ invoice, showWatermark = false, showPayNowButton = false }: InvoicePreviewProps) {
  console.log('InvoicePreview rendered with:', { invoice, showWatermark, showPayNowButton });

  const handlePayNow = async () => {
    try {
      // Verify invoice data
      if (!invoice.items || invoice.items.length === 0) {
        throw new Error('Invoice has no items');
      }
      for (const item of invoice.items) {
        if (!item.description || typeof item.quantity !== 'number' || typeof item.price !== 'number') {
          throw new Error(`Invalid item: ${JSON.stringify(item)}`);
        }
      }
      if (!invoice.id) {
        throw new Error('Invoice has no ID');
      }

      console.log('Initiating payment for invoice:', JSON.stringify(invoice, null, 2));
      await initiateStripePayment(invoice);
    } catch (error) {
      console.error('Payment failed:', error);
      alert(`Payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md relative">
      {showPayNowButton && (
        <button
          onClick={handlePayNow}
          className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
        >
          Pay Now
        </button>
      )}
      <div className="mb-6">
        <h2 className="text-2xl font-bold">{invoice.businessName}</h2>
        <p>Invoice Number: {invoice.invoiceNumber}</p>
        <p>Date: {invoice.date}</p>
        <p>Due Date: {invoice.dueDate}</p>
      </div>
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Bill To:</h3>
        <p>{invoice.clientName}</p>
        <p>{invoice.clientEmail}</p>
      </div>
      <table className="w-full mb-6">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2">Description</th>
            <th className="text-right py-2">Quantity</th>
            <th className="text-right py-2">Price</th>
            <th className="text-right py-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, index) => (
            <tr key={index} className="border-b">
              <td className="py-2">{item.description}</td>
              <td className="text-right py-2">{item.quantity}</td>
              <td className="text-right py-2">${item.price.toFixed(2)}</td>
              <td className="text-right py-2">${(item.quantity * item.price).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-end">
        <div className="w-1/2">
          <div className="flex justify-between mb-2">
            <span>Subtotal:</span>
            <span>${invoice.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Tax ({invoice.taxRate}%):</span>
            <span>${invoice.taxAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>Total:</span>
            <span>${invoice.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
      {invoice.notes && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2">Notes:</h3>
          <p>{invoice.notes}</p>
        </div>
      )}
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-2">Payment Terms:</h3>
        {invoice.paymentTerms.bankTransfer && (
          <p>Bank Transfer: {invoice.paymentTerms.bankTransfer}</p>
        )}
        {invoice.paymentTerms.creditCard.length > 0 && (
          <p>Credit Cards Accepted: {invoice.paymentTerms.creditCard.join(', ')}</p>
        )}
        {invoice.paymentTerms.paypal && (
          <p>PayPal: {invoice.paymentTerms.paypal}</p>
        )}
        {invoice.paymentTerms.lateFeePercentage !== null && (
          <p>Late Fee: {invoice.paymentTerms.lateFeePercentage}%</p>
        )}
      </div>
      {showWatermark && (
        <div className="absolute bottom-4 right-4 text-gray-400 text-sm">
          Created with InvoiceGen
        </div>
      )}
    </div>
  );
});

export default InvoicePreview;
