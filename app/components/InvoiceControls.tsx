 'use client';

import { useState } from 'react';
import { FaSearch, FaFilter, FaSort } from 'react-icons/fa';

interface InvoiceControlsProps {
  onSearch: (query: string) => void;
  onFilterStatus: (status: 'all' | 'paid' | 'pending') => void;
  onFilterDate: (startDate: string, endDate: string) => void;
  onSort: (field: string, direction: 'asc' | 'desc') => void;
}

export default function InvoiceControls({ 
  onSearch, 
  onFilterStatus, 
  onFilterDate, 
  onSort 
}: InvoiceControlsProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  return (
    <div className="mb-6 space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex flex-wrap gap-4">
        {/* Search */}
        <div className="flex-grow max-w-md">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by client or invoice number..."
              onChange={(e) => onSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          <FaFilter className="mr-2" />
          Filters
        </button>

        {/* Sort Dropdown */}
        <select
          onChange={(e) => {
            const [field, direction] = e.target.value.split('-');
            onSort(field, direction as 'asc' | 'desc');
          }}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="date-desc">Date (Newest)</option>
          <option value="date-asc">Date (Oldest)</option>
          <option value="total-desc">Amount (Highest)</option>
          <option value="total-asc">Amount (Lowest)</option>
          <option value="clientName-asc">Client Name (A-Z)</option>
          <option value="clientName-desc">Client Name (Z-A)</option>
        </select>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="p-4 bg-gray-50 rounded-lg space-y-4">
          <div className="flex flex-wrap gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                onChange={(e) => onFilterStatus(e.target.value as 'all' | 'paid' | 'pending')}
                className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Range
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => {
                    setDateRange({ ...dateRange, start: e.target.value });
                    onFilterDate(e.target.value, dateRange.end);
                  }}
                  className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => {
                    setDateRange({ ...dateRange, end: e.target.value });
                    onFilterDate(dateRange.start, e.target.value);
                  }}
                  className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}