import React from 'react';
import { ArrowRight } from 'lucide-react';
import { getWorkshopActionLabel, getWorkshopStatusLabel } from './workshopStages';

interface TableProps {
  orders: any[];
  loading: boolean;
  onSelectOrder: (order: any) => void;
  onPrimaryAction: (order: any) => void;
}

export const WorkshopTable: React.FC<TableProps> = ({ orders, loading, onSelectOrder, onPrimaryAction }) => {
  const calculateEstimatedCost = (item: any): number => {
    const directTotal =
      item.total_amount ??
      item.estimated_cost ??
      item.grand_total ??
      item.total_price ??
      0;

    if (parseFloat(directTotal) > 0) {
      return parseFloat(directTotal);
    }

    const listDetails =
      item.work_order_details ||
      item.details ||
      item.items ||
      item.initial_items ||
      [];

    if (Array.isArray(listDetails) && listDetails.length > 0) {
      return listDetails.reduce((acc: number, curr: any) => {
        const price =
          curr.price ??
          curr.selling_price ??
          curr.price_per_unit ??
          curr.price_unit ??
          curr.tariff ??
          curr.subtotal ??
          0;

        const qty = curr.quantity ?? curr.qty ?? 1;

        return acc + (parseFloat(price) || 0) * (parseInt(qty) || 1);
      }, 0);
    }

    return 0;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'QUEUED':
        return <span className="bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-lg text-[10px] border border-slate-200">{getWorkshopStatusLabel(status)}</span>;
      case 'INSPECTING':
        return <span className="bg-red-50 text-red-700 font-bold px-2.5 py-1 rounded-lg text-[10px] border border-red-200">{getWorkshopStatusLabel(status)}</span>;
      case 'INSPECTED':
        return <span className="bg-red-50 text-red-700 font-bold px-2.5 py-1 rounded-lg text-[10px] border border-red-200">{getWorkshopStatusLabel(status)}</span>;
      case 'PENDING_ACC':
      case 'WAITING_ACC':
        return <span className="bg-blue-50 text-blue-800 font-bold px-2.5 py-1 rounded-lg text-[10px] border border-blue-200">{getWorkshopStatusLabel(status)}</span>;
      case 'IN_PROGRESS':
        return <span className="bg-purple-50 text-purple-800 font-bold px-2.5 py-1 rounded-lg text-[10px] border border-purple-200">{getWorkshopStatusLabel(status)}</span>;
      case 'READY_FOR_PICKUP':
      case 'READY':
        return <span className="bg-emerald-50 text-emerald-800 font-bold px-2.5 py-1 rounded-lg text-[10px] border border-emerald-200">{getWorkshopStatusLabel(status)}</span>;
      case 'COMPLETED':
        return <span className="bg-emerald-100 text-emerald-900 font-bold px-2.5 py-1 rounded-lg text-[10px] border border-emerald-300">{getWorkshopStatusLabel(status)}</span>;
      case 'CANCELLED':
        return <span className="bg-red-50 text-red-700 font-bold px-2.5 py-1 rounded-lg text-[10px] border border-red-200">{getWorkshopStatusLabel(status)}</span>;
      default:
        return <span className="bg-slate-100 text-slate-600 font-bold px-2.5 py-1 rounded-lg text-[10px]">{status}</span>;
    }
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-100">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="bg-[#F4F5F3] text-slate-800 font-bold border-b border-slate-200">
            <th className="py-3 px-4">WO & Pelat Nomor</th>
            <th className="py-3 px-4">Pelanggan & Kendaraan</th>
            <th className="py-3 px-4">Keluhan Utama</th>
            <th className="py-3 px-4 text-right">Estimasi Biaya</th>
            <th className="py-3 px-4 text-center">Status</th>
            <th className="py-3 px-4 text-center">Langkah Berikutnya</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {loading ? (
            <tr>
              <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                Memuat antrean workshop...
              </td>
            </tr>
          ) : orders.length > 0 ? (
            orders.map((item) => {
              const estimatedTotal = calculateEstimatedCost(item);

              return (
                <tr
                  key={item.id}
                  onClick={() => onSelectOrder(item)}
                  className="hover:bg-red-50/30 cursor-pointer transition font-medium group"
                >
                  {/* Kode WO & Pelat Nomor */}
                  <td className="py-3.5 px-4">
                    <span className="font-black text-slate-900 text-sm block tracking-tight">
                      {item.plate_number}
                    </span>
                    <span className="font-mono text-[10px] text-slate-500 font-bold">
                      {item.order_code}
                    </span>
                  </td>

                  {/* Pelanggan & Kendaraan */}
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900 block">
                      {item.customer?.name || item.customer_name || '-'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {item.vehicle?.brand_model || item.vehicle_brand_model || '-'} • {item.customer?.whatsapp_number || item.whatsapp_number || item.current_mileage_km ? `${item.current_mileage_km} KM` : '-'}
                    </span>
                  </td>

                  {/* Keluhan Utama */}
                  <td className="py-3.5 px-4 text-slate-700 max-w-xs truncate">
                    {item.initial_complaint || 'Diagnostik rutin'}
                  </td>

                  {/* Estimasi Biaya */}
                  <td className="py-3.5 px-4 text-right font-black text-slate-900 text-sm">
                    Rp {estimatedTotal.toLocaleString('id-ID')}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 text-center">
                    {getStatusBadge(item.status)}
                  </td>

                  {/* Aksi Button Direct */}
                  <td className="py-3.5 px-4 text-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPrimaryAction(item);
                      }}
                      className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded-xl text-[11px] transition shadow-xs group-hover:scale-105 cursor-pointer"
                    >
                      <span>{getWorkshopActionLabel(item.status)}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                Belum ada order pada tahap ini.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};