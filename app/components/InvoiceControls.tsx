'use client';

import { useState } from 'react';
import { FaSearch, FaFilter, FaSort } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

interface InvoiceControlsProps {
  onSearch: (query: string) => void;
  onFilterStatus: (status: string) => void;
  onFilterDate: (start: Date | null, end: Date | null) => void;
  onSort: (field: string, direction: 'asc' | 'desc') => void;
}

export default function InvoiceControls({ onSearch, onFilterStatus, onFilterDate, onSort }: InvoiceControlsProps) {
  const [dateRange, setDateRange] = useState<[Date | undefined, Date | undefined]>([undefined, undefined]);
  const [startDate, endDate] = dateRange;

  const handleDateChange = (update: [Date | null, Date | null]) => {
    setDateRange([
      update[0] ?? undefined,
      update[1] ?? undefined
    ]);
    onFilterDate(update[0], update[1]);
  };

  return (
    <div className="mb-6 space-y-4">
      {/* Search and Status Filter Row */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search invoices..."
              onChange={(e) => onSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-300 text-gray-600 text-sm"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>
        <select
          onChange={(e) => onFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-300 text-gray-600 text-sm bg-white"
        >
          <option value="all">All Status</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Date Range and Sort Row */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <DatePicker
            selectsRange={true}
            startDate={startDate}
            endDate={endDate}
            onChange={handleDateChange}
            placeholderText="Filter by date range"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-300 text-gray-600 text-sm"
            isClearable={true}
          />
        </div>
        <select
          onChange={(e) => {
            const [field, direction] = e.target.value.split('-');
            onSort(field, direction as 'asc' | 'desc');
          }}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-300 text-gray-600 text-sm bg-white"
        >
          <option value="date-desc">Latest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="total-desc">Highest Amount</option>
          <option value="total-asc">Lowest Amount</option>
        </select>
      </div>
    </div>
  );
}