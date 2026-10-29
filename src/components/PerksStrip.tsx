import React from 'react';
import { Truck, ShieldCheck, Zap, Award, Sparkles } from 'lucide-react';

export const PerksStrip: React.FC = () => {
  return (
    <section className="bg-white border-b border-slate-200 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Nationwide COD */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-sky-50/40 border border-blue-200/80 shadow-xs flex items-center gap-3.5 transition-all hover:shadow-md hover:-translate-y-0.5">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-600/20">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-blue-700">All 64 Districts</div>
              <div className="text-sm font-extrabold text-slate-900 mt-0.5">Cash on Delivery</div>
              <p className="text-[11px] text-slate-500 mt-0.5">Inspect parcel upon doorstep delivery</p>
            </div>
          </div>

          {/* Card 2: 7-Day Replacement */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/40 border border-emerald-200/80 shadow-xs flex items-center gap-3.5 transition-all hover:shadow-md hover:-translate-y-0.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">7-Day Guarantee</div>
              <div className="text-sm font-extrabold text-slate-900 mt-0.5">Hassle-Free Replacement</div>
              <p className="text-[11px] text-slate-500 mt-0.5">Free replacement for factory defects</p>
            </div>
          </div>

          {/* Card 3: Dhaka Express Delivery */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/40 border border-amber-200/80 shadow-xs flex items-center gap-3.5 transition-all hover:shadow-md hover:-translate-y-0.5">
            <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-amber-800">24-48 Hours</div>
              <div className="text-sm font-extrabold text-slate-900 mt-0.5">Dhaka Express Shipping</div>
              <p className="text-[11px] text-slate-500 mt-0.5">Fast courier with live tracking SMS</p>
            </div>
          </div>

          {/* Card 4: 100% Genuine Tech */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50/40 border border-purple-200/80 shadow-xs flex items-center gap-3.5 transition-all hover:shadow-md hover:-translate-y-0.5">
            <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-purple-600/20">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-purple-700">100% Genuine</div>
              <div className="text-sm font-extrabold text-slate-900 mt-0.5">Official Brand Warranty</div>
              <p className="text-[11px] text-slate-500 mt-0.5">Sealed retail boxes with authentic serials</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
