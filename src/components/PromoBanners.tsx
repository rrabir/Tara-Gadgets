import React from 'react';
import { ArrowRight, Sparkles, Zap, ShieldCheck } from 'lucide-react';

interface PromoBannersProps {
  onSelectCategory: (categoryName: string) => void;
}

export const PromoBanners: React.FC<PromoBannersProps> = ({ onSelectCategory }) => {
  return (
    <section className="bg-slate-50 py-10 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Banner 1: Audio Masterclass */}
          <div
            onClick={() => {
              onSelectCategory('Earbuds & Audio');
              const el = document.getElementById('shop-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="group rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-slate-950 via-[#0B1E3B] to-blue-950 text-white shadow-xl border border-blue-900/50 hover:border-blue-500/50 transition-all duration-300 cursor-pointer relative overflow-hidden flex flex-col justify-between"
          >
            {/* Background Ambient Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform" />

            <div className="z-10 max-w-sm space-y-3">
              <span className="inline-flex items-center gap-1.5 bg-blue-500/20 border border-blue-400/30 text-cyan-300 text-xs font-extrabold uppercase px-3 py-1 rounded-full">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Audio Masterclass</span>
              </span>

              <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                Silence The Chaos. <br />
                <span className="bg-gradient-to-r from-cyan-300 to-sky-200 bg-clip-text text-transparent">
                  Hear Every Frequency.
                </span>
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                42dB Hybrid Active Noise Cancellation with ENC quad-mics. Crystal clear calls on crowded Bangladesh streets.
              </p>

              <div className="pt-2 flex items-baseline gap-2">
                <span className="text-xs text-slate-400 font-semibold uppercase">Starts From</span>
                <span className="text-2xl font-black text-cyan-300 tabular-nums">৳2,490</span>
                <span className="text-xs text-slate-400 font-medium">· 6 Mos Replacement</span>
              </div>
            </div>

            <div className="z-10 pt-6 flex items-center gap-2 text-xs font-bold text-cyan-300 group-hover:text-white transition-colors">
              <span className="underline underline-offset-4">Explore Wireless Earbuds</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>

          {/* Banner 2: Fast Charging & GaN Tech */}
          <div
            onClick={() => {
              onSelectCategory('Fast Chargers');
              const el = document.getElementById('shop-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="group rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-slate-950 via-[#2A1608] to-amber-950 text-white shadow-xl border border-amber-900/50 hover:border-amber-500/50 transition-all duration-300 cursor-pointer relative overflow-hidden flex flex-col justify-between"
          >
            {/* Background Ambient Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform" />

            <div className="z-10 max-w-sm space-y-3">
              <span className="inline-flex items-center gap-1.5 bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-extrabold uppercase px-3 py-1 rounded-full">
                <Zap className="w-3.5 h-3.5" />
                <span>Next-Gen GaN III Tech</span>
              </span>

              <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                One Small Charger. <br />
                <span className="bg-gradient-to-r from-amber-300 via-orange-200 to-white bg-clip-text text-transparent">
                  Powers Laptops & Phones.
                </span>
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                65W GaN Power Delivery fast wall adapters and 20,000mAh battery packs. Stay charged on every commute and trip.
              </p>

              <div className="pt-2 flex items-baseline gap-2">
                <span className="text-xs text-slate-400 font-semibold uppercase">Starts From</span>
                <span className="text-2xl font-black text-amber-300 tabular-nums">৳1,890</span>
                <span className="text-xs text-slate-400 font-medium">· Official Warranty</span>
              </div>
            </div>

            <div className="z-10 pt-6 flex items-center gap-2 text-xs font-bold text-amber-300 group-hover:text-white transition-colors">
              <span className="underline underline-offset-4">Explore Chargers & Power</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
