import { 
  UserProfile, 
  OrderHistoryItem, 
  RepairJobCard, 
  AMCContract, 
  TaxInvoice 
} from '../types';

export const MOCK_USER_PROFILE: UserProfile = {
  clientId: 'IT-CL-8842',
  fullName: 'Sunil Vahurwagh',
  companyName: 'PAIS Printing & Trading Pvt Ltd',
  email: 'sunil.vahurwagh@gmail.com',
  phone: '9850817291',
  gstin: '27AIKPV9768Q1ZP',
  accountTier: 'B2B Verified Client',
  b2bCreditPoints: 2400,
  activeOrdersCount: 2,
  openRepairTicketsCount: 1,
  activeAmcContractsCount: 1,
};

export const MOCK_ORDER_HISTORY: OrderHistoryItem[] = [
  {
    orderId: 'IT-SH-2026-8894',
    orderDate: '31 Aug 2026',
    totalAmount: 10497,
    shipToName: 'Rahul Deshmukh (Factory Manager)',
    shipToAddress: 'M45 MIDC Nagapur, Ahilyanagar - 414111',
    statusBadge: 'Out for Delivery 🚚',
    statusColor: 'emerald',
    items: [
      {
        id: '1',
        name: 'Crucial P3 Plus 1TB PCIe 4.0 NVMe M.2 SSD',
        imageUrl: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=300&auto=format&fit=crop&q=80',
        variant: '1TB NVMe / 5000 MB/s',
        warranty: '3 Years Warranty (SN-CR984210)',
        price: 5999,
      },
      {
        id: '2',
        name: 'Hikvision 2MP Full HD IP Outdoor Bullet CCTV Camera',
        imageUrl: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=300&auto=format&fit=crop&q=80',
        variant: 'Full HD POE Metal',
        warranty: '2 Years Warranty (SN-HK551209)',
        price: 4998,
      },
    ],
  },
  {
    orderId: 'IT-SH-2026-7210',
    orderDate: '14 Jun 2026',
    totalAmount: 18450,
    shipToName: 'PAIS Trading Office',
    shipToAddress: 'Office 204, Savedi Road, Ahilyanagar - 414003',
    statusBadge: 'Delivered ✅',
    statusColor: 'blue',
    items: [
      {
        id: '3',
        name: 'CP PLUS 8-Channel H.265+ HD DVR Kit with 1TB HDD',
        imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300&auto=format&fit=crop&q=80',
        variant: '8 Ch DVR + Surveillance HDD',
        warranty: '2 Years Brand Warranty',
        price: 18450,
      },
    ],
  },
];

export const MOCK_REPAIR_JOBS: RepairJobCard[] = [
  {
    ticketId: 'TICK-2026-902',
    deviceName: 'Dell Latitude 3420 - Motherboard IC & Screen Repair',
    problemDescription: 'Power IC replacement & 14-inch Full HD display panel fitting',
    receivedDate: '28 Aug 2026',
    statusStep: 2, // 1: Received, 2: Diagnosis, 3: Repairing, 4: Ready
    statusText: 'In Diagnosis & Quote Approved',
    estimatedCost: 4850,
    assignedTechnician: 'Vikram K. (MIDC Support Desk)',
    technicianPhone: '9876543210',
  },
];

export const MOCK_AMC_CONTRACTS: AMCContract[] = [
  {
    contractId: 'AMC-2026-MIDC1',
    title: 'Annual IT & CCTV Maintenance Contract - MIDC Plant 1',
    validFrom: '01 Jan 2026',
    validTo: '31 Dec 2026',
    completedVisits: 3,
    totalVisits: 4,
    nextScheduledVisit: '15 Oct 2026',
    coveredAssets: [
      { label: 'Desktop PCs', count: 12 },
      { label: 'IP CCTV Cameras', count: 8 },
      { label: 'Network Switches & Routers', count: 2 },
      { label: 'Central Storage Server', count: 1 },
    ],
  },
];

export const MOCK_TAX_INVOICES: TaxInvoice[] = [
  {
    invoiceNo: 'INV-2026-08894',
    orderId: 'IT-SH-2026-8894',
    invoiceDate: '31 Aug 2026',
    hsnCode: '847170 / 852580',
    taxableValue: 8895.76,
    cgstAmount: 800.62,
    sgstAmount: 800.62,
    totalAmount: 10497,
  },
  {
    invoiceNo: 'INV-2026-07210',
    orderId: 'IT-SH-2026-7210',
    invoiceDate: '14 Jun 2026',
    hsnCode: '852580',
    taxableValue: 15635.59,
    cgstAmount: 1407.21,
    sgstAmount: 1407.21,
    totalAmount: 18450,
  },
];
