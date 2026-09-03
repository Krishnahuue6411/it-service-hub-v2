'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Header } from '../../components/Header';
import { SecondaryNav } from '../../components/SecondaryNav';
import { PlpFilterSidebar } from '../../components/plp/PlpFilterSidebar';
import { ProductCard } from '../../components/plp/ProductCard';
import { MobileCartBar } from '../../components/plp/MobileCartBar';
import { CartDrawer } from '../../components/CartDrawer';
import { LocationModal } from '../../components/LocationModal';
import { Footer } from '../../components/Footer';

import { PRODUCTS_DATABASE, INITIAL_LOCATION } from '../../data/mockData';
import { Product, CartItem, LocationInfo, FilterState, SortOption } from '../../types';

import { 
  ChevronRight, 
  Grid, 
  List, 
  SlidersHorizontal, 
  ArrowUpDown, 
  Sparkles, 
  Check, 
  ChevronLeft
} from 'lucide-react';

function PlpContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Location & Cart State
  const [location, setLocation] = useState<LocationInfo>(INITIAL_LOCATION);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // View Mode: 'grid' vs 'list'
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Mobile Filter Drawer Toggle
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Initialize Filter State from URL search params
  const [filterState, setFilterState] = useState<FilterState>(() => {
    return {
      category: searchParams.get('category') || 'All Categories',
      minPrice: Number(searchParams.get('minPrice')) || 0,
      maxPrice: Number(searchParams.get('maxPrice')) || 50000,
      selectedBrands: searchParams.get('brands') ? searchParams.get('brands')!.split(',') : [],
      minRating: Number(searchParams.get('rating')) || 0,
      inStockOnly: searchParams.get('inStock') === 'true',
      conditions: searchParams.get('conditions') ? searchParams.get('conditions')!.split(',') : [],
      capacities: searchParams.get('capacities') ? searchParams.get('capacities')!.split(',') : [],
      formFactors: searchParams.get('formFactors') ? searchParams.get('formFactors')!.split(',') : [],
      searchQuery: searchParams.get('q') || '',
    };
  });

  const [sortOption, setSortOption] = useState<SortOption>(
    (searchParams.get('sort') as SortOption) || 'featured'
  );

  // Sync URL when filterState or sortOption changes
  useEffect(() => {
    const params = new URLSearchParams();

    if (filterState.category !== 'All Categories') params.set('category', filterState.category);
    if (filterState.minPrice > 0) params.set('minPrice', filterState.minPrice.toString());
    if (filterState.maxPrice < 50000) params.set('maxPrice', filterState.maxPrice.toString());
    if (filterState.selectedBrands.length > 0) params.set('brands', filterState.selectedBrands.join(','));
    if (filterState.minRating > 0) params.set('rating', filterState.minRating.toString());
    if (filterState.inStockOnly) params.set('inStock', 'true');
    if (filterState.conditions.length > 0) params.set('conditions', filterState.conditions.join(','));
    if (filterState.capacities.length > 0) params.set('capacities', filterState.capacities.join(','));
    if (filterState.formFactors.length > 0) params.set('formFactors', filterState.formFactors.join(','));
    if (filterState.searchQuery) params.set('q', filterState.searchQuery);
    if (sortOption !== 'featured') params.set('sort', sortOption);

    const queryString = params.toString();
    router.replace(`${pathname}${queryString ? `?${queryString}` : ''}`, { scroll: false });
  }, [filterState, sortOption, pathname, router]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Cart Handlers
  const handleAddToCart = (product: Product) => {
    setCartItems((prev) => {
      const idx = prev.findIndex((i) => i.product.id === product.id);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx].quantity += 1;
        return updated;
      }
      return [...prev, { product, quantity: 1 }];
    });
    showToast(`Added "${product.name.slice(0, 20)}..." to cart ⚡`);
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => prev.filter((i) => i.product.id !== productId));
    showToast('Item removed from cart');
  };

  const handleBuyNow = (product: Product) => {
    handleAddToCart(product);
    setIsCartDrawerOpen(true);
  };

  // Quick Category Pills
  const quickPills = [
    { label: 'All', category: 'All Categories' },
    { label: 'NVMe M.2 SSD', category: 'SSD & RAM Upgrades', capacity: '1TB' },
    { label: 'SATA 2.5 SSD', category: 'SSD & RAM Upgrades', formFactor: '2.5-inch' },
    { label: 'DDR4 RAM', category: 'SSD & RAM Upgrades' },
    { label: 'CCTV Cameras', category: 'CCTV & Security' },
    { label: 'Refurbished Laptops', category: 'Laptops & Refurbished' },
    { label: 'Printers & Toners', category: 'Printers & Toners' },
  ];

  // Calculate Brand Counts
  const brandCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    PRODUCTS_DATABASE.forEach((p) => {
      counts[p.brand] = (counts[p.brand] || 0) + 1;
    });
    return counts;
  }, []);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return PRODUCTS_DATABASE.filter((p) => {
      // Search query
      if (filterState.searchQuery.trim()) {
        const q = filterState.searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesCat = p.category.toLowerCase().includes(q);
        const matchesBrand = p.brand.toLowerCase().includes(q);
        if (!matchesName && !matchesCat && !matchesBrand) return false;
      }

      // Category
      if (filterState.category !== 'All Categories' && p.category !== filterState.category) {
        return false;
      }

      // Price Range
      if (p.price < filterState.minPrice || p.price > filterState.maxPrice) {
        return false;
      }

      // Brands
      if (
        filterState.selectedBrands.length > 0 &&
        !filterState.selectedBrands.includes(p.brand)
      ) {
        return false;
      }

      // Rating
      if (filterState.minRating > 0 && p.rating < filterState.minRating) {
        return false;
      }

      // In Stock Fast Delivery
      if (filterState.inStockOnly && !p.inStock) {
        return false;
      }

      // Conditions
      if (
        filterState.conditions.length > 0 &&
        !filterState.conditions.includes(p.condition)
      ) {
        return false;
      }

      // Capacities
      if (
        filterState.capacities.length > 0 &&
        (!p.capacity || !filterState.capacities.includes(p.capacity))
      ) {
        return false;
      }

      // Form Factors
      if (
        filterState.formFactors.length > 0 &&
        (!p.formFactor || !filterState.formFactors.includes(p.formFactor))
      ) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortOption === 'price-low-high') return a.price - b.price;
      if (sortOption === 'price-high-low') return b.price - a.price;
      if (sortOption === 'rating-high-low') return b.rating - a.rating;
      if (sortOption === 'newest') return b.id.localeCompare(a.id);
      return 0; // featured
    });
  }, [filterState, sortOption]);

  // Paginated Results
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const handleFilterChange = (updated: Partial<FilterState>) => {
    setFilterState((prev) => ({ ...prev, ...updated }));
    setCurrentPage(1);
  };

  const handleClearAll = () => {
    setFilterState({
      category: 'All Categories',
      minPrice: 0,
      maxPrice: 50000,
      selectedBrands: [],
      minRating: 0,
      inStockOnly: false,
      conditions: [],
      capacities: [],
      formFactors: [],
      searchQuery: '',
    });
    setSortOption('featured');
    setCurrentPage(1);
  };

  return (
    <main className="min-h-screen flex flex-col bg-slate-50">
      
      {/* Top Header */}
      <Header
        location={location}
        onOpenLocationModal={() => setIsLocationModalOpen(true)}
        searchQuery={filterState.searchQuery}
        setSearchQuery={(q) => handleFilterChange({ searchQuery: q })}
        selectedCategory={filterState.category}
        setSelectedCategory={(cat) => handleFilterChange({ category: cat })}
        cartItems={cartItems}
        onOpenCartDrawer={() => setIsCartDrawerOpen(true)}
        allProducts={PRODUCTS_DATABASE}
        onSelectSearchProduct={(prod) => {
          handleFilterChange({ searchQuery: '' });
          handleAddToCart(prod);
          setIsCartDrawerOpen(true);
        }}
      />

      {/* Secondary Strip Nav */}
      <SecondaryNav
        activeCategory={filterState.category}
        onSelectCategory={(cat) => handleFilterChange({ category: cat })}
        onScrollToSection={() => {}}
      />

      <div className="max-w-7xl mx-auto px-4 py-4 w-full flex-1">
        
        {/* 1. Top Context & Breadcrumbs Bar */}
        <div className="mb-4">
          <nav className="flex items-center gap-1 text-xs text-slate-500 font-medium mb-2">
            <a href="/" className="hover:text-slate-900 transition">Home</a>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <a href="#" className="hover:text-slate-900 transition">Hardware & Upgrades</a>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-900 font-bold">{filterState.category}</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>{filterState.category === 'All Categories' ? 'IT Hardware & Parts Catalog' : filterState.category}</span>
                <span className="bg-amber-400 text-slate-950 text-xs font-black px-2.5 py-0.5 rounded-full">
                  Showing {paginatedProducts.length} of {totalItems} Products
                </span>
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Blinkit 2-Hour Express Delivery in MIDC Ahilyanagar • GST Tax Invoice Included
              </p>
            </div>
          </div>

          {/* Quick Category Pill Strip */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-3 border-b border-slate-200">
            {quickPills.map((pill, idx) => {
              const isSelected = filterState.category === pill.category && (!pill.capacity || filterState.capacities.includes(pill.capacity));

              return (
                <button
                  key={idx}
                  onClick={() => {
                    handleFilterChange({
                      category: pill.category,
                      capacities: pill.capacity ? [pill.capacity] : [],
                      formFactors: pill.formFactor ? [pill.formFactor] : [],
                    });
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap transition active:scale-95 shrink-0 ${
                    isSelected
                      ? 'bg-slate-950 text-amber-400 shadow-md ring-2 ring-slate-800'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2 & 3. Main Content: Sidebar + Sorting & Grid */}
        <div className="flex gap-6 items-start">
          
          {/* Left Column: Filter Sidebar */}
          <PlpFilterSidebar
            filterState={filterState}
            onFilterChange={handleFilterChange}
            onClearAll={handleClearAll}
            brandCounts={brandCounts}
            totalProductsCount={PRODUCTS_DATABASE.length}
            isOpenMobileDrawer={isMobileFilterOpen}
            onCloseMobileDrawer={() => setIsMobileFilterOpen(false)}
          />

          {/* Right Column: Controls & Product Cards */}
          <div className="flex-1 space-y-4 min-w-0">
            
            {/* Top Control Bar (Mobile Filters, View Toggle, Sort) */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-3">
              
              {/* Mobile Filter Trigger Button */}
              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden flex items-center gap-1.5 bg-slate-900 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow transition active:scale-95"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters</span>
              </button>

              {/* View Toggle Buttons */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                    viewMode === 'grid'
                      ? 'bg-white text-slate-900 shadow'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Grid View"
                >
                  <Grid className="w-4 h-4" />
                  <span className="hidden sm:inline">Grid</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                    viewMode === 'list'
                      ? 'bg-white text-slate-900 shadow'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="List View"
                >
                  <List className="w-4 h-4" />
                  <span className="hidden sm:inline">List</span>
                </button>
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-500 hidden sm:inline">Sort By:</label>
                <div className="relative">
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value as SortOption)}
                    className="bg-white border border-slate-300 text-slate-800 text-xs font-bold py-1.5 px-3 rounded-xl outline-none focus:border-amber-400 cursor-pointer shadow-sm"
                  >
                    <option value="featured">Featured & Recommended</option>
                    <option value="price-low-high">Price: Low to High</option>
                    <option value="price-high-low">Price: High to Low</option>
                    <option value="rating-high-low">Customer Rating</option>
                    <option value="newest">Newest Arrivals</option>
                  </select>
                </div>
              </div>

            </div>

            {/* Product Cards Grid / List */}
            {paginatedProducts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
                <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                  🔍
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900">No Matching Hardware Found</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Try adjusting your price filters, selecting different brands, or clearing active search terms.
                  </p>
                </div>
                <button
                  onClick={handleClearAll}
                  className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl shadow transition"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
                    : 'space-y-4'
                }
              >
                {paginatedProducts.map((product) => {
                  const cartQty = cartItems.find((i) => i.product.id === product.id)?.quantity || 0;

                  return (
                    <ProductCard
                      key={product.id}
                      product={product}
                      viewMode={viewMode}
                      cartQuantity={cartQty}
                      onAddToCart={handleAddToCart}
                      onUpdateQuantity={handleUpdateQuantity}
                      onBuyNow={handleBuyNow}
                    />
                  );
                })}
              </div>
            )}

            {/* 6. Pagination & Indicator */}
            {totalPages > 1 && (
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                <div className="text-xs text-slate-500 font-medium">
                  Showing <strong className="text-slate-900">{paginatedProducts.length}</strong> of{' '}
                  <strong className="text-slate-900">{totalItems}</strong> items
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`w-8 h-8 rounded-xl text-xs font-extrabold transition ${
                        currentPage === p
                          ? 'bg-slate-950 text-amber-400 shadow-md'
                          : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {p}
                    </button>
                  ))}

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Trust Strip */}
      <Footer />

      {/* Floating Mobile Cart Bar */}
      <MobileCartBar
        cartItems={cartItems}
        onOpenCartDrawer={() => setIsCartDrawerOpen(true)}
      />

      {/* Cart Drawer & Location Modals */}
      <CartDrawer />

      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentLocation={location}
        onSelectLocation={(loc) => {
          setLocation(loc);
          showToast(`Location set to ${loc.area}`);
        }}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-16 lg:bottom-6 right-6 z-50 bg-[#0F172A] text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-toast">
          <div className="w-7 h-7 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold shrink-0">
            <Check className="w-4 h-4 stroke-[3]" />
          </div>
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

    </main>
  );
}

export default function PlpPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center font-bold">Loading Product Catalog...</div>}>
      <PlpContent />
    </Suspense>
  );
}
