import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Truck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Printer,
  ChevronRight,
  Lock
} from 'lucide-react';
import { CartItem, DeliveryZone, Order } from '../types/index.ts';
import { BANGLADESH_DISTRICTS } from '../../data/initial-data.ts';
import { api } from '../services/api.ts';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  deliveryZones: DeliveryZone[];
  initialCouponCode?: string;
  onOrderSuccess: (order: Order) => void;
  onTrackOrder: (orderNumber: string, phone: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  deliveryZones,
  initialCouponCode = '',
  onOrderSuccess,
  onTrackOrder
}) => {
  if (!isOpen) return null;

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [district, setDistrict] = useState('Dhaka');
  const [area, setArea] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [selectedZoneId, setSelectedZoneId] = useState<string>(deliveryZones[0]?.id || 'zone-1');
  const [couponCode, setCouponCode] = useState(initialCouponCode);
  const [couponInput, setCouponInput] = useState(initialCouponCode);

  // Server Validation & Order Execution State
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [validatedData, setValidatedData] = useState<{
    subtotal: number;
    shippingFee: number;
    discount: number;
    total: number;
  } | null>(null);

  // Order Confirmed State
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [idempotencyKey] = useState(`chk-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`);

  // Auto-detect delivery zone based on selected district
  useEffect(() => {
    if (district === 'Dhaka') {
      const insideDhaka = deliveryZones.find((z) => z.name.toLowerCase().includes('inside dhaka'));
      if (insideDhaka) setSelectedZoneId(insideDhaka.id);
    } else if (['Gazipur', 'Narayanganj', 'Manikganj', 'Munshiganj'].includes(district)) {
      const suburbs = deliveryZones.find((z) => z.name.toLowerCase().includes('suburb'));
      if (suburbs) setSelectedZoneId(suburbs.id);
      else {
        const outside = deliveryZones.find((z) => z.name.toLowerCase().includes('outside'));
        if (outside) setSelectedZoneId(outside.id);
      }
    } else {
      const outside = deliveryZones.find((z) => z.name.toLowerCase().includes('outside'));
      if (outside) setSelectedZoneId(outside.id);
    }
  }, [district, deliveryZones]);

  // Server-side validation of cart whenever items, coupon or zone changes
  useEffect(() => {
    let isMounted = true;
    async function runServerCalculation() {
      if (items.length === 0) return;
      setIsCalculating(true);
      setErrorMessage(null);
      try {
        const payload = {
          items: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            quantity: i.quantity
          })),
          couponCode: couponCode || undefined,
          deliveryZoneId: selectedZoneId
        };
        const res = await api.validateCart(payload);
        if (isMounted) {
          setValidatedData({
            subtotal: res.subtotal,
            shippingFee: res.shippingFee,
            discount: res.discount,
            total: res.total
          });
        }
      } catch (err: any) {
        if (isMounted) {
          setErrorMessage(err.message || 'Cart validation failed');
        }
      } finally {
        if (isMounted) setIsCalculating(false);
      }
    }
    runServerCalculation();
    return () => {
      isMounted = false;
    };
  }, [items, couponCode, selectedZoneId]);

  // Phone Validation
  const validatePhone = (val: string) => {
    const cleaned = val.replace(/[\s\-()]/g, '');
    const bdRegex = /^(?:\+?88)?(01[3-9]\d{8})$/;
    if (!bdRegex.test(cleaned)) {
      setPhoneError('Enter a valid 11-digit Bangladesh phone (e.g. 017XXXXXXXX)');
      return false;
    }
    setPhoneError(null);
    return true;
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponCode(couponInput.trim().toUpperCase());
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePhone(phone)) return;
    if (!customerName.trim() || !fullAddress.trim()) {
      setErrorMessage('Please fill in your name and delivery address.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload = {
        customerName,
        phone,
        email: email.trim() || undefined,
        district,
        area: area.trim() || district,
        fullAddress,
        orderNotes,
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity
        })),
        couponCode: couponCode || undefined,
        deliveryZoneId: selectedZoneId,
        idempotencyKey
      };

      const result = await api.placeOrder(payload);
      if (result.success && result.order) {
        setConfirmedOrder(result.order);
        onOrderSuccess(result.order);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="relative bg-white rounded-2xl max-w-3xl w-full max-h-[94vh] overflow-y-auto shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">
              {confirmedOrder ? 'Order Confirmed' : 'Cash on Delivery Checkout'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {confirmedOrder ? (
            /* SUCCESS CONFIRMATION VIEW */
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Dhanyabad! Your Order is Placed.
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  We have received your order for Cash on Delivery. Our team will verify and dispatch your parcel.
                </p>
              </div>

              {/* Order Number Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-w-md mx-auto text-left space-y-2">
                <div className="flex justify-between items-center text-xs text-slate-500">
                  <span>Order Reference</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{confirmedOrder.orderNumber}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-500">
                  <span>Customer Phone</span>
                  <span className="font-medium text-slate-800">{confirmedOrder.address.phone}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-500">
                  <span>Delivery Address</span>
                  <span className="font-medium text-slate-800 text-right truncate max-w-[200px]">
                    {confirmedOrder.address.fullAddress}, {confirmedOrder.address.district}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-500 pt-2 border-t border-slate-200">
                  <span>Total Payable (COD)</span>
                  <span className="text-base font-extrabold text-blue-600 tabular-nums">
                    ৳{confirmedOrder.total.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <button
                  onClick={() => onTrackOrder(confirmedOrder.orderNumber, confirmedOrder.address.phone)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <Truck className="w-4 h-4" />
                  <span>Track This Order</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Receipt</span>
                </button>
              </div>
            </div>
          ) : (
            /* CHECKOUT FORM VIEW */
            <form onSubmit={handleSubmitOrder} className="space-y-6">
              {errorMessage && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left: Customer & Address Information */}
                <div className="space-y-4">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <span>1. Delivery Contact Details</span>
                  </div>

                  {/* Customer Name */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tanvir Hossain"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  {/* Bangladesh Phone */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Bangladesh Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="017XXXXXXXX"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (phoneError) validatePhone(e.target.value);
                      }}
                      onBlur={(e) => validatePhone(e.target.value)}
                      className={`w-full bg-slate-50 border rounded-lg px-3 py-2 text-sm text-slate-800 focus:bg-white focus:outline-none ${
                        phoneError ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200 focus:border-blue-600'
                      }`}
                    />
                    {phoneError ? (
                      <p className="text-[11px] text-rose-600 mt-1">{phoneError}</p>
                    ) : (
                      <p className="text-[11px] text-slate-500 mt-1">Our courier will call this number prior to arrival.</p>
                    )}
                  </div>

                  {/* Optional Email */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Email Address <span className="text-slate-400 font-normal">(Optional, for invoice)</span>
                    </label>
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  {/* District & Area Selection */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        District <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600"
                      >
                        {BANGLADESH_DISTRICTS.map((dist) => (
                          <option key={dist} value={dist}>
                            {dist}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Area / Thana</label>
                      <input
                        type="text"
                        placeholder="e.g. Dhanmondi / Mirpur"
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>

                  {/* Full Delivery Address */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Full Street Address <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      required
                      placeholder="House number, road number, flat/floor details..."
                      value={fullAddress}
                      onChange={(e) => setFullAddress(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  {/* Order Notes */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Delivery Instructions / Notes
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Deliver between 2 PM - 5 PM"
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                {/* Right: Shipping Zone, Order Summary & Payment */}
                <div className="space-y-4 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <span>2. Delivery Zone & Shipping</span>
                    </div>

                    {/* Zone Selector */}
                    <div className="space-y-2">
                      {deliveryZones.map((zone) => (
                        <label
                          key={zone.id}
                          className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                            selectedZoneId === zone.id
                              ? 'border-blue-600 bg-blue-50/60 ring-1 ring-blue-600'
                              : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="radio"
                              name="deliveryZone"
                              value={zone.id}
                              checked={selectedZoneId === zone.id}
                              onChange={() => setSelectedZoneId(zone.id)}
                              className="text-blue-600 focus:ring-blue-500"
                            />
                            <div>
                              <div className="text-xs font-bold text-slate-900">{zone.name}</div>
                              <div className="text-[11px] text-slate-500">{zone.estimatedDays}</div>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-slate-800 tabular-nums">
                            ৳{zone.fee}
                          </span>
                        </label>
                      ))}
                    </div>

                    {/* Payment Method Selection */}
                    <div className="pt-2">
                      <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        3. Payment Method
                      </div>

                      <div className="space-y-2">
                        {/* Cash on Delivery (Enabled) */}
                        <div className="p-3 rounded-xl border border-blue-600 bg-blue-50/40 flex items-start gap-3">
                          <input
                            type="radio"
                            name="paymentMethod"
                            checked
                            readOnly
                            className="mt-0.5 text-blue-600"
                          />
                          <div>
                            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                              <span>Cash on Delivery (COD)</span>
                              <span className="text-[10px] bg-blue-600 text-white font-semibold px-1.5 py-0.2 rounded">
                                Recommended
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-600 mt-0.5">
                              Pay in cash directly to the courier agent when your parcel arrives at your doorstep.
                            </div>
                          </div>
                        </div>

                        {/* Online Payment (Clearly marked Not Configured) */}
                        <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 opacity-60 flex items-start gap-3 cursor-not-allowed">
                          <input type="radio" disabled className="mt-0.5" />
                          <div>
                            <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                              <span>Digital Payment (bKash / Nagad / SSLCOMMERZ)</span>
                              <span className="text-[10px] bg-slate-200 text-slate-600 font-medium px-1.5 py-0.2 rounded">
                                Not configured
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              Gateway credentials pending setup by store owner.
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Summary & Submit */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 pt-3">
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                      <span className="font-semibold text-slate-900 tabular-nums">
                        ৳{(validatedData?.subtotal || items.reduce((s, i) => s + i.unitPrice * i.quantity, 0)).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between text-xs text-slate-600">
                      <span>Delivery Fee</span>
                      <span className="font-semibold text-slate-900 tabular-nums">
                        ৳{validatedData ? validatedData.shippingFee : 70}
                      </span>
                    </div>

                    {validatedData && validatedData.discount > 0 && (
                      <div className="flex justify-between text-xs text-emerald-700">
                        <span>Coupon Discount ({couponCode})</span>
                        <span className="font-bold tabular-nums">-৳{validatedData.discount.toLocaleString()}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                      <span>Total Amount Payable</span>
                      <span className="text-blue-600 tabular-nums text-base">
                        {isCalculating ? (
                          <span className="text-xs text-slate-400 font-normal">Calculating...</span>
                        ) : (
                          `৳${(validatedData?.total || 0).toLocaleString()}`
                        )}
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || isCalculating}
                      className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-sm"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Confirming Order...</span>
                        </>
                      ) : (
                        <>
                          <span>Confirm Cash on Delivery Order</span>
                          <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <div className="text-[10px] text-center text-slate-400 pt-1 flex items-center justify-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                      <span>Stock reserved atomically · 100% Genuine Guarantee</span>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
