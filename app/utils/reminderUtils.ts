export function getNextReminderDate() {
    // Implementation to calculate the next reminder date based on settings and unpaid invoices
    return "Tomorrow at 9:00 AM"; // Placeholder
  }
  
  export function getUpcomingReminders() {
    // Implementation to get list of upcoming reminders
    return [
      {
        type: 'upcoming',
        clientName: 'John Doe',
        invoiceNumber: 'INV-001',
        amount: '1,500.00',
        date: 'Tomorrow',
      },
      // ... more reminders
    ];
  }
  
  export function getReminderStatusColor(type: string) {
    switch (type) {
      case 'overdue':
        return 'bg-red-500';
      case 'upcoming':
        return 'bg-orange-500';
      case 'sent':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  }