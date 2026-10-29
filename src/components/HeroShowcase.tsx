import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Truck,
  Zap,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  BatteryCharging,
  Headphones,
  Watch,
  Flame,
  ShoppingBag
} from 'lucide-react';
import { Product } from '../types/index.ts';

interface HeroShowcaseProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onOpenShop: () => void;
}

interface HeroSlide {
  productId: string;
  badge: string;
  badgeColor: string;
  themeColor: string;
  gradientText: string;
  title: string;
  subtitle: string;
  image: string;
  fallbackImage: string;
  highlights: string[];
  regularPrice: number;
  salePrice: number;
  dotColor: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    productId: 'prod-1',
    badge: '🔥 BESTSELLING AUDIO FLAGSHIP',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    themeColor: 'from-blue-200/50 via-sky-100/40 to-transparent',
    gradientText: 'from-slate-950 via-blue-900 to-indigo-950',
    title: 'Aura Sound Pro ANC Wireless Earbuds',
    subtitle: '42dB Hybrid Active Noise Cancellation engineered to silence noisy traffic and busy rooms. Up to 40 hours of playtime with deep bass.',
    image: '/src/assets/images/gadget_anc_earbuds_1793251027311.jpg',
    fallbackImage: '/src/assets/images/gadget_anc_earbuds_1793251027311.jpg',
    highlights: ['42dB Hybrid Noise Cancellation', '40H Battery Life', '4-Mic Clear Voice ENC', 'Bluetooth 5.4 Low Latency'],
    regularPrice: 3850,
    salePrice: 3290,
    dotColor: 'bg-blue-600'
  },
  {
    productId: 'prod-2',
    badge: '⚡ PREMIUM WEARABLE TECH',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    themeColor: 'from-amber-200/50 via-orange-100/40 to-transparent',
    gradientText: 'from-slate-950 via-amber-950 to-orange-950',
    title: 'Apex Titan AMOLED Bluetooth Smartwatch',
    subtitle: 'Vivid 1.96-inch HD AMOLED display with 1000 nits brightness, titanium alloy body, and crisp Bluetooth calling with dial pad.',
    image: '/src/assets/images/gadget_smartwatch_ultra_1793251027897.jpg',
    fallbackImage: '/src/assets/images/gadget_smartwatch_ultra_1793251027897.jpg',
    highlights: ['1.96" HD AMOLED 60Hz', 'Hi-Fi Bluetooth Calling', 'IP68 Waterproof Titanium Body', '7-10 Days Battery'],
    regularPrice: 5200,
    salePrice: 4490,
    dotColor: 'bg-amber-600'
  },
  {
    productId: 'prod-3',
    badge: '⚡ NEXT-GEN GAN CHARGING',
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    themeColor: 'from-emerald-200/50 via-teal-100/40 to-transparent',
    gradientText: 'from-slate-950 via-emerald-950 to-teal-950',
    title: 'Zolt 65W GaN Dual USB-C Fast Charger',
    subtitle: 'Ultra-compact Gallium Nitride III powerhouse. Fast-charge laptops, MacBooks, iPhones, and Android devices simultaneously.',
    image: '/src/assets/images/gadget_fast_gan_charger_1793251028679.jpg',
    fallbackImage: '/src/assets/images/gadget_fast_gan_charger_1793251028679.jpg',
    highlights: ['65W Max Power Delivery', 'GaN III Cool Tech', 'Dual USB-C Simultaneous Fast Charge', 'Foldable Compact Pins'],
    regularPrice: 2800,
    salePrice: 2350,
    dotColor: 'bg-emerald-600'
  },
  {
    productId: 'prod-4',
    badge: '🔋 HIGH-CAPACITY BACKUP',
    badgeColor: 'bg-purple-50 text-purple-800 border-purple-200',
    themeColor: 'from-purple-200/50 via-indigo-100/40 to-transparent',
    gradientText: 'from-slate-950 via-purple-950 to-indigo-950',
    title: 'VoltMax 20000mAh 22.5W Fast Power Bank',
    subtitle: 'Heavy-duty 20,000mAh capacity with 22.5W Two-Way Fast Charge, real-time LED percentage display, and multi-device safety.',
    image: '/src/assets/images/gadget_powerbank_20000_1793251028329.jpg',
    fallbackImage: '/src/assets/images/gadget_powerbank_20000_1793251028329.jpg',
    highlights: ['20,000mAh Real Capacity', '22.5W Two-Way Quick Charge', 'Smart Digital Battery Display', 'Airline Approved'],
    regularPrice: 2950,
    salePrice: 2450,
    dotColor: 'bg-purple-600'
  }
];

