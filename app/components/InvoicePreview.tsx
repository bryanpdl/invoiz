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
    <div className="bg-white p-6 rounded-xl">
      <div className="border-b border-gray-100 pb-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{invoice.businessName}</h2>
        <p className="text-gray-500">Invoice #{invoice.invoiceNumber}</p>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Bill To:</h3>
          <p className="text-gray-900 font-medium">{invoice.clientName}</p>
          <p className="text-gray-600">{invoice.clientEmail}</p>
        </div>
        <div className="text-right">
          <div className="mb-2">
            <span className="text-sm text-gray-500">Date: </span>
            <span className="text-gray-900">{invoice.date}</span>
          </div>
          <div>
            <span className="text-sm text-gray-500">Due Date: </span>
            <span className="text-gray-900">{invoice.dueDate}</span>
          </div>
        </div>
      </div>

      <table className="w-full mb-8">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left py-3 text-gray-500 font-medium">Description</th>
            <th className="text-right py-3 text-gray-500 font-medium">Qty</th>
            <th className="text-right py-3 text-gray-500 font-medium">Price</th>
            <th className="text-right py-3 text-gray-500 font-medium">Total</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, index) => (
            <tr key={index} className="border-b border-gray-50">
              <td className="py-3 text-gray-900">{item.description}</td>
              <td className="py-3 text-right text-gray-600">{item.quantity}</td>
              <td className="py-3 text-right text-gray-600">${item.price.toFixed(2)}</td>
              <td className="py-3 text-right text-gray-900">${(item.quantity * item.price).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="border-t border-gray-100 pt-4">
        <div className="flex justify-between mb-2">
          <span className="text-gray-500">Subtotal:</span>
          <span className="text-gray-900">${invoice.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-gray-500">Tax ({invoice.taxRate}%):</span>
          <span className="text-gray-900">${invoice.taxAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-lg">
          <span>Total:</span>
          <span>${invoice.total.toFixed(2)}</span>
        </div>
      </div>

      {invoice.notes && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-500 mb-2">Notes:</h4>
          <p className="text-gray-600">{invoice.notes}</p>
        </div>
      )}
    </div>
  );
});

export default InvoicePreview;
