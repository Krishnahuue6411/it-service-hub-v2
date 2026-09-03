export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  mrp: number;
  rating: number;
  reviewsCount: number;
  imageUrl: string;
  specBullet: string;
  badge?: string;
  discountPercentage: number;
  inStock: boolean;
  isFlashDeal?: boolean;
  tabGroup: 'top-rated' | 'industrial-cctv' | 'office-it' | 'upgrades';
  deliveryTimeMinutes?: number;
  gstPercent?: number;

  // PLP Extended Attributes
  brand: string;
  condition: 'New' | 'Manufacturer Refurbished' | 'Certified Pre-Owned';
  capacity?: '256GB' | '512GB' | '1TB' | '2TB';
  formFactor?: 'M.2' | '2.5-inch' | 'Desktop' | 'Laptop';
  keySpecsPills: string[];
  isWishlisted?: boolean;
  isAmazonChoice?: boolean;
  isBestSeller?: boolean;
}

export interface ProductVariant {
  id: string;
  capacityLabel: string;
  price: number;
  mrp: number;
  inStock: boolean;
  stockCount: number;
}

export interface SpecItem {
  label: string;
  value: string;
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  isVerified: boolean;
  userLocation: string;
  helpfulCount: number;
  images?: string[];
}

export interface BundleItem {
  id: string;
  name: string;
  price: number;
  mrp: number;
  imageUrl: string;
  isSelected: boolean;
}

