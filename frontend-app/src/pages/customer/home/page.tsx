import React, { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { fetchActiveService, getServiceStatusLabel } from '../../../services/customer';
import type { CustomerServiceOrder } from '../../../services/customer';

export const CustomerHomePage: React.FC<{ onNavigateTab?: (tab: 'service') => void }> = ({ onNavigateTab }) => {
  const { customerUser } = useAuth();
  const [order, setOrder] = useState<CustomerServiceOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchActiveService()
      .then(setOrder)
      .catch(() => setError('Progres servis belum dapat dimuat. Silakan coba kembali.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900">
          Halo, {customerUser?.name || 'Pelanggan'}.
        </h2>
        <p className="text-xs text-slate-600 mt-1">Pantau progres servis kendaraan Anda.</p>
      </div>

      {loading ? (
        <p className="bg-white rounded-2xl p-5 text-sm text-slate-500">Memuat progres servis...</p>
      ) : error ? (
        <p role="alert" className="bg-red-50 border border-red-200 rounded-2xl p-5 text-sm text-red-700">{error}</p>
      ) : !order ? (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-900">Tidak ada servis yang sedang berjalan</h3>
          <p className="text-sm text-slate-500 mt-1">Riwayat servis yang sudah selesai tersedia pada menu Riwayat & Nota.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-wrap justify-between gap-3">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">{order.vehicle?.brand_model || 'Kendaraan'}</h3>
              <p className="text-sm text-slate-500 font-mono">{order.plate_number} • {order.order_code}</p>
            </div>
            <span className="h-fit bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1.5 rounded-full">
              {getServiceStatusLabel(order.status)}
            </span>
          </div>
          <div className="border-t border-slate-100 pt-4">
            <p className="text-xs font-bold text-slate-700">Keluhan awal</p>
            <p className="text-sm text-slate-600 mt-1">{order.initial_complaint}</p>
          </div>
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('service')}
              className="inline-flex items-center gap-1 text-sm font-bold text-amber-900 hover:underline"
            >
              Lihat detail progres <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};