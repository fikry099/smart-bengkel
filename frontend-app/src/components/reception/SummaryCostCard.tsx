import React from 'react';
import { Calculator } from 'lucide-react';

interface Props {
  selectedItems: any[];
}

export const SummaryCostCard: React.FC<Props> = ({ selectedItems }) => {
  const spareparts = selectedItems.filter((i) => i.type === 'sparepart');
  const services = selectedItems.filter((i) => i.type === 'service');

  const totalSparepart = spareparts.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const totalService = services.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const grandTotal = totalSparepart + totalService;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <Calculator className="w-4 h-4 text-slate-800" />
        <h3 className="font-bold text-slate-900 text-sm">Ringkasan Biaya</h3>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex justify-between text-slate-600">
          <span>Total Sparepart</span>
          <span className="font-bold text-slate-900">
            Rp {totalSparepart.toLocaleString('id-ID')}
          </span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Total Jasa</span>
          <span className="font-bold text-slate-900">
            Rp {totalService.toLocaleString('id-ID')}
          </span>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
        <span className="font-black text-slate-900 text-xs">Estimasi Total</span>
        <span className="text-xl font-black text-red-600">
          Rp {grandTotal.toLocaleString('id-ID')}
        </span>
      </div>
    </div>
  );
};