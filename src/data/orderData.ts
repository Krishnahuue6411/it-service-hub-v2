import { ConfirmedOrder } from '../types';

export const FLAGSHIP_CONFIRMED_ORDER: ConfirmedOrder = {
  orderId: 'IT-SH-2026-8894',
  orderDate: 'Today, 31 Aug 2026',
  orderTime: '11:35 PM',
  estimatedDelivery: '⚡ Today within 2 Hours (MIDC Nagapur Express Dispatch)',
  recipientName: 'Rahul Deshmukh (Factory Manager)',
  companyName: 'PAIS Printing & Trading Pvt Ltd',
  addressLine: 'M45 MIDC Nagapur Sector 3, Near Water Tank',
  cityStatePincode: 'Ahilyanagar, Maharashtra - 414111',
  contactPhone: '+91 8787828888',
  gstin: '27AIKPV9768Q1ZP',
  paymentMethodLabel: 'Paid via Instant UPI QR',
  paymentTransactionRef: 'UPI/2026/894102',
  technicianName: 'Vikram K. (Senior Hardware Specialist)',
  technicianPhone: '+91 9876543210',
  items: [
    {
      id: 'ord-item-1',
      name: 'Crucial P3 Plus 1TB PCIe 4.0 3D NAND NVMe M.2 Internal SSD',
      variantLabel: '1TB NVMe Gen 4.0 / 5000 MB/s',
      quantity: 1,
      unitPrice: 5999,
      mrp: 10500,
      imageUrl: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&auto=format&fit=crop&q=80',
      serialNumber: 'SN-CR984210',
      warrantyYears: 3,
      hsnCode: '847170',
      installationIncluded: true,
    },
    {
      id: 'ord-item-2',
      name: 'Hikvision 2MP Full HD IP Outdoor Weatherproof Bullet CCTV Camera',
      variantLabel: '30M Night Vision / POE Metal Body',
      quantity: 2,
      unitPrice: 2499,
      mrp: 4500,
      imageUrl: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=400&auto=format&fit=crop&q=80',
      serialNumber: 'SN-HK551209',
      warrantyYears: 2,
      hsnCode: '852580',
      installationIncluded: true,
    },
  ],
  trackingSteps: [
    {
      id: 1,
      title: 'Order Confirmed & Verified',
      subtitle: 'Packed & Quality Verified at IT Service Hub Warehouse',
      timestamp: '11:35 PM',
      isCompleted: true,
      isActive: false,
    },
    {
      id: 2,
      title: 'Dispatch in Progress',
      subtitle: 'Technician Assigned: Vikram K.',
      timestamp: '11:42 PM',
      isCompleted: true,
      isActive: true,
    },
    {
      id: 3,
      title: 'Out for Delivery',
      subtitle: 'MIDC Phase 2 Route Express Delivery Van',
      timestamp: 'Expected 12:15 AM',
      isCompleted: false,
      isActive: false,
    },
    {
      id: 4,
      title: 'Delivery & On-Site Setup',
      subtitle: 'Hardware Testing & GST Invoice Handover',
      timestamp: 'Expected 01:00 AM',
      isCompleted: false,
      isActive: false,
    },
  ],
  taxSummary: {
    subtotal: 10997,
    cgst: 989.73, // 9% CGST
    sgst: 989.73, // 9% SGST
    igst: 0,
    deliveryFee: 0, // FREE MIDC Express
    discount: 500, // MIDC500 Coupon
    grandTotal: 10497,
  },
};
