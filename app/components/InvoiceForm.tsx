import { useState, useEffect, useCallback } from 'react';
import { Invoice, InvoiceItem, PaymentTerms } from '../types/invoice';
import { FaUniversity, FaCreditCard, FaPaypal, FaPercent, FaBolt } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import PaymentIntegrationModal from './PaymentIntegrationModal';
import { useRouter } from 'next/navigation';
import { getConnectedPaymentProvider } from '../utils/paymentProviders';

interface InvoiceFormProps {
  invoice: Invoice;
  onInvoiceChange: (invoice: Invoice) => void;
  onGeneratePDF: () => void;
  onSaveInvoice: () => void;
  onGenerateLink: () => void;
}

const creditCardOptions = [
  'Visa',
  'MasterCard',
  'American Express',
  'Discover',
  'JCB',
  'Diners Club',
];

export default function InvoiceForm({ invoice, onInvoiceChange, onGeneratePDF, onSaveInvoice, onGenerateLink }: InvoiceFormProps) {
  const [newItem, setNewItem] = useState<InvoiceItem>({ description: '', quantity: 1, price: 0 });
  const [editingPrices, setEditingPrices] = useState<{ [key: number]: string }>({});
  const [showCreditCardDropdown, setShowCreditCardDropdown] = useState(false);
  const { user } = useAuth();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [connectedProvider, setConnectedProvider] = useState<{ provider: string; accountId: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    calculateTotals();
  }, [invoice.items, invoice.taxRate]);

  useEffect(() => {
    if (invoice.userId) {
      getConnectedPaymentProvider(invoice.userId).then(provider => {
        handlePaymentProviderUpdate(provider);
      });
    }
  }, [invoice.userId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onInvoiceChange({ ...invoice, [name]: value });
  };

  const handleAddItem = () => {
    onInvoiceChange({ ...invoice, items: [...invoice.items, newItem] });
    setNewItem({ description: '', quantity: 1, price: 0 });
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const updatedItems = invoice.items.map((item, i) =>
      i === index ? { ...item, [field]: field === 'price' ? parseFloat(value.toString()) || 0 : value } : item
    );
    onInvoiceChange({ ...invoice, items: updatedItems });
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = invoice.items.filter((_, i) => i !== index);
    onInvoiceChange({ ...invoice, items: updatedItems });
  };

  const formatPrice = (price: number | undefined) => {
    if (price === undefined || isNaN(price)) {
      return '$0.00';
    }
    return `$${price.toFixed(2)}`;
  };

  const handlePriceChange = (index: number, value: string) => {
    setEditingPrices({ ...editingPrices, [index]: value });
    handleItemChange(index, 'price', parseFloat(value) || 0);
  };

  const handlePriceFocus = (index: number) => {
    setEditingPrices({ ...editingPrices, [index]: invoice.items[index].price.toString() });
  };

  const handlePriceBlur = (index: number) => {
    const price = parseFloat(editingPrices[index] || '0') || 0;
    handleItemChange(index, 'price', price);
    delete editingPrices[index];
    setEditingPrices({ ...editingPrices });
  };

  const calculateTotals = () => {
    const subtotal = invoice.items.reduce((total, item) => total + item.quantity * item.price, 0);
    const taxAmount = subtotal * (invoice.taxRate / 100);
    const total = subtotal + taxAmount;

    onInvoiceChange({
      ...invoice,
      subtotal,
      taxAmount,
      total
    });
  };

  const togglePaymentMethod = (method: keyof PaymentTerms) => {
    onInvoiceChange({
      ...invoice,
      paymentTerms: {
        ...invoice.paymentTerms,
        [method]: 
          method === 'creditCard'
            ? (invoice.paymentTerms[method].length > 0 ? [] : [''])
            : method === 'lateFeePercentage'
            ? (invoice.paymentTerms[method] === null ? 0 : null)
            : (invoice.paymentTerms[method] !== null ? null : ''),
      },
    });
  };

  const handlePaymentTermsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onInvoiceChange({
      ...invoice,
      paymentTerms: {
        ...invoice.paymentTerms,
        [name]: name === 'lateFeePercentage' ? (value ? parseFloat(value) : null) : value,
      },
    });
  };

  const handleCreditCardChange = (option: string) => {
    const updatedCreditCards = invoice.paymentTerms.creditCard.includes(option)
      ? invoice.paymentTerms.creditCard.filter(card => card !== option)
      : [...invoice.paymentTerms.creditCard, option];

    onInvoiceChange({
      ...invoice,
      paymentTerms: {
        ...invoice.paymentTerms,
        creditCard: updatedCreditCards,
      },
    });
  };

  const getPaymentTermValue = (key: keyof PaymentTerms) => {
    return invoice.paymentTerms ? invoice.paymentTerms[key] : '';
  };

  const handleGenerateLink = () => {
    if (invoice.id) {
      router.push(`/invoice/${invoice.id}`);
    } else {
      alert('Please save the invoice first to generate a link.');
    }
  };

  const handlePaymentProviderUpdate = useCallback((provider: { provider: string; accountId: string } | null) => {
    setConnectedProvider(provider);
    onInvoiceChange({
      ...invoice,
      paymentProvider: provider?.provider || null,
      paymentAccountId: provider?.accountId || null
    });
  }, [invoice, onInvoiceChange]);

  const handleChangeProvider = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowPaymentModal(true);
  };

  return (
    <form className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Invoice Details</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">Business Name</label>
          <input
            type="text"
            id="businessName"
            name="businessName"
            value={invoice.businessName || ''}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <div>
          <label htmlFor="clientName" className="block text-sm font-medium text-gray-700">Client Name</label>
          <input
            type="text"
            id="clientName"
            name="clientName"
            value={invoice.clientName}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label htmlFor="invoiceNumber" className="block text-sm font-medium text-gray-700">Invoice Number</label>
          <input
            type="text"
            id="invoiceNumber"
            name="invoiceNumber"
            value={invoice.invoiceNumber}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">Invoice Date</label>
          <input
            type="date"
            id="date"
            name="date"
            value={invoice.date}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">Due Date</label>
          <input
            type="date"
            id="dueDate"
            name="dueDate"
            value={invoice.dueDate}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-700 mb-2">Items</h3>
        {invoice.items.map((item, index) => (
          <div key={index} className="flex items-center space-x-2 mb-2">
            <input
              type="text"
              value={item.description}
              onChange={(e) => handleItemChange(index, 'description', e.target.value)}
              placeholder="Description"
              className="flex-grow rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
            <input
              type="number"
              value={item.quantity}
              onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
              placeholder="Quantity"
              className="w-20 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
            <input
              type="text"
              value={index in editingPrices ? editingPrices[index] : formatPrice(item.price)}
              onChange={(e) => handlePriceChange(index, e.target.value)}
              onFocus={() => handlePriceFocus(index)}
              onBlur={() => handlePriceBlur(index)}
              placeholder="Price"
              className="w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
            <button
              type="button"
              onClick={() => handleRemoveItem(index)}
              className="p-2 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
            >
              🗑️
            </button>
          </div>
        ))}
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newItem.description}
            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
            placeholder="Description"
            className="flex-grow rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
          <input
            type="number"
            value={newItem.quantity}
            onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 0 })}
            placeholder="Quantity"
            className="w-20 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
          <input
            type="text"
            value={-1 in editingPrices ? editingPrices[-1] : formatPrice(newItem.price)}
            onChange={(e) => {
              setEditingPrices({ ...editingPrices, [-1]: e.target.value });
              setNewItem({ ...newItem, price: parseFloat(e.target.value) || 0 });
            }}
            onFocus={() => setEditingPrices({ ...editingPrices, [-1]: newItem.price.toString() })}
            onBlur={() => {
              setNewItem({ ...newItem, price: parseFloat(editingPrices[-1] || '0') || 0 });
              delete editingPrices[-1];
              setEditingPrices({ ...editingPrices });
            }}
            placeholder="Price"
            className="w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
          <button
            type="button"
            onClick={handleAddItem}
            className="p-2 bg-[#FFFFFF] text-white rounded-md hover:bg-[#F7F7F7] focus:outline-none"
          >
            ➕
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="subtotal" className="block text-sm font-medium text-gray-700">Subtotal</label>
          <input
            type="text"
            id="subtotal"
            name="subtotal"
            value={formatPrice(invoice.subtotal)}
            readOnly
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 bg-gray-100"
          />
        </div>
        <div>
          <label htmlFor="taxRate" className="block text-sm font-medium text-gray-700">Tax Rate (%)</label>
          <input
            type="number"
            id="taxRate"
            name="taxRate"
            value={invoice.taxRate}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="taxAmount" className="block text-sm font-medium text-gray-700">Tax Amount</label>
          <input
            type="text"
            id="taxAmount"
            name="taxAmount"
            value={formatPrice(invoice.taxAmount)}
            readOnly
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 bg-gray-100"
          />
        </div>
        <div>
          <label htmlFor="total" className="block text-sm font-medium text-gray-700">Total</label>
          <input
            type="text"
            id="total"
            name="total"
            value={formatPrice(invoice.total)}
            readOnly
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 bg-gray-100"
          />
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
        <textarea
          id="notes"
          name="notes"
          value={invoice.notes}
          onChange={handleInputChange}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        ></textarea>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-700 mb-2">Payment Terms</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => togglePaymentMethod('bankTransfer')}
              className={`p-2 rounded-full ${invoice.paymentTerms.bankTransfer !== null ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              <FaUniversity />
            </button>
            {invoice.paymentTerms.bankTransfer !== null && (
              <input
                type="text"
                name="bankTransfer"
                value={invoice.paymentTerms.bankTransfer || ''}
                onChange={handlePaymentTermsChange}
                className="ml-2 p-2 border rounded"
                placeholder="Enter bank transfer details"
              />
            )}
          </div>
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => togglePaymentMethod('creditCard')}
              className={`p-2 rounded-full ${invoice.paymentTerms.creditCard.length > 0 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              <FaCreditCard />
            </button>
            {invoice.paymentTerms.creditCard.length > 0 && (
              <div className="relative ml-2">
                <button
                  type="button"
                  onClick={() => setShowCreditCardDropdown(!showCreditCardDropdown)}
                  className="p-2 border rounded"
                >
                  {invoice.paymentTerms.creditCard.length > 0 && invoice.paymentTerms.creditCard[0] !== ''
                    ? invoice.paymentTerms.creditCard.join(', ')
                    : 'Select credit cards'}
                </button>
                {showCreditCardDropdown && (
                  <div className="absolute z-10 mt-1 w-48 rounded-md bg-white shadow-lg">
                    {creditCardOptions.map((option) => (
                      <label key={option} className="flex items-center px-4 py-2 hover:bg-gray-100">
                        <input
                          type="checkbox"
                          checked={invoice.paymentTerms.creditCard.includes(option)}
                          onChange={() => handleCreditCardChange(option)}
                          className="mr-2"
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => togglePaymentMethod('paypal')}
              className={`p-2 rounded-full ${invoice.paymentTerms.paypal !== null ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              <FaPaypal />
            </button>
            {invoice.paymentTerms.paypal !== null && (
              <input
                type="text"
                name="paypal"
                value={invoice.paymentTerms.paypal || ''}
                onChange={handlePaymentTermsChange}
                className="ml-2 p-2 border rounded"
                placeholder="Enter PayPal email"
              />
            )}
          </div>
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => togglePaymentMethod('lateFeePercentage')}
              className={`p-2 rounded-full ${invoice.paymentTerms.lateFeePercentage !== null ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              <FaPercent />
            </button>
            {invoice.paymentTerms.lateFeePercentage !== null && (
              <input
                type="number"
                name="lateFeePercentage"
                value={invoice.paymentTerms.lateFeePercentage || ''}
                onChange={handlePaymentTermsChange}
                step="0.1"
                className="ml-2 p-2 border rounded w-20"
                placeholder="Late fee %"
              />
            )}
          </div>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Payment Integration</h3>
        {connectedProvider ? (
          <div>
            <p>Connected to {connectedProvider.provider}</p>
            <p className="text-sm text-gray-500">{connectedProvider.accountId}</p>
            <button
              type="button"
              onClick={handleChangeProvider}
              className="mt-2 text-sm text-blue-500 hover:underline"
            >
              Change payment provider
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleChangeProvider}
            className="flex items-center px-4 py-2 bg-[#273E4E] text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            <FaBolt className="mr-2" />
            Connect Stripe/PayPal
          </button>
        )}
      </div>

      {showPaymentModal && (
        <PaymentIntegrationModal 
          onClose={() => setShowPaymentModal(false)}
          onUpdate={handlePaymentProviderUpdate}
        />
      )}

      <div className="flex space-x-4">
        <button
          type="button"
          onClick={onGeneratePDF}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
        >
          Export PDF
        </button>
        <button
          type="button"
          onClick={onGenerateLink}
          className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
        >
          Generate Link
        </button>
        <button
          type="button"
          onClick={onSaveInvoice}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Save Invoice
        </button>
      </div>
    </form>
  );
}