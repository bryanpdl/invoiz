'use client';

import { useState } from 'react';
import { FaTimes, FaUser, FaBuilding, FaEnvelope, FaPhone, FaCreditCard, FaStickyNote, FaFileInvoice, FaHistory, FaMoneyBillWave } from 'react-icons/fa';
import { Client } from '../types/client';
import { formatCurrency } from '../utils/formatters';

interface ViewClientModalProps {
  client: Client;
  onClose: () => void;
}

export default function ViewClientModal({ client, onClose }: ViewClientModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50" style={{ margin: 0 }}>
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl m-4">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xl font-semibold text-gray-900">Client Details</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <FaTimes />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <FaBuilding className="text-gray-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-500">Company</h3>
                  <p className="text-gray-900">{client.company || 'Not specified'}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <FaUser className="text-gray-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-500">Contact Person</h3>
                  <p className="text-gray-900">{client.name || 'Not specified'}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <FaEnvelope className="text-gray-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-500">Email</h3>
                  <p className="text-gray-900">{client.email}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <FaPhone className="text-gray-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                  <p className="text-gray-900">{client.phone || 'Not specified'}</p>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-gray-50 rounded-xl p-6 space-y-4">
              <h3 className="font-medium text-gray-900 mb-4">Payment Information</h3>
              
              <div className="flex items-start space-x-4">
                <div className="bg-white p-3 rounded-lg">
                  <FaCreditCard className="text-gray-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-500">Preferred Payment Method</h3>
                  <p className="text-gray-900">
                    {client.customPaymentTerms?.preferredPaymentMethod || 'Not specified'}
                  </p>
                  
                  {client.customPaymentTerms?.preferredPaymentMethod === 'Bank Transfer' && client.customPaymentTerms.bankDetails && (
                    <div className="mt-2 text-sm text-gray-600">
                      <p>Bank: {client.customPaymentTerms.bankDetails.bankName}</p>
                      <p>Account: {client.customPaymentTerms.bankDetails.accountName}</p>
                      <p>Account #: ****{client.customPaymentTerms.bankDetails.accountNumber.slice(-4)}</p>
                      <p>Routing #: ****{client.customPaymentTerms.bankDetails.routingNumber.slice(-4)}</p>
                    </div>
                  )}
                  
                  {client.customPaymentTerms?.preferredPaymentMethod === 'PayPal' && client.customPaymentTerms.paypalEmail && (
                    <div className="mt-2 text-sm text-gray-600">
                      <p>PayPal Email: {client.customPaymentTerms.paypalEmail}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-white p-3 rounded-lg">
                  <FaMoneyBillWave className="text-gray-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
                  <p className="text-gray-900">{formatCurrency(client.totalSpent)}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-white p-3 rounded-lg">
                  <FaHistory className="text-gray-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-500">Last Payment</h3>
                  <p className="text-gray-900">
                    {client.lastPayment 
                      ? new Date(client.lastPayment).toLocaleDateString() 
                      : 'No payments yet'}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-white p-3 rounded-lg">
                  <FaFileInvoice className="text-gray-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-500">Payment Status</h3>
                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                    client.paymentRegularity === 'regular'
                      ? 'bg-green-50 text-green-700'
                      : 'bg-yellow-50 text-yellow-700'
                  }`}>
                    {client.paymentRegularity}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <div className="bg-white p-3 rounded-lg">
                  <FaStickyNote className="text-gray-500" />
                </div>
                <div className="flex-1 ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Notes</h3>
                  <p className="text-gray-900 whitespace-pre-line">
                    {client.notes || 'No notes added'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 