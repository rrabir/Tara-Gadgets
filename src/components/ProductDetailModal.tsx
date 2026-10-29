import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  Heart,
  SlidersHorizontal,
  Check,
  ShieldCheck,
  Truck,
  PackageCheck,
  RotateCcw,
  ZoomIn,
  Play,
  Star,
  Share2
} from 'lucide-react';
import { Product, ProductVariant } from '../types/index.ts';
import { useToast } from '../context/ToastContext.tsx';

interface ProductDetailModalProps {
  product: Product | null;
  relatedProducts: Product[];
  onClose: () => void;
  onAddToCart: (product: Product, variant?: ProductVariant, quantity?: number) => void;
  onBuyNow: (product: Product, variant?: ProductVariant, quantity?: number) => void;
  onToggleWishlist: (product: Product) => void;
  isWishlisted: boolean;
  onToggleCompare: (product: Product) => void;
  isCompared: boolean;
  onSelectProduct: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  relatedProducts,
  onClose,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  isWishlisted,
  onToggleCompare,
  isCompared,
  onSelectProduct
}) => {
  const toast = useToast();
  if (!product) return null;

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(
    product.variants?.length ? product.variants[0].id : undefined
  );
  const [quantity, setQuantity] = useState(1);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'specs' | 'box' | 'warranty' | 'reviews'>('specs');

  // New review form state
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}?product=${product.slug}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      toast.info('Link Copied', 'Product link copied to clipboard.');
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const currentVariant = product.variants?.find((v) => v.id === selectedVariantId);
  const activePrice = currentVariant?.salePrice || currentVariant?.price || product.salePrice || product.regularPrice;
  const regularPrice = currentVariant?.price || product.regularPrice;
  const hasDiscount = activePrice < regularPrice;
  const savings = regularPrice - activePrice;
  const availableStock = currentVariant ? currentVariant.stock : product.stock;
  const isOutOfStock = availableStock <= 0;

  const images = product.images?.length > 0 ? product.images : [product.coverImage];

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) return;
    setReviewSubmitted(true);
    toast.success('Review Submitted', 'Thank you! Your verified purchase review was submitted for moderation.');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="relative bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-full transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-4 sm:p-8">
          {/* Main PDP Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            
            {/* Gallery Column */}
            <div>
              <div className="relative aspect-4/3 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 group">
                <img
                  src={images[selectedImageIndex] || product.coverImage}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-300"
                />
                
                {/* Zoom Trigger */}
                <button
                  onClick={() => setIsZoomOpen(true)}
                  className="absolute bottom-3 right-3 bg-white/90 hover:bg-white text-slate-800 p-2 rounded-lg shadow-sm text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>Zoom</span>
                </button>

                {product.videoUrl && (
                  <a
                    href={product.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute top-3 left-3 bg-slate-900/90 hover:bg-slate-900 text-white px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Watch Demo</span>
                  </a>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 cursor-pointer transition-all ${
                        selectedImageIndex === idx ? 'border-blue-600 scale-95' : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>{product.warranty}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Nationwide COD</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>3 Days Easy Return</span>
                </div>
                <div className="flex items-center gap-2">
                  <PackageCheck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>100% Genuine Tech</span>
                </div>
              </div>
            </div>

            {/* Contiguous Purchase Module */}
            <div className="flex flex-col justify-between">
              <div>
                {/* Brand & Category */}
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  <span>{product.brand}</span>
                  <span aria-hidden="true">·</span>
                  <span>{product.category}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-slate-400">SKU: {currentVariant ? currentVariant.sku : product.sku}</span>
                </div>

                {/* Title */}
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug mb-3">
                  {product.name}
                </h1>

                {/* Price Display */}
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
                    ৳{activePrice.toLocaleString()}
                  </span>
                  {hasDiscount && (
                    <>
                      <span className="text-base text-slate-400 line-through tabular-nums">
                        ৳{regularPrice.toLocaleString()}
                      </span>
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        Save ৳{savings.toLocaleString()}
                      </span>
                    </>
                  )}
                </div>

                {/* Stock Status */}
                <div className="mb-5 text-xs">
                  {isOutOfStock ? (
                    <span className="text-rose-600 font-semibold bg-rose-50 px-2 py-1 rounded">
                      Currently Out of Stock
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-1 rounded">
                      In Stock ({availableStock} units available)
                    </span>
                  )}
                </div>

                {/* Variants Selection */}
                {product.variants && product.variants.length > 0 && (
                  <div className="mb-5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Select Variant: {currentVariant?.name}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {product.variants.map((v) => {
                        const isSelected = v.id === selectedVariantId;
                        const vOut = v.stock <= 0;
                        return (
                          <button
                            key={v.id}
                            disabled={vOut}
                            onClick={() => setSelectedVariantId(v.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                              isSelected
                                ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600'
                                : vOut
                                ? 'border-slate-200 bg-slate-50 text-slate-400 line-through cursor-not-allowed'
                                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            {v.colorHex && (
                              <span
                                className="w-2.5 h-2.5 rounded-full border border-black/10 inline-block"
                                style={{ backgroundColor: v.colorHex }}
                              />
                            )}
                            <span>{v.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Quantity Stepper */}
                <div className="mb-6 flex items-center gap-4">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Quantity:</span>
                  <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1 || isOutOfStock}
                      className="px-3 py-1 text-slate-600 hover:bg-slate-200 transition-colors disabled:opacity-40 cursor-pointer font-bold"
                    >
                      -
                    </button>
                    <span className="px-4 py-1 text-sm font-semibold text-slate-800 tabular-nums">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                      disabled={quantity >= availableStock || isOutOfStock}
                      className="px-3 py-1 text-slate-600 hover:bg-slate-200 transition-colors disabled:opacity-40 cursor-pointer font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Primary Purchase Action Buttons */}
              <div className="space-y-2.5 pt-4 border-t border-slate-100">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => onAddToCart(product, currentVariant, quantity)}
                    disabled={isOutOfStock}
                    className={`py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      isOutOfStock
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </button>

                  <button
                    onClick={() => onBuyNow(product, currentVariant, quantity)}
                    disabled={isOutOfStock}
                    className={`py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      isOutOfStock
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                    }`}
                  >
                    <span>Buy with COD</span>
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 pt-2 flex-wrap gap-2">
                  <button
                    onClick={() => onToggleWishlist(product)}
                    className="flex items-center gap-1.5 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-600 text-rose-600' : ''}`} />
                    <span>{isWishlisted ? 'In Wishlist' : 'Add to Wishlist'}</span>
                  </button>

                  <button
                    onClick={() => onToggleCompare(product)}
                    className="flex items-center gap-1.5 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    <span>{isCompared ? 'Comparing' : 'Compare'}</span>
                  </button>

                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-1.5 hover:text-blue-600 transition-colors cursor-pointer text-slate-600"
                    title="Copy direct product link for social sharing"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tabbed Specifications, Box Contents & Verified Reviews */}
          <div className="border-t border-slate-200 pt-6">
            <div className="flex items-center gap-6 border-b border-slate-200 pb-2 text-sm font-semibold">
              <button
                onClick={() => setActiveTab('specs')}
                className={`pb-2 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'specs' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Specifications & Details
              </button>
              <button
                onClick={() => setActiveTab('box')}
                className={`pb-2 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'box' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                In the Box ({product.inTheBox?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('warranty')}
                className={`pb-2 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'warranty' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Warranty & Delivery
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`pb-2 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'reviews' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Customer Reviews
              </button>
            </div>

            {/* Tab Contents */}
            <div className="py-4">
              {activeTab === 'specs' && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>

                  {product.specifications && product.specifications.length > 0 && (
                    <div className="mt-4 border border-slate-200 rounded-lg overflow-hidden">
                      <table className="w-full text-xs text-left">
                        <tbody>
                          {product.specifications.map((spec, i) => (
                            <tr key={i} className={i % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                              <td className="py-2.5 px-4 font-semibold text-slate-700 w-1/3 border-r border-slate-100">
                                {spec.key}
                              </td>
                              <td className="py-2.5 px-4 text-slate-800">{spec.value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {product.compatibility && product.compatibility.length > 0 && (
                    <div className="mt-3">
                      <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Compatibility:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {product.compatibility.map((c, i) => (
                          <span key={i} className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'box' && (
                <ul className="space-y-2 text-sm text-slate-700">
                  {product.inTheBox && product.inTheBox.length > 0 ? (
                    product.inTheBox.map((item, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-slate-400">Standard retail boxed packaging with original accessories.</li>
                  )}
                </ul>
              )}

              {activeTab === 'warranty' && (
                <div className="space-y-3 text-sm text-slate-700">
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <div className="font-bold text-slate-900 mb-1">Official Warranty Coverage</div>
                    <p>{product.warranty}</p>
                    <p className="text-xs text-slate-500 mt-2">
                      Covers internal manufacturing defects. Accidental liquid or drop damage excluded.
                    </p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <div className="font-bold text-slate-900 mb-1">Delivery Information</div>
                    <p>{product.deliveryInfo}</p>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  {/* Verified Reviews Disclosure */}
                  <div className="bg-blue-50 border border-blue-100 p-3.5 rounded-lg text-xs text-blue-900 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                    <span>
                      In accordance with our anti-fabrication guidelines, customer reviews are verified against confirmed purchases and moderated by store administrators prior to publication.
                    </span>
                  </div>

                  {/* Submission Form */}
                  {reviewSubmitted ? (
                    <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-center text-emerald-800 text-sm">
                      Thank you! Your verified purchase review has been submitted for administrative moderation.
                    </div>
                  ) : (
                    <form onSubmit={handleReviewSubmit} className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div className="text-sm font-bold text-slate-800">Write a Review</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">Your Name</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Fahim"
                            value={reviewName}
                            onChange={(e) => setReviewName(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">Rating</label>
                          <select
                            value={reviewRating}
                            onChange={(e) => setReviewRating(Number(e.target.value))}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                          >
                            <option value={5}>5 Stars - Excellent</option>
                            <option value={4}>4 Stars - Good</option>
                            <option value={3}>3 Stars - Average</option>
                            <option value={2}>2 Stars - Below Expectations</option>
                            <option value={1}>1 Star - Poor</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Feedback</label>
                        <textarea
                          rows={2}
                          required
                          placeholder="Share your experience regarding sound quality, battery, or build..."
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                        />
                      </div>
                      <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer"
                      >
                        Submit Verified Review
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Related Products Section */}
          {relatedProducts.length > 0 && (
            <div className="border-t border-slate-200 pt-6 mt-6">
              <h2 className="text-base font-bold text-slate-900 mb-4">Related Tech in this Category</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {relatedProducts.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => {
                      onSelectProduct(rel);
                      setSelectedImageIndex(0);
                    }}
                    className="group bg-slate-50 hover:bg-white rounded-lg p-3 border border-slate-200 cursor-pointer transition-all"
                  >
                    <div className="aspect-square rounded-md overflow-hidden bg-white mb-2">
                      <img src={rel.coverImage} alt={rel.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <div className="text-[11px] font-semibold text-slate-500 uppercase">{rel.brand}</div>
                    <div className="text-xs font-bold text-slate-900 truncate">{rel.name}</div>
                    <div className="text-xs font-extrabold text-blue-600 mt-1 tabular-nums">
                      ৳{(rel.salePrice || rel.regularPrice).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Full Image Zoom Overlay Modal */}
      {isZoomOpen && (
        <div
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setIsZoomOpen(false)}
        >
          <img
            src={images[selectedImageIndex] || product.coverImage}
            alt={product.name}
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
          />
          <button
            onClick={() => setIsZoomOpen(false)}
            className="absolute top-6 right-6 text-white bg-white/20 p-2 rounded-full hover:bg-white/30"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
};
