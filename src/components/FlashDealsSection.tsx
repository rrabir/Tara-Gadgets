import React, { useState, useEffect } from 'react';
import { Flame, Clock, ShoppingBag, Eye, Heart, Zap, ArrowRight } from 'lucide-react';
import { Product } from '../types/index.ts';

interface FlashDealsSectionProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  wishlistProductIds: string[];
}

export const FlashDealsSection: React.FC<FlashDealsSectionProps> = ({
  products,
  onSelectProduct,
  onAddToCart,
  onToggleWishlist,
  wishlistProductIds
}) => {
  // 8 hours countdown timer
  const [timeLeft, setTimeLeft] = useState({
    hours: 7,
    minutes: 42,
    seconds: 18
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 8, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter products that have a sale price/discount
  const dealProducts = products
    .filter((p) => p.salePrice && p.salePrice < p.regularPrice)
    .slice(0, 4);

  if (dealProducts.length === 0) return null;

  return (
    <section className="bg-gradient-to-b from-slate-50 via-rose-50/20 to-white py-12 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Bar with Countdown */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white p-4 sm:p-6 rounded-2xl shadow-xl border border-rose-900/40 relative overflow-hidden">
          
          {/* Subtle Glow */}
          <div className="absolute top-0 right-1/4 w-48 h-48 bg-rose-500/20 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-3 z-10">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-rose-600/40 shrink-0 animate-pulse">
              <Flame className="w-6 h-6 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Flash Deals of the Day
                </h2>
                <span className="bg-rose-500 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full tracking-wider animate-bounce">
                  Live
                </span>
              </div>
              <p className="text-xs text-rose-200/80 mt-0.5">
                Authentic gadgets on limited promotional markdown for Bangladesh customers
              </p>
            </div>
          </div>

          {/* Countdown Clock */}
          <div className="flex items-center gap-2.5 z-10 self-stretch sm:self-auto justify-between sm:justify-end">
            <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold mr-1">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Ends In:</span>
            </div>

            <div className="flex items-center gap-1.5 font-mono text-center">
              <div className="bg-slate-800/90 border border-rose-800/60 px-2.5 py-1.5 rounded-lg min-w-10">
                <div className="text-base sm:text-lg font-black text-amber-400 tabular-nums">
                  {String(timeLeft.hours).padStart(2, '0')}
                </div>
                <div className="text-[9px] uppercase tracking-wider text-slate-400">Hours</div>
              </div>
              <span className="text-amber-400 font-black">:</span>
              <div className="bg-slate-800/90 border border-rose-800/60 px-2.5 py-1.5 rounded-lg min-w-10">
                <div className="text-base sm:text-lg font-black text-amber-400 tabular-nums">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </div>
                <div className="text-[9px] uppercase tracking-wider text-slate-400">Mins</div>
              </div>
              <span className="text-amber-400 font-black">:</span>
              <div className="bg-slate-800/90 border border-rose-800/60 px-2.5 py-1.5 rounded-lg min-w-10">
                <div className="text-base sm:text-lg font-black text-amber-400 tabular-nums">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </div>
                <div className="text-[9px] uppercase tracking-wider text-slate-400">Secs</div>
              </div>
            </div>
          </div>

        </div>

        {/* Deals Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {dealProducts.map((product) => {
            const currentPrice = product.salePrice || product.regularPrice;
            const savings = product.regularPrice - currentPrice;
            const discountPercent = Math.round((savings / product.regularPrice) * 100);
            const isWishlisted = wishlistProductIds.includes(product.id);

            return (
              <div
                key={product.id}
                className="group bg-white rounded-2xl border-2 border-rose-100 hover:border-rose-400 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative"
              >
                {/* Floating Discount & Deal Tag */}
                <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
                  <span className="bg-gradient-to-r from-rose-600 to-amber-500 text-white font-black text-xs px-2.5 py-1 rounded-lg shadow-md uppercase tracking-wider">
                    -{discountPercent}% OFF
                  </span>
                  <span className="bg-slate-900/90 text-amber-300 font-bold text-[10px] px-2 py-0.5 rounded shadow-sm backdrop-blur-xs">
                    Save ৳{savings.toLocaleString()}
                  </span>
                </div>

                {/* Wishlist Button */}
                <button
                  onClick={() => onToggleWishlist(product)}
                  className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-md shadow-xs transition-colors cursor-pointer ${
                    isWishlisted ? 'bg-rose-50 text-rose-600' : 'bg-white/85 text-slate-600 hover:text-rose-600'
                  }`}
                  title={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-600' : ''}`} />
                </button>

                {/* Product Image */}
                <div
                  className="aspect-4/3 w-full bg-slate-50 overflow-hidden cursor-pointer"
                  onClick={() => onSelectProduct(product)}
                >
                  <img
                    src={product.coverImage || product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Card Content */}
                <div className="p-4 flex flex-col flex-1 justify-between bg-white">
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase mb-1">
                      <span>{product.brand}</span>
                      <span className="text-rose-600 font-bold">Limited Deal</span>
                    </div>

                    <h3
                      onClick={() => onSelectProduct(product)}
                      className="font-bold text-sm sm:text-base text-slate-900 hover:text-blue-600 transition-colors line-clamp-2 cursor-pointer mb-2"
                    >
                      {product.name}
                    </h3>

                    <div className="text-xs text-slate-500 mb-3 truncate">
                      {product.warranty}
                    </div>

                    {/* Stock Urgency Bar */}
                    <div className="space-y-1 mb-4">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
                        <span className="flex items-center gap-1 text-amber-700">
                          <Zap className="w-3 h-3 text-amber-500" />
                          <span>Hurry, almost gone!</span>
                        </span>
                        <span className="text-slate-900 font-bold">{product.stock} units left</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-rose-600 rounded-full"
                          style={{ width: `${Math.min(100, Math.max(15, product.stock * 3))}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Price & CTA */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div>
                      <div className="text-xl font-black text-slate-900 tabular-nums">
                        ৳{currentPrice.toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-400 line-through tabular-nums">
                        ৳{product.regularPrice.toLocaleString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onSelectProduct(product)}
                        className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                        title="Quick View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onAddToCart(product)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md shadow-rose-600/20 transition-all cursor-pointer"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
