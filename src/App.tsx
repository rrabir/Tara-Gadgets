import React, { useState, useEffect } from 'react';
import {
  Header
} from './components/Header.tsx';
import {
  Footer
} from './components/Footer.tsx';
import {
  ProductCard
} from './components/ProductCard.tsx';
import {
  ProductDetailModal
} from './components/ProductDetailModal.tsx';
import {
  CartDrawer
} from './components/CartDrawer.tsx';
import {
  CheckoutModal
} from './components/CheckoutModal.tsx';
import {
  OrderTrackingModal
} from './components/OrderTrackingModal.tsx';
import {
  CompareModal
} from './components/CompareModal.tsx';
import {
  WishlistDrawer
} from './components/WishlistDrawer.tsx';
import {
  PolicyModal
} from './components/PolicyModal.tsx';
import {
  AdminDashboard
} from './components/AdminDashboard.tsx';
import {
  AccountModal
} from './components/AccountModal.tsx';
import {
  GeminiChatbotModal
} from './components/GeminiChatbotModal.tsx';
import {
  LiveVoiceModal
} from './components/LiveVoiceModal.tsx';
import {
  SeoHead
} from './components/SeoHead.tsx';
import {
  HeroShowcase
} from './components/HeroShowcase.tsx';
import {
  PerksStrip
} from './components/PerksStrip.tsx';
import {
  FlashDealsSection
} from './components/FlashDealsSection.tsx';
import {
  CategoryVisualGrid
} from './components/CategoryVisualGrid.tsx';
import {
  PromoBanners
} from './components/PromoBanners.tsx';
import { useToast } from './context/ToastContext.tsx';
import { firestoreService } from './services/firebase.ts';
import {
  Product,
  Category,
  Brand,
  CartItem,
  DeliveryZone,
  StoreSettings,
  ContentPage,
  Order,
  ProductVariant
} from './types/index.ts';
import { api } from './services/api.ts';
import {
  INITIAL_SETTINGS,
  INITIAL_CATEGORIES,
  INITIAL_DELIVERY_ZONES,
  INITIAL_PAGES
} from '../data/initial-data.ts';
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  Sparkles,
  SlidersHorizontal,
  RotateCcw,
  Headphones,
  Watch,
  Zap,
  BatteryCharging,
  Cable,
  Mic
} from 'lucide-react';

