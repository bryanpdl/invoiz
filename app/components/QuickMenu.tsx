'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FaPlus, FaFileInvoice, FaUserPlus, FaChartLine, FaFileExport } from 'react-icons/fa';
import AddClientModal from './AddClientModal';
import ExportDataModal from './ExportDataModal';
import AnalyticsModal from './AnalyticsModal';

export default function QuickMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);

  return (
    <>
      <div className="fixed bottom-8 right-8" data-testid="quick-menu">
        <div className="relative">
          {isOpen && (
            <div className="absolute bottom-16 right-0 mb-2 flex flex-col gap-2">
              <Link
                href="/create-invoice"
                className="flex items-center bg-white text-gray-700 px-4 py-2 rounded-xl shadow-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
              >
                <FaFileInvoice className="mr-2" />
                New Invoice
              </Link>
              <button
                onClick={() => setShowAddClientModal(true)}
                data-testid="add-client-button"
                className="flex items-center bg-white text-gray-700 px-4 py-2 rounded-xl shadow-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
              >
                <FaUserPlus className="mr-2" />
                Add Client
              </button>
              <button
                onClick={() => {
                  setShowExportModal(true);
                  setIsOpen(false);
                }}
                className="flex items-center bg-white text-gray-700 px-4 py-2 rounded-xl shadow-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
              >
                <FaFileExport className="mr-2" />
                Export Data
              </button>
              <button
                onClick={() => {
                  setShowAnalyticsModal(true);
                  setIsOpen(false);
                }}
                className="flex items-center bg-white text-gray-700 px-4 py-2 rounded-xl shadow-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
              >
                <FaChartLine className="mr-2" />
                Analytics
              </button>
            </div>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`bg-[#273E4E] text-white p-4 rounded-full shadow-lg hover:bg-[#1F3240] transition-colors ${
              isOpen ? 'rotate-45' : ''
            } transform transition-transform duration-200`}
          >
            <FaPlus className="text-xl" />
          </button>
        </div>
      </div>

      {showAddClientModal && (
        <AddClientModal
          onClose={() => setShowAddClientModal(false)}
          onClientAdded={() => {
            setShowAddClientModal(false);
            setIsOpen(false);
          }}
        />
      )}

      {showExportModal && (
        <ExportDataModal onClose={() => setShowExportModal(false)} />
      )}

      {showAnalyticsModal && (
        <AnalyticsModal onClose={() => setShowAnalyticsModal(false)} />
      )}
    </>
  );
}