import { Product, QuickCategory, HeroBanner, LocationInfo, TrustBadgeItem } from '../types';

export const INITIAL_LOCATION: LocationInfo = {
  city: 'Ahilyanagar',
  area: 'MIDC Industrial Area Sector 3',
  pincode: '414111',
  deliveryEstimate: '⚡ 2-Hour Express Delivery'
};

export const POPULAR_PINCODES: LocationInfo[] = [
  { city: 'Ahilyanagar', area: 'MIDC Industrial Area Sector 3', pincode: '414111', deliveryEstimate: '⚡ 2-Hour Express' },
  { city: 'Ahilyanagar', area: 'Savedi & Pipeline Road', pincode: '414003', deliveryEstimate: '⚡ 90-Min Delivery' },
  { city: 'Ahilyanagar', area: 'Kedgaon Industrial Zone', pincode: '414005', deliveryEstimate: '⚡ 2-Hour Express' },
  { city: 'Ahilyanagar', area: 'Nagar City Center & Cloth Market', pincode: '414001', deliveryEstimate: '⚡ 45-Min Superfast' },
];

export const CATEGORIES_LIST = [
  'All Categories',
  'Hardware & Components',
  'CCTV & Security',
  'SSD & RAM Upgrades',
  'Laptops & Refurbished',
  'Printers & Toners',
  'Software & AMC'
];

export const HERO_BANNERS: HeroBanner[] = [
  {
    id: 'banner-1',
    title: 'High-Speed PC & NVMe SSD Upgrades',
    subtitle: 'Transform your desktop or factory workstation with ultra-fast NVMe storage and DDR4/DDR5 RAM.',
    highlightText: 'Starting at ₹1,499 • Free Thermal Paste & Installation',
    ctaText: 'Shop Upgrades Now',
    ctaSecondaryText: 'Explore RAM Bundles',
    bgGradient: 'from-slate-950 via-blue-950 to-indigo-950',
    tag: '⚡ 10X Speed Boost',
    imageUrl: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'banner-2',
    title: 'Industrial CCTV & Biometric Factory Security',
    subtitle: 'Complete 4K ColorVU camera kits, NVR recording units & AI face recognition attendance hardware.',
    highlightText: 'End-to-End MIDC Factory Setup with 2-Year Onsite AMC',
    ctaText: 'Book Free Site Survey',
    ctaSecondaryText: 'View CCTV Bundles',
    bgGradient: 'from-slate-900 via-slate-950 to-emerald-950',
    tag: '🛡️ MIDC Factory Approved',
    imageUrl: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'banner-3',
    title: 'Certified Refurbished Laptops & Desktops',
    subtitle: 'Intel Core i5 / i7 Business Laptops fully tested, upgraded SSDs & original charger included.',
    highlightText: '6-Month Direct Replacement Warranty • GST Invoice',
    ctaText: 'View Refurbished Stock',
    ctaSecondaryText: 'Compare Specs',
    bgGradient: 'from-indigo-950 via-slate-900 to-slate-950',
    tag: '💻 Grade A Business Stock',
    imageUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80'
  }
];

export const QUICK_CATEGORIES: QuickCategory[] = [
  {
    id: 'cat-cctv',
    name: 'CCTV Cameras',
    iconName: 'Camera',
    bgGradient: 'from-blue-500/15 to-indigo-500/10 text-blue-600 border-blue-200',
    itemCount: '48+ Models',
    tag: 'Popular'
  },
  {
    id: 'cat-ssd',
    name: 'SSD & NVMe',
    iconName: 'HardDrive',
    bgGradient: 'from-emerald-500/15 to-teal-500/10 text-emerald-600 border-emerald-200',
    itemCount: 'Crucial & WD',
    tag: 'Up to 50% Off'
  },
  {
    id: 'cat-ram',
    name: 'DDR4 / DDR5 RAM',
    iconName: 'Cpu',
    bgGradient: 'from-amber-500/15 to-orange-500/10 text-amber-600 border-amber-200',
    itemCount: 'Desktop & Laptop',
  },
  {
    id: 'cat-peripherals',
    name: 'Keyboards & Mice',
    iconName: 'Keyboard',
    bgGradient: 'from-purple-500/15 to-pink-500/10 text-purple-600 border-purple-200',
    itemCount: 'Logitech & HP',
  },
  {
    id: 'cat-wifi',
    name: 'Wi-Fi & Routers',
    iconName: 'Wifi',
    bgGradient: 'from-cyan-500/15 to-blue-500/10 text-cyan-600 border-cyan-200',
    itemCount: 'TP-Link & D-Link',
    tag: 'Express Delivery'
  },
  {
    id: 'cat-pos',
    name: 'POS & Billing',
    iconName: 'Receipt',
    bgGradient: 'from-rose-500/15 to-red-500/10 text-rose-600 border-rose-200',
    itemCount: 'Thermal Printers',
  },
  {
    id: 'cat-printers',
    name: 'Printers & Ink',
    iconName: 'Printer',
    bgGradient: 'from-indigo-500/15 to-purple-500/10 text-indigo-600 border-indigo-200',
    itemCount: 'Epson & Canon',
  },
  {
    id: 'cat-cables',
    name: 'Adapters & Cables',
    iconName: 'Zap',
    bgGradient: 'from-amber-500/15 to-yellow-500/10 text-amber-700 border-amber-200',
    itemCount: 'HDMI, VGA, LAN',
  }
];

