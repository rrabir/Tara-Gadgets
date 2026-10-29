import React from 'react';
import { X, ShieldCheck, Mail, Facebook, Clock, MapPin, AlertCircle } from 'lucide-react';
import { ContentPage, StoreSettings } from '../types/index.ts';

interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  pages: ContentPage[];
  activeSlug: string;
  onSelectSlug: (slug: string) => void;
  settings: StoreSettings;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({
  isOpen,
  onClose,
  pages,
  activeSlug,
  onSelectSlug,
  settings
}) => {
  if (!isOpen) return null;

  const currentPage = pages.find((p) => p.slug === activeSlug) || pages[0];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="relative bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Tara Gadgets BD Information & Policies
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

        {/* Horizontal Navigation of Policy Pages */}
        <div className="bg-slate-50 border-b border-slate-200 overflow-x-auto scrollbar-none px-4 sm:px-6">
          <div className="flex items-center gap-4 py-2 text-xs font-semibold whitespace-nowrap">
            {pages.map((page) => (
              <button
                key={page.id}
                onClick={() => onSelectSlug(page.slug)}
                className={`py-1 cursor-pointer transition-colors ${
                  activeSlug === page.slug
                    ? 'text-blue-600 border-b-2 border-blue-600 font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {page.title}
              </button>
            ))}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 flex-1 overflow-y-auto space-y-6">
          {currentPage && (
            <div>
              {/* Draft Status Banner */}
              {currentPage.isDraft && (
                <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-900 text-xs p-3 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>This document is currently saved in <strong>Draft Mode</strong> pending final administrative review.</span>
                </div>
              )}

              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4">
                {currentPage.title}
              </h1>

              <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line space-y-4 font-normal">
                {currentPage.content}
              </div>
            </div>
          )}

          {/* Official Business Details Footer Bar */}
          <div className="border-t border-slate-200 pt-6 mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600 bg-slate-50 p-4 rounded-xl">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Official Inquiries: <a href={`mailto:${settings.email}`} className="font-semibold text-slate-800 underline">{settings.email}</a></span>
            </div>
            <div className="flex items-center gap-2">
              <Facebook className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Facebook Page: <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-700 underline">fb.com/taragadgetsbd</a></span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Market Region: Bangladesh (Cash on Delivery)</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Operational Timezone: Asia/Dhaka</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
