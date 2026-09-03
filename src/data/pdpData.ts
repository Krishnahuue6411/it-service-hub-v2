import { ProductDetail } from '../types';

export const FLAGSHIP_PRODUCT_PDP: ProductDetail = {
  id: 'pdp-crucial-p3-1tb',
  sku: 'CT1000P3PSSSD8',
  modelNumber: 'Crucial P3 Plus M.2 NVMe',
  name: 'Crucial P3 Plus 1TB PCIe 4.0 3D NAND NVMe M.2 Internal SSD - Up to 5000 MB/s',
  brand: 'Crucial',
  category: 'SSD & RAM Upgrades',
  condition: 'New',
  capacity: '1TB',
  formFactor: 'M.2',
  price: 5999,
  mrp: 10500,
  rating: 4.7,
  reviewsCount: 542,
  answeredQuestionsCount: 114,
  imageUrl: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop&q=80',
  images: [
    'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1562976540-1502c2145186?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
  ],
  videoThumbnail: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&auto=format&fit=crop&q=80',
  videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  specBullet: 'Ultra-fast Gen4 NVMe 3D NAND storage with 5000 MB/s speed',
  keySpecsPills: ['5000 MB/s Read', '3 Years Brand Warranty', 'Free Installation in MIDC'],
  badge: '43% OFF',
  discountPercentage: 43,
  inStock: true,
  isBestSeller: true,
  isAmazonChoice: true,
  tabGroup: 'upgrades',
  deliveryTimeMinutes: 30,
  gstPercent: 18,

  // Variants (Capacities)
  variants: [
    { id: 'var-500gb', capacityLabel: '500GB', price: 3499, mrp: 5999, inStock: true, stockCount: 12 },
    { id: 'var-1tb', capacityLabel: '1TB (Popular)', price: 5999, mrp: 10500, inStock: true, stockCount: 4 },
    { id: 'var-2tb', capacityLabel: '2TB (Extreme)', price: 11499, mrp: 18999, inStock: true, stockCount: 8 },
  ],

  // Form Factors
  formFactorsList: ['M.2 NVMe PCIe 4.0 (Fastest)', 'SATA 2.5" (Standard)'],
  selectedFormFactor: 'M.2 NVMe PCIe 4.0 (Fastest)',

  // Key Feature Checklist
  keyFeatureChecklist: [
    'Sequential Read/Write speeds up to 5000 MB/s and 4200 MB/s for instant booting & heavy loading.',
    'Engineered with high-quality Micron® 3D NAND technology for extreme reliability.',
    'Fully compatible with PC desktops, gaming rigs, workstations, and laptops with M.2 2280 slots.',
    'Includes Acronis True Image for Crucial software for effortless data cloning & migration.',
    'Free technical consultation & on-site installation available in Ahilyanagar MIDC Factories.',
  ],

  // Tech Specs Table
  techSpecsTable: [
    { label: 'Brand', value: 'Crucial (Micron Technology)' },
    { label: 'Series', value: 'P3 Plus PCIe 4.0 NVMe M.2' },
    { label: 'Model Number', value: 'CT1000P3PSSSD8' },
    { label: 'Capacity Options', value: '500GB, 1TB, 2TB' },
    { label: 'Form Factor', value: 'M.2 2280' },
    { label: 'Interface', value: 'PCIe NVMe Gen 4.0 x4' },
    { label: 'Sequential Read Speed', value: 'Up to 5000 MB/s' },
    { label: 'Sequential Write Speed', value: 'Up to 4200 MB/s' },
    { label: 'Total Bytes Written (TBW)', value: '220 TBW (for 1TB model)' },
    { label: 'Operating Temperature', value: '0°C to 70°C' },
    { label: 'Warranty & Support', value: '3-Year Limited Warranty + Direct Onsite Support' },
  ],

  // Installation Steps
  installationSteps: [
    'Step 1: Shut down your system and disconnect all power cables.',
    'Step 2: Locate the M.2 2280 expansion slot on your desktop motherboard or laptop chassis.',
    'Step 3: Insert the Crucial P3 Plus SSD into the slot at a 30-degree angle and secure it gently with the M.2 screw.',
    'Step 4: Boot up Windows, open Disk Management, initialize the new disk, and enjoy 5000 MB/s speeds!',
  ],

  // Frequently Bought Together Bundle Items
  bundleItems: [
    {
      id: 'bundle-main',
      name: 'Crucial P3 Plus 1TB PCIe 4.0 NVMe M.2 SSD',
      price: 5999,
      mrp: 10500,
      imageUrl: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=300&auto=format&fit=crop&q=80',
      isSelected: true,
    },
    {
      id: 'bundle-heatsink',
      name: 'Pure Copper M.2 SSD Thermal Heatsink Cooler (Reduces 15°C)',
      price: 499,
      mrp: 999,
      imageUrl: 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=300&auto=format&fit=crop&q=80',
      isSelected: true,
    },
    {
      id: 'bundle-enclosure',
      name: 'Tool-Free 10Gbps USB-C M.2 NVMe External Enclosure Case',
      price: 1299,
      mrp: 2499,
      imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=300&auto=format&fit=crop&q=80',
      isSelected: true,
    },
  ],

  // Reviews List
  reviewsList: [
    {
      id: 'rev-1',
      userName: 'Rahul Deshmukh',
      rating: 5,
      date: '28 Aug 2026',
      title: 'Superfast 5000 MB/s speed & delivered in 45 mins in Savedi!',
      comment: 'Upgraded my Lenovo laptop with this Crucial 1TB SSD. Boot time dropped from 40 seconds to just 6 seconds! IT Service Hub team delivered it in under an hour to Savedi, Ahilyanagar. Exceptional service!',
      isVerified: true,
      userLocation: 'Ahilyanagar (Verified Buyer)',
      helpfulCount: 42,
    },
    {
      id: 'rev-2',
      userName: 'Vikram Kulkarni (MIDC Factory Admin)',
      rating: 5,
      date: '20 Aug 2026',
      title: 'Official GST Invoice provided + Instant Onsite Fitting',
      comment: 'Ordered 4 units for our CAD design workstations in MIDC Sector 3. Received valid GST tax invoice for 18% input credit and free thermal paste. Highly recommended B2B vendor!',
      isVerified: true,
      userLocation: 'MIDC Industrial Area (Verified Business Buyer)',
      helpfulCount: 29,
    },
    {
      id: 'rev-3',
      userName: 'Aniket Shinde',
      rating: 4,
      date: '14 Aug 2026',
      title: 'Great value for Gen4 PCIe slots',
      comment: 'Cloned my OS partition seamlessly using the free Acronis software. Temperature stays under 45°C during continuous heavy file transfers.',
      isVerified: true,
      userLocation: 'Pipeline Road (Verified Buyer)',
      helpfulCount: 15,
    },
  ],

  // Rating Distribution
  ratingDistribution: {
    5: 82,
    4: 12,
    3: 4,
    2: 1,
    1: 1,
  },
};