export default function App() {
  const toast = useToast();

  // Store Data States
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_SETTINGS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>(INITIAL_DELIVERY_ZONES);
  const [pages, setPages] = useState<ContentPage[]>(INITIAL_PAGES);
  const [loading, setLoading] = useState(true);

  // Filter & Search States
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterInStock, setFilterInStock] = useState(false);
  const [sortOption, setSortOption] = useState('newest');
  const [activeCatalogTab, setActiveCatalogTab] = useState<'all' | 'featured' | 'new' | 'bestsellers'>('all');

  // Customer Shopping States (Cart, Wishlist, Compare)
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('tg_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlistProductIds, setWishlistProductIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('tg_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [compareProductIds, setCompareProductIds] = useState<string[]>([]);
  const [appliedCouponCode, setAppliedCouponCode] = useState('');
  const [appliedCouponDiscount, setAppliedCouponDiscount] = useState(0);

  // Modal Visibility States
  const [activeProductDetail, setActiveProductDetail] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [trackingOrderNumber, setTrackingOrderNumber] = useState('');
  const [trackingPhone, setTrackingPhone] = useState('');
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isPolicyOpen, setIsPolicyOpen] = useState(false);
  const [activePolicySlug, setActivePolicySlug] = useState('delivery-policy');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [isLiveVoiceOpen, setIsLiveVoiceOpen] = useState(false);

  // Save Cart & Wishlist to localStorage for convenience
  useEffect(() => {
    try {
      localStorage.setItem('tg_cart', JSON.stringify(cartItems));
    } catch {}
  }, [cartItems]);

  useEffect(() => {
    try {
      localStorage.setItem('tg_wishlist', JSON.stringify(wishlistProductIds));
    } catch {}
  }, [wishlistProductIds]);

  // Initial Data Fetch from Server
  const loadStoreData = async () => {
    setLoading(true);
    try {
      const [fetchedSettings, fetchedCats, fetchedBrands, fetchedProds, fetchedZones, fetchedPages] =
        await Promise.all([
          api.getSettings().catch(() => INITIAL_SETTINGS),
          api.getCategories().catch(() => INITIAL_CATEGORIES),
          api.getBrands().catch(() => []),
          api.getProducts().catch(() => []),
          api.getDeliveryZones().catch(() => INITIAL_DELIVERY_ZONES),
          api.getPages().catch(() => INITIAL_PAGES)
        ]);

      setSettings(fetchedSettings);
      setCategories(fetchedCats);
      setBrands(fetchedBrands);
      setProducts(fetchedProds);
      setDeliveryZones(fetchedZones);
      setPages(fetchedPages);

      // Deep link support: auto-open product with dynamic SEO if ?product=<slug> is in URL
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const slug = params.get('product');
        if (slug) {
          const matched = fetchedProds.find((p) => p.slug === slug || p.id === slug);
          if (matched) {
            setActiveProductDetail(matched);
          }
        }
      }
    } catch (err) {
      console.error('Error loading store data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStoreData();
  }, []);

  // Synchronize product detail selection with browser history & dynamic SEO
  const handleSelectProduct = (product: Product | null) => {
    setActiveProductDetail(product);
    if (typeof window !== 'undefined') {
      if (product) {
        const newUrl = `${window.location.pathname}?product=${product.slug}`;
        window.history.replaceState({ product: product.slug }, '', newUrl);
      } else {
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  };

  // Cart Handlers
  const handleAddToCart = (product: Product, variant?: ProductVariant, qty: number = 1) => {
    const price = variant?.salePrice || variant?.price || product.salePrice || product.regularPrice;

    setCartItems((prev) => {
      const variantId = variant?.id;
      const existingIndex = prev.findIndex(
        (i) => i.productId === product.id && i.variantId === variantId
      );

      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex].quantity += qty;
        return next;
      } else {
        return [
          ...prev,
          {
            productId: product.id,
            product,
            variantId,
            variantName: variant?.name,
            quantity: qty,
            unitPrice: price
          }
        ];
      }
    });

    // Real-time Toast Notification in corner
    toast.cart(
      'Added to Shopping Bag',
      `${product.name}${variant ? ` (${variant.name})` : ''} · ৳${price.toLocaleString()}`,
      product.coverImage || product.images[0],
      () => setIsCartOpen(true)
    );
  };

  const handleBuyNow = (product: Product, variant?: ProductVariant, qty: number = 1) => {
    handleAddToCart(product, variant, qty);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleUpdateCartQuantity = (productId: string, variantId: string | undefined, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.productId === productId && item.variantId === variantId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveCartItem = (productId: string, variantId: string | undefined) => {
    setCartItems((prev) =>
      prev.filter((i) => !(i.productId === productId && i.variantId === variantId))
    );
    toast.info('Item Removed', 'The item was removed from your shopping bag.');
  };

  const handleApplyCoupon = (code: string) => {
    setAppliedCouponCode(code);
    if (code === 'TARA100') {
      setAppliedCouponDiscount(100);
      toast.success('Coupon Applied', '৳100 discount applied to your order.');
    } else if (code === 'WELCOME5') {
      const subtotal = cartItems.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
      const disc = Math.round((subtotal * 5) / 100);
      setAppliedCouponDiscount(disc);
      toast.success('Coupon Applied', `5% discount (৳${disc.toLocaleString()}) applied.`);
    } else {
      toast.error('Invalid Coupon Code', `"${code}" is not valid or has expired.`);
    }
  };

  // Wishlist Handlers
  const handleToggleWishlist = (product: Product) => {
    const isNowWishlisted = !wishlistProductIds.includes(product.id);
    setWishlistProductIds((prev) =>
      isNowWishlisted ? [...prev, product.id] : prev.filter((id) => id !== product.id)
    );

    if (isNowWishlisted) {
      toast.showToast({
        type: 'wishlist',
        title: 'Saved to Wishlist',
        message: `${product.name} saved for quick access.`,
        imageUrl: product.coverImage || product.images[0],
        actionText: 'View Wishlist',
        onAction: () => setIsWishlistOpen(true)
      });
    } else {
      toast.info('Removed from Wishlist', product.name);
    }
  };

  // Compare Handlers
  const handleToggleCompare = (product: Product) => {
    if (!compareProductIds.includes(product.id)) {
      if (compareProductIds.length >= 4) {
        toast.error('Comparison Limit', 'You can compare up to 4 gadgets at once.');
        return;
      }
      setCompareProductIds((prev) => [...prev, product.id]);
      toast.showToast({
        type: 'info',
        title: 'Added to Comparison',
        message: `${product.name} (${compareProductIds.length + 1} of 4 items)`,
        actionText: 'Compare Now',
        onAction: () => setIsCompareOpen(true)
      });
    } else {
      setCompareProductIds((prev) => prev.filter((id) => id !== product.id));
      toast.info('Removed from Comparison', product.name);
    }
  };

  // Filter products for storefront view
  let displayedProducts = products.filter((p) => {
    // Category filter
    if (selectedCategory && p.category !== selectedCategory) return false;
    // Brand filter
    if (selectedBrand && p.brand !== selectedBrand) return false;
    // In-stock filter
    if (filterInStock && p.stock <= 0) return false;
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const match =
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      if (!match) return false;
    }
    // Tab filter
    if (activeCatalogTab === 'featured' && !p.isFeatured) return false;
    if (activeCatalogTab === 'new' && !p.isNewArrival) return false;
    if (activeCatalogTab === 'bestsellers' && (p.salesCount || 0) < 15) return false;

    return true;
  });

  // Sort
  if (sortOption === 'price-low') {
    displayedProducts.sort((a, b) => (a.salePrice || a.regularPrice) - (b.salePrice || b.regularPrice));
  } else if (sortOption === 'price-high') {
    displayedProducts.sort((a, b) => (b.salePrice || b.regularPrice) - (a.salePrice || a.regularPrice));
  } else if (sortOption === 'popular') {
    displayedProducts.sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0));
  }

  const wishlistedProducts = products.filter((p) => wishlistProductIds.includes(p.id));
  const comparedProducts = products.filter((p) => compareProductIds.includes(p.id));
  const cartTotal = cartItems.reduce((s, i) => s + i.unitPrice * i.quantity, 0);

  // Category Icon Resolver
  const getCategoryIcon = (name: string) => {
    if (name.includes('Audio') || name.includes('Earbuds')) return <Headphones className="w-5 h-5 text-blue-600" />;
    if (name.includes('Watch')) return <Watch className="w-5 h-5 text-blue-600" />;
    if (name.includes('Charger')) return <Zap className="w-5 h-5 text-blue-600" />;
    if (name.includes('Power')) return <BatteryCharging className="w-5 h-5 text-blue-600" />;
    return <Cable className="w-5 h-5 text-blue-600" />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      
      {/* Dynamic SEO Meta Tags, Social OpenGraph Cards & Schema.org JSON-LD */}
      <SeoHead product={activeProductDetail} settings={settings} />

      {/* Top Header */}
      <Header
        settings={settings}
        categories={categories}
        cartCount={cartItems.reduce((s, i) => s + i.quantity, 0)}
        cartTotal={cartTotal}
        wishlistCount={wishlistProductIds.length}
        compareCount={compareProductIds.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenCompare={() => setIsCompareOpen(true)}
        onOpenTracking={() => {
          setTrackingOrderNumber('');
          setTrackingPhone('');
          setIsTrackingOpen(true);
        }}
        onOpenPolicy={(slug) => {
          setActivePolicySlug(slug);
          setIsPolicyOpen(true);
        }}
        onSelectCategory={(cat) => setSelectedCategory(cat)}
        selectedCategory={selectedCategory}
        searchQuery={searchQuery}
        onSearchChange={(q) => setSearchQuery(q)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenAccount={() => setIsAccountOpen(true)}
        onOpenChatbot={() => setIsChatbotOpen(true)}
        onOpenLiveVoice={() => setIsLiveVoiceOpen(true)}
        onOpenShop={() => {
          const el = document.getElementById('shop-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      <main className="flex-1">
        {/* Full Eye-Catching Classic Homepage Showcase when no active search/category filter */}
        {!selectedCategory && !searchQuery && (
          <>
            {/* 1. Flagship Hero Carousel */}
            <HeroShowcase
              products={products}
              onSelectProduct={(p) => handleSelectProduct(p)}
              onAddToCart={(p) => handleAddToCart(p)}
              onOpenShop={() => {
                const el = document.getElementById('shop-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            {/* 2. Colorful Service Perks Strip */}
            <PerksStrip />

            {/* 3. Flash Deals & Steals of the Day with Countdown */}
            <FlashDealsSection
              products={products}
              onSelectProduct={(p) => handleSelectProduct(p)}
              onAddToCart={(p) => handleAddToCart(p)}
              onToggleWishlist={(p) => handleToggleWishlist(p)}
              wishlistProductIds={wishlistProductIds}
            />

            {/* 4. Vivid "Shop by Universe" Visual Category Grid */}
            <CategoryVisualGrid
              categories={categories}
              products={products}
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => setSelectedCategory(cat)}
            />

            {/* 5. Eye-Catching Dual Promotional Banners */}
            <PromoBanners
              onSelectCategory={(cat) => setSelectedCategory(cat)}
            />
          </>
        )}

        {/* Filter Breadcrumb when category or search is active */}
        {(selectedCategory || searchQuery) && (
          <div className="bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50 py-6 border-b border-blue-100 text-slate-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">
                  Filtered Catalog
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                  {selectedCategory ? `${selectedCategory}` : `Search Results for "${searchQuery}"`}
                </h1>
              </div>
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setSearchQuery('');
                }}
                className="text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Reset to Full Homepage ✕
              </button>
            </div>
          </div>
        )}

        {/* Main Product Shop & Catalog Section */}
        <section id="shop-section" className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Shop Control Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {selectedCategory ? `${selectedCategory}` : searchQuery ? `Search: "${searchQuery}"` : 'All Tech & Gadgets'}
              </h2>
              <div className="text-xs text-slate-500 mt-0.5">
                Showing {displayedProducts.length} authentic gadgets available for Cash on Delivery across Bangladesh
              </div>
            </div>

            {/* Segmented Colorful Tab Controls */}
            <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-xl shadow-xs text-xs font-bold overflow-x-auto">
              <button
                onClick={() => setActiveCatalogTab('all')}
                className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeCatalogTab === 'all'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span>⚡ All</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeCatalogTab === 'all' ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>
                  {products.length}
                </span>
              </button>
              <button
                onClick={() => setActiveCatalogTab('featured')}
                className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeCatalogTab === 'featured'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span>⭐ Featured Deals</span>
              </button>
              <button
                onClick={() => setActiveCatalogTab('bestsellers')}
                className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeCatalogTab === 'bestsellers'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span>🔥 Bestsellers</span>
              </button>
              <button
                onClick={() => setActiveCatalogTab('new')}
                className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeCatalogTab === 'new'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span>✨ New Arrivals</span>
              </button>
            </div>
          </div>

          {/* Filter Bar (Sort, Availability, Brand) */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 mb-6 text-xs">
            {/* Left Filter options */}
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 select-none">
                <input
                  type="checkbox"
                  checked={filterInStock}
                  onChange={(e) => setFilterInStock(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>In Stock Only</span>
              </label>

              {brands.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  <span className="text-slate-400 font-bold text-[11px] uppercase mr-1">Brand:</span>
                  <button
                    onClick={() => setSelectedBrand(null)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                      !selectedBrand ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    All
                  </button>
                  {brands.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => setSelectedBrand(selectedBrand === b.name ? null : b.name)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors whitespace-nowrap ${
                        selectedBrand === b.name
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Sorting */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Sort By:</span>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 font-medium"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="popular">Most Popular (Actual Sales)</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {displayedProducts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <SlidersHorizontal className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No matching gadgets found</h3>
              <p className="text-xs text-slate-500">
                Try adjusting your search keywords or resetting your category filters.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setSelectedBrand(null);
                  setSearchQuery('');
                  setFilterInStock(false);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {displayedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={(p) => handleSelectProduct(p)}
                  onAddToCart={(p) => handleAddToCart(p)}
                  onToggleWishlist={(p) => handleToggleWishlist(p)}
                  isWishlisted={wishlistProductIds.includes(product.id)}
                  onToggleCompare={(p) => handleToggleCompare(p)}
                  isCompared={compareProductIds.includes(product.id)}
                />
              ))}
            </div>
          )}
        </section>

      </main>

      {/* Footer */}
      <Footer
        settings={settings}
        onOpenPolicy={(slug) => {
          setActivePolicySlug(slug);
          setIsPolicyOpen(true);
        }}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          const el = document.getElementById('shop-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={activeProductDetail}
        relatedProducts={
          activeProductDetail
            ? products.filter(
                (p) =>
                  p.id !== activeProductDetail.id &&
                  (p.category === activeProductDetail.category || p.brand === activeProductDetail.brand)
              ).slice(0, 4)
            : []
        }
        onClose={() => handleSelectProduct(null)}
        onAddToCart={(p, v, q) => handleAddToCart(p, v, q)}
        onBuyNow={(p, v, q) => handleBuyNow(p, v, q)}
        onToggleWishlist={(p) => handleToggleWishlist(p)}
        isWishlisted={activeProductDetail ? wishlistProductIds.includes(activeProductDetail.id) : false}
        onToggleCompare={(p) => handleToggleCompare(p)}
        isCompared={activeProductDetail ? compareProductIds.includes(activeProductDetail.id) : false}
        onSelectProduct={(p) => handleSelectProduct(p)}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        couponCode={appliedCouponCode}
        onApplyCoupon={handleApplyCoupon}
        couponDiscount={appliedCouponDiscount}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        deliveryZones={deliveryZones}
        initialCouponCode={appliedCouponCode}
        onOrderSuccess={(order) => {
          // Clear cart on successful order
          setCartItems([]);
          loadStoreData();

          // Sync order to Cloud Firestore
          firestoreService.saveOrder(order).catch(() => {});

          // Real-time Order Toast Notification
          toast.order(
            `Order Confirmed: ${order.orderNumber}`,
            `Total: ৳${order.total.toLocaleString()} via Cash on Delivery. Dispatched to ${order.address.district}.`,
            () => {
              setTrackingOrderNumber(order.orderNumber);
              setTrackingPhone(order.address.phone);
              setIsTrackingOpen(true);
            }
          );
        }}
        onTrackOrder={(ordNum, ph) => {
          setIsCheckoutOpen(false);
          setTrackingOrderNumber(ordNum);
          setTrackingPhone(ph);
          setIsTrackingOpen(true);
        }}
      />

      {/* Order Tracking Modal */}
      <OrderTrackingModal
        isOpen={isTrackingOpen}
        onClose={() => setIsTrackingOpen(false)}
        initialOrderNumber={trackingOrderNumber}
        initialPhone={trackingPhone}
      />

      {/* Product Comparison Modal */}
      <CompareModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        products={comparedProducts}
        onRemove={(id) => setCompareProductIds((prev) => prev.filter((i) => i !== id))}
        onAddToCart={(p) => handleAddToCart(p)}
        onClearAll={() => setCompareProductIds([])}
      />

      {/* Wishlist Drawer */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        products={wishlistedProducts}
        onRemove={(id) => setWishlistProductIds((prev) => prev.filter((i) => i !== id))}
        onAddToCart={(p) => handleAddToCart(p)}
      />

      {/* Policy and Info Modal */}
      <PolicyModal
        isOpen={isPolicyOpen}
        onClose={() => setIsPolicyOpen(false)}
        pages={pages}
        activeSlug={activePolicySlug}
        onSelectSlug={(slug) => setActivePolicySlug(slug)}
        settings={settings}
      />

      {/* Admin Dashboard */}
      <AdminDashboard
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        settings={settings}
        onUpdateSettings={async (newSet) => {
          const updated = await api.updateSettings(newSet);
          setSettings(updated);
        }}
        categories={categories}
        brands={brands}
        onRefreshData={loadStoreData}
      />

      {/* Firebase Account Modal */}
      <AccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenTracking={() => setIsTrackingOpen(true)}
      />

      {/* Gemini Multi-turn Chatbot Modal */}
      <GeminiChatbotModal
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
        onOpenLiveVoice={() => setIsLiveVoiceOpen(true)}
      />

      {/* Gemini Live API Real-Time Voice Modal */}
      <LiveVoiceModal
        isOpen={isLiveVoiceOpen}
        onClose={() => setIsLiveVoiceOpen(false)}
        onOpenChatbot={() => setIsChatbotOpen(true)}
      />

      {/* Floating Tara AI Assistant & Live Voice Action Widget */}
      <div className="fixed bottom-6 right-6 z-30 flex flex-col items-end gap-2.5 pointer-events-auto">
        {/* Live Voice quick button */}
        <button
          onClick={() => setIsLiveVoiceOpen(true)}
          className="flex items-center gap-2 bg-slate-900/95 hover:bg-slate-900 text-white pl-3.5 pr-4 py-2 rounded-full shadow-lg border border-slate-700/80 transition-all hover:scale-105 cursor-pointer backdrop-blur-xs group"
          title="Start real-time voice call with Tara (Gemini 3.8 Live)"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <Mic className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-semibold tracking-tight">Live Voice</span>
        </button>

        {/* AI Concierge Chatbot Button */}
        <button
          onClick={() => setIsChatbotOpen(true)}
          className="flex items-center gap-2.5 bg-blue-600 hover:bg-blue-700 text-white pl-3 pr-4 py-2.5 rounded-full shadow-xl shadow-blue-600/30 transition-all hover:scale-105 cursor-pointer group border border-blue-400/30"
          title="Chat with Tara AI Concierge"
        >
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white group-hover:rotate-12 transition-transform" />
          </div>
          <span className="text-xs font-bold tracking-tight">Tara AI Concierge</span>
        </button>
      </div>

    </div>
  );
}
