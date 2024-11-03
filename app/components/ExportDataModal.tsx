'use client';

import { useState } from 'react';
import { FaFileCsv, FaFilePdf, FaFileExcel, FaDownload, FaTimes, FaCalendarAlt } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

interface ExportDataModalProps {
  onClose: () => void;
}

export default function ExportDataModal({ onClose }: ExportDataModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'pdf' | 'excel'>('csv');
  const [dateRange, setDateRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({
    start: null,
    end: null,
  });
  const [selectedData, setSelectedData] = useState({
    invoices: true,
    clients: false,
    payments: false,
  });
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Export Data</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Export Format Selection */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Select Format</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: 'csv', icon: FaFileCsv, label: 'CSV File' },
                { id: 'pdf', icon: FaFilePdf, label: 'PDF File' },
                { id: 'excel', icon: FaFileExcel, label: 'Excel File' },
              ].map(format => (
                <button
                  key={format.id}
                  onClick={() => setSelectedFormat(format.id as any)}
                  className={`p-4 border rounded-xl flex flex-col items-center gap-2 transition-all ${
                    selectedFormat === format.id
                      ? 'border-[#273E4E] bg-[#273E4E] bg-opacity-5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <format.icon
                    size={24}
                    className={selectedFormat === format.id ? 'text-[#273E4E]' : 'text-gray-400'}
                  />
                  <span className={selectedFormat === format.id ? 'text-[#273E4E]' : 'text-gray-600'}>
                    {format.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Data Selection */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Select Data</h3>
            <div className="space-y-3">
              {[
                { id: 'invoices', label: 'Invoices' },
                { id: 'clients', label: 'Clients' },
                { id: 'payments', label: 'Payment History' },
              ].map(item => (
                <label key={item.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedData[item.id as keyof typeof selectedData]}
                    onChange={(e) => setSelectedData(prev => ({
                      ...prev,
                      [item.id]: e.target.checked
                    }))}
                    className="rounded text-[#273E4E] focus:ring-[#273E4E]"
                  />
                  <span className="ml-2 text-gray-700">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Date Range Selection */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Date Range</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Start Date</label>
                <div className="relative">
                  <DatePicker
                    selected={dateRange.start}
                    onChange={(date) => setDateRange(prev => ({ ...prev, start: date }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#273E4E]"
                    placeholderText="Select start date"
                  />
                  <FaCalendarAlt className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">End Date</label>
                <div className="relative">
                  <DatePicker
                    selected={dateRange.end}
                    onChange={(date) => setDateRange(prev => ({ ...prev, end: date }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#273E4E]"
                    placeholderText="Select end date"
                  />
                  <FaCalendarAlt className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100">
          <div className="flex justify-end gap-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={loading || !selectedData.invoices && !selectedData.clients && !selectedData.payments}
              className="flex items-center px-6 py-2 bg-[#273E4E] text-white rounded-xl hover:bg-[#1F3240] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="inline-block animate-spin mr-2">⌛</span>
              ) : (
                <FaDownload className="mr-2" />
              )}
              {loading ? 'Exporting...' : 'Export'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 