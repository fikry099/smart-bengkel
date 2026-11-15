import React, { useEffect, useState } from 'react';
import { fetchActiveService, getServiceStatusLabel } from '../../../services/customer';
import type { CustomerServiceOrder } from '../../../services/customer';

const formatCurrency = (amount: string | number) =>
  `Rp ${Number(amount).toLocaleString('id-ID')}`;

export const CustomerServicePage: React.FC = () => {
  const [order, setOrder] = useState<CustomerServiceOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchActiveService()
      .then(setOrder)
      .catch(() => setError('Progres servis belum dapat dimuat. Silakan coba kembali.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-sm text-slate-500">Memuat detail servis...</p>;
  }

  if (error) {
    return <p role="alert" className="bg-red-50 border border-red-200 rounded-2xl p-5 text-sm text-red-700">{error}</p>;
  }

  if (!order) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <h2 className="text-xl font-extrabold text-slate-900">Tidak ada servis aktif</h2>
        <p className="text-sm text-slate-500 mt-1">Jika servis baru saja selesai, silakan lihat menu Riwayat & Nota.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900">Progres servis</h2>
        <p className="text-sm text-slate-500 mt-1">{order.order_code} • {order.plate_number}</p>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-slate-900">{order.vehicle?.brand_model || 'Kendaraan'}</h3>
            {order.current_mileage_km != null && (
              <p className="text-xs text-slate-500 mt-1">{Number(order.current_mileage_km).toLocaleString('id-ID')} km</p>
            )}
          </div>
          <span className="bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1.5 rounded-full">
            {getServiceStatusLabel(order.status)}
          </span>
        </div>

        <div className="border-t border-slate-100 pt-4 space-y-3">
          <div>
            <p className="text-xs font-bold text-slate-700">Keluhan awal</p>
            <p className="text-sm text-slate-600 mt-1">{order.initial_complaint}</p>
          </div>
          {(order.inspection_notes || order.additional_notes) && (
            <div>
              <p className="text-xs font-bold text-slate-700">Catatan pemeriksaan</p>
              <p className="text-sm text-slate-600 mt-1">{order.inspection_notes || order.additional_notes}</p>
            </div>
          )}
          {order.estimated_completion_date && (
            <div>
              <p className="text-xs font-bold text-slate-700">Perkiraan selesai</p>
              <p className="text-sm text-slate-600 mt-1">
                {new Date(order.estimated_completion_date).toLocaleString('id-ID')}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-extrabold text-slate-900">Rincian pekerjaan dan estimasi</h3>
        {order.items.length === 0 ? (
          <p className="text-sm text-slate-500">Rincian pekerjaan belum tersedia.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {order.items.map((item) => (
              <div key={item.id} className="py-3 flex justify-between gap-4 text-sm">
                <div>
                  <p className="font-semibold text-slate-800">{item.item_name}</p>
                  <p className="text-xs text-slate-500">{item.quantity} × {formatCurrency(item.price)}</p>
                </div>
                <span className="font-bold text-slate-900">
                  {formatCurrency(Number(item.price) * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        )}
        <div className="border-t border-slate-100 pt-3 flex justify-between font-extrabold text-slate-900">
          <span>Total estimasi</span>
          <span>{formatCurrency(order.total_amount)}</span>
        </div>
        <p className="text-xs text-slate-500">
          Konfirmasi pekerjaan dan estimasi dilakukan oleh admin melalui WhatsApp.
        </p>
      </div>
    </div>
  );
};
