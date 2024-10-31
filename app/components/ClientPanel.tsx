'use client';

import { useEffect, useState } from 'react';
import { Invoice } from '../types/invoice';
import { FaStar, FaHistory, FaUserTag, FaAddressCard, FaCog } from 'react-icons/fa';

interface Client {
  id: string;
  name: string;
  email: string;
  totalSpent: number;
  lastPayment: string;
  paymentRegularity: 'regular' | 'irregular';
  customPaymentTerms?: {
    lateFeePercentage: number | null;
    preferredPaymentMethod: string | null;
  };
}

interface ClientPanelProps {
  invoices: Invoice[];
}

export default function ClientPanel({ invoices }: ClientPanelProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Process invoices to generate client data
    const clientMap = new Map<string, Client>();
    
    invoices.forEach(invoice => {
      if (!invoice.clientEmail) return; // Skip if no email (backwards compatibility)
      
      const existingClient = clientMap.get(invoice.clientEmail);
      const paymentDate = new Date(invoice.paid ? invoice.date : '');
      
      if (existingClient) {
        existingClient.totalSpent += invoice.total;
        if (paymentDate > new Date(existingClient.lastPayment)) {
          existingClient.lastPayment = invoice.date;
        }
        // Update payment regularity based on payment history
        if (invoice.paid) {
          existingClient.paymentRegularity = 'regular';
        } else {
          const dueDate = new Date(invoice.dueDate);
          if (dueDate < new Date()) {
            existingClient.paymentRegularity = 'irregular';
          }
        }
      } else {
        clientMap.set(invoice.clientEmail, {
          id: invoice.clientEmail,
          name: invoice.clientName,
          email: invoice.clientEmail,
          totalSpent: invoice.total,
          lastPayment: invoice.date,
          paymentRegularity: invoice.paid ? 'regular' : 'irregular',
          customPaymentTerms: {
            lateFeePercentage: invoice.paymentTerms?.lateFeePercentage || null,
            preferredPaymentMethod: invoice.paymentTerms?.creditCard?.[0] || 
                                   invoice.paymentTerms?.bankTransfer || 
                                   invoice.paymentTerms?.paypal || 
                                   null
          }
        });
      }
    });

    // Sort clients by total spent and then by name
    setClients(Array.from(clientMap.values()).sort((a, b) => {
      if (b.totalSpent === a.totalSpent) {
        return a.name.localeCompare(b.name);
      }
      return b.totalSpent - a.totalSpent;
    }));
    setLoading(false);
  }, [invoices]);

  return (
    <div className="space-y-6">
      {/* Top Clients Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-shadow">
          <div className="flex items-center mb-4">
            <FaStar className="text-yellow-500 mr-2" />
            <h3 className="font-medium text-gray-600">Most Valuable Client</h3>
          </div>
          {clients.length > 0 && (
            <div>
              <p className="text-lg font-semibold text-gray-900">{clients[0].name}</p>
              <p className="text-sm text-gray-500">${clients[0].totalSpent.toFixed(2)} total spent</p>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-shadow">
          <div className="flex items-center mb-4">
            <FaHistory className="text-blue-500 mr-2" />
            <h3 className="font-medium text-gray-600">Recent Activity</h3>
          </div>
          <p className="text-sm text-gray-500">
            {clients.length} active clients
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-shadow">
          <div className="flex items-center mb-4">
            <FaUserTag className="text-purple-500 mr-2" />
            <h3 className="font-medium text-gray-600">Client Categories</h3>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-500">
              {clients.filter(c => c.paymentRegularity === 'regular').length} regular clients
            </p>
            <p className="text-sm text-gray-500">
              {clients.filter(c => c.paymentRegularity === 'irregular').length} irregular clients
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-shadow">
          <div className="flex items-center mb-4">
            <FaCog className="text-gray-500 mr-2" />
            <h3 className="font-medium text-gray-600">Payment Terms</h3>
          </div>
          <p className="text-sm text-gray-500">
            {clients.filter(c => c.customPaymentTerms).length} clients with custom terms
          </p>
        </div>
      </div>

      {/* Client List */}
      <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Client Directory</h3>
          <div className="space-y-4">
            {clients.map(client => (
              <div 
                key={client.id}
                className="border border-gray-100 rounded-lg p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">{client.name}</h4>
                    <p className="text-sm text-gray-500">{client.email}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    client.paymentRegularity === 'regular'
                      ? 'bg-green-50 text-green-700'
                      : 'bg-yellow-50 text-yellow-700'
                  }`}>
                    {client.paymentRegularity}
                  </span>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  <p>Total Revenue: ${client.totalSpent.toFixed(2)}</p>
                  <p>Last Payment: {new Date(client.lastPayment).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}