export const HeroShowcase: React.FC<HeroShowcaseProps> = ({
  products,
  onSelectProduct,
  onAddToCart,
  onOpenShop
}) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto rotate slides every 6 seconds unless user is hovering/interacting
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const currentSlide = HERO_SLIDES[activeSlide];
  const matchingProduct = products.find((p) => p.id === currentSlide.productId) || products[0];

  const handlePrev = () => {
    setActiveSlide((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const savings = currentSlide.regularPrice - currentSlide.salePrice;
  const discountPercent = Math.round((savings / currentSlide.regularPrice) * 100);

  return (
    <section
      className="relative bg-gradient-to-b from-white via-slate-50/70 to-blue-50/30 text-slate-900 overflow-hidden border-b border-slate-200/80"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Soft Ambient Light Blurs & Grid Mesh */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-indigo-100/50 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-cyan-100/50 rounded-full blur-3xl" />
        {/* Crisp subtle tech grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0284c708_1px,transparent_1px),linear-gradient(to_bottom,#0284c708_1px,transparent_1px)] bg-[size:32px_32px] opacity-70" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 relative z-10">
        
        {/* Main Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Headlines, specs, pricing, CTAs */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Top pill badge */}
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide border uppercase ${currentSlide.badgeColor} shadow-2xs`}>
                <Sparkles className="w-3.5 h-3.5" />
                <span>{currentSlide.badge}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Cash on Delivery in 64 Districts</span>
              </span>
            </div>

            {/* Main Catchy Title */}
            <h1 className="text-3xl sm:text-5xl lg:text-5xl font-black tracking-tight leading-[1.12]">
              <span className={`bg-gradient-to-r ${currentSlide.gradientText} bg-clip-text text-transparent block`}>
                {currentSlide.title}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal max-w-xl">
              {currentSlide.subtitle}
            </p>

            {/* Key Specs Pills Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-2.5 max-w-lg pt-1">
              {currentSlide.highlights.map((spec, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 bg-white/90 border border-slate-200 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs hover:border-blue-300 hover:shadow-xs transition-all"
                >
                  <div className={`w-2 h-2 rounded-full ${currentSlide.dotColor} shrink-0`} />
                  <span className="truncate">{spec}</span>
                </div>
              ))}
            </div>

            {/* Price Showcase Tag */}
            <div className="pt-2 flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight tabular-nums">
                ৳{currentSlide.salePrice.toLocaleString()}
              </span>
              <span className="text-base text-slate-400 line-through tabular-nums font-medium">
                ৳{currentSlide.regularPrice.toLocaleString()}
              </span>
              <span className="bg-gradient-to-r from-rose-500 to-amber-500 text-white font-extrabold text-xs px-2.5 py-1 rounded-md shadow-xs tracking-wider uppercase">
                SAVE ৳{savings.toLocaleString()} (-{discountPercent}%)
              </span>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => {
                  if (matchingProduct) {
                    onAddToCart(matchingProduct);
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold px-6 py-3.5 rounded-xl shadow-lg shadow-blue-600/20 transition-all hover:scale-102 flex items-center gap-2 text-sm cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart (৳{currentSlide.salePrice.toLocaleString()})</span>
              </button>

              <button
                onClick={() => {
                  if (matchingProduct) {
                    onSelectProduct(matchingProduct);
                  } else {
                    onOpenShop();
                  }
                }}
                className="bg-white hover:bg-slate-50 text-slate-800 font-bold px-5 py-3.5 rounded-xl text-sm border border-slate-300/80 shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>View Full Specs</span>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            {/* Trust Points */}
            <div className="pt-5 grid grid-cols-3 gap-3 border-t border-slate-200/90 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                  <Truck className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-[12px]">All 64 Districts</div>
                  <div className="text-slate-500 text-[10px]">Nationwide COD</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-[12px]">24-48h Delivery</div>
                  <div className="text-slate-500 text-[10px]">Dhaka Express</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-[12px]">7-Day Replace</div>
                  <div className="text-slate-500 text-[10px]">Official Warranty</div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Hero Visual Product Display */}
          <div className="lg:col-span-5 relative">
            <div className="relative group">
              
              {/* Colorful Glow Underlay */}
              <div
                className={`absolute -inset-2 rounded-3xl bg-gradient-to-r ${currentSlide.themeColor} opacity-70 blur-2xl transition-all duration-700 group-hover:opacity-100`}
              />

              {/* Product Card Container */}
              <div className="relative rounded-3xl overflow-hidden border border-slate-200/90 bg-white shadow-xl shadow-slate-200/60 p-3 sm:p-4">
                
                {/* Floating Discount & Stock Tag */}
                <div className="absolute top-6 left-6 z-20 flex items-center gap-2">
                  <span className="bg-rose-600 text-white text-xs font-black px-2.5 py-1 rounded-lg shadow-sm uppercase tracking-wider">
                    {discountPercent}% OFF
                  </span>
                  <span className="bg-white/95 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-lg border border-emerald-200 shadow-xs backdrop-blur-xs flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    In Stock
                  </span>
                </div>

                {/* Main Product Photo Frame */}
                <div
                  className="aspect-4/3 w-full bg-gradient-to-b from-slate-50 to-slate-100/70 rounded-2xl overflow-hidden cursor-pointer relative"
                  onClick={() => {
                    if (matchingProduct) onSelectProduct(matchingProduct);
                  }}
                >
                  <img
                    src={currentSlide.image}
                    alt={currentSlide.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>

                {/* Bottom Overlay Info Banner */}
                <div className="mt-3 p-3.5 bg-slate-50/80 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                      Tara Certified Original Gadget
                    </div>
                    <div className="text-sm font-extrabold text-slate-900 truncate max-w-[210px] sm:max-w-[250px]">
                      {currentSlide.title}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (matchingProduct) onSelectProduct(matchingProduct);
                    }}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs whitespace-nowrap"
                  >
                    Quick View
                  </button>
                </div>

              </div>

              {/* Slider Arrow Controls */}
              <button
                onClick={handlePrev}
                className="absolute -left-3.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white hover:bg-slate-50 text-slate-700 hover:text-blue-600 border border-slate-200 flex items-center justify-center shadow-md transition-transform hover:scale-110 cursor-pointer z-20"
                aria-label="Previous Slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white hover:bg-slate-50 text-slate-700 hover:text-blue-600 border border-slate-200 flex items-center justify-center shadow-md transition-transform hover:scale-110 cursor-pointer z-20"
                aria-label="Next Slide"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Slide Switcher Tabs Strip */}
        <div className="mt-10 pt-6 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {HERO_SLIDES.map((slide, idx) => {
            const isActive = activeSlide === idx;
            return (
              <button
                key={idx}
                onClick={() => setActiveSlide(idx)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 relative overflow-hidden ${
                  isActive
                    ? 'bg-blue-50/90 border-blue-500 shadow-xs ring-1 ring-blue-500/30'
                    : 'bg-white border-slate-200/90 hover:bg-slate-50 hover:border-slate-300 shadow-2xs'
                }`}
              >
                {/* Active progress indicator line */}
                {isActive && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600" />
                )}
                <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-slate-100 border border-slate-200">
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {slide.title}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <span className="font-extrabold text-blue-600 tabular-nums">৳{slide.salePrice.toLocaleString()}</span>
                    <span className="line-through text-slate-400 tabular-nums">৳{slide.regularPrice.toLocaleString()}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

      </div>
    </section>
  );
};

