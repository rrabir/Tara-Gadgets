import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, AlertCircle } from 'lucide-react';
import { CartItem } from '../types/index.ts';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, variantId: string | undefined, delta: number) => void;
  onRemoveItem: (productId: string, variantId: string | undefined) => void;
  onProceedToCheckout: () => void;
  couponCode: string;
  onApplyCoupon: (code: string) => void;
  couponDiscount: number;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  couponCode,
  onApplyCoupon,
  couponDiscount
}) => {
  const [inputCoupon, setInputCoupon] = useState('');

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const total = Math.max(0, subtotal - couponDiscount);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCoupon.trim()) {
      onApplyCoupon(inputCoupon.trim().toUpperCase());
      setInputCoupon('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between">
        
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-blue-600" />
            <span className="font-bold text-slate-900 text-lg">Your Shopping Bag</span>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {items.reduce((s, i) => s + i.quantity, 0)}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <p className="text-slate-600 text-sm font-medium">Your shopping bag is currently empty.</p>
              <button
                onClick={onClose}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 underline underline-offset-4 cursor-pointer"
              >
                Browse Genuine Gadgets
              </button>
            </div>
          ) : (
            items.map((item, idx) => (
              <div
                key={`${item.productId}-${item.variantId || 'std'}-${idx}`}
                className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl"
              >
                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-lg bg-white overflow-hidden shrink-0 border border-slate-200">
                  <img
                    src={item.product.coverImage || item.product.images[0]}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                    {item.product.name}
                  </h4>
                  {item.variantName && (
                    <div className="text-[11px] text-slate-500 truncate">
                      Variant: {item.variantName}
                    </div>
                  )}
                  <div className="text-xs font-bold text-slate-800 mt-1 tabular-nums">
                    ৳{item.unitPrice.toLocaleString()}
                  </div>
                </div>

                {/* Quantity Controls & Remove */}
                <div className="flex flex-col items-end justify-between h-full gap-2 shrink-0">
                  <button
                    onClick={() => onRemoveItem(item.productId, item.variantId)}
                    className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center border border-slate-200 bg-white rounded-md overflow-hidden">
                    <button
                      onClick={() => onUpdateQuantity(item.productId, item.variantId, -1)}
                      className="px-2 py-0.5 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="px-2 py-0.5 text-xs font-bold text-slate-900 tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.productId, item.variantId, 1)}
                      className="px-2 py-0.5 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer with Coupon & Checkout Button */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 space-y-3">
            {/* Coupon Code Input */}
            <form onSubmit={handleApply} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Coupon code (e.g. TARA100)"
                  value={inputCoupon}
                  onChange={(e) => setInputCoupon(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs uppercase text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600"
                />
                <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
              <button
                type="submit"
                className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                Apply
              </button>
            </form>

            {couponCode && (
              <div className="flex items-center justify-between text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-lg">
                <span>Coupon Applied: <strong>{couponCode}</strong></span>
                <span className="font-bold">-৳{couponDiscount.toLocaleString()}</span>
              </div>
            )}

            {/* Subtotal summary */}
            <div className="space-y-1.5 pt-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900 tabular-nums">৳{subtotal.toLocaleString()}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount</span>
                  <span className="font-bold tabular-nums">-৳{couponDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>Delivery Charge</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-1.5 border-t border-slate-200">
                <span>Estimated Total</span>
                <span className="text-blue-600 tabular-nums">৳{total.toLocaleString()}</span>
              </div>
            </div>

            {/* Checkout Action */}
            <button
              onClick={onProceedToCheckout}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-[11px] text-center text-slate-500">
              Cash on Delivery available nationwide across Bangladesh.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
