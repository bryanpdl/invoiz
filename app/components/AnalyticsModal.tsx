'use client';

import { useState, useEffect } from 'react';
import { FaTimes, FaChartLine, FaUsers, FaMoneyBillWave, FaClock, FaCalendarAlt } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { getInvoices } from '../utils/firestore';
import { Invoice } from '../types/invoice';

interface AnalyticsModalProps {
  onClose: () => void;
}

interface MonthlyRevenue {
  month: string;
  revenue: number;
  invoiceCount: number;
}

interface ClientMetrics {
  totalClients: number;
  activeClients: number;
  averageInvoiceValue: number;
  repeatClientRate: number;
}

export default function AnalyticsModal({ onClose }: AnalyticsModalProps) {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([]);
  const [clientMetrics, setClientMetrics] = useState<ClientMetrics>({
    totalClients: 0,
    activeClients: 0,
    averageInvoiceValue: 0,
    repeatClientRate: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          const fetchedInvoices = await getInvoices(user.uid);
          setInvoices(fetchedInvoices);
          calculateMetrics(fetchedInvoices);
        } catch (error) {
          console.error('Error fetching analytics data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [user]);

  const calculateMetrics = (invoices: Invoice[]) => {
    // Calculate monthly revenue
    const monthlyData = invoices.reduce((acc: { [key: string]: MonthlyRevenue }, invoice) => {
      const month = new Date(invoice.date).toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!acc[month]) {
        acc[month] = { month, revenue: 0, invoiceCount: 0 };
      }
      acc[month].revenue += invoice.total;
      acc[month].invoiceCount += 1;
      return acc;
    }, {});

    setMonthlyRevenue(Object.values(monthlyData));

    // Calculate client metrics
    const uniqueClients = new Set(invoices.map(inv => inv.clientEmail));
    const activeClients = new Set(
      invoices
        .filter(inv => {
          const invoiceDate = new Date(inv.date);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return invoiceDate >= thirtyDaysAgo;
        })
        .map(inv => inv.clientEmail)
    );

    const clientInvoiceCounts = invoices.reduce((acc: { [key: string]: number }, invoice) => {
      acc[invoice.clientEmail] = (acc[invoice.clientEmail] || 0) + 1;
      return acc;
    }, {});

    const repeatClients = Object.values(clientInvoiceCounts).filter(count => count > 1).length;

    setClientMetrics({
      totalClients: uniqueClients.size,
      activeClients: activeClients.size,
      averageInvoiceValue: invoices.reduce((sum, inv) => sum + inv.total, 0) / invoices.length,
      repeatClientRate: (repeatClients / uniqueClients.size) * 100,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Time Range Selector */}
          <div className="flex gap-2">
            {[
              { value: '7d', label: '7 Days' },
              { value: '30d', label: '30 Days' },
              { value: '90d', label: '90 Days' },
              { value: '1y', label: '1 Year' },
            ].map(option => (
              <button
                key={option.value}
                onClick={() => setTimeframe(option.value as any)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  timeframe === option.value
                    ? 'bg-[#273E4E] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <FaMoneyBillWave className="text-green-500" />
                <h3 className="font-medium text-gray-600">Total Revenue</h3>
              </div>
              <p className="text-2xl font-semibold text-gray-900">
                ${invoices.reduce((sum, inv) => sum + inv.total, 0).toFixed(2)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Avg. ${clientMetrics.averageInvoiceValue.toFixed(2)} per invoice
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <FaUsers className="text-blue-500" />
                <h3 className="font-medium text-gray-600">Client Base</h3>
              </div>
              <p className="text-2xl font-semibold text-gray-900">
                {clientMetrics.totalClients}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {clientMetrics.activeClients} active in last 30 days
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <FaChartLine className="text-purple-500" />
                <h3 className="font-medium text-gray-600">Repeat Client Rate</h3>
              </div>
              <p className="text-2xl font-semibold text-gray-900">
                {clientMetrics.repeatClientRate.toFixed(1)}%
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Of total client base
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <FaClock className="text-orange-500" />
                <h3 className="font-medium text-gray-600">Payment Time</h3>
              </div>
              <p className="text-2xl font-semibold text-gray-900">
                {calculateAveragePaymentTime(invoices)} days
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Average time to payment
              </p>
            </div>
          </div>

          {/* Monthly Revenue Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Over Time</h3>
            <div className="h-64">
              {/* Revenue chart visualization would go here */}
              <div className="space-y-4">
                {monthlyRevenue.map((month, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-32 text-sm text-gray-600">{month.month}</div>
                    <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#273E4E] rounded-full"
                        style={{
                          width: `${(month.revenue / Math.max(...monthlyRevenue.map(m => m.revenue))) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="w-32 text-right text-sm font-medium text-gray-900">
                      ${month.revenue.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function calculateAveragePaymentTime(invoices: Invoice[]): number {
  const paidInvoices = invoices.filter(inv => inv.paid);
  if (paidInvoices.length === 0) return 0;

  const totalDays = paidInvoices.reduce((sum, inv) => {
    const dueDate = new Date(inv.dueDate);
    const paymentDate = new Date(inv.date);
    const diffTime = Math.abs(paymentDate.getTime() - dueDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return sum + diffDays;
  }, 0);

  return Math.round(totalDays / paidInvoices.length);
} 