export interface ProductDetail extends Product {
  sku: string;
  modelNumber: string;
  images: string[];
  videoThumbnail: string;
  videoUrl: string;
  answeredQuestionsCount: number;
  variants: ProductVariant[];
  formFactorsList: string[];
  selectedFormFactor: string;
  keyFeatureChecklist: string[];
  techSpecsTable: SpecItem[];
  installationSteps: string[];
  bundleItems: BundleItem[];
  reviewsList: Review[];
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface CartItem {
  product: Product;
  quantity: number;
  variantId?: string;
  capacityLabel?: string;
  isSelected?: boolean;
}

export interface CrossSellItem {
  id: string;
  name: string;
  price: number;
  mrp: number;
  imageUrl: string;
  category: string;
  badge?: string;
}

export interface CartSummary {
  mrpTotal: number;
  itemSubtotal: number;
  totalDiscount: number;
  deliveryFee: number;
  handlingFee: number;
  gstTaxAmount: number;
  appliedDiscount: number;
  grandTotal: number;
  freeDeliveryThreshold: number;
  amountNeededForFreeDelivery: number;
}

export interface CouponCode {
  code: string;
  discountType: 'percentage' | 'flat';
  value: number;
  minOrderValue: number;
  description: string;
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  pincode: string;
  flatPlot: string;
  areaStreet: string;
  city: string;
  state: string;
  type: 'Factory / MIDC' | 'Business Office' | 'Home';
  isDefault?: boolean;
}

export interface B2BProfile {
  companyName: string;
  gstin: string;
  tradeName: string;
  stateCode: string;
  isValidGstin: boolean;
}

export type PaymentMethodType = 'upi' | 'card' | 'netbanking' | 'cod' | 'b2b-credit';

export interface PaymentOption {
  type: PaymentMethodType;
  title: string;
  subtitle: string;
  iconName: string;
}

export interface OrderCalculation {
  basePriceTotal: number;
  mrpTotal: number;
  gstAmount: number;
  deliveryFee: number;
  handlingFee: number;
  couponDiscount: number;
  grandTotal: number;
  gstCreditSavings: number;
}

export interface OrderItem {
  id: string;
  name: string;
  variantLabel: string;
  quantity: number;
  unitPrice: number;
  mrp: number;
  imageUrl: string;
  serialNumber: string;
  warrantyYears: number;
  hsnCode: string;
  installationIncluded: boolean;
}

export interface TrackingStep {
  id: number;
  title: string;
  subtitle: string;
  timestamp: string;
  isCompleted: boolean;
  isActive: boolean;
}

export interface TaxSummary {
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  deliveryFee: number;
  discount: number;
  grandTotal: number;
}

export interface ConfirmedOrder {
  orderId: string;
  orderDate: string;
  orderTime: string;
  estimatedDelivery: string;
  recipientName: string;
  companyName: string;
  addressLine: string;
  cityStatePincode: string;
  contactPhone: string;
  gstin: string;
  paymentMethodLabel: string;
  paymentTransactionRef: string;
  technicianName: string;
  technicianPhone: string;
  items: OrderItem[];
  trackingSteps: TrackingStep[];
  taxSummary: TaxSummary;
}

export interface UserProfile {
  clientId: string;
  fullName: string;
  companyName: string;
  email: string;
  phone: string;
  gstin: string;
  accountTier: 'B2B Verified Client' | 'Gold AMC Partner' | 'Retail Client';
  b2bCreditPoints: number;
  activeOrdersCount: number;
  openRepairTicketsCount: number;
  activeAmcContractsCount: number;
}

export interface OrderHistoryItem {
  orderId: string;
  orderDate: string;
  totalAmount: number;
  shipToName: string;
  shipToAddress: string;
  statusBadge: 'Out for Delivery 🚚' | 'Delivered ✅' | 'Processing 📦';
  statusColor: 'emerald' | 'amber' | 'blue';
  items: {
    id: string;
    name: string;
    imageUrl: string;
    variant: string;
    warranty: string;
    price: number;
  }[];
}

export interface RepairJobCard {
  ticketId: string;
  deviceName: string;
  problemDescription: string;
  receivedDate: string;
  statusStep: 1 | 2 | 3 | 4;
  statusText: string;
  estimatedCost: number;
  assignedTechnician: string;
  technicianPhone: string;
}

export interface AMCContract {
  contractId: string;
  title: string;
  validFrom: string;
  validTo: string;
  completedVisits: number;
  totalVisits: number;
  nextScheduledVisit: string;
  coveredAssets: {
    label: string;
    count: number;
  }[];
}

export interface TaxInvoice {
  invoiceNo: string;
  orderId: string;
  invoiceDate: string;
  hsnCode: string;
  taxableValue: number;
  cgstAmount: number;
  sgstAmount: number;
  totalAmount: number;
}

// ADMIN PORTAL TYPES
export interface AdminProduct {
  id: string;
  sku: string;
  title: string;
  category: string;
  hsnCode: string;
  purchaseCost: number;
  mrp: number;
  sellingPrice: number;
  gstPercent: 18 | 12 | 5;
  stockCount: number;
  lowStockThreshold: number;
  status: 'Active' | 'Draft' | 'Out of Stock';
  imageUrl: string;
}

export interface AdminService {
  id: string;
  name: string;
  category: string;
  description: string;
  baseFee: number;
  estimatedHours: string;
  amcFrequency?: 'Quarterly' | 'Half-Yearly' | 'Annual';
  freeVisitsCount?: number;
  isActive: boolean;
}

export type JobStatusType = 'Received' | 'Diagnosing' | 'Approved / Parts Ordered' | 'Repaired' | 'Delivered / Closed';

export interface JobCardTicket {
  jobId: string;
  clientName: string;
  clientPhone: string;
  deviceModel: string;
  reportedIssue: string;
  status: JobStatusType;
  assignedTechnician: string;
  receivedDate: string;
  estimatedPrice: number;
  technicianNotes?: string;
  partsConsumed?: string[];
}

export interface AMCRecord {
  id: string;
  clientName: string;
  companyName: string;
  gstin: string;
  contractType: string;
  validityRange: string;
  completedVisits: number;
  totalVisits: number;
  status: 'Active' | 'Renewal Pending' | 'Expired';
}

export interface AdminInvoice {
  invoiceId: string;
  orderId: string;
  clientName: string;
  companyName: string;
  gstin: string;
  date: string;
  hsnCode: string;
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  totalAmount: number;
  status: 'Paid' | 'B2B Credit Pending' | 'Overdue';
}

export interface QuickCategory {
  id: string;
  name: string;
  iconName: string;
  bgGradient: string;
  itemCount: string;
  tag?: string;
}

export interface HeroBanner {
  id: string;
  title: string;
  subtitle: string;
  highlightText: string;
  ctaText: string;
  ctaSecondaryText?: string;
  bgGradient: string;
  tag: string;
  imageUrl: string;
}

export interface LocationInfo {
  city: string;
  area: string;
  pincode: string;
  deliveryEstimate: string;
}

export interface TrustBadgeItem {
  id: string;
  title: string;
  subtitle: string;
  iconName: string;
}

export interface FilterState {
  category: string;
  minPrice: number;
  maxPrice: number;
  selectedBrands: string[];
  minRating: number;
  inStockOnly: boolean;
  conditions: string[];
  capacities: string[];
  formFactors: string[];
  searchQuery: string;
}

export type SortOption =
  | 'featured'
  | 'price-low-high'
  | 'price-high-low'
  | 'rating-high-low'
  | 'newest';