export const PRODUCTS_DATABASE: Product[] = [
  // 1. Crucial 1TB SSD
  {
    id: 'plp-1',
    name: 'Crucial P3 1TB PCIe 3.0 3D NAND NVMe M.2 SSD (Up to 3500MB/s)',
    category: 'SSD & RAM Upgrades',
    brand: 'Crucial',
    condition: 'New',
    capacity: '1TB',
    formFactor: 'M.2',
    price: 5499,
    mrp: 9500,
    rating: 4.8,
    reviewsCount: 1240,
    imageUrl: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500&auto=format&fit=crop&q=80',
    specBullet: 'Ultra-fast NVMeGen3 speed for OS & Gaming',
    keySpecsPills: ['Up to 3500 MB/s Read', '5 Years Warranty', 'Free Installation in MIDC'],
    badge: '42% OFF',
    discountPercentage: 42,
    inStock: true,
    isFlashDeal: true,
    isAmazonChoice: true,
    isBestSeller: true,
    tabGroup: 'upgrades',
    deliveryTimeMinutes: 30,
    gstPercent: 18
  },
  // 2. WD 500GB SSD
  {
    id: 'plp-2',
    name: 'Western Digital WD Blue SN570 500GB NVMe M.2 Internal SSD',
    category: 'SSD & RAM Upgrades',
    brand: 'Western Digital',
    condition: 'New',
    capacity: '512GB',
    formFactor: 'M.2',
    price: 3299,
    mrp: 5200,
    rating: 4.7,
    reviewsCount: 890,
    imageUrl: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500&auto=format&fit=crop&q=80',
    specBullet: 'High-speed PCIe Gen3 x4 NVMe technology',
    keySpecsPills: ['Up to 3300 MB/s Read', '5 Years Warranty', 'Slim M.2 2280'],
    badge: '36% OFF',
    discountPercentage: 36,
    inStock: true,
    isAmazonChoice: true,
    tabGroup: 'upgrades',
    deliveryTimeMinutes: 45,
    gstPercent: 18
  },
  // 3. Kingston 16GB RAM
  {
    id: 'plp-3',
    name: 'Kingston FURY Beast 16GB DDR4 3200MHz Desktop Memory RAM',
    category: 'SSD & RAM Upgrades',
    brand: 'Kingston',
    condition: 'New',
    price: 3199,
    mrp: 5200,
    rating: 4.9,
    reviewsCount: 1530,
    imageUrl: 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=500&auto=format&fit=crop&q=80',
    specBullet: 'Automatic overclocking & low profile heat spreader',
    keySpecsPills: ['CL16 Latency', 'Intel XMP Ready', 'Lifetime Warranty'],
    badge: 'HOT SELLER',
    discountPercentage: 38,
    inStock: true,
    isFlashDeal: true,
    isBestSeller: true,
    tabGroup: 'top-rated',
    deliveryTimeMinutes: 30,
    gstPercent: 18
  },
  // 4. CP Plus Outdoor CCTV
  {
    id: 'plp-4',
    name: 'CP PLUS 2MP Full HD Outdoor Bullet CCTV Camera (Night Vision 20m)',
    category: 'CCTV & Security',
    brand: 'CP Plus',
    condition: 'New',
    price: 1399,
    mrp: 2350,
    rating: 4.6,
    reviewsCount: 670,
    imageUrl: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=500&auto=format&fit=crop&q=80',
    specBullet: 'Weatherproof IP66 rating with Smart IR LED',
    keySpecsPills: ['Full HD 1080P', '20m IR Night Vision', 'Weatherproof Metal Body'],
    badge: 'DEAL OF THE DAY',
    discountPercentage: 40,
    inStock: true,
    isFlashDeal: true,
    tabGroup: 'industrial-cctv',
    deliveryTimeMinutes: 45,
    gstPercent: 18
  },
  // 5. Hikvision 4CH DVR
  {
    id: 'plp-5',
    name: 'Hikvision 4-Channel 1080P Turbo HD DVR with H.265+ Compression',
    category: 'CCTV & Security',
    brand: 'Hikvision',
    condition: 'New',
    price: 3699,
    mrp: 5400,
    rating: 4.7,
    reviewsCount: 420,
    imageUrl: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=500&auto=format&fit=crop&q=80',
    specBullet: 'Supports mobile app remote monitoring & 4CH HD-TVI inputs',
    keySpecsPills: ['H.265+ Video Saver', 'Remote Phone View', '2 Years Warranty'],
    badge: 'MIDC CHOICE',
    discountPercentage: 31,
    inStock: true,
    isAmazonChoice: true,
    tabGroup: 'industrial-cctv',
    deliveryTimeMinutes: 60,
    gstPercent: 18
  },
  // 6. Dahua 8CH NVR
  {
    id: 'plp-6',
    name: 'Dahua 8-Channel NVR Network Video Recorder (Smart Motion Detection)',
    category: 'CCTV & Security',
    brand: 'Dahua',
    condition: 'New',
    price: 7499,
    mrp: 11000,
    rating: 4.8,
    reviewsCount: 280,
    imageUrl: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=500&auto=format&fit=crop&q=80',
    specBullet: 'Up to 8MP resolution recording with HDMI 4K output',
    keySpecsPills: ['4K HDMI Output', '8 Channels IP Input', 'Factory Grade'],
    badge: 'FACTORY GRADE',
    discountPercentage: 32,
    inStock: true,
    tabGroup: 'industrial-cctv',
    deliveryTimeMinutes: 90,
    gstPercent: 18
  },
  // 7. Lenovo ThinkPad L480 Refurbished
  {
    id: 'plp-7',
    name: 'Lenovo ThinkPad L480 (Core i5 8th Gen / 16GB RAM / 512GB SSD)',
    category: 'Laptops & Refurbished',
    brand: 'Lenovo',
    condition: 'Certified Pre-Owned',
    capacity: '512GB',
    formFactor: 'Laptop',
    price: 22999,
    mrp: 45000,
    rating: 4.9,
    reviewsCount: 310,
    imageUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500&auto=format&fit=crop&q=80',
    specBullet: 'Tested & Certified Grade A • 6-Month Direct Replacement Warranty',
    keySpecsPills: ['14" Full HD Screen', '16GB DDR4 RAM', '6-Month Direct Warranty'],
    badge: 'BEST B2B VALUE',
    discountPercentage: 48,
    inStock: true,
    isBestSeller: true,
    tabGroup: 'top-rated',
    deliveryTimeMinutes: 120,
    gstPercent: 18
  },
  // 8. HP EliteBook Refurbished
  {
    id: 'plp-8',
    name: 'HP EliteBook 840 G5 (Core i7 8th Gen / 16GB RAM / 1TB SSD)',
    category: 'Laptops & Refurbished',
    brand: 'HP',
    condition: 'Manufacturer Refurbished',
    capacity: '1TB',
    formFactor: 'Laptop',
    price: 28999,
    mrp: 65000,
    rating: 4.8,
    reviewsCount: 190,
    imageUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500&auto=format&fit=crop&q=80',
    specBullet: 'Sleek aluminum body with Bang & Olufsen audio system',
    keySpecsPills: ['Intel Core i7 8550U', '1TB NVMe SSD', 'Backlit Keyboard'],
    badge: 'PREMIUM GRADE',
    discountPercentage: 55,
    inStock: true,
    isAmazonChoice: true,
    tabGroup: 'office-it',
    deliveryTimeMinutes: 120,
    gstPercent: 18
  },
  // 9. Epson EcoTank Printer
  {
    id: 'plp-9',
    name: 'Epson EcoTank L3210 All-in-One Multi-Function InkTank Printer',
    category: 'Printers & Toners',
    brand: 'Epson',
    condition: 'New',
    price: 11999,
    mrp: 15999,
    rating: 4.6,
    reviewsCount: 1120,
    imageUrl: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=500&auto=format&fit=crop&q=80',
    specBullet: 'High-yield printing: 4,500 Black / 7,500 Color pages',
    keySpecsPills: ['Borderless Printing', 'Heat-Free Tech', 'Low Cost Per Print'],
    badge: 'SAVE ₹4,000',
    discountPercentage: 25,
    inStock: true,
    isBestSeller: true,
    tabGroup: 'office-it',
    deliveryTimeMinutes: 60,
    gstPercent: 18
  },
  // 10. Logitech Wireless Combo
  {
    id: 'plp-10',
    name: 'Logitech MK270 Wireless Keyboard & Mouse Combo',
    category: 'Hardware & Components',
    brand: 'Logitech',
    condition: 'New',
    price: 1449,
    mrp: 2195,
    rating: 4.5,
    reviewsCount: 2300,
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=80',
    specBullet: '36-month battery life with 8 hotkeys for Instant Control',
    keySpecsPills: ['2.4GHz Wireless', 'Long Battery Life', 'Full-size Layout'],
    badge: '34% OFF',
    discountPercentage: 34,
    inStock: true,
    isFlashDeal: true,
    tabGroup: 'office-it',
    deliveryTimeMinutes: 30,
    gstPercent: 18
  },
  // 11. Crucial 2TB SATA SSD
  {
    id: 'plp-11',
    name: 'Crucial BX500 2TB 3D NAND SATA 2.5-Inch Internal SSD',
    category: 'SSD & RAM Upgrades',
    brand: 'Crucial',
    condition: 'New',
    capacity: '2TB',
    formFactor: '2.5-inch',
    price: 10499,
    mrp: 17500,
    rating: 4.7,
    reviewsCount: 540,
    imageUrl: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500&auto=format&fit=crop&q=80',
    specBullet: 'Up to 540 MB/s Read Speed for quick boot & storage',
    keySpecsPills: ['2TB High Capacity', '2.5" SATA III', '3 Years Warranty'],
    badge: '40% OFF',
    discountPercentage: 40,
    inStock: true,
    tabGroup: 'upgrades',
    deliveryTimeMinutes: 45,
    gstPercent: 18
  },
  // 12. TP-Link Gigabit Router
  {
    id: 'plp-12',
    name: 'TP-Link Archer C6 AC1200 Dual Band Gigabit Wi-Fi Router',
    category: 'Hardware & Components',
    brand: 'TP-Link',
    condition: 'New',
    price: 2299,
    mrp: 3999,
    rating: 4.7,
    reviewsCount: 940,
    imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500&auto=format&fit=crop&q=80',
    specBullet: '4 External Antennas with MU-MIMO Technology',
    keySpecsPills: ['AC1200 Dual Band', 'Gigabit Ports', 'Agile Config Ready'],
    badge: 'POPULAR',
    discountPercentage: 42,
    inStock: true,
    isAmazonChoice: true,
    tabGroup: 'office-it',
    deliveryTimeMinutes: 30,
    gstPercent: 18
  }
];

export const TRUST_BADGES: TrustBadgeItem[] = [
  {
    id: 'tb-1',
    title: 'Same Day Express Delivery',
    subtitle: '⚡ Delivering in MIDC Ahilyanagar within 2 hours',
    iconName: 'Truck'
  },
  {
    id: 'tb-2',
    title: '100% Verified Hardware',
    subtitle: 'Direct OEM warranty & genuine GST tax invoice',
    iconName: 'ShieldCheck'
  },
  {
    id: 'tb-3',
    title: 'Free Technical Consultation',
    subtitle: 'Dedicated engineers for CCTV & IT setup planning',
    iconName: 'Headphones'
  },
  {
    id: 'tb-4',
    title: 'B2B Bulk Pricing & AMC',
    subtitle: 'Custom quotes for factories, schools & corporate offices',
    iconName: 'Building2'
  }
];
