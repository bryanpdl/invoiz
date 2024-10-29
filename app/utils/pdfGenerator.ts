import jsPDF from 'jspdf';
import { Invoice } from '../types/invoice';

export function generatePDF(invoice: Invoice) {
  const doc = new jsPDF();
  
  // Set font
  doc.setFont('helvetica', 'normal');
  
  // Add title
  doc.setFontSize(20);
  doc.text('Invoice', 105, 20, { align: 'center' });
  
  // Add business name
  doc.setFontSize(16);
  doc.text(invoice.businessName, 20, 40);

  // Add invoice details
  doc.setFontSize(12);
  doc.text(`Invoice Number: ${invoice.invoiceNumber}`, 20, 50);
  doc.text(`Date: ${invoice.date}`, 20, 60);
  doc.text(`Due Date: ${invoice.dueDate}`, 20, 70);
  
  // Add client information
  doc.text('Bill To:', 20, 90);
  doc.text(invoice.clientName, 20, 100);
  doc.text(invoice.clientEmail, 20, 110);
  
  // Add table header
  let yPos = 130;
  doc.setFontSize(12);
  doc.text('Description', 20, yPos);
  doc.text('Quantity', 100, yPos);
  doc.text('Price', 140, yPos);
  doc.text('Total', 180, yPos);
  
  // Add horizontal line
  yPos += 5;
  doc.line(20, yPos, 190, yPos);
  
  // Add items
  yPos += 10;
  let total = 0;
  invoice.items.forEach((item) => {
    doc.text(item.description, 20, yPos);
    doc.text(item.quantity.toString(), 110, yPos);
    doc.text(`$${item.price.toFixed(2)}`, 140, yPos);
    const itemTotal = item.quantity * item.price;
    doc.text(`$${itemTotal.toFixed(2)}`, 180, yPos);
    total += itemTotal;
    yPos += 10;
  });
  
  // Add total
  yPos += 10;
  doc.line(20, yPos, 190, yPos);
  yPos += 10;
  doc.setFont('helvetica', 'bold');
  doc.text('Total:', 140, yPos);
  doc.text(`$${total.toFixed(2)}`, 180, yPos);
  
  // Add notes
  if (invoice.notes) {
    yPos += 30;
    doc.setFont('helvetica', 'normal');
    doc.text('Notes:', 20, yPos);
    doc.setFontSize(10);
    doc.text(invoice.notes, 20, yPos + 10, { maxWidth: 170 });
  }
  
  // Add watermark for free users
  if (invoice.showWatermark) {
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150); // Light gray color
    doc.text('Created with InvoiceGen - Create your own invoices for free!', 10, 10);
  }
  
  // Save the PDF
  doc.save(`invoice_${invoice.invoiceNumber}.pdf`);
}