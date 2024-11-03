import React, { memo } from 'react';
import { Invoice } from '../types/invoice';
import { initiateStripePayment } from '../utils/paymentUtils';

interface InvoicePreviewProps {
  invoice: Invoice;
  showWatermark?: boolean;
  showPayNowButton?: boolean;
}

const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

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
              <td className="py-3 text-right text-gray-600">{formatCurrency(item.price)}</td>
              <td className="py-3 text-right text-gray-900">{formatCurrency(item.quantity * item.price)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="border-t border-gray-100 pt-4">
        <div className="flex justify-between mb-2">
          <span className="text-gray-500">Subtotal:</span>
          <span className="text-gray-900">{formatCurrency(invoice.subtotal)}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-gray-500">Tax ({invoice.taxRate}%):</span>
          <span className="text-gray-900">{formatCurrency(invoice.taxAmount)}</span>
        </div>
        <div className="flex justify-between font-bold text-lg">
          <span>Total:</span>
          <span>{formatCurrency(invoice.total)}</span>
        </div>
      </div>

      {/* Payment Terms Section */}
      <div className="mt-8 space-y-4">
        <h4 className="text-sm font-medium text-gray-500">Payment Terms:</h4>
        
        {/* Bank Transfer Details */}
        {invoice.paymentTerms.bankTransfer && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <h5 className="font-medium text-gray-700 mb-2">Bank Transfer</h5>
            <div className="space-y-1 text-sm text-gray-600">
              <p>Account Name: {invoice.paymentTerms.bankTransfer.accountName}</p>
              <p>Account Number: {invoice.paymentTerms.bankTransfer.accountNumber}</p>
              <p>Bank Name: {invoice.paymentTerms.bankTransfer.bankName}</p>
              <p>Routing Number: {invoice.paymentTerms.bankTransfer.routingNumber}</p>
            </div>
          </div>
        )}

        {/* Credit Card Options */}
        {invoice.paymentTerms.creditCard && invoice.paymentTerms.creditCard.length > 0 && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <h5 className="font-medium text-gray-700 mb-2">Accepted Credit Cards</h5>
            <div className="flex flex-wrap gap-2">
              {invoice.paymentTerms.creditCard.map((card, index) => (
                <span key={index} className="px-3 py-1 bg-white rounded-full text-sm text-gray-600 border border-gray-200">
                  {card}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* PayPal Details */}
        {invoice.paymentTerms.paypal && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <h5 className="font-medium text-gray-700 mb-2">PayPal</h5>
            <p className="text-sm text-gray-600">PayPal Email: {invoice.paymentTerms.paypal.email}</p>
          </div>
        )}

        {/* Late Fee Information */}
        {invoice.paymentTerms.lateFeePercentage && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <h5 className="font-medium text-gray-700 mb-2">Late Payment Fee</h5>
            <p className="text-sm text-gray-600">
              {invoice.paymentTerms.lateFeePercentage}% of total invoice amount
            </p>
          </div>
        )}
      </div>

      {invoice.notes && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-500 mb-2">Notes:</h4>
          <p className="text-gray-600">{invoice.notes}</p>
        </div>
      )}

      {showPayNowButton && (
        <div className="mt-8">
          <button
            onClick={handlePayNow}
            className="w-full py-3 bg-[#273E4E] text-white rounded-xl hover:bg-[#1F3240] transition-colors"
          >
            Pay Now
          </button>
        </div>
      )}

      {showWatermark && (
        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none rotate-[-45deg]">
          <span className="text-6xl font-bold text-gray-400">DRAFT</span>
        </div>
      )}
    </div>
  );
});

export default InvoicePreview;
