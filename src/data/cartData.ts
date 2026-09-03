import { CrossSellItem, CouponCode } from '../types';

export const CROSS_SELL_ESSENTIALS: CrossSellItem[] = [
  {
    id: 'cs-enclosure',
    name: 'Tool-Free 10Gbps USB-C M.2 NVMe SSD Enclosure',
    price: 699,
    mrp: 1499,
    imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=300&auto=format&fit=crop&q=80',
    category: 'Adapters',
    badge: 'MUST HAVE',
  },
  {
    id: 'cs-thermal',
    name: 'High Performance CPU/GPU Thermal Compound Paste (4g)',
    price: 199,
    mrp: 399,
    imageUrl: 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=300&auto=format&fit=crop&q=80',
    category: 'Maintenance',
    badge: 'POPULAR',
  },
  {
    id: 'cs-lan-cable',
    name: 'Cat6 High Speed Ethernet LAN Patch Cable (5 Meters)',
    price: 149,
    mrp: 299,
    imageUrl: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=300&auto=format&fit=crop&q=80',
    category: 'Cables',
  },
  {
    id: 'cs-mousepad',
    name: 'Anti-Slip Waterproof Extra Large Desk Mousepad',
    price: 299,
    mrp: 599,
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300&auto=format&fit=crop&q=80',
    category: 'Accessories',
  },
];

export const PREDEFINED_COUPONS: CouponCode[] = [
  {
    code: 'MIDC500',
    discountType: 'flat',
    value: 500,
    minOrderValue: 1500,
    description: 'Flat ₹500 discount for MIDC Ahilyanagar factory orders over ₹1,500',
  },
  {
    code: 'BLINKIT10',
    discountType: 'percentage',
    value: 10,
    minOrderValue: 500,
    description: '10% Instant Discount on orders over ₹500',
  },
];
