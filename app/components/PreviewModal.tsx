'use client';

import { FaTimes } from 'react-icons/fa';
import { Invoice } from '../types/invoice';
import InvoicePreview from './InvoicePreview';

interface PreviewModalProps {
  invoice: Invoice;
  onClose: () => void;
}

export default function PreviewModal({ invoice, onClose }: PreviewModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-900">Invoice Preview</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FaTimes />
          </button>
        </div>
        <div className="p-6">
          <InvoicePreview invoice={invoice} />
        </div>
      </div>
    </div>
  );
} 