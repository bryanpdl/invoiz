import { useState, useEffect, useCallback } from 'react';
import { Invoice, InvoiceItem, PaymentTerms } from '../types/invoice';
import { FaUniversity, FaCreditCard, FaPaypal, FaPercent, FaBolt, FaMinus } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import PaymentIntegrationModal from './PaymentIntegrationModal';
import { useRouter } from 'next/navigation';
import { getConnectedPaymentProvider } from '../utils/paymentProviders';
import { db } from '../firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Client } from '../types/client';

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

interface ClientSuggestion {
  company: string;
  email: string;
  name?: string;
}

export default function InvoiceForm({ invoice, onInvoiceChange, onGeneratePDF, onSaveInvoice, onGenerateLink }: InvoiceFormProps) {
  const [newItem, setNewItem] = useState<InvoiceItem>({ description: '', quantity: 1, price: 0 });
  const [editingPrices, setEditingPrices] = useState<{ [key: number]: string }>({});
  const [showCreditCardDropdown, setShowCreditCardDropdown] = useState(false);
  const { user } = useAuth();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [connectedProvider, setConnectedProvider] = useState<{ provider: string; accountId: string } | null>(null);
  const router = useRouter();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [clientSuggestions, setClientSuggestions] = useState<ClientSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

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
    
    // Handle payment terms fields differently
    if (name === 'lateFeePercentage') {
      onInvoiceChange({
        ...invoice,
        paymentTerms: {
          ...invoice.paymentTerms,
          lateFeePercentage: value === '' ? null : parseFloat(value),
        },
      });
      return;
    }

    // Handle other fields
    onInvoiceChange({
      ...invoice,
      [name]: value,
    });
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

  const handleBankTransferChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onInvoiceChange({
      ...invoice,
      paymentTerms: {
        ...invoice.paymentTerms,
        bankTransfer: {
          ...(invoice.paymentTerms.bankTransfer || {
            accountName: '',
            accountNumber: '',
            bankName: '',
            routingNumber: '',
          }),
          [name]: value,
        },
      },
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
            : method === 'bankTransfer'
            ? (invoice.paymentTerms[method] === null ? {
                accountName: '',
                accountNumber: '',
                bankName: '',
                routingNumber: '',
              } : null)
            : method === 'paypal'
            ? (invoice.paymentTerms[method] === null ? { email: '' } : null)
            : null,
      },
    });
  };

  const handlePaypalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onInvoiceChange({
      ...invoice,
      paymentTerms: {
        ...invoice.paymentTerms,
        paypal: {
          email: e.target.value,
        },
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

  const fetchClientSuggestions = async (companyName: string) => {
    if (!user || !companyName.trim()) {
      setClientSuggestions([]);
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      // First get clients from Firestore
      const clientsRef = collection(db, 'clients');
      const q = query(
        clientsRef, 
        where('userId', '==', user.uid)
      );
      const querySnapshot = await getDocs(q);
      const clients = querySnapshot.docs.map(doc => doc.data() as Client);
      
      // Filter clients based on company name (case-insensitive partial match)
      const filteredClients = clients.filter(client => 
        client.company.toLowerCase().includes(companyName.toLowerCase())
      );

      setClientSuggestions(filteredClients.map(client => ({
        company: client.company,
        email: client.email,
        name: client.name
      })));
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error fetching client suggestions:', error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleClientNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    handleInputChange(e);
    fetchClientSuggestions(newValue);
  };

  const handleSuggestionClick = (suggestion: ClientSuggestion) => {
    onInvoiceChange({
      ...invoice,
      clientName: suggestion.company,
      clientEmail: suggestion.email
    });
    setShowSuggestions(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveInvoice();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold mb-6">Invoice Details</h2>
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Business Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="businessName"
            value={invoice.businessName}
            onChange={handleInputChange}
            placeholder="Business Name"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
          />
          <input
            type="text"
            name="invoiceNumber"
            value={invoice.invoiceNumber}
            onChange={handleInputChange}
            placeholder="Invoice Number"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Client Details</h3>
        
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Client Name *
          </label>
          <input
            type="text"
            name="clientName"
            value={invoice.clientName}
            onChange={handleClientNameChange}
            required
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          {/* Suggestions Dropdown */}
          {showSuggestions && clientSuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
              {clientSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex flex-col"
                >
                  <span className="font-medium">{suggestion.company}</span>
                  <span className="text-sm text-gray-500">{suggestion.email}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Client Email *
          </label>
          <input
            type="email"
            name="clientEmail"
            value={invoice.clientEmail}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Dates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="date"
            name="date"
            value={invoice.date}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
          />
          <input
            type="date"
            name="dueDate"
            value={invoice.dueDate}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Items</h3>
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
              className="p-2 text-red-500 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
            >
              <FaMinus size={16} />
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

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Payment Terms</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Bank Transfer */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => togglePaymentMethod('bankTransfer')}
                className={`p-2 rounded-full ${invoice.paymentTerms.bankTransfer !== null ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                <FaUniversity />
              </button>
              <span className="font-medium text-gray-700">Bank Transfer</span>
            </div>
            
            {invoice.paymentTerms.bankTransfer !== null && (
              <div className="mt-4 grid grid-cols-1 gap-3">
                <input
                  type="text"
                  name="accountName"
                  value={invoice.paymentTerms.bankTransfer.accountName}
                  onChange={handleBankTransferChange}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Account Name"
                />
                <input
                  type="text"
                  name="accountNumber"
                  value={invoice.paymentTerms.bankTransfer.accountNumber}
                  onChange={handleBankTransferChange}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Account Number"
                />
                <input
                  type="text"
                  name="bankName"
                  value={invoice.paymentTerms.bankTransfer.bankName}
                  onChange={handleBankTransferChange}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Bank Name"
                />
                <input
                  type="text"
                  name="routingNumber"
                  value={invoice.paymentTerms.bankTransfer.routingNumber}
                  onChange={handleBankTransferChange}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Routing Number"
                />
              </div>
            )}
          </div>

          {/* PayPal */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => togglePaymentMethod('paypal')}
                className={`p-2 rounded-full ${invoice.paymentTerms.paypal !== null ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                <FaPaypal />
              </button>
              <span className="font-medium text-gray-700">PayPal</span>
            </div>
            
            {invoice.paymentTerms.paypal !== null && (
              <div className="mt-4">
                <input
                  type="email"
                  value={invoice.paymentTerms.paypal.email}
                  onChange={handlePaypalChange}
                  className="w-full p-2 border rounded-lg"
                  placeholder="PayPal Email"
                />
              </div>
            )}
          </div>

          {/* Credit Card */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => togglePaymentMethod('creditCard')}
                className={`p-2 rounded-full ${invoice.paymentTerms.creditCard.length > 0 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                <FaCreditCard />
              </button>
              <span className="font-medium text-gray-700">Credit Cards</span>
            </div>
            
            {invoice.paymentTerms.creditCard.length > 0 && (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setShowCreditCardDropdown(!showCreditCardDropdown)}
                  className="w-full p-2 border rounded-lg text-left"
                >
                  {invoice.paymentTerms.creditCard.length > 0 && invoice.paymentTerms.creditCard[0] !== ''
                    ? invoice.paymentTerms.creditCard.join(', ')
                    : 'Select credit cards'}
                </button>
                {showCreditCardDropdown && (
                  <div className="absolute z-10 mt-1 w-full rounded-lg bg-white shadow-lg border border-gray-200">
                    {creditCardOptions.map((option) => (
                      <label key={option} className="flex items-center px-4 py-2 hover:bg-gray-50">
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

          {/* Late Fee */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => togglePaymentMethod('lateFeePercentage')}
                className={`p-2 rounded-full ${invoice.paymentTerms.lateFeePercentage !== null ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                <FaPercent />
              </button>
              <span className="font-medium text-gray-700">Late Fee</span>
            </div>
            
            {invoice.paymentTerms.lateFeePercentage !== null && (
              <div className="mt-4">
                <input
                  type="number"
                  name="lateFeePercentage"
                  value={invoice.paymentTerms.lateFeePercentage || ''}
                  onChange={handleInputChange}
                  step="0.1"
                  className="w-full p-2 border rounded-lg"
                  placeholder="Late fee percentage"
                />
              </div>
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

      <div className="flex flex-wrap gap-4">
        <button
          type="button"
          onClick={onGeneratePDF}
          className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors duration-200"
        >
          Export PDF
        </button>
        <button
          type="button"
          onClick={onGenerateLink}
          className="px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors duration-200"
        >
          Generate Link
        </button>
        <button
          type="button"
          onClick={onSaveInvoice}
          className="px-4 py-2 bg-[#273E4E] text-white rounded-xl hover:bg-[#1F3240] transition-colors duration-200"
        >
          Save Invoice
        </button>
      </div>
    </form>
  );
}