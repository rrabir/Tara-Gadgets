import React from 'react';
import { X, Printer } from 'lucide-react';
import { Order, StoreSettings } from '../types/index.ts';

interface InvoiceModalProps {
  order: Order | null;
  settings: StoreSettings;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, settings, onClose }) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white">
      <div className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[94vh] overflow-y-auto shadow-2xl border border-slate-200 print:shadow-none print:border-none print:max-w-full">
        
        {/* Modal Controls (Hidden in print) */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between print:hidden">
          <span className="text-sm font-bold text-slate-800">Printable Invoice & Packing Slip</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Printable Document */}
        <div className="p-6 sm:p-10 space-y-6 text-slate-900 text-xs">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-6">
            <div>
              <div className="text-2xl font-black tracking-tight text-slate-900">
                {settings.storeName}
              </div>
              <div className="text-slate-500 text-xs mt-1">Official Gadget Store · Bangladesh</div>
              <div className="text-slate-500 text-[11px] mt-0.5">{settings.email}</div>
              <div className="text-slate-500 text-[11px]">{settings.facebookUrl}</div>
            </div>

            <div className="text-right">
              <div className="text-base font-bold text-slate-900 uppercase">INVOICE & PACKING SLIP</div>
              <div className="font-mono font-bold text-sm text-blue-600 mt-1">{order.orderNumber}</div>
              <div className="text-slate-500 text-[11px] mt-1">
                Date: {new Date(order.createdAt).toLocaleDateString()}
              </div>
              <div className="text-slate-500 text-[11px]">Timezone: Asia/Dhaka</div>
            </div>
          </div>

          {/* Delivery & Customer Info */}
          <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <div className="font-bold text-slate-600 uppercase text-[10px] mb-1">Delivered To:</div>
              <div className="font-bold text-sm text-slate-900">{order.address.customerName}</div>
              <div className="font-medium text-slate-800 mt-0.5">{order.address.phone}</div>
              <div className="text-slate-600 mt-1 leading-relaxed">
                {order.address.fullAddress}, {order.address.area}, {order.address.district}
              </div>
              {order.address.orderNotes && (
                <div className="text-slate-500 text-[11px] mt-1 italic">
                  Note: {order.address.orderNotes}
                </div>
              )}
            </div>

            <div className="space-y-1 text-right">
              <div className="font-bold text-slate-600 uppercase text-[10px] mb-1">Order Details:</div>
              <div>Payment Method: <strong>Cash on Delivery (COD)</strong></div>
              <div>Fulfillment Status: <strong className="capitalize">{order.orderStatus}</strong></div>
              {order.courierName && (
                <div>Courier: <strong>{order.courierName}</strong></div>
              )}
              {order.courierTrackingId && (
                <div>Tracking ID: <strong className="font-mono">{order.courierTrackingId}</strong></div>
              )}
            </div>
          </div>

          {/* Table */}
          <table className="w-full text-left border-collapse border border-slate-200">
            <thead>
              <tr className="bg-slate-100 text-[11px] font-bold text-slate-700 border-b border-slate-200">
                <th className="p-2.5 border-r border-slate-200">SKU</th>
                <th className="p-2.5 border-r border-slate-200">Product Description</th>
                <th className="p-2.5 text-center border-r border-slate-200">Qty</th>
                <th className="p-2.5 text-right border-r border-slate-200">Unit Price</th>
                <th className="p-2.5 text-right">Total (৳)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {order.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="p-2.5 font-mono text-slate-500 border-r border-slate-200">{item.sku}</td>
                  <td className="p-2.5 border-r border-slate-200">
                    <div className="font-bold text-slate-900">{item.productName}</div>
                    {item.variantName && <div className="text-slate-500 text-[11px]">{item.variantName}</div>}
                  </td>
                  <td className="p-2.5 text-center border-r border-slate-200 tabular-nums">{item.quantity}</td>
                  <td className="p-2.5 text-right border-r border-slate-200 tabular-nums">৳{item.unitPrice.toLocaleString()}</td>
                  <td className="p-2.5 text-right font-bold tabular-nums">৳{item.totalPrice.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="tabular-nums font-semibold">৳{order.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery Charge:</span>
                <span className="tabular-nums font-semibold">৳{order.shippingFee.toLocaleString()}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount ({order.couponCode || 'Coupon'}):</span>
                  <span className="tabular-nums font-bold">-৳{order.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Due on Delivery:</span>
                <span className="text-blue-600 tabular-nums text-base">৳{order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Footer Terms */}
          <div className="border-t border-slate-200 pt-6 text-[10px] text-slate-500 text-center space-y-1">
            <p>Thank you for choosing Tara Gadgets BD. Inspect your parcel condition upon receipt before courier settlement.</p>
            <p>For warranty or return support within 3 days, email taragadgets@gmail.com with this invoice reference.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
