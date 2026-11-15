import React, { useEffect, useState } from 'react';
import { fetchServiceHistory } from '../../../services/customer';
import type { CustomerServiceOrder } from '../../../services/customer';

const formatCurrency = (amount: string | number) =>
  `Rp ${Number(amount).toLocaleString('id-ID')}`;

export const CustomerHistoryPage: React.FC = () => {
  const [history, setHistory] = useState<CustomerServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchServiceHistory()
      .then(setHistory)
      .catch(() => setError('Riwayat servis belum dapat dimuat. Silakan coba kembali.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900">Riwayat servis</h2>
        <p className="text-sm text-slate-500 mt-1">Daftar servis kendaraan Anda yang sudah selesai.</p>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Memuat riwayat servis...</p>
      ) : error ? (
        <p role="alert" className="bg-red-50 border border-red-200 rounded-2xl p-5 text-sm text-red-700">{error}</p>
      ) : history.length === 0 ? (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-sm text-slate-500">
          Belum ada riwayat servis yang selesai.
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((order) => (
            <article key={order.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-wrap justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-slate-900">{order.vehicle?.brand_model || 'Kendaraan'}</h3>
                  <p className="text-xs text-slate-500 font-mono mt-1">{order.plate_number} • {order.order_code}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(order.updated_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <span className="h-fit bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-md">
                  Selesai
                </span>
              </div>

              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between gap-4 text-sm text-slate-700">
                  <span>{item.item_name} ({item.quantity} × {formatCurrency(item.price)})</span>
                  <span className="font-semibold">
                    {formatCurrency(Number(item.price) * item.quantity)}
                  </span>
                </div>
              ))}

              <div className="border-t border-slate-100 pt-3 flex justify-between font-extrabold text-slate-900">
                <span>Total</span>
                <span>{formatCurrency(order.total_amount)}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
