import React, { useState } from 'react';
import { X, PlusCircle } from 'lucide-react';

interface RestockModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  onSubmit: (productId: number, additionalStock: number) => void;
  submitting: boolean;
}

export const RestockModal: React.FC<RestockModalProps> = ({
  isOpen,
  onClose,
  product,
  onSubmit,
  submitting,
}) => {
  const [additionalStock, setAdditionalStock] = useState('10');

  if (!isOpen || !product) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(additionalStock) || 0;
    if (qty <= 0) return;
    onSubmit(product.id, qty);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-2xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-200">
        {/* Header Modal */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Restock Sparepart</h3>
            <p className="text-[11px] text-slate-500 font-medium">Tambah stok fisik barang masuk</p>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informasi Produk */}
        <div className="bg-[#F4F5F3] p-3.5 rounded-2xl space-y-1 text-xs">
          <p className="text-slate-500 font-semibold font-mono">{product.sku}</p>
          <p className="font-black text-slate-900 text-sm">{product.name}</p>
          <div className="flex justify-between items-center pt-2 border-t border-slate-200/60">
            <span className="text-slate-600">Stok Saat Ini:</span>
            <span className="font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg">
              {product.stock} unit
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-800 mb-1">Jumlah Barang Masuk (Qty)</label>
            <input
              type="number"
              min="1"
              value={additionalStock}
              onChange={(e) => setAdditionalStock(e.target.value)}
              required
              autoFocus
              className="w-full bg-[#F4F5F3] border border-slate-300 rounded-xl py-3 px-3.5 font-bold text-slate-900 text-sm focus:outline-hidden focus:border-red-600 transition"
            />
          </div>

          {/* Action Footer */}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700 text-white font-black px-5 py-2.5 rounded-xl flex items-center gap-2 transition shadow-md shadow-red-600/20 disabled:opacity-50 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{submitting ? 'Memproses...' : 'Konfirmasi Restock'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};