import React from 'react';
import { Send, FileCheck, CheckCircle, PlayCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface WorkshopActionFooterProps {
  status: string;
  orderId?: string | number;
  totalAmount: number;
  onAdvanceStatus: (nextStatus: string, actionMsg: string) => void;
  onSendWhatsApp: () => void;
  onCompleteAndNotifyWhatsApp: () => void;
}

export const WorkshopActionFooter: React.FC<WorkshopActionFooterProps> = ({
  status,
  orderId,
  totalAmount,
  onAdvanceStatus,
  onSendWhatsApp,
  onCompleteAndNotifyWhatsApp,
}) => {
  const navigate = useNavigate();

  return (
    <div className="pt-4 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
      <div>
        <span className="text-xs text-slate-500 font-medium">Total Estimasi Biaya:</span>
        <div className="text-xl font-black text-red-600">
          Rp {totalAmount.toLocaleString('id-ID')}
        </div>
      </div>

      <div className="flex gap-3 w-full md:w-auto">
        {status === 'QUEUED' && (
          <button
            type="button"
            onClick={() => onAdvanceStatus('INSPECTING', 'Diagnosa dimulai.')}
            className="bg-red-600 hover:bg-red-700 text-white font-extrabold py-3 px-6 rounded-xl flex items-center justify-center gap-2 text-xs transition shadow-md shadow-red-600/25 w-full md:w-auto cursor-pointer"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Mulai Diagnosa</span>
          </button>
        )}

        {/* Tahap diagnosa: kirim estimasi ke pelanggan */}
        {(status === 'INSPECTING' || status === 'INSPECTED') && (
          <button
            type="button"
            onClick={onSendWhatsApp}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 px-6 rounded-xl flex items-center justify-center gap-2 text-xs transition shadow-md shadow-emerald-600/25 w-full md:w-auto cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Kirim Estimasi via WhatsApp</span>
          </button>
        )}

        {/* Setelah estimasi dikirim: tunggu konfirmasi pelanggan */}
        {(status === 'PENDING_ACC' || status === 'WAITING_ACC') && (
          <div className="flex gap-2 w-full md:w-auto">
            <button
              type="button"
              onClick={onSendWhatsApp}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-xs transition cursor-pointer"
            >
              <Send className="w-4 h-4 text-emerald-600" />
              <span>Kirim Ulang WA</span>
            </button>

            <button
              type="button"
              onClick={() => navigate(`/admin/workshop/${orderId}/approval?stage=waiting_acc`)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 px-6 rounded-xl flex items-center justify-center gap-2 text-xs transition shadow-md shadow-emerald-600/25 w-full md:w-auto cursor-pointer"
            >
              <FileCheck className="w-4 h-4" />
              <span>Proses ACC Pelanggan</span>
            </button>
          </div>
        )}

        {/* Selesaikan pengerjaan dan siapkan notifikasi sebelum pindah ke pembayaran */}
        {status === 'IN_PROGRESS' && (
          <button
            type="button"
            onClick={onCompleteAndNotifyWhatsApp}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 px-6 rounded-xl flex items-center justify-center gap-2 text-xs transition shadow-md shadow-emerald-600/25 w-full md:w-auto cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Selesai & Kirim Info via WhatsApp</span>
          </button>
        )}

        {/* Order sudah dipindahkan setelah pesan penyelesaian disiapkan */}
        {(status === 'READY_FOR_PICKUP' || status === 'READY') && (
          <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold">
            <CheckCircle className="w-4 h-4" />
            <span>Order menunggu pembayaran.</span>
          </div>
        )}
      </div>
    </div>
  );
};