'use client';

import { useState } from 'react';
import { FaTimes, FaCrown, FaCheck, FaCreditCard, FaHistory } from 'react-icons/fa';
import PaymentMethodsModal from './PaymentMethodsModal';

interface BillingModalProps {
  onClose: () => void;
}

export default function BillingModal({ onClose }: BillingModalProps) {
  const [showPaymentMethodsModal, setShowPaymentMethodsModal] = useState(false);

  // Simulated billing data for prototyping
  const billingInfo = {
    plan: 'Pro',
    amount: 19.99,
    interval: 'month',
    nextBilling: '2024-05-01',
    paymentMethod: {
      brand: 'Visa',
      last4: '4242',
      expiry: '12/25'
    },
    features: [
      'Unlimited invoices',
      'Premium templates',
      'Priority support',
      'Advanced analytics',
      'Custom branding',
      'API access'
    ],
    recentTransactions: [
      {
        date: '2024-04-01',
        amount: 19.99,
        status: 'paid',
        description: 'Pro Plan - Monthly'
      },
      {
        date: '2024-03-01',
        amount: 19.99,
        status: 'paid',
        description: 'Pro Plan - Monthly'
      },
      {
        date: '2024-02-01',
        amount: 19.99,
        status: 'paid',
        description: 'Pro Plan - Monthly'
      }
    ]
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-xl font-semibold text-gray-900">Billing & Plan</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <FaTimes />
            </button>
          </div>
          <p className="text-sm text-gray-500">Manage your subscription and billing information</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Current Plan */}
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <FaCrown className="text-yellow-400 mr-2" />
                <h3 className="font-medium text-gray-900">Current Plan</h3>
              </div>
              <span className="px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-sm font-medium">
                Pro
              </span>
            </div>

            <div className="flex items-baseline mb-4">
              <span className="text-3xl font-bold text-gray-900">${billingInfo.amount}</span>
              <span className="text-gray-500 ml-1">/{billingInfo.interval}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {billingInfo.features.map((feature, index) => (
                <div key={index} className="flex items-center">
                  <FaCheck className="text-green-500 mr-2" />
                  <span className="text-sm text-gray-600">{feature}</span>
                </div>
              ))}
            </div>

            <p className="text-sm text-gray-500">
              Next billing date: {new Date(billingInfo.nextBilling).toLocaleDateString()}
            </p>
          </div>

          {/* Payment Method */}
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <FaCreditCard className="text-gray-400 mr-2" />
                <h3 className="font-medium text-gray-900">Payment Method</h3>
              </div>
              <button
                onClick={() => setShowPaymentMethodsModal(true)}
                className="text-sm text-[#273E4E] hover:text-[#1F3240]"
              >
                Change
              </button>
            </div>

            <div className="flex items-center">
              <div className="p-3 bg-white rounded-lg mr-4">
                <FaCreditCard className="text-gray-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {billingInfo.paymentMethod.brand} ending in {billingInfo.paymentMethod.last4}
                </p>
                <p className="text-sm text-gray-500">
                  Expires {billingInfo.paymentMethod.expiry}
                </p>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <FaHistory className="text-gray-400 mr-2" />
              <h3 className="font-medium text-gray-900">Recent Transactions</h3>
            </div>

            <div className="space-y-3">
              {billingInfo.recentTransactions.map((transaction, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-gray-900">{transaction.description}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">${transaction.amount}</p>
                    <p className="text-sm text-green-600 capitalize">{transaction.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add PaymentMethodsModal */}
      {showPaymentMethodsModal && (
        <PaymentMethodsModal 
          onClose={() => setShowPaymentMethodsModal(false)} 
        />
      )}
    </div>
  );
} 