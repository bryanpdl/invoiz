'use client';

import { useState } from 'react';
import { FaTimes, FaCreditCard, FaPlus, FaPaypal, FaUniversity, FaTrash, FaCheck } from 'react-icons/fa';

interface PaymentMethodsModalProps {
  onClose: () => void;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'bank';
  details: {
    last4?: string;
    brand?: string;
    expiry?: string;
    email?: string;
    bankName?: string;
    accountLast4?: string;
  };
  isDefault: boolean;
}

export default function PaymentMethodsModal({ onClose }: PaymentMethodsModalProps) {
  const [showAddNew, setShowAddNew] = useState(false);
  const [newMethodType, setNewMethodType] = useState<'card' | 'paypal' | 'bank' | null>(null);
  const [loading, setLoading] = useState(false);

  // Simulated payment methods for prototyping
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'card',
      details: {
        last4: '4242',
        brand: 'Visa',
        expiry: '12/25'
      },
      isDefault: true
    },
    {
      id: '2',
      type: 'paypal',
      details: {
        email: 'user@example.com'
      },
      isDefault: false
    },
    {
      id: '3',
      type: 'bank',
      details: {
        bankName: 'Chase Bank',
        accountLast4: '9876'
      },
      isDefault: false
    }
  ]);

  const handleSetDefault = (methodId: string) => {
    setPaymentMethods(methods =>
      methods.map(method => ({
        ...method,
        isDefault: method.id === methodId
      }))
    );
  };

  const handleDelete = (methodId: string) => {
    setPaymentMethods(methods =>
      methods.filter(method => method.id !== methodId)
    );
  };

  const handleAddNew = async () => {
    setLoading(true);
    // Simulate adding new payment method
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoading(false);
    setShowAddNew(false);
    setNewMethodType(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-xl font-semibold text-gray-900">Payment Methods</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <FaTimes />
            </button>
          </div>
          <p className="text-sm text-gray-500">Manage your payment methods</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Existing Payment Methods */}
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-white rounded-lg">
                    {method.type === 'card' && <FaCreditCard className="text-gray-400" />}
                    {method.type === 'paypal' && <FaPaypal className="text-gray-400" />}
                    {method.type === 'bank' && <FaUniversity className="text-gray-400" />}
                  </div>
                  <div>
                    {method.type === 'card' && (
                      <>
                        <p className="font-medium text-gray-900">
                          {method.details.brand} ending in {method.details.last4}
                        </p>
                        <p className="text-sm text-gray-500">
                          Expires {method.details.expiry}
                        </p>
                      </>
                    )}
                    {method.type === 'paypal' && (
                      <p className="font-medium text-gray-900">
                        PayPal - {method.details.email}
                      </p>
                    )}
                    {method.type === 'bank' && (
                      <>
                        <p className="font-medium text-gray-900">
                          {method.details.bankName}
                        </p>
                        <p className="text-sm text-gray-500">
                          Account ending in {method.details.accountLast4}
                        </p>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {method.isDefault ? (
                    <span className="text-sm text-green-600 flex items-center">
                      <FaCheck className="mr-1" /> Default
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSetDefault(method.id)}
                      className="text-sm text-[#273E4E] hover:text-[#1F3240]"
                    >
                      Set as default
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(method.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add New Payment Method */}
          {!showAddNew ? (
            <button
              onClick={() => setShowAddNew(true)}
              className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors"
            >
              <FaPlus className="mr-2" />
              Add New Payment Method
            </button>
          ) : (
            <div className="p-4 border border-gray-200 rounded-xl">
              <h3 className="font-medium text-gray-900 mb-4">Select payment method type</h3>
              <div className="grid grid-cols-3 gap-4">
                {(['card', 'paypal', 'bank'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setNewMethodType(type)}
                    className={`p-4 rounded-lg border ${
                      newMethodType === type
                        ? 'border-[#273E4E] bg-[#273E4E]/5'
                        : 'border-gray-200 hover:border-gray-300'
                    } transition-colors`}
                  >
                    <div className="flex flex-col items-center">
                      {type === 'card' && <FaCreditCard className="text-xl mb-2" />}
                      {type === 'paypal' && <FaPaypal className="text-xl mb-2" />}
                      {type === 'bank' && <FaUniversity className="text-xl mb-2" />}
                      <span className="text-sm capitalize">{type}</span>
                    </div>
                  </button>
                ))}
              </div>
              
              {newMethodType && (
                <div className="mt-4">
                  {/* Form fields would go here based on newMethodType */}
                  <div className="flex justify-end mt-4 space-x-4">
                    <button
                      onClick={() => {
                        setShowAddNew(false);
                        setNewMethodType(null);
                      }}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddNew}
                      disabled={loading}
                      className="px-4 py-2 bg-[#273E4E] text-white rounded-lg hover:bg-[#1F3240] disabled:opacity-50"
                    >
                      {loading ? 'Adding...' : 'Add Payment Method'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 