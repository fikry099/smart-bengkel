import React from 'react';
import { Clock, Search, Send, CheckCircle2 } from 'lucide-react';

interface StatsProps {
  stats: {
    queued: number;
    inspecting: number;
    waiting_acc: number;
    in_progress: number;
    ready: number;
  };
}

export const WorkshopStatsCard: React.FC<StatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Antrean Baru */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-400">Dalam Antrean</p>
          <div className="p-2 bg-slate-100 rounded-xl text-slate-700">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">
            {stats.queued} <span className="text-sm font-bold text-slate-500">Unit</span>
          </h3>
        </div>
        <p className="text-[11px] text-slate-400 font-medium">Belum diinspeksi mekanik</p>
      </div>

      {/* 2. Sedang Diagnosa */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-400">Inspeksi & Diagnosa</p>
          <div className="p-2 bg-red-50 rounded-xl text-red-600">
            <Search className="w-4 h-4" />
          </div>
        </div>
        <div>
          <h3 className="text-3xl font-black text-red-600 tracking-tight">
            {stats.inspecting} <span className="text-sm font-bold text-slate-500">Unit</span>
          </h3>
        </div>
        <p className="text-[11px] text-slate-400 font-medium">Input sparepart & estimasi</p>
      </div>

      {/* 3. Menunggu ACC */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-400">Menunggu ACC</p>
          <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
            <Send className="w-4 h-4" />
          </div>
        </div>
        <div>
          <h3 className="text-3xl font-black text-blue-600 tracking-tight">
            {stats.waiting_acc} <span className="text-sm font-bold text-slate-500">Unit</span>
          </h3>
        </div>
        <p className="text-[11px] text-slate-400 font-medium">Estimasi terkirim ke WhatsApp</p>
      </div>

      {/* 4. Dalam Pengerjaan & Selesai */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-400">Dalam Proses & Siap Kasir</p>
          <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div>
          <h3 className="text-3xl font-black text-emerald-600 tracking-tight">
            {stats.in_progress + stats.ready} <span className="text-sm font-bold text-slate-500">Unit</span>
          </h3>
        </div>
        <p className="text-[11px] text-slate-400 font-medium">
          {stats.in_progress} dikerjakan • {stats.ready} menunggu kasir
        </p>
      </div>
    </div>
  );
};