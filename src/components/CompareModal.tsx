import React from 'react';
import { X, SlidersHorizontal, ShoppingBag, Trash2 } from 'lucide-react';
import { Product } from '../types/index.ts';

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onRemove: (productId: string) => void;
  onAddToCart: (product: Product) => void;
  onClearAll: () => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  isOpen,
  onClose,
  products,
  onRemove,
  onAddToCart,
  onClearAll
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="relative bg-white rounded-2xl max-w-5xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">
              Product Specifications Comparison ({products.length})
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {products.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 underline cursor-pointer"
              >
                Clear All
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {products.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              No products selected for comparison yet. Click the comparison icon on any product card.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse border border-slate-200">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-3 font-bold text-slate-700 w-40 border-r border-slate-200">Attribute</th>
                    {products.map((p) => (
                      <th key={p.id} className="p-3 font-bold text-slate-900 min-w-[200px] border-r border-slate-200">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-bold text-blue-600 uppercase">{p.brand}</span>
                          <button
                            onClick={() => onRemove(p.id)}
                            className="text-slate-400 hover:text-rose-600 p-0.5 cursor-pointer"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <img src={p.coverImage} alt={p.name} className="w-20 h-20 object-cover rounded-lg mb-2 mx-auto bg-white border border-slate-200" />
                        <div className="text-xs font-bold line-clamp-2 mb-2">{p.name}</div>
                        <div className="text-sm font-extrabold text-slate-900 tabular-nums mb-2">
                          ৳{(p.salePrice || p.regularPrice).toLocaleString()}
                        </div>
                        <button
                          onClick={() => onAddToCart(p)}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <ShoppingBag className="w-3 h-3" />
                          <span>Add to Cart</span>
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-3 font-bold text-slate-700 bg-slate-50 border-r border-slate-200">Category</td>
                    {products.map((p) => (
                      <td key={p.id} className="p-3 border-r border-slate-200 text-slate-800">{p.category}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-700 bg-slate-50 border-r border-slate-200">Official Warranty</td>
                    {products.map((p) => (
                      <td key={p.id} className="p-3 border-r border-slate-200 font-semibold text-slate-800">{p.warranty}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-700 bg-slate-50 border-r border-slate-200">Stock Availability</td>
                    {products.map((p) => (
                      <td key={p.id} className="p-3 border-r border-slate-200">
                        {p.stock > 0 ? (
                          <span className="text-emerald-700 font-medium">In Stock ({p.stock} units)</span>
                        ) : (
                          <span className="text-rose-600 font-medium">Out of Stock</span>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-700 bg-slate-50 border-r border-slate-200">Compatibility</td>
                    {products.map((p) => (
                      <td key={p.id} className="p-3 border-r border-slate-200 text-slate-700">
                        {p.compatibility?.join(', ') || 'Universal Android & iOS'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-700 bg-slate-50 border-r border-slate-200">In the Box</td>
                    {products.map((p) => (
                      <td key={p.id} className="p-3 border-r border-slate-200 text-slate-700">
                        <ul className="list-disc pl-4 space-y-0.5">
                          {p.inTheBox?.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-700 bg-slate-50 border-r border-slate-200">Key Specifications</td>
                    {products.map((p) => (
                      <td key={p.id} className="p-3 border-r border-slate-200 text-slate-700">
                        <div className="space-y-1">
                          {p.specifications?.map((s, idx) => (
                            <div key={idx}>
                              <strong className="text-slate-800">{s.key}:</strong> {s.value}
                            </div>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
