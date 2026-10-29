import React from 'react';
import { X, Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { Product } from '../types/index.ts';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onRemove: (productId: string) => void;
  onAddToCart: (product: Product) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  products,
  onRemove,
  onAddToCart
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-600 fill-rose-600" />
            <h2 className="font-bold text-slate-900 text-lg">Saved Wishlist</h2>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {products.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wishlist Items */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {products.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-400">
                <Heart className="w-8 h-8" />
              </div>
              <p className="text-slate-600 text-sm font-medium">You haven't saved any gadgets yet.</p>
              <button
                onClick={onClose}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 underline underline-offset-4 cursor-pointer"
              >
                Browse Gadgets Catalog
              </button>
            </div>
          ) : (
            products.map((product) => {
              const price = product.salePrice || product.regularPrice;
              return (
                <div
                  key={product.id}
                  className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <img
                    src={product.coverImage}
                    alt={product.name}
                    className="w-16 h-16 rounded-lg object-cover bg-white border border-slate-200 shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{product.brand}</div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">{product.name}</h4>
                    <div className="text-xs font-bold text-slate-900 mt-1 tabular-nums">
                      ৳{price.toLocaleString()}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <button
                      onClick={() => onRemove(product.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        onAddToCart(product);
                        onRemove(product.id);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      title="Move to Cart"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 text-center">
          <p className="text-xs text-slate-500">
            Items saved in wishlist remain accessible on this browser.
          </p>
        </div>
      </div>
    </div>
  );
};
