import React from 'react';
import {
  Headphones,
  Watch,
  Zap,
  BatteryCharging,
  Cable,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Category, Product } from '../types/index.ts';

interface CategoryVisualGridProps {
  categories: Category[];
  products: Product[];
  selectedCategory: string | null;
  onSelectCategory: (categoryName: string | null) => void;
}

const CATEGORY_THEMES: Record<string, {
  gradient: string;
  badge: string;
  tagline: string;
  iconBg: string;
  iconColor: string;
}> = {
  'Earbuds & Audio': {
    gradient: 'from-blue-600 via-cyan-600 to-sky-700',
    badge: 'ANC & Hi-Fi',
    tagline: 'Wireless Earbuds & Noise Cancellation',
    iconBg: 'bg-cyan-400/20 text-cyan-300',
    iconColor: 'text-cyan-300'
  },
  'Smartwatches': {
    gradient: 'from-indigo-600 via-violet-600 to-purple-800',
    badge: 'AMOLED 60Hz',
    tagline: 'Bluetooth Calling & Health Fitness',
    iconBg: 'bg-violet-400/20 text-violet-300',
    iconColor: 'text-violet-300'
  },
  'Fast Chargers': {
    gradient: 'from-amber-600 via-orange-600 to-red-700',
    badge: 'GaN III Tech',
    tagline: 'Multi-port USB-C High-Wattage Adapters',
    iconBg: 'bg-amber-400/20 text-amber-300',
    iconColor: 'text-amber-300'
  },
  'Power Banks': {
    gradient: 'from-rose-600 via-pink-600 to-fuchsia-800',
    badge: '20,000mAh',
    tagline: 'Heavy-Duty 22.5W Two-Way Fast Charge',
    iconBg: 'bg-rose-400/20 text-rose-300',
    iconColor: 'text-rose-300'
  },
  'Accessories & Cables': {
    gradient: 'from-emerald-600 via-teal-600 to-cyan-800',
    badge: 'Tough Braided',
    tagline: 'Type-C, MagSafe Mounts & Hubs',
    iconBg: 'bg-emerald-400/20 text-emerald-300',
    iconColor: 'text-emerald-300'
  }
};

export const CategoryVisualGrid: React.FC<CategoryVisualGridProps> = ({
  categories,
  products,
  selectedCategory,
  onSelectCategory
}) => {
  const getCategoryIcon = (name: string) => {
    switch (name) {
      case 'Earbuds & Audio':
        return <Headphones className="w-7 h-7" />;
      case 'Smartwatches':
        return <Watch className="w-7 h-7" />;
      case 'Fast Chargers':
        return <Zap className="w-7 h-7" />;
      case 'Power Banks':
        return <BatteryCharging className="w-7 h-7" />;
      case 'Accessories & Cables':
      default:
        return <Cable className="w-7 h-7" />;
    }
  };

  return (
    <section className="bg-white py-12 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-blue-600 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Explore Curated Collections</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Shop Gadgets by Universe
            </h2>
          </div>

          {selectedCategory && (
            <button
              onClick={() => onSelectCategory(null)}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              Show All Categories ✕
            </button>
          )}
        </div>

        {/* 5-Column Visual Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {categories.map((cat) => {
            const theme = CATEGORY_THEMES[cat.name] || {
              gradient: 'from-slate-800 to-slate-900',
              badge: 'Official',
              tagline: cat.description,
              iconBg: 'bg-white/20 text-white',
              iconColor: 'text-white'
            };

            const isSelected = selectedCategory === cat.name;
            const count = products.filter((p) => p.category === cat.name && p.status === 'published').length;

            return (
              <div
                key={cat.id}
                onClick={() => {
                  onSelectCategory(isSelected ? null : cat.name);
                  const el = document.getElementById('shop-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`group rounded-2xl p-5 text-white transition-all duration-300 cursor-pointer shadow-md hover:shadow-xl relative overflow-hidden flex flex-col justify-between min-h-52 bg-gradient-to-br ${theme.gradient} ${
                  isSelected ? 'ring-4 ring-offset-2 ring-blue-600 scale-102' : 'hover:-translate-y-1'
                }`}
              >
                {/* Decorative background circle */}
                <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none group-hover:scale-125 transition-transform" />

                {/* Top Row: Icon + Badge */}
                <div className="flex items-center justify-between z-10">
                  <div className={`p-3 rounded-xl backdrop-blur-md shadow-xs ${theme.iconBg}`}>
                    {getCategoryIcon(cat.name)}
                  </div>
                  <span className="text-[10px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-white">
                    {theme.badge}
                  </span>
                </div>

                {/* Bottom Row: Title + Item Count + Arrow */}
                <div className="z-10 mt-6">
                  <h3 className="text-base font-extrabold tracking-tight text-white mb-1 group-hover:underline">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-white/80 line-clamp-2 leading-relaxed mb-3">
                    {theme.tagline}
                  </p>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-white/20 text-xs font-semibold">
                    <span>{count} Authentic Items</span>
                    <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>View</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
