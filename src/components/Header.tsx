import React, { useState } from 'react';
import {
  Search,
  ShoppingBag,
  Heart,
  SlidersHorizontal,
  Menu,
  X,
  Truck,
  ShieldCheck,
  User as UserIcon,
  HelpCircle,
  Sparkles,
  Mic
} from 'lucide-react';
import { StoreSettings, Category, Product } from '../types/index.ts';

interface HeaderProps {
  settings: StoreSettings;
  categories: Category[];
  cartCount: number;
  cartTotal: number;
  wishlistCount: number;
  compareCount: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenCompare: () => void;
  onOpenTracking: () => void;
  onOpenPolicy: (slug: string) => void;
  onSelectCategory: (categoryName: string | null) => void;
  selectedCategory: string | null;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenAdmin: () => void;
  onOpenShop: () => void;
  onOpenAccount: () => void;
  onOpenChatbot?: () => void;
  onOpenLiveVoice?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  categories,
  cartCount,
  cartTotal,
  wishlistCount,
  compareCount,
  onOpenCart,
  onOpenWishlist,
  onOpenCompare,
  onOpenTracking,
  onOpenPolicy,
  onSelectCategory,
  selectedCategory,
  searchQuery,
  onSearchChange,
  onOpenAdmin,
  onOpenShop,
  onOpenAccount,
  onOpenChatbot,
  onOpenLiveVoice
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(settings.isAnnouncementBarActive);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      {/* Announcement Bar */}
      {showAnnouncement && settings.announcementBarText && (
        <div className="bg-slate-900 text-white text-xs py-2 px-4 flex items-center justify-between text-center font-medium">
          <div className="flex-1 flex items-center justify-center gap-2">
            <span className="truncate">{settings.announcementBarText}</span>
          </div>
          <button
            onClick={() => setShowAnnouncement(false)}
            className="text-slate-400 hover:text-white ml-2 p-0.5 rounded cursor-pointer"
            aria-label="Dismiss announcement"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Navigation - Follows Top Bar Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-18">
          
          {/* Zone 1: Single Brand Wordmark / Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                onSelectCategory(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-left cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors whitespace-nowrap">
                  {settings.logoText || 'Tara Gadgets'}
                </span>
                <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded">
                  BD
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Search Input and Quick Category Links */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search earbuds, watches, chargers, SKU..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Nav Links for Desktop */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-700">
            <button
              onClick={() => {
                onSelectCategory(null);
                onOpenShop();
              }}
              className={`hover:text-blue-600 transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategory === null ? 'text-blue-600 font-semibold' : ''
              }`}
            >
              All Gadgets
            </button>
            <button
              onClick={onOpenTracking}
              className="hover:text-blue-600 transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer text-slate-600"
            >
              <Truck className="w-4 h-4 text-slate-400" />
              Track Order
            </button>
            <button
              onClick={() => onOpenPolicy('warranty-policy')}
              className="hover:text-blue-600 transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer text-slate-600"
            >
              <ShieldCheck className="w-4 h-4 text-slate-400" />
              Warranty
            </button>
            <button
              onClick={onOpenAdmin}
              className="text-xs font-semibold text-slate-500 hover:text-blue-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-md transition-colors whitespace-nowrap cursor-pointer"
            >
              Admin Portal
            </button>
          </nav>

          {/* Zone 3: Actions (Compare, Wishlist, Cart, Mobile Menu) */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setShowSearchInput(!showSearchInput)}
              className="lg:hidden p-2 text-slate-600 hover:text-blue-600 cursor-pointer"
              aria-label="Toggle search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Compare Button */}
            <button
              onClick={onOpenCompare}
              className="relative p-2 text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
              title="Compare Products"
              aria-label="Compare"
            >
              <SlidersHorizontal className="w-5 h-5" />
              {compareCount > 0 && (
                <span className="absolute top-1 right-1 bg-blue-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {compareCount}
                </span>
              )}
            </button>

            {/* Wishlist Button */}
            <button
              onClick={onOpenWishlist}
              className="relative p-2 text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
              title="Wishlist"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Tara AI Concierge Button */}
            {onOpenChatbot && (
              <button
                onClick={onOpenChatbot}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold border border-blue-200 transition-colors cursor-pointer"
                title="Tara AI Tech Assistant"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>AI Concierge</span>
              </button>
            )}

            {/* Live Voice Button */}
            {onOpenLiveVoice && (
              <button
                onClick={onOpenLiveVoice}
                className="p-2 text-slate-600 hover:text-blue-600 transition-colors cursor-pointer relative"
                title="Real-time Live Voice (Gemini 3.8 Live)"
                aria-label="Live Voice"
              >
                <Mic className="w-5 h-5 text-blue-600" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              </button>
            )}

            {/* Firebase Account & Auth Button */}
            <button
              onClick={onOpenAccount}
              className="p-2 text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
              title="Account & Authentication"
              aria-label="Account"
            >
              <UserIcon className="w-5 h-5" />
            </button>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="flex items-center gap-2.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-lg font-medium text-sm transition-all shadow-sm cursor-pointer"
              aria-label="Shopping Cart"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-amber-400 text-slate-900 text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline tabular-nums">
                ৳{cartTotal.toLocaleString()}
              </span>
            </button>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 cursor-pointer"
              aria-label="Open menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar Expansion */}
        {showSearchInput && (
          <div className="lg:hidden pb-3 pt-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products, brands, models..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>
        )}
      </div>

      {/* Subcategory Strip (Single-line horizontal scroll) */}
      <div className="bg-slate-50 border-t border-slate-200 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-6 py-2.5 text-xs font-semibold whitespace-nowrap">
          <button
            onClick={() => onSelectCategory(null)}
            className={`cursor-pointer transition-colors ${
              selectedCategory === null ? 'text-blue-600 underline underline-offset-4' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.name)}
              className={`cursor-pointer transition-colors ${
                selectedCategory === cat.name ? 'text-blue-600 underline underline-offset-4' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-4 pb-6 space-y-4 shadow-xl">
          <div className="space-y-1">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">Categories</div>
            <button
              onClick={() => {
                onSelectCategory(null);
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100 rounded-md"
            >
              All Products
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  onSelectCategory(cat.name);
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100 rounded-md"
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-3 space-y-2">
            <button
              onClick={() => {
                onOpenTracking();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm font-medium text-slate-700 flex items-center gap-2"
            >
              <Truck className="w-4 h-4 text-slate-400" />
              Track Order (Bangladesh)
            </button>
            <button
              onClick={() => {
                onOpenPolicy('warranty-policy');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm font-medium text-slate-700 flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-slate-400" />
              Warranty & Guarantee Policy
            </button>
            <button
              onClick={() => {
                onOpenPolicy('delivery-policy');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm font-medium text-slate-700 flex items-center gap-2"
            >
              <HelpCircle className="w-4 h-4 text-slate-400" />
              Delivery & Shipping Policy
            </button>
            {onOpenChatbot && (
              <button
                onClick={() => {
                  onOpenChatbot();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm font-semibold text-blue-700 bg-blue-50/80 hover:bg-blue-100 rounded-md flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Tara AI Tech Concierge</span>
              </button>
            )}
            {onOpenLiveVoice && (
              <button
                onClick={() => {
                  onOpenLiveVoice();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm font-semibold text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100 rounded-md flex items-center gap-2"
              >
                <Mic className="w-4 h-4 text-indigo-600" />
                <span>Tara Live Voice Conversation</span>
              </button>
            )}
            <button
              onClick={() => {
                onOpenAccount();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100 rounded-md flex items-center gap-2"
            >
              <UserIcon className="w-4 h-4 text-blue-600" />
              <span>Firebase Account & Sign In</span>
            </button>
            <button
              onClick={() => {
                onOpenAdmin();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm font-semibold text-blue-700 bg-blue-50 rounded-md"
            >
              Admin Dashboard Login
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
