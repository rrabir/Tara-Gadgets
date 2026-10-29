import React from 'react';
import { ShoppingBag, Eye, Heart, SlidersHorizontal, CheckCircle2, AlertCircle } from 'lucide-react';
import { Product } from '../types/index.ts';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  isWishlisted: boolean;
  onToggleCompare: (product: Product) => void;
  isCompared: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
  onToggleCompare,
  isCompared
}) => {
  const currentPrice = product.salePrice || product.regularPrice;
  const hasDiscount = Boolean(product.salePrice && product.salePrice < product.regularPrice);
  const savings = hasDiscount ? product.regularPrice - (product.salePrice || 0) : 0;
  const isOutOfStock = product.stock <= 0;

  return (
    <div className="group bg-white rounded-xl border border-slate-200/90 hover:border-slate-300 hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden">
      {/* Product Image Frame */}
      <div className="relative aspect-4/3 bg-slate-100 overflow-hidden cursor-pointer" onClick={() => onSelect(product)}>
        <img
          src={product.coverImage || product.images[0]}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
          loading="lazy"
        />

        {/* Floating Actions on Top Right */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(product);
            }}
            className={`p-2 rounded-full backdrop-blur-md transition-colors shadow-sm cursor-pointer ${
              isWishlisted
                ? 'bg-rose-50 text-rose-600'
                : 'bg-white/85 text-slate-600 hover:bg-white hover:text-rose-600'
            }`}
            title={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
            aria-label="Wishlist"
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-600' : ''}`} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleCompare(product);
            }}
            className={`p-2 rounded-full backdrop-blur-md transition-colors shadow-sm cursor-pointer ${
              isCompared
                ? 'bg-blue-50 text-blue-600'
                : 'bg-white/85 text-slate-600 hover:bg-white hover:text-blue-600'
            }`}
            title={isCompared ? 'Remove from comparison' : 'Compare specifications'}
            aria-label="Compare"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Colorful Discount Badge on Top Left */}
        {hasDiscount && (
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
            <span className="bg-rose-600 text-white text-[11px] font-black px-2 py-0.5 rounded-md shadow-md uppercase tracking-wider">
              -{Math.round((savings / product.regularPrice) * 100)}%
            </span>
          </div>
        )}

        {/* Savings Tag */}
        {hasDiscount && (
          <div className="absolute bottom-2.5 left-2.5 bg-slate-950/90 text-amber-300 border border-slate-700/60 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm backdrop-blur-xs">
            Save ৳{savings.toLocaleString()}
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Metadata: Brand & Category - Clean unboxed text with separator */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium tracking-wide uppercase mb-1">
            <span>{product.brand}</span>
            <span aria-hidden="true">·</span>
            <span>{product.category}</span>
          </div>

          {/* Product Title */}
          <h3
            onClick={() => onSelect(product)}
            className="text-sm sm:text-base font-semibold text-slate-900 hover:text-blue-600 transition-colors line-clamp-2 cursor-pointer mb-2"
          >
            {product.name}
          </h3>

          {/* Warranty tag */}
          <div className="text-[12px] text-slate-500 mb-3 flex items-center gap-1">
            <span className="text-slate-400">Warranty:</span>
            <span className="font-medium text-slate-700 truncate">{product.warranty}</span>
          </div>
        </div>

        {/* Price & Action Row */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-slate-900 tabular-nums">
                ৳{currentPrice.toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="text-xs text-slate-400 line-through tabular-nums">
                  ৳{product.regularPrice.toLocaleString()}
                </span>
              )}
            </div>
            <div className="text-[11px] mt-0.5">
              {isOutOfStock ? (
                <span className="text-rose-600 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Out of stock
                </span>
              ) : (
                <span className="text-emerald-700 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> In Stock ({product.stock})
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onSelect(product)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="View Specifications"
              aria-label="View specifications"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => onAddToCart(product)}
              disabled={isOutOfStock}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isOutOfStock
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
