import React, { useState } from 'react';
import { X, Search, Truck, Package, CheckCircle2, Clock, AlertCircle, ExternalLink, ShieldAlert } from 'lucide-react';
import { Order, OrderStatus } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useToast } from '../context/ToastContext.tsx';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOrderNumber?: string;
  initialPhone?: string;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  onClose,
  initialOrderNumber = '',
  initialPhone = ''
}) => {
  const toast = useToast();
  if (!isOpen) return null;

  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [phone, setPhone] = useState(initialPhone);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Return request form modal state
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [returnSubmitted, setReturnSubmitted] = useState(false);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim() || !phone.trim()) {
      setError('Please provide both Order Number and Phone Number.');
      return;
    }

    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      const data = await api.lookupOrder(orderNumber.trim(), phone.trim());
      setOrder(data);
      toast.order(
        `Order ${data.orderNumber} Status: ${data.orderStatus.toUpperCase()}`,
        `Current tracking status is ${data.orderStatus.toUpperCase()}.`
      );
    } catch (err: any) {
      setError(err.message || 'No matching order found. Please check your credentials.');
      toast.error('Order Not Found', 'Could not locate order with that number and phone combination.');
    } finally {
      setLoading(false);
    }
  };

  const getStepState = (targetStatus: OrderStatus, currentStatus: OrderStatus) => {
    const steps: OrderStatus[] = ['new', 'confirmed', 'packing', 'shipped', 'delivered'];
    const currentIndex = steps.indexOf(currentStatus);
    const targetIndex = steps.indexOf(targetStatus);

    if (currentStatus === 'cancelled' || currentStatus === 'failed-delivery') {
      return 'failed';
    }
    if (currentIndex >= targetIndex) return 'complete';
    return 'upcoming';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-600" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Track Bangladesh Parcel</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {/* Lookup Form */}
          <form onSubmit={handleLookup} className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
            <p className="text-xs text-slate-600">
              For privacy protection, enter both your <strong>Order ID</strong> (from SMS/email) and the <strong>Bangladesh Phone Number</strong> used during checkout.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Order ID</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TG-2026-1001"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 uppercase focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="017XXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{loading ? 'Searching Record...' : 'Track Live Status'}</span>
            </button>
          </form>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Result View */}
          {order && (
            <div className="space-y-6">
              {/* Status Header */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-slate-500">Order Reference</div>
                  <div className="text-base font-mono font-bold text-slate-900">{order.orderNumber}</div>
                  <div className="text-[11px] text-slate-400">
                    Placed on {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="text-right">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold capitalize ${
                    order.orderStatus === 'delivered'
                      ? 'bg-emerald-100 text-emerald-800'
                      : order.orderStatus === 'cancelled'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    Status: {order.orderStatus.replace('-', ' ')}
                  </span>
                  <div className="text-xs font-bold text-slate-700 mt-1 tabular-nums">
                    Total: ৳{order.total.toLocaleString()} (COD)
                  </div>
                </div>
              </div>

              {/* Progress Stepper */}
              <div className="py-2">
                <div className="flex items-center justify-between text-xs font-medium text-slate-600 mb-2">
                  <span className={getStepState('new', order.orderStatus) === 'complete' ? 'text-blue-600 font-bold' : ''}>Received</span>
                  <span className={getStepState('confirmed', order.orderStatus) === 'complete' ? 'text-blue-600 font-bold' : ''}>Confirmed</span>
                  <span className={getStepState('packing', order.orderStatus) === 'complete' ? 'text-blue-600 font-bold' : ''}>Packing</span>
                  <span className={getStepState('shipped', order.orderStatus) === 'complete' ? 'text-blue-600 font-bold' : ''}>Shipped</span>
                  <span className={getStepState('delivered', order.orderStatus) === 'complete' ? 'text-emerald-600 font-bold' : ''}>Delivered</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full transition-all duration-500"
                    style={{
                      width:
                        order.orderStatus === 'delivered'
                          ? '100%'
                          : order.orderStatus === 'shipped'
                          ? '75%'
                          : order.orderStatus === 'packing'
                          ? '50%'
                          : order.orderStatus === 'confirmed'
                          ? '25%'
                          : '10%'
                    }}
                  />
                </div>
              </div>

              {/* Courier Tracking Section */}
              {order.courierName && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-blue-900">Courier Partner</div>
                    <span className="text-xs font-semibold text-blue-800">{order.courierName}</span>
                  </div>
                  {order.courierTrackingId && (
                    <div className="flex items-center justify-between text-xs text-blue-900">
                      <span>Tracking Waybill:</span>
                      <span className="font-mono font-bold">{order.courierTrackingId}</span>
                    </div>
                  )}
                  {order.courierTrackingUrl && (
                    <div className="pt-1">
                      <a
                        href={order.courierTrackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900 underline"
                      >
                        <span>Open Live Courier Tracking Page</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Items List */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">Ordered Items</div>
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                    <div className="flex items-center gap-3">
                      <img src={item.image} alt={item.productName} className="w-10 h-10 object-cover rounded bg-white" />
                      <div>
                        <div className="font-bold text-slate-800">{item.productName}</div>
                        {item.variantName && <div className="text-slate-500">{item.variantName}</div>}
                        <div className="text-slate-400">Qty: {item.quantity} × ৳{item.unitPrice.toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="font-bold text-slate-900 tabular-nums">
                      ৳{item.totalPrice.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Return / Warranty Claim CTA */}
              <div className="border-t border-slate-200 pt-4 flex items-center justify-between">
                <span className="text-xs text-slate-500">Need support with a damaged or defective item?</span>
                <button
                  onClick={() => setShowReturnForm(!showReturnForm)}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 underline cursor-pointer"
                >
                  Request Return / Warranty Claim
                </button>
              </div>

              {showReturnForm && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 space-y-3">
                  <div className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    <span>Submit Return / Warranty Claim for {order.orderNumber}</span>
                  </div>
                  {returnSubmitted ? (
                    <div className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-3 rounded-lg">
                      Your claim has been logged with our order inspection desk. Our team will contact you within 24 hours.
                    </div>
                  ) : (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (returnReason.trim()) {
                          setReturnSubmitted(true);
                          toast.success('Claim Registered', `Return request for ${order.orderNumber} logged with support.`);
                        }
                      }}
                      className="space-y-2"
                    >
                      <textarea
                        rows={2}
                        required
                        placeholder="Describe the defect or reason for return (e.g. charging port loose)..."
                        value={returnReason}
                        onChange={(e) => setReturnReason(e.target.value)}
                        className="w-full bg-white border border-rose-200 rounded-lg p-2 text-xs text-slate-800"
                      />
                      <button
                        type="submit"
                        className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer"
                      >
                        Submit Official Claim
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
