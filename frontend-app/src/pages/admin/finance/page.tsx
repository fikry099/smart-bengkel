import React from 'react';
import { TrendingUp } from 'lucide-react';

export const FinancePage: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <header className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
        <span className="bg-[#FFF8E7] text-amber-900 border border-amber-200 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase">
          Laporan Keuangan
        </span>
        <h1 className="text-2xl font-extrabold text-slate-900 mt-1">Keuangan & Audit Trail</h1>
        <p className="text-xs text-slate-500">Rekapitulasi omzet, modal sparepart (HPP), dan estimasi laba bersih bengkel.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200/90 p-6 rounded-2xl shadow-sm space-y-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Uang Masuk (Omzet)</p>
          <h3 className="text-2xl font-extrabold text-slate-900">Rp 1.450.000</h3>
        </div>
        <div className="bg-white border border-slate-200/90 p-6 rounded-2xl shadow-sm space-y-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total HPP Sparepart (Modal)</p>
          <h3 className="text-2xl font-extrabold text-slate-500">Rp 650.000</h3>
        </div>
        <div className="bg-[#FFF8E7] border border-amber-200/90 p-6 rounded-2xl shadow-sm space-y-1">
          <p className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-amber-800" /> Estimasi Laba Bersih
          </p>
          <h3 className="text-2xl font-extrabold text-amber-950">Rp 800.000</h3>
        </div>
      </div>
    </div>
  );
};