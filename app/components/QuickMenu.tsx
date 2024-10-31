'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FaPlus, 
  FaFileInvoice, 
  FaUserPlus, 
  FaLink,
  FaTimes
} from 'react-icons/fa';

export default function QuickMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const menuItems = [
    {
      icon: <FaFileInvoice size={20} />,
      label: 'New Invoice',
      action: () => router.push('/create-invoice'),
    },
    {
      icon: <FaUserPlus size={20} />,
      label: 'Add Client',
      action: () => router.push('/clients/new'),
    },
    {
      icon: <FaLink size={20} />,
      label: 'Payment Link',
      action: () => router.push('/payment-links'),
    },
  ];

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {/* Menu Items */}
      <div className={`absolute bottom-16 right-0 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'} transition-all duration-200`}>
        <div className="flex flex-col-reverse gap-3 items-end mb-4">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                item.action();
                setIsOpen(false);
              }}
              className="flex items-center justify-end bg-white text-gray-700 px-4 py-2 rounded-lg shadow-sm border border-gray-100 hover:border-gray-200 transition-all duration-200 group"
            >
              <span className="text-sm font-medium w-0 overflow-hidden group-hover:w-auto group-hover:mr-3 transition-all duration-200 whitespace-nowrap">
                {item.label}
              </span>
              <span className="text-gray-500 group-hover:text-gray-700 transition-colors">
                {item.icon}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={toggleMenu}
        className={`p-4 rounded-lg shadow-sm border border-gray-100 transition-all duration-200 ${
          isOpen 
            ? 'bg-white text-red-500 hover:border-red-100' 
            : 'bg-white text-blue-500 hover:border-blue-100'
        }`}
      >
        {isOpen ? <FaTimes size={24} /> : <FaPlus size={24} />}
      </button>
    </div>
  );
}