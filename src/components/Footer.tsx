import React from 'react';
import { Mail, Facebook, ShieldCheck, Truck, RotateCcw, MapPin, Clock } from 'lucide-react';
import { StoreSettings } from '../types/index.ts';

interface FooterProps {
  settings: StoreSettings;
  onOpenPolicy: (slug: string) => void;
  onSelectCategory: (cat: string | null) => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, onOpenPolicy, onSelectCategory }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 text-xs border-t border-slate-800">
      {/* Top Highlights Strip */}
      <div className="border-b border-slate-800 py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-start gap-3">
            <Truck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-white text-sm">Nationwide Delivery</div>
              <div className="text-slate-400 text-xs mt-0.5">Dhaka 24-48h, Outside Dhaka 2-4 days</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-white text-sm">Official Warranty</div>
              <div className="text-slate-400 text-xs mt-0.5">Genuine replacement guarantee</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <RotateCcw className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-white text-sm">3 Days Return</div>
              <div className="text-slate-400 text-xs mt-0.5">Inspected exchange on defect</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-white text-sm">Cash on Delivery</div>
              <div className="text-slate-400 text-xs mt-0.5">Available across all 64 districts</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand & Contact */}
          <div className="space-y-3">
            <div className="text-lg font-bold text-white tracking-tight">
              {settings.storeName} <span className="text-blue-400 text-xs font-semibold">BD</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              {settings.tagline}
            </p>
            <div className="pt-2 space-y-1.5 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                <a href={`mailto:${settings.email}`} className="hover:text-white transition-colors">
                  {settings.email}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Facebook className="w-3.5 h-3.5 text-blue-400" />
                <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  facebook.com/taragadgetsbd
                </a>
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-[11px] pt-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Timezone: {settings.timezone}</span>
              </div>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <div className="font-bold text-white text-xs uppercase tracking-wider mb-3">Popular Categories</div>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onSelectCategory('Earbuds & Audio')} className="hover:text-white transition-colors cursor-pointer">
                  Earbuds & Audio Gear
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('Smartwatches')} className="hover:text-white transition-colors cursor-pointer">
                  Smartwatches & Fitness
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('Fast Chargers')} className="hover:text-white transition-colors cursor-pointer">
                  GaN Fast Chargers
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('Power Banks')} className="hover:text-white transition-colors cursor-pointer">
                  High-Capacity Power Banks
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('Accessories & Cables')} className="hover:text-white transition-colors cursor-pointer">
                  Braided Cables & Accessories
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Service & Policies */}
          <div>
            <div className="font-bold text-white text-xs uppercase tracking-wider mb-3">Customer Service</div>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onOpenPolicy('delivery-policy')} className="hover:text-white transition-colors cursor-pointer">
                  Delivery Policy & Rates
                </button>
              </li>
              <li>
                <button onClick={() => onOpenPolicy('warranty-policy')} className="hover:text-white transition-colors cursor-pointer">
                  Warranty & Guarantee
                </button>
              </li>
              <li>
                <button onClick={() => onOpenPolicy('return-and-refund-policy')} className="hover:text-white transition-colors cursor-pointer">
                  Return & Refund Process
                </button>
              </li>
              <li>
                <button onClick={() => onOpenPolicy('faq')} className="hover:text-white transition-colors cursor-pointer">
                  Frequently Asked Questions (FAQ)
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Compliance */}
          <div>
            <div className="font-bold text-white text-xs uppercase tracking-wider mb-3">Company & Legal</div>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onOpenPolicy('about')} className="hover:text-white transition-colors cursor-pointer">
                  About Tara Gadgets BD
                </button>
              </li>
              <li>
                <button onClick={() => onOpenPolicy('privacy-policy')} className="hover:text-white transition-colors cursor-pointer">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => onOpenPolicy('terms-and-conditions')} className="hover:text-white transition-colors cursor-pointer">
                  Terms & Conditions
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 mt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} Tara Gadgets BD. All rights reserved. Prices displayed in Bangladeshi Taka (৳).
          </div>
          <div>
            Cash on Delivery throughout Bangladesh · Powered by Official Tara Gadgets Cloud Engine
          </div>
        </div>
      </div>
    </footer>
  );
};
