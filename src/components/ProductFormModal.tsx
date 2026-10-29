import React, { useState } from 'react';
import { X, Plus, Trash2, Upload, Image as ImageIcon, Sparkles, Check } from 'lucide-react';
import { Product, ProductVariant, ProductSpecification, Category, Brand } from '../types/index.ts';
import { SPECIFICATION_TEMPLATES } from '../../data/initial-data.ts';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  categories: Category[];
  brands: Brand[];
  onSave: (productData: Partial<Product>) => Promise<void>;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  product,
  categories,
  brands,
  onSave
}) => {
  if (!isOpen) return null;

  const isEditing = Boolean(product);

  const [name, setName] = useState(product?.name || '');
  const [brand, setBrand] = useState(product?.brand || brands[0]?.name || 'Tara Original');
  const [category, setCategory] = useState(product?.category || categories[0]?.name || 'Earbuds & Audio');
  const [description, setDescription] = useState(product?.description || '');
  const [regularPrice, setRegularPrice] = useState(product?.regularPrice ? product.regularPrice.toString() : '');
  const [salePrice, setSalePrice] = useState(product?.salePrice ? product.salePrice.toString() : '');
  const [sku, setSku] = useState(product?.sku || '');
  const [stock, setStock] = useState(product?.stock ? product.stock.toString() : '10');
  const [warranty, setWarranty] = useState(product?.warranty || '6 Months Official Replacement Warranty');
  const [deliveryInfo, setDeliveryInfo] = useState(product?.deliveryInfo || 'Fast Cash on Delivery across Bangladesh.');
  const [videoUrl, setVideoUrl] = useState(product?.videoUrl || '');
  const [status, setStatus] = useState<'published' | 'draft' | 'archived'>(product?.status || 'published');
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured || false);
  const [isNewArrival, setIsNewArrival] = useState(product?.isNewArrival || false);

  // Images
  const [images, setImages] = useState<string[]>(
    product?.images?.length ? product.images : [product?.coverImage || '/src/assets/images/gadget_anc_earbuds_1793251027311.jpg']
  );
  const [coverImageIndex, setCoverImageIndex] = useState(0);

  // Variants
  const [variants, setVariants] = useState<ProductVariant[]>(product?.variants || []);

  // Specifications
  const [specifications, setSpecifications] = useState<ProductSpecification[]>(
    product?.specifications || [
      { key: 'Noise Cancellation', value: '42dB Hybrid ANC' },
      { key: 'Battery Life', value: '8h buds / 40h case' },
      { key: 'Water Resistance', value: 'IPX5 Sweatproof' }
    ]
  );

  // In the Box
  const [inTheBox, setInTheBox] = useState<string[]>(
    product?.inTheBox || ['Device Unit', 'Charging Cable', 'User Manual', 'Warranty Card']
  );
  const [newBoxItem, setNewBoxItem] = useState('');

  // Compatibility
  const [compatibility, setCompatibility] = useState<string[]>(
    product?.compatibility || ['Android', 'iOS', 'Windows', 'macOS']
  );
  const [newCompItem, setNewCompItem] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load Specification Template
  const handleApplyTemplate = (categorySlug: string) => {
    const template = SPECIFICATION_TEMPLATES[categorySlug];
    if (template) {
      setSpecifications(template.map((t) => ({ key: t.key, value: '' })));
    }
  };

  // Image Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit.');
        continue;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        if (url) {
          setImages((prev) => [...prev, url]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddVariant = () => {
    const newV: ProductVariant = {
      id: `v-${Date.now()}`,
      name: 'Black / Standard',
      color: 'Black',
      colorHex: '#0f172a',
      sku: `${sku || 'TG'}-V${variants.length + 1}`,
      price: Number(regularPrice) || 1000,
      salePrice: salePrice ? Number(salePrice) : undefined,
      stock: 10
    };
    setVariants([...variants, newV]);
  };

  const handleRemoveVariant = (id: string) => {
    setVariants(variants.filter((v) => v.id !== id));
  };

  const handleAddSpec = () => {
    setSpecifications([...specifications, { key: '', value: '' }]);
  };

  const handleRemoveSpec = (index: number) => {
    setSpecifications(specifications.filter((_, idx) => idx !== index));
  };

  const handleAddBoxItem = () => {
    if (newBoxItem.trim()) {
      setInTheBox([...inTheBox, newBoxItem.trim()]);
      setNewBoxItem('');
    }
  };

  const handleRemoveBoxItem = (idx: number) => {
    setInTheBox(inTheBox.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !regularPrice) {
      setError('Product name and regular price are required.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload: Partial<Product> = {
        name: name.trim(),
        brand,
        category,
        description,
        regularPrice: Number(regularPrice),
        salePrice: salePrice ? Number(salePrice) : undefined,
        sku: sku.trim() || `TG-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        stock: Number(stock) || 0,
        images,
        coverImage: images[coverImageIndex] || images[0],
        videoUrl,
        variants,
        specifications: specifications.filter((s) => s.key.trim()),
        compatibility,
        warranty,
        inTheBox,
        deliveryInfo,
        status,
        isFeatured,
        isNewArrival
      };

      await onSave(payload);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="relative bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {isEditing ? `Edit Product: ${product?.name}` : 'Upload New Gadget'}
            </h2>
            <p className="text-xs text-slate-500">
              Configure product details, variants, specifications, and Bangladesh warranty terms.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Basic Info */}
          <div className="space-y-4">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              1. Basic Product Information
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Product Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aura Sound Pro ANC Wireless Earbuds"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Brand</label>
                <select
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600"
                >
                  {brands.map((b) => (
                    <option key={b.id} value={b.name}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Regular Price (৳) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 3500"
                  value={regularPrice}
                  onChange={(e) => setRegularPrice(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Sale Price (৳) <span className="text-slate-400 font-normal">(Optional promotional price)</span>
                </label>
                <input
                  type="number"
                  placeholder="e.g. 2990"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Stock SKU</label>
                <input
                  type="text"
                  placeholder="e.g. TG-AUR-01"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 uppercase focus:bg-white focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Available Inventory Stock</label>
                <input
                  type="number"
                  required
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Detailed Description</label>
              <textarea
                rows={3}
                placeholder="Product highlights, chipset details, battery performance, ergonomics..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          {/* Product Images & Cover Selection */}
          <div className="space-y-3 border-t border-slate-200 pt-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                2. Product Images ({images.length})
              </span>
              <label className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer flex items-center gap-1.5 transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Images</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 bg-slate-50 group cursor-pointer ${
                    coverImageIndex === idx ? 'border-blue-600 ring-2 ring-blue-600/30' : 'border-slate-200'
                  }`}
                  onClick={() => setCoverImageIndex(idx)}
                >
                  <img src={img} alt="Product" className="w-full h-full object-cover" />
                  {coverImageIndex === idx && (
                    <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded">
                      Cover
                    </span>
                  )}
                  {images.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setImages(images.filter((_, i) => i !== idx));
                        if (coverImageIndex === idx) setCoverImageIndex(0);
                      }}
                      className="absolute top-1 right-1 bg-rose-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Variants Builder */}
          <div className="space-y-3 border-t border-slate-200 pt-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  3. Color & Capacity Variants ({variants.length})
                </span>
                <p className="text-[11px] text-slate-500">Optional: Add variants if this gadget comes in different colors or storage sizes.</p>
              </div>
              <button
                type="button"
                onClick={handleAddVariant}
                className="bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Variant</span>
              </button>
            </div>

            {variants.length > 0 && (
              <div className="space-y-2">
                {variants.map((v, idx) => (
                  <div key={v.id || idx} className="grid grid-cols-12 gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs items-center">
                    <div className="col-span-3">
                      <input
                        type="text"
                        placeholder="Variant Name"
                        value={v.name}
                        onChange={(e) => {
                          const updated = [...variants];
                          updated[idx].name = e.target.value;
                          setVariants(updated);
                        }}
                        className="w-full bg-white border border-slate-200 rounded px-2 py-1"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="text"
                        placeholder="Color Hex #1e293b"
                        value={v.colorHex || ''}
                        onChange={(e) => {
                          const updated = [...variants];
                          updated[idx].colorHex = e.target.value;
                          setVariants(updated);
                        }}
                        className="w-full bg-white border border-slate-200 rounded px-2 py-1 font-mono"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        placeholder="Price"
                        value={v.price}
                        onChange={(e) => {
                          const updated = [...variants];
                          updated[idx].price = Number(e.target.value);
                          setVariants(updated);
                        }}
                        className="w-full bg-white border border-slate-200 rounded px-2 py-1"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        placeholder="Stock"
                        value={v.stock}
                        onChange={(e) => {
                          const updated = [...variants];
                          updated[idx].stock = Number(e.target.value);
                          setVariants(updated);
                        }}
                        className="w-full bg-white border border-slate-200 rounded px-2 py-1"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="text"
                        placeholder="Variant SKU"
                        value={v.sku}
                        onChange={(e) => {
                          const updated = [...variants];
                          updated[idx].sku = e.target.value;
                          setVariants(updated);
                        }}
                        className="w-full bg-white border border-slate-200 rounded px-2 py-1 font-mono"
                      />
                    </div>
                    <div className="col-span-1 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(v.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Specifications Builder with Templates */}
          <div className="space-y-3 border-t border-slate-200 pt-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                4. Specifications & Templates
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500">Apply Template:</span>
                <button
                  type="button"
                  onClick={() => handleApplyTemplate('earbuds-audio')}
                  className="text-[11px] bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded cursor-pointer"
                >
                  Earbuds
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyTemplate('smartwatches')}
                  className="text-[11px] bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded cursor-pointer"
                >
                  Watch
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyTemplate('fast-chargers')}
                  className="text-[11px] bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded cursor-pointer"
                >
                  Charger
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyTemplate('power-banks')}
                  className="text-[11px] bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded cursor-pointer"
                >
                  Power Bank
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {specifications.map((spec, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Feature (e.g. Battery Life)"
                    value={spec.key}
                    onChange={(e) => {
                      const updated = [...specifications];
                      updated[idx].key = e.target.value;
                      setSpecifications(updated);
                    }}
                    className="w-1/3 bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800"
                  />
                  <input
                    type="text"
                    placeholder="Value (e.g. 40 Hours with Case)"
                    value={spec.value}
                    onChange={(e) => {
                      const updated = [...specifications];
                      updated[idx].value = e.target.value;
                      setSpecifications(updated);
                    }}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSpec(idx)}
                    className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddSpec}
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 cursor-pointer pt-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Specification Row</span>
              </button>
            </div>
          </div>

          {/* Warranty, In The Box, Video URL & Publication State */}
          <div className="space-y-4 border-t border-slate-200 pt-5">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              5. Warranty, Logistics & Publication
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Official Warranty Statement</label>
                <input
                  type="text"
                  placeholder="e.g. 6 Months Official Replacement Warranty"
                  value={warranty}
                  onChange={(e) => setWarranty(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Demo Video URL (YouTube / MP4)</label>
                <input
                  type="url"
                  placeholder="https://youtube.com/watch?v=..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Publication State</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800"
                >
                  <option value="published">Published (Visible on storefront)</option>
                  <option value="draft">Draft (Hidden from storefront)</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="flex items-center gap-6 pt-5">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span>Featured Collection</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={isNewArrival}
                    onChange={(e) => setIsNewArrival(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span>New Arrival Badge</span>
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t border-slate-200 pt-6 flex items-center justify-end gap-3 sticky bottom-0 bg-white p-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-colors shadow-sm cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Saving...' : isEditing ? 'Update Gadget' : 'Publish Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
