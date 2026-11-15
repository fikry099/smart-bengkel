import React from 'react';

interface StatsProps {
  stats: {
    total_items: number;
    total_sparepart: number;
    total_service: number;
    low_stock_count: number;
  };
}

export const InventoryStatsCard: React.FC<StatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: SKU tercatat */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3 flex flex-col justify-between">
        <p className="text-xs font-semibold text-slate-400">SKU tercatat</p>
        <div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">
            {stats.total_items}
          </h3>
        </div>
        <p className="text-[11px] text-slate-400 font-medium">
          {stats.total_sparepart} sparepart • {stats.total_service} jasa
        </p>
      </div>

      {/* Card 2: Stok Menipis */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3 flex flex-col justify-between">
        <p className="text-xs font-semibold text-slate-400">Di batas minimum</p>
        <div>
          <h3 className={`text-3xl font-black tracking-tight ${
            stats.low_stock_count > 0 ? 'text-red-600' : 'text-slate-900'
          }`}>
            {stats.low_stock_count}
          </h3>
        </div>
        <p className="text-[11px] text-slate-400 font-medium">
          {stats.low_stock_count > 0 ? 'Perlu restok segera' : 'Stok barang aman'}
        </p>
      </div>

      {/* Card 3: Total Layanan Jasa */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3 flex flex-col justify-between">
        <p className="text-xs font-semibold text-slate-400">Total Layanan Jasa</p>
        <div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">
            {stats.total_service} <span className="text-lg font-bold text-slate-700">unit</span>
          </h3>
        </div>
        <p className="text-[11px] text-slate-400 font-medium">
          Tarif perbaikan terdaftar
        </p>
      </div>

      {/* Card 4: Status Audit Opname */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3 flex flex-col justify-between">
        <p className="text-xs font-semibold text-slate-400">Opname Stok Bulanan</p>
        <div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">
            Terjadwal
          </h3>
        </div>
        <p className="text-[11px] text-slate-400 font-medium">
          Hitung fisik & audit berkala
        </p>
      </div>
    </div>
  );